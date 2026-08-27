import 'package:go_router/go_router.dart';

import '../../screens/settings/receive_data_screen.dart';
import '../../screens/settings/send_data_screen.dart';

/// Extra routes nested under '/auth/settings', contributed by the ble_alerts
/// module. Assign to `AppRouter.extraSettingsRoutes` before `AppRouter.router`
/// is first accessed (see service_locator.full.dart).
final List<RouteBase> bleAlertsRoutes = [
  GoRoute(
    path: 'receive-data',
    name: ReceiveDataScreen.displayName,
    builder: (context, state) => const ReceiveDataScreen(),
  ),
  GoRoute(
    path: 'send-data',
    name: SendDataScreen.displayName,
    builder: (context, state) => const SendDataScreen(),
  ),
];
