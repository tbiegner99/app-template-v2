import '../datasources/feature_flags_datasource.dart';
import '../models/feature_flag.dart';

class FeatureFlagsService {
  final FeatureFlagsDatasource _datasource;

  const FeatureFlagsService(this._datasource);

  Future<List<FeatureFlag>> getAll() async {
    final flags = await _datasource.getAll();
    return flags.map((f) => FeatureFlag(
          name: f.name.trim(),
          enabled: f.enabled,
          dateCreated: f.dateCreated,
          lastModified: f.lastModified,
          syncedAt: f.syncedAt,
        )).toList();
  }
}
