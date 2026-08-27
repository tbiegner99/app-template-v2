import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/material.dart';
import 'package:mobile/components/i18n/TranslationsProvider.dart';

import 'components/auth/auth_provider.dart';
import 'components/feature_flags/feature_flag_provider.dart';
import 'controllers/auth_controller.dart';
import 'controllers/feature_flag_controller.dart';
import 'core/di/service_locator.dart';
import 'core/notifications/notification_service.dart';
import 'core/router/app_router.dart';
import 'dark_theme.dart';
import 'theme.dart';
import 'theme_provider.dart';

Future<void> bootstrap() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp();
  // __OPTIONAL_MODULE_REGISTRATION__
  await ServiceLocator.setup();
  final flags = ServiceLocator.get<FeatureFlagController>();
  // if (flags.isEnabled('push_notifications')) {
  await NotificationService.init();
  // }
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return ThemeProvider(
      child: Builder(
        builder: (context) => TranslationsProvider(
          defaultDictionaryAsset: 'assets/i18n/en.json',
          child: AuthProvider(
            notifier: ServiceLocator.get<AuthController>(),
            child: MaterialApp.router(
              title: 'Flutter Demo',
              theme: muiTheme,
              darkTheme: muiDarkTheme,
              themeMode: ThemeModeScope.of(context).themeMode,
              routerConfig: AppRouter.router,
              builder: (context, child) => FeatureFlagProvider(
                notifier: ServiceLocator.get<FeatureFlagController>(),
                child: child!,
              ),
            ),
          ),
        ),
      ),
    );
  }
}
