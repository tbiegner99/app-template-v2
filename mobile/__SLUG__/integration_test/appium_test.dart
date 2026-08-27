import 'package:appium_flutter_server/appium_flutter_server.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/App.dart';
import 'package:mobile/core/di/service_locator.dart';
import 'package:mobile/controllers/feature_flag_controller.dart';
import 'package:mobile/core/notifications/notification_service.dart';

void main() {
  initializeTest(callback: (WidgetTester tester) async {
    WidgetsFlutterBinding.ensureInitialized();
    await ServiceLocator.setup();
    final flags = ServiceLocator.get<FeatureFlagController>();
    if (flags.isEnabled('push_notifications')) {
      await NotificationService.init();
    }
    await tester.pumpWidget(const MyApp());
    await tester.pumpAndSettle();
  });
}
