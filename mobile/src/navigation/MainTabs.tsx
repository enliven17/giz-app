import { PortfolioScreen } from "@/features/investments/PortfolioScreen";
import { VaultsScreen } from "@/features/investments/VaultsScreen";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { FloatingTabs } from "./FloatingTabs";
import { TabScreen } from "@/features/shell/TabScreen";
import type { MainTabParamList } from "./types";
const Tabs = createBottomTabNavigator<MainTabParamList>();
export function MainTabs() {
  return (
    <Tabs.Navigator
      tabBar={(props) => <FloatingTabs {...props} />}
      backBehavior="initialRoute"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarAccessibilityLabel: `${route.name} tab`,
      })}
    >
      <Tabs.Screen name="Home" component={PortfolioScreen} />
      <Tabs.Screen name="Vaults" component={VaultsScreen} />
      <Tabs.Screen name="Exchange" component={TabScreen} />
      <Tabs.Screen name="Settings" component={TabScreen} />
    </Tabs.Navigator>
  );
}
