import 'package:flutter/material.dart';
import 'package:mobile/components/elements/inputs/DateSelector.dart';
import 'package:widgetbook/widgetbook.dart';
import 'package:widgetbook_annotation/widgetbook_annotation.dart' as widgetbook;

@widgetbook.UseCase(name: 'Date only', type: DateSelector)
Widget dateSelectorDateOnly(BuildContext context) {
  return Padding(
    padding: const EdgeInsets.all(16),
    child: DateSelector(
      labelText: context.knobs.string(label: 'Label', initialValue: 'Inspection date'),
      onDateSelected: (_) {},
    ),
  );
}

@widgetbook.UseCase(name: 'Date and time', type: DateSelector)
Widget dateSelectorWithTime(BuildContext context) {
  return DateSelector(labelText: 'Reported at', showTime: true, onDateSelected: (_) {});
}
