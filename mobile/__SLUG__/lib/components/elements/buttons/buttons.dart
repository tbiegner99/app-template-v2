import 'package:flutter/material.dart';

import '../../../theme.dart';
import '../../../palette.dart';

enum ButtonSize { small, medium, large }

typedef ButtonChild = Widget;

abstract class BaseButton extends StatelessWidget {
  final VoidCallback? onPressed;
  final ButtonChild child;
  final ButtonSize size;
  final IconData? icon;
  final bool enabled;

  const BaseButton({
    super.key,
    required this.onPressed,
    required this.child,
    this.size = ButtonSize.medium,
    this.icon,
    this.enabled = true,
  });

  Color resolveColor(BuildContext context);

  Color resolveTextColor(BuildContext context);

  double get _verticalPadding {
    switch (size) {
      case ButtonSize.small:
        return 8;
      case ButtonSize.medium:
        return 12;
      case ButtonSize.large:
        return 16;
    }
  }

  double get _horizontalPadding {
    switch (size) {
      case ButtonSize.small:
        return 16;
      case ButtonSize.medium:
        return 20;
      case ButtonSize.large:
        return 28;
    }
  }

  double get _fontSize {
    switch (size) {
      case ButtonSize.small:
        return 13;
      case ButtonSize.medium:
        return 15;
      case ButtonSize.large:
        return 17;
    }
  }

  double get _iconSize {
    switch (size) {
      case ButtonSize.small:
        return 16;
      case ButtonSize.medium:
        return 20;
      case ButtonSize.large:
        return 24;
    }
  }

  @override
  Widget build(BuildContext context) {
    final Color bgColor = resolveColor(context);
    final Color fgColor = resolveTextColor(context);
    const double radius = 8.0;
    final Widget content = DefaultTextStyle(
      style: TextStyle(fontSize: _fontSize, color: fgColor),
      child: child,
    );
    return Opacity(
      opacity: enabled ? 1.0 : 0.5,
      child: ElevatedButton(
        onPressed: enabled ? onPressed : null,
        style: ElevatedButton.styleFrom(
          backgroundColor: bgColor,
          foregroundColor: fgColor,
          padding: EdgeInsets.symmetric(vertical: _verticalPadding, horizontal: _horizontalPadding),

          textStyle: TextStyle(fontSize: _fontSize, color: fgColor),
        ),
        child: icon == null
            ? content
            : Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(icon, size: _iconSize, color: fgColor),
                  SizedBox(width: 8),
                  content,
                ],
              ),
      ),
    );
  }
}

class PrimaryButton extends BaseButton {
  const PrimaryButton({
    super.key,
    required super.onPressed,
    required super.child,
    super.size,
    super.icon,
    super.enabled,
  });

  @override
  Color resolveColor(BuildContext context) => Theme.of(context).colorScheme.primary;

  @override
  Color resolveTextColor(BuildContext context) => Theme.of(context).colorScheme.onPrimary;
}

class SecondaryButton extends BaseButton {
  const SecondaryButton({
    super.key,
    required super.onPressed,
    required super.child,
    super.size,
    super.icon,
    super.enabled,
  });

  @override
  Color resolveColor(BuildContext context) => SemanticColors.secondary;

  @override
  Color resolveTextColor(BuildContext context) => SemanticColors.primary;
}

class DestructiveButton extends BaseButton {
  const DestructiveButton({
    super.key,
    required super.onPressed,
    required super.child,
    super.size,
    super.icon,
    super.enabled,
  });

  @override
  Color resolveColor(BuildContext context) => Theme.of(context).colorScheme.error;

  @override
  Color resolveTextColor(BuildContext context) => Theme.of(context).colorScheme.onError;
}

class WarningButton extends BaseButton {
  const WarningButton({
    super.key,
    required super.onPressed,
    required super.child,
    super.size,
    super.icon,
    super.enabled,
  });

  @override
  Color resolveColor(BuildContext context) => SemanticColors.warning;

  @override
  Color resolveTextColor(BuildContext context) => Colors.white;
}

class SuccessButton extends BaseButton {
  const SuccessButton({
    super.key,
    required super.onPressed,
    required super.child,
    super.size,
    super.icon,
    super.enabled,
  });

  @override
  Color resolveColor(BuildContext context) => SemanticColors.success;

  @override
  Color resolveTextColor(BuildContext context) => Colors.white;
}

class InfoButton extends BaseButton {
  const InfoButton({
    super.key,
    required super.onPressed,
    required super.child,
    super.size,
    super.icon,
    super.enabled,
  });

  @override
  Color resolveColor(BuildContext context) => SemanticColors.info;

  @override
  Color resolveTextColor(BuildContext context) => Colors.white;
}
