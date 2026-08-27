import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile/components/i18n/TranslationsProvider.dart';
import '../../components/elements/navigation/HamburgerMenu.dart';
import '../../screens/home/home_screen.dart';
import '../../screens/profile/profile_screen.dart';
import '../../screens/settings/settings_screen.dart';

class AppShell extends StatelessWidget {
  final Widget child;

  const AppShell({super.key, required this.child});

  static const _routes = [
    HomeScreen.routePath,
    '/auth/search',
    ProfileScreen.routePath,
  ];

  static const _titles = {
    '/auth/home': HomeScreen.displayName,
    '/auth/search': 'Search',
    '/auth/profile': ProfileScreen.displayName,
    '/auth/settings': SettingsScreen.displayName,
  };

  /// Extra route-title entries contributed by optional feature modules
  /// (e.g. ble_alerts' /auth/settings/receive-data). May be populated any
  /// time before the title is first looked up.
  static Map<String, String> extraTitles = const {};

  int _currentIndex(BuildContext context) {
    final location = GoRouterState.of(context).matchedLocation;
    final index = _routes.indexOf(location);
    return index < 0 ? 0 : index;
  }

  String _title(BuildContext context) {
    final location = GoRouterState.of(context).matchedLocation;
    return _titles[location] ?? extraTitles[location] ?? '';
  }

  @override
  Widget build(BuildContext context) {
    final t = Translations.of(context);
    final title = _title(context);
    return Scaffold(
      drawer: const HamburgerMenu(),
      appBar: AppBar(
        leading: Builder(
          builder: (ctx) => IconButton(
            icon: const Icon(Icons.menu),
            onPressed: () => Scaffold.of(ctx).openDrawer(),
          ),
        ),
        title: Text(title),
      ),
      body: child,
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex(context),
        onTap: (index) => context.go(_routes[index]),
        type: BottomNavigationBarType.fixed,
        items: [
          BottomNavigationBarItem(icon: const Icon(Icons.home_outlined), activeIcon: const Icon(Icons.home), label: t.translate('bottomNav.homeMenu.title', null)),
          BottomNavigationBarItem(icon: const Icon(Icons.search_outlined), activeIcon: const Icon(Icons.search), label: t.translate('bottomNav.searchMenu.title', null)),
          BottomNavigationBarItem(icon: const Icon(Icons.person_outline), activeIcon: const Icon(Icons.person), label: t.translate('bottomNav.profileMenu.title', null)),
        ],
      ),
    );
  }
}
