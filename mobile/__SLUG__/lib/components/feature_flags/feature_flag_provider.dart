import 'package:flutter/widgets.dart';
import '../../controllers/feature_flag_controller.dart';

class FeatureFlagProvider extends InheritedNotifier<FeatureFlagController> {
  const FeatureFlagProvider({
    super.key,
    required FeatureFlagController notifier,
    required super.child,
  }) : super(notifier: notifier);

  static FeatureFlagController? of(BuildContext context) {
    return context
        .dependOnInheritedWidgetOfExactType<FeatureFlagProvider>()
        ?.notifier;
  }

  @override
  bool updateShouldNotify(FeatureFlagProvider oldWidget) =>
      notifier != oldWidget.notifier;
}
