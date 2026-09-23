import { useEffect, useMemo } from "react";
import { AccessibilityInfo, View } from "react-native";
import { Canvas, Points, useClock, vec } from "@shopify/react-native-skia";
import { useDerivedValue, useSharedValue, withTiming } from "react-native-reanimated";
import colors from "@/theme/colors.json";

type Dot = {
  x: number;
  y: number;
  z: number;
  dx: number;
  dy: number;
  dz: number;
  size: number;
};

// Same Fibonacci sphere the web orb uses, plus a per-dot burst direction.
function buildDots(count: number): Dot[] {
  const dots: Dot[] = [];
  const phi = Math.PI * (3 - Math.sqrt(5));
  const radius = 1.15;
  // Deterministic jitter keeps snapshots stable across runs.
  let seed = 7;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };

  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const ring = Math.sqrt(1 - y * y);
    const theta = phi * i;
    const x = Math.cos(theta) * ring * radius;
    const z = Math.sin(theta) * ring * radius;

    const jitter = 0.45;
    const dx = x / radius + (rand() - 0.5) * jitter;
    const dy = y + (rand() - 0.5) * jitter;
    const dz = z / radius + (rand() - 0.5) * jitter;
    const len = Math.hypot(dx, dy, dz) || 1;
    const spread = 0.6 + rand() * 0.8;

    dots.push({
      x,
      y: y * radius,
      z,
      dx: (dx / len) * spread,
      dy: (dy / len) * spread,
      dz: (dz / len) * spread,
      size: 0.85 + rand() * 0.5,
    });
  }
  return dots;
}

type ParticleOrbProps = {
  /** scatter the dots outwards, used when an order settles */
  burst?: boolean;
  size?: number;
  color?: string;
  count?: number;
  testID?: string;
};

/**
 * Native counterpart of the web ParticleDotOrb. Projection and burst maths are
 * identical, only the renderer changed from three.js to Skia.
 */
export function ParticleOrb({
  burst = false,
  size = 240,
  color = colors.accent,
  count = 340,
  testID = "gizu-particle-orb",
}: ParticleOrbProps) {
  const dots = useMemo(() => buildDots(count), [count]);
  const clock = useClock();
  const progress = useSharedValue(0);
  const reduceMotion = useSharedValue(false);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        if (mounted) reduceMotion.value = enabled;
      })
      .catch(() => undefined);
    const subscription = AccessibilityInfo.addEventListener("reduceMotionChanged", (enabled) => {
      reduceMotion.value = enabled;
    });
    return () => {
      mounted = false;
      subscription.remove();
    };
  }, [reduceMotion]);

  useEffect(() => {
    progress.value = withTiming(burst ? 1 : 0, { duration: burst ? 900 : 260 });
  }, [burst, progress]);

  const points = useDerivedValue(() => {
    const spin = reduceMotion.value ? 0.6 : clock.value / 2600;
    const cos = Math.cos(spin);
    const sin = Math.sin(spin);
    const half = size / 2;
    const scale = size * 0.3;
    const spread = 2.6 * progress.value;

    return dots.map((d) => {
      const x = d.x + d.dx * spread;
      const y = d.y + d.dy * spread;
      const z = d.z + d.dz * spread;
      // y axis rotation, then a simple perspective divide
      const rx = x * cos - z * sin;
      const rz = x * sin + z * cos;
      const depth = 4.4 / (4.4 - rz);
      return vec(half + rx * scale * depth, half + y * scale * depth);
    });
  });

  const opacity = useDerivedValue(() => 1 - Math.max(0, (progress.value - 0.6) / 0.4));

  return (
    <View
      testID={testID}
      style={{ width: size, height: size }}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Canvas style={{ flex: 1 }}>
        <Points
          points={points}
          mode="points"
          color={color}
          style="stroke"
          strokeWidth={size / 70}
          strokeCap="round"
          opacity={opacity}
        />
      </Canvas>
    </View>
  );
}
