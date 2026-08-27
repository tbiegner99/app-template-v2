import 'dart:async';
import 'dart:io';
import 'package:logger/logger.dart';

class CappedFileOutput extends LogOutput {
  final File file;
  final int maxBytes;

  final _queue = StreamController<String>(sync: false);
  late final StreamSubscription _sub;

  CappedFileOutput({required this.file, required this.maxBytes}) {
    _sub = _queue.stream.asyncMap(_write).listen(null);
  }

  @override
  void output(OutputEvent event) {
    _queue.add('${event.lines.join('\n')}\n');
  }

  Future<void> _write(String text) async {
    try {
      if (await file.exists() && await file.length() >= maxBytes) {
        await _rotate();
      }
      await file.writeAsString(text, mode: FileMode.append);
    } catch (_) {}
  }

  Future<void> _rotate() async {
    final backup = File('${file.path}.1');
    if (await backup.exists()) await backup.delete();
    await file.rename(backup.path);
  }

  @override
  Future<void> destroy() async {
    await _queue.close();
    await _sub.cancel();
  }
}
