class SessionUser {
  final String id;
  final String email;
  final String displayName;

  const SessionUser({
    required this.id,
    required this.email,
    required this.displayName,
  });
}

class SessionInfo {
  SessionInfo._();

  static SessionUser? _user;

  static SessionUser? get currentUser => _user;
  static bool get isLoggedIn => _user != null;

  static void set(SessionUser user) {
    _user = user;
  }

  static void clear() {
    _user = null;
  }
}
