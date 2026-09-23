import type { PropsWithChildren } from "react";
import { View } from "react-native";
export function Surface({ children }: PropsWithChildren) {
  return (
    <View className="overflow-hidden rounded-3xl border border-border bg-surface">{children}</View>
  );
}
