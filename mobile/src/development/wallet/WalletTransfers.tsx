import colors from "@/theme/colors.json";
import { Keyboard, TextInput, View } from "react-native";
import { Typography } from "@/components/atoms/Typography";
import { Button } from "@/components/atoms/Button";
import { Surface } from "@/components/molecules/Surface";
import { formatMon } from "@/services/nativeWallet";
import type { WalletTransferService } from "@/services/walletTransfers";
import { useWalletTransfers } from "@/features/wallet/useWalletTransfers";

const labels: Record<string, string> = {
  pending: "Pending",
  unknown: "Unknown — refresh status",
  finalized: "Finalized",
  reverted: "Failed on-chain",
};
export function WalletTransfers({
  address,
  service,
  onSettled,
}: {
  address: string;
  service: WalletTransferService;
  onSettled(): Promise<void>;
}) {
  const c = useWalletTransfers(address, service, onSettled);
  return (
    <View className="gap-4">
      <Typography variant="heading">Send testnet MON</Typography>
      <Typography>
        From Account 0. Use the same passkey when prompted. Native review is required.
      </Typography>
      <Typography>Recipient address</Typography>
      <TextInput
        accessibilityLabel="Transfer recipient"
        placeholder="Recipient address"
        placeholderTextColor={colors.muted}
        autoCapitalize="none"
        autoCorrect={false}
        value={c.recipient}
        onChangeText={c.setRecipient}
        editable={!c.busy}
        className="rounded-2xl border border-border p-4 text-text"
      />
      <Typography>Amount in testnet MON</Typography>
      <TextInput
        accessibilityLabel="Transfer amount in MON"
        keyboardType="decimal-pad"
        value={c.amount}
        onChangeText={c.setAmount}
        editable={!c.busy}
        className="rounded-2xl border border-border p-4 text-text"
      />
      <Typography variant="caption">Amount in testnet MON · maximum 0.1 per transfer</Typography>
      <Button
        label="Review transfer"
        disabled={c.busy || !c.ready || c.history.blocked}
        onPress={() => {
          Keyboard.dismiss();
          void c.send();
        }}
      />
      {c.message !== "" && <Typography accessibilityLiveRegion="polite">{c.message}</Typography>}
      <Typography variant="heading">Transaction history</Typography>
      <Typography variant="caption">
        Outgoing transfers recorded by this app on this device. Incoming deposits and other wallet
        activity are not listed.
      </Typography>
      <Button
        label="Refresh history"
        variant="secondary"
        disabled={c.busy}
        onPress={() => void c.refresh()}
      />
      {c.ready && c.history.entries.length === 0 && (
        <Typography>No outgoing transfers recorded for this wallet.</Typography>
      )}
      {c.history.entries.map((entry) => (
        <Surface key={entry.transactionHash}>
          <View className="gap-2 p-5">
            <Typography>{labels[entry.status]}</Typography>
            {entry.valueWei && entry.to ? (
              <>
                <Typography>{formatMon(entry.valueWei)} MON</Typography>
                <Typography selectable>To: {entry.to}</Typography>
              </>
            ) : (
              <Typography variant="caption">
                Earlier transfer — amount and recipient details were not saved.
              </Typography>
            )}
            <Typography variant="caption">Nonce {entry.nonce}</Typography>
            <Typography
              selectable
              accessibilityLabel={`Transaction hash: ${entry.transactionHash}`}
            >
              {entry.transactionHash}
            </Typography>
          </View>
        </Surface>
      ))}
    </View>
  );
}
