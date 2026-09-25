import { nativeWalletAccess } from "@/services/wallet/access";
/* eslint-disable @typescript-eslint/no-require-imports -- Load diagnostic entry points only behind the development gate. */
import "./global.css";
import { AppRoot } from "@/application/AppRoot";
import { validatePasskeyMode } from "@/config/passkeys";
import { resolveDebugScreen } from "@/config/debugScreen";

const mode = validatePasskeyMode(process.env.EXPO_PUBLIC_PASSKEY_MODE ?? "native");
const debugScreen = resolveDebugScreen(process.env.EXPO_PUBLIC_DEBUG_SCREEN, mode, __DEV__);
function NativeApp() {
  return <AppRoot accessService={nativeWalletAccess} />;
}
let Entry = mode === "native" ? NativeApp : AppRoot;
if (__DEV__ && debugScreen === "ui") {
  Entry = require("./src/development/PreviewDebugApp").PreviewDebugApp;
}
export default Entry;
