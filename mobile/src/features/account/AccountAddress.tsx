import { useSession } from "@/application/SessionProvider";
import { useEffect, useRef, useState } from "react";
import { View } from "react-native";
import { Typography } from "@/components/atoms/Typography";
import { Button } from "@/components/atoms/Button";
import { profileFixture } from "@/services/fixtures/profile";
import { useAccount } from "./AccountProvider";
export function AccountAddress() {
  const { clipboard } = useAccount();
  const { session } = useSession();
  const native = session?.kind === "testnet";
  const address = native ? session.address : profileFixture.address;
  const [status, setStatus] = useState<"idle" | "copying" | "copied" | "failed">("idle");
  const mounted = useRef(true);
  const busy = useRef(false);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  async function copy() {
    if (busy.current) return;
    busy.current = true;
    setStatus("copying");
    try {
      await clipboard.copy(address);
      if (mounted.current) setStatus("copied");
    } catch {
      if (mounted.current) setStatus("failed");
    } finally {
      busy.current = false;
    }
  }
  return (
    <View className="gap-3 px-5 pb-5">
      <Typography selectable accessibilityLabel={`Account address: ${address}`}>
        {address}
      </Typography>
      <Typography variant="caption">
        {native ? "Receive Monad testnet MON only." : "This address cannot receive funds."}
      </Typography>
      <Button
        label="Copy account address"
        variant="secondary"
        loading={status === "copying"}
        onPress={() => void copy()}
      />
      {status === "copied" && (
        <Typography accessibilityLiveRegion="polite">Address copied.</Typography>
      )}
      {status === "failed" && (
        <Typography accessibilityRole="alert">Could not copy address. Try again.</Typography>
      )}
    </View>
  );
}
