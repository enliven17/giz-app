import "./global.css";
import { AppRoot } from "@/application/AppRoot";
import { validatePasskeyMode } from "@/config/passkeys";
import { PasskeyProbeApp } from "@/application/PasskeyProbeApp";

// Also validate Metro/OTA startup, which does not necessarily evaluate Expo config.
const mode = validatePasskeyMode(process.env.EXPO_PUBLIC_PASSKEY_MODE);
export default mode === "probe" ? PasskeyProbeApp : AppRoot;
