import '../core/db/database_client.dart';
import '../models/active_alert.dart';

class ActiveAlertsDatasource {
  final DatabaseClient _db;

  ActiveAlertsDatasource(this._db);

  Future<void> insert(ActiveAlert alert) async {
    await _db.insert('active_alerts', alert.toMap());
  }

  Future<List<ActiveAlert>> getAll() async {
    final rows = await _db.query(
      'active_alerts',
      orderBy: 'date_created DESC',
    );
    return rows.map(ActiveAlert.fromMap).toList();
  }

  Future<void> deleteById(String id) async {
    await _db.delete('active_alerts', where: 'id = ?', whereArgs: [id]);
  }

  Future<void> deleteAll() async {
    await _db.delete('active_alerts');
  }
}
