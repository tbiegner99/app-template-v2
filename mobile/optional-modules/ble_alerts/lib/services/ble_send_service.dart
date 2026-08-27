import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'dart:typed_data';

import 'package:flutter_blue_plus/flutter_blue_plus.dart';

import '../core/auth/session_info.dart';
import 'ble_constants.dart';
import '__SLUG___packet.dart';

String _nameFromScanResult(ScanResult r) {
  // 1. Manufacturer-specific data (most reliable, always in primary packet)
  final mfr = r.advertisementData.manufacturerData[k__SLUG_TITLE__ManufacturerId];
  if (mfr != null && mfr.isNotEmpty) {
    return utf8.decode(mfr, allowMalformed: true);
  }
  // 2. Advertisement local name (scan response on iOS, primary on Android)
  if (r.advertisementData.localName.isNotEmpty) {
    return r.advertisementData.localName;
  }
  // 3. Cached platform name
  if (r.device.platformName.isNotEmpty) {
    return r.device.platformName;
  }
  return r.device.remoteId.str;
}

enum BleSendEventType {
  scanning,
  deviceFound,
  connecting,
  connected,
  disconnected,
  sending,
  dataSent,
  error,
}

class BleSendEvent {
  final DateTime timestamp;
  final BleSendEventType type;
  final String message;
  final double? progress;

  BleSendEvent({required this.type, required this.message, this.progress})
    : timestamp = DateTime.now();
}

class __SLUG_TITLE__Device {
  final BluetoothDevice device;
  final String displayName;

  __SLUG_TITLE__Device({required this.device, required this.displayName});
}

class BleSendService {
  final _eventsController = StreamController<BleSendEvent>.broadcast();
  final _devicesController = StreamController<List<__SLUG_TITLE__Device>>.broadcast();

  Stream<BleSendEvent> get events => _eventsController.stream;

  Stream<List<__SLUG_TITLE__Device>> get nearbyDevices => _devicesController.stream;

  bool _scanning = false;
  DateTime _lastDeviceEmit = DateTime.fromMillisecondsSinceEpoch(0);

  bool get isScanning => _scanning;

  BluetoothDevice? _connectedDevice;
  BluetoothCharacteristic? _txChar;
  __SLUG_TITLE__Device? _connected__SLUG_TITLE__;

  bool get isConnected => _connectedDevice != null;

  __SLUG_TITLE__Device? get connectedDevice => _connected__SLUG_TITLE__;

  final Map<DeviceIdentifier, __SLUG_TITLE__Device> _found = {};
  StreamSubscription? _scanSub;
  StreamSubscription? _connectionStateSub;
  Timer? _keepAliveTimer;

  Future<void> startScan() async {
    if (_scanning) return;

    final adapterState = await FlutterBluePlus.adapterState.first;
    if (adapterState != BluetoothAdapterState.on) {
      _emit(BleSendEventType.error, 'bluetooth_off');
      return;
    }

    _found.clear();
    _devicesController.add([]);
    _scanning = true;
    _emit(BleSendEventType.scanning, 'Scanning…');

    // Scan without a service UUID filter — the receiver omits service UUIDs
    // from its advertisement to avoid Android advertising hangs on some chipsets.
    // __SLUG_UPPER__ identity is verified during service discovery after connecting.
    await FlutterBluePlus.startScan(continuousUpdates: false);

    _scanSub = FlutterBluePlus.scanResults.listen((results) {
      bool changed = false;
      for (final r in results) {
        // Android receivers advertise manufacturer data; iOS receivers advertise
        // the service UUID. Accept either as a __SLUG_UPPER__ identity signal.
        final hasManufacturerId = r.advertisementData.manufacturerData.containsKey(
          k__SLUG_TITLE__ManufacturerId,
        );
        final hasServiceUuid = r.advertisementData.serviceUuids.any(
          (u) => u.str128.toLowerCase() == k__SLUG_TITLE__ServiceUuid,
        );
        if (!hasManufacturerId && !hasServiceUuid) continue;
        final id = r.device.remoteId;
        final name = _nameFromScanResult(r);
        final existing = _found[id];
        // Update if we now have a real name where before we only had the address
        if (existing != null && existing.displayName == id.str && name != id.str) {
          _found[id] = __SLUG_TITLE__Device(device: r.device, displayName: name);
          changed = true;
          continue;
        }
        if (existing != null) continue;
        _found[id] = __SLUG_TITLE__Device(device: r.device, displayName: name);
        changed = true;
        _emit(BleSendEventType.deviceFound, name);
      }
      if (changed) {
        final now = DateTime.now();
        if (now.difference(_lastDeviceEmit).inMilliseconds >= 500) {
          _lastDeviceEmit = now;
          _devicesController.add(List.unmodifiable(_found.values));
        }
      }
    });
  }

