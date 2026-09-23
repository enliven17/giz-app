import { ActivityIndicator, Pressable } from "react-native";
import type { LucideIcon } from "lucide-react-native";
import colors from "@/theme/colors.json";
export function IconButton({
  icon: Icon,
  label,
  onPress,
  disabled = false,
  loading = false,
}: {
  icon: LucideIcon;
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      disabled={disabled || loading}
      onPress={onPress}
      className={`h-12 w-12 items-center justify-center rounded-2xl border border-border bg-surface ${disabled ? "opacity-50" : "active:opacity-70"}`}
    >
      {loading ? (
        <ActivityIndicator color={colors.accent} />
      ) : (
        <Icon size={20} color={colors.muted} />
      )}
    </Pressable>
  );
}
