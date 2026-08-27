import 'package:flutter/material.dart';

import 'palette.dart';
import 'theme.dart';

final ThemeData muiDarkTheme = ThemeData(
  colorScheme: ColorScheme(
    brightness: Brightness.dark,
    primary: AppPalette.navy[300]!,
    onPrimary: AppPalette.navy[900]!,
    primaryContainer: SurfaceDarkColors.primaryContainer,
    onPrimaryContainer: SurfaceDarkColors.onPrimaryContainer,
    secondary: SemanticColors.secondary,
    onSecondary: AppPalette.navy[900]!,
    secondaryContainer: SurfaceDarkColors.secondaryContainer,
    onSecondaryContainer: SurfaceDarkColors.onSecondaryContainer,
    error: AppPalette.red[400]!,
    onError: AppPalette.navy[900]!,
    errorContainer: SurfaceDarkColors.errorContainer,
    onErrorContainer: SurfaceDarkColors.onErrorContainer,
    surface: SurfaceDarkColors.surface,
    onSurface: SurfaceDarkColors.onSurface,
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
    color: AppPalette.navy[600],
  ),
  appBarTheme: AppBarTheme(
    backgroundColor: AppPalette.navy[900],
    foregroundColor: Colors.white,
    elevation: 0,
  ),
  navigationBarTheme: NavigationBarThemeData(
    backgroundColor: AppPalette.navy[900],
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
  bottomNavigationBarTheme: BottomNavigationBarThemeData(
    backgroundColor: AppPalette.navy[900],
    selectedItemColor: SemanticColors.secondary,
    unselectedItemColor: Colors.white60,
    elevation: 0,
  ),
);
