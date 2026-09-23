import { useEffect, useState } from "react";
import { AccessibilityInfo, AppState } from "react-native";
import { useIsFocused } from "@react-navigation/native";

export function useWelcomeMotion() {
  const focused = useIsFocused();
  const [reduced, setReduced] = useState(true);
  const [active, setActive] = useState(AppState.currentState === "active");
  useEffect(() => {
    let mounted = true;
    let changed = false;
    const preference = AccessibilityInfo.addEventListener("reduceMotionChanged", (value) => {
      changed = true;
      setReduced(value);
    });
    const app = AppState.addEventListener("change", (state) => setActive(state === "active"));
    AccessibilityInfo.isReduceMotionEnabled()
      .then((value) => {
        if (mounted && !changed) setReduced(value);
      })
      .catch(() => undefined);
    return () => {
      mounted = false;
      preference.remove();
      app.remove();
    };
  }, []);
  return focused && active && !reduced;
}
