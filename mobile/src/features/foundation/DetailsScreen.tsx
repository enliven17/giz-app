import { Text } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Button } from "@/components/atoms/Button";
import { Screen } from "@/components/templates/Screen";
import type { RootStackParamList } from "@/navigation/types";

export function DetailsScreen({
  navigation,
}: NativeStackScreenProps<RootStackParamList, "Details">) {
  return (
    <Screen>
      <Text accessibilityRole="header" className="text-2xl font-bold text-text">
        Built for native
      </Text>
      <Text className="text-base leading-6 text-muted">
        Shared theme, accessible controls and native navigation are ready for the next product
        slice.
      </Text>
      <Button label="Back to foundation" onPress={() => navigation.goBack()} />
    </Screen>
  );
}
