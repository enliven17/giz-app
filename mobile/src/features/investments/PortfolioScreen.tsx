import { View } from "react-native";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { MainTabParamList, RootStackParamList } from "@/navigation/types";
import { Screen } from "@/components/templates/Screen";
import { Typography } from "@/components/atoms/Typography";
import { Button } from "@/components/atoms/Button";
import { Metric } from "@/components/molecules/Metric";
import { HistoryChart } from "@/components/organisms/HistoryChart";
import { VaultList } from "@/components/organisms/VaultList";
import { dollars, portfolioTotal } from "@/domain/investments";
import { useInvestments } from "./InvestmentProvider";
import { DataStatus } from "./DataStatus";
export function PortfolioScreen({ navigation }: BottomTabScreenProps<MainTabParamList, "Home">) {
  const { data } = useInvestments();
  const root = navigation.getParent<NativeStackNavigationProp<RootStackParamList>>();
  return (
    <Screen>
      <Typography variant="heading">Your portfolio</Typography>
      {data && (
        <Metric emphasis label="Portfolio value · USD demo" value={portfolioTotal(data.holdings)} />
      )}
      <DataStatus />
      {data && (
        <>
          {data.holdings.length > 0 && (
            <Typography variant="caption">{`${data.dailyChange.percent}% · +${dollars(data.dailyChange.valueCents)} illustrative daily change`}</Typography>
          )}
          <HistoryChart series={data.portfolioSeries} />
          <Button label="View activity" onPress={() => root.navigate("Activity")} />
          <Typography variant="caption">
            Deposits, withdrawals and notifications are not available yet.
          </Typography>
          <Typography variant="heading">Holdings</Typography>
          {data.holdings.length === 0 && <Typography>No holdings yet.</Typography>}
          {data.holdings.map((holding) => (
            <View key={holding.id} className="gap-2 rounded-xl border border-border p-4">
              <Typography variant="label">{holding.name}</Typography>
              <Typography>{`${holding.units} ${holding.ticker} units`}</Typography>
              <Typography>{`${dollars(holding.valueCents)} · ${holding.change}% (demo 24h)`}</Typography>
              <Button
                label={`Open ${holding.ticker} holding`}
                variant="secondary"
                onPress={() => root.navigate("VaultDetail", { id: holding.id })}
              />
            </View>
          ))}
          <Typography variant="heading">Private vaults</Typography>
          <Button
            label="See all vaults"
            variant="secondary"
            onPress={() => navigation.navigate("Vaults")}
          />
          <VaultList vaults={data.vaults} onOpen={(id) => root.navigate("VaultDetail", { id })} />
        </>
      )}
    </Screen>
  );
}
