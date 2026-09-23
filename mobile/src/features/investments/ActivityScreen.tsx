import { BackAction } from "@/navigation/BackAction";
import { Screen } from "@/components/templates/Screen";
import { Typography } from "@/components/atoms/Typography";
import { Metric } from "@/components/molecules/Metric";
import { useInvestments } from "./InvestmentProvider";
import { DataStatus } from "./DataStatus";
export function ActivityScreen() {
  const { data } = useInvestments();
  return (
    <Screen>
      <BackAction fallback="Home" />
      <Typography variant="heading">Activity</Typography>
      <DataStatus />
      {data && (
        <>
          {data.activity.length === 0 && <Typography>No activity yet.</Typography>}
          {data.activity.map((item) => (
            <Metric key={item.id} label={`${item.month} · ${item.label}`} value={`${item.value}`} />
          ))}
        </>
      )}
    </Screen>
  );
}
