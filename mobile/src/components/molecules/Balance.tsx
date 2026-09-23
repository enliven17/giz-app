import { Text } from "react-native";
import { Typography } from "@/components/atoms/Typography";
import colors from "@/theme/colors.json";
export function Balance({ value }: { value: string }) {
  const [whole, cents] = value.split(".");
  return (
    <Typography variant="balance" accessibilityLabel={value}>
      {whole}
      {cents && <Text style={{ color: colors.muted, fontSize: 26 }}>.{cents}</Text>}
    </Typography>
  );
}
