import { View } from "react-native";
import { Typography } from "@/components/atoms/Typography";
export function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View className="gap-1 rounded-xl border border-border bg-surface p-4">
      <Typography variant="label">{label}</Typography>
      <Typography>{value}</Typography>
    </View>
  );
}
