export type AccountPage =
  | "passkey-wallet"
  | "transaction-signing"
  | "alerts"
  | "currency"
  | "statements"
  | "contact-desk"
  | "terms";
type InformationPage = {
  title: string;
  body: string;
  rows: { label: string; value: string }[];
  actions?: string[];
};
export const informationPages: Partial<Record<AccountPage, InformationPage>> = {
  "passkey-wallet": {
    title: "Passkey wallet",
    body: "Passkey registration is not connected yet. No credential or recovery method has been created by this app.",
    rows: [
      { label: "Access method", value: "Passkey" },
      { label: "Credential", value: "Not connected" },
      { label: "Backup passkey", value: "Unavailable" },
      { label: "Guardian address", value: "Unavailable" },
    ],
    actions: ["Add backup passkey"],
  },
  "transaction-signing": {
    title: "Transaction signing",
    body: "Every order requires an explicit review and confirmation in the app. Device authentication and cryptographic signing are not connected yet. No biometric policy or spending cap is enforced.",
    rows: [
      { label: "Confirmation", value: "Every order" },
      { label: "Biometric verification", value: "Unavailable" },
      { label: "Daily cap", value: "Not configured" },
      { label: "Per order cap", value: "Not configured" },
      { label: "Cooldown", value: "Not configured" },
    ],
    actions: ["Change signing policy"],
  },
  "contact-desk": {
    title: "Contact desk",
    body: "Support channels are not connected yet. Messages and callback requests cannot be sent. Contact details and response hours will appear here once confirmed.",
    rows: [
      { label: "Secure message", value: "Unavailable" },
      { label: "Voice callback", value: "Unavailable" },
      { label: "Email", value: "Not configured" },
    ],
    actions: ["Start secure message", "Book callback"],
  },
  terms: {
    title: "Terms and disclosures",
    body: "Capital is at risk. Past performance does not indicate future results. Vaults may have lockups, fees and restricted redemption windows. Read the applicable documents before investing. Published legal documents are not available in this app yet.",
    rows: [],
    actions: ["Member agreement", "Risk disclosure", "Privacy policy", "Fee schedule"],
  },
};
