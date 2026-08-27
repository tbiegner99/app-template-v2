import 'dart:convert';
import 'dart:io';

import 'package:firebase_core/firebase_core.dart';
import 'package:http/http.dart' as http;
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/material.dart';
import 'package:get_it/get_it.dart';
import 'package:go_router/go_router.dart';
import 'package:package_info_plus/package_info_plus.dart';

import '../../controllers/active_alerts_controller.dart';
import '../../datasources/active_alerts_datasource.dart';
import '../../models/active_alert.dart';
import '../../services/active_alerts_service.dart';
import '../auth/session_datasource.dart';
import '../db/database_client.dart';
import '../db/migrations/20260422_001_app_settings.dart';
import '../db/migrations/20260423_001_favorites.dart';
import '../db/migrations/20260423_002_feature_flags.dart';
import '../db/migrations/20260424_001_active_alerts.dart';
import '../di/service_locator.dart';
import '../logger.dart';
import '../router/app_router.dart';
import 'local_notifications.dart';

const _log = __SLUG_UPPER__Logger('NotificationService');

/// Top-level background message handler — must be a top-level function.
@pragma('vm:entry-point')
Future<void> firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  await Firebase.initializeApp();  // required — background isolate has no app context
  await LocalNotifications.init();
  await NotificationService.handleMessage(message, background: true);
}

class NotificationService {
  static Future<void> init() async {
    await LocalNotifications.init();
    FirebaseMessaging.onBackgroundMessage(firebaseMessagingBackgroundHandler);

    await FirebaseMessaging.instance.setForegroundNotificationPresentationOptions(
      alert: false,
      badge: false,
      sound: false,
    );

    FirebaseMessaging.onMessage.listen((message) async {
      await handleMessage(message);
    });

    FirebaseMessaging.onMessageOpenedApp.listen((message) {
      _navigateFromMessage(message);
    });
  }

  static Future<void> handleInitialMessage() async {
    final message = await FirebaseMessaging.instance.getInitialMessage();
    if (message != null) {
      await handleMessage(message);
      _navigateFromMessage(message);
    }
  }

  static Future<void> handleMessage(RemoteMessage message, {bool background = false}) async {
    final type = message.data['type'] as String?;
    if (type == 'alert') {
      final notificationId = message.data['notification_id'] as String? ?? '';
      final title = message.data['title'] as String? ?? '';
      final body = message.data['body'] as String? ?? '';
      final route = message.data['route'] as String?;
      final localId = LocalNotifications.idFromUuid(notificationId);
      await LocalNotifications.showAlert(localId, title, body);

      final alert = ActiveAlert(
        id: notificationId,
        title: title,
        body: body,
        route: route,
        localNotificationId: localId,
        dateCreated: DateTime.now().toUtc().toIso8601String(),
      );
      try {
        await GetIt.instance<ActiveAlertsController>().onAlertReceived(alert);
      } catch (_) {
        // Background isolate on Android: get_it may not be initialised. Re-init minimally.
        if (background) {
          await _persistAlertInBackground(alert);
        }
      }
      _log.debug('Alert received: $notificationId');
    } else if (type == 'data') {
      _log.debug('Data message received: ${message.data['action']}');
      // Data action handling will be dispatched here once action handlers are registered
    }
  }

  static void _navigateFromMessage(RemoteMessage message) {
    final route = message.data['route'] as String?;
    if (route != null && route.isNotEmpty) {
      try {
        GetIt.instance<GoRouter>().go(route);
      } catch (e) {
        _log.error('Navigation from notification failed: $e');
      }
    }
  }

  static Future<String?> getToken() async {
    // On iOS, the APNS token may not be ready immediately after launch.
    // Wait up to 5 seconds for it before requesting the FCM token.
    for (var i = 0; i < 5; i++) {
      final apns = await FirebaseMessaging.instance.getAPNSToken();
      if (apns != null) break;
      await Future.delayed(const Duration(seconds: 1));
    }
    return FirebaseMessaging.instance.getToken();
  }

  static Stream<String> get onTokenRefresh => FirebaseMessaging.instance.onTokenRefresh;

  static Future<void> requestPermissionAndNotify() async {
    final settings = await FirebaseMessaging.instance.requestPermission(
      alert: true,
      badge: true,
      sound: true,
    );
    if (settings.authorizationStatus == AuthorizationStatus.denied) {
      final context = AppRouter.navigatorKey.currentContext;
      if (context != null && context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Notifications are disabled. Enable them in Settings to receive safety alerts.'),
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    }
  }

  static Future<NotificationSettings> requestPermission() async {
    return FirebaseMessaging.instance.requestPermission(
      alert: true,
      badge: true,
      sound: true,
    );
  }

  static Future<void> _persistAlertInBackground(ActiveAlert alert) async {
    try {
      final client = DatabaseClient();
      await client.open('app.db', [
        migration20260422001AppSettings(),
        migration20260423001Favorites(),
        migration20260423002FeatureFlags(),
        migration20260424001ActiveAlerts(),
      ]);
      final datasource = ActiveAlertsDatasource(client);
      final service = ActiveAlertsService(datasource);
      await service.addAlert(alert);
    } catch (e) {
      _log.error('Background alert persistence failed: $e');
    }
  }

  static Future<void> registerTokenWithBackend(String token) async {
    try {
      final info = await PackageInfo.fromPlatform();
      final deviceId = GetIt.instance<String>(instanceName: 'deviceId');
      final platform = Platform.isIOS ? 'ios' : 'android';
      final session = SessionDatasource();
      final accessToken = await session.getAccessToken();
      if (accessToken == null) return;

      final response = await http.post(
        Uri.parse('${ServiceLocator.backendUrl}/api/__SLUG__/v1/notifications/device-tokens'),
        headers: {
          'Content-Type': 'application/json',
          'Cookie': 'sAccessToken=$accessToken',
        },
        body: jsonEncode({
          'token': token,
          'platform': platform,
          'platform_version': Platform.operatingSystemVersion,
          'app_version': '${info.version}+${info.buildNumber}',
          'device_id': deviceId,
        }),
      );
      _log.debug('Token registration response: ${response.statusCode}');
    } catch (e) {
      _log.error('Token registration failed: $e');
    }
  }

  static Future<void> deregisterToken(String token) async {
    try {
      final session = SessionDatasource();
      final accessToken = await session.getAccessToken();
      if (accessToken == null) return;

      final response = await http.delete(
        Uri.parse('${ServiceLocator.backendUrl}/api/__SLUG__/v1/notifications/device-tokens/${Uri.encodeComponent(token)}'),
        headers: {'Cookie': 'sAccessToken=$accessToken'},
      );
      _log.debug('Token deregistration response: ${response.statusCode}');
    } catch (e) {
      _log.error('Token deregistration failed: $e');
    }
  }
}
