/* eslint-disable @typescript-eslint/no-require-imports -- Load diagnostic entry points only behind the development gate. */
import "./global.css";
import { AppRoot } from "@/application/AppRoot";
import { validatePasskeyMode } from "@/config/passkeys";
import { resolveDebugScreen } from "@/config/debugScreen";

const debugScreen = resolveDebugScreen(
  process.env.EXPO_PUBLIC_DEBUG_SCREEN,
  validatePasskeyMode(process.env.EXPO_PUBLIC_PASSKEY_MODE),
  __DEV__,
);
let Entry = AppRoot;
if (__DEV__ && debugScreen === "wallet") {
  Entry = require("./src/development/WalletDebugApp").WalletDebugApp;
} else if (__DEV__ && debugScreen === "signer") {
  Entry = require("./src/development/native-probe/NativeProbeScreen").NativeProbeApp;
} else if (__DEV__ && debugScreen === "ui") {
  Entry = require("./src/development/PreviewDebugApp").PreviewDebugApp;
}
export default Entry;
