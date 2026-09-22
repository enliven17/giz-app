import Animated, { FadeIn, ReduceMotion } from "react-native-reanimated";
import { ShieldCheck } from "lucide-react-native";
import colors from "@/theme/colors.json";
export function BrandMark() {
  return (
    <Animated.View
      entering={FadeIn.duration(350).reduceMotion(ReduceMotion.System)}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      className="h-20 w-20 items-center justify-center rounded-3xl border border-border bg-surface"
    >
      <ShieldCheck color={colors.accent} size={40} />
    </Animated.View>
  );
}
