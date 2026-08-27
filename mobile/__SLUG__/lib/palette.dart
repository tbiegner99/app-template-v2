import 'package:flutter/material.dart';

/// Raw color scales — mirrors web/apps/components/src/theme/Palette.ts
class AppPalette {
  AppPalette._();

  static const Map<int, Color> navy = {
    50:  Color(0xFFe8edf3),
    100: Color(0xFFc5d0de),
    200: Color(0xFF9fb0c7),
    300: Color(0xFF7890b0),
    400: Color(0xFF5a779f),
    500: Color(0xFF3c5e8e),
    600: Color(0xFF2d4d7a),
    700: Color(0xFF1a3a5c),
    800: Color(0xFF0f2744),
    900: Color(0xFF071a2e),
  };

  static const Map<int, Color> orange = {
    50:  Color(0xFFfff7ed),
    100: Color(0xFFffedd5),
    200: Color(0xFFfed7aa),
    300: Color(0xFFfdba74),
    400: Color(0xFFfb923c),
    500: Color(0xFFf97316),
    600: Color(0xFFea580c),
    700: Color(0xFFc2410c),
    800: Color(0xFF9a3412),
    900: Color(0xFF7c2d12),
  };

  static const Map<int, Color> green = {
    50:  Color(0xFFf0fdf4),
    100: Color(0xFFdcfce7),
    200: Color(0xFFbbf7d0),
    300: Color(0xFF86efac),
    400: Color(0xFF4ade80),
    500: Color(0xFF22c55e),
    600: Color(0xFF16a34a),
    700: Color(0xFF15803d),
    800: Color(0xFF166534),
    900: Color(0xFF14532d),
  };

  static const Map<int, Color> amber = {
    50:  Color(0xFFfffbeb),
    100: Color(0xFFfef3c7),
    200: Color(0xFFfde68a),
    300: Color(0xFFfcd34d),
    400: Color(0xFFfbbf24),
    500: Color(0xFFf59e0b),
    600: Color(0xFFd97706),
    700: Color(0xFFb45309),
    800: Color(0xFF92400e),
    900: Color(0xFF78350f),
  };

  static const Map<int, Color> red = {
    50:  Color(0xFFfef2f2),
    100: Color(0xFFfee2e2),
    200: Color(0xFFfecaca),
    300: Color(0xFFfca5a5),
    400: Color(0xFFf87171),
    500: Color(0xFFef4444),
    600: Color(0xFFdc2626),
    700: Color(0xFFb91c1c),
    800: Color(0xFF991b1b),
    900: Color(0xFF7f1d1d),
  };

  static const Map<int, Color> sky = {
    50:  Color(0xFFf0f9ff),
    100: Color(0xFFe0f2fe),
    200: Color(0xFFbae6fd),
    300: Color(0xFF7dd3fc),
    400: Color(0xFF38bdf8),
    500: Color(0xFF0ea5e9),
    600: Color(0xFF0284c7),
    700: Color(0xFF0369a1),
    800: Color(0xFF075985),
    900: Color(0xFF0c4a6e),
  };
}

/// Semantic color tokens — mirrors SemanticColors in Palette.ts
class SemanticColors {
  SemanticColors._();

  static const Color primary   = Color(0xFF0f2744); // navy[800]
  static const Color secondary = Color(0xFFfdba74); // orange[300]
  static const Color success   = Color(0xFF16a34a); // green[600]
  static const Color warning   = Color(0xFFd97706); // amber[600]
  static const Color error     = Color(0xFFdc2626); // red[600]
  static const Color info      = Color(0xFF0284c7); // sky[600]
}

/// Named elevation scale — mirrors Elevation in Palette.ts
/// Use these values wherever Flutter expects a numeric elevation.
class AppElevation {
  AppElevation._();

  static const double none    = 0;
  static const double low     = 2;
  static const double medium  = 4;
  static const double high    = 8;
  static const double overlay = 16;
}

/// Light surface tokens — mirrors SurfaceColors in Palette.ts
class SurfaceColors {
  SurfaceColors._();

  static const Color surface              = Color(0xFFffffff);
  static const Color onSurface           = Color(0xFF000000);
  static const Color surfaceVariant      = Color(0xFFe8edf3); // navy[50]
  static const Color onSurfaceVariant    = Color(0xFF0f2744); // navy[800]
  static const Color primaryContainer    = Color(0xFF1a3a5c); // navy[700]
  static const Color onPrimaryContainer  = Color(0xFFffffff);
  static const Color secondaryContainer  = Color(0xFFfed7aa); // orange[200]
  static const Color onSecondaryContainer = Color(0xFF0f2744); // navy[800]
  static const Color errorContainer      = Color(0xFFfee2e2); // red[100]
  static const Color onErrorContainer    = Color(0xFF991b1b); // red[800]
}

/// Dark surface tokens — mirrors SurfaceDarkColors in Palette.ts
class SurfaceDarkColors {
  SurfaceDarkColors._();

  static const Color surface              = Color(0xFF0f2744); // navy[800]
  static const Color onSurface           = Color(0xFFffffff);
  static const Color surfaceVariant      = Color(0xFF1a3a5c); // navy[700]
  static const Color onSurfaceVariant    = Color(0xFFc5d0de); // navy[100]
  static const Color primaryContainer    = Color(0xFF1a3a5c); // navy[700]
  static const Color onPrimaryContainer  = Color(0xFFffffff);
  static const Color secondaryContainer  = Color(0xFFc2410c); // orange[700]
  static const Color onSecondaryContainer = Color(0xFFffffff);
  static const Color errorContainer      = Color(0xFF7f1d1d); // red[900]
  static const Color onErrorContainer    = Color(0xFFfecaca); // red[200]
}
