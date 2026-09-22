import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Screen } from "@/components/templates/Screen";
import { Typography } from "@/components/atoms/Typography";
import { Button } from "@/components/atoms/Button";
import { BrandMark } from "@/components/molecules/BrandMark";
import { Notice } from "@/components/molecules/Notice";
import type { RootStackParamList } from "@/navigation/types";
export function WelcomeScreen({
  navigation,
}: NativeStackScreenProps<RootStackParamList, "Welcome">) {
  return (
    <Screen>
      <BrandMark />
      <Typography variant="title">Private capital, without the gate.</Typography>
      <Typography>Explore the Gizu investment experience.</Typography>
      <Notice message="Demo only — no real funds, wallet connection or credentials." />
      <Button label="Get started" onPress={() => navigation.navigate("Access")} />
      <Button
        label="I have access"
        variant="secondary"
        onPress={() => navigation.navigate("Access")}
      />
    </Screen>
  );
}
