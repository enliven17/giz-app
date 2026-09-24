import "./global.css";
import { AppRoot } from "@/application/AppRoot";
import { NativeProbeApp } from "@/features/native-probe/NativeProbeScreen";
import { validatePasskeyMode } from "@/config/passkeys";

// Reject stale real-passkey modes instead of silently opening the demo.
const mode = validatePasskeyMode(process.env.EXPO_PUBLIC_PASSKEY_MODE);
if (mode === "native-probe" && !__DEV__) throw new Error("Native probe is development-only.");
export default mode === "native-probe" ? NativeProbeApp : AppRoot;
