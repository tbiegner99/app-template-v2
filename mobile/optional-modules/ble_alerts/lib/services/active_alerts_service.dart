import '../datasources/active_alerts_datasource.dart';
import '../models/active_alert.dart';

class ActiveAlertsService {
  final ActiveAlertsDatasource _ds;

  ActiveAlertsService(this._ds);

  Future<void> addAlert(ActiveAlert alert) => _ds.insert(alert);

  Future<List<ActiveAlert>> getAlerts() => _ds.getAll();

  Future<void> dismissAlert(String id) => _ds.deleteById(id);

  Future<void> dismissAll() => _ds.deleteAll();
}
