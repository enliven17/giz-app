import AsyncStorage from "@react-native-async-storage/async-storage";
import { normalizePreferences, type Preferences } from "@/domain/preferences";
export interface PreferencesStore {
  load(accountId: string): Promise<Preferences>;
  save(accountId: string, value: Preferences): Promise<void>;
  clear(accountId: string): Promise<void>;
}
type Storage = Pick<typeof AsyncStorage, "getItem" | "setItem" | "removeItem">;
export function createPreferencesStore(storage: Storage = AsyncStorage): PreferencesStore {
  const key = (id: string) => `gizu:preferences:v1:${encodeURIComponent(id)}`;
  return {
    async load(id) {
      const raw = await storage.getItem(key(id));
      let parsed: unknown;
      try {
        parsed = raw === null ? null : JSON.parse(raw);
      } catch {
        parsed = null;
      }
      return normalizePreferences(parsed);
    },
    async save(id, value) {
      await storage.setItem(key(id), JSON.stringify(normalizePreferences(value)));
    },
    async clear(id) {
      await storage.removeItem(key(id));
    },
  };
}
export const preferencesStore = createPreferencesStore();
