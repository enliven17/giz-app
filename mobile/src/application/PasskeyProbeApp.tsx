import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { PasskeyProbeScreen } from "@/features/passkey-probe/PasskeyProbeScreen";
import { nativeMeraProbe } from "@/services/nativeMeraProbe";
import { ErrorBoundary } from "./ErrorBoundary";

export function PasskeyProbeApp() {
  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <StatusBar style="light" />
        <PasskeyProbeScreen service={nativeMeraProbe} />
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
