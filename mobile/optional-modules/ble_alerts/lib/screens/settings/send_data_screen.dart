import 'dart:async';

import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:intl/intl.dart';

import '../../components/i18n/TranslationsProvider.dart';
import '../../core/di/service_locator.dart';
import '../../services/ble_send_service.dart';

class SendDataScreen extends StatefulWidget {
  static const routePath = '/auth/settings/send-data';
  static const displayName = 'Send Data';

  const SendDataScreen({super.key});

  @override
  State<SendDataScreen> createState() => _SendDataScreenState();
}

class _SendDataScreenState extends State<SendDataScreen> {
  final _service = ServiceLocator.get<BleSendService>();
  final List<BleSendEvent> _log = [];
  List<__SLUG_TITLE__Device> _nearby = [];
  __SLUG_TITLE__Device? _connected;
  bool _scanning = false;
  bool _connecting = false;

  final _textController = TextEditingController();
  final _scrollController = ScrollController();
  static final _timeFmt = DateFormat('HH:mm:ss');

  late StreamSubscription _eventSub;
  late StreamSubscription _devicesSub;

  @override
  void initState() {
    super.initState();
    _eventSub = _service.events.listen((e) {
      setState(() {
        if (e.type == BleSendEventType.sending) {
          // Update in-place so the progress bar animates rather than creating new entries.
          final idx = _log.indexWhere((l) => l.type == BleSendEventType.sending);
          if (idx >= 0) {
            _log[idx] = e;
          } else {
            _log.insert(0, e);
          }
        } else {
          // Replace the in-progress sending entry with the final result.
          final idx = _log.indexWhere((l) => l.type == BleSendEventType.sending);
          if (idx >= 0) {
            _log[idx] = e;
          } else {
            _log.insert(0, e);
          }
        }
        if (e.type == BleSendEventType.connecting) _connecting = true;
        if (e.type == BleSendEventType.connected) {
          _connecting = false;
          _connected = _service.connectedDevice ?? _connected;
        }
        if (e.type == BleSendEventType.disconnected) {
          _connected = null;
          _connecting = false;
        }
        if (e.type == BleSendEventType.scanning) _scanning = true;
      });
    });
    _devicesSub = _service.nearbyDevices.listen((devices) {
      setState(() {
        _nearby = devices;
        _scanning = _service.isScanning;
      });
    });
  }

  @override
  void dispose() {
    _eventSub.cancel();
    _devicesSub.cancel();
    _textController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  Future<void> _toggleScan() async {
    if (_scanning) {
      await _service.stopScan();
      setState(() => _scanning = false);
    } else {
      await _service.startScan();
    }
  }

  Future<void> _connectTo(__SLUG_TITLE__Device device) async {
    setState(() => _connecting = true);
    await _service.connectTo(device);
  }

  Future<void> _disconnect() async {
    await _service.disconnect();
    setState(() => _connected = null);
  }

  Future<void> _send() async {
    final text = _textController.text.trim();
    if (text.isEmpty) return;
    await _service.sendData(text);
    _textController.clear();
  }

  Future<void> _sendImage() async {
    final picker = ImagePicker();
    final picked = await picker.pickImage(source: ImageSource.gallery, imageQuality: 70);
    if (picked == null) return;
    final bytes = await picked.readAsBytes();
    await _service.sendImage(bytes);
  }

  @override
  Widget build(BuildContext context) {
    final t = Translations.of(context);
    final colorScheme = Theme.of(context).colorScheme;
    final isConnected = _connected != null;

    return Column(
      children: [
        // Connected banner
        if (isConnected)
          _ConnectedBanner(deviceName: _connected!.displayName, t: t, onDisconnect: _disconnect)
        else
          _ScanSection(
            scanning: _scanning,
            connecting: _connecting,
            nearby: _nearby,
            t: t,
            onToggleScan: _toggleScan,
            onConnect: _connectTo,
          ),

        const Divider(height: 1),

        // Send area — only shown when connected
        if (isConnected) _SendArea(controller: _textController, t: t, onSend: _send, onSendImage: _sendImage),

        if (isConnected) const Divider(height: 1),

        // Event log
        Expanded(
          child: _log.isEmpty
              ? Center(
                  child: Text(
                    t.translate('sendData.log.empty', null),
                    style: TextStyle(color: colorScheme.onSurface.withValues(alpha: 0.5)),
                  ),
                )
              : ListView.separated(
                  controller: _scrollController,
                  padding: const EdgeInsets.symmetric(vertical: 8),
                  itemCount: _log.length,
                  separatorBuilder: (_, __) => const Divider(height: 1, indent: 56),
                  itemBuilder: (_, i) => _LogTile(event: _log[i], t: t, timeFmt: _timeFmt),
                ),
        ),
      ],
    );
  }
}

class _ScanSection extends StatelessWidget {
  final bool scanning;
  final bool connecting;
  final List<__SLUG_TITLE__Device> nearby;
  final Translations t;
  final VoidCallback onToggleScan;
  final void Function(__SLUG_TITLE__Device) onConnect;

