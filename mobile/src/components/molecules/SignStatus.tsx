import { useEffect, useRef, useState } from "react";
import { AccessibilityInfo, View } from "react-native";
import LottieView from "lottie-react-native";
import { Typography } from "@/components/atoms/Typography";
import { ParticleOrb } from "@/components/molecules/ParticleOrb";
import { signFailure, signSuccess } from "@/animations/signResult";

export type SignState = "signing" | "done" | "failed";

type SignStatusProps = {
  state: SignState;
  doneLabel?: string;
  detail?: string;
  tone?: "positive" | "negative";
  testID?: string;
};

const LABEL: Record<SignState, string> = {
  signing: "Signing with passkey",
  done: "Order filled",
  failed: "Signature rejected",
};

/**
 * Orb scatters on Skia, the result mark plays as Lottie, same beats as the web
 * sign overlay.
 */
export function SignStatus({
  state,
  doneLabel,
  detail,
  tone = "positive",
  testID = "gizu-sign-status",
}: SignStatusProps) {
  const mark = useRef<LottieView>(null);
  const [reduceMotion, setReduceMotion] = useState(true);
  const settled = state !== "signing";
  const accent = tone === "negative" ? "#c4576a" : undefined;

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        if (mounted) setReduceMotion(enabled);
      })
      .catch(() => undefined);
    const subscription = AccessibilityInfo.addEventListener("reduceMotionChanged", setReduceMotion);
    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (!settled) return;
    if (reduceMotion) mark.current?.pause();
    else mark.current?.play();
  }, [settled, reduceMotion, state]);

  return (
    <View testID={testID} className="items-center gap-6">
      <View className="items-center justify-center">
        <ParticleOrb burst={settled} color={accent} />
        {settled ? (
          <View className="absolute h-[120px] w-[120px] items-center justify-center">
            <LottieView
              ref={mark}
              source={state === "done" ? signSuccess : signFailure}
              autoPlay={false}
              loop={false}
              progress={reduceMotion ? 1 : undefined}
              style={{ width: 120, height: 120 }}
              testID="gizu-sign-mark"
            />
          </View>
        ) : null}
      </View>

      <View className="items-center gap-2">
        <Typography variant="label" accessibilityLiveRegion="polite">
          {state === "done" && doneLabel ? doneLabel : LABEL[state]}
        </Typography>
        {state === "done" && detail ? <Typography variant="row">{detail}</Typography> : null}
      </View>
    </View>
  );
}
