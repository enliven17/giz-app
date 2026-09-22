import { MetricGroup } from "@/components/molecules/MetricGroup";
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
}: NativeStackScreenProps<RootStackParamList, "VaultDetail">) {
  const { data, vault, sharing, shareError, share } = useVaultDetailController(route.params.id);
  return (
    <Screen>
      {!vault && <DataStatus />}
      {vault ? (
        <>
          <Typography variant="heading">{vault.name}</Typography>
          <Typography>{`${vault.ticker} · ${vault.managers}`}</Typography>
          <Metric emphasis label="Unit price · USD demo" value={`$${vault.price}`} />
          <Typography variant="caption">{`${vault.change24h}% · Demo 24h change`}</Typography>
          <DataStatus />
          <HistoryChart series={vault.series} />
          <MetricGroup
            metrics={[
              { label: "Net APY (demo)", value: `${vault.apy}%` },
              { label: "TVL", value: vault.tvl },
              { label: "Lockup", value: vault.lockup },
            ]}
          />
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
          <Typography variant="caption">Buying and selling are not available yet.</Typography>
          {shareError && <Notice error message="Sharing failed. Please try again." />}
        </>
      ) : (
        data && <Notice message="Vault not found in this demo snapshot." />
      )}
    </Screen>
  );
}
