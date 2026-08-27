import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'dart:typed_data';

import 'package:bluetooth_low_energy/bluetooth_low_energy.dart';

import 'ble_constants.dart';
import '__SLUG___packet.dart';

enum BleEventType { connected, disconnected, dataReceived, rejected, error }

class BleEvent {
  final DateTime timestamp;
  final BleEventType type;
  final String deviceName;
  final String? details;
  final Uint8List? imageData;

  BleEvent({
    required this.type,
    required this.deviceName,
    this.details,
    this.imageData,
  }) : timestamp = DateTime.now();
}

class BleReceiveService {
  final _eventsController = StreamController<BleEvent>.broadcast();
  final _listeningController = StreamController<bool>.broadcast();

  Stream<BleEvent> get events => _eventsController.stream;
  Stream<bool> get listeningState => _listeningController.stream;

  bool _listening = false;
  bool get isListening => _listening;

  final _peripheral = PeripheralManager();
  final List<StreamSubscription> _subs = [];
  StreamSubscription? _stateChangedSub;

  // Accumulate incoming bytes per central UUID until a complete packet arrives.
  final Map<String, List<int>> _buffers = {};

  BleReceiveService() {
    // Keep a permanent stateChanged subscriber alive. Without it the Android
    // BLE stack's internal callbacks have no outlet and advertising calls hang.
    _stateChangedSub = _peripheral.stateChanged.listen((_) {});
  }

  Future<BluetoothLowEnergyState> _resolvedState() async {
    var current = _peripheral.state;

    if (current == BluetoothLowEnergyState.unknown) {
      current = await _peripheral.stateChanged
          .map((e) => e.state)
          .firstWhere((s) => s != BluetoothLowEnergyState.unknown)
          .timeout(const Duration(seconds: 5), onTimeout: () => _peripheral.state);
    }

    if (current == BluetoothLowEnergyState.unauthorized && Platform.isAndroid) {
      await _peripheral.authorize();
      current = await _peripheral.stateChanged
          .map((e) => e.state)
          .firstWhere((s) => s != BluetoothLowEnergyState.unauthorized)
          .timeout(const Duration(seconds: 30), onTimeout: () => _peripheral.state);
    }

    return current;
  }

  Future<void> startListening({String localName = '__SLUG_UPPER__'}) async {
    if (localName.trim().isEmpty) localName = '__SLUG_UPPER__';
    if (_listening) return;

    final state = await _resolvedState();
    if (state != BluetoothLowEnergyState.poweredOn) {
      _eventsController.add(BleEvent(type: BleEventType.error, deviceName: '', details: 'bluetooth_off'));
      return;
    }

    await _peripheral.removeAllServices();
    await _peripheral.addService(_build__SLUG_TITLE__Service(localName));

    final nameBytes = Uint8List.fromList(utf8.encode(localName));
    final advertisement = Platform.isIOS
        ? Advertisement(
            name: localName,
            serviceUUIDs: [UUID.fromString(k__SLUG_TITLE__ServiceUuid)],
            manufacturerSpecificData: const [],
          )
        : Advertisement(
            name: localName,
            serviceUUIDs: const [],
            manufacturerSpecificData: [
              ManufacturerSpecificData(id: k__SLUG_TITLE__ManufacturerId, data: nameBytes),
            ],
          );
    await _peripheral.startAdvertising(advertisement);

    _subs.add(_peripheral.characteristicWriteRequested.listen((e) async {
      await _peripheral.respondWriteRequest(e.request);
      final centralId = e.central.uuid.toString();
      final buf = _buffers.putIfAbsent(centralId, () => []);
      buf.addAll(e.request.value);

      try {
        final packet = __SLUG_TITLE__Packet.tryParse(buf);
        if (packet != null) {
          _buffers.remove(centralId);
          final isImage = packet.contentType.startsWith('image/');
          _eventsController.add(BleEvent(
            type: BleEventType.dataReceived,
            deviceName: packet.from.isNotEmpty ? packet.from : centralId,
            details: isImage ? null : packet.bodyText,
            imageData: isImage ? packet.body : null,
          ));
        }
      } on FormatException {
        _buffers.remove(centralId);
        _eventsController.add(BleEvent(
          type: BleEventType.rejected,
          deviceName: centralId,
          details: 'Malformed packet',
        ));
      }
    }));

    _subs.add(_peripheral.characteristicReadRequested.listen((e) async {
      if (e.characteristic.uuid == UUID.fromString(k__SLUG_TITLE__UserInfoCharUuid)) {
        await _peripheral.respondReadRequestWithValue(
          e.request,
          value: Uint8List.fromList(utf8.encode(localName)),
        );
      }
    }));

    _listening = true;
    _listeningController.add(true);
  }

  GATTService _build__SLUG_TITLE__Service(String localName) {
    return GATTService(
      uuid: UUID.fromString(k__SLUG_TITLE__ServiceUuid),
      isPrimary: true,
      includedServices: [],
      characteristics: [
        // TX: central writes packet chunks to this characteristic.
        GATTCharacteristic.mutable(
          uuid: UUID.fromString(k__SLUG_TITLE__TxCharUuid),
          properties: [
            GATTCharacteristicProperty.write,
            GATTCharacteristicProperty.writeWithoutResponse,
          ],
          permissions: [GATTCharacteristicPermission.write],
          descriptors: [],
        ),
        // User info: central reads the peripheral's display name from here.
        GATTCharacteristic.immutable(
          uuid: UUID.fromString(k__SLUG_TITLE__UserInfoCharUuid),
          value: Uint8List.fromList(utf8.encode(localName)),
          descriptors: [],
        ),
      ],
    );
  }

  Future<void> stopListening() async {
    if (!_listening) return;
    await _peripheral.stopAdvertising();
    await _peripheral.removeAllServices();
    for (final sub in _subs) {
      await sub.cancel();
    }
    _subs.clear();
    _buffers.clear();
    _listening = false;
    _listeningController.add(false);
  }

  void dispose() {
    stopListening();
    _stateChangedSub?.cancel();
    _eventsController.close();
    _listeningController.close();
  }
}
