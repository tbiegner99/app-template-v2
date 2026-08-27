import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/models/feature_flag.dart';

void main() {
  group('FeatureFlag.fromMap', () {
    test('creates enabled feature flag from map', () {
      final map = {
        'name': 'dark_mode',
        'enabled': 1,
        'date_created': '2024-01-01T00:00:00.000Z',
        'last_modified': '2024-06-01T00:00:00.000Z',
        'synced_at': null,
      };

      final flag = FeatureFlag.fromMap(map);

      expect(flag.name, 'dark_mode');
      expect(flag.enabled, isTrue);
      expect(flag.syncedAt, isNull);
    });

    test('creates disabled feature flag from map', () {
      final map = {
        'name': 'beta_feature',
        'enabled': 0,
        'date_created': '2024-01-01T00:00:00.000Z',
        'last_modified': '2024-01-01T00:00:00.000Z',
        'synced_at': null,
      };

      final flag = FeatureFlag.fromMap(map);

      expect(flag.enabled, isFalse);
    });

    test('parses synced_at when present', () {
      final map = {
        'name': 'feature_x',
        'enabled': 1,
        'date_created': '2024-01-01T00:00:00.000Z',
        'last_modified': '2024-01-01T00:00:00.000Z',
        'synced_at': '2024-03-15T12:00:00.000Z',
      };

      final flag = FeatureFlag.fromMap(map);

      expect(flag.syncedAt, isNotNull);
      expect(flag.syncedAt!.year, 2024);
    });

    test('dateCreated and lastModified are parsed correctly', () {
      final map = {
        'name': 'test',
        'enabled': 1,
        'date_created': '2023-06-15T08:30:00.000Z',
        'last_modified': '2024-01-20T14:00:00.000Z',
        'synced_at': null,
      };

      final flag = FeatureFlag.fromMap(map);

      expect(flag.dateCreated.year, 2023);
      expect(flag.lastModified.year, 2024);
    });
  });
}
