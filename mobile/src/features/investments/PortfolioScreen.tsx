import { useSession } from "@/application/SessionProvider";
import { useWallet } from "@/features/wallet/WalletProvider";
import { useNotifications } from "@/features/notifications/NotificationProvider";
import { useTransactions } from "@/features/transactions/TransactionProvider";
import { OperationLink } from "@/features/transactions/OperationLink";
import { decimal } from "@/domain/transactions";
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
export function PortfolioScreen(props: BottomTabScreenProps<MainTabParamList, "Home">) {
  const { session } = useSession();
  return session?.kind === "testnet" ? (
    <NativePortfolio {...props} />
  ) : (
    <DemoPortfolio {...props} />
  );
}
function DemoPortfolio({ navigation }: BottomTabScreenProps<MainTabParamList, "Home">) {
  const { unread } = useNotifications();
  const { data } = useInvestments();
  const { account, error: balanceError } = useTransactions();
  const holdings = account && account.revision > 0 ? account.holdings : (data?.holdings ?? []);
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
        <IconButton
          icon={Bell}
          label={`Notifications, ${unread} unread`}
          onPress={() => root.navigate("Notifications")}
        />
      </View>
      <View className="mt-4 gap-2">
        <Typography variant="heading">Your portfolio</Typography>
        <Typography variant="caption">Vault holdings · USD</Typography>
        {data && <Balance value={portfolioTotal(holdings)} />}
        {data && holdings.length > 0 && (
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
      {account && (
        <Typography variant="row">
          {balanceError
            ? "Available USDC: refresh required"
            : `Available USDC: ${decimal(account.cash)}`}
        </Typography>
      )}
      <OperationLink />
      {data && (
        <>
          <HistoryChart series={data.portfolioSeries} />
          <View className="flex-row flex-wrap gap-3">
            <View className="min-w-24 flex-1">
              <Button
                label="Deposit"
                onPress={() => root.navigate("Transaction", { kind: "deposit" })}
              />
            </View>
            <View className="min-w-24 flex-1">
              <Button
                label="Withdraw"
                onPress={() => root.navigate("Transaction", { kind: "withdraw" })}
              />
            </View>
            <IconButton
              icon={MoreHorizontal}
              label="View activity"
              onPress={() => root.navigate("Activity")}
            />
          </View>
          {holdings.length === 0 ? (
            <>
              <Typography>No holdings yet.</Typography>
              <View className="mt-3 flex-row flex-wrap items-center justify-between gap-2">
                <Typography variant="heading">Confidential vaults</Typography>
                <Button
                  label="See all vaults"
                  variant="quiet"
                  onPress={() => navigation.navigate("Vaults")}
                />
              </View>
              <VaultList
                vaults={data.vaults}
                onOpen={(id) => root.navigate("VaultDetail", { id })}
              />
            </>
          ) : (
            <>
              <Typography variant="heading">Holdings</Typography>
              <Surface>
                {holdings.map((holding) => (
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
        </>
      )}
    </Screen>
  );
}

function NativePortfolio({ navigation }: BottomTabScreenProps<MainTabParamList, "Home">) {
  const wallet = useWallet();
  const root = navigation.getParent<NativeStackNavigationProp<RootStackParamList>>();
  return (
    <Screen>
      <View className="flex-row items-center gap-3">
        <View className="rounded-2xl border border-border bg-surface p-3">
          <Typography variant="label">G</Typography>
        </View>
        <View className="flex-1">
          <Typography variant="caption">
            Monad testnet · Account {wallet.session.accountIndex}
          </Typography>
          <Typography variant="row">Welcome back</Typography>
        </View>
        <IconButton icon={Bell} label="Notifications unavailable" disabled onPress={() => {}} />
      </View>
      <View className="mt-4 gap-2">
        <Typography variant="heading">Your portfolio</Typography>
        <Typography variant="caption">Available balance · Testnet MON</Typography>
        {wallet.loading ? (
          <Typography>Loading balance…</Typography>
        ) : wallet.error ? (
          <Typography accessibilityRole="alert">Balance unavailable. Please retry.</Typography>
        ) : wallet.balance !== null ? (
          <Balance value={wallet.balance + " MON"} />
        ) : null}
      </View>
      <Button
        label={wallet.error ? "Retry balance" : "Refresh balance"}
        disabled={wallet.loading}
        onPress={() => void wallet.refresh()}
      />
      <Typography variant="caption">
        Testnet MON has no real monetary value. USD valuation and performance data are unavailable.
      </Typography>
      <View className="flex-row flex-wrap gap-3">
        <View className="min-w-24 flex-1">
          <Button
            label="Deposit"
            onPress={() => root.navigate("Transaction", { kind: "deposit" })}
          />
        </View>
        <View className="min-w-24 flex-1">
          <Button
            label="Withdraw"
            onPress={() => root.navigate("Transaction", { kind: "withdraw" })}
          />
        </View>
        <IconButton
          icon={MoreHorizontal}
          label="View activity"
          onPress={() => root.navigate("Activity")}
        />
      </View>
      <Typography variant="caption">
        Transfers use native approval. Activity lists outgoing transfers recorded on this device.
      </Typography>
      <View className="mt-3 flex-row flex-wrap items-center justify-between gap-2">
        <Typography variant="heading">Confidential vaults</Typography>
        <Button
          label="See all vaults"
          variant="quiet"
          onPress={() => navigation.navigate("Vaults")}
        />
      </View>
      <Surface>
        <View className="p-5">
          <Typography>Vault holdings and investment services are unavailable.</Typography>
        </View>
      </Surface>
    </Screen>
  );
}