  Future<void> stopScan() async {
    await _scanSub?.cancel();
    _scanSub = null;
    // Stop scan only if no connection is active — stopping scan on Android
    // can disrupt an in-progress or newly established connection.
    if (_connectedDevice == null) {
      await FlutterBluePlus.stopScan();
    }
    _scanning = false;
  }

  Future<void> connectTo(__SLUG_TITLE__Device __SLUG__, {int attempt = 1}) async {
    await stopScan();
    _emit(BleSendEventType.connecting, __SLUG__.displayName);

    // Reconstruct device from remote ID on every attempt — stale GATT handles
    // cause error 133 on Android if the same object is reused after scan stop.
    final device = Platform.isAndroid
        ? BluetoothDevice(remoteId: __SLUG__.device.remoteId)
        : __SLUG__.device;

    try {
      // Wait for the scan to fully stop at the OS level before connecting —
      // Samsung devices throw GATT 133 if a connection is attempted while the
      // adapter still considers itself scanning.
      if (Platform.isAndroid) {
        await FlutterBluePlus.isScanning
            .where((scanning) => !scanning)
            .first
            .timeout(const Duration(seconds: 3), onTimeout: () => false);
      }
      // Give the BLE stack time to settle. Backoff increases with each retry
      // (1500ms, 3000ms, 4500ms) to handle slow Samsung chipsets.
      await Future.delayed(Duration(milliseconds: 500 * attempt));
      await device.connect(license: License.free, timeout: const Duration(seconds: 15));
      _connectedDevice = device;
      _connected__SLUG_TITLE__ = __SLUG__;
      _emit(BleSendEventType.connected, __SLUG__.displayName);

      // Try to read the user-info characteristic for the actual display name
      if (Platform.isAndroid) await device.clearGattCache();
      List<BluetoothService> services = await device.discoverServices();

      // On a cold GATT cache clear the peripheral may not be ready yet —
      // retry once after a short pause if the service isn't present.
      var __SLUG__Service = services
          .where((s) => s.uuid.str128.toLowerCase() == k__SLUG_TITLE__ServiceUuid)
          .firstOrNull;
      if (__SLUG__Service == null) {
        await Future.delayed(const Duration(milliseconds: 500));
        services = await device.discoverServices();
        __SLUG__Service = services
            .where((s) => s.uuid.str128.toLowerCase() == k__SLUG_TITLE__ServiceUuid)
            .firstOrNull;
      }

      if (__SLUG__Service != null) {
        final userInfoChar = __SLUG__Service.characteristics
            .where((c) => c.uuid.str128.toLowerCase() == k__SLUG_TITLE__UserInfoCharUuid)
            .firstOrNull;
        if (userInfoChar != null && userInfoChar.properties.read) {
          final bytes = await userInfoChar.read();
          if (bytes.isNotEmpty) {
            final userName = utf8.decode(bytes, allowMalformed: true);
            _emit(BleSendEventType.connected, userName);
          }
        }

        _txChar = __SLUG__Service.characteristics
            .where((c) => c.uuid.str128.toLowerCase() == k__SLUG_TITLE__TxCharUuid)
            .firstOrNull;
      }

      if (_txChar == null) {
        _emit(
          BleSendEventType.error,
          '__SLUG_UPPER__ service${__SLUG__Service == null ? ' not found' : ' found but TX characteristic missing'} on remote device',
        );
      }

      // Keep-alive: write a zero-byte packet every 15 s to prevent the Android
      // BLE supervision timeout (~20-40 s) from dropping the connection silently.
      _keepAliveTimer?.cancel();
      if (Platform.isAndroid && _txChar != null) {
        _keepAliveTimer = Timer.periodic(const Duration(seconds: 15), (_) async {
          if (_txChar != null && _connectedDevice != null) {
            await _txChar!.write(Uint8List(0), withoutResponse: true).catchError((_) {});
          }
        });
      }

      // Store subscription so it isn't GC'd — a dropped listener can cause
      // flutter_blue_plus to close the connection on Android.
      await _connectionStateSub?.cancel();
      _connectionStateSub = device.connectionState.listen((state) {
        if (state == BluetoothConnectionState.disconnected) {
          _keepAliveTimer?.cancel();
          _keepAliveTimer = null;
          _connectedDevice = null;
          _connected__SLUG_TITLE__ = null;
          _txChar = null;
          _connectionStateSub?.cancel();
          _connectionStateSub = null;
          FlutterBluePlus.stopScan();
          _emit(BleSendEventType.disconnected, __SLUG__.displayName);
        }
      });
    } catch (e) {
      _connectedDevice = null;
      _connected__SLUG_TITLE__ = null;
      await device.disconnect().catchError((_) {});

      final isGattError = e.toString().contains('133') || e.toString().contains('GATT_ERROR');
      if (isGattError && attempt < 3) {
        if (Platform.isAndroid) await device.clearGattCache().catchError((_) {});
        _emit(BleSendEventType.connecting, '${__SLUG__.displayName} (retry $attempt)');
        return connectTo(__SLUG__, attempt: attempt + 1);
      }
      _emit(
        BleSendEventType.error,
        isGattError
            ? 'Connection failed after $attempt attempt${attempt > 1 ? 's' : ''}. Try toggling Bluetooth.'
            : e.toString(),
      );
    }
  }

