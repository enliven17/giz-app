import { createContext, type PropsWithChildren } from "react";
import { mockEarlyAccessService, type EarlyAccessService } from "@/services/earlyAccess";
export const EarlyAccessContext = createContext<EarlyAccessService>(mockEarlyAccessService);
export function EarlyAccessProvider({
  service = mockEarlyAccessService,
  children,
}: PropsWithChildren<{ service?: EarlyAccessService }>) {
  return <EarlyAccessContext.Provider value={service}>{children}</EarlyAccessContext.Provider>;
}
