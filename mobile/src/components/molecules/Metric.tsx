import { View } from "react-native";
import { Typography } from "@/components/atoms/Typography";
export function Metric({
  label,
  value,
  emphasis = false,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <View className={emphasis ? "gap-2" : "gap-1 rounded-xl border border-border bg-surface p-4"}>
      <Typography variant="caption">{label}</Typography>
      <Typography variant={emphasis ? "balance" : "value"}>{value}</Typography>
    </View>
  );
}
