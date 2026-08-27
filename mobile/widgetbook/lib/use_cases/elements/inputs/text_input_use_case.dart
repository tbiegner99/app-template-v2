import 'package:flutter/material.dart';
import 'package:mobile/components/elements/inputs/TextInput.dart';
import 'package:widgetbook/widgetbook.dart';
import 'package:widgetbook_annotation/widgetbook_annotation.dart' as widgetbook;

@widgetbook.UseCase(name: 'Default', type: TextInput)
Widget textInputDefault(BuildContext context) {
  return Padding(
    padding: const EdgeInsets.all(16),
    child: TextInput(
      labelText: context.knobs.string(label: 'Label', initialValue: 'Name'),
      hintText: context.knobs.string(label: 'Hint', initialValue: 'Enter your name'),
    ),
  );
}

@widgetbook.UseCase(name: 'Error state', type: TextInput)
Widget textInputError(BuildContext context) {
  return Padding(
    padding: const EdgeInsets.all(16),
    child: Form(
      autovalidateMode: AutovalidateMode.always,
      child: TextInput(
        labelText: 'Name',
        value: '',
        validator: (_) => context.knobs.string(label: 'Error message', initialValue: 'This field is required'),
      ),
    ),
  );
}

@widgetbook.UseCase(name: 'Obscured (password)', type: TextInput)
Widget textInputObscured(BuildContext context) {
  return const Padding(
    padding: EdgeInsets.all(16),
    child: TextInput(labelText: 'Password', obscureText: true),
  );
}
