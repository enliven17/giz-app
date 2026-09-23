import { useEffect, useState } from "react";
import { View, useWindowDimensions } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";
import { Typography } from "@/components/atoms/Typography";
import colors from "@/theme/colors.json";

const bands = [
  { top: 10, height: 9, direction: 1 },
  { top: 22, height: 8, direction: -1 },
  { top: 33, height: 7, direction: 1 },
];
const textStyle = { lineHeight: 45, color: colors.accent };

function Tear({
  clock,
  width,
  band,
}: {
  clock: SharedValue<number>;
  width: number;
  band: (typeof bands)[number];
}) {
  const visibility = useAnimatedStyle(() => {
    const time = clock.value;
    const phase = time < 1 ? time - 0.55 : time - 7.65;
    return { opacity: phase >= 0 && phase < (time < 1 ? 0.36 : 0.24) ? 1 : 0 };
  });
  const displacement = useAnimatedStyle(() => {
    const time = clock.value;
    const phase = time < 1 ? time - 0.55 : time - 7.65;
    const amplitude = time < 1 ? 7 : 4;
    const offset = phase < 0.1 ? amplitude : phase < 0.2 ? -amplitude : 2;
    return { transform: [{ translateX: offset * band.direction }] };
  });
  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          top: band.top,
          left: -8,
          width: width + 16,
          height: band.height,
          overflow: "hidden",
          backgroundColor: colors.ink,
        },
        visibility,
      ]}
    >
      <Animated.View
        style={[{ position: "absolute", top: -band.top, left: 8, width }, displacement]}
      >
        <Typography
          variant="title"
          style={{
            ...textStyle,
            textShadowColor: "#29e7df",
            textShadowOffset: { width: -3 * band.direction, height: 0 },
            textShadowRadius: 0,
          }}
        >
          Stealth
        </Typography>
      </Animated.View>
    </Animated.View>
  );
}

function StealthTears({ width }: { width: number }) {
  const clock = useSharedValue(0);
  useEffect(() => {
    clock.value = withSequence(
      ReduceMotion.System,
      withTiming(1, { duration: 1000, easing: Easing.linear }),
      withRepeat(
        withTiming(8, { duration: 7000, easing: Easing.linear }),
        -1,
        false,
        undefined,
        ReduceMotion.System,
      ),
    );
    return () => cancelAnimation(clock);
  }, [clock]);
  return (
    <View
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{ position: "absolute", top: 0, left: 0 }}
    >
      {bands.map((band) => (
        <Tear key={band.top} clock={clock} width={width} band={band} />
      ))}
    </View>
  );
}

export function WelcomeHeading({ animate }: { animate: boolean }) {
  const { fontScale } = useWindowDimensions();
  const [width, setWidth] = useState(0);
  // Preserve native text wrapping at large accessibility sizes.
  if (fontScale !== 1)
    return (
      <Typography variant="title">
        <Typography variant="title" style={{ color: colors.accent }}>
          DeFi
        </Typography>
        {" in\n"}
        <Typography variant="title" style={{ color: colors.accent }}>
          Stealth
        </Typography>
        {" Mode"}
      </Typography>
    );
  return (
    <View accessible accessibilityRole="header" accessibilityLabel="DeFi in Stealth Mode">
      <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <Typography variant="title" style={{ lineHeight: 45 }}>
          <Typography variant="title" style={{ color: colors.accent }}>
            DeFi
          </Typography>
          {" in"}
        </Typography>
        <View className="flex-row flex-wrap items-baseline">
          <View onLayout={(event) => setWidth(event.nativeEvent.layout.width)}>
            <Typography variant="title" style={textStyle}>
              Stealth
            </Typography>
            {animate && width > 0 && <StealthTears width={width} />}
          </View>
          <Typography variant="title" style={{ lineHeight: 45 }}>
            {" Mode"}
          </Typography>
        </View>
      </View>
    </View>
  );
}
