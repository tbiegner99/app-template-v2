import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';
import 'feature_flag_provider.dart';

class FeatureFlagGate extends StatelessWidget {
  final String flag;
  final Widget child;
  final Widget? fallback;

  const FeatureFlagGate({
    super.key,
    required this.flag,
    required this.child,
    this.fallback,
  });

  @override
  Widget build(BuildContext context) {
    final controller = FeatureFlagProvider.of(context);

    if (controller == null) {
      if (kDebugMode) {
        throw FlutterError(
          'FeatureFlagGate was used without a FeatureFlagProvider ancestor.\n'
          'Ensure FeatureFlagProvider wraps your widget tree (typically at the app root).',
        );
      }
      return const SizedBox.shrink();
    }

    return controller.isEnabled(flag) ? child : (fallback ?? const SizedBox.shrink());
  }
}
