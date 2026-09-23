import { ProbeError, type ProbeResult, type ProbeWallet } from "@/domain/probeWallet";
import type { ProbeWalletStorage } from "@/storage/probeWallet";
import { deriveProbeWallet, runProbeSelfCheck } from "./meraDerivation";

export type ProbeAction = "create" | "open" | "recover" | "sign";
export interface ProbeCeremonies {
  create(): Promise<{ credentialId: string; prfOutput: Uint8Array }>;
  get(credentialId?: string): Promise<{ credentialId: string; prfOutput: Uint8Array }>;
}
export interface MeraProbeService {
  availability(): string | null;
  read(): Promise<ProbeWallet | null>;
  run(action: ProbeAction): Promise<ProbeResult>;
  abandon(): void;
  forget(): Promise<void>;
  selfCheck(): Promise<void>;
}

export function createMeraProbeService({
  ceremonies,
  storage,
  availability,
  isActive,
  waitForForeground = async () => {},
}: {
  ceremonies: ProbeCeremonies;
  storage: ProbeWalletStorage;
  availability: () => string | null;
  isActive: () => boolean;
  waitForForeground?: () => Promise<void>;
}): MeraProbeService {
  let busy = false;
  let generation = 0;
  function requireCurrent(attempt: number) {
    if (attempt !== generation || !isActive())
      throw new ProbeError(
        "Probe abandoned. Return to the app and retry after the current system prompt closes.",
      );
  }
  return {
    availability,
    read: () => storage.read(),
    abandon() {
      generation++;
    },
    async selfCheck() {
      if (busy) throw new ProbeError("A passkey request is already in progress.");
      busy = true;
      try {
        await runProbeSelfCheck();
      } finally {
        busy = false;
      }
    },
    async forget() {
      if (busy)
        throw new ProbeError("Wait for the system request to finish before forgetting metadata.");
      busy = true;
      generation++;
      try {
        await storage.remove();
      } finally {
        busy = false;
      }
    },
    async run(action) {
      if (busy) throw new ProbeError("A passkey request is already in progress.");
      const blocked = availability();
      if (blocked) throw new ProbeError(blocked);
      busy = true;
      const attempt = ++generation;
      let result: Awaited<ReturnType<ProbeCeremonies["get"]>> | undefined;
      try {
        const stored = await storage.read();
        requireCurrent(attempt);
        if ((action === "create" || action === "open") && stored)
          throw new ProbeError("Forget local test metadata before selecting a different wallet.");
        if ((action === "recover" || action === "sign") && !stored)
          throw new ProbeError("Create or open a test passkey first.");
        result =
          action === "create"
            ? await ceremonies.create()
            : await ceremonies.get(stored?.credentialId);
        await waitForForeground();
        requireCurrent(attempt);
        const derived = await deriveProbeWallet(
          result.prfOutput,
          result.credentialId,
          stored ?? undefined,
          action === "sign",
        );
        requireCurrent(attempt);
        // The session is already ended before storage or UI work begins.
        await storage.write(derived.wallet);
        requireCurrent(attempt);
        return { ...derived, recovered: stored !== null };
      } finally {
        result?.prfOutput.fill(0);
        busy = false;
      }
    },
  };
}
