import { GizuLogo } from "@/components/atoms/GizuLogo";
import colors from "@/theme/colors.json";
import { View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Screen } from "@/components/templates/Screen";
import { Typography } from "@/components/atoms/Typography";
import { Button } from "@/components/atoms/Button";
import { AmbientArtwork } from "@/components/molecules/AmbientArtwork";
import type { RootStackParamList } from "@/navigation/types";
export function WelcomeScreen({
  navigation,
}: NativeStackScreenProps<RootStackParamList, "Welcome">) {
  return (
    <Screen>
      <View className="flex-row items-center gap-3">
        <GizuLogo />
        <Typography variant="row">Gizu</Typography>
      </View>
      <AmbientArtwork />
      <View className="mt-auto gap-5">
        <Typography variant="title">
          <Typography variant="title" style={{ color: colors.accent }}>
            DeFi
          </Typography>{" "}
          in
          {"\n"}
          <Typography variant="title" style={{ color: colors.accent }}>
            Stealth
          </Typography>{" "}
          Mode
        </Typography>
        <Typography>Explore curated confidential vaults and investment strategies.</Typography>
        <Button label="Get started" onPress={() => navigation.navigate("Access")} />
        <Button
          label="Request access"
          variant="quiet"
          onPress={() => navigation.navigate("RequestAccess")}
        />
      </View>
    </Screen>
  );
}
