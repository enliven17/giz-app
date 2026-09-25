export type WalletTransfer = {
  transactionHash: string;
  status: string;
  nonce: string;
  to?: string;
  valueWei?: string;
};
export type WalletHistory = { entries: WalletTransfer[]; blocked: boolean };
export interface WalletTransferService {
  history(address: string): Promise<WalletHistory>;
  send(address: string, recipient: string, amount: string): Promise<WalletHistory>;
  cancel(): void;
}