  Future<void> _sendPacket(Uint8List bytes, {String label = ''}) async {
    const chunkSize = 512;
    const batchSize = 100;
    final trackProgress = bytes.length > 500;
    var count = 0;
    for (var i = 0; i < bytes.length; i += chunkSize) {
      final chunk = bytes.sublist(i, (i + chunkSize).clamp(0, bytes.length));
      await _txChar!.write(chunk, withoutResponse: true);
      count++;
      if (count % batchSize == 0) {
        if (trackProgress) {
          final sent = (count * chunkSize).clamp(0, bytes.length);
          final pct = ((sent / bytes.length) * 100).round();
          _emit(
            BleSendEventType.sending,
            'Sending $label\n$sent of ${bytes.length} bytes ($pct%)',
            progress: sent / bytes.length,
          );
        }
        await Future.delayed(const Duration(milliseconds: 50));
      }
    }
    if (trackProgress) {
      _emit(
        BleSendEventType.sending,
        'Sending $label\n${bytes.length} of ${bytes.length} bytes (100%)',
        progress: 1.0,
      );
    }
  }

  Future<void> sendImage(Uint8List imageBytes) async {
    if (_connectedDevice == null) {
      _emit(BleSendEventType.error, 'Not connected');
      return;
    }
    if (_txChar == null) {
      _emit(BleSendEventType.error, 'TX characteristic not found on remote device');
      return;
    }
    try {
      final from = SessionInfo.currentUser?.displayName ?? 'Unknown';
      final packet = __SLUG_TITLE__Packet(from: from, contentType: 'image/jpeg', body: imageBytes);
      final encoded = packet.encode();
      await _sendPacket(encoded, label: 'Image (${imageBytes.length} bytes)');
      _emit(BleSendEventType.dataSent, 'Image (${imageBytes.length} bytes)');
    } catch (e) {
      _emit(BleSendEventType.error, e.toString());
    }
  }

  Future<void> sendData(String data) async {
    if (_connectedDevice == null) {
      _emit(BleSendEventType.error, 'Not connected');
      return;
    }
    if (_txChar == null) {
      _emit(BleSendEventType.error, 'TX characteristic not found on remote device');
      return;
    }
    try {
      final from = SessionInfo.currentUser?.displayName ?? 'Unknown';
      final packet = __SLUG_TITLE__Packet(
        from: from,
        contentType: 'text/plain',
        body: Uint8List.fromList(utf8.encode(data)),
      );
      final label = data.length > 60 ? '${data.substring(0, 60)}…' : data;
      await _sendPacket(packet.encode(), label: label);
      _emit(BleSendEventType.dataSent, label);
    } catch (e) {
      _emit(BleSendEventType.error, e.toString());
    }
  }

  Future<void> disconnect() async {
    _keepAliveTimer?.cancel();
    _keepAliveTimer = null;
    await _connectionStateSub?.cancel();
    _connectionStateSub = null;
    await _connectedDevice?.disconnect();
    await FlutterBluePlus.stopScan();
    _connectedDevice = null;
    _connected__SLUG_TITLE__ = null;
    _txChar = null;
  }

  void _emit(BleSendEventType type, String message, {double? progress}) {
    _eventsController.add(BleSendEvent(type: type, message: message, progress: progress));
  }

  void dispose() {
    stopScan();
    disconnect();
    _eventsController.close();
    _devicesController.close();
  }
}
