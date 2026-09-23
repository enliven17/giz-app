import { TransactionScreen } from "@/features/transactions/TransactionScreen";
import { RequestAccessScreen } from "@/features/access/RequestAccessScreen";
import { VaultDetailScreen } from "@/features/investments/VaultDetailScreen";
import { ActivityScreen } from "@/features/investments/ActivityScreen";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useSession } from "@/application/SessionProvider";
import { WelcomeScreen } from "@/features/access/WelcomeScreen";
import { AccessScreen } from "@/features/access/AccessScreen";
import { PreviewScreen } from "@/features/shell/PreviewScreen";
import { MainTabs } from "./MainTabs";
import type { RootStackParamList } from "./types";
const Stack = createNativeStackNavigator<RootStackParamList>();
export function RootNavigator() {
  const { session } = useSession();
  return (
    <Stack.Navigator
      initialRouteName={session ? "Main" : "Welcome"}
      screenOptions={{ headerShown: false }}
    >
      {session ? (
        <Stack.Group navigationKey="demo">
          <Stack.Screen
            name="Transaction"
            component={TransactionScreen}
            options={{ presentation: "modal" }}
          />
          <Stack.Screen
            name="VaultDetail"
            component={VaultDetailScreen}
            options={{ title: "Vault details" }}
          />
          <Stack.Screen
            name="Activity"
            component={ActivityScreen}
            options={{ title: "Activity" }}
          />
          <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
          <Stack.Screen
            name="Preview"
            component={PreviewScreen}
            options={{ title: "Design system" }}
          />
        </Stack.Group>
      ) : (
        <Stack.Group navigationKey="guest">
          <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ title: "Gizu" }} />
          <Stack.Screen
            name="RequestAccess"
            component={RequestAccessScreen}
            options={{ presentation: "modal" }}
          />
          <Stack.Screen name="Access" component={AccessScreen} options={{ title: "Demo access" }} />
        </Stack.Group>
      )}
    </Stack.Navigator>
  );
}
