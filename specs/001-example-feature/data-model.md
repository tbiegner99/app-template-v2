/s[# Data Model: SQLite Database Foundation

## Entities

### AppMigration (Dart / conceptual)

Represents a single versioned schema migration. Not stored as a database table — exists as a
Dart object in the migration registry.

| Field     | Type                                 | Description                                          |
|-----------|--------------------------------------|------------------------------------------------------|
| `version` | `int`                                | Monotonically increasing version number (1, 2, 3, …) |
| `migrate` | `Future<void> Function(Database db)` | SQL to execute for this version                      |

**Rules**:

- Version numbers MUST be contiguous starting from 1; gaps are allowed but no migration may be
  skipped.
- Each `migrate` function MUST be idempotent where possible (CREATE TABLE IF NOT EXISTS, etc.).

---

### SchemaVersion (SQLite / runtime)

sqflite persists the current schema version in the SQLite `user_version` PRAGMA automatically
when `openDatabase` is called with a `version` argument. No application-managed table is needed.

| Field          | Storage       | Description                                            |
|----------------|---------------|--------------------------------------------------------|
| `user_version` | SQLite PRAGMA | Integer equal to the highest migration version applied |

---

### schema_info (SQLite table — created by migration v1)

A lightweight metadata table established by the initial migration to validate the pipeline.

| Column       | Type | Constraints | Description                       |
|--------------|------|-------------|-----------------------------------|
| `key`        | TEXT | PRIMARY KEY | Metadata key                      |
| `value`      | TEXT | NOT NULL    | Metadata value                    |
| `updated_at` | TEXT | NOT NULL    | ISO-8601 timestamp of last update |

---

## Dart Abstractions

### DatabaseClient

Single gateway to the SQLite database. Wraps a sqflite `Database` instance.

```
DatabaseClient
  + db: Database (private)
  + open(String path, List<AppMigration> migrations): Future<void>
  + query(String table, {…}): Future<List<Map<String, dynamic>>>
  + insert(String table, Map<String, dynamic> values): Future<int>
  + update(String table, Map<String, dynamic> values, {String? where, List? whereArgs}): Future<int>
  + delete(String table, {String? where, List? whereArgs}): Future<int>
  + rawQuery(String sql, [List? args]): Future<List<Map<String, dynamic>>>
  + transaction(Future<T> Function(Transaction txn) action): Future<T>
```

### MigrationRunner

Orchestrates applying pending migrations. Used internally by `DatabaseClient.open`.

```
MigrationRunner
  + migrations: List<AppMigration>
  + run(Database db, int oldVersion, int newVersion): Future<void>
```

### ServiceLocator (get_it wrapper)

Thin wrapper around `GetIt.instance` that registers all infrastructure dependencies.

```
ServiceLocator
  + setup(): Future<void>   — called once at app startup before runApp()
  + get<T>(): T             — delegates to GetIt.instance<T>()
```
