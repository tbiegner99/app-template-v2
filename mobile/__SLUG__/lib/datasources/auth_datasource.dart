import 'dart:convert';
import 'dart:developer' as dev;
import 'package:http/http.dart' as http;
import '../core/di/service_locator.dart';

class AuthDatasource {
  final String _baseUrl = ServiceLocator.backendUrl;

  /// Signs in with email/password. Returns user body and session tokens.
  Future<SignInResult> signIn(String email, String password) async {
    final response = await http.post(
      Uri.parse('$_baseUrl/api/__SLUG__/user/signin'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'email': email, 'password': password}),
    ).timeout(const Duration(seconds: 10));
    if (response.statusCode == 401) throw WrongCredentialsException();
    if (response.statusCode != 200) {
      throw Exception('sign in failed: ${response.statusCode}');
    }
    final body = jsonDecode(response.body) as Map<String, dynamic>;
    final frontToken = response.headers['front-token'] ?? response.headers['Front-Token'];
    final setCookie = response.headers['set-cookie'] ?? '';
    final accessToken = response.headers['st-access-token']
        ?? _extractCookieValue(setCookie, 'sAccessToken');
    dev.log('frontToken=$frontToken accessToken=$accessToken', name: 'AuthDatasource');
    return SignInResult(
      user: body,
      frontToken: frontToken,
      accessToken: accessToken,
    );
  }

  /// Attempts to refresh the session using the stored refresh token cookie.
  /// Returns new tokens on success, null if the refresh token is invalid/expired.
  Future<SignInResult?> refreshSession(String? accessToken) async {
    try {
      final response = await http.post(
        Uri.parse('$_baseUrl/api/__SLUG__/auth/v0/session/refresh'),
        headers: {
          'Content-Type': 'application/json',
          if (accessToken != null) 'Cookie': 'sAccessToken=$accessToken',
        },
      ).timeout(const Duration(seconds: 10));
      if (response.statusCode != 200) return null;
      final frontToken = response.headers['front-token'] ?? response.headers['Front-Token'];
      final setCookie = response.headers['set-cookie'] ?? '';
      final newAccessToken = _extractCookieValue(setCookie, 'sAccessToken');
      return SignInResult(
        user: const {},
        frontToken: frontToken,
        accessToken: newAccessToken,
      );
    } catch (_) {
      return null;
    }
  }

  /// Signs out — calls the backend to revoke session.
  Future<void> signOut(String? accessToken) async {
    await http.post(
      Uri.parse('$_baseUrl/api/__SLUG__/user/signout'),
      headers: {
        'Content-Type': 'application/json',
        if (accessToken != null) 'Cookie': 'sAccessToken=$accessToken',
      },
    );
  }

  String? _extractCookieValue(String setCookieHeader, String name) {
    for (final part in setCookieHeader.split(';')) {
      final trimmed = part.trim();
      if (trimmed.startsWith('$name=')) {
        return trimmed.substring('$name='.length);
      }
    }
    return null;
  }
}

class SignInResult {
  final Map<String, dynamic> user;
  final String? frontToken;
  final String? accessToken;

  const SignInResult({
    required this.user,
    required this.frontToken,
    required this.accessToken,
  });
}

class WrongCredentialsException implements Exception {
  @override
  String toString() => 'wrong credentials';
}
