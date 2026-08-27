import 'dart:convert';
import 'dart:io';
import 'dart:typed_data';

/// Wire format (UTF-8 bytes):
///
///   From: {displayName}\r\n
///   Content-Type: {mimeType}\r\n
///   Content-Encoding: gzip\r\n   (optional)
///   Content-Length: {bodyByteCount}\r\n
///   \r\n
///   {body bytes}
///
class __SLUG_TITLE__Packet {
  final String from;
  final String contentType;
  final Uint8List body;

  const __SLUG_TITLE__Packet({
    required this.from,
    required this.contentType,
    required this.body,
  });

  String get bodyText => utf8.decode(body, allowMalformed: true);

  /// Encode the packet with gzip-compressed body.
  Uint8List encode() {
    final compressed = Uint8List.fromList(gzip.encode(body));
    final headerStr = 'From: $from\r\n'
        'Content-Type: $contentType\r\n'
        'Content-Encoding: gzip\r\n'
        'Content-Length: ${compressed.length}\r\n'
        '\r\n';
    final headerBytes = utf8.encode(headerStr);
    return Uint8List.fromList([...headerBytes, ...compressed]);
  }

  /// Attempt to parse a complete packet from [buf].
  /// Returns the packet on success, null if more bytes are needed.
  /// Throws [FormatException] on malformed data.
  static __SLUG_TITLE__Packet? tryParse(List<int> buf) {
    const sep = [0x0d, 0x0a, 0x0d, 0x0a];
    int sepIndex = -1;
    for (var i = 0; i <= buf.length - sep.length; i++) {
      if (buf[i] == sep[0] && buf[i + 1] == sep[1] && buf[i + 2] == sep[2] && buf[i + 3] == sep[3]) {
        sepIndex = i;
        break;
      }
    }
    if (sepIndex == -1) return null;

    final headerSection = utf8.decode(buf.sublist(0, sepIndex));
    final headers = _parseHeaders(headerSection);

    final contentLengthStr = headers['content-length'];
    if (contentLengthStr == null) throw const FormatException('Missing Content-Length');
    final contentLength = int.parse(contentLengthStr);

    final bodyStart = sepIndex + sep.length;
    if (buf.length < bodyStart + contentLength) return null;

    var bodyBytes = Uint8List.fromList(buf.sublist(bodyStart, bodyStart + contentLength));
    if (headers['content-encoding'] == 'gzip') {
      bodyBytes = Uint8List.fromList(gzip.decode(bodyBytes));
    }

    return __SLUG_TITLE__Packet(
      from: headers['from'] ?? '',
      contentType: headers['content-type'] ?? 'text/plain',
      body: bodyBytes,
    );
  }

  static Map<String, String> _parseHeaders(String section) {
    final headers = <String, String>{};
    for (final line in section.split('\r\n')) {
      final colon = line.indexOf(':');
      if (colon == -1) continue;
      final key = line.substring(0, colon).trim().toLowerCase();
      final value = line.substring(colon + 1).trim();
      headers[key] = value;
    }
    return headers;
  }
}
