import 'package:flutter/material.dart';
import 'package:mobile/palette.dart';
import 'package:widgetbook_annotation/widgetbook_annotation.dart' as widgetbook;

class _Swatch extends StatelessWidget {
  final String label;
  final Color color;

  const _Swatch({required this.label, required this.color});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(width: 96, height: 48, color: color, margin: const EdgeInsets.only(bottom: 4)),
        Text(label, style: const TextStyle(fontSize: 12)),
      ],
    );
  }
}

Widget _scaleRow(String name, Map<int, Color> scale) {
  return Padding(
    padding: const EdgeInsets.symmetric(vertical: 8),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(name, style: const TextStyle(fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        Wrap(
          spacing: 12,
          children: scale.entries.map((e) => _Swatch(label: '${e.key}', color: e.value)).toList(),
        ),
      ],
    ),
  );
}

/// Renders the app's design-token color palette (AppPalette scales and
/// SemanticColors) as a style-guide reference, independent of any specific
/// widget (FR-006).
@widgetbook.UseCase(name: 'Palette', type: AppPalette)
Widget colorsUseCase(BuildContext context) {
  return SingleChildScrollView(
    padding: const EdgeInsets.all(16),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _scaleRow('navy', AppPalette.navy),
        _scaleRow('orange', AppPalette.orange),
        _scaleRow('green', AppPalette.green),
        _scaleRow('amber', AppPalette.amber),
        _scaleRow('red', AppPalette.red),
        _scaleRow('sky', AppPalette.sky),
        const Divider(height: 32),
        Text('Semantic colors', style: Theme.of(context).textTheme.titleMedium),
        const SizedBox(height: 8),
        Wrap(
          spacing: 12,
          children: [
            _Swatch(label: 'primary', color: SemanticColors.primary),
            _Swatch(label: 'secondary', color: SemanticColors.secondary),
            _Swatch(label: 'success', color: SemanticColors.success),
            _Swatch(label: 'warning', color: SemanticColors.warning),
            _Swatch(label: 'error', color: SemanticColors.error),
            _Swatch(label: 'info', color: SemanticColors.info),
          ],
        ),
      ],
    ),
  );
}
