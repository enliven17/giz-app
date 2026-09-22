import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { FoundationScreen } from "@/features/foundation/FoundationScreen";
import { DetailsScreen } from "@/features/foundation/DetailsScreen";
import type { RootStackParamList } from "./types";
const Stack = createNativeStackNavigator<RootStackParamList>();
export function RootNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Foundation"
        component={FoundationScreen}
        options={{ title: "Nexum Dev" }}
      />
      <Stack.Screen name="Details" component={DetailsScreen} options={{ title: "Foundation" }} />
    </Stack.Navigator>
  );
}
