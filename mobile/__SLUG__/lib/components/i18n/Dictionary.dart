import 'dart:ui';

class Dictionary {
  final Map<String, String> entries;
  final Locale locale;

  Dictionary({required this.entries, required this.locale});

  String translate(String key, Map<String, dynamic>? params) {
    String? translation = entries[key];

    if (translation == null) {
      //TODO: log missing keys
      return "**$key**";
    }
    Map<String, dynamic> values = params ?? {};
    values.forEach((placeholder, value) {
      translation = translation!.replaceAll('{{$placeholder}}', value);
    });
    return translation!;
  }
}
