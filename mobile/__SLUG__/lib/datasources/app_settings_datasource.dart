import '../core/db/db_datasource.dart';
import '../core/db/database_client.dart' show ConflictAlgorithm;

class AppSettingsDatasource extends DbDatasource {
  const AppSettingsDatasource(super.db);

  Future<String?> get(String key) async {
    final rows = await db.query(
      'app_settings',
      columns: ['value'],
      where: 'key = ?',
      whereArgs: [key],
      limit: 1,
    );
    return rows.isEmpty ? null : rows.first['value'] as String?;
  }

  Future<void> set(String key, String value) async {
    final now = DateTime.now().toIso8601String();
    await db.insert(
      'app_settings',
      {'key': key, 'value': value, 'last_modified': now},
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
  }

  Future<void> remove(String key) async {
    await db.delete('app_settings', where: 'key = ?', whereArgs: [key]);
  }

  Future<Map<String, String>> getAll() async {
    final rows = await db.query('app_settings', columns: ['key', 'value']);
    return {for (final r in rows) r['key'] as String: r['value'] as String};
  }
}
