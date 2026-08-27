# Widgetbook Catalog

Storybook-equivalent component catalog for the `mobile` Flutter app. Documents reusable
widgets and reusable screen/navigation-shell components for developers and designers. See
`specs/012-widgetbook-docs/` at the repo root for the full spec, plan, and task history.

## Run

```bash
cd mobile/widgetbook
flutter pub get
flutter run -d chrome   # or an available desktop device
```

## Add a widget to the catalog

1. Build/modify your widget as usual under `mobile/lib/components/<sub-path>/<widget_name>.dart`.
2. Create `mobile/widgetbook/lib/use_cases/<sub-path>/<widget_name>_use_case.dart` with one or
   more `@UseCase` functions (see existing files under `lib/use_cases/` for examples).
3. Regenerate the catalog nav tree:

   ```bash
   dart run build_runner build --delete-conflicting-outputs --force-jit
   ```

   `--force-jit` is required — `mobile`'s dependency tree includes packages using Dart's native
   build-hooks feature, which blocks `build_runner`'s default AOT compile path on current Dart
   SDKs.

4. `flutter run` again to see it in the catalog.

A pre-push git hook checks that new/changed widgets under `mobile/lib/components/**` have a
matching use-case file before allowing a push — see `.husky/pre-push` and
`specs/012-widgetbook-docs/contracts/`.

## Excluded by design: app-specific widgets

The following widgets are **not cataloged**, and this isn't a gap to fill later — they resolve
`ServiceLocator`/`GetIt` singletons directly inside `build()` (or a field initializer) and own
business logic/data-fetching inline, rather than being presentational ("dumb") widgets that
receive data/callbacks as constructor parameters. That coupling is exactly what the codebase's
own layering rule argues against (constitution principle II — views must not own business logic
or fetch their own data), and it's also why they can't be rendered in isolation without a full
mock of the app's DI graph.

- `HamburgerMenu`, `AppShell` (`mobile/lib/components/elements/navigation/`,
  `mobile/lib/components/navigation/`) — `HamburgerMenu` resolves
  `ServiceLocator.get<NavController>()` synchronously in a field initializer, which fails
  outside the normal per-widget build-error boundary and previously hung the entire catalog app
  rather than failing scoped to just that entry. `AppShell` embeds `HamburgerMenu` as its
  drawer and additionally depends on `GoRouterState`, so it inherits the same problem.
- `AlertBadge`, `AlertsPanel` (`mobile/lib/components/elements/notifications/`) — both resolve
  `ActiveAlertsController` via `ServiceLocator`/`GetIt` directly inside `build()`.

If any of these are refactored to receive their data/callbacks as constructor parameters
(controller owns the lookup, widget stays presentational), they'd become reasonable catalog
candidates and this exclusion should be revisited.
