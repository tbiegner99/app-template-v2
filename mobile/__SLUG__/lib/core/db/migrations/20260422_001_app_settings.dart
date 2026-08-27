import 'package:sqflite/sqflite.dart';
import '../app_migration.dart';

AppMigration migration20260422001AppSettings() => AppMigration(
      version: 1,
      migrate: (Database db) async {
        await db.execute('''
          CREATE TABLE IF NOT EXISTS app_settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL,
            last_modified TEXT NOT NULL
          )
        ''');
      },
    );
