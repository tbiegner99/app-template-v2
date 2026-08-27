import 'package:flutter/material.dart';
import 'package:mobile/theme.dart';
import 'package:widgetbook_annotation/widgetbook_annotation.dart' as widgetbook;

Widget _row(String name, TextStyle? style) {
  return Padding(
    padding: const EdgeInsets.symmetric(vertical: 4),
    child: Row(
      crossAxisAlignment: CrossAxisAlignment.baseline,
      textBaseline: TextBaseline.alphabetic,
      children: [
        SizedBox(width: 140, child: Text(name, style: const TextStyle(fontSize: 12, color: Colors.grey))),
        Expanded(child: Text('The quick brown fox', style: style)),
      ],
    ),
  );
}

/// Renders the app's typography scale directly from mobile/lib/theme.dart's
/// `muiTheme.textTheme`, independent of any specific widget (FR-006).
@widgetbook.UseCase(name: 'Type scale', type: ThemeData)
Widget typographyScaleUseCase(BuildContext context) {
  final textTheme = muiTheme.textTheme;
  return SingleChildScrollView(
    padding: const EdgeInsets.all(16),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _row('displayLarge', textTheme.displayLarge),
        _row('displayMedium', textTheme.displayMedium),
        _row('displaySmall', textTheme.displaySmall),
        _row('headlineLarge', textTheme.headlineLarge),
        _row('headlineMedium', textTheme.headlineMedium),
        _row('headlineSmall', textTheme.headlineSmall),
        _row('titleLarge', textTheme.titleLarge),
        _row('titleMedium', textTheme.titleMedium),
        _row('titleSmall', textTheme.titleSmall),
        _row('bodyLarge', textTheme.bodyLarge),
        _row('bodyMedium', textTheme.bodyMedium),
        _row('bodySmall', textTheme.bodySmall),
        _row('labelLarge', textTheme.labelLarge),
        _row('labelMedium', textTheme.labelMedium),
        _row('labelSmall', textTheme.labelSmall),
      ],
    ),
  );
}
