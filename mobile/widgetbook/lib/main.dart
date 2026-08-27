import 'dart:io' show Platform;

import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter/material.dart';
import 'package:mobile/dark_theme.dart';
import 'package:mobile/theme.dart';
import 'package:widgetbook/widgetbook.dart';
import 'package:widgetbook_annotation/widgetbook_annotation.dart' as widgetbook;

import 'main.directories.g.dart';

// A real device *is* the viewport being simulated, so the addon only makes
// sense when the catalog itself is running on a larger desktop/web surface.
bool get _showViewportAddon =>
    kIsWeb || !(Platform.isAndroid || Platform.isIOS);

@widgetbook.App()
void main() {
  runApp(const WidgetbookApp());
}

class WidgetbookApp extends StatelessWidget {
  const WidgetbookApp({super.key});

  @override
  Widget build(BuildContext context) {
    return Widgetbook.material(
      directories: directories,
      addons: [
        MaterialThemeAddon(
          themes: [
            WidgetbookTheme(name: 'Light', data: muiTheme),
            WidgetbookTheme(name: 'Dark', data: muiDarkTheme),
          ],
        ),
        if (_showViewportAddon)
          ViewportAddon([
            IosViewports.iPhone13,
            IosViewports.iPad,
          ]),
      ],
    );
  }
}
