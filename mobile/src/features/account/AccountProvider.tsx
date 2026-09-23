import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type PropsWithChildren,
} from "react";
import { useSession } from "@/application/SessionProvider";
import type { Preferences } from "@/domain/preferences";
import { preferencesStore, type PreferencesStore } from "@/storage/preferences";
import { clipboardService, type ClipboardService } from "@/services/clipboard";
import { profileFixture } from "@/services/fixtures/profile";

export type AccountDependencies = { store?: PreferencesStore; clipboard?: ClipboardService };
function useAccountController({
  store = preferencesStore,
  clipboard = clipboardService,
}: AccountDependencies) {
  const { session, disconnect } = useSession();
  const accountId = session?.accountId ?? profileFixture.id;
  const [preferences, setPreferences] = useState<Preferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const mounted = useRef(true);
  const locked = useRef(false);
  const version = useRef(0);
  const [loadRevision, setLoadRevision] = useState(0);
  const hydrating = useRef(true);
  useEffect(() => {
    let active = true;
    mounted.current = true;
    hydrating.current = true;
    const request = ++version.current;
    Promise.resolve()
      .then(() => store.load(accountId))
      .then((next) => {
        if (active && request === version.current) setPreferences(next);
      })
      .catch(() => {
        if (active && request === version.current)
          setError("Preferences could not be loaded. Retry to change settings.");
      })
      .finally(() => {
        if (active && request === version.current) {
          hydrating.current = false;
          setLoading(false);
        }
      });
    return () => {
      active = false;
      mounted.current = false;
    };
  }, [accountId, store, loadRevision]);
  function reload() {
    if (locked.current || hydrating.current) return;
    hydrating.current = true;
    setLoading(true);
    setError(null);
    setLoadRevision((value) => value + 1);
  }

  async function save(patch: Partial<Pick<Preferences, "alerts" | "statements">>) {
    if (locked.current || loading || !preferences) return;
    locked.current = true;
    setBusy(true);
    setError(null);
    setNotice(null);
    const next = { ...preferences, ...patch };
    try {
      await store.save(accountId, next);
      if (mounted.current) {
        setPreferences(next);
        setNotice("Preference saved on this device.");
      }
    } catch {
      if (mounted.current)
        setError("Preference was not saved. Your previous setting is unchanged. Try again.");
    } finally {
      locked.current = false;
      if (mounted.current) setBusy(false);
    }
  }
  async function disconnectAccount() {
    if (locked.current) return;
    locked.current = true;
    version.current++;
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await store.clear(accountId);
      if (mounted.current) disconnect();
    } catch {
      if (mounted.current)
        setError(
          "Local preferences could not be cleared. You are still signed in. Retry Disconnect.",
        );
    } finally {
      locked.current = false;
      if (mounted.current) {
        hydrating.current = false;
        setBusy(false);
        setLoading(false);
      }
    }
  }
  return { preferences, loading, busy, error, notice, reload, save, disconnectAccount, clipboard };
}
const AccountContext = createContext<ReturnType<typeof useAccountController> | null>(null);
export function AccountProvider({
  children,
  ...dependencies
}: PropsWithChildren<AccountDependencies>) {
  const value = useAccountController(dependencies);
  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>;
}
export function useAccount() {
  const value = useContext(AccountContext);
  if (!value) throw new Error("AccountProvider is required");
  return value;
}
