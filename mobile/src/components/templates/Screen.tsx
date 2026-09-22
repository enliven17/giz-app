import type { PropsWithChildren } from "react";
import { KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";

export function Screen({ children }: PropsWithChildren) {
  const headerHeight = useHeaderHeight();
  return (
    <SafeAreaView edges={["bottom", "left", "right"]} className="flex-1 bg-ink">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={headerHeight}
      >
        <ScrollView contentContainerClassName="grow gap-6 p-6" keyboardShouldPersistTaps="handled">
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
