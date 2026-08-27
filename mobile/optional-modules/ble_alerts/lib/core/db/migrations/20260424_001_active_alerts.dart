import '../app_migration.dart';

AppMigration migration20260424001ActiveAlerts() => AppMigration(
      version: 4,
      migrate: (db) async {
        await db.execute('''
          CREATE TABLE active_alerts (
            id                    TEXT    NOT NULL PRIMARY KEY,
            title                 TEXT    NOT NULL,
            body                  TEXT    NOT NULL,
            route                 TEXT,
            local_notification_id INTEGER NOT NULL,
            date_created          TEXT    NOT NULL
          )
        ''');
      },
    );
