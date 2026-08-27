import 'package:flutter/material.dart';

class DropdownInput<T> extends StatelessWidget {
  final String labelText;
  final String? hintText;
  final T? selectedValue;
  final List<T> items;
  final Function(T?) onChanged;
  final String Function(T)? itemToString;

  const DropdownInput({
    super.key,
    required this.labelText,
    this.hintText,
    this.selectedValue,
    required this.items,
    required this.onChanged,
    this.itemToString,
  });

  @override
  Widget build(BuildContext context) {
    return DropdownButtonFormField<T>(
      value: selectedValue,
      decoration: InputDecoration(
        labelText: labelText,
        hintText: hintText,
        border: const OutlineInputBorder(),
      ),
      items: items.map((T value) {
        return DropdownMenuItem<T>(
          value: value,
          child: Text(itemToString != null ? itemToString!(value) : value.toString()),
        );
      }).toList(),
      onChanged: onChanged,
    );
  }
}
