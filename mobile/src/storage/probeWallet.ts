import * as SecureStore from "expo-secure-store";
import { parseProbeWallet, type ProbeWallet } from "@/domain/probeWallet";

export interface ProbeWalletStorage {
  read(): Promise<ProbeWallet | null>;
  write(wallet: ProbeWallet): Promise<void>;
  remove(): Promise<void>;
}
const key = "gizu.mera.probe.metadata.v1";
export const probeWalletStorage: ProbeWalletStorage = {
  async read() {
    const raw = await SecureStore.getItemAsync(key);
    return raw === null ? null : parseProbeWallet(JSON.parse(raw));
  },
  async write(wallet) {
    await SecureStore.setItemAsync(key, JSON.stringify(parseProbeWallet(wallet)), {
      keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
  },
  async remove() {
    await SecureStore.deleteItemAsync(key);
  },
};