  const _ScanSection({
    required this.scanning,
    required this.connecting,
    required this.nearby,
    required this.t,
    required this.onToggleScan,
    required this.onConnect,
  });

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Padding(
          padding: const EdgeInsets.all(16),
          child: FilledButton.icon(
            icon: Icon(scanning ? Icons.stop : Icons.bluetooth_searching),
            label: Text(
              scanning
                  ? t.translate('sendData.stopScan', null)
                  : t.translate('sendData.scan', null),
            ),
            style: scanning ? FilledButton.styleFrom(backgroundColor: colorScheme.error) : null,
            onPressed: onToggleScan,
          ),
        ),
        if (scanning && nearby.isEmpty)
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Row(
              children: [
                SizedBox(
                  width: 14,
                  height: 14,
                  child: CircularProgressIndicator(strokeWidth: 2, color: colorScheme.primary),
                ),
                const SizedBox(width: 10),
                Text(
                  t.translate('sendData.scanning', null),
                  style: TextStyle(color: colorScheme.onSurface.withValues(alpha: 0.6)),
                ),
              ],
            ),
          ),
        if (!scanning && nearby.isEmpty)
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Text(
              t.translate('sendData.noDevices', null),
              style: TextStyle(color: colorScheme.onSurface.withValues(alpha: 0.5)),
            ),
          ),
        if (nearby.isNotEmpty) ...[
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 4, 16, 4),
            child: Text(
              t.translate('sendData.nearbyDevices', null).toUpperCase(),
              style: Theme.of(
                context,
              ).textTheme.labelSmall?.copyWith(color: colorScheme.primary, letterSpacing: 1.2),
            ),
          ),
          for (final device in nearby)
            ListTile(
              leading: const Icon(Icons.bluetooth),
              title: Text(device.displayName),
              trailing: FilledButton.tonal(
                onPressed: connecting ? null : () => onConnect(device),
                child: connecting
                    ? const SizedBox(
                        width: 16,
                        height: 16,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : Text(t.translate('sendData.connect', null)),
              ),
            ),
        ],
      ],
    );
  }
}

class _ConnectedBanner extends StatelessWidget {
  final String deviceName;
  final Translations t;
  final VoidCallback onDisconnect;

  const _ConnectedBanner({required this.deviceName, required this.t, required this.onDisconnect});

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    return Container(
      color: colorScheme.primaryContainer,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Row(
        children: [
          Icon(Icons.bluetooth_connected, size: 18, color: colorScheme.onPrimaryContainer),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              t.translate('sendData.connected', null).replaceAll('{device}', deviceName),
              style: TextStyle(color: colorScheme.onPrimaryContainer, fontWeight: FontWeight.w500),
            ),
          ),
          TextButton(
            onPressed: onDisconnect,
            child: Text(
              t.translate('sendData.disconnect', null),
              style: TextStyle(color: colorScheme.error),
            ),
          ),
        ],
      ),
    );
  }
}

