import { PortfolioScreen } from "@/features/investments/PortfolioScreen";
import { VaultsScreen } from "@/features/investments/VaultsScreen";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { House, Layers, ArrowLeftRight, Settings } from "lucide-react-native";
import { TabScreen } from "@/features/shell/TabScreen";
import type { MainTabParamList } from "./types";
const Tabs = createBottomTabNavigator<MainTabParamList>();
const icons = { Home: House, Vaults: Layers, Exchange: ArrowLeftRight, Settings };
export function MainTabs() {
  return (
    <Tabs.Navigator
      backBehavior="initialRoute"
      screenOptions={({ route }) => ({
        tabBarAccessibilityLabel: `${route.name} tab`,
        tabBarIcon: ({ color, size }) => {
          const Icon = icons[route.name];
          return <Icon color={color} size={size} />;
        },
      })}
    >
      <Tabs.Screen name="Home" component={PortfolioScreen} />
      <Tabs.Screen name="Vaults" component={VaultsScreen} />
      <Tabs.Screen name="Exchange" component={TabScreen} />
      <Tabs.Screen name="Settings" component={TabScreen} />
    </Tabs.Navigator>
  );
}
