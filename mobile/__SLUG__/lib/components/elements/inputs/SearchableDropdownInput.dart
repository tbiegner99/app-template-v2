import 'package:dropdown_search/dropdown_search.dart';
import 'package:flutter/material.dart';

class SearchableDropdownInput<T> extends StatelessWidget {
  final String labelText;
  final String? hintText;
  final T? selectedValue;
  final List<T> items;
  final Function(T?) onChanged;
  final String Function(T)? itemToString;

  const SearchableDropdownInput({
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
    return InputDecorator(
      decoration: InputDecoration(
        labelText: labelText,
        hintText: hintText,
        border: const OutlineInputBorder(),
        contentPadding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
      ),
      child: DropdownSearch<T>(
        items: (String filter, props) => Future.value(items),
        itemAsString: itemToString,
        decoratorProps: DropDownDecoratorProps(
          decoration: InputDecoration(
            border: InputBorder.none,
            contentPadding: const EdgeInsets.symmetric(horizontal: 0, vertical: 12),
          ),
        ),
        popupProps: PopupProps.menu(
          searchDelay: const Duration(milliseconds: 300),
          showSearchBox: true,

          searchFieldProps: const TextFieldProps(
            autofocus: true,
            decoration: InputDecoration(hintText: 'Search'),
          ),
        ),
        onChanged: onChanged,
        selectedItem: selectedValue,
        dropdownBuilder: (context, selectedItem) {
          if (selectedItem == null) {
            return Text(
              hintText ?? '',
              style: Theme.of(
                context,
              ).textTheme.bodyMedium?.copyWith(color: Theme.of(context).hintColor),
            );
          }
          return Text(itemToString != null ? itemToString!(selectedItem) : selectedItem.toString());
        },
      ),
    );
  }
}
