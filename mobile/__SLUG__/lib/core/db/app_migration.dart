import 'package:sqflite/sqflite.dart';

class AppMigration {
  final int version;
  final Future<void> Function(Database db) migrate;

  const AppMigration({required this.version, required this.migrate});
}
