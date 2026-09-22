import { DarkTheme, NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { RootNavigator } from "@/navigation/RootNavigator";
import colors from "@/theme/colors.json";
import { ErrorBoundary } from "./ErrorBoundary";
const theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: colors.accent,
    background: colors.ink,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
  },
};
export function AppRoot() {
  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <StatusBar style="light" />
        <NavigationContainer theme={theme}>
          <RootNavigator />
        </NavigationContainer>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
