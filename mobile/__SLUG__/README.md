# mobile

__DISPLAY_NAME__

## Getting Started

This project is a Flutter application that uses Rust for native Typst document compilation.

### Prerequisites

- Flutter SDK (^3.10.4)
- Rust toolchain (for native library compilation)
- For iOS: Xcode with command line tools
- For Android: Android NDK

### First Time Setup

1. **Install Flutter dependencies:**
   ```bash
   flutter pub get
   ```

2. **Setup Rust build environment:**
   ```bash
   ./setup_rust.sh
   ```

   This script will:
    - Check if Rust is installed
    - Install required Rust targets for iOS and Android
    - Attempt to locate your Android NDK
    - Build the Typst FFI library for the first time

3. **If Rust is not installed**, follow the instructions from the setup script:
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   ```
   Then restart your terminal and run `./setup_rust.sh` again.

### Building the App

The Rust library is automatically built during Flutter compilation:

```bash
flutter run
```

For platform-specific builds:

```bash
# iOS
flutter build ios

# Android
flutter build apk
```

### Rust Build System

The Typst FFI library is written in Rust and automatically compiled during the build process:

- **Android**: Gradle task in `android/app/build.gradle.kts` runs `rust/build.sh android` before
  compilation
- **iOS**: Pre-install hook in `ios/Podfile` runs `rust/build.sh ios` before pod installation

For more details, see [RUST_BUILD.md](RUST_BUILD.md).

### Manual Rust Build

If you need to manually rebuild the Rust library:

```bash
cd rust
./build.sh all        # Build for all platforms
./build.sh ios        # iOS only
./build.sh android    # Android only
```

### Typst Integration

This app includes Typst document compilation capabilities via FFI. See the `TypstPreview` component
for usage examples.

### Resources

- [Flutter Documentation](https://docs.flutter.dev/)
- [Typst Documentation](https://typst.app/docs/)
- [Rust FFI Documentation](https://doc.rust-lang.org/nomicon/ffi.html)

