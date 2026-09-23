import { Pressable, Text, useWindowDimensions } from "react-native";
export function Choice({
  label,
  selected,
  disabled = false,
  onPress,
}: {
  label: string;
  selected: boolean;
  disabled?: boolean;
  onPress: () => void;
}) {
  // Remeasure native text after Dynamic Type changes, including on inactive screens.
  // Remount only the text node so feature and navigation state are retained.
  const { fontScale } = useWindowDimensions();
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={label}
      accessibilityState={{ checked: selected, disabled }}
      disabled={disabled}
      onPress={onPress}
      className={`min-h-12 justify-center rounded-full border px-4 py-3 ${selected ? "border-transparent bg-accent/10" : "border-border"}`}
    >
      <Text key={fontScale} className={selected ? "text-sm text-accent" : "text-sm text-muted"}>
        {label}
      </Text>
    </Pressable>
  );
}
