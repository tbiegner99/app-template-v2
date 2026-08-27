import 'package:flutter/material.dart';
import 'package:get_it/get_it.dart';
import 'package:go_router/go_router.dart';

import '../../../controllers/active_alerts_controller.dart';
import '../../../core/notifications/local_notifications.dart';
import '../../../models/active_alert.dart';
import '../../i18n/TranslationsProvider.dart';

class AlertsPanel extends StatelessWidget {
  const AlertsPanel({super.key});

  static void show(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (_) => const AlertsPanel(),
    );
  }

  @override
  Widget build(BuildContext context) {
    final dict = Translations.of(context);
    return ListenableBuilder(
      listenable: GetIt.instance<ActiveAlertsController>(),
      builder: (context, _) {
        final controller = GetIt.instance<ActiveAlertsController>();
        final alerts = controller.alerts;

        return SafeArea(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      dict.translate('alerts.panel_title', null),
                      style: Theme.of(context).textTheme.titleMedium,
                    ),
                    if (alerts.isNotEmpty)
                      TextButton(
                        onPressed: () => _dismissAll(context, controller),
                        child: Text(dict.translate('alerts.dismiss_all', null)),
                      ),
                  ],
                ),
              ),
              const Divider(height: 1),
              if (alerts.isEmpty)
                Padding(
                  padding: const EdgeInsets.all(24),
                  child: Text(
                    dict.translate('alerts.empty_state', null),
                    style: Theme.of(context).textTheme.bodyMedium,
                  ),
                )
              else
                ConstrainedBox(
                  constraints: BoxConstraints(
                    maxHeight: MediaQuery.of(context).size.height * 0.6,
                  ),
                  child: ListView.separated(
                    shrinkWrap: true,
                    itemCount: alerts.length,
                    separatorBuilder: (_, __) => const Divider(height: 1),
                    itemBuilder: (context, index) =>
                        _AlertTile(alert: alerts[index]),
                  ),
                ),
            ],
          ),
        );
      },
    );
  }

  Future<void> _dismissAll(BuildContext context, ActiveAlertsController controller) async {
    await controller.onDismissAll();
    await LocalNotifications.cancelAll();
    if (context.mounted) Navigator.of(context).pop();
  }
}

class _AlertTile extends StatelessWidget {
  final ActiveAlert alert;
  const _AlertTile({required this.alert});

  @override
  Widget build(BuildContext context) {
    return ListTile(
      title: Text(alert.title),
      subtitle: Text(alert.body),
      trailing: IconButton(
        icon: const Icon(Icons.close),
        onPressed: () => _dismiss(context),
      ),
      onTap: () => _tap(context),
    );
  }

  Future<void> _tap(BuildContext context) async {
    await _dismiss(context);
    if (alert.route != null && alert.route!.isNotEmpty) {
      GetIt.instance<GoRouter>().go(alert.route!);
    }
  }

  Future<void> _dismiss(BuildContext context) async {
    final controller = GetIt.instance<ActiveAlertsController>();
    await controller.onDismiss(alert.id);
    await LocalNotifications.cancel(alert.localNotificationId);
    if (context.mounted) Navigator.of(context).pop();
  }
}
