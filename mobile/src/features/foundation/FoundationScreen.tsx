import { Text, View } from "react-native";
import { ShieldCheck } from "lucide-react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Button } from "@/components/atoms/Button";
import { Screen } from "@/components/templates/Screen";
import type { RootStackParamList } from "@/navigation/types";
import colors from "@/theme/colors.json";

export function FoundationScreen({
  navigation,
}: NativeStackScreenProps<RootStackParamList, "Foundation">) {
  return (
    <Screen>
      <ShieldCheck
        color={colors.accent}
        size={36}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      />
      <View className="gap-3">
        <Text accessibilityRole="header" className="text-3xl font-bold text-text">
          Nexum mobile
        </Text>
        <Text className="text-base leading-6 text-muted">
          Development foundation. Investment features will follow.
        </Text>
        <Text className="text-base text-accent">
          Demo only — no real funds or wallet connection.
        </Text>
      </View>
      <Button label="Explore foundation" onPress={() => navigation.navigate("Details")} />
    </Screen>
  );
}
