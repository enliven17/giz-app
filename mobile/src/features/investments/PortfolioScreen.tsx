import { View } from "react-native";
import { Bell, MoreHorizontal } from "lucide-react-native";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { MainTabParamList, RootStackParamList } from "@/navigation/types";
import { Screen } from "@/components/templates/Screen";
import { Typography } from "@/components/atoms/Typography";
import { Button } from "@/components/atoms/Button";
import { IconButton } from "@/components/atoms/IconButton";
import { Badge } from "@/components/atoms/Badge";
import { Balance } from "@/components/molecules/Balance";
import { Surface } from "@/components/molecules/Surface";
import { GroupedRow } from "@/components/molecules/GroupedRow";
import { HistoryChart } from "@/components/organisms/HistoryChart";
import { VaultList } from "@/components/organisms/VaultList";
import { dollars, portfolioTotal } from "@/domain/investments";
import { profileFixture as profile } from "@/services/fixtures/profile";
import { useInvestments } from "./InvestmentProvider";
import { DataStatus } from "./DataStatus";
export function PortfolioScreen({ navigation }: BottomTabScreenProps<MainTabParamList, "Home">) {
  const { data } = useInvestments();
  const root = navigation.getParent<NativeStackNavigationProp<RootStackParamList>>();
  return (
    <Screen>
      <View className="flex-row items-center gap-3">
        <View className="rounded-2xl border border-border bg-surface p-3">
          <Typography variant="label">{profile.initials}</Typography>
        </View>
        <View className="flex-1">
          <Typography variant="caption">{profile.member}</Typography>
          <Typography variant="row">{profile.greeting}</Typography>
        </View>
        <IconButton icon={Bell} label="Notifications — unavailable" disabled onPress={() => {}} />
      </View>
      <View className="mt-4 gap-2">
        <Typography variant="heading">Your portfolio</Typography>
        <Typography variant="caption">Portfolio value · USD</Typography>
        {data && <Balance value={portfolioTotal(data.holdings)} />}
        {data && data.holdings.length > 0 && (
          <View className="flex-row flex-wrap items-center gap-2">
            <Badge
              label={`${data.dailyChange.percent}%`}
              negative={Number(data.dailyChange.percent) < 0}
            />
            <Typography variant="caption">{`${BigInt(data.dailyChange.valueCents) >= 0n ? "+" : ""}${dollars(data.dailyChange.valueCents)} today`}</Typography>
          </View>
        )}
      </View>
      <DataStatus />
      {data && (
        <>
          <HistoryChart series={data.portfolioSeries} />
          <View className="flex-row flex-wrap gap-3">
            <View className="min-w-24 flex-1">
              <Button label="Deposit" disabled onPress={() => {}} />
            </View>
            <View className="min-w-24 flex-1">
              <Button label="Withdraw" disabled onPress={() => {}} />
            </View>
            <IconButton
              icon={MoreHorizontal}
              label="View activity"
              onPress={() => root.navigate("Activity")}
            />
          </View>
          <Typography variant="caption">
            Deposits, withdrawals and notifications are not available yet.
          </Typography>
          <View className="mt-3 flex-row flex-wrap items-center justify-between gap-2">
            <Typography variant="heading">Private vaults</Typography>
            <Button
              label="See all vaults"
              variant="quiet"
              onPress={() => navigation.navigate("Vaults")}
            />
          </View>
          <VaultList vaults={data.vaults} onOpen={(id) => root.navigate("VaultDetail", { id })} />
          <Typography variant="heading">Holdings</Typography>
          {data.holdings.length === 0 && <Typography>No holdings yet.</Typography>}
          <Surface>
            {data.holdings.map((holding) => (
              <GroupedRow
                key={holding.id}
                label={holding.name}
                detail={`${holding.units} ${holding.ticker} units · ${holding.change}%`}
                value={dollars(holding.valueCents)}
                accessibilityLabel={`Open ${holding.ticker} holding`}
                onPress={() => root.navigate("VaultDetail", { id: holding.id })}
              />
            ))}
          </Surface>
        </>
      )}
    </Screen>
  );
}
