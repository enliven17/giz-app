import { ActivityIndicator, Pressable, Text } from "react-native";
import colors from "@/theme/colors.json";
type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: "primary" | "secondary";
};
export function Button({
  label,
  onPress,
  disabled = false,
  loading = false,
  variant = "primary",
}: Props) {
  const unavailable = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: unavailable, busy: loading }}
      disabled={unavailable}
      onPress={onPress}
      className={`min-h-12 flex-row items-center justify-center gap-3 rounded-xl px-5 py-3 ${variant === "primary" ? "bg-accent" : "border border-border bg-surface"} ${unavailable ? "opacity-40" : "active:opacity-80"}`}
    >
      {loading && <ActivityIndicator color={variant === "primary" ? colors.ink : colors.accent} />}
      <Text
        className={`text-center text-base font-semibold ${variant === "primary" ? "text-ink" : "text-text"}`}
      >
        {label}
      </Text>
    </Pressable>
  );
}
