import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "@/navigation/types";
import { Screen } from "@/components/templates/Screen";
import { Typography } from "@/components/atoms/Typography";
import { Button } from "@/components/atoms/Button";
import { Notice } from "@/components/molecules/Notice";
import { BrandMark } from "@/components/molecules/BrandMark";
export function PreviewScreen({
  navigation,
}: NativeStackScreenProps<RootStackParamList, "Preview">) {
  return (
    <Screen>
      <Typography variant="heading">UI preview</Typography>
      <BrandMark />
      <Typography variant="label">NEXUM / DEMO</Typography>
      <Typography>System typography scales with device accessibility settings.</Typography>
      <Button label="Disabled action" disabled onPress={() => {}} />
      <Button label="Loading action" loading onPress={() => {}} />
      <Notice error message="Example error — no operation was submitted." />
      <Button label="Back to settings" variant="secondary" onPress={() => navigation.goBack()} />
    </Screen>
  );
}
