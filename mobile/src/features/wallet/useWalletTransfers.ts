import { useCallback, useEffect, useRef, useState } from "react";
import type { WalletHistory, WalletTransferService } from "@/services/walletTransfers";
import { transferProposal } from "@/domain/nativeTransfers";

export function useWalletTransfers(
  address: string,
  service: WalletTransferService,
  onSettled: () => Promise<void>,
) {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("0.001");
  const [history, setHistory] = useState<WalletHistory>({ entries: [], blocked: false });
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("Loading transfer history…");
  const active = useRef(true);
  const running = useRef(false);
  const load = useCallback(() => {
    if (running.current) return Promise.resolve();
    running.current = true;
    return Promise.resolve()
      .then(() => service.history(address))
      .then((value) => {
        if (!active.current) return;
        setHistory(value);
        setReady(true);
        setMessage(
          value.blocked
            ? "A transfer is pending or unknown. Refresh status before sending again."
            : "",
        );
      })
      .catch(() => {
        if (!active.current) return;
        setReady(false);
        setMessage(
          "Could not refresh history. Refresh again before sending; shown results may be out of date.",
        );
      })
      .finally(() => {
        running.current = false;
        if (active.current) setBusy(false);
      });
  }, [address, service]);
  useEffect(() => {
    active.current = true;
    void load();
    return () => {
      active.current = false;
      service.cancel();
    };
  }, [load, service]);
  const refresh = useCallback(async () => {
    if (running.current) return;
    setBusy(true);
    await load();
    if (active.current) await onSettled();
  }, [load, onSettled]);
  async function send() {
    if (running.current || !ready || history.blocked) return;
    try {
      transferProposal("0", recipient.trim(), amount.trim());
    } catch {
      setMessage("Enter a full recipient address and an amount above 0 up to 0.1 MON.");
      return;
    }
    running.current = true;
    setBusy(true);
    setMessage("Unlock the same passkey and review the exact transfer in the native screen.");
    try {
      const value = await service.send(address, recipient.trim(), amount.trim());
      if (!active.current) return;
      setHistory(value);
      setReady(true);
      setMessage(
        value.blocked
          ? "Transfer pending or unknown. Refresh status; do not submit again."
          : "Native operation finished. Check the transaction status below.",
      );
    } catch {
      if (active.current) {
        setReady(false);
        setMessage(
          "Transfer stopped or cancelled. Refresh history before retrying. Use this wallet’s passkey and check testnet funds. A submitted transfer cannot be undone.",
        );
      }
    } finally {
      running.current = false;
      if (active.current) {
        setBusy(false);
        await onSettled();
      }
    }
  }
  return {
    recipient,
    setRecipient,
    amount,
    setAmount,
    history,
    busy,
    ready,
    message,
    refresh,
    send,
  };
}
