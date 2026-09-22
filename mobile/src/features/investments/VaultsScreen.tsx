import { useState } from "react";
import { View } from "react-native";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { MainTabParamList, RootStackParamList } from "@/navigation/types";
import { Screen } from "@/components/templates/Screen";
import { Typography } from "@/components/atoms/Typography";
import { Button } from "@/components/atoms/Button";
import { SearchInput } from "@/components/atoms/SearchInput";
import { Choice } from "@/components/molecules/Choice";
import { VaultList } from "@/components/organisms/VaultList";
import { filterVaults, type Risk } from "@/domain/investments";
import { useInvestments } from "./InvestmentProvider";
import { DataStatus } from "./DataStatus";
export function VaultsScreen({ navigation }: BottomTabScreenProps<MainTabParamList, "Vaults">) {
  const { data } = useInvestments();
  const [query, setQuery] = useState("");
  const [risk, setRisk] = useState<Risk | "All">("All");
  const filtered = filterVaults(data?.vaults ?? [], query, risk);
  return (
    <Screen>
      <Typography variant="heading">Private vaults</Typography>
      <DataStatus />
      <SearchInput
        label="Search name, ticker, strategy or manager"
        value={query}
        onChangeText={setQuery}
      />
      <View
        className="flex-row flex-wrap gap-2"
        accessibilityRole="radiogroup"
        accessibilityLabel="Risk filter"
      >
        {(["All", "Low", "Medium", "High"] as const).map((value) => (
          <Choice
            key={value}
            label={`${value} risk`}
            selected={risk === value}
            onPress={() => setRisk(value)}
          />
        ))}
      </View>
      <Button
        label="Clear filters"
        variant="secondary"
        onPress={() => {
          setQuery("");
          setRisk("All");
        }}
      />
      <Button label="Advanced filters — unavailable in this demo" disabled onPress={() => {}} />
      {data && (
        <>
          <Typography accessibilityLiveRegion="polite">{`${filtered.length} vaults found`}</Typography>
          {filtered.length === 0 && (
            <Typography>
              {data.vaults.length ? "No vaults match your filters." : "No vaults available."}
            </Typography>
          )}
          <VaultList
            vaults={filtered}
            onOpen={(id) =>
              navigation
                .getParent<NativeStackNavigationProp<RootStackParamList>>()
                .navigate("VaultDetail", { id })
            }
          />
        </>
      )}
    </Screen>
  );
}
