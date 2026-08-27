import 'dart:async';

import 'package:connectivity_plus/connectivity_plus.dart';

import '../core/auth/session_datasource.dart';
import '../core/auth/session_info.dart';
import '../core/notifications/notification_service.dart';
import '../datasources/app_settings_datasource.dart';
import '../datasources/auth_datasource.dart';

class AuthService {
  final SessionDatasource _session;
  final AuthDatasource _authDs;
  final AppSettingsDatasource _settings;
  StreamSubscription<String>? _tokenRefreshSub;

  AuthService(this._session, this._authDs, this._settings);

  /// Returns true if the user should be treated as authenticated.
  ///
  /// Strategy:
  ///  1. Valid (non-expired) token in local storage → authenticated.
  ///  2. Expired token + offline → allow if device was previously logged in (cached user_id).
  ///  3. Expired token + online → not authenticated (user must sign in again).
  ///  4. No token ever → not authenticated.
  Future<bool> checkSession() async {
    if (await _session.doesSessionExist()) {
      await _populateSessionInfo();
      await _registerTokenAndListenForRefresh();
      return true;
    }

    final online = await _isOnline();
    if (!online) {
      final cachedUserId = await _settings.get('auth.user_id');
      if (cachedUserId != null && cachedUserId.isNotEmpty) {
        await _populateSessionInfo();
        return true;
      }
      return false;
    }

    // Token expired but online — attempt silent refresh
    final accessToken = await _session.getAccessToken();
    final refreshed = await _authDs.refreshSession(accessToken);
    if (refreshed != null && refreshed.frontToken != null && refreshed.accessToken != null) {
      final userId = await _session.getUserId() ?? '';
      await _session.saveSession(
        accessToken: refreshed.accessToken!,
        frontToken: refreshed.frontToken!,
        supertokensUserId: userId,
      );
      await _populateSessionInfo();
      return true;
    }

    return false;
  }

  Future<String?> getUserId() => _settings.get('auth.user_id');

  Future<void> _populateSessionInfo() async {
    final id = await _settings.get('auth.user_id') ?? '';
    final email = await _settings.get('auth.user_email') ?? '';
    final displayName = await _settings.get('auth.user_display_name') ?? email;
    if (id.isNotEmpty) {
      SessionInfo.set(SessionUser(id: id, email: email, displayName: displayName));
    }
  }

  Future<void> signIn(String email, String password) async {
    final result = await _authDs.signIn(email, password);
    final userId = result.user['id'] as String?;
    final supertokensId = result.user['supertokens_id'] as String? ?? userId ?? '';
    if (result.frontToken != null) {
      await _session.saveSession(
        accessToken: result.accessToken ?? '',
        frontToken: result.frontToken!,
        supertokensUserId: supertokensId,
      );
    }
    if (userId != null) {
      await _settings.set('auth.user_id', userId);
      await _settings.set('auth.user_email', email);
      await _settings.set('auth.user_display_name', result.user['displayName'] as String? ?? email);
    }
    SessionInfo.set(
      SessionUser(
        id: userId ?? '',
        email: email,
        displayName: result.user['displayName'] as String? ?? email,
      ),
    );
    await _registerTokenAndListenForRefresh();
  }

  Future<void> _registerTokenAndListenForRefresh() async {
    final fcmToken = await _getFcmToken();
    if (fcmToken != null) {
      await NotificationService.registerTokenWithBackend(fcmToken);
    }
    _tokenRefreshSub ??= NotificationService.onTokenRefresh.listen((newToken) {
      NotificationService.registerTokenWithBackend(newToken);
    });
  }

  Future<void> signOut() async {
    await _tokenRefreshSub?.cancel();
    _tokenRefreshSub = null;
    // Deregister device token before clearing session
    final fcmToken = await _getFcmToken();
    if (fcmToken != null) {
      await NotificationService.deregisterToken(fcmToken);
    }
    final token = await _session.getAccessToken();
    await _authDs.signOut(token);
    await _session.clearSession();
    await _settings.remove('auth.user_id');
    await _settings.remove('auth.user_email');
    await _settings.remove('auth.user_display_name');
    SessionInfo.clear();
  }

  Future<String?> _getFcmToken() async {
    try {
      return await NotificationService.getToken();
    } catch (e) {
      print(e);
      return null;
    }
  }

  Future<bool> _isOnline() async {
    final results = await Connectivity().checkConnectivity();
    return results.any((r) => r != ConnectivityResult.none);
  }
}
