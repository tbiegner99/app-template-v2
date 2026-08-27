import 'dart:io';

import 'package:flutter_test/flutter_test.dart';
import 'package:sqflite_common_ffi/sqflite_ffi.dart';
import 'package:mobile/core/db/app_migration.dart';
import 'package:mobile/core/db/database_client.dart';

void main() {
  late Directory tempDir;

  setUpAll(() {
    sqfliteFfiInit();
    databaseFactory = databaseFactoryFfi;
  });

  setUp(() async {
    tempDir = await Directory.systemTemp.createTemp('db_test_');
  });

  tearDown(() async {
    await tempDir.delete(recursive: true);
  });

  Future<DatabaseClient> openClient([
    List<AppMigration>? migrations,
  ]) async {
    final client = DatabaseClient();
    await client.open(
      '${tempDir.path}/test.db',
      migrations ??
          [
            AppMigration(
              version: 1,
              migrate: (db) => db.execute(
                'CREATE TABLE test '
                '(id INTEGER PRIMARY KEY, name TEXT NOT NULL)',
              ),
            ),
          ],
    );
    return client;
  }

  test('throws StateError when querying before open', () {
    final client = DatabaseClient();
    expect(
      () => client.query('any_table'),
      throwsA(isA<StateError>()),
    );
  });

  test('insert and query round-trip returns expected data', () async {
    final client = await openClient();

    await client.insert('test', {'id': 1, 'name': 'hello'});
    final rows = await client.query('test', where: 'id = ?', whereArgs: [1]);

    expect(rows.length, 1);
    expect(rows.first['name'], 'hello');
  });

  test('transaction rolls back on error', () async {
    final client = await openClient();

    try {
      await client.transaction((txn) async {
        await txn.insert('test', {'id': 1, 'name': 'will-rollback'});
        throw Exception('forced rollback');
      });
    } catch (_) {}

    final rows = await client.query('test');
    expect(rows, isEmpty);
  });
}
