import { useState } from "react";
import { View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "@/navigation/types";
import { Screen } from "@/components/templates/Screen";
import { Typography } from "@/components/atoms/Typography";
import { Button } from "@/components/atoms/Button";
import { Choice } from "@/components/molecules/Choice";
import { Surface } from "@/components/molecules/Surface";
import { Notice } from "@/components/molecules/Notice";
import { decimal } from "@/domain/transactions";
import { useTransactions, unresolved } from "./TransactionProvider";
import { OperationLink } from "./OperationLink";
import { DataStatus } from "@/features/investments/DataStatus";
export function ExchangeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { account, loading, error, refresh, operation, history } = useTransactions();
  const [selected, setSelected] = useState<string | null>(null);
  const [selling, setSelling] = useState(false);
  const vault = account?.vaults.find((v) => v.id === selected) ?? account?.vaults[0];
  return (
    <Screen>
      <Typography variant="title">Swap</Typography>
      <OperationLink />
      <DataStatus />
      {loading && <Typography>Loading available balances…</Typography>}
      {error && (
        <>
          <Notice error message={error} />
          <Button label="Reload balances" onPress={() => void refresh()} />
        </>
      )}
      {account && (
        <>
          <Surface>
            <View className="gap-3 p-5">
              <Typography variant="caption">You pay</Typography>
              <Typography variant="heading">
                {selling ? (vault?.ticker ?? "Vault units") : "USDC"}
              </Typography>
              <Typography>
                Available: {decimal(selling ? (vault?.redeemable ?? "0") : account.cash)}
              </Typography>
            </View>
          </Surface>
          <Button
            label="Switch direction"
            variant="secondary"
            onPress={() => setSelling((value) => !value)}
          />
          <Surface>
            <View className="gap-3 p-5">
              <Typography variant="caption">You receive</Typography>
              <Typography variant="heading">
                {selling ? "USDC" : (vault?.ticker ?? "Vault units")}
              </Typography>
              <Typography>{vault?.name ?? "No vaults available."}</Typography>
            </View>
          </Surface>
          <View className="flex-row flex-wrap gap-2">
            {account.vaults.map((item) => (
              <Choice
                key={item.id}
                label={item.ticker}
                selected={item.id === vault?.id}
                onPress={() => setSelected(item.id)}
              />
            ))}
          </View>
          {vault && (
            <Typography variant="caption">
              1 {vault.ticker} = {decimal(vault.price)} USDC · Lockup {vault.lockup}
            </Typography>
          )}
          <Button
            label={selling ? "Sell vault units" : "Buy vault units"}
            variant={selling ? "destructive" : "primary"}
            disabled={!vault || loading || !!error || unresolved(operation)}
            onPress={() =>
              navigation.navigate("Transaction", {
                kind: selling ? "sell" : "buy",
                vaultId: vault!.id,
              })
            }
          />
        </>
      )}
      <Typography variant="heading">Recent swaps</Typography>
      {history
        .filter((item) => item.quote.input.kind === "buy" || item.quote.input.kind === "sell")
        .slice(0, 3)
        .map((item) => (
          <Typography key={item.key}>
            {item.quote.input.amount} {item.quote.from} → {item.quote.to} · {item.status}
          </Typography>
        ))}
      {!history.some(
        (item) => item.quote.input.kind === "buy" || item.quote.input.kind === "sell",
      ) && <Typography>No swaps this session.</Typography>}
      <Button
        label="See all activity"
        variant="quiet"
        onPress={() => navigation.navigate("Activity")}
      />
    </Screen>
  );
}
