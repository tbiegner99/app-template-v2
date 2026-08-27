# Implementation Plan: SQLite Database Foundation

**Branch**: `001-sqlite-db-setup` | **Date**: 2026-04-22 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `specs/001-sqlite-db-setup/spec.md`

## Summary

Establish the SQLite database infrastructure for the __DISPLAY_NAME__ Mobile app.
This includes: a versioned migration runner (sqflite, one migration file per version, applied
once and never re-run), a `DatabaseClient` wrapper that is the sole point of database access for
all datasources, and a `get_it`-based service locator that wires all infrastructure together via
dependency injection. An initial migration (v1) creates the `schema_info` table.

## Technical Context

**Language/Version**: Dart 3 / Flutter SDK ^3.10.4
**Primary Dependencies**: sqflite ^2.3.3, path ^1.9.0, get_it ^7.7.0
**Storage**: SQLite via sqflite (local device storage)
**Testing**: flutter_test + sqflite_common_ffi (in-memory SQLite for unit tests)
**Target Platform**: iOS and Android (sqflite supports both natively)
**Project Type**: Mobile app (Flutter)
**Performance Goals**: Database open < 100 ms on subsequent launches; < 2 s on fresh install
**Constraints**: Offline-only; no network access in this feature; migrations must be atomic
**Scale/Scope**: Foundation layer — no domain tables yet; all future features build on this

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Component Reusability | ✅ PASS | No UI in this feature |
| II. Strict MVC Layering | ✅ PASS | `DatabaseClient` is the datasource layer; no service/view code here |
| III. Offline-First | ✅ PASS | SQLite is the local-first data store; no server dependency |
| IV. i18n | ✅ PASS | No user-facing text in this feature |
| V. Rust Document Compilation | ✅ PASS | Not applicable to this feature |
| VI. Standardised Theming | ✅ PASS | No UI in this feature |
| VII. Platform Support | ✅ PASS | sqflite supports iOS and Android |

**Post-design re-check**: All gates still pass. No violations.

## Project Structure

### Documentation (this feature)

```text
specs/001-sqlite-db-setup/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit-tasks command)
```

### Source Code

```text
lib/
├── core/
│   ├── db/
│   │   ├── database_client.dart       # DatabaseClient — sole sqflite access point
│   │   ├── migration_runner.dart      # MigrationRunner — applies pending migrations
│   │   └── migrations/
│   │       └── v001_initial.dart      # Migration v1: creates schema_info table
│   └── di/
│       └── service_locator.dart       # get_it registration + ServiceLocator.get<T>()

test/
└── db/
    ├── database_client_test.dart      # Unit tests using sqflite_common_ffi
    └── migration_runner_test.dart     # Migration ordering and idempotency tests
```

**Structure Decision**: Flutter mobile project. Infrastructure lives in `lib/core/` to separate
it cleanly from feature code. No API layer — this feature is entirely local.

## Complexity Tracking

> No constitution violations — this section is not required.
