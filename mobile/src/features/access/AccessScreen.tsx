import { GizuLogo } from "@/components/atoms/GizuLogo";
import { View, useWindowDimensions } from "react-native";
import { Fingerprint, Wallet } from "lucide-react-native";
import { BackAction } from "@/navigation/BackAction";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Screen } from "@/components/templates/Screen";
import { Typography } from "@/components/atoms/Typography";
import { Button } from "@/components/atoms/Button";
import { Notice } from "@/components/molecules/Notice";
import { AccessCard } from "@/components/molecules/AccessCard";
import type { RootStackParamList } from "@/navigation/types";
import { useAccessController } from "./useAccessController";
export function AccessScreen({ navigation }: NativeStackScreenProps<RootStackParamList, "Access">) {
  const controller = useAccessController();
  const { width, fontScale } = useWindowDimensions();
  const stacked = width < 370 || fontScale > 1.2;
  return (
    <Screen>
      <BackAction />
      <GizuLogo />
      <Typography variant="title">Create access</Typography>
      <Typography>Choose how you want to access Gizu.</Typography>
      <View className={stacked ? "gap-3" : "flex-row gap-3"}>
        <View className={stacked ? "" : "flex-1"}>
          <AccessCard
            icon={Fingerprint}
            label={controller.pending ? "Opening access" : "Continue with passkey"}
            loading={controller.pending}
            onPress={() => void controller.start("Demo passkey")}
          />
        </View>
        <View className={stacked ? "" : "flex-1"}>
          <AccessCard
            icon={Wallet}
            label="Choose wallet"
            disabled={controller.pending}
            onPress={() => navigation.navigate("WalletPicker")}
          />
        </View>
      </View>
      {controller.error && <Notice error message={controller.error} />}
      {controller.pending && (
        <Button label="Cancel access" variant="secondary" onPress={controller.cancel} />
      )}
    </Screen>
  );
}
