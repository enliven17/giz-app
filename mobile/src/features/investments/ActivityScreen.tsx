import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "@/navigation/types";
import { Screen } from "@/components/templates/Screen";
import { Typography } from "@/components/atoms/Typography";
import { Button } from "@/components/atoms/Button";
import { Metric } from "@/components/molecules/Metric";
import { useInvestments } from "./InvestmentProvider";
import { DataStatus } from "./DataStatus";
export function ActivityScreen({
  navigation,
}: NativeStackScreenProps<RootStackParamList, "Activity">) {
  const { data } = useInvestments();
  return (
    <Screen>
      <Typography variant="heading">Demo activity</Typography>
      <DataStatus />
      {data && (
        <>
          {data.activity.length === 0 && <Typography>No activity yet.</Typography>}
          {data.activity.map((item) => (
            <Metric
              key={item.id}
              label={`${item.month} · ${item.label}`}
              value={`${item.value} (simulated history)`}
            />
          ))}
        </>
      )}
      <Button
        label="Back from activity"
        variant="secondary"
        onPress={() =>
          navigation.canGoBack()
            ? navigation.goBack()
            : navigation.navigate("Main", { screen: "Home" })
        }
      />
    </Screen>
  );
}
