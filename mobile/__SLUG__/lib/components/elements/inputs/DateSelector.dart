import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

class DateSelector extends StatefulWidget {
  final String labelText;
  final DateTime? initialDate;
  final Function(DateTime) onDateSelected;
  final bool showTime;

  const DateSelector({
    super.key,
    required this.labelText,
    this.initialDate,
    required this.onDateSelected,
    this.showTime = false,
  });

  @override
  State<DateSelector> createState() => _DateSelectorState();
}

class _DateSelectorState extends State<DateSelector> {
  late TextEditingController _controller;
  DateTime? _selectedDate;

  @override
  void initState() {
    super.initState();
    _selectedDate = widget.initialDate;
    final format = widget.showTime ? DateFormat.yMd().add_jm() : DateFormat.yMd();
    _controller = TextEditingController(
      text: _selectedDate != null ? format.format(_selectedDate!) : '',
    );
  }

  Future<void> _selectDate(BuildContext context) async {
    final DateTime? pickedDate = await showDatePicker(
      context: context,
      initialDate: _selectedDate ?? DateTime.now(),
      firstDate: DateTime(2000),
      lastDate: DateTime(2101),
    );

    if (pickedDate != null) {
      if (widget.showTime) {
        final TimeOfDay? pickedTime = await showTimePicker(
          context: context,
          initialTime: TimeOfDay.fromDateTime(_selectedDate ?? DateTime.now()),
        );
        if (pickedTime != null) {
          final newDateTime = DateTime(
            pickedDate.year,
            pickedDate.month,
            pickedDate.day,
            pickedTime.hour,
            pickedTime.minute,
          );
          setState(() {
            _selectedDate = newDateTime;
            _controller.text = DateFormat.yMd().add_jm().format(newDateTime);
          });
          widget.onDateSelected(newDateTime);
        }
      } else {
        if (pickedDate != _selectedDate) {
          setState(() {
            _selectedDate = pickedDate;
            _controller.text = DateFormat.yMd().format(pickedDate);
          });
          widget.onDateSelected(pickedDate);
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: () => _selectDate(context),
      child: IgnorePointer(
        child: TextFormField(
          controller: _controller,
          decoration: InputDecoration(
            labelText: widget.labelText,
            suffixIcon: const Icon(Icons.calendar_today),
            border: const OutlineInputBorder(),
          ),
        ),
      ),
    );
  }
}
