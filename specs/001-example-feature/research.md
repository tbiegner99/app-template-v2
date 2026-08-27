/spec# Research: SQLite Database Foundation

## sqflite Migration Strategy

**Decision**: Use `sqflite`'s built-in `onUpgrade` callback with a manually-maintained list of
versioned migration functions. Each migration corresponds to one integer version number.

**Rationale**: sqflite's `openDatabase` accepts `version`, `onCreate`, and `onUpgrade` parameters.
`onUpgrade(db, oldVersion, newVersion)` is called automatically when the stored version is less
than the declared version. By storing each migration as a Dart function (or SQL string) in an
ordered list indexed by version, migrations run exactly once and are never re-applied — sqflite
persists the current version in the SQLite `user_version` PRAGMA.

**Alternatives considered**:

- External SQL asset files loaded at runtime: Rejected — adds asset-loading complexity and
  makes migrations harder to test in isolation.
- `drift` (formerly Moor) ORM with built-in migration DSL: Rejected for now — adds a full ORM
  layer that is out of scope; can be adopted later without invalidating this architecture.
- `floor` ORM: Same rejection rationale as drift.

---

## DatabaseClient Wrapper Pattern

**Decision**: A `DatabaseClient` class wraps the sqflite `Database` handle and exposes typed
methods: `query`, `insert`, `update`, `delete`, `rawQuery`, `transaction`. It is the only class
that imports `sqflite` directly.

**Rationale**: Centralises connection lifecycle management. Datasources import `DatabaseClient`,
not `sqflite`, so the underlying driver can be swapped (e.g., `sqflite_common_ffi` for tests)
without touching datasource code.

**Alternatives considered**:

- Passing the raw `Database` handle to datasources: Rejected — violates the constitution's
  datasource-layer isolation principle.
- Repository pattern (per-entity repository wrapping sqflite): Rejected as over-engineering for
  this foundational layer; repositories can be added on top of datasources later.

---

## Dependency Injection

**Decision**: Use `get_it` as the service locator / DI container. `DatabaseClient` is registered
as a singleton. Datasources are registered as lazy singletons (instantiated on first resolve).

**Rationale**: `get_it` is the most widely adopted DI solution in the Flutter ecosystem, has no
code generation requirement, and integrates cleanly with async initialization (via
`getAsync` / `isReady`). The project has no existing DI setup, so introducing `get_it` now
establishes the pattern for all future features.

**Alternatives considered**:

- `injectable` + `get_it` with code generation: Rejected for now — unnecessary ceremony for
  this initial setup; can be layered on later.
- `riverpod` providers: Rejected — riverpod is a UI-state-management solution first; using it
  as a DI container for datasources would couple infrastructure to Flutter widget lifecycle.
- `provider` package: Same rejection rationale as riverpod.

---

## Initial Migration

**Decision**: Migration v1 creates a `schema_info` table (for future use / metadata) and
establishes the pattern. Real domain tables will be added in subsequent migrations as features
are implemented.

**Rationale**: An initial migration that runs on every fresh install validates the migration
pipeline end-to-end before any domain tables are needed. It also gives us a place to store
app-level metadata if needed.

---

## Packages to Add

| Package              | Version  | Purpose                                      |
|----------------------|----------|----------------------------------------------|
| `sqflite`            | `^2.3.3` | SQLite driver for iOS and Android            |
| `path`               | `^1.9.0` | Cross-platform database file path resolution |
| `get_it`             | `^7.7.0` | Dependency injection / service locator       |
| `sqflite_common_ffi` | `^2.3.4` | In-memory SQLite for unit/widget tests       |
