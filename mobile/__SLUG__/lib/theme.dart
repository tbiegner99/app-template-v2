import 'package:flutter/material.dart';

import 'palette.dart';

final double borderRadius = 4.0;

extension MuiColorScheme on ColorScheme {
  Color get info => SemanticColors.info;

  Color get onInfo => Colors.white;

  Color get success => SemanticColors.success;

  Color get onSuccess => Colors.white;

  Color get warning => SemanticColors.warning;

  Color get onWarning => Colors.white;
}

final ThemeData muiTheme = ThemeData(
  colorScheme: ColorScheme(
    brightness: Brightness.light,
    primary: SemanticColors.primary,
    onPrimary: Colors.white,
    primaryContainer: SurfaceColors.primaryContainer,
    onPrimaryContainer: SurfaceColors.onPrimaryContainer,
    secondary: SemanticColors.secondary,
    onSecondary: SurfaceColors.onSecondaryContainer,
    secondaryContainer: SurfaceColors.secondaryContainer,
    onSecondaryContainer: SurfaceColors.onSecondaryContainer,
    error: SemanticColors.error,
    onError: Colors.white,
    errorContainer: SurfaceColors.errorContainer,
    onErrorContainer: SurfaceColors.onErrorContainer,
    surface: SurfaceColors.surface,
    onSurface: SurfaceColors.onSurface,
  ),
  elevatedButtonTheme: ElevatedButtonThemeData(
    style: ElevatedButton.styleFrom(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(borderRadius)),
      textStyle: const TextStyle(fontWeight: FontWeight.w600),
    ),
  ),
  textTheme: const TextTheme(
    displayLarge: TextStyle(fontSize: 57.0, fontWeight: FontWeight.w400),
    displayMedium: TextStyle(fontSize: 45.0, fontWeight: FontWeight.w400),
    displaySmall: TextStyle(fontSize: 36.0, fontWeight: FontWeight.w400),
    headlineLarge: TextStyle(fontSize: 32.0, fontWeight: FontWeight.w400),
    headlineMedium: TextStyle(fontSize: 28.0, fontWeight: FontWeight.w400),
    headlineSmall: TextStyle(fontSize: 24.0, fontWeight: FontWeight.w400),
    titleLarge: TextStyle(fontSize: 22.0, fontWeight: FontWeight.w500),
    titleMedium: TextStyle(fontSize: 16.0, fontWeight: FontWeight.w500),
    titleSmall: TextStyle(fontSize: 14.0, fontWeight: FontWeight.w500),
    bodyLarge: TextStyle(fontSize: 16.0, fontWeight: FontWeight.w400),
    bodyMedium: TextStyle(fontSize: 14.0, fontWeight: FontWeight.w400),
    bodySmall: TextStyle(fontSize: 12.0, fontWeight: FontWeight.w400),
    labelLarge: TextStyle(fontSize: 14.0, fontWeight: FontWeight.w500),
    labelMedium: TextStyle(fontSize: 12.0, fontWeight: FontWeight.w500),
    labelSmall: TextStyle(fontSize: 11.0, fontWeight: FontWeight.w500),
  ),
  cardTheme: CardThemeData(
    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(borderRadius)),
  ),
  appBarTheme: const AppBarTheme(
    backgroundColor: SemanticColors.primary,
    foregroundColor: Colors.white,
    elevation: 0,
  ),
  navigationBarTheme: NavigationBarThemeData(
    backgroundColor: SemanticColors.primary,
    indicatorColor: AppPalette.navy[700],
    iconTheme: WidgetStateProperty.resolveWith((states) {
      if (states.contains(WidgetState.selected)) {
        return const IconThemeData(color: SemanticColors.secondary);
      }
      return const IconThemeData(color: Colors.white60);
    }),
    labelTextStyle: WidgetStateProperty.resolveWith((states) {
      if (states.contains(WidgetState.selected)) {
        return const TextStyle(
          color: SemanticColors.secondary,
          fontWeight: FontWeight.w600,
          fontSize: 12,
        );
      }
      return const TextStyle(color: Colors.white60, fontSize: 12);
    }),
  ),
  bottomNavigationBarTheme: const BottomNavigationBarThemeData(
    backgroundColor: SemanticColors.primary,
    selectedItemColor: SemanticColors.secondary,
    unselectedItemColor: Colors.white60,
    elevation: 0,
  ),
);
