import { useState } from "react";
import { View } from "react-native";
import { Notice } from "./Notice";
import { Button } from "@/components/atoms/Button";
import { Typography } from "@/components/atoms/Typography";
type Props = {
  asOf?: string;
  freshness?: "fresh" | "stale" | "offline";
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
};
export function SnapshotStatus({ asOf, freshness, loading, error, onRefresh }: Props) {
  const [expanded, setExpanded] = useState(false);
  return (
    <View className="gap-2">
      <View className="flex-row flex-wrap items-center justify-between gap-1">
        {asOf ? (
          <Button
            label="Updated"
            accessibilityLabel={expanded ? "Hide data timestamp" : "Show data timestamp"}
            variant="quiet"
            onPress={() => setExpanded(!expanded)}
          />
        ) : null}
        <Button
          variant="quiet"
          label={loading ? "Loading data" : error ? "Retry data" : "Refresh data"}
          loading={loading}
          onPress={onRefresh}
        />
      </View>
      {freshness && freshness !== "fresh" && (
        <Notice
          message={
            freshness === "offline"
              ? "Offline snapshot — values may be outdated."
              : "Stale snapshot — values may be outdated."
          }
        />
      )}
      {error && <Notice error message={error} />}
      {expanded && asOf && <Typography variant="caption">{`As of ${asOf}`}</Typography>}
    </View>
  );
}
