import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/models/favorite.dart';

void main() {
  group('Favorite.fromMap', () {
    test('creates favorite from map', () {
      final map = {
        'route': '/dashboard',
        'name': 'Dashboard',
        'date_created': '2024-01-01T00:00:00.000Z',
        'last_modified': '2024-06-01T00:00:00.000Z',
      };

      final fav = Favorite.fromMap(map);

      expect(fav.route, '/dashboard');
      expect(fav.name, 'Dashboard');
      expect(fav.dateCreated.year, 2024);
    });

    test('parses lastModified correctly', () {
      final map = {
        'route': '/alerts',
        'name': 'Alerts',
        'date_created': '2023-05-10T00:00:00.000Z',
        'last_modified': '2024-02-20T10:30:00.000Z',
      };

      final fav = Favorite.fromMap(map);

      expect(fav.lastModified.month, 2);
      expect(fav.lastModified.day, 20);
    });
  });
}
