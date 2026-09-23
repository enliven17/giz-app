import { useContext, useEffect, useRef, useState } from "react";
import { EarlyAccessContext } from "./EarlyAccessProvider";
import type { EarlyAccessRequest } from "@/services/earlyAccess";

export function useEarlyAccessController() {
  const service = useContext(EarlyAccessContext);
  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState<EarlyAccessRequest["amount"] | null>(null);
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [other, setOther] = useState("");
  const [status, setStatus] = useState<"editing" | "pending" | "success">("editing");
  const [error, setError] = useState<string | null>(null);
  const attempt = useRef(0);
  const locked = useRef(false);
  useEffect(
    () => () => {
      attempt.current += 1;
    },
    [],
  );
  function togglePlatform(value: string) {
    setPlatforms((current) =>
      current.includes(value) ? current.filter((p) => p !== value) : [...current, value],
    );
  }
  async function submit() {
    if (locked.current) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Enter a valid email address.");
      return;
    }
    if (!amount) {
      setError("Choose an investment range.");
      return;
    }
    if (!platforms.length && !other.trim()) {
      setError("Choose a platform or enter another platform.");
      return;
    }
    locked.current = true;
    const id = ++attempt.current;
    setError(null);
    setStatus("pending");
    try {
      await service.submit({
        email: email.trim(),
        amount,
        platforms: [...platforms],
        other: other.trim(),
      });
      if (attempt.current === id) setStatus("success");
    } catch {
      if (attempt.current === id) {
        locked.current = false;
        setStatus("editing");
        setError("Your request could not be completed. Please try again.");
      }
    }
  }
  return {
    email,
    setEmail,
    amount,
    setAmount,
    platforms,
    togglePlatform,
    other,
    setOther,
    status,
    error,
    submit,
  };
}
