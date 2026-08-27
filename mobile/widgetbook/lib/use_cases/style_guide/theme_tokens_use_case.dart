import 'package:flutter/material.dart';
import 'package:mobile/palette.dart';
import 'package:widgetbook_annotation/widgetbook_annotation.dart' as widgetbook;

Widget _elevationRow(String name, double value) {
  return Padding(
    padding: const EdgeInsets.symmetric(vertical: 8),
    child: Row(
      children: [
        SizedBox(width: 120, child: Text(name)),
        Container(
          width: 96,
          height: 32,
          decoration: BoxDecoration(
            color: Colors.white,
            boxShadow: value == 0
                ? null
                : [BoxShadow(color: Colors.black26, blurRadius: value, offset: Offset(0, value / 2))],
          ),
        ),
        const SizedBox(width: 12),
        Text('${value}px'),
      ],
    ),
  );
}

/// Renders the app's elevation scale from mobile/lib/palette.dart's
/// `Elevation` class, independent of any specific widget (FR-006).
@widgetbook.UseCase(name: 'Elevation', type: AppElevation)
Widget themeTokensUseCase(BuildContext context) {
  return Padding(
    padding: const EdgeInsets.all(16),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _elevationRow('none', AppElevation.none),
        _elevationRow('low', AppElevation.low),
        _elevationRow('medium', AppElevation.medium),
        _elevationRow('high', AppElevation.high),
        _elevationRow('overlay', AppElevation.overlay),
      ],
    ),
  );
}
