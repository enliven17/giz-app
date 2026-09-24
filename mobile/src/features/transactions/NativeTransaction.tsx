import { useCallback } from "react";
import { Keyboard, TextInput, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "@/navigation/types";
import { BackAction } from "@/navigation/BackAction";
import { Screen } from "@/components/templates/Screen";
import { Typography } from "@/components/atoms/Typography";
import { Button } from "@/components/atoms/Button";
import { Surface } from "@/components/molecules/Surface";
import { AccountAddress } from "@/features/account/AccountAddress";
import { useWallet } from "@/features/wallet/WalletProvider";
import { WalletHistoryRows } from "@/features/wallet/WalletHistoryRows";
import colors from "@/theme/colors.json";

export function NativeTransaction({
  route,
}: NativeStackScreenProps<RootStackParamList, "Transaction">) {
  const wallet = useWallet();
  const c = wallet.transfers;
  const kind = route.params.kind;
  const { refresh } = c;
  useFocusEffect(
    useCallback(() => {
      if (kind === "withdraw") void refresh();
    }, [kind, refresh]),
  );
  return (
    <Screen>
      <BackAction fallback="Home" />
      <Typography variant="title">
        {kind === "deposit"
          ? "Deposit"
          : kind === "withdraw"
            ? "Withdraw"
            : "Investment unavailable"}
      </Typography>
      <Typography variant="caption">Monad testnet · Account 0</Typography>
      {kind === "deposit" ? (
        <>
          <Typography>
            Receive testnet MON at your wallet address. This does not invest in a vault.
          </Typography>
          <Surface>
            <View className="pt-5">
              <AccountAddress />
            </View>
          </Surface>
          <Typography>
            Incoming transfers are not indexed here. Refresh your balance after funding.
          </Typography>
          <Button
            label="Refresh balance"
            disabled={wallet.loading}
            onPress={() => void wallet.refresh()}
          />
          <Typography>
            {wallet.loading
              ? "Loading balance…"
              : wallet.error
                ? "Balance unavailable. Please retry."
                : wallet.balance + " MON"}
          </Typography>
        </>
      ) : kind === "withdraw" ? (
        <>
          <Surface>
            <View className="gap-4 p-5">
              <Typography variant="caption">
                Available:{" "}
                {wallet.loading || wallet.error ? "Unavailable" : wallet.balance + " MON"}
              </Typography>
              <Typography>Recipient address</Typography>
              <TextInput
                accessibilityLabel="Recipient address"
                value={c.recipient}
                onChangeText={c.setRecipient}
                editable={!c.busy}
                autoCapitalize="none"
                autoCorrect={false}
                maxLength={42}
                placeholder="0x…"
                placeholderTextColor={colors.muted}
                className="min-h-14 text-text"
              />
              <Typography>Amount · MON</Typography>
              <TextInput
                accessibilityLabel="Amount in MON"
                value={c.amount}
                onChangeText={c.setAmount}
                editable={!c.busy}
                keyboardType="decimal-pad"
                maxLength={40}
                className="min-h-14 text-3xl text-text"
              />
            </View>
          </Surface>
          <Typography variant="caption">
            Maximum 0.1 testnet MON per transfer. The native review shows exact fees and recipient
            before approval. Use this wallet’s passkey.
          </Typography>
          <Button
            label="Review withdrawal"
            disabled={c.busy || !c.ready || c.history.blocked}
            onPress={() => {
              Keyboard.dismiss();
              void c.send();
            }}
          />
          <Typography variant="caption">
            Closing this page does not undo a submitted transfer.
          </Typography>
          {c.message !== "" && (
            <Typography accessibilityLiveRegion="polite">{c.message}</Typography>
          )}
          <Button
            label="Check status"
            variant="secondary"
            disabled={c.busy}
            onPress={() => void c.refresh()}
          />
          <WalletHistoryRows entries={c.history.entries} />
        </>
      ) : (
        <Typography>Vault buy/sell is not connected to your wallet.</Typography>
      )}
    </Screen>
  );
}
