import 'dart:async';
import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../components/i18n/TranslationsProvider.dart';
import '../../core/auth/session_info.dart';
import '../../core/di/service_locator.dart';
import '../../services/ble_receive_service.dart';

class ReceiveDataScreen extends StatefulWidget {
  static const routePath = '/auth/settings/receive-data';
  static const displayName = 'Receive Data';

  const ReceiveDataScreen({super.key});

  @override
  State<ReceiveDataScreen> createState() => _ReceiveDataScreenState();
}

class _ReceiveDataScreenState extends State<ReceiveDataScreen> {
  final _service = ServiceLocator.get<BleReceiveService>();
  final List<BleEvent> _log = [];
  late StreamSubscription _eventSub;
  bool _listening = false;
  final _scrollController = ScrollController();
  static final _timeFmt = DateFormat('HH:mm:ss');

  @override
  void initState() {
    super.initState();
    _eventSub = _service.events.listen((event) {
      setState(() => _log.insert(0, event));
    });
    _service.listeningState.listen((v) {
      if (mounted) setState(() => _listening = v);
    });
  }

  @override
  void dispose() {
    _eventSub.cancel();
    _scrollController.dispose();
    super.dispose();
  }

  Future<void> _toggle() async {
    if (_listening) {
      await _service.stopListening();
    } else {
      final name = SessionInfo.currentUser?.displayName ?? '__SLUG_UPPER__';
      await _service.startListening(localName: name);
    }
  }

  @override
  Widget build(BuildContext context) {
    final t = Translations.of(context);
    final colorScheme = Theme.of(context).colorScheme;

    return Column(
      children: [
        _StatusBanner(listening: _listening, t: t),
        Padding(
          padding: const EdgeInsets.all(16),
          child: SizedBox(
            width: double.infinity,
            child: FilledButton.icon(
              icon: Icon(_listening ? Icons.stop : Icons.bluetooth_searching),
              label: Text(
                _listening
                    ? t.translate('receiveData.stopListening', null)
                    : t.translate('receiveData.startListening', null),
              ),
              style: _listening ? FilledButton.styleFrom(backgroundColor: colorScheme.error) : null,
              onPressed: _toggle,
            ),
          ),
        ),
        const Divider(height: 1),
        Expanded(
          child: _log.isEmpty
              ? Center(
                  child: Text(
                    t.translate('receiveData.log.empty', null),
                    style: TextStyle(color: colorScheme.onSurface.withValues(alpha: 0.5)),
                  ),
                )
              : ListView.separated(
                  controller: _scrollController,
                  padding: const EdgeInsets.symmetric(vertical: 8),
                  itemCount: _log.length,
                  separatorBuilder: (_, __) => const Divider(height: 1, indent: 56),
                  itemBuilder: (context, index) =>
                      _LogTile(event: _log[index], t: t, timeFmt: _timeFmt),
                ),
        ),
      ],
    );
  }
}

class _StatusBanner extends StatelessWidget {
  final bool listening;
  final Translations t;

  const _StatusBanner({required this.listening, required this.t});

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final color = listening ? colorScheme.primaryContainer : colorScheme.surfaceContainerHighest;
    final textColor = listening ? colorScheme.onPrimaryContainer : colorScheme.onSurfaceVariant;

    return AnimatedContainer(
      duration: const Duration(milliseconds: 300),
      color: color,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Row(
        children: [
          if (listening)
            SizedBox(
              width: 16,
              height: 16,
              child: CircularProgressIndicator(strokeWidth: 2, color: textColor),
            )
          else
            Icon(Icons.bluetooth_disabled, size: 16, color: textColor),
          const SizedBox(width: 12),
          Text(
            listening
                ? t.translate('receiveData.status.listening', null)
                : t.translate('receiveData.status.idle', null),
            style: TextStyle(color: textColor, fontWeight: FontWeight.w500),
          ),
        ],
      ),
    );
  }
}

class _LogTile extends StatelessWidget {
  final BleEvent event;
  final Translations t;
  final DateFormat timeFmt;

  const _LogTile({required this.event, required this.t, required this.timeFmt});

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final (icon, color, key) = _iconColorKey(colorScheme);
    final label = t.translate(key, null).replaceAll('{device}', event.deviceName);

    return ListTile(
      dense: true,
      leading: Icon(icon, color: color, size: 20),
      title: Text(label, style: const TextStyle(fontSize: 14)),
      subtitle: _subtitle(context, colorScheme),
      trailing: Text(
        timeFmt.format(event.timestamp),
        style: TextStyle(fontSize: 11, color: colorScheme.onSurface.withValues(alpha: 0.4)),
      ),
    );
  }

  Widget? _subtitle(BuildContext context, ColorScheme colorScheme) {
    if (event.imageData != null) {
      return GestureDetector(
        onTap: () => _showFullImage(context, event.imageData!),
        child: Padding(
          padding: const EdgeInsets.only(top: 6),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(8),
            child: Image.memory(
              event.imageData!,
              height: 80,
              width: 80,
              fit: BoxFit.fitHeight,
              alignment: Alignment.topLeft,
            ),
          ),
        ),
      );
    }
    if (event.details != null) {
      return Text(
        event.details!,
        style: TextStyle(fontSize: 12, color: colorScheme.onSurface.withValues(alpha: 0.6)),
        maxLines: 2,
        overflow: TextOverflow.ellipsis,
      );
    }
    return null;
  }

  void _showFullImage(BuildContext context, Uint8List bytes) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => Scaffold(
          backgroundColor: Colors.black,
          appBar: AppBar(backgroundColor: Colors.black, foregroundColor: Colors.white),
          body: Center(child: InteractiveViewer(child: Image.memory(bytes))),
        ),
      ),
    );
  }

  (IconData, Color, String) _iconColorKey(ColorScheme cs) {
    return switch (event.type) {
      BleEventType.connected => (
        Icons.bluetooth_connected,
        cs.primary,
        'receiveData.log.connected',
      ),
      BleEventType.disconnected => (
        Icons.bluetooth_disabled,
        cs.onSurface.withValues(alpha: 0.5),
        'receiveData.log.disconnected',
      ),
      BleEventType.dataReceived => (
        Icons.download_rounded,
        cs.tertiary,
        'receiveData.log.dataReceived',
      ),
      BleEventType.rejected => (Icons.block, cs.error, 'receiveData.log.rejected'),
      BleEventType.error => (Icons.error_outline, cs.error, 'receiveData.log.rejected'),
    };
  }
}
