import { InvestmentProvider } from "@/features/investments/InvestmentProvider";
import type { InvestmentService } from "@/services/investments";
import { DarkTheme, NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { RootNavigator } from "@/navigation/RootNavigator";
import colors from "@/theme/colors.json";
import { SessionProvider, useSession } from "./SessionProvider";
import type { AccessService } from "@/services/access";
import { createLinking } from "@/navigation/linking";
import { ErrorBoundary } from "./ErrorBoundary";
const theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: colors.accent,
    background: colors.ink,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
  },
};
function AppNavigation({ investmentService }: { investmentService?: InvestmentService }) {
  const { session } = useSession();
  return (
    <NavigationContainer
      key={session ? "demo" : "guest"}
      theme={theme}
      linking={createLinking(!!session)}
    >
      {session ? (
        <InvestmentProvider service={investmentService}>
          <RootNavigator />
        </InvestmentProvider>
      ) : (
        <RootNavigator />
      )}
    </NavigationContainer>
  );
}
export function AppRoot({
  accessService,
  investmentService,
}: {
  accessService?: AccessService;
  investmentService?: InvestmentService;
}) {
  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <SessionProvider accessService={accessService}>
          <StatusBar style="light" />
          <AppNavigation investmentService={investmentService} />
        </SessionProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
