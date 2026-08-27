import '../datasources/favorites_datasource.dart';
import '../models/favorite.dart';

class FavoritesService {
  final FavoritesDatasource _datasource;

  const FavoritesService(this._datasource);

  Future<List<Favorite>> getAll() => _datasource.getAll();

  Future<void> add(String route, String name) async {
    if (name.trim().isEmpty) throw ArgumentError('Favorite name must not be empty');
    final existing = await _datasource.getAll();
    if (existing.any((f) => f.route == route)) return;
    await _datasource.insert(route, name.trim());
  }

  Future<void> rename(String route, String newName) async {
    if (newName.trim().isEmpty) throw ArgumentError('Favorite name must not be empty');
    await _datasource.updateName(route, newName.trim());
  }

  Future<void> remove(String route) => _datasource.delete(route);
}
