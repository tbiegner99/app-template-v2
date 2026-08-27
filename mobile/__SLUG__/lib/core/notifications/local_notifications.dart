import 'dart:io';

import 'package:flutter_local_notifications/flutter_local_notifications.dart';

final _plugin = FlutterLocalNotificationsPlugin();

const _androidChannel = AndroidNotificationChannel(
  'high_importance_channel',
  'High Importance Notifications',
  importance: Importance.high,
);

const _androidDetails = AndroidNotificationDetails(
  'high_importance_channel',
  'High Importance Notifications',
  importance: Importance.high,
  priority: Priority.high,
);

const _notificationDetails = NotificationDetails(android: _androidDetails);

class LocalNotifications {
  static Future<void> init() async {
    const androidInit = AndroidInitializationSettings('@mipmap/ic_launcher');
    const darwinInit = DarwinInitializationSettings();
    const initSettings = InitializationSettings(android: androidInit, iOS: darwinInit);
    await _plugin.initialize(initSettings);

    final androidImpl = _plugin.resolvePlatformSpecificImplementation<AndroidFlutterLocalNotificationsPlugin>();
    await androidImpl?.createNotificationChannel(_androidChannel);
    if (Platform.isAndroid) {
      await androidImpl?.requestNotificationsPermission();
    }
  }

  static Future<void> showAlert(int id, String title, String body) async {
    await _plugin.show(id, title, body, _notificationDetails);
  }

  static Future<void> cancel(int id) async {
    await _plugin.cancel(id);
  }

  static Future<void> cancelAll() async {
    await _plugin.cancelAll();
  }

  /// Derives a stable non-negative integer ID from a UUID string.
  static int idFromUuid(String uuid) {
    return uuid.replaceAll('-', '').hashCode.abs();
  }
}
