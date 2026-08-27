import 'package:flutter/material.dart';

class CustomCard extends StatelessWidget {
  final Widget? child;
  final Color? color;
  final EdgeInsetsGeometry? padding;
  final EdgeInsetsGeometry? margin;
  final double? elevation;

  const CustomCard({super.key, this.child, this.color, this.padding, this.margin, this.elevation});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      child: Card(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4.0)),
        elevation: elevation ?? 1.0,
        color: color ?? Theme.of(context).cardColor,
        margin: margin ?? const EdgeInsets.all(8.0),
        child: Padding(padding: padding ?? const EdgeInsets.all(16.0), child: child),
      ),
    );
  }
}
