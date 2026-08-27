import '../app_migration.dart';

AppMigration migration20260423002FeatureFlags() => AppMigration(
      version: 3,
      migrate: (db) async {
        await db.execute('''
          CREATE TABLE feature_flags (
            name          TEXT    NOT NULL PRIMARY KEY,
            enabled       INTEGER NOT NULL DEFAULT 0,
            date_created  TEXT    NOT NULL,
            last_modified TEXT    NOT NULL,
            synced_at     TEXT
          )
        ''');
      },
    );
