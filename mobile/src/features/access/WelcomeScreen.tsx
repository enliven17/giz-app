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
      <Typography variant="label">Gizu</Typography>
      <AmbientArtwork />
      <View className="mt-auto gap-5">
        <Typography variant="title">
          Private{" "}
          <Typography variant="title" style={{ color: colors.accent }}>
            capital
          </Typography>
          {"\n"}without the gate.
        </Typography>
        <Typography>Explore curated private vaults and investment strategies.</Typography>
        <Button label="Get started" onPress={() => navigation.navigate("Access")} />
        <Button
          label="I have access"
          variant="quiet"
          onPress={() => navigation.navigate("Access")}
        />
      </View>
    </Screen>
  );
}
