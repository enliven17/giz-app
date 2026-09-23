import { TextInput } from "react-native";
import colors from "@/theme/colors.json";
export function SearchInput({
  value,
  onChangeText,
  label,
}: {
  value: string;
  onChangeText: (value: string) => void;
  label: string;
}) {
  return (
    <TextInput
      accessibilityLabel={label}
      placeholder={label}
      placeholderTextColor={colors.muted}
      value={value}
      onChangeText={onChangeText}
      autoCorrect={false}
      autoCapitalize="none"
      returnKeyType="search"
      className="min-h-12 rounded-2xl border border-border bg-surface px-4 py-3 text-base text-text"
    />
  );
}
