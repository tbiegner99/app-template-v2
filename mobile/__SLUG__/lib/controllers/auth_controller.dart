import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';
import '../services/auth_service.dart';
import '../datasources/auth_datasource.dart';

const _devMode = bool.fromEnvironment('DEVELOPER_MODE', defaultValue: false);

class AuthController extends ChangeNotifier with WidgetsBindingObserver {
  final AuthService _service;

  bool _isLoggedIn = false;
  String? _userId;
  bool _loading = false;
  String? _error;
  String? _debugError;

  AuthController(this._service);

  bool get isLoggedIn => _isLoggedIn;
  String? get userId => _userId;
  bool get loading => _loading;
  String? get error => _error;
  String? get debugError => _devMode ? _debugError : null;

  Future<void> init() async {
    WidgetsBinding.instance.addObserver(this);
    _isLoggedIn = await _service.checkSession();
    if (_isLoggedIn) {
      _userId = await _service.getUserId();
    }
    notifyListeners();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) {
      _service.checkSession().then((loggedIn) {
        _isLoggedIn = loggedIn;
        notifyListeners();
      });
    }
  }

  Future<bool> signIn(String email, String password) async {
    _loading = true;
    _error = null;
    _debugError = null;
    notifyListeners();
    try {
      await _service.signIn(email, password);
      _userId = await _service.getUserId();
      _isLoggedIn = true;
      return true;
    } on WrongCredentialsException catch (e) {
      _error = 'wrong_credentials';
      _debugError = e.toString();
      return false;
    } on TimeoutException catch (e) {
      _error = 'sign_in_timeout';
      _debugError = 'TimeoutException: ${e.message}';
      return false;
    } catch (e, stack) {
      _error = 'sign_in_failed';
      _debugError = '$e\n\n$stack';
      return false;
    } finally {
      _loading = false;
      notifyListeners();
    }
  }

  Future<void> signOut() async {
    await _service.signOut();
    _isLoggedIn = false;
    _userId = null;
    notifyListeners();
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }
}
