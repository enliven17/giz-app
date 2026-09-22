import { createContext, useContext, useState, type PropsWithChildren } from "react";
import { demoAccessService, type AccessService, type DemoSession } from "@/services/access";
const SessionContext = createContext<{
  session: DemoSession | null;
  signIn: (session: DemoSession) => void;
  disconnect: () => void;
  accessService: AccessService;
} | null>(null);
export function SessionProvider({
  children,
  accessService = demoAccessService,
}: PropsWithChildren<{ accessService?: AccessService }>) {
  const [session, setSession] = useState<DemoSession | null>(null);
  return (
    <SessionContext.Provider
      value={{ session, signIn: setSession, disconnect: () => setSession(null), accessService }}
    >
      {children}
    </SessionContext.Provider>
  );
}
export function useSession() {
  const context = useContext(SessionContext);
  if (!context) throw new Error("SessionProvider is required");
  return context;
}
