#!/bin/sh
set -eu
ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
export PATH="$HOME/.cargo/bin:$PATH"
cd "$ROOT/core"
MODE=${1:-all}
case "$MODE" in all|android|ios) ;; *) echo "Usage: build.sh [all|android|ios]" >&2; exit 2 ;; esac
case "$(uname -s)" in
  Darwin) HOST_LIBRARY=target/debug/libgizu_signer_core.dylib; NDK_HOST=darwin-x86_64 ;;
  Linux) HOST_LIBRARY=target/debug/libgizu_signer_core.so; NDK_HOST=linux-x86_64
    if [ "$MODE" != android ]; then echo "Linux supports the android target only" >&2; exit 2; fi ;;
  *) echo "Use macOS, or Linux for Android" >&2; exit 2 ;;
esac
cargo build --locked --features cli
mkdir -p "$ROOT/generated"
target/debug/uniffi-bindgen generate --library "$HOST_LIBRARY" --language swift --language kotlin --out-dir "$ROOT/generated" --no-format
if [ "$MODE" = all ] || [ "$MODE" = android ]; then
  SDK=${ANDROID_HOME:-"$HOME/Library/Android/sdk"}
  NDK=${ANDROID_NDK_HOME:-"$SDK/ndk/27.1.12297006"}
  export CARGO_TARGET_AARCH64_LINUX_ANDROID_LINKER="$NDK/toolchains/llvm/prebuilt/$NDK_HOST/bin/aarch64-linux-android24-clang"
  cargo build --locked --release --lib --target aarch64-linux-android
  mkdir -p "$ROOT/android/src/main/jniLibs/arm64-v8a"
  cp target/aarch64-linux-android/release/libgizu_signer_core.so "$ROOT/android/src/main/jniLibs/arm64-v8a/"
fi
if [ "$MODE" = all ] || [ "$MODE" = ios ]; then
  cargo build --locked --release --lib --target aarch64-apple-ios
  cargo build --locked --release --lib --target aarch64-apple-ios-sim
  mkdir -p "$ROOT/generated/headers" "$ROOT/ios/Generated"
  cp "$ROOT/generated/gizu_signer_coreFFI.h" "$ROOT/generated/headers/"
  cp "$ROOT/generated/gizu_signer_coreFFI.modulemap" "$ROOT/generated/headers/module.modulemap"
  cp "$ROOT/generated/gizu_signer_core.swift" "$ROOT/ios/Generated/"
  # xcodebuild requires a fresh generated output; never touches source/signing keys.
  if [ -d "$ROOT/ios/GizuSignerCore.xcframework" ]; then
    rm -rf "$ROOT/ios/GizuSignerCore.xcframework"
  fi
  xcodebuild -create-xcframework \
    -library target/aarch64-apple-ios/release/libgizu_signer_core.a -headers "$ROOT/generated/headers" \
    -library target/aarch64-apple-ios-sim/release/libgizu_signer_core.a -headers "$ROOT/generated/headers" \
    -output "$ROOT/ios/GizuSignerCore.xcframework"
fi
