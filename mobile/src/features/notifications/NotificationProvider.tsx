import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type PropsWithChildren,
} from "react";
import {
  createMockNotificationService,
  type NotificationItem,
  type NotificationService,
} from "@/services/notifications";
function useNotificationController(service: NotificationService) {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const alive = useRef(true);
  const locked = useRef(true);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let active = true;
    alive.current = true;
    locked.current = true;
    Promise.resolve()
      .then(() => service.load())
      .then((next) => {
        if (active) setItems(next);
      })
      .catch(() => {
        if (active) setError("Notifications could not be loaded. Try again.");
      })
      .finally(() => {
        if (active) {
          locked.current = false;
          setLoading(false);
        }
      });
    return () => {
      active = false;
      alive.current = false;
    };
  }, [service, revision]);
  function reload() {
    if (locked.current) return;
    locked.current = true;
    setLoading(true);
    setError(null);
    setRevision((value) => value + 1);
  }
  async function mark(ids: string[], read: boolean) {
    if (locked.current || ids.length === 0) return;
    locked.current = true;
    setBusy(true);
    setError(null);
    try {
      await service.setRead(ids, read);
      if (alive.current)
        setItems((previous) =>
          previous.map((item) => (ids.includes(item.id) ? { ...item, read } : item)),
        );
    } catch {
      if (alive.current) setError("Read status was not saved. Try again.");
    } finally {
      locked.current = false;
      if (alive.current) setBusy(false);
    }
  }
  return {
    items,
    loading,
    busy,
    error,
    reload,
    mark,
    unread: items.filter((item) => !item.read).length,
  };
}
const NotificationContext = createContext<ReturnType<typeof useNotificationController> | null>(
  null,
);
export function NotificationProvider({
  children,
  service,
}: PropsWithChildren<{ service?: NotificationService }>) {
  const [adapter] = useState(() => service ?? createMockNotificationService());
  const value = useNotificationController(adapter);
  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}
export function useNotifications() {
  const value = useContext(NotificationContext);
  if (!value) throw new Error("NotificationProvider is required");
  return value;
}
