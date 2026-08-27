---
description: "Task list for SQLite Database Foundation"
---

# Tasks: SQLite Database Foundation

**Input**: Design documents from `specs/001-sqlite-db-setup/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, quickstart.md ✅

**Organization**: Tasks are grouped by user story to enable independent implementation and
testing of each story.

---

## Phase 1: Setup

**Purpose**: Add required packages and establish project structure.

- [x] T001 Add `sqflite ^2.3.3` and `path ^1.9.0` to `pubspec.yaml` dependencies
- [x] T002 Add `get_it ^7.7.0` to `pubspec.yaml` dependencies
- [x] T003 Add `sqflite_common_ffi ^2.3.4` to `pubspec.yaml` dev_dependencies
- [x] T004 Run `flutter pub get` to install all added packages
- [x] T005 [P] Create directory `lib/core/db/migrations/`
- [x] T006 [P] Create directory `lib/core/di/`
- [x] T007 [P] Create directory `test/db/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that ALL user stories depend on. MUST be complete before
any user story work begins.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T008 Create `AppMigration` model class in `lib/core/db/app_migration.dart`
  - Fields: `int version`, `Future<void> Function(Database db) migrate`
- [x] T009 Create `MigrationRunner` class in `lib/core/db/migration_runner.dart`
  - Constructor takes `List<AppMigration> migrations`
  - Method `Future<void> run(Database db, int oldVersion, int newVersion)` applies
    all migrations where `migration.version > oldVersion && migration.version <= newVersion`
    in ascending order
- [x] T010 Create `DatabaseClient` class in `lib/core/db/database_client.dart`
  - Private `Database? _db` field
  - `Future<void> open(String path, List<AppMigration> migrations)` — opens the database
    using sqflite `openDatabase` with `version`, `onCreate`, and `onUpgrade` wired to
    `MigrationRunner`
  - Public methods delegating to `_db`: `query`, `insert`, `update`, `delete`,
    `rawQuery`, `transaction`
  - Guard each public method to throw `StateError` if `_db` is null (not yet opened)
- [x] T011 Create `ServiceLocator` in `lib/core/di/service_locator.dart`
  - Wraps `GetIt.instance`
  - Static `Future<void> setup()` method that registers `DatabaseClient` as a singleton
    and calls `client.open(...)` before completing
  - Static `T get<T extends Object>()` delegate to `GetIt.instance<T>()`
- [x] T012 Update `lib/main.dart` to call `await ServiceLocator.setup()` before `runApp()`

**Checkpoint**: Foundation ready — all three user stories can now begin.

---

## Phase 3: User Story 1 — App Initializes With Current Schema (Priority: P1) 🎯 MVP

**Goal**: On first launch all migrations run in order; on subsequent launches they are skipped.

**Independent Test**: Uninstall app, reinstall, confirm migration v1 runs and logs. Relaunch,
confirm no migration runs and the database opens immediately.

- [x] T013 [US1] Create migration v1 in `lib/core/db/migrations/v001_initial.dart`
  - Returns an `AppMigration` with `version: 1`
  - SQL: `CREATE TABLE IF NOT EXISTS schema_info (key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at TEXT NOT NULL)`
- [x] T014 [US1] Register migration v1 in `ServiceLocator.setup()` inside
  `lib/core/di/service_locator.dart` by passing `[v001Initial()]` to `DatabaseClient.open`
- [x] T015 [US1] Add debug logging in `DatabaseClient.open` and `MigrationRunner.run`
  so that `[DB] Running migration vN` and `[DB] Database ready at version N` appear in
  Flutter logs during development
- [ ] T016 [US1] Manually validate on a fresh simulator/device that migration v1 runs once
  and does not re-run on relaunch (see `quickstart.md` validation steps)

**Checkpoint**: User Story 1 is fully functional. The migration pipeline is proven end-to-end.

---

## Phase 4: User Story 2 — Datasources Use Shared DatabaseClient (Priority: P2)

**Goal**: All datasource classes receive `DatabaseClient` through DI and perform all
reads/writes through it with no direct sqflite calls.

**Independent Test**: Write a minimal example `ExampleDatasource` that inserts and reads from
`schema_info` via `DatabaseClient`. Swap `DatabaseClient` for an in-memory instance; confirm
the datasource works without modification.

- [x] T017 [US2] Create `lib/core/db/db_datasource.dart` — an abstract base class
  (or mixin) that datasource classes extend/use; it holds a `DatabaseClient` injected
  via constructor
