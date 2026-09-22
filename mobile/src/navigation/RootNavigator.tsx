import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useSession } from "@/application/SessionProvider";
import { WelcomeScreen } from "@/features/access/WelcomeScreen";
import { AccessScreen } from "@/features/access/AccessScreen";
import { WalletPickerScreen } from "@/features/access/WalletPickerScreen";
import { PreviewScreen } from "@/features/shell/PreviewScreen";
import { MainTabs } from "./MainTabs";
import type { RootStackParamList } from "./types";
const Stack = createNativeStackNavigator<RootStackParamList>();
export function RootNavigator() {
  const { session } = useSession();
  return (
    <Stack.Navigator>
      {session ? (
        <Stack.Group navigationKey="demo">
          <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
          <Stack.Screen
            name="Preview"
            component={PreviewScreen}
            options={{ title: "Design system" }}
          />
        </Stack.Group>
      ) : (
        <Stack.Group navigationKey="guest">
          <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ title: "Nexum" }} />
          <Stack.Screen name="Access" component={AccessScreen} options={{ title: "Demo access" }} />
          <Stack.Screen
            name="WalletPicker"
            component={WalletPickerScreen}
            options={{ title: "Demo wallets", presentation: "modal" }}
          />
        </Stack.Group>
      )}
    </Stack.Navigator>
  );
}
