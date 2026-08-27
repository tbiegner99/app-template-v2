import 'package:flutter/material.dart';

import '../../../controllers/active_alerts_controller.dart';
import '../../../core/di/service_locator.dart';

class AlertBadge extends StatelessWidget {
  final Widget child;

  const AlertBadge({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    final controller = ServiceLocator.get<ActiveAlertsController>();
    return ListenableBuilder(
      listenable: controller,
      builder: (context, _) {
        final count = controller.count;
        if (count == 0) return child;
        return Badge(
          label: Text('$count'),
          backgroundColor: Theme.of(context).colorScheme.error,
          child: child,
        );
      },
    );
  }
}
