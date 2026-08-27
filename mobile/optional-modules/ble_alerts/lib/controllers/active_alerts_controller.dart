import 'package:flutter/foundation.dart';

import '../models/active_alert.dart';
import '../services/active_alerts_service.dart';

class ActiveAlertsController extends ChangeNotifier {
  final ActiveAlertsService _svc;

  List<ActiveAlert> _alerts = [];
  List<ActiveAlert> get alerts => List.unmodifiable(_alerts);
  int get count => _alerts.length;

  ActiveAlertsController(this._svc);

  Future<void> init() async {
    _alerts = await _svc.getAlerts();
    notifyListeners();
  }

  Future<void> onAlertReceived(ActiveAlert alert) async {
    await _svc.addAlert(alert);
    _alerts = await _svc.getAlerts();
    notifyListeners();
  }

  Future<void> onDismiss(String id) async {
    await _svc.dismissAlert(id);
    _alerts = _alerts.where((a) => a.id != id).toList();
    notifyListeners();
  }

  Future<void> onDismissAll() async {
    await _svc.dismissAll();
    _alerts = [];
    notifyListeners();
  }
}
