import 'package:flutter_test/flutter_test.dart';
import 'package:widgetbook_catalog/main.dart';

void main() {
  testWidgets('Widgetbook catalog boots without error', (tester) async {
    await tester.pumpWidget(const WidgetbookApp());
    await tester.pumpAndSettle();

    expect(tester.takeException(), isNull);
  });
}
