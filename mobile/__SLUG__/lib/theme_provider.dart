import 'package:flutter/material.dart';

import 'core/di/service_locator.dart';
import 'datasources/app_settings_datasource.dart';

const _kThemeModeKey = 'app.theme_mode';

ThemeMode _modeFromString(String? value) => switch (value) {
      'light' => ThemeMode.light,
      'dark' => ThemeMode.dark,
      _ => ThemeMode.system,
    };

String _modeToString(ThemeMode mode) => switch (mode) {
      ThemeMode.light => 'light',
      ThemeMode.dark => 'dark',
      ThemeMode.system => 'system',
    };

class ThemeModeScope extends InheritedWidget {
  final ThemeMode themeMode;
  final void Function(ThemeMode) onThemeModeChanged;

  const ThemeModeScope({
    super.key,
    required this.themeMode,
    required this.onThemeModeChanged,
    required super.child,
  });

  static ThemeModeScope of(BuildContext context) {
    final scope = context.dependOnInheritedWidgetOfExactType<ThemeModeScope>();
    assert(scope != null, 'ThemeModeScope not found');
    return scope!;
  }

  void changeThemeMode(ThemeMode mode) => onThemeModeChanged(mode);

  @override
  bool updateShouldNotify(ThemeModeScope oldWidget) => themeMode != oldWidget.themeMode;
}

class ThemeProvider extends StatefulWidget {
  final Widget child;

  const ThemeProvider({super.key, required this.child});

  @override
  State<ThemeProvider> createState() => _ThemeProviderState();
}

class _ThemeProviderState extends State<ThemeProvider> {
  ThemeMode _themeMode = ThemeMode.system;

  AppSettingsDatasource get _ds => ServiceLocator.get<AppSettingsDatasource>();

  @override
  void initState() {
    super.initState();
    _ds.get(_kThemeModeKey).then((value) {
      final mode = _modeFromString(value);
      if (mode != _themeMode) setState(() => _themeMode = mode);
    });
  }

  void _onThemeModeChanged(ThemeMode mode) {
    if (_themeMode == mode) return;
    setState(() => _themeMode = mode);
    _ds.set(_kThemeModeKey, _modeToString(mode));
  }

  @override
  Widget build(BuildContext context) {
    return ThemeModeScope(
      themeMode: _themeMode,
      onThemeModeChanged: _onThemeModeChanged,
      child: widget.child,
    );
  }
}
