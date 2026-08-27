import 'package:flutter/material.dart';

class ContextMenuItem {
  final String label;
  final IconData? icon;
  final VoidCallback onTap;

  const ContextMenuItem({required this.label, this.icon, required this.onTap});
}

class ContextMenu extends StatelessWidget {
  final Widget child;
  final List<ContextMenuItem> items;

  const ContextMenu({super.key, required this.child, required this.items});

  void _show(BuildContext context, LongPressStartDetails details) async {
    final position = RelativeRect.fromLTRB(
      details.globalPosition.dx,
      details.globalPosition.dy,
      details.globalPosition.dx,
      details.globalPosition.dy,
    );

    final selected = await showMenu<ContextMenuItem>(
      context: context,
      position: position,
      items: items
          .map(
            (item) => PopupMenuItem<ContextMenuItem>(
              value: item,
              child: Row(
                children: [
                  if (item.icon != null) ...[
                    Icon(item.icon, size: 18),
                    const SizedBox(width: 12),
                  ],
                  Text(item.label),
                ],
              ),
            ),
          )
          .toList(),
    );

    selected?.onTap();
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onLongPressStart: (details) => _show(context, details),
      child: child,
    );
  }
}
