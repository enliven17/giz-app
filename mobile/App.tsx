import "./global.css";
import { nativeWalletAccess } from "@/services/nativeWallet";
import { AppRoot } from "@/application/AppRoot";
import { NativeProbeApp } from "@/features/native-probe/NativeProbeScreen";
import { validatePasskeyMode } from "@/config/passkeys";

// Reject stale real-passkey modes instead of silently opening the demo.
const mode = validatePasskeyMode(process.env.EXPO_PUBLIC_PASSKEY_MODE);
if (mode !== "mock" && !__DEV__) throw new Error("Native probe is development-only.");
function WalletApp() {
  return <AppRoot accessService={nativeWalletAccess} />;
}
export default mode === "native-probe" ? NativeProbeApp : mode === "native" ? WalletApp : AppRoot;