- [x] T018 [US2] Create `lib/datasources/example_datasource.dart` as a reference
  implementation: reads/writes `schema_info` table using `DatabaseClient`; imports
  `DatabaseClient` only, no direct sqflite imports
- [x] T019 [US2] Register `ExampleDatasource` as a lazy singleton in `ServiceLocator.setup()`
  in `lib/core/di/service_locator.dart`, injecting `ServiceLocator.get<DatabaseClient>()`

**Checkpoint**: User Story 2 verified — datasource layer isolation is enforced.

---

## Phase 5: User Story 3 — DI Container Resolves All Dependencies (Priority: P3)

**Goal**: `DatabaseClient` is a singleton resolved from `get_it`; datasources receive it
automatically; no consumer calls constructors directly.

**Independent Test**: Call `ServiceLocator.get<DatabaseClient>()` twice and assert same
instance. Call `ServiceLocator.get<ExampleDatasource>()` and confirm it receives the
same `DatabaseClient` singleton.

- [x] T020 [US3] Write `test/db/service_locator_test.dart`
  - Use `sqflite_common_ffi` to initialise an in-memory database for tests
  - Test: `DatabaseClient` resolved twice returns identical instance (singleton)
  - Test: `ExampleDatasource` resolved from container holds the same `DatabaseClient`
    instance as `ServiceLocator.get<DatabaseClient>()`
  - Test: resolving before `setup()` throws (guard is present)
- [x] T021 [US3] Write `test/db/migration_runner_test.dart`
  - Use `sqflite_common_ffi` in-memory database
  - Test: migrations run in ascending version order
  - Test: no migration runs when `oldVersion == newVersion`
  - Test: only migrations with `version > oldVersion` run when upgrading
- [x] T022 [US3] Write `test/db/database_client_test.dart`
  - Use `sqflite_common_ffi` in-memory database
  - Test: calling any public method before `open()` throws `StateError`
  - Test: `insert` + `query` round-trip returns expected data
  - Test: `transaction` rolls back on error

**Checkpoint**: All three user stories independently verified. DI wiring is test-proven.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [x] T023 [P] Verify no file in `lib/core/db/` or `lib/core/di/` exceeds 500 lines
  (constitution Principle I)
- [x] T024 [P] Confirm no `import 'package:sqflite/sqflite.dart'` appears outside
  `lib/core/db/database_client.dart` and `lib/core/db/migration_runner.dart`
- [x] T025 Run `flutter analyze` and resolve all warnings in touched files
- [x] T026 Run `flutter test test/db/` and confirm all tests pass
- [ ] T027 [P] Update `README.md` or `RUST_BUILD.md` if any setup step changed
  (e.g., new `flutter pub get` requirement)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 completion — BLOCKS all user stories
- **User Stories (Phases 3–5)**: All depend on Phase 2 completion
  - Stories can proceed in priority order (P1 → P2 → P3) or in parallel if staffed
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **US1 (P1)**: Can start after Phase 2 — no dependency on US2 or US3
- **US2 (P2)**: Can start after Phase 2 — no dependency on US1 or US3
- **US3 (P3)**: Can start after Phase 2 — validates the same DI wiring US1/US2 depend on

### Within Each Phase

- Models before classes that use them (T008 → T009 → T010)
- `ServiceLocator` last in Foundational (T011 depends on T010)
- `main.dart` update last (T012 depends on T011)

### Parallel Opportunities

- T005, T006, T007 — directory creation, no dependencies between them
- T013, T017 — different files, can run in parallel once T010 is done
- T020, T021, T022 — different test files, can run in parallel
- T023, T024, T027 — polish checks, all independent

---

## Implementation Strategy

### MVP (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (T008–T012)
3. Complete Phase 3: T013–T016
4. **STOP and VALIDATE**: Confirm migration pipeline works end-to-end
5. Continue to Phase 4 and 5 when ready

### Incremental Delivery

1. Setup + Foundational → database opens, DI wired
2. Add US1 (T013–T016) → migrations proven, schema_info exists
3. Add US2 (T017–T019) → datasource isolation enforced
4. Add US3 (T020–T022) → full test coverage on DI and migration logic
5. Polish (Phase 6) → clean slate for future feature development

---

## Notes

- `[P]` tasks operate on different files with no shared dependencies — safe to run in parallel
- `[USn]` labels map each task to a specific user story for traceability
- sqflite_common_ffi must be initialised with `sqfliteFfiInit()` + `databaseFactory = databaseFactoryFfi` at the top of each test file
- No domain tables are created in this feature; all domain migrations come in future features
