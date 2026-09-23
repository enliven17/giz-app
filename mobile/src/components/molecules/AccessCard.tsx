import { ActivityIndicator, Pressable, View } from "react-native";
import type { LucideIcon } from "lucide-react-native";
import { Typography } from "@/components/atoms/Typography";
import colors from "@/theme/colors.json";
export function AccessCard({
  label,
  icon: Icon,
  onPress,
  disabled = false,
  loading = false,
}: {
  label: string;
  icon: LucideIcon;
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
      className="min-h-44 justify-between gap-8 rounded-3xl border border-border bg-surface p-5 active:opacity-70"
    >
      <View className="self-start rounded-2xl bg-accent/10 p-3">
        {loading ? (
          <ActivityIndicator color={colors.accent} />
        ) : (
          <Icon size={24} color={colors.accent} />
        )}
      </View>
      <Typography variant="row">{label}</Typography>
    </Pressable>
  );
}
