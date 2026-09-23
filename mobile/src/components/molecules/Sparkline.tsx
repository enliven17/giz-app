import Svg, { Polyline } from "react-native-svg";
import colors from "@/theme/colors.json";
export function Sparkline({
  series,
  negative = false,
  height = 48,
}: {
  series: number[];
  negative?: boolean;
  height?: number;
}) {
  if (series.length < 2) return null;
  const low = Math.min(...series),
    high = Math.max(...series);
  const points = series
    .map(
      (value, i) =>
        `${4 + (i * 292) / (series.length - 1)},${44 - ((value - low) / Math.max(1, high - low)) * 38}`,
    )
    .join(" ");
  return (
    <Svg
      width="100%"
      height={height}
      viewBox="0 0 300 48"
      preserveAspectRatio="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Polyline
        points={points}
        fill="none"
        stroke={negative ? colors.danger : colors.accent}
        strokeWidth={2}
        vectorEffect="non-scaling-stroke"
      />
    </Svg>
  );
}
