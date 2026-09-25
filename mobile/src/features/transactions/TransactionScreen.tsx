import { useSession } from "@/application/SessionProvider";
import { NativeTransaction } from "./NativeTransaction";
import { useState } from "react";
import { TextInput, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "@/navigation/types";
import { BackAction } from "@/navigation/BackAction";
import { Screen } from "@/components/templates/Screen";
import { Typography } from "@/components/atoms/Typography";
import { Button } from "@/components/atoms/Button";
import { Notice } from "@/components/molecules/Notice";
import { Surface } from "@/components/molecules/Surface";
import { GroupedRow } from "@/components/molecules/GroupedRow";
import { decimal, operationLabels } from "@/domain/transactions";
import { unresolved, useTransactions } from "./TransactionProvider";
import { useOrderController } from "./useOrderController";
import { OperationFeedback } from "./OperationFeedback";
import colors from "@/theme/colors.json";

export function TransactionScreen(
  props: NativeStackScreenProps<RootStackParamList, "Transaction">,
) {
  const { session } = useSession();
  return session?.kind === "testnet" ? (
    <NativeTransaction {...props} />
  ) : (
    <DemoTransaction {...props} />
  );
}
function DemoTransaction({ route }: NativeStackScreenProps<RootStackParamList, "Transaction">) {
  const { kind = "buy", vaultId, resume = false } = route.params;
  const context = useTransactions();
  const c = useOrderController(kind, vaultId);
  const [observing, setObserving] = useState(resume);
  const vault = context.account?.vaults.find((v) => v.id === vaultId);
  const title = operationLabels[kind];
  const unit = kind === "sell" ? (vault?.ticker ?? "units") : "USDC";
  const balance =
    context.account &&
    (kind === "sell"
      ? vault?.redeemable
      : kind === "deposit"
        ? context.account.wallet
        : context.account.cash);
  const showOperation = observing || unresolved(context.operation);
  return (
    <Screen>
      <BackAction fallback="Home" />
      <Typography variant="title">
        {showOperation ? "Operation status" : `${title}${vault ? ` ${vault.ticker}` : ""}`}
      </Typography>
      {showOperation ? (
        <OperationFeedback
          onReview={() => {
            setObserving(false);
            c.edit();
          }}
        />
      ) : (
        <>
          {context.loading && <Typography>Loading available balances…</Typography>}
          {context.error && (
            <>
              <Notice error message={context.error} />
              <Button label="Reload balances" onPress={() => void context.refresh()} />
            </>
          )}
          {c.quote ? (
            <>
              <Typography variant="heading">
                Review {kind === "withdraw" ? "withdrawal" : kind}
              </Typography>
              <Surface>
                <GroupedRow label="From" value={c.quote.from} />
                <GroupedRow label="To" value={c.quote.to} />
                <GroupedRow label="Total debit" value={`${decimal(c.quote.debit)} ${unit}`} />
                <GroupedRow
                  label="You receive"
                  value={`${decimal(c.quote.credit)} ${c.quote.to}`}
                />
                <GroupedRow label="Fees included" value={`${decimal(c.quote.fee)} USDC`} />
                <GroupedRow label="Network" value="Monad" />
                {vault && <GroupedRow label="Lockup" value={vault.lockup} />}
              </Surface>
              <Typography variant="caption">
                Quote valid for 60 seconds. It is checked again before submission. Confirmation
                determines the final status.
              </Typography>
              <Button
                label={`Confirm ${kind === "withdraw" ? "withdrawal" : kind}`}
                variant={kind === "sell" ? "destructive" : "primary"}
                disabled={c.blocked}
                onPress={() => {
                  setObserving(true);
                  void context.execute(c.quote!);
                }}
              />
              <Button label="Edit amount" variant="secondary" onPress={() => c.edit()} />
            </>
          ) : (
            <>
              {vault && (
                <Typography>
                  {vault.name} · 1 {vault.ticker} = {decimal(vault.price)} USDC
                </Typography>
              )}
              <Surface>
                <View className="gap-4 p-5">
                  <Typography variant="caption">
                    {kind === "sell" ? "Unlocked" : "Available"}: {balance ? decimal(balance) : "—"}{" "}
                    {unit}
                  </Typography>
                  <Typography variant="row">Amount · {unit}</Typography>
                  <TextInput
                    accessibilityLabel={`Amount in ${unit}`}
                    value={c.amount}
                    onChangeText={c.edit}
                    editable={!c.quoting && !c.blocked}
                    keyboardType="decimal-pad"
                    placeholder="0"
                    placeholderTextColor={colors.muted}
                    maxLength={25}
                    className="min-h-14 text-3xl text-text"
                  />
                  <View className="flex-row flex-wrap gap-2">
                    {[25, 50, 75, 100].map((p) => (
                      <Button
                        key={p}
                        label={p === 100 ? "Max" : `${p}%`}
                        variant="secondary"
                        disabled={c.quoting || c.blocked}
                        onPress={() => c.percentage(p)}
                      />
                    ))}
                  </View>
                </View>
              </Surface>
              <Typography variant="caption">
                {kind === "deposit"
                  ? "Passkey wallet → Account"
                  : kind === "withdraw"
                    ? "Account → Passkey wallet"
                    : kind === "buy"
                      ? `Account USDC → ${unit === "USDC" ? (vault?.ticker ?? "vault") : unit}`
                      : `${unit} → Account USDC`}{" "}
                · Monad
              </Typography>
              {vault && (
                <Typography variant="caption">
                  Minimum buy: {decimal(vault.minimum)} USDC · Lockup: {vault.lockup}
                  {kind === "sell"
                    ? `. Total held: ${decimal(vault.units)} ${vault.ticker}; only unlocked units can be sold.`
                    : ""}
                </Typography>
              )}
              <Typography variant="caption">
                Network fee: 0.42 USDC
                {kind === "buy" || kind === "sell" ? " · Trading fee: 0.05%" : ""}. Max reserves
                applicable fees.
              </Typography>
              {c.error && <Notice error message={c.error} />}
              <Button
                label={
                  c.quoting
                    ? "Getting quote"
                    : `Review ${kind === "withdraw" ? "withdrawal" : kind}`
                }
                loading={c.quoting}
                disabled={c.blocked}
                variant={kind === "sell" ? "destructive" : "primary"}
                onPress={() => void c.review()}
              />
            </>
          )}
        </>
      )}
    </Screen>
  );
}
