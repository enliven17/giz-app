import { GizuLogo } from "@/components/atoms/GizuLogo";
import { Fingerprint } from "lucide-react-native";
import { BackAction } from "@/navigation/BackAction";
import { Screen } from "@/components/templates/Screen";
import { Typography } from "@/components/atoms/Typography";
import { Button } from "@/components/atoms/Button";
import { Notice } from "@/components/molecules/Notice";
import { AccessCard } from "@/components/molecules/AccessCard";
import { useAccessController } from "./useAccessController";
export function AccessScreen() {
  const controller = useAccessController();
  return (
    <Screen>
      <BackAction />
      <GizuLogo />
      <Typography variant="title">Create access</Typography>
      <Typography>Continue with a passkey to access Gizu.</Typography>
      <AccessCard
        icon={Fingerprint}
        label={controller.pending ? "Opening access" : "Continue with passkey"}
        loading={controller.pending}
        onPress={() => void controller.start()}
      />
      {controller.error && <Notice error message={controller.error} />}
      {controller.pending && (
        <Button label="Cancel access" variant="secondary" onPress={controller.cancel} />
      )}
    </Screen>
  );
}
