import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "@/navigation/types";
import { Screen } from "@/components/templates/Screen";
import { Typography } from "@/components/atoms/Typography";
import { Button } from "@/components/atoms/Button";
import { Metric } from "@/components/molecules/Metric";
import { Notice } from "@/components/molecules/Notice";
import { HistoryChart } from "@/components/organisms/HistoryChart";
import { useVaultDetailController } from "./useVaultDetailController";
import { DataStatus } from "./DataStatus";
export function VaultDetailScreen({
  route,
  navigation,
}: NativeStackScreenProps<RootStackParamList, "VaultDetail">) {
  const { data, vault, sharing, shareError, share } = useVaultDetailController(route.params.id);
  return (
    <Screen>
      <DataStatus />
      {vault ? (
        <>
          <Typography variant="heading">{vault.name}</Typography>
          <Typography>{`${vault.ticker} · ${vault.managers}`}</Typography>
          <Metric label="Unit price (USD demo)" value={`$${vault.price}`} />
          <Metric label="24h change (demo)" value={`${vault.change24h}%`} />
          <HistoryChart series={vault.series} />
          <Metric label="Net APY (demo)" value={`${vault.apy}%`} />
          <Metric label="TVL" value={vault.tvl} />
          <Metric label="Lockup" value={vault.lockup} />
          <Typography variant="heading">Allocation</Typography>
          {vault.allocation.map((item) => (
            <Metric key={item.label} label={item.label} value={`${item.pct}%`} />
          ))}
          <Typography variant="heading">Terms (demo)</Typography>
          <Metric label="Strategy" value={vault.strategy} />
          <Metric label="Risk band" value={vault.risk} />
          <Metric label="Minimum" value={vault.minimum} />
          <Metric label="Redemption" value={vault.lockup} />
          <Metric label="Management fee (fixture)" value="2.0% / 20%" />
          <Button
            label="Share demo summary"
            loading={sharing}
            variant="secondary"
            onPress={() => void share()}
          />
          {shareError && <Notice error message="Sharing failed. Please try again." />}
          <Button label="Buy — coming in trading slice" disabled onPress={() => {}} />
          <Button label="Sell — coming in trading slice" disabled onPress={() => {}} />
        </>
      ) : (
        data && <Notice message="Vault not found in this demo snapshot." />
      )}
      <Button
        label="Back from vault"
        variant="secondary"
        onPress={() =>
          navigation.canGoBack()
            ? navigation.goBack()
            : navigation.navigate("Main", { screen: "Vaults" })
        }
      />
    </Screen>
  );
}
