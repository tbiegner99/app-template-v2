# Feature Specification: SQLite Database Foundation

**Feature Branch**: `001-sqlite-db-setup`
**Created**: 2026-04-22
**Status**: Draft
**Input**: User description: "lets set up the database. it should be sqlite and we should maintain a list of migrations that run when the database is loaded, each file represents the database version and migrations should not be rerun if already ran. sqflite should support this. also ensure we have a wrapper for the client that all datasources will use. we should also use dependency injection."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - App Initializes With Current Schema (Priority: P1)

When the app starts for the first time, all pending database migrations run automatically in
version order, bringing the schema to the latest version. Subsequent launches skip already-applied
migrations and open the database immediately.

**Why this priority**: Every other feature in the app depends on a correctly-structured, open
database. This is the foundational prerequisite for all data operations.

**Independent Test**: Launch the app on a clean install (no prior database), verify that all
migration files ran and the schema matches the expected version. Relaunch and verify no migrations
re-run and the database opens without error.

**Acceptance Scenarios**:

1. **Given** a fresh device with no database, **When** the app starts, **Then** all migration
   files run in ascending version order and the database is fully initialized.
2. **Given** a device where the database is already at version N, **When** the app starts,
   **Then** only migrations with version > N are applied; earlier migrations are skipped.
3. **Given** a database at the latest version, **When** the app starts, **Then** no migrations
   run and the database opens without modification.

---

### User Story 2 - Datasources Access the Database Through a Shared Client (Priority: P2)

All datasource classes obtain a database connection through a single shared database client
wrapper. No datasource opens its own connection directly.

**Why this priority**: Ensures consistent connection management, transaction handling, and
testability across the entire data layer.

**Independent Test**: Create a datasource that reads/writes a record. Verify it does so via the
shared client and that swapping the client (e.g., with an in-memory instance) requires no changes
to the datasource.

**Acceptance Scenarios**:

1. **Given** the database client is initialized, **When** a datasource performs a read or write,
   **Then** the operation executes through the shared client wrapper with no direct database
   handle access in the datasource.
2. **Given** the database client is not yet initialized, **When** a datasource attempts an
   operation, **Then** an appropriate error is surfaced (datasource does not silently initialize
   its own connection).

---

### User Story 3 - Dependencies Are Resolved via Injection (Priority: P3)

The database client and all datasources are registered with a dependency injection container.
Consumers receive instances through injection, not direct instantiation.

**Why this priority**: Enables testability and future substitution (e.g., mock clients in tests,
alternative implementations) without modifying call sites.

**Independent Test**: Resolve the database client and a datasource from the DI container. Verify
they are the same instances as registered (singleton behavior for the client) and that no
consumer calls a constructor directly.

**Acceptance Scenarios**:

1. **Given** the DI container is configured at app startup, **When** any datasource is resolved,
   **Then** it receives the shared database client automatically without manual wiring.
2. **Given** a test environment, **When** a mock database client is registered in the container,
   **Then** all datasources receive the mock without any change to datasource code.

---

### Edge Cases

- What happens if a migration file is malformed or throws an error mid-migration?
  The app MUST surface the error and halt initialization rather than proceeding with a
  partially-applied schema.
- What happens if migration files are added out of order (gap in version numbers)?
  Migrations MUST be applied strictly in ascending numeric order; gaps are permitted but
  no future migration may run before an earlier one.
- What happens if the database file is corrupted on disk?
  The client MUST surface a clear error; recovery strategy is out of scope for this feature.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST use SQLite as the local database engine via the sqflite package.
- **FR-002**: The system MUST maintain an ordered list of migration files, where each file
  represents one schema version.
- **FR-003**: On database open, the system MUST apply all migration files whose version is
  greater than the currently recorded schema version, in ascending order.
- **FR-004**: The system MUST record each successfully applied migration so it is never
  re-applied on subsequent launches.
- **FR-005**: The system MUST expose a single `DatabaseClient` wrapper that all datasources
  use for all read and write operations.
- **FR-006**: Datasources MUST NOT open or hold direct database connections; all access MUST go
  through `DatabaseClient`.
- **FR-007**: The `DatabaseClient` and all datasource classes MUST be registered with and
  resolved from the dependency injection container.
- **FR-008**: The DI container MUST be configured before any datasource is accessed.
- **FR-009**: A migration failure MUST halt the initialization sequence and surface an error;
  the app MUST NOT start with a partially-migrated schema.

### Key Entities

- **Migration**: A versioned SQL script. Attributes: version number (integer), SQL statements.
  Applied exactly once; version is persisted after successful execution.
- **DatabaseClient**: The sole gateway to the SQLite database. Exposes query, insert, update,
  and delete operations. Holds the single open database handle.
- **SchemaVersion**: A persisted record (table or metadata entry) tracking the highest
  migration version successfully applied.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: On a clean install, the database is fully initialized and ready for use within
  2 seconds of app launch on a mid-range device.
- **SC-002**: On a subsequent launch (migrations already applied), the database open phase adds
  less than 100 ms to startup time.
- **SC-003**: 100% of datasource classes in the codebase obtain their database access through
  `DatabaseClient`; zero direct sqflite calls appear outside the client wrapper.
- **SC-004**: Adding a new migration file requires no changes to existing datasources or
  the client wrapper — only the new file and its registration in the migration list.
- **SC-005**: A simulated migration failure during testing reliably halts initialization and
  produces a clear error message before any app screen is shown.

## Assumptions

- The sqflite package (or sqflite_common_ffi for testing) is used as the SQLite driver.
- The dependency injection framework is get_it (already common in Flutter projects); if the
  project uses a different DI package this spec applies equally — only the registration syntax
  differs.
- Migration files are Dart objects (or SQL strings defined in code) rather than external asset
  files, to avoid asset-loading complexity on first launch.
- The `DatabaseClient` is a singleton within the DI container; all datasources share one
  database connection.
- Database encryption and key management are out of scope for this feature.
- There is no requirement to support database downgrade (rolling back migrations) in this
  initial version.
