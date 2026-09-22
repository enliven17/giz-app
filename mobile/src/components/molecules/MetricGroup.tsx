import { View, useWindowDimensions } from "react-native";
import { Metric } from "./Metric";
export function MetricGroup({ metrics }: { metrics: { label: string; value: string }[] }) {
  const { width, fontScale } = useWindowDimensions();
  const stacked = width < 360 || fontScale > 1.3;
  return (
    <View className="flex-row flex-wrap gap-3">
      {metrics.map((metric) => (
        <View key={metric.label} style={{ width: stacked ? "100%" : "47%", flexGrow: 1 }}>
          <Metric {...metric} />
        </View>
      ))}
    </View>
  );
}
