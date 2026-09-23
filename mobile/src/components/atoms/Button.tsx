import { ActivityIndicator, Pressable, Text, useWindowDimensions } from "react-native";
import colors from "@/theme/colors.json";
type Props = {
  label: string;
  accessibilityLabel?: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: "primary" | "secondary" | "quiet" | "destructive";
};
export function Button({
  label,
  accessibilityLabel,
  onPress,
  disabled = false,
  loading = false,
  variant = "primary",
}: Props) {
  // Remeasure native text after Dynamic Type changes, including on inactive screens.
  // Remount only the text node so feature and navigation state are retained.
  const { fontScale } = useWindowDimensions();
  const unavailable = disabled || loading;
  const surface = disabled
    ? "border border-border bg-surface"
    : variant === "primary"
      ? "bg-accent"
      : variant === "quiet"
        ? ""
        : "border border-border bg-surface";
  const foreground = disabled
    ? "text-muted"
    : variant === "primary"
      ? "text-ink"
      : variant === "destructive"
        ? "text-danger"
        : "text-text";
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: unavailable, busy: loading }}
      disabled={unavailable}
      onPress={onPress}
      className={`min-h-12 flex-row items-center justify-center gap-3 rounded-2xl py-3 ${variant === "quiet" ? "px-2" : "px-5"} ${surface} ${disabled ? "opacity-60" : "active:opacity-80"}`}
    >
      {loading && <ActivityIndicator color={variant === "primary" ? colors.ink : colors.accent} />}
      <Text
        key={fontScale}
        className={`shrink text-center font-semibold ${variant === "quiet" ? "text-sm" : "text-base"} ${foreground}`}
      >
        {label}
      </Text>
    </Pressable>
  );
}
