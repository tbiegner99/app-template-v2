import '../core/db/db_datasource.dart';
import '../models/feature_flag.dart';

class FeatureFlagsDatasource extends DbDatasource {
  const FeatureFlagsDatasource(super.db);

  Future<List<FeatureFlag>> getAll() async {
    final rows = await db.query('feature_flags', orderBy: 'name ASC');
    return rows.map(FeatureFlag.fromMap).toList();
  }
}
