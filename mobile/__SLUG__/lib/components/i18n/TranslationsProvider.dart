import 'dart:convert';

import 'package:flutter/cupertino.dart';

import 'Dictionary.dart';

class Translations extends InheritedWidget {
  final Dictionary dictionary;
  final void Function(Locale) onLocaleChanged;

  const Translations({
    super.key,
    required this.dictionary,
    required super.child,
    required this.onLocaleChanged,
  });

  static Translations of(BuildContext context) {
    final scope = context.dependOnInheritedWidgetOfExactType<Translations>();
    assert(scope != null, 'Translations not found');
    return scope!;
  }

  String translate(String key, Map<String, dynamic>? args) {
    return dictionary.translate(key, args ?? {});
  }

  void changeLocale(Locale locale) {
    onLocaleChanged(locale);
  }

  @override
  bool updateShouldNotify(Translations oldWidget) => dictionary != oldWidget.dictionary;
}

class TranslationsProvider extends StatefulWidget {
  final Widget child;
  final String defaultDictionaryAsset;
  final Future<Map<String, String>> Function(Locale)? onLoadOverrides;

  const TranslationsProvider({
    super.key,
    required this.defaultDictionaryAsset,
    required this.child,
    this.onLoadOverrides,
  });

  @override
  State<TranslationsProvider> createState() => _TranslationsProviderState();
}

class _TranslationsProviderState extends State<TranslationsProvider> with WidgetsBindingObserver {
  Dictionary? _dictionary;
  late Locale locale;

  @override
  void initState() {
    super.initState();
    locale = WidgetsBinding.instance.window.locale;
    WidgetsBinding.instance.addObserver(this);
    _loadDictionary(locale);
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  void onLocaleChanged(Locale newLocale) {
    _loadDictionary(newLocale).then((_) {
      setState(() {
        locale = newLocale;
      });
    });
  }

  @override
  void didChangeLocales(List<Locale>? locales) {
    super.didChangeLocales(locales);
    if (locales == null || locales.isEmpty) {
      return;
    }
    onLocaleChanged(locales.first);
  }

  Future<Map<String, String>> loadFile(String file, Map<String, String> dictionary) async {
    AssetBundle bundle = DefaultAssetBundle.of(context);
    try {
      String languageBundle = await bundle.loadString('assets/i18n/$file.json');
      Map<String, String> langDict = Map.castFrom(jsonDecode(languageBundle)["dictionary"]);
      return {...dictionary, ...langDict};
    } catch (e) {
      return dictionary;
    }
  }

  Future<Map<String, String>> loadLanguage(
    String languageCode,
    Map<String, String> dictionary,
  ) async {
    return await loadFile(languageCode, dictionary);
  }

  Future<Map<String, String>> loadRegion(
    String languageCode,
    String countryCode,
    Map<String, String> dictionary,
  ) async {
    return await loadFile('${languageCode}_$countryCode', dictionary);
  }

  Future<void> _loadDictionary(Locale locale) async {
    //load asset dictionary based on locale
    AssetBundle bundle = DefaultAssetBundle.of(context);
    String file = await bundle.loadString(widget.defaultDictionaryAsset);
    Map<String, dynamic> root = jsonDecode(file);
    Map<String, String> dictionary = Map.castFrom(root["dictionary"]);

    dictionary = await loadLanguage(locale.languageCode, dictionary);
    if (locale.countryCode != null) {
      dictionary = await loadRegion(locale.languageCode, locale.countryCode!, dictionary);
    }
    if (widget.onLoadOverrides != null) {
      Map<String, String> overrides = await widget.onLoadOverrides!(locale);
      dictionary = {...dictionary, ...overrides};
    }
    Dictionary dict = Dictionary(entries: dictionary, locale: locale);
    setState(() {
      _dictionary = dict;
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_dictionary == null) {
      return const SizedBox.shrink();
    }
    return Translations(
      dictionary: _dictionary!,
      child: widget.child,
      onLocaleChanged: onLocaleChanged,
    );
  }
}
