import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';

/// Simple runtime locale state.
///
/// Use with AnimatedBuilder (or any ChangeNotifier listener) to rebuild
/// MaterialApp when the locale changes.
class LocaleProvider extends ChangeNotifier {
  Locale? _locale;

  Locale? get locale => _locale;

  void setLocale(Locale? locale) {
    if (_locale == locale) return;
    _locale = locale;
    notifyListeners();
  }

  void clearLocale() => setLocale(null);
}

/// Tiny inherited container for [LocaleProvider], so we don't need an extra
/// dependency (like provider/riverpod) just to access it.
class LocaleProviderScope extends InheritedNotifier<LocaleProvider> {
  const LocaleProviderScope({
    super.key,
    required LocaleProvider notifier,
    required Widget child,
  }) : super(notifier: notifier, child: child);

  static LocaleProvider of(BuildContext context) {
    final scope = context.dependOnInheritedWidgetOfExactType<LocaleProviderScope>();
    assert(scope != null, 'LocaleProviderScope not found in widget tree');
    return scope!.notifier!;
  }
}

