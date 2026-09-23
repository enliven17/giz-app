import { useContext, type PropsWithChildren } from "react";
import { BottomTabBarHeightContext } from "@react-navigation/bottom-tabs";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function Screen({ children }: PropsWithChildren) {
  const tabHeight = useContext(BottomTabBarHeightContext);
  const insets = useSafeAreaInsets();
  return (
    <View
      className="flex-1 bg-ink"
      style={{
        paddingTop: insets.top,
        paddingBottom: tabHeight === undefined ? insets.bottom : 0,
        paddingLeft: insets.left,
        paddingRight: insets.right,
      }}
    >
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={insets.top}
      >
        <ScrollView
          contentContainerClassName="grow gap-4 px-5 py-4"
          contentContainerStyle={
            tabHeight === undefined ? undefined : { paddingBottom: tabHeight + 16 }
          }
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
