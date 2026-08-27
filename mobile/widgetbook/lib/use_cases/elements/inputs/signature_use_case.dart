import 'package:flutter/material.dart';
import 'package:mobile/components/elements/inputs/Signature.dart';
import 'package:widgetbook/widgetbook.dart';
import 'package:widgetbook_annotation/widgetbook_annotation.dart' as widgetbook;

@widgetbook.UseCase(name: 'Default', type: SignatureInput)
Widget signatureInputDefault(BuildContext context) {
  return SignatureInput(
    height: context.knobs.double.slider(label: 'Height', initialValue: 200, min: 100, max: 400),
    showUndo: context.knobs.boolean(label: 'Show undo', initialValue: true),
  );
}
