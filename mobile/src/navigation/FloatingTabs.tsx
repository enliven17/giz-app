import { View, Pressable } from "react-native";
import { House, PieChart, ArrowLeftRight, Settings } from "lucide-react-native";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import colors from "@/theme/colors.json";
const icons = { Home: House, Vaults: PieChart, Exchange: ArrowLeftRight, Settings };
export function FloatingTabs({ state, descriptors, navigation, insets }: BottomTabBarProps) {
  return (
    <View
      style={{
        paddingBottom: Math.max(insets.bottom, 12),
        paddingTop: 12,
        paddingHorizontal: Math.max(insets.left, insets.right, 20),
        backgroundColor: colors.ink,
      }}
    >
      <View className="self-center flex-row rounded-full border border-border bg-surface p-2">
        {state.routes.map((route, index) => {
          const selected = state.index === index;
          const Icon = icons[route.name as keyof typeof icons];
          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityLabel={
                descriptors[route.key]!.options.tabBarAccessibilityLabel ?? `${route.name} tab`
              }
              accessibilityState={{ selected }}
              onPress={() => {
                const event = navigation.emit({
                  type: "tabPress",
                  target: route.key,
                  canPreventDefault: true,
                });
                if (!selected && !event.defaultPrevented)
                  navigation.navigate(route.name, route.params);
              }}
              onLongPress={() => navigation.emit({ type: "tabLongPress", target: route.key })}
              className={`h-12 w-14 items-center justify-center rounded-full ${selected ? "bg-accent" : ""}`}
            >
              <Icon
                size={21}
                color={selected ? colors.ink : colors.muted}
                strokeWidth={selected ? 2.4 : 1.8}
              />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
