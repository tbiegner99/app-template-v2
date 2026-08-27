# Quickstart: SQLite Database Foundation

## Prerequisites

```bash
# Add required packages
flutter pub add sqflite path get_it
flutter pub add --dev sqflite_common_ffi
```

## Validation Steps

### 1. Verify migration runs on fresh install

```bash
flutter run
```

On first launch, open the Flutter logs and confirm:
- `[DB] Opening database at <path>`
- `[DB] Running migration v1`
- `[DB] Database ready at version 1`

### 2. Verify migrations do not re-run on relaunch

Stop and relaunch the app. Confirm logs show:
- `[DB] Database ready at version 1` (no migration log lines)

### 3. Verify DI resolves DatabaseClient

In any datasource, call `ServiceLocator.get<DatabaseClient>()` and confirm a non-null instance
is returned without throwing.

### 4. Run tests

```bash
flutter test test/db/
```

All tests should pass using the in-memory sqflite_common_ffi driver.

## File Locations

```
lib/
├── core/
│   ├── db/
│   │   ├── database_client.dart       # DatabaseClient class
│   │   ├── migration_runner.dart      # MigrationRunner class
│   │   └── migrations/
│   │       └── v001_initial.dart      # Migration v1
│   └── di/
│       └── service_locator.dart       # get_it setup
test/
└── db/
    ├── database_client_test.dart
    └── migration_runner_test.dart
```
