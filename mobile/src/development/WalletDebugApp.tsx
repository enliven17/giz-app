import { AppRoot } from "@/application/AppRoot";
import type { AccessService } from "@/services/access";
import { nativeWalletAccess } from "@/services/nativeWallet";
import { WalletScreen, type WalletDependencies } from "./wallet/WalletScreen";

/** Standalone native-wallet harness, never part of the product navigator. */
export function WalletDebugApp({
  accessService = nativeWalletAccess,
  walletDependencies,
}: {
  accessService?: AccessService;
  walletDependencies?: WalletDependencies;
}) {
  return (
    <AppRoot
      accessService={accessService}
      renderNativeSession={(session) => (
        <WalletScreen key={session.accountId} session={session} dependencies={walletDependencies} />
      )}
    />
  );
}