class _SendArea extends StatelessWidget {
  final TextEditingController controller;
  final Translations t;
  final VoidCallback onSend;
  final VoidCallback onSendImage;

  const _SendArea({
    required this.controller,
    required this.t,
    required this.onSend,
    required this.onSendImage,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          Expanded(
            child: TextField(
              controller: controller,
              maxLines: 4,
              minLines: 2,
              textInputAction: TextInputAction.newline,
              decoration: InputDecoration(
                hintText: t.translate('sendData.placeholder', null),
                border: const OutlineInputBorder(),
                contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
              ),
            ),
          ),
          const SizedBox(width: 8),
          Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              FilledButton(onPressed: onSend, child: Text(t.translate('sendData.send', null))),
              const SizedBox(height: 8),
              FilledButton.tonal(
                onPressed: onSendImage,
                child: const Icon(Icons.image_outlined),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _LogTile extends StatelessWidget {
  final BleSendEvent event;
  final Translations t;
  final DateFormat timeFmt;

  const _LogTile({required this.event, required this.t, required this.timeFmt});

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    if (event.type == BleSendEventType.sending) {
      return _SendingTile(event: event, colorScheme: colorScheme, timeFmt: timeFmt);
    }

    final (icon, color, key) = _meta(colorScheme);
    final label = t.translate(key, null).replaceAll('{message}', event.message);

    return ListTile(
      dense: true,
      leading: Icon(icon, color: color, size: 20),
      title: Text(label, style: const TextStyle(fontSize: 14)),
      trailing: Text(
        timeFmt.format(event.timestamp),
        style: TextStyle(fontSize: 11, color: colorScheme.onSurface.withValues(alpha: 0.4)),
      ),
    );
  }

  (IconData, Color, String) _meta(ColorScheme cs) {
    return switch (event.type) {
      BleSendEventType.scanning => (Icons.bluetooth_searching, cs.primary, 'sendData.log.scanning'),
      BleSendEventType.deviceFound => (Icons.bluetooth, cs.primary, 'sendData.log.deviceFound'),
      BleSendEventType.connecting => (Icons.pending_outlined, cs.primary, 'sendData.log.connecting'),
      BleSendEventType.connected => (Icons.bluetooth_connected, cs.primary, 'sendData.log.connected'),
      BleSendEventType.disconnected => (
        Icons.bluetooth_disabled,
        cs.onSurface.withValues(alpha: 0.5),
        'sendData.log.disconnected',
      ),
      BleSendEventType.sending => (Icons.upload_rounded, cs.primary, 'sendData.log.dataSent'),
      BleSendEventType.dataSent => (Icons.upload_rounded, cs.tertiary, 'sendData.log.dataSent'),
      BleSendEventType.error => (Icons.error_outline, cs.error, 'sendData.log.error'),
    };
  }
}

class _SendingTile extends StatelessWidget {
  final BleSendEvent event;
  final ColorScheme colorScheme;
  final DateFormat timeFmt;

  const _SendingTile({required this.event, required this.colorScheme, required this.timeFmt});

  @override
  Widget build(BuildContext context) {
    final progress = event.progress ?? 0.0;
    final lines = event.message.split('\n');
    final title = lines.first;
    final subtitle = lines.length > 1 ? lines.last : null;

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.only(top: 2),
            child: Icon(Icons.upload_rounded, color: colorScheme.primary, size: 20),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(title, style: const TextStyle(fontSize: 14)),
                    ),
                    Text(
                      timeFmt.format(event.timestamp),
                      style: TextStyle(fontSize: 11, color: colorScheme.onSurface.withValues(alpha: 0.4)),
                    ),
                  ],
                ),
                if (subtitle != null) ...[
                  const SizedBox(height: 4),
                  Text(
                    subtitle,
                    style: TextStyle(fontSize: 12, color: colorScheme.onSurface.withValues(alpha: 0.6)),
                  ),
                ],
                const SizedBox(height: 6),
                LinearProgressIndicator(
                  value: progress,
                  backgroundColor: colorScheme.surfaceContainerHighest,
                  color: colorScheme.primary,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
