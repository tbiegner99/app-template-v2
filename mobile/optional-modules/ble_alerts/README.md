# ble_alerts optional module

Opt-in bundle for hardware BLE communication + a persisted "active alerts" feed
driven by push notifications. Excluded from the base template because it
assumes a specific hardware wire protocol (see `services/__SLUG___packet.dart`).

## Composition points used (all in the base template already)

- `AppRouter.extraSettingsRoutes` (`core/router/app_router.dart`)
- `AppShell.extraTitles` (`components/navigation/app_shell.dart`)
- `HamburgerMenu.extraMenuItemsBuilder` (`components/elements/navigation/HamburgerMenu.dart`)
- `SettingsScreen.extraTilesBuilder` (`screens/settings/settings_screen.dart`)
- `ServiceLocator.extraMigrations` / `ServiceLocator.extraSetupSteps` (`core/di/service_locator.dart`)

`notification_service.dart` is the one exception: Firebase's background
message handler runs in a separate isolate that does not share static state
with the main isolate, so a runtime-settable hook would silently never fire
in the backgrounded case. `core/notifications/notification_service.full.dart`
is a whole-file replacement for that reason, not composed.

## Applying this module (what create-app.sh does when opted in)

1. Copy `lib/**` (excluding `*.full.dart` files) into `mobile/<slug>/lib/**`
   at the matching relative path. This includes `core/di/ble_alerts_registration.dart`
   and `core/router/ble_alerts_routes.dart`, which are plain additions, not
   overwrites.
2. Overwrite `core/notifications/notification_service.dart` with
   `core/notifications/notification_service.full.dart` (strip the `.full`
   suffix) — see rationale above.
3. In `mobile/<slug>/lib/App.dart`, insert before the
   `// __OPTIONAL_MODULE_REGISTRATION__` marker line:
   ```dart
   ServiceLocator.extraMigrations = bleAlertsMigrations;
   ServiceLocator.extraSetupSteps = [registerBleAlerts];
   ```
   and add `import 'core/di/ble_alerts_registration.dart';` to its imports.
4. In `mobile/<slug>/pubspec.yaml`, uncomment the two lines between
   `__BEGIN_OPTIONAL_BLE_ALERTS__` / `__END_OPTIONAL_BLE_ALERTS__` markers
   (`flutter_blue_plus`, `bluetooth_low_energy`).
5. Merge `assets/i18n/*.json` here into `mobile/<slug>/assets/i18n/*.json`
   (adds back `receiveData.*`, `sendData.*`, `settings.receiveData`,
   `settings.sendData` keys removed from the base template).
6. Delete the `optional-modules/` directory from the generated project.
