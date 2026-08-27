import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/palette.dart';

void main() {
  group('AppPalette', () {
    test('navy palette has correct shade 500', () {
      expect(AppPalette.navy[500], const Color(0xFF3c5e8e));
    });

    test('orange palette has correct shade 500', () {
      expect(AppPalette.orange[500], const Color(0xFFf97316));
    });

    test('navy palette contains all expected shades', () {
      for (final shade in [50, 100, 200, 300, 400, 500, 600, 700, 800, 900]) {
        expect(AppPalette.navy[shade], isNotNull, reason: 'Missing shade $shade');
      }
    });

    test('orange palette contains all expected shades', () {
      for (final shade in [50, 100, 200, 300, 400, 500, 600, 700, 800, 900]) {
        expect(AppPalette.orange[shade], isNotNull, reason: 'Missing shade $shade');
      }
    });
  });
}
