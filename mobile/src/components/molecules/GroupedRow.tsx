import { Pressable, View } from "react-native";
import { ChevronRight, type LucideIcon } from "lucide-react-native";
import { Typography } from "@/components/atoms/Typography";
import colors from "@/theme/colors.json";
export function GroupedRow({
  label,
  value,
  detail,
  onPress,
  accessibilityLabel,
  disabled = false,
  icon: Icon,
}: {
  label: string;
  value?: string;
  detail?: string;
  onPress?: () => void;
  accessibilityLabel?: string;
  disabled?: boolean;
  icon?: LucideIcon;
}) {
  const content = (
    <View className="min-h-[60px] flex-row flex-wrap items-center gap-3 border-b border-border px-5 py-4">
      {Icon && <Icon size={19} color={colors.muted} />}
      <View className="min-w-0 flex-1 gap-1">
        <Typography variant="row">{label}</Typography>
        {detail && <Typography variant="caption">{detail}</Typography>}
      </View>
      {value && (
        <View className="max-w-full shrink">
          <Typography variant="caption">{value}</Typography>
        </View>
      )}
      {onPress && <ChevronRight size={16} color={colors.muted} />}
    </View>
  );
  return onPress ? (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
    >
      {content}
    </Pressable>
  ) : (
    content
  );
}
