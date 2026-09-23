import { View } from "react-native";
import { Share2 } from "lucide-react-native";
import { BackAction } from "@/navigation/BackAction";
import { MetricGroup } from "@/components/molecules/MetricGroup";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "@/navigation/types";
import { Screen } from "@/components/templates/Screen";
import { Typography } from "@/components/atoms/Typography";
import { IconButton } from "@/components/atoms/IconButton";
import { Button } from "@/components/atoms/Button";
import { Badge } from "@/components/atoms/Badge";
import { Surface } from "@/components/molecules/Surface";
import { GroupedRow } from "@/components/molecules/GroupedRow";
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
      <View className="flex-row justify-between">
        <BackAction fallback="Vaults" />
        {vault && (
          <IconButton
            icon={Share2}
            label="Share summary"
            loading={sharing}
            onPress={() => void share()}
          />
        )}
      </View>
      {!vault && <DataStatus />}
      {vault ? (
        <>
          <View className="mt-3 flex-row items-center gap-3">
            <View className="rounded-2xl bg-accent/10 p-4">
              <Typography variant="label">{vault.ticker}</Typography>
            </View>
            <View className="flex-1 gap-1">
              <Typography variant="heading">{vault.name}</Typography>
              <Typography variant="caption">{vault.managers}</Typography>
            </View>
          </View>
          <Typography variant="caption">Unit price · USD</Typography>
          <View className="flex-row flex-wrap items-center gap-3">
            <Typography variant="balance">{`$${vault.price}`}</Typography>
            <Badge label={`${vault.change24h}%`} negative={Number(vault.change24h) < 0} />
          </View>
          <DataStatus />
          <HistoryChart series={vault.series} />
          <MetricGroup
            metrics={[
              { label: "Net APY", value: `${vault.apy}%` },
              { label: "TVL", value: vault.tvl },
              { label: "Lockup", value: vault.lockup },
            ]}
          />
          <Typography variant="heading">Allocation</Typography>
          <Surface>
            <View className="p-5">
              <View
                className="h-3 flex-row overflow-hidden rounded-full"
                accessibilityElementsHidden
                importantForAccessibility="no-hide-descendants"
              >
                {vault.allocation.map((item, index) => (
                  <View
                    key={item.label}
                    className="bg-accent"
                    style={{ width: `${item.pct}%`, opacity: Math.max(0.25, 1 - index * 0.25) }}
                  />
                ))}
              </View>
            </View>
            {vault.allocation.map((item) => (
              <GroupedRow key={item.label} label={item.label} value={`${item.pct}%`} />
            ))}
          </Surface>
          <Typography variant="heading">Terms</Typography>
          <Surface>
            {[
              ["Strategy", vault.strategy],
              ["Risk band", vault.risk],
              ["Minimum", vault.minimum],
              ["Redemption", vault.lockup],
              ["Management fee", "2.0% / 20%"],
            ].map(([label, value]) => (
              <GroupedRow key={label} label={label!} value={value} />
            ))}
          </Surface>
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Button label="Buy" disabled onPress={() => {}} />
            </View>
            <View className="flex-1">
              <Button label="Sell" disabled onPress={() => {}} />
            </View>
          </View>
          <Typography variant="caption">Buying and selling are not available yet.</Typography>
          {shareError && <Notice error message="Sharing failed. Please try again." />}
        </>
      ) : (
        data && <Notice message="Vault not found in this snapshot." />
      )}
    </Screen>
  );
}
