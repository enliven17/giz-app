export interface Cache {
  get<T>(key: string): Promise<T | null>;
  set(key: string, value: unknown): Promise<void>;
  deleteExpired(): Promise<number>;
}
