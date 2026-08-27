#!/bin/bash

set -e

cd "$(dirname "$0")/../rust"

echo "🦀 Building Rust library for iOS..."

# Detect if building for simulator or device
if [[ "$PLATFORM_NAME" == *"simulator"* ]]; then
    echo "Building for iOS Simulator..."

    # Add target if not already added
    rustup target add aarch64-apple-ios-sim 2>/dev/null || true

    # Build for simulator
    cargo build --release --target aarch64-apple-ios-sim

    # Copy to Frameworks
    mkdir -p ../ios/Frameworks
    cp target/aarch64-apple-ios-sim/release/libtypst_ffi.a ../ios/Frameworks/
else
    echo "Building for iOS Device..."

    # Add target if not already added
    rustup target add aarch64-apple-ios 2>/dev/null || true

    # Build for device
    cargo build --release --target aarch64-apple-ios

    # Copy to Frameworks
    mkdir -p ../ios/Frameworks
    cp target/aarch64-apple-ios/release/libtypst_ffi.a ../ios/Frameworks/
fi

echo "✅ Rust library build complete"

