import 'package:flutter/material.dart';
import 'package:mobile/components/elements/navigation/BottomNavBar.dart';
import 'package:widgetbook/widgetbook.dart';
import 'package:widgetbook_annotation/widgetbook_annotation.dart' as widgetbook;

@widgetbook.UseCase(name: 'Default', type: BottomNavBar)
Widget bottomNavBarDefault(BuildContext context) {
  final index = context.knobs.int.slider(label: 'Selected index', initialValue: 0, min: 0, max: 2);
  return Scaffold(bottomNavigationBar: BottomNavBar(selectedIndex: index, onItemTapped: (_) {}));
}
