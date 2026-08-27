import 'database_client.dart';

abstract class DbDatasource {
  final DatabaseClient db;
  const DbDatasource(this.db);
}
