<!--
SYNC IMPACT REPORT
==================
Version change: 2.0.1 → 2.1.0

Added sections:
  - XVI. Testing Standards — new "Widgetbook Catalog Coverage" subsection: every new/changed
    shared widget under mobile/lib/components/** must have a matching Widgetbook catalog entry
    under mobile/widgetbook/lib/use_cases/**, enforced via the pre-push hook (.husky/pre-push)
    today, with CI enforcement to follow once a CI pipeline exists for this repo.
    See specs/012-widgetbook-docs/.

Version change: 2.0.0 → 2.0.1

Modified sections:
  - XVI. Testing Standards — added numeric-prefix naming rule for both Playwright and mobile E2E
    spec files (e.g. 01-login.spec.ts); applies to web/apps/control-center/test/e2e/ and
    test/mobile/e2e/

Version change: 1.9.0 → 2.0.0

Added sections:
  - XVI. Testing Standards — unit test 85% coverage enforcement via Husky pre-push hook,
    integration test data helper requirements, web/mobile E2E setup/teardown rules,
    test-only API access policy

Version change: 1.8.0 → 1.9.0

Added sections:
  - XV. Server-Side Pagination & Filtering — all bulk list endpoints must be POST /<resource>/list
    with PaginationParams body, PagedResponse[T] envelope, domain field mapping, and frontend
    Table/useServerTableParams integration pattern

Version change: 1.7.0 → 1.8.0

Modified principles:
  - IV. Internationalisation (i18n): expanded with web-specific pattern — TranslatedText for
    JSX content, dictionary.translate() for prop strings, all keys in translations.json,
    dot-notation key hierarchy required

Version change: 1.6.0 → 1.7.0

Added sections:
  - XIV. Web Form Inputs — all form inputs must use TextInput (and other form components) from
    @__SLUG__/components; raw <input>, <select>, or <textarea> HTML elements are prohibited

Version change: 1.5.0 → 1.6.0

Added sections:
  - XII. Icon Usage — all icons must be re-exported through @__SLUG__/components Icons.tsx;
    no direct @mui/icons-material imports outside the components package

Version change: 1.4.0 → 1.5.0

Added sections:
  - XIII. Web Frontend Data Layer — all HTTP calls must go through datasource/mapper; no direct
    fetch/axios calls permitted in views, controllers, contexts, hooks, or services

Version change: 1.3.0 → 1.4.0

Added sections:
  - XI. Backend (Go) Standards

Version change: 1.2.0 → 1.3.0

Added sections:
  - X. Database Migrations

Version change: 1.1.0 → 1.2.0

Modified principles:
  - II. Strict MVC Layering: controllers MUST call service layer, never datasources directly

Added sections:
  - IX. Routing (go_router, routePath/displayName on every page, central AppRouter)

Version change: 1.0.0 → 1.1.0

Added sections:
  - VIII. Database Table Conventions

Templates reviewed:
  - data-model.md for 002-favorites-side-menu updated to comply

Version change: (none) → 1.0.0 (initial ratification)

Modified principles: N/A (initial)

Added sections:
  - Core Principles (I–VII)
  - Offline-First & Connectivity
  - Architecture Layering
  - Governance

Removed sections: N/A

Templates reviewed:
  - .specify/templates/plan-template.md ✅ compatible
  - .specify/templates/spec-template.md ✅ compatible
  - .specify/templates/tasks-template.md ✅ compatible

Deferred TODOs:
  - TODO(DEVELOPMENT_WORKFLOW): PR/review process and CI gates to be defined in a future amendment.
-->

# __DISPLAY_NAME__ Mobile Constitution

## Core Principles

### I. Component Reusability

All reusable UI elements MUST be extracted into shared components. Every UI element MUST be
designed for reuse before being placed inline in a screen. Files MUST NOT exceed 500 lines;
any file approaching this limit MUST be split by responsibility.

**Rationale**: Prevents duplication, reduces regression surface, and keeps screens readable.

### II. Strict MVC Layering

The codebase MUST enforce a three-layer separation:

- **Datasource layer**: All server and database interactions MUST go through a wrapper client
  (e.g., `HttpClient`, `DBClient`). Raw calls MUST NOT appear in services or controllers.
- **Service layer**: Business logic lives here. Services call datasources; they MUST NOT contain
  view logic or direct UI state.
- **Controller layer**: Owns data-load state and exposes it to the view. Controllers MUST NOT
  contain view-rendering logic. Views MUST NOT contain data-fetching or business logic.
  Controllers MUST call the service layer exclusively — direct datasource calls from a
  controller are not permitted.

**Rationale**: Clear boundaries make testing, refactoring, and onboarding predictable.
Services remain the single place where business rules live, making them independently
unit-testable without a controller or UI in the loop.

### III. Offline-First

The UI MUST operate exclusively off the local database or P2P/Bluetooth connections unless a
feature specification explicitly states otherwise. Server sync is a background operation; it MUST
NOT be a prerequisite for any UI interaction. Connectivity loss MUST NOT degrade core
functionality.

**Rationale**: Mine environments have unreliable or absent network coverage. Worker safety
depends on the app functioning without connectivity.

### IV. Internationalisation (i18n)

All user-facing text MUST be translated. Hardcoded strings in UI code are not permitted.
Translation keys MUST be defined before a screen is considered complete.

**Web frontend (control-center)**:
- All translation keys MUST be defined in `src/i18n/translations.json` before use.
- Keys MUST use hierarchical dot notation: `controlCenter.<domain>.<key>`
  (e.g. `controlCenter.manageUsers.title`). Shared cross-domain keys use `controlCenter.common.<key>`.
- JSX text content → wrap with `<TranslatedText i18nKey="..." />` from `@__SLUG__/components`.
- Prop strings (labels, placeholders, tooltips) → call `dictionary.translate('...')` via
  `const { dictionary } = useI18n()` from `@__SLUG__/components`.
- Raw string literals rendered as visible text are **prohibited** in pages, controllers,
  and shared components.

**Rationale**: Multilingual workforces require full localisation for safety-critical
instructions to be understood correctly.

### V. Rust Handles Document Compilation

All Typst document compilation MUST be performed by the Rust FFI library. Flutter code MUST NOT
implement document-generation logic. The Flutter layer is responsible only for invoking the
Rust interface and rendering results.

**Rationale**: Keeps the document engine portable, testable in isolation, and free of UI
framework constraints.

### VI. Standardised Theming & Gutters

All colours, typography, spacing, and gutters MUST be defined in the central theme. Inline
style values (magic numbers, hardcoded colours) are not permitted in widget code.

**Rationale**: Visual consistency and the ability to retheme globally without touching
individual screens.

### VII. Platform Support

The app MUST support both iOS and Android. Any feature that cannot be delivered on both
platforms simultaneously MUST be explicitly scoped and approved before work begins.

### VIII. Database Table Conventions

Every database table MUST include a `date_created` column (ISO-8601 UTC text, set on insert,
never updated). Tables whose rows are updatable MUST also include a `last_modified` column
(ISO-8601 UTC text, updated on every write). These columns are set by the datasource layer, not
by the database engine.

Display ordering of rows MUST use a meaningful data column (e.g. display name, timestamp)
rather than a dedicated `sort_order` integer unless an explicit user-controlled drag-to-reorder
feature is specified. When the natural sort key is a display name, order alphabetically
ascending.

Primary keys MUST be the column that best represents uniqueness for the entity:
- Use a natural unique key (e.g. route path, username) when one exists and is immutable after
  creation, rather than a surrogate integer.
- Use `INTEGER PRIMARY KEY AUTOINCREMENT` only when no stable natural key exists.

**Rationale**: Consistent audit columns make debugging sync conflicts straightforward.
Natural primary keys eliminate unnecessary id→entity lookups and make cross-table references
self-documenting.

### IX. Routing

The app MUST use go_router as the single routing system. Every page (screen) MUST declare a
static `routePath` constant (e.g. `static const routePath = '/profile'`) and a static
`displayName` constant (e.g. `static const displayName = 'Profile'`). All routes MUST be
registered in the central `AppRouter` at startup. No `Navigator.push` or `Navigator.pushNamed`
calls are permitted outside of `AppRouter`; all navigation MUST go through go_router's
`context.go(...)` or `context.push(...)`.

**Rationale**: A single declarative router makes deep-linking, the favorites system, and future
web/desktop support trivial. Co-locating `routePath` and `displayName` on the page class
eliminates the need for a separate registry and makes the relationship between a route string
and its human-readable label impossible to get out of sync.

### X. Database Migrations

All schema changes MUST be managed via Liquibase. Migration files MUST live in
`database/migrations/` and MUST be registered in the master changelog before the change
is considered complete.

**File naming**: `YYYYMMDD_NNN_description.sql` where `NNN` is a zero-padded sequence number
that resets to `001` each day (e.g. `20260424_001_create_users.sql`).

**Direction**: Migrations are forward-only. Rollback scripts are not required.

**Destructive DDL**: Any migration containing a `DROP TABLE`, `DROP COLUMN`, or other
operation with potential data loss MUST include an explicit SQL comment at the top of the
file explaining the justification (e.g. `-- Dropping legacy_tokens: superseded by oauth_tokens, no active rows in any env`).

**Mobile migrations**: Flutter SQLite migrations (in `mobile/lib/core/db/migrations/`) MUST
follow the same `YYYYMMDD_NNN_description.dart` naming convention. Function names MUST use
the camelCase equivalent: `migrationYYYYMMDDNNNDescription()`.

**Source of truth**: Migration files are the current source of truth for schema state.
A canonical environment database will eventually take over this role; when that transition
occurs this section will be amended.

**Rationale**: Consistent naming and a required master-changelog registration prevent
out-of-order or orphaned migrations. Requiring justification comments on destructive changes
creates a lightweight audit trail without introducing process overhead.

### XI. Backend (Go) Standards

**Architecture**: The backend follows Domain-Driven Design. Each domain package MUST contain:
`controller`, `service`, `datasource`, `mapper`, `models`, and a `routes` file. A global
`routes` package aggregates all domain routes. No business logic is permitted outside the
service layer; no database/network calls are permitted outside the datasource layer.

**HTTP Router**: `gorilla/mux` is the standard router. All routes MUST be registered through
the global routes aggregator.

**Error Handling**: Handlers and services MUST return standard `error` values. A central
middleware is responsible for translating errors into HTTP responses. Handlers MUST NOT write
error responses directly. This convention anticipates a future move to typed errors that map
to specific HTTP status codes; when that transition occurs, the middleware MUST be updated to
switch on error type.

**Logging**: `zap` is the standard logging library. Log level MUST be configured via
environment variable. HTTP requests MUST be logged at `DEBUG` level. Passwords and any
Personally Identifiable Information (PII) MUST NOT appear in logs under any circumstances —
this applies to request bodies, query parameters, headers, and error messages.

**Rationale**: DDD boundaries keep domains independently testable and prevent cross-domain
coupling. Centralised error handling ensures consistent HTTP response shapes. Structured
JSON logging via zap integrates cleanly with GCP Cloud Logging.

### XII. Icon Usage

All icons used anywhere in the web frontend (control-center or any web app) MUST be imported
exclusively from `@__SLUG__/components`. Direct imports from `@mui/icons-material` or any
other icon library are not permitted outside of `web/apps/components`.

When a new icon is needed, it MUST first be added as a named re-export in
`web/apps/components/src/elements/icons/Icons.tsx`, then imported from `@__SLUG__/components`
at the point of use. The Icons file is the single registry of all icons available to web apps.

**Rationale**: Centralising icon imports means the underlying icon library can be swapped or
upgraded in one place. It also prevents icon name drift where different files import the same
conceptual icon under different names.

### XIII. Web Frontend Data Layer

The web frontend MUST enforce the same layered architecture as the backend and mobile app.
All server interactions MUST go through a dedicated **datasource** object. No `fetch`, `axios`,
or any other HTTP call is permitted directly in a view, controller, context, hook, or service.

**Datasource layer**: Each domain MUST have a datasource file (e.g.
`src/domains/auth/datasource.ts`) responsible for all HTTP calls within that domain.
Datasources MUST NOT contain business logic.

**Mapper layer**: Every datasource response MUST pass through a **mapper** before being
returned. Mappers translate raw server objects to typed UI models. Mappers MUST be pure
functions with no side effects. Datasource return types MUST be UI models, not raw API
shapes.

**Service layer**: Business logic lives in a service. Services call datasources; they MUST NOT
make HTTP calls directly.

**Controllers / context**: Controllers and context providers call services or datasources.
They MUST NOT contain HTTP calls or raw response parsing.

**Directory structure**:
```
src/domains/<domain>/
  datasource.ts   ← HTTP calls only
  mapper.ts       ← raw → UI model translation
  service.ts      ← business logic
  models.ts       ← UI-layer type definitions
```

**Rationale**: Decouples UI components from the network layer, makes server contract changes
easy to contain in one file, and makes the mapping between server shapes and UI models
explicit and testable.

### XV. Server-Side Pagination & Filtering

All bulk list endpoints (fetching more than one resource, not by ID) MUST support server-side
pagination and filtering via a `POST /<resource>/list` endpoint. Plain `GET` endpoints that
return unbounded lists are **prohibited**.

**Request body** (shared across all domains):
```json
{
  "page": 0,
  "pageSize": 25,
  "sort": "fieldName",
  "sortDir": "asc",
  "filters": [
    { "field": "fieldName", "op": "eq|contains|gt|lt|gte|lte", "value": "..." }
  ]
}
```

**Response envelope** (Go generic, reused across all domains):
```go
type PagedResponse[T any] struct {
    Data     []T `json:"data"`
    Total    int `json:"total"`
    Page     int `json:"page"`
    PageSize int `json:"pageSize"`
}
```

**Field mapping**: Each domain MUST define a `columnMap` that translates filter/sort field
names (as exposed in the API) to database column names. Unknown fields MUST be rejected with
a 400. Internal column names MUST NOT be accepted directly — this prevents schema leakage.

**Frontend**:
- The `Table` component manages pagination/sort/filter UI state internally and exposes a single
  `onParamsChange` callback with the aggregate state.
- Pages store table params in the URL via `useServerTableParams` for deep-linking.
- The `Table` component debounces search input (300ms) and resets to page 0 on search or sort change.
- Pages only manage: calling the datasource, passing `rows`, `rowCount`, and `loading` back to the table.

### XIV. Web Form Inputs

All user-facing form inputs in the web frontend MUST use the form components from
`@__SLUG__/components`. Raw HTML elements (`<input>`, `<select>`, `<textarea>`) are
**prohibited** in pages, controllers, and shared components.

**Required components** (from `@__SLUG__/components`):
- Text fields → `TextInput`
- File / image selection → `FilePicker`
- Other form primitives → use or add to the components package before using a raw element

**Adding new input types**: If a required input type does not yet exist in the components
package, it MUST be created there first and exported, then consumed. Do not reach for raw
HTML elements as a shortcut.

**Rationale**: Centralises theming, validation UX, and accessibility in one place.
Raw inputs bypass the design system and produce inconsistent styling across the app.

## Offline-First & Connectivity

- Local database is the source of truth for all UI state.
- Server sync transfers data to/from the local DB; sync failures MUST be handled gracefully
  and surfaced to the user without blocking the UI.
- P2P and Bluetooth communication pathways are first-class citizens alongside the local DB.
- Features that require live server access MUST be explicitly marked as such in their spec.

## Architecture Layering

```
View  ←→  Controller  ←→  Service  ←→  Datasource (HttpClient / DBClient)
```

- Each layer communicates only with the layer directly adjacent to it.
- Data-load states (loading, success, error, empty) are defined and owned by the Controller.
- Services encapsulate all business rules; they are independently unit-testable.
- Datasources are the only code permitted to open network connections or database handles.

## Governance

This constitution supersedes all other informal practices. Amendments require:

1. A written proposal describing the change and its rationale.
2. Documentation of any migration plan for existing code.
3. Version increment per semantic versioning rules below.

**Versioning policy**:
- MAJOR: Backward-incompatible principle removal or redefinition.
- MINOR: New principle or section added, or material expansion of existing guidance.
- PATCH: Clarifications, wording fixes, non-semantic refinements.

All implementation plans and specs MUST include a Constitution Check confirming compliance
with the principles above before work begins.

TODO(DEVELOPMENT_WORKFLOW): PR review requirements, required CI gates, and branch naming
conventions to be defined and added as a future MINOR amendment.

---

## XVI. Testing Standards

### Unit Tests

- Every project (`web/apps/components`, `web/apps/control-center`, `backend/__SLUG__`, `mobile/`) MUST have a unit test suite runnable with a single command.
- Each suite MUST report line/statement coverage as a percentage.
- Minimum coverage threshold: **85% lines** (web, mobile) or **85% statements** (Go).
- A pre-push git hook (`.husky/pre-push`, installed automatically via `npm install` at repo root) enforces this threshold. Bypassing with `--no-verify` requires explicit team approval.

### Integration Tests

- All API integration tests live at `test/integration/` and are written in TypeScript (Vitest, `environment: 'node'`).
- Every registered API endpoint MUST have at least one happy-path test and one error-path test.
- **Data helpers are mandatory**: each domain exposes helper functions at `test/integration/helpers/<domain>.ts` that create test data via real API calls with sensible defaults and override support. Hand-rolled test data is prohibited.
- Every test that creates data MUST call `deleteUser()` / `deleteUsers()` in `afterEach` / `afterAll` teardown, even on failure. Orphaned test data is a failing condition.
- The suite MUST be environment-agnostic: configuration is `BASE_URL` + `TEST_API_KEY` only; no environment-specific code changes required.

### Web E2E Tests

- Playwright tests live at `web/apps/control-center/test/e2e/`.
- Tests that require a user account MUST call `createUser()` from the integration helpers in setup and `deleteUser()` in teardown — no shared or pre-existing test accounts.
- Login and logout flows (happy path + common sad paths) are required coverage.
- Test spec files MUST be named with a numeric prefix followed by a descriptive name, e.g. `01-auth.spec.ts`, `02-login-sad-paths.spec.ts`. Suites are ordered and discovered by this prefix.

### Mobile E2E Tests

- Appium/WebdriverIO tests live at `test/mobile/e2e/`, written in TypeScript.
- Tests MUST import data helpers from `test/integration/helpers/` for all user creation and teardown.
- Every mobile test that requires a user account creates and destroys that account — no shared accounts.
- Test spec files MUST follow the same numeric-prefix naming convention as Playwright specs, e.g. `01-login.spec.ts`, `02-logout.spec.ts`.

### Test-Only APIs

- Test-only backend endpoints are always registered; they are not hidden behind a feature flag.
- Access is controlled exclusively by the `X-Test-Api-Key` header. If `TEST_API_KEY` env var is unset or empty on the server, all requests to test endpoints return `403 Forbidden`.
- No session cookie or user role is required beyond the key.
- Test-only APIs MUST be usable by integration data helpers to enable clean teardown in any environment.

### Widgetbook Catalog Coverage

- The `mobile/widgetbook/` Flutter project is the Storybook-equivalent component catalog for
  reusable widgets and reusable screen/navigation-shell components. It documents widgets from
  `mobile/lib/components/**`; it MUST NOT document single-purpose app screens.
- Every widget file added or changed under `mobile/lib/components/<sub-path>/<name>.dart` MUST
  have a corresponding catalog use-case file at
  `mobile/widgetbook/lib/use_cases/<sub-path>/<name>_use_case.dart`.
- This is enforced by a pre-push hook step (`.husky/pre-push`, "widgetbook catalog coverage"
  section) that blocks the push if any changed widget is missing its use-case file. Bypassing
  with `--no-verify` requires explicit team approval, consistent with the unit-test coverage
  rule above.
- CI enforcement of this rule MUST be added once a CI pipeline exists for this repo; until then,
  the pre-push hook is the sole enforcement mechanism.

**Version**: 2.1.0 | **Ratified**: 2026-04-22 | **Last Amended**: 2026-07-27
