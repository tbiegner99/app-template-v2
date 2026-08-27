import 'package:flutter_test/flutter_test.dart';
import 'package:sqflite_common_ffi/sqflite_ffi.dart';
import 'package:mobile/core/db/app_migration.dart';
import 'package:mobile/core/db/migration_runner.dart';

void main() {
  setUpAll(() {
    sqfliteFfiInit();
    databaseFactory = databaseFactoryFfi;
  });

  Future<Database> openMemory() => databaseFactory.openDatabase(
        inMemoryDatabasePath,
        options: OpenDatabaseOptions(version: 1),
      );

  test('runs migrations in ascending version order', () async {
    final order = <int>[];
    final migrations = [
      AppMigration(version: 3, migrate: (_) async => order.add(3)),
      AppMigration(version: 1, migrate: (_) async => order.add(1)),
      AppMigration(version: 2, migrate: (_) async => order.add(2)),
    ];

    final db = await openMemory();
    await MigrationRunner(migrations).run(db, 0, 3);
    await db.close();

    expect(order, [1, 2, 3]);
  });

  test('skips migrations when oldVersion equals newVersion', () async {
    var ran = false;
    final migrations = [
      AppMigration(version: 1, migrate: (_) async => ran = true),
    ];

    final db = await openMemory();
    await MigrationRunner(migrations).run(db, 1, 1);
    await db.close();

    expect(ran, isFalse);
  });

  test('only applies migrations with version > oldVersion', () async {
    final ran = <int>[];
    final migrations = [
      AppMigration(version: 1, migrate: (_) async => ran.add(1)),
      AppMigration(version: 2, migrate: (_) async => ran.add(2)),
      AppMigration(version: 3, migrate: (_) async => ran.add(3)),
    ];

    final db = await openMemory();
    await MigrationRunner(migrations).run(db, 1, 3);
    await db.close();

    expect(ran, [2, 3]);
  });
}
