import { useEffect, useState } from "react";
import { AccessibilityInfo, AppState, View, useWindowDimensions } from "react-native";
import { useIsFocused } from "@react-navigation/native";
import { ComingSoonGlitch } from "./ComingSoonGlitch";
import { Typography } from "@/components/atoms/Typography";
import colors from "@/theme/colors.json";

export function ComingSoonHeading() {
  const { width, fontScale } = useWindowDimensions();
  const focused = useIsFocused();
  const [reduceMotion, setReduceMotion] = useState(true);
  const [foreground, setForeground] = useState(AppState.currentState === "active");
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let current = true;
    let changed = false;
    const preference = AccessibilityInfo.addEventListener("reduceMotionChanged", (value) => {
      changed = true;
      setReduceMotion(value);
    });
    const appState = AppState.addEventListener("change", (value) =>
      setForeground(value === "active"),
    );
    AccessibilityInfo.isReduceMotionEnabled()
      .then((value) => {
        if (current && !changed) setReduceMotion(value);
      })
      .catch(() => undefined);
    return () => {
      current = false;
      preference.remove();
      appState.remove();
    };
  }, []);
  const animationWidth = Math.min(360, width - 72);
  const size = Math.min(48, (width - 72) / 6.4);
  // Native text preserves Dynamic Type; only normal-size display text is animated.
  const animate = focused && foreground && !reduceMotion && !failed && fontScale <= 1.2;
  return (
    <View
      accessible
      accessibilityRole="header"
      accessibilityLabel="Swap coming soon"
      className="items-center"
    >
      <View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        pointerEvents="none"
        className="items-center"
      >
        <Typography
          variant="title"
          style={{ fontSize: size, lineHeight: Math.ceil(size * 1.25), textAlign: "center" }}
        >
          Swap
        </Typography>
        <View
          style={{ width: animationWidth, minHeight: Math.ceil(size * 1.25) }}
          className="justify-center"
        >
          <Typography
            variant="title"
            style={{
              color: colors.accent,
              fontSize: size,
              lineHeight: Math.ceil(size * 1.25),
              textAlign: "center",
            }}
          >
            coming soon
          </Typography>
          {animate && (
            <ComingSoonGlitch
              width={animationWidth}
              size={size}
              onFailure={() => setFailed(true)}
            />
          )}
        </View>
      </View>
    </View>
  );
}
