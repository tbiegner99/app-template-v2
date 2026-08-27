import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../components/auth/auth_provider.dart';
import '../../components/navigation/app_shell.dart';
import '../../screens/home/home_screen.dart';
import '../../screens/login/login_screen.dart';
import '../../screens/profile/profile_screen.dart';
import '../../screens/settings/settings_screen.dart';

class AppRouter {
  AppRouter._();

  static final navigatorKey = GlobalKey<NavigatorState>();

  /// Extra routes nested under '/auth/settings'. Optional feature modules
  /// (e.g. ble_alerts) populate this before [router] is first accessed.
  static List<RouteBase> extraSettingsRoutes = const [];

  static final router = GoRouter(
    navigatorKey: navigatorKey,
    initialLocation: '/auth/home',
    redirect: _guard,
    routes: [
      GoRoute(
        path: '/',
        redirect: (context, state) => '/auth/home',
      ),
      GoRoute(
        path: LoginScreen.routePath,
        builder: (context, state) => LoginScreen(
          redirect: state.uri.queryParameters['redirect'],
        ),
      ),
      GoRoute(
        path: '/auth',
        redirect: (context, state) => '/auth/home',
      ),
      ShellRoute(
        builder: (context, state, child) => AppShell(child: child),
        routes: [
          GoRoute(
            path: '/auth/home',
            name: HomeScreen.displayName,
            builder: (context, state) => const HomeScreen(),
          ),
          GoRoute(
            path: '/auth/search',
            builder: (context, state) => const Center(child: Text('Search')),
          ),
          GoRoute(
            path: '/auth/profile',
            name: ProfileScreen.displayName,
            builder: (context, state) => const ProfileScreen(),
          ),
          GoRoute(
            path: '/auth/settings',
            name: SettingsScreen.displayName,
            builder: (context, state) => const SettingsScreen(),
            routes: extraSettingsRoutes,
          ),
        ],
      ),
    ],
  );

  static String? _guard(BuildContext context, GoRouterState state) {
    final auth = AuthProvider.of(context);
    final isLoginRoute = state.matchedLocation == LoginScreen.routePath;

    if (!auth.isLoggedIn && !isLoginRoute) {
      final redirect = Uri.encodeComponent(state.matchedLocation);
      return '${LoginScreen.routePath}?redirect=$redirect';
    }

    if (auth.isLoggedIn && isLoginRoute) {
      final redirect = state.uri.queryParameters['redirect'];
      return redirect ?? '/auth/home';
    }

    return null;
  }
}
