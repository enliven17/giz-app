set shell := ["sh", "-cu"]
set windows-shell := ["cmd.exe", "/D", "/C"]

mobile-install:
    npm --prefix mobile ci

mobile-start:
    npm --prefix mobile start

mobile-check:
    npm --prefix mobile run check

mobile-test:
    npm --prefix mobile run test:functional

mobile-android:
    npm --prefix mobile run android

# Requires macOS and Xcode.
mobile-ios:
    npm --prefix mobile run ios
