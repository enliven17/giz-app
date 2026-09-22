import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Screen } from "@/components/templates/Screen";
import { Typography } from "@/components/atoms/Typography";
import { Button } from "@/components/atoms/Button";
import { Notice } from "@/components/molecules/Notice";
import { walletProviders } from "@/services/access";
import type { RootStackParamList } from "@/navigation/types";
import { useAccessController } from "./useAccessController";
export function WalletPickerScreen({
  navigation,
}: NativeStackScreenProps<RootStackParamList, "WalletPicker">) {
  const controller = useAccessController();
  return (
    <Screen>
      <Typography variant="heading">Select demo signer</Typography>
      <Notice message="Provider names are previews only. No external wallet will open." />
      {walletProviders.map((provider) => (
        <Button
          key={provider}
          label={provider}
          variant="secondary"
          disabled={controller.pending}
          onPress={() => void controller.start(provider)}
        />
      ))}
      {controller.pending && (
        <Typography accessibilityLiveRegion="polite">Opening demo access…</Typography>
      )}
      {controller.error && <Notice error message={controller.error} />}
      <Button
        label="Cancel wallet selection"
        onPress={() => {
          controller.cancel();
          navigation.goBack();
        }}
      />
    </Screen>
  );
}
