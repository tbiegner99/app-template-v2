import 'package:sqflite/sqflite.dart';
import 'app_migration.dart';
import '../logger.dart';

const _log = __SLUG_UPPER__Logger('MigrationRunner');

class MigrationRunner {
  final List<AppMigration> migrations;

  const MigrationRunner(this.migrations);

  Future<void> run(Database db, int oldVersion, int newVersion) async {
    final pending = migrations
        .where((m) => m.version > oldVersion && m.version <= newVersion)
        .toList()
      ..sort((a, b) => a.version.compareTo(b.version));

    for (final migration in pending) {
      _log.info('Running migration v${migration.version}');
      await migration.migrate(db);
    }
  }
}
