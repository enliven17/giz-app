import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type PropsWithChildren,
} from "react";
import type { InvestmentSnapshot } from "@/domain/investments";
import {
  demoInvestmentService,
  OfflineError,
  type InvestmentService,
} from "@/services/investments";
type InvestmentViewModel = {
  data: InvestmentSnapshot | null;
  loading: boolean;
  error: string | null;
  retry: () => void;
};
const Context = createContext<InvestmentViewModel | null>(null);
export function InvestmentProvider({
  children,
  service = demoInvestmentService,
}: PropsWithChildren<{ service?: InvestmentService }>) {
  const [data, setData] = useState<InvestmentSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revision, setRevision] = useState(0);
  const inFlight = useRef(true);
  useEffect(() => {
    let active = true;
    inFlight.current = true;
    // The adapter boundary is asynchronous, including synchronous adapter failures.
    Promise.resolve()
      .then(() => service.load())
      .then((result) => {
        if (active) setData(result);
      })
      .catch((cause) => {
        if (!active) return;
        const offline = cause instanceof OfflineError;
        setError(
          offline ? "Offline. Reconnect and retry." : "Unable to refresh data. Please retry.",
        );
        setData((previous) =>
          previous ? { ...previous, freshness: offline ? "offline" : "stale" } : null,
        );
      })
      .finally(() => {
        if (active) {
          inFlight.current = false;
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [service, revision]);
  function retry() {
    if (inFlight.current) return;
    inFlight.current = true;
    setLoading(true);
    setError(null);
    setRevision((value) => value + 1);
  }
  return <Context.Provider value={{ data, loading, error, retry }}>{children}</Context.Provider>;
}
export function useInvestments() {
  const context = useContext(Context);
  if (!context) throw new Error("InvestmentProvider required");
  return context;
}
