import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../components/auth/auth_provider.dart';
import '../../components/elements/typography/typography.dart';
import '../../components/i18n/TranslationsProvider.dart';
import '../../theme_provider.dart';

class SettingsScreen extends StatelessWidget {
  static const routePath = '/auth/settings';
  static const displayName = 'Settings';

  const SettingsScreen({super.key});

  /// Extra list tiles contributed by optional feature modules, inserted
  /// after "Sync" and before the About section.
  static List<Widget> Function(BuildContext context, Translations t)?
      extraTilesBuilder;

  static const _supportedLocales = [
    Locale('en'),
    Locale('es'),
    Locale('es', 'MX'),
  ];

  static const _themeModes = [ThemeMode.system, ThemeMode.light, ThemeMode.dark];

  void _showThemePicker(BuildContext context, Translations t) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(t.translate('settings.theme.selectTitle', null)),
        contentPadding: const EdgeInsets.symmetric(vertical: 8),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            for (final mode in _themeModes)
              ListTile(
                title: Text(_themeModeLabel(mode, t)),
                onTap: () {
                  ThemeModeScope.of(context).changeThemeMode(mode);
                  Navigator.of(ctx).pop();
                },
              ),
          ],
        ),
      ),
    );
  }

  String _themeModeLabel(ThemeMode mode, Translations t) {
    final key = switch (mode) {
      ThemeMode.light => 'settings.theme.light',
      ThemeMode.dark => 'settings.theme.dark',
      ThemeMode.system => 'settings.theme.system',
    };
    return t.translate(key, null);
  }

  String _currentThemeModeLabel(BuildContext context, Translations t) {
    return _themeModeLabel(ThemeModeScope.of(context).themeMode, t);
  }

  void _showLanguagePicker(BuildContext context, Translations t) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(t.translate('settings.language.selectTitle', null)),
        contentPadding: const EdgeInsets.symmetric(vertical: 8),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            for (final locale in _supportedLocales)
              ListTile(
                title: Text(_localeLabel(locale, t)),
                onTap: () {
                  t.changeLocale(locale);
                  Navigator.of(ctx).pop();
                },
              ),
          ],
        ),
      ),
    );
  }

  String _localeLabel(Locale locale, Translations t) {
    final key = locale.countryCode != null
        ? 'settings.language.${locale.languageCode}_${locale.countryCode}'
        : 'settings.language.${locale.languageCode}';
    return t.translate(key, null);
  }

  String _currentLocaleLabel(BuildContext context, Translations t) {
    final locale = Localizations.maybeLocaleOf(context) ?? const Locale('en');
    return _localeLabel(locale, t);
  }

  @override
  Widget build(BuildContext context) {
    final t = Translations.of(context);
    final colorScheme = Theme.of(context).colorScheme;

    return ListView(
        children: [
          _SectionHeader(title: t.translate('settings.section.account', null)),
          ListTile(
            leading: const Icon(Icons.person_outline),
            title: Text(t.translate('settings.profile', null)),
            trailing: const Icon(Icons.chevron_right),
            onTap: () => context.go('/auth/profile'),
          ),
          const Divider(height: 1, indent: 16, endIndent: 16),
          _SectionHeader(title: t.translate('settings.section.notifications', null)),
          SwitchListTile(
            secondary: const Icon(Icons.notifications_outlined),
            title: Text(t.translate('settings.pushNotifications', null)),
            subtitle: Text(t.translate('settings.pushNotifications.subtitle', null)),
            value: true,
            onChanged: (_) {},
          ),
          SwitchListTile(
            secondary: const Icon(Icons.warning_amber_outlined),
            title: Text(t.translate('settings.criticalAlerts', null)),
            subtitle: Text(t.translate('settings.criticalAlerts.subtitle', null)),
            value: false,
            onChanged: (_) {},
          ),
          const Divider(height: 1, indent: 16, endIndent: 16),
          _SectionHeader(title: t.translate('settings.section.app', null)),
          ListTile(
            leading: const Icon(Icons.language_outlined),
            title: Text(t.translate('settings.language', null)),
            trailing: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  _currentLocaleLabel(context, t),
                  style: TextStyle(color: colorScheme.onSurface.withValues(alpha: 0.6)),
                ),
                const Icon(Icons.chevron_right),
              ],
            ),
            onTap: () => _showLanguagePicker(context, t),
          ),
          ListTile(
            leading: const Icon(Icons.brightness_6_outlined),
            title: Text(t.translate('settings.theme', null)),
            trailing: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  _currentThemeModeLabel(context, t),
                  style: TextStyle(color: colorScheme.onSurface.withValues(alpha: 0.6)),
                ),
                const Icon(Icons.chevron_right),
              ],
            ),
            onTap: () => _showThemePicker(context, t),
          ),
          ListTile(
            leading: const Icon(Icons.sync_outlined),
            title: Text(t.translate('settings.syncData', null)),
            trailing: const Icon(Icons.chevron_right),
            onTap: () {},
          ),
          ...?extraTilesBuilder?.call(context, t),
          const Divider(height: 1, indent: 16, endIndent: 16),
          _SectionHeader(title: t.translate('settings.section.about', null)),
          ListTile(
            leading: const Icon(Icons.info_outline),
            title: Text(t.translate('settings.appVersion', null)),
            trailing: Text(
              '1.0.0',
              style: TextStyle(color: colorScheme.onSurface.withValues(alpha: 0.6)),
            ),
          ),
          const Divider(height: 1, indent: 16, endIndent: 16),
          const SizedBox(height: 16),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: OutlinedButton.icon(
              style: OutlinedButton.styleFrom(
                foregroundColor: colorScheme.error,
                side: BorderSide(color: colorScheme.error),
              ),
              icon: const Icon(Icons.logout),
              label: Text(t.translate('settings.logout', null)),
              onPressed: () async {
                await AuthProvider.of(context).signOut();
              },
            ),
          ),
          const SizedBox(height: 24),
        ],
      );
  }
}

class _SectionHeader extends StatelessWidget {
  final String title;

  const _SectionHeader({required this.title});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 20, 16, 4),
      child: Text(
        title.toUpperCase(),
        style: Theme.of(context).textTheme.labelSmall?.copyWith(
          color: Theme.of(context).colorScheme.primary,
          letterSpacing: 1.2,
        ),
      ),
    );
  }
}
