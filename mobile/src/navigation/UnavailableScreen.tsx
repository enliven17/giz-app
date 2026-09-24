import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "./types";
import { BackAction } from "./BackAction";
import { Screen } from "@/components/templates/Screen";
import { Typography } from "@/components/atoms/Typography";

const titles: Record<string, string> = {
  Transaction: "Transfers",
  Activity: "Activity",
  Notifications: "Notifications",
  VaultDetail: "Vault details",
};
export function UnavailableScreen({ route }: NativeStackScreenProps<RootStackParamList>) {
  return (
    <Screen>
      <BackAction fallback="Home" />
      <Typography variant="title">{titles[route.name] ?? "Unavailable"}</Typography>
      <Typography>This service is not connected to your wallet yet.</Typography>
    </Screen>
  );
}
