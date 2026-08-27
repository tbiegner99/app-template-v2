import '../core/db/database_client.dart';
import '../core/db/db_datasource.dart';
import '../models/favorite.dart';

class FavoritesDatasource extends DbDatasource {
  const FavoritesDatasource(super.db);

  Future<List<Favorite>> getAll() async {
    final rows = await db.query('favorites', orderBy: 'name ASC');
    return rows.map(Favorite.fromMap).toList();
  }

  Future<void> insert(String route, String name) async {
    final now = DateTime.now().toUtc().toIso8601String();
    await db.insert(
      'favorites',
      {'route': route, 'name': name, 'date_created': now, 'last_modified': now},
      conflictAlgorithm: ConflictAlgorithm.ignore,
    );
  }

  Future<void> updateName(String route, String newName) async {
    final now = DateTime.now().toUtc().toIso8601String();
    await db.update(
      'favorites',
      {'name': newName, 'last_modified': now},
      where: 'route = ?',
      whereArgs: [route],
    );
  }

  Future<void> delete(String route) async {
    await db.delete('favorites', where: 'route = ?', whereArgs: [route]);
  }
}
