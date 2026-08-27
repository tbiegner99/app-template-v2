/// BLE service UUID unique to __SLUG_UPPER__. Only devices advertising this are accepted.
const k__SLUG_TITLE__ServiceUuid = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';

/// Peripheral notifies on this; central receives data FROM the peripheral.
const k__SLUG_TITLE__RxCharUuid = '6e400002-b5a3-f393-e0a9-e50e24dcca9e';

/// Central writes to this; peripheral receives data FROM the central (sender).
const k__SLUG_TITLE__TxCharUuid = '6e400003-b5a3-f393-e0a9-e50e24dcca9e';

/// Peripheral exposes the logged-in user's display name here (read-only).
const k__SLUG_TITLE__UserInfoCharUuid = '6e400004-b5a3-f393-e0a9-e50e24dcca9e';

/// __SLUG_UPPER__ manufacturer ID used to embed the display name in advertisement packets.
/// Using a private/test range ID (0xFFFF) — replace with a registered ID for production.
const k__SLUG_TITLE__ManufacturerId = 0xFFFF;
