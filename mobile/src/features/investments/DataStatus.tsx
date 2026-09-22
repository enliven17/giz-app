import { SnapshotStatus } from "@/components/molecules/SnapshotStatus";
import { useInvestments } from "./InvestmentProvider";
export function DataStatus() {
  const { data, loading, error, retry } = useInvestments();
  return (
    <SnapshotStatus
      asOf={data?.asOf}
      freshness={data?.freshness}
      loading={loading}
      error={error}
      onRefresh={retry}
    />
  );
}
