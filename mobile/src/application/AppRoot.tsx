import { WalletScreen, type WalletDependencies } from "@/features/wallet/WalletScreen";
import { AccountProvider, type AccountDependencies } from "@/features/account/AccountProvider";
import { NotificationProvider } from "@/features/notifications/NotificationProvider";
import type { NotificationService } from "@/services/notifications";
import { TransactionProvider } from "@/features/transactions/TransactionProvider";
import type { TransactionService } from "@/services/transactions";
import { EarlyAccessProvider } from "@/features/access/EarlyAccessProvider";
import type { EarlyAccessService } from "@/services/earlyAccess";
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
function AppNavigation({
  investmentService,
  transactionService,
  accountDependencies,
  notificationService,
  walletDependencies,
}: {
  investmentService?: InvestmentService;
  transactionService?: TransactionService;
  accountDependencies?: AccountDependencies;
  notificationService?: NotificationService;
  walletDependencies?: WalletDependencies;
}) {
  const { session } = useSession();
  if (session?.kind === "testnet") {
    return (
      <WalletScreen key={session.accountId} session={session} dependencies={walletDependencies} />
    );
  }
  return (
    <NavigationContainer
      key={session ? `demo:${session.accountId ?? "default"}` : "guest"}
      theme={theme}
      linking={createLinking(!!session)}
    >
      {session ? (
        <InvestmentProvider service={investmentService}>
          <TransactionProvider service={transactionService}>
            <AccountProvider {...accountDependencies}>
              <NotificationProvider service={notificationService}>
                <RootNavigator />
              </NotificationProvider>
            </AccountProvider>
          </TransactionProvider>
        </InvestmentProvider>
      ) : (
        <RootNavigator />
      )}
    </NavigationContainer>
  );
}
export function AppRoot({
  accessService,
  earlyAccessService,
  investmentService,
  transactionService,
  accountDependencies,
  notificationService,
  walletDependencies,
}: {
  accessService?: AccessService;
  earlyAccessService?: EarlyAccessService;
  investmentService?: InvestmentService;
  transactionService?: TransactionService;
  accountDependencies?: AccountDependencies;
  notificationService?: NotificationService;
  walletDependencies?: WalletDependencies;
}) {
  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <SessionProvider accessService={accessService}>
          <EarlyAccessProvider service={earlyAccessService}>
            <StatusBar style="light" />
            <AppNavigation
              walletDependencies={walletDependencies}
              accountDependencies={accountDependencies}
              notificationService={notificationService}
              investmentService={investmentService}
              transactionService={transactionService}
            />
          </EarlyAccessProvider>
        </SessionProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
