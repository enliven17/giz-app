import { View } from "react-native";
import { Fingerprint, ShieldCheck, Bell, Globe, FileText, LifeBuoy } from "lucide-react-native";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Screen } from "@/components/templates/Screen";
import { Typography } from "@/components/atoms/Typography";
import { Button } from "@/components/atoms/Button";
import { Surface } from "@/components/molecules/Surface";
import { GroupedRow } from "@/components/molecules/GroupedRow";
import { useSession } from "@/application/SessionProvider";
import { profileFixture as profile } from "@/services/fixtures/profile";
import type { MainTabParamList, RootStackParamList } from "@/navigation/types";
const groups = [
  {
    title: "Security",
    rows: [
      { label: "Passkey wallet", icon: Fingerprint },
      { label: "Transaction signing", icon: ShieldCheck },
      { label: "Push alerts", icon: Bell },
    ],
  },
  {
    title: "Preferences",
    rows: [
      { label: "Currency", icon: Globe },
      { label: "Statements", icon: FileText },
    ],
  },
  {
    title: "Support",
    rows: [
      { label: "Contact desk", icon: LifeBuoy },
      { label: "Terms and disclosures", icon: FileText },
    ],
  },
];
export function TabScreen({ route, navigation }: BottomTabScreenProps<MainTabParamList>) {
  const { session, disconnect } = useSession();
  return (
    <Screen>
      <Typography variant="title">{route.name === "Settings" ? "Account" : "Exchange"}</Typography>
      {route.name === "Settings" ? (
        <>
          <Surface>
            <View className="flex-row items-center gap-4 p-5">
              <View className="rounded-2xl bg-accent/10 p-4">
                <Typography variant="label">{profile.initials}</Typography>
              </View>
              <View className="flex-1 gap-1">
                <Typography variant="row">{profile.name}</Typography>
                <Typography variant="caption">{profile.member}</Typography>
              </View>
            </View>
          </Surface>
          <Typography variant="caption">
            Access method: {session?.method === "Demo passkey" ? "Passkey" : session?.method}
          </Typography>
          {groups.map((group) => (
            <View key={group.title} className="gap-3">
              <Typography variant="caption">{group.title}</Typography>
              <Surface>
                {group.rows.map((row) => (
                  <GroupedRow
                    key={row.label}
                    {...row}
                    value="Unavailable"
                    onPress={() => {}}
                    disabled
                  />
                ))}
              </Surface>
            </View>
          ))}
          <Button
            label="Open UI preview"
            variant="quiet"
            onPress={() =>
              navigation
                .getParent<NativeStackNavigationProp<RootStackParamList>>()
                ?.navigate("Preview")
            }
          />
          <Button variant="destructive" label="Disconnect" onPress={disconnect} />
          <Typography variant="caption">Gizu v0.1.0</Typography>
        </>
      ) : (
        <Surface>
          <View className="gap-4 p-6">
            <Typography>Exchange is not available yet.</Typography>
            <Typography variant="caption">
              Trading and transfers will arrive in the next release.
            </Typography>
            <Button label="Exchange" disabled onPress={() => {}} />
          </View>
        </Surface>
      )}
    </Screen>
  );
}
