import { Pressable, View } from "react-native";
import { Typography } from "@/components/atoms/Typography";
export function PreferenceOption({
  label,
  selected,
  disabled = false,
  onSelect,
}: {
  label: string;
  selected: boolean;
  disabled?: boolean;
  onSelect: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={label}
      accessibilityState={{ checked: selected, disabled }}
      disabled={disabled}
      onPress={onSelect}
      className="min-h-[60px] border-b border-border px-5 py-4"
    >
      <View className="flex-row flex-wrap items-center justify-between gap-3">
        <Typography variant="row">{label}</Typography>
        <Typography variant={selected ? "label" : "caption"}>
          {selected ? "Selected" : disabled ? "Unavailable" : ""}
        </Typography>
      </View>
    </Pressable>
  );
}
