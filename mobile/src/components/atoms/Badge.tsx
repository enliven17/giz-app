import { View } from "react-native";
import { Typography } from "./Typography";
export function Badge({ label, negative = false }: { label: string; negative?: boolean }) {
  return (
    <View
      className={`self-start rounded-full px-3 py-1 ${negative ? "bg-danger/10" : "bg-accent/10"}`}
    >
      <Typography variant={negative ? "negative" : "label"}>{label}</Typography>
    </View>
  );
}
