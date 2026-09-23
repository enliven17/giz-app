import type { OperationKind } from "@/domain/transactions";
import type { NavigatorScreenParams } from "@react-navigation/native";
export type MainTabParamList = {
  Home: undefined;
  Vaults: undefined;
  Exchange: undefined;
  Settings: undefined;
};
export type RootStackParamList = {
  Welcome: undefined;
  Access: undefined;
  RequestAccess: undefined;
  Main: NavigatorScreenParams<MainTabParamList>;
  Preview: undefined;
  VaultDetail: { id: string };
  Activity: undefined;
  Transaction: { kind?: OperationKind; vaultId?: string; resume?: boolean };
};
