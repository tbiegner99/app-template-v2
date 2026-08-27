import 'package:flutter/material.dart';
import 'package:mobile/components/elements/inputs/DateRangeSelector.dart';
import 'package:widgetbook/widgetbook.dart';
import 'package:widgetbook_annotation/widgetbook_annotation.dart' as widgetbook;

@widgetbook.UseCase(name: 'Default', type: DateRangeSelector)
Widget dateRangeSelectorDefault(BuildContext context) {
  return DateRangeSelector(
    labelText: context.knobs.string(label: 'Label', initialValue: 'Reporting period'),
    onDateRangeSelected: (_) {},
  );
}
