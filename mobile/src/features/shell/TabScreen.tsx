import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Screen } from "@/components/templates/Screen";
import { Typography } from "@/components/atoms/Typography";
import { Button } from "@/components/atoms/Button";
import { Notice } from "@/components/molecules/Notice";
import { useSession } from "@/application/SessionProvider";
import type { MainTabParamList, RootStackParamList } from "@/navigation/types";
const copy = {
  Home: "Portfolio overview will arrive in the next slice.",
  Vaults: "Vault discovery will arrive in the next slice.",
  Exchange: "Exchange simulation is not available yet.",
  Settings: "Your demo session exists only in memory and ends when the app restarts.",
};
export function TabScreen({ route, navigation }: BottomTabScreenProps<MainTabParamList>) {
  const { session, disconnect } = useSession();
  return (
    <Screen>
      <Typography variant="heading">
        {route.name === "Home"
          ? "Your portfolio"
          : route.name === "Settings"
            ? "Demo settings"
            : `${route.name} preview`}
      </Typography>
      <Notice message="Demo mode — no real funds or transactions." />
      <Typography>{copy[route.name]}</Typography>
      {route.name === "Settings" && (
        <>
          <Typography>Access method: {session?.method}</Typography>
          <Button
            label="Open UI preview"
            variant="secondary"
            onPress={() =>
              navigation
                .getParent<NativeStackNavigationProp<RootStackParamList>>()
                ?.navigate("Preview")
            }
          />
          <Button variant="destructive" label="Disconnect demo" onPress={disconnect} />
        </>
      )}
    </Screen>
  );
}
