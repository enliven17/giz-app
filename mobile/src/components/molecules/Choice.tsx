import { Pressable, Text } from "react-native";
export function Choice({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={label}
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      className={`min-h-12 justify-center rounded-xl border px-4 py-3 ${selected ? "border-accent bg-surface" : "border-border"}`}
    >
      <Text className={selected ? "text-base text-accent" : "text-base text-muted"}>{label}</Text>
    </Pressable>
  );
}
