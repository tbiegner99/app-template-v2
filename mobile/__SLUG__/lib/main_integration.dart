import 'package:appium_flutter_server/appium_flutter_server.dart';

import 'App.dart';

void main() async {
  await initializeTest(callback: () async => bootstrap());
}
