import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Screen } from "@/components/templates/Screen";
import { Typography } from "@/components/atoms/Typography";
import { Button } from "@/components/atoms/Button";
import { Notice } from "@/components/molecules/Notice";
import type { RootStackParamList } from "@/navigation/types";
import { useAccessController } from "./useAccessController";
export function AccessScreen({ navigation }: NativeStackScreenProps<RootStackParamList, "Access">) {
  const controller = useAccessController();
  return (
    <Screen>
      <Typography variant="title">Create demo access</Typography>
      <Typography>
        Choose a simulated passkey or external wallet. No Face ID, keypair or wallet is created.
      </Typography>
      <Button
        label={controller.pending ? "Opening demo access" : "Try demo passkey"}
        loading={controller.pending}
        onPress={() => void controller.start("Demo passkey")}
      />
      <Button
        label="Choose demo wallet"
        variant="secondary"
        disabled={controller.pending}
        onPress={() => navigation.navigate("WalletPicker")}
      />
      {controller.error && <Notice error message={controller.error} />}
      {controller.pending && (
        <Button label="Cancel demo access" variant="secondary" onPress={controller.cancel} />
      )}
    </Screen>
  );
}
