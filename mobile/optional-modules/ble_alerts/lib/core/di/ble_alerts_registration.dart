import 'package:flutter/material.dart';
import 'package:get_it/get_it.dart';

import '../../../components/elements/navigation/HamburgerMenu.dart';
import '../../../components/elements/notifications/alert_badge.dart';
import '../../../components/elements/notifications/alerts_panel.dart';
import '../../../components/navigation/app_shell.dart';
import '../../../controllers/active_alerts_controller.dart';
import '../../../datasources/active_alerts_datasource.dart';
import '../../../screens/settings/receive_data_screen.dart';
import '../../../screens/settings/send_data_screen.dart';
import '../../../services/active_alerts_service.dart';
import '../../../services/ble_receive_service.dart';
import '../../../services/ble_send_service.dart';
import '../db/app_migration.dart';
import '../db/database_client.dart';
import '../db/migrations/20260424_001_active_alerts.dart';
import '../router/app_router.dart';
import '../router/ble_alerts_routes.dart';

/// Migrations this module needs — assign to
/// `ServiceLocator.extraMigrations` before `ServiceLocator.setup()` runs.
final List<AppMigration> bleAlertsMigrations = [migration20260424001ActiveAlerts()];

/// Wires this module's routes, UI slots, and services into the base app.
/// Assign to `ServiceLocator.extraSetupSteps = [registerBleAlerts]` before
/// `ServiceLocator.setup()` runs.
Future<void> registerBleAlerts(DatabaseClient client) async {
  AppRouter.extraSettingsRoutes = bleAlertsRoutes;
  AppShell.extraTitles = {
    '/auth/settings/receive-data': ReceiveDataScreen.displayName,
    '/auth/settings/send-data': SendDataScreen.displayName,
  };
  HamburgerMenu.extraMenuItemsBuilder = (context) => [
        ListTile(
          leading: AlertBadge(child: const Icon(Icons.notifications_outlined)),
          title: const Text('Alerts'),
          onTap: () {
            Navigator.of(context).pop();
            AlertsPanel.show(context);
          },
        ),
        const Divider(height: 1),
      ];

  final activeAlertsDatasource = ActiveAlertsDatasource(client);
  GetIt.instance.registerSingleton<ActiveAlertsDatasource>(activeAlertsDatasource);

  final activeAlertsService = ActiveAlertsService(activeAlertsDatasource);
  GetIt.instance.registerSingleton<ActiveAlertsService>(activeAlertsService);

  final activeAlertsController = ActiveAlertsController(activeAlertsService);
  await activeAlertsController.init();
  GetIt.instance.registerSingleton<ActiveAlertsController>(activeAlertsController);

  GetIt.instance.registerSingleton<BleReceiveService>(BleReceiveService());
  GetIt.instance.registerSingleton<BleSendService>(BleSendService());
}
