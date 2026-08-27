import 'package:posthog_flutter/posthog_flutter.dart';
import '../controllers/feature_flag_controller.dart';

class AnalyticsService {
  final FeatureFlagController _controller;

  const AnalyticsService(this._controller);

  bool get _enabled => _controller.isEnabled('posthog');

  Future<void> track(String event, {Map<String, Object>? properties}) async {
    if (!_enabled) return;
    await Posthog().capture(eventName: event, properties: properties);
  }

  Future<void> identify(String distinctId) async {
    if (!_enabled) return;
    await Posthog().identify(userId: distinctId);
  }

  Future<void> reset() async {
    if (!_enabled) return;
    await Posthog().reset();
  }
}
