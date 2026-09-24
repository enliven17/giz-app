import { createContext, useContext, useState, type PropsWithChildren } from "react";
import { demoAccessService, type AccessService, type AppSession } from "@/services/access";
const SessionContext = createContext<{
  session: AppSession | null;
  signIn: (session: AppSession) => void;
  disconnect: () => void;
  accessService: AccessService;
} | null>(null);
export function SessionProvider({
  children,
  accessService = demoAccessService,
}: PropsWithChildren<{ accessService?: AccessService }>) {
  const [session, setSession] = useState<AppSession | null>(null);
  return (
    <SessionContext.Provider
      value={{
        session,
        signIn: setSession,
        disconnect: () => {
          accessService.cancel?.();
          setSession(null);
        },
        accessService,
      }}
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
