import 'package:logger/logger.dart';
import 'capped_file_output.dart';

const _defaultMaxBytes = 10 * 1024 * 1024; // 10 MB

Logger _buildLogger(LogOutput output) => Logger(
      printer: SimplePrinter(printTime: true, colors: false),
      output: output,
    );

var _logger = _buildLogger(ConsoleOutput());

class __SLUG_UPPER__Logger {
  final String _tag;

  const __SLUG_UPPER__Logger(this._tag);

  static void init({
    required CappedFileOutput fileOutput,
    Level level = Level.debug,
  }) {
    Logger.level = level;
    _logger = _buildLogger(MultiOutput([ConsoleOutput(), fileOutput]));
  }

  static void setLevel(Level level) => Logger.level = level;

  static Level levelFromString(String value) => switch (value.toUpperCase()) {
        'TRACE' => Level.trace,
        'DEBUG' => Level.debug,
        'INFO' => Level.info,
        'WARNING' || 'WARN' => Level.warning,
        'ERROR' => Level.error,
        'FATAL' => Level.fatal,
        _ => Level.debug,
      };

  static int maxBytesFromString(String? value) {
    if (value == null) return _defaultMaxBytes;
    return int.tryParse(value) ?? _defaultMaxBytes;
  }

  void trace(String message) => _logger.t('[$_tag] $message');
  void debug(String message) => _logger.d('[$_tag] $message');
  void info(String message) => _logger.i('[$_tag] $message');
  void warning(String message) => _logger.w('[$_tag] $message');
  void error(String message, [Object? error, StackTrace? stackTrace]) =>
      _logger.e('[$_tag] $message', error: error, stackTrace: stackTrace);
  void fatal(String message, [Object? error, StackTrace? stackTrace]) =>
      _logger.f('[$_tag] $message', error: error, stackTrace: stackTrace);
}
