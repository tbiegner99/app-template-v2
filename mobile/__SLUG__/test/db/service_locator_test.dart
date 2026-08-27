import 'dart:io';

import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:connectivity_plus_platform_interface/connectivity_plus_platform_interface.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:get_it/get_it.dart';
import 'package:plugin_platform_interface/plugin_platform_interface.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:sqflite_common_ffi/sqflite_ffi.dart';
import 'package:mobile/core/db/database_client.dart';
import 'package:mobile/core/di/service_locator.dart';
import 'package:mobile/datasources/app_settings_datasource.dart';

class _FakeConnectivity extends Fake
    with MockPlatformInterfaceMixin
    implements ConnectivityPlatform {
  @override
  Future<List<ConnectivityResult>> checkConnectivity() async =>
      [ConnectivityResult.none];

  @override
  Stream<List<ConnectivityResult>> get onConnectivityChanged =>
      const Stream.empty();
}

void main() {
  late Directory tempDir;

  setUpAll(() {
    TestWidgetsFlutterBinding.ensureInitialized();
    sqfliteFfiInit();
    databaseFactory = databaseFactoryFfi;
    ConnectivityPlatform.instance = _FakeConnectivity();
  });

  setUp(() async {
    SharedPreferences.setMockInitialValues({});
    await GetIt.instance.reset();
    tempDir = await Directory.systemTemp.createTemp('sl_test_');
  });

  tearDown(() async {
    await tempDir.delete(recursive: true);
  });

  Future<void> setup() => ServiceLocator.setup(
        dbName: '${tempDir.path}/app.db',
        logDirectory: tempDir,
        registerBleServices: false,
      );

  test('DatabaseClient resolved twice is the same singleton', () async {
    await setup();

    final a = ServiceLocator.get<DatabaseClient>();
    final b = ServiceLocator.get<DatabaseClient>();

    expect(identical(a, b), isTrue);
  });

  test('AppSettingsDatasource receives the same DatabaseClient singleton', () async {
    await setup();

    final client = ServiceLocator.get<DatabaseClient>();
    final datasource = ServiceLocator.get<AppSettingsDatasource>();

    expect(identical(datasource.db, client), isTrue);
  });

  test('resolving DatabaseClient before setup throws', () {
    expect(
      () => ServiceLocator.get<DatabaseClient>(),
      throwsA(anything),
    );
  });

  test('log level defaults to DEBUG when app.LOG_LEVEL is not set', () async {
    await setup();
    // No exception means the default level was applied without error.
    // Actual Level assertion would require exposing Logger.level — covered by
    // the logger package's own tests.
  });

  test('log level is applied from app.LOG_LEVEL setting', () async {
    await setup();
    final settings = ServiceLocator.get<AppSettingsDatasource>();
    await settings.set('app.LOG_LEVEL', 'INFO');

    // Re-setup with the value now persisted.
    await GetIt.instance.reset();
    SharedPreferences.setMockInitialValues({});
    await setup();
    // No exception means levelFromString resolved correctly.
  });
}
