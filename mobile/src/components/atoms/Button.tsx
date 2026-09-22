import { Pressable, Text } from "react-native";

type Props = { label: string; onPress: () => void; disabled?: boolean };
export function Button({ label, onPress, disabled = false }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      className={`min-h-12 justify-center rounded-xl bg-accent px-5 py-3 ${disabled ? "opacity-40" : "active:opacity-80"}`}
    >
      <Text className="text-center text-base font-semibold text-ink">{label}</Text>
    </Pressable>
  );
}
