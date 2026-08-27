import 'package:flutter/widgets.dart';
import '../../controllers/auth_controller.dart';

class AuthProvider extends InheritedNotifier<AuthController> {
  const AuthProvider({
    super.key,
    required AuthController notifier,
    required super.child,
  }) : super(notifier: notifier);

  static AuthController of(BuildContext context) {
    final result = context
        .dependOnInheritedWidgetOfExactType<AuthProvider>()
        ?.notifier;
    assert(result != null, 'AuthProvider not found in widget tree');
    return result!;
  }

  @override
  bool updateShouldNotify(AuthProvider oldWidget) =>
      notifier != oldWidget.notifier;
}
