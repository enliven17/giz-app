import { View } from "react-native";
import { Typography } from "@/components/atoms/Typography";
export function Notice({ message, error = false }: { message: string; error?: boolean }) {
  return (
    <View className="rounded-xl border border-border bg-surface p-4">
      <Typography
        accessibilityRole={error ? "alert" : "text"}
        accessibilityLiveRegion={error ? "polite" : "none"}
      >
        {message}
      </Typography>
    </View>
  );
}
