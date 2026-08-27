import 'package:flutter/material.dart';
import 'package:mobile/components/elements/containers/Card.dart';
import 'package:widgetbook/widgetbook.dart';
import 'package:widgetbook_annotation/widgetbook_annotation.dart' as widgetbook;

@widgetbook.UseCase(name: 'Short content', type: CustomCard)
Widget cardShortContent(BuildContext context) {
  return CustomCard(child: Text(context.knobs.string(label: 'Body', initialValue: 'Short card body.')));
}

@widgetbook.UseCase(name: 'Long content', type: CustomCard)
Widget cardLongContent(BuildContext context) {
  return CustomCard(
    child: Text(
      context.knobs.string(
        label: 'Body',
        initialValue:
            'A much longer card body that wraps across multiple lines to verify the card '
            'expands to fit its content without clipping or overflowing.',
      ),
    ),
  );
}
