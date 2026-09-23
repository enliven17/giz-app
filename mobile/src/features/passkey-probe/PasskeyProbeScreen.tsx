import { View } from "react-native";
import { Button } from "@/components/atoms/Button";
import { Typography } from "@/components/atoms/Typography";
import { Screen } from "@/components/templates/Screen";
import { PROBE_MESSAGE } from "@/domain/probeWallet";
import type { MeraProbeService } from "@/services/meraProbe";
import { useProbeController } from "./useProbeController";

export function PasskeyProbeScreen({ service }: { service: MeraProbeService }) {
  const vm = useProbeController(service);
  const disabled = vm.busy || vm.blocked !== null;
  return (
    <Screen>
      <Typography variant="title">Native passkey probe</Typography>
      <Typography>gizu.io · EVM account 0 · Mera 0.2.0</Typography>
      <Typography>
        Development test only. Use an unfunded test passkey. No network transactions or investment
        data are connected.
      </Typography>
      {vm.blocked && <Typography variant="negative">{vm.blocked}</Typography>}
      <Typography accessibilityLiveRegion="polite">{vm.message}</Typography>
      <Button
        label="Run offline crypto self-check"
        disabled={vm.busy}
        onPress={() => void vm.run("self-check")}
      />
      {vm.wallet && (
        <View className="gap-2">
          <Typography variant="label">Remembered test address</Typography>
          <Typography selectable>{vm.wallet.address}</Typography>
          <Typography>Stored metadata is not proof of current authentication.</Typography>
        </View>
      )}
      <Button
        label="Create test passkey"
        disabled={disabled || !!vm.wallet}
        onPress={() => void vm.run("create")}
      />
      <Button
        label="Open existing test passkey"
        disabled={disabled || !!vm.wallet}
        onPress={() => void vm.run("open")}
      />
      <Button
        label="Recover same address"
        disabled={disabled || !vm.wallet}
        onPress={() => void vm.run("recover")}
      />
      <Typography variant="label">The only message this probe can sign</Typography>
      <Typography>{PROBE_MESSAGE}</Typography>
      <Button
        label="Sign and verify test message"
        disabled={disabled || !vm.wallet}
        onPress={() => void vm.run("sign")}
      />
      {vm.result?.proof && (
        <Typography variant="label">
          Signature verified locally using viem. Signing session ended.
        </Typography>
      )}
      <Button
        label="Forget local test metadata"
        variant="secondary"
        disabled={vm.busy}
        onPress={() => void vm.run("forget")}
      />
      <Typography variant="caption">
        Forgetting does not delete the provider passkey. No PRF output, seed phrase or private key
        is stored. Real device/provider acceptance must be recorded separately.
      </Typography>
    </Screen>
  );
}
