import Svg, { Defs, LinearGradient, Stop, Path } from "react-native-svg";
import colors from "@/theme/colors.json";
// Static artwork deliberately supports reduced motion without continuous GPU work.
export function AmbientArtwork() {
  return (
    <Svg
      width="100%"
      height={180}
      viewBox="0 0 360 180"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Defs>
        <LinearGradient id="wave" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={colors.accent} stopOpacity={0.4} />
          <Stop offset="1" stopColor={colors.ink} stopOpacity={0} />
        </LinearGradient>
      </Defs>
      <Path d="M0 150 Q90 0 180 90 T360 30 L360 180 L0 180Z" fill="url(#wave)" />
      <Path
        d="M0 165 Q110 40 210 110 T360 65"
        stroke={colors.accent}
        strokeOpacity={0.4}
        fill="none"
      />
    </Svg>
  );
}
