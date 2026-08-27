import 'dart:io';
import 'package:get_it/get_it.dart';
import 'package:uuid/uuid.dart';
import 'package:go_router/go_router.dart';
import 'package:path_provider/path_provider.dart';
import '../db/database_client.dart';
import '../router/app_router.dart';
import '../db/app_migration.dart';
import '../db/migrations/20260422_001_app_settings.dart';
import '../db/migrations/20260423_001_favorites.dart';
import '../db/migrations/20260423_002_feature_flags.dart';
import '../logger.dart';
import '../capped_file_output.dart';
import '../../datasources/app_settings_datasource.dart';
import '../../datasources/favorites_datasource.dart';
import '../../datasources/feature_flags_datasource.dart';
import '../../services/favorites_service.dart';
import '../../services/feature_flags_service.dart';
import '../../controllers/nav_controller.dart';
import '../../controllers/feature_flag_controller.dart';
import '../../services/analytics_service.dart';
import '../analytics_constants.dart';
import 'package:posthog_flutter/posthog_flutter.dart';
import '../../controllers/auth_controller.dart';
import '../../datasources/auth_datasource.dart';
import '../../services/auth_service.dart';
import '../auth/session_datasource.dart';

final _locator = GetIt.instance;

class ServiceLocator {
  static const backendUrl = String.fromEnvironment(
    'BACKEND_URL',
    defaultValue: 'http://10.0.2.2:8080',
  );

  /// Extra migrations contributed by optional feature modules. Populate
  /// before [setup] runs.
  static List<AppMigration> extraMigrations = const [];

  /// Extra setup steps contributed by optional feature modules, run after
  /// core registrations complete. Populate before [setup] runs.
  static List<Future<void> Function(DatabaseClient client)> extraSetupSteps =
      const [];

  static Future<void> setup({
    String dbName = 'app.db',
    Directory? logDirectory,
  }) async {
    final client = DatabaseClient();
    await client.open(dbName, [
      migration20260422001AppSettings(),
      migration20260423001Favorites(),
      migration20260423002FeatureFlags(),
      ...extraMigrations,
    ]);
    _locator.registerSingleton<DatabaseClient>(client);

    final settings = AppSettingsDatasource(client);
    _locator.registerSingleton<AppSettingsDatasource>(settings);

    final logLevel = __SLUG_UPPER__Logger.levelFromString(
      await settings.get('app.LOG_LEVEL') ?? 'DEBUG',
    );
    final maxBytes = __SLUG_UPPER__Logger.maxBytesFromString(
      await settings.get('app.LOG_MAX_SIZE'),
    );

    final dir = logDirectory ?? await getApplicationDocumentsDirectory();
    final logFile = File('${dir.path}/app.log');

    __SLUG_UPPER__Logger.init(
      fileOutput: CappedFileOutput(file: logFile, maxBytes: maxBytes),
      level: logLevel,
    );

    final favoritesDatasource = FavoritesDatasource(client);
    _locator.registerSingleton<FavoritesDatasource>(favoritesDatasource);

    final favoritesService = FavoritesService(favoritesDatasource);
    _locator.registerSingleton<FavoritesService>(favoritesService);

    final navController = NavController(favoritesService);
    await navController.init();
    _locator.registerSingleton<NavController>(navController);

    final featureFlagsDatasource = FeatureFlagsDatasource(client);
    _locator.registerSingleton<FeatureFlagsDatasource>(featureFlagsDatasource);

    final featureFlagsService = FeatureFlagsService(featureFlagsDatasource);
    _locator.registerSingleton<FeatureFlagsService>(featureFlagsService);

    final featureFlagController = FeatureFlagController(featureFlagsService);
    await featureFlagController.init();
    _locator.registerSingleton<FeatureFlagController>(featureFlagController);

    // Generate and persist stable device UUID on first install
    var deviceId = await settings.get('device.id');
    if (deviceId == null) {
      deviceId = const Uuid().v4();
      await settings.set('device.id', deviceId);
    }
    _locator.registerSingleton<String>(deviceId, instanceName: 'deviceId');

    final sessionDs = SessionDatasource();
    _locator.registerSingleton<SessionDatasource>(sessionDs);
    final authDs = AuthDatasource();
    final authService = AuthService(sessionDs, authDs, settings);
    final authController = AuthController(authService);
    await authController.init();
    _locator.registerSingleton<AuthController>(authController);

    if (featureFlagController.isEnabled('posthog')) {
      await Posthog().setup(PostHogConfig(kPostHogApiKey)
        ..captureApplicationLifecycleEvents = false
        ..sessionReplay = false);
    }
    final analyticsService = AnalyticsService(featureFlagController);
    _locator.registerSingleton<AnalyticsService>(analyticsService);

    for (final step in extraSetupSteps) {
      await step(client);
    }

    // Registered last so extra modules can populate
    // AppRouter.extraSettingsRoutes (in an extraSetupStep) before the router
    // — a static final, memoized on first access — is ever built.
    _locator.registerSingleton<GoRouter>(AppRouter.router);
  }

  static T get<T extends Object>() => _locator<T>();
}
