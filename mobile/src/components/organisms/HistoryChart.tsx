import { useState } from "react";
import { View } from "react-native";
import Svg, { Polyline } from "react-native-svg";
import { Typography } from "@/components/atoms/Typography";
import { Choice } from "@/components/molecules/Choice";
import colors from "@/theme/colors.json";
import { periods, periodSeries, type Period } from "@/domain/investments";
export function HistoryChart({ series }: { series: number[] }) {
  const [period, setPeriod] = useState<Period>("1M");
  const values = periodSeries(series, period);
  const low = Math.min(...values),
    high = Math.max(...values);
  const points = values
    .map(
      (v, i) =>
        `${10 + (i * 280) / Math.max(1, values.length - 1)},${130 - ((v - low) / Math.max(1, high - low)) * 110}`,
    )
    .join(" ");
  return (
    <View className="gap-3">
      <Typography variant="label">Performance index</Typography>
      <View
        className="flex-row flex-wrap gap-2"
        accessibilityRole="radiogroup"
        accessibilityLabel="Chart period"
      >
        {periods.map((value) => (
          <Choice
            key={value}
            label={value}
            selected={period === value}
            onPress={() => setPeriod(value)}
          />
        ))}
      </View>
      {values.length > 1 ? (
        <>
          <Svg
            width="100%"
            height={150}
            viewBox="0 0 300 150"
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
          >
            <Polyline points={points} fill="none" stroke={colors.accent} strokeWidth={3} />
          </Svg>
          <Typography
            variant="caption"
            accessibilityLiveRegion="polite"
          >{`${period} index: Start ${values[0]!.toFixed(2)} · End ${values[values.length - 1]!.toFixed(2)} (${values.length} samples)`}</Typography>
        </>
      ) : (
        <Typography>No chart history available.</Typography>
      )}
    </View>
  );
}
