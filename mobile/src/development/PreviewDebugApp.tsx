import { SafeAreaProvider } from "react-native-safe-area-context";
import { InvestmentProvider } from "@/features/investments/InvestmentProvider";
import { PreviewScreen } from "./PreviewScreen";

export function PreviewDebugApp() {
  return (
    <SafeAreaProvider>
      <InvestmentProvider>
        <PreviewScreen />
      </InvestmentProvider>
    </SafeAreaProvider>
  );
}
