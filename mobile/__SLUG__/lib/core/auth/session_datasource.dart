import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

const _kAccessToken = 'auth.access_token';
const _kFrontToken = 'auth.front_token';
const _kUserId = 'auth.supertokens_user_id';

class SessionDatasource {
  /// Returns true if a session token exists and has not expired.
  /// Safe to call offline — reads only from local storage.
  Future<bool> doesSessionExist() async {
    final prefs = await SharedPreferences.getInstance();
    final frontToken = prefs.getString(_kFrontToken);
    if (frontToken == null) return false;
    try {
      final decoded = utf8.decode(base64Url.decode(base64Url.normalize(frontToken)));
      final data = jsonDecode(decoded) as Map<String, dynamic>;
      final ate = data['ate'] as int?; // expiry in milliseconds
      if (ate == null) return false;
      return DateTime.now().millisecondsSinceEpoch < ate;
    } catch (_) {
      return false;
    }
  }

  Future<String?> getUserId() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_kUserId);
  }

  Future<String?> getAccessToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_kAccessToken);
  }

  Future<void> saveSession({
    required String accessToken,
    required String frontToken,
    required String supertokensUserId,
  }) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_kAccessToken, accessToken);
    await prefs.setString(_kFrontToken, frontToken);
    await prefs.setString(_kUserId, supertokensUserId);
  }

  Future<void> clearSession() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_kAccessToken);
    await prefs.remove(_kFrontToken);
    await prefs.remove(_kUserId);
  }
}
