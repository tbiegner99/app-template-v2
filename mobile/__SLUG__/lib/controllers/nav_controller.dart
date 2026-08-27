import 'package:flutter/foundation.dart';
import '../models/favorite.dart';
import '../services/favorites_service.dart';

class NavController extends ChangeNotifier {
  final FavoritesService _service;

  NavController(this._service);

  List<Favorite> _favorites = [];
  List<Favorite> get favorites => _favorites;

  bool isFavorite(String route) => _favorites.any((f) => f.route == route);

  Future<void> init() async {
    _favorites = await _service.getAll();
    notifyListeners();
  }

  Future<void> addFavorite(String route, String name) async {
    await _service.add(route, name);
    _favorites = await _service.getAll();
    notifyListeners();
  }

  Future<void> renameFavorite(String route, String newName) async {
    await _service.rename(route, newName);
    _favorites = await _service.getAll();
    notifyListeners();
  }

  Future<void> removeFavorite(String route) async {
    await _service.remove(route);
    _favorites = await _service.getAll();
    notifyListeners();
  }
}
