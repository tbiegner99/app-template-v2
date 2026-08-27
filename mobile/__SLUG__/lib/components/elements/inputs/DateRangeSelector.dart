import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

class DateRangeSelector extends StatefulWidget {
  final String labelText;
  final DateTimeRange? initialDateRange;
  final Function(DateTimeRange) onDateRangeSelected;
  final bool showTime;

  const DateRangeSelector({
    super.key,
    required this.labelText,
    this.initialDateRange,
    required this.onDateRangeSelected,
    this.showTime = false,
  });

  @override
  State<DateRangeSelector> createState() => _DateRangeSelectorState();
}

class _DateRangeSelectorState extends State<DateRangeSelector> {
  late TextEditingController _controller;
  DateTimeRange? _selectedDateRange;

  @override
  void initState() {
    super.initState();
    _selectedDateRange = widget.initialDateRange;
    final format = widget.showTime ? DateFormat.yMd().add_jm() : DateFormat.yMd();
    _controller = TextEditingController(
      text: _selectedDateRange != null
          ? '${format.format(_selectedDateRange!.start)} - ${format.format(_selectedDateRange!.end)}'
          : '',
    );
  }

  Future<void> _selectDateRange(BuildContext context) async {
    final DateTimeRange? picked = await showDateRangePicker(
      context: context,
      initialDateRange: _selectedDateRange,
      firstDate: DateTime(2000),
      lastDate: DateTime(2101),
    );
    if (picked != null) {
      if (widget.showTime) {
        final TimeOfDay? startTime = await _selectTime(context, _selectedDateRange?.start);
        final TimeOfDay? endTime = await _selectTime(context, _selectedDateRange?.end);
        if (startTime != null && endTime != null) {
          final newStart = DateTime(
            picked.start.year,
            picked.start.month,
            picked.start.day,
            startTime.hour,
            startTime.minute,
          );
          final newEnd = DateTime(
            picked.end.year,
            picked.end.month,
            picked.end.day,
            endTime.hour,
            endTime.minute,
          );
          final newRange = DateTimeRange(start: newStart, end: newEnd);
          setState(() {
            _selectedDateRange = newRange;
            _controller.text =
                '${DateFormat.yMd().add_jm().format(newRange.start)} - ${DateFormat.yMd().add_jm().format(newRange.end)}';
          });
          widget.onDateRangeSelected(newRange);
        }
      } else {
        if (picked != _selectedDateRange) {
          setState(() {
            _selectedDateRange = picked;
            _controller.text =
                '${DateFormat.yMd().format(picked.start)} - ${DateFormat.yMd().format(picked.end)}';
          });
          widget.onDateRangeSelected(picked);
        }
      }
    }
  }

  Future<TimeOfDay?> _selectTime(BuildContext context, DateTime? initialTime) {
    return showTimePicker(
      context: context,
      initialTime: TimeOfDay.fromDateTime(initialTime ?? DateTime.now()),
    );
  }

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: () => _selectDateRange(context),
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
