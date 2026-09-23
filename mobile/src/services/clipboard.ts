import * as Clipboard from "expo-clipboard";
export interface ClipboardService {
  copy(text: string): Promise<void>;
}
export const clipboardService: ClipboardService = {
  async copy(text) {
    if (!(await Clipboard.setStringAsync(text))) throw new Error("Clipboard unavailable");
  },
};
