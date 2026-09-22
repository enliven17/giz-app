import { useEffect, useRef, useState } from "react";
import { Share } from "react-native";
import { useInvestments } from "./InvestmentProvider";
export function useVaultDetailController(id: string) {
  const { data } = useInvestments();
  const vault = data?.vaults.find((item) => item.id === id);
  const active = useRef(true);
  const busy = useRef(false);
  const [sharing, setSharing] = useState(false);
  const [shareError, setShareError] = useState(false);
  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
    };
  }, []);
  async function share() {
    if (!vault || busy.current) return;
    busy.current = true;
    setSharing(true);
    setShareError(false);
    try {
      await Share.share({
        message: `Gizu demo vault: ${vault.name} (${vault.ticker})\n${vault.managers}\n${vault.strategy}\n${vault.risk} risk (fixture). Demo only; not an investment offer or live quote.`,
      });
    } catch {
      if (active.current) setShareError(true);
    } finally {
      busy.current = false;
      if (active.current) setSharing(false);
    }
  }
  return { data, vault, sharing, shareError, share };
}
