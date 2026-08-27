import 'package:sqflite/sqflite.dart';
export 'package:sqflite/sqflite.dart' show ConflictAlgorithm;
import 'package:path/path.dart';
import 'app_migration.dart';
import 'migration_runner.dart';
import '../logger.dart';

const _log = __SLUG_UPPER__Logger('DatabaseClient');

class DatabaseClient {
  Database? _db;

  Future<void> open(String name, List<AppMigration> migrations) async {
    final runner = MigrationRunner(migrations);
    final path = join(await getDatabasesPath(), name);
    final targetVersion = migrations.isEmpty
        ? 1
        : migrations.map((m) => m.version).reduce((a, b) => a > b ? a : b);

    _db = await openDatabase(
      path,
      version: targetVersion,
      onCreate: (db, version) => runner.run(db, 0, version),
      onUpgrade: (db, oldVersion, newVersion) =>
          runner.run(db, oldVersion, newVersion),
    );

    _log.info('Database ready at version $targetVersion');
  }

  Database get _database {
    final db = _db;
    if (db == null) throw StateError('DatabaseClient has not been opened.');
    return db;
  }

  Future<R> _timed<R>(String op, Future<R> Function() fn) async {
    final sw = Stopwatch()..start();
    final result = await fn();
    _log.debug('$op completed in ${sw.elapsedMilliseconds}ms');
    return result;
  }

  Future<List<Map<String, dynamic>>> query(
    String table, {
    bool? distinct,
    List<String>? columns,
    String? where,
    List<Object?>? whereArgs,
    String? groupBy,
    String? having,
    String? orderBy,
    int? limit,
    int? offset,
  }) =>
      _timed('query($table)', () => _database.query(
            table,
            distinct: distinct,
            columns: columns,
            where: where,
            whereArgs: whereArgs,
            groupBy: groupBy,
            having: having,
            orderBy: orderBy,
            limit: limit,
            offset: offset,
          ));

  Future<int> insert(
    String table,
    Map<String, Object?> values, {
    ConflictAlgorithm? conflictAlgorithm,
  }) =>
      _timed('insert($table)',
          () => _database.insert(table, values, conflictAlgorithm: conflictAlgorithm));

  Future<int> update(
    String table,
    Map<String, Object?> values, {
    String? where,
    List<Object?>? whereArgs,
    ConflictAlgorithm? conflictAlgorithm,
  }) =>
      _timed('update($table)',
          () => _database.update(table, values,
              where: where,
              whereArgs: whereArgs,
              conflictAlgorithm: conflictAlgorithm));

  Future<int> delete(
    String table, {
    String? where,
    List<Object?>? whereArgs,
  }) =>
      _timed('delete($table)',
          () => _database.delete(table, where: where, whereArgs: whereArgs));

  Future<List<Map<String, dynamic>>> rawQuery(
    String sql, [
    List<Object?>? arguments,
  ]) =>
      _timed('rawQuery', () => _database.rawQuery(sql, arguments));

  Future<T> transaction<T>(
    Future<T> Function(Transaction txn) action, {
    bool? exclusive,
  }) =>
      _timed('transaction',
          () => _database.transaction(action, exclusive: exclusive));
}
