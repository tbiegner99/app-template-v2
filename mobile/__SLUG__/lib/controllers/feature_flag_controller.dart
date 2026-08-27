import 'package:flutter/foundation.dart';
import '../services/feature_flags_service.dart';

class FeatureFlagController extends ChangeNotifier {
  final FeatureFlagsService _service;

  Map<String, bool> _flags = {};

  FeatureFlagController(this._service);

  bool isEnabled(String name) => _flags[name.trim()] ?? false;

  List<MapEntry<String, bool>> get allFlags =>
      _flags.entries.toList()..sort((a, b) => a.key.compareTo(b.key));

  Future<void> init() async {
    final flags = await _service.getAll();
    _flags = {for (final f in flags) f.name: f.enabled};
  }

  Future<void> reload() async {
    final flags = await _service.getAll();
    _flags = {for (final f in flags) f.name: f.enabled};
    notifyListeners();
  }
}
