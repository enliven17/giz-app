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
  WalletPicker: undefined;
  Main: NavigatorScreenParams<MainTabParamList>;
  Preview: undefined;
};
