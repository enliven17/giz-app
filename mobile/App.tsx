import "./global.css";
import { AppRoot } from "@/application/AppRoot";
import { validatePasskeyMode } from "@/config/passkeys";

// Reject stale real-passkey modes instead of silently opening the demo.
validatePasskeyMode(process.env.EXPO_PUBLIC_PASSKEY_MODE);
export default AppRoot;
