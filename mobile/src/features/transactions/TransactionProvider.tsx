import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type PropsWithChildren,
} from "react";
import {
  TransactionError,
  type Quote,
  type Receipt,
  type TradingAccount,
} from "@/domain/transactions";
import { createMockTransactionService, type TransactionService } from "@/services/transactions";
import { useInvestments } from "@/features/investments/InvestmentProvider";
export type Operation = {
  key: string;
  quote: Quote;
  phase: "signing" | "submitting" | "pending" | "unknown" | "confirmed" | "failed" | "rejected";
  message?: string;
};
export const unresolved = (operation: Operation | null) =>
  !!operation && ["signing", "submitting", "pending", "unknown"].includes(operation.phase);
type Transactions = {
  account: TradingAccount | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  service: TransactionService | null;
  operation: Operation | null;
  history: Receipt[];
  checking: boolean;
  execute: (quote: Quote) => Promise<void>;
  checkStatus: () => Promise<void>;
  cancelSigning: () => void;
};
const Context = createContext<Transactions | null>(null);
export function TransactionProvider({
  children,
  service: supplied,
}: PropsWithChildren<{ service?: TransactionService }>) {
  const { data } = useInvestments();
  const adapter = useRef<TransactionService | null>(null);
  const [service, setService] = useState<TransactionService | null>(null);
  const [account, setAccount] = useState<TradingAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [operation, setOperation] = useState<Operation | null>(null);
  const [history, setHistory] = useState<Receipt[]>([]);
  const [checking, setChecking] = useState(false);
  const current = useRef<Operation | null>(null);
  const mounted = useRef(true),
    checkLock = useRef(false),
    sequence = useRef(0),
    generation = useRef(0),
    loadVersion = useRef(0);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      // Invalidate async transaction work owned by this provider instance.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      generation.current++;
    };
  }, []);
  async function refresh() {
    if (!adapter.current) return;
    const revision = ++loadVersion.current;
    setLoading(true);
    setError(null);
    try {
      const result = await adapter.current.load();
      if (mounted.current && revision === loadVersion.current) setAccount(result);
    } catch {
      if (mounted.current && revision === loadVersion.current)
        setError("Unable to load available balances. Retry before starting an operation.");
    } finally {
      if (mounted.current && revision === loadVersion.current) setLoading(false);
    }
  }
  useEffect(() => {
    if (!data || adapter.current) return;
    adapter.current = supplied ?? createMockTransactionService(data);
    setService(adapter.current);
    void refresh();
  }, [data, supplied]);
  function update(next: Operation) {
    current.current = next;
    if (mounted.current) setOperation(next);
  }
  function record(receipt: Receipt) {
    setHistory((previous) => [receipt, ...previous.filter((item) => item.key !== receipt.key)]);
  }
  async function execute(quote: Quote) {
    if (!adapter.current || unresolved(current.current) || loading || error) return;
    const token = ++generation.current;
    const next: Operation = { key: `operation-${++sequence.current}`, quote, phase: "signing" };
    update(next);
    try {
      const authorization = await adapter.current.sign(quote.id);
      if (!mounted.current || token !== generation.current) return;
      update({ ...next, phase: "submitting" });
      const receipt = await adapter.current.submit(quote.id, authorization, next.key);
      if (!mounted.current || token !== generation.current) return;
      update({ ...next, phase: receipt.status, message: receipt.message });
      record(receipt);
      if (receipt.status === "confirmed") await refresh();
    } catch (cause) {
      if (!mounted.current || token !== generation.current) return;
      const submitting = current.current?.phase === "submitting";
      const knownFailure =
        cause instanceof TransactionError &&
        ["expired", "not-submitted", "validation"].includes(cause.code);
      const phase =
        cause instanceof TransactionError && cause.code === "rejected"
          ? "rejected"
          : submitting && !knownFailure
            ? "unknown"
            : "failed";
      update({
        ...next,
        phase,
        message:
          cause instanceof TransactionError
            ? cause.message
            : phase === "unknown"
              ? "Submission status is unknown. Check status before trying again."
              : "Signing failed. Review and try again.",
      });
    }
  }
  function cancelSigning() {
    if (current.current?.phase !== "signing") return;
    generation.current++;
    update({
      ...current.current,
      phase: "rejected",
      message: "Signing cancelled. Nothing was submitted.",
    });
  }
  async function checkStatus() {
    const next = current.current;
    if (
      !adapter.current ||
      !next ||
      !["pending", "unknown"].includes(next.phase) ||
      checkLock.current
    )
      return;
    checkLock.current = true;
    setChecking(true);
    try {
      const receipt = await adapter.current.status(next.key);
      if (!mounted.current || current.current?.key !== next.key) return;
      update({ ...next, phase: receipt.status, message: receipt.message });
      record(receipt);
      if (receipt.status === "confirmed") await refresh();
    } catch {
      if (mounted.current)
        update({
          ...next,
          message: "Unable to check status. Keep this operation and check again; do not resubmit.",
        });
    } finally {
      checkLock.current = false;
      if (mounted.current) setChecking(false);
    }
  }
  return (
    <Context.Provider
      value={{
        account,
        loading,
        error,
        refresh,
        service,
        operation,
        history,
        checking,
        execute,
        checkStatus,
        cancelSigning,
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useTransactions() {
  const context = useContext(Context);
  if (!context) throw new Error("TransactionProvider required");
  return context;
}
