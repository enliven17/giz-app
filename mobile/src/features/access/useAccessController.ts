import { useEffect, useRef, useState } from "react";
import { useSession } from "@/application/SessionProvider";
import { AccessRejectedError, type AccessMethod } from "@/services/access";
type AccessViewModel = {
  pending: boolean;
  error: string | null;
  start: (method: AccessMethod) => Promise<void>;
  cancel: () => void;
};

export function useAccessController(): AccessViewModel {
  const { accessService, signIn } = useSession();
  const attempt = useRef(0);
  const inFlight = useRef(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(
    () => () => {
      attempt.current += 1;
    },
    [],
  );
  function cancel() {
    attempt.current += 1;
    inFlight.current = false;
    setPending(false);
    setError(null);
  }
  async function start(method: AccessMethod) {
    if (inFlight.current) return;
    inFlight.current = true;
    const id = ++attempt.current;
    setPending(true);
    setError(null);
    try {
      const session = await accessService.request(method);
      if (id === attempt.current) signIn(session);
    } catch (cause) {
      if (id === attempt.current)
        setError(
          cause instanceof AccessRejectedError
            ? "Access was rejected. You can try again."
            : "Access failed. Please try again.",
        );
    } finally {
      if (id === attempt.current) {
        inFlight.current = false;
        setPending(false);
      }
    }
  }
  return { pending, error, start, cancel };
}
