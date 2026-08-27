import 'package:flutter/material.dart';
import 'package:mobile/components/elements/buttons/buttons.dart';
import 'package:widgetbook/widgetbook.dart';
import 'package:widgetbook_annotation/widgetbook_annotation.dart' as widgetbook;

@widgetbook.UseCase(name: 'Default', type: PrimaryButton)
Widget primaryButtonDefault(BuildContext context) {
  final enabled = context.knobs.boolean(label: 'Enabled', initialValue: true);
  return PrimaryButton(
    onPressed: enabled ? () {} : null,
    enabled: enabled,
    child: Text(context.knobs.string(label: 'Label', initialValue: 'Submit')),
  );
}

@widgetbook.UseCase(name: 'Disabled', type: PrimaryButton)
Widget primaryButtonDisabled(BuildContext context) {
  return const PrimaryButton(onPressed: null, enabled: false, child: Text('Submit'));
}

@widgetbook.UseCase(name: 'With icon', type: PrimaryButton)
Widget primaryButtonWithIcon(BuildContext context) {
  return PrimaryButton(onPressed: () {}, icon: Icons.check, child: const Text('Confirm'));
}

@widgetbook.UseCase(name: 'Default', type: SecondaryButton)
Widget secondaryButtonDefault(BuildContext context) {
  return SecondaryButton(
    onPressed: () {},
    child: Text(context.knobs.string(label: 'Label', initialValue: 'Cancel')),
  );
}

@widgetbook.UseCase(name: 'Default', type: DestructiveButton)
Widget destructiveButtonDefault(BuildContext context) {
  return DestructiveButton(
    onPressed: () {},
    child: Text(context.knobs.string(label: 'Label', initialValue: 'Delete')),
  );
}

@widgetbook.UseCase(name: 'Default', type: WarningButton)
Widget warningButtonDefault(BuildContext context) {
  return WarningButton(
    onPressed: () {},
    child: Text(context.knobs.string(label: 'Label', initialValue: 'Proceed with caution')),
  );
}
