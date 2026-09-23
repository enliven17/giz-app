import { useEffect, useRef, useState } from "react";
import { AppState, Platform } from "react-native";
import { ProbeError, type ProbeResult, type ProbeWallet } from "@/domain/probeWallet";
import type { MeraProbeService, ProbeAction } from "@/services/meraProbe";

export function useProbeController(service: MeraProbeService) {
  const [wallet, setWallet] = useState<ProbeWallet | null>(null);
  const [result, setResult] = useState<ProbeResult | null>(null);
  const [message, setMessage] = useState("Loading remembered test metadata…");
  const [busy, setBusy] = useState(true);
  const [blocked, setBlocked] = useState(service.availability);
  const running = useRef(true);
  const mounted = useRef(false);
  const attempt = useRef(0);

  useEffect(() => {
    mounted.current = true;
    let active = true;
    function abandonAttempt() {
      attempt.current++;
      service.abandon();
    }
    service
      .read()
      .then((stored) => {
        if (active) {
          setWallet(stored);
          setMessage(
            stored
              ? "Remembered address only. Recover it to prove continuity."
              : "Ready for an unfunded test passkey.",
          );
        }
      })
      .catch(() => {
        if (active)
          setMessage("Could not read test metadata. Forget it locally or restart before retrying.");
      })
      .finally(() => {
        if (active) {
          running.current = false;
          setBusy(false);
        }
      });
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "background") {
        // Android credential providers open another Activity. Preserve only the
        // pending ceremony; the service still requires foreground before key use.
        if (Platform.OS === "android" && service.awaitingPasskey()) {
          setResult(null);
          return;
        }
        abandonAttempt();
        setResult(null);
        setMessage(
          "Probe abandoned in background. Wait for the system request to finish, then retry.",
        );
      }
      if (state === "active") setBlocked(service.availability());
    });
    return () => {
      active = false;
      mounted.current = false;
      abandonAttempt();
      subscription.remove();
    };
  }, [service]);

  async function run(action: ProbeAction | "forget" | "self-check") {
    if (running.current) return;
    running.current = true;
    const id = ++attempt.current;
    setBusy(true);
    setResult(null);
    setMessage(
      action === "forget"
        ? "Removing local metadata…"
        : action === "self-check"
          ? "Checking native randomness, derivation and signature recovery with a public test vector…"
          : "Waiting for the native request. Creation may show two prompts.",
    );
    try {
      if (action === "self-check") {
        await service.selfCheck();
        if (mounted.current && id === attempt.current)
          setMessage(
            "Offline crypto self-check passed. Known public test vector; no passkey used or wallet stored.",
          );
      } else if (action === "forget") {
        await service.forget();
        if (mounted.current && id === attempt.current) {
          setWallet(null);
          setMessage("Local metadata removed. The provider still holds the passkey.");
        }
      } else {
        const next = await service.run(action);
        if (mounted.current && id === attempt.current) {
          setWallet(next.wallet);
          setResult(next);
          setMessage(
            next.proof
              ? "Test signature verified against the recovered address."
              : next.recovered
                ? "Same passkey recovered the same address."
                : "Test address derived; signing session ended.",
          );
        }
      }
    } catch (error) {
      if (mounted.current && id === attempt.current)
        setMessage(
          error instanceof ProbeError
            ? error.message
            : action === "self-check"
              ? "Offline crypto self-check failed. No passkey was used or wallet stored."
              : "Probe failed. If creation started, open the existing passkey before creating another. No signing session is retained.",
        );
    } finally {
      running.current = false;
      if (mounted.current) setBusy(false);
    }
  }
  return { wallet, result, message, busy, blocked, run };
}
