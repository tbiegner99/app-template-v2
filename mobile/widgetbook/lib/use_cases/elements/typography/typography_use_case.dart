import 'package:flutter/material.dart';
import 'package:mobile/components/elements/typography/typography.dart';
import 'package:widgetbook/widgetbook.dart';
import 'package:widgetbook_annotation/widgetbook_annotation.dart' as widgetbook;

const _sampleText = 'The quick brown fox jumps over the lazy dog';

@widgetbook.UseCase(name: 'Scale', type: DisplayLarge)
Widget typographyScale(BuildContext context) {
  final text = context.knobs.string(label: 'Sample text', initialValue: _sampleText);
  return SingleChildScrollView(
    padding: const EdgeInsets.all(16),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        DisplayLarge(rawText: text),
        DisplayMedium(rawText: text),
        DisplaySmall(rawText: text),
        HeadlineLarge(rawText: text),
        HeadlineMedium(rawText: text),
        HeadlineSmall(rawText: text),
        TitleLarge(rawText: text),
        TitleMedium(rawText: text),
        TitleSmall(rawText: text),
        BodyLarge(rawText: text),
        BodyMedium(rawText: text),
        BodySmall(rawText: text),
        LabelLarge(rawText: text),
        LabelMedium(rawText: text),
        LabelSmall(rawText: text),
      ],
    ),
  );
}
