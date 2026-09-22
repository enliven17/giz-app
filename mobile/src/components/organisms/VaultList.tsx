import { View } from "react-native";
import { Button } from "@/components/atoms/Button";
import { Typography } from "@/components/atoms/Typography";
import type { Vault } from "@/domain/investments";
export function VaultList({ vaults, onOpen }: { vaults: Vault[]; onOpen: (id: string) => void }) {
  return (
    <View className="gap-4">
      {vaults.map((vault) => (
        <View key={vault.id} className="gap-2 rounded-2xl border border-border bg-surface p-4">
          <Typography variant="heading">{vault.name}</Typography>
          <Typography>{`${vault.ticker} · ${vault.managers}`}</Typography>
          <Typography>{vault.strategy}</Typography>
          <Typography>{`${vault.risk} risk · Demo APY ${vault.apy}% · TVL ${vault.tvl}`}</Typography>
          <Button
            label={`View ${vault.name}`}
            variant="secondary"
            onPress={() => onOpen(vault.id)}
          />
        </View>
      ))}
    </View>
  );
}
