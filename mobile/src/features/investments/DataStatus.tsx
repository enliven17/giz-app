import { View } from "react-native";
import { Notice } from "@/components/molecules/Notice";
import { Button } from "@/components/atoms/Button";
import { Typography } from "@/components/atoms/Typography";
import { useInvestments } from "./InvestmentProvider";
export function DataStatus() {
  const { data, loading, error, retry } = useInvestments();
  return (
    <View className="gap-3">
      <Notice message="Demo data — no real funds or transactions." />
      {data && <Typography>{`As of ${data.asOf}`}</Typography>}
      {data?.freshness !== undefined && data.freshness !== "fresh" && (
        <Notice
          message={
            data.freshness === "offline"
              ? "Offline snapshot — values may be outdated."
              : "Stale snapshot — values may be outdated."
          }
        />
      )}
      {error && <Notice error message={error} />}
      <Button
        label={loading ? "Loading demo data" : error ? "Retry data" : "Refresh data"}
        loading={loading}
        variant="secondary"
        onPress={retry}
      />
    </View>
  );
}
