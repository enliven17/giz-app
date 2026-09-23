import { View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { IconButton } from "@/components/atoms/IconButton";
import { ChevronLeft } from "lucide-react-native";
import type { MainTabParamList, RootStackParamList } from "./types";

// Lives in screen content; this is not a fixed navigation bar.
export function BackAction({ fallback }: { fallback?: keyof MainTabParamList }) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  return (
    <View className="self-start">
      <IconButton
        label="Back"
        icon={ChevronLeft}
        onPress={() => {
          if (navigation.canGoBack()) navigation.goBack();
          else if (fallback) navigation.navigate("Main", { screen: fallback });
          else navigation.navigate("Welcome");
        }}
      />
    </View>
  );
}
