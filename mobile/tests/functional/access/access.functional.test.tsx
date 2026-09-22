import { act, screen, userEvent } from "@testing-library/react-native";
import { Linking } from "react-native";
import { AccessRejectedError, type DemoSession, walletProviders } from "@/services/access";
import { deferred, renderApp } from "../../support/renderApp";

beforeEach(() => jest.spyOn(Linking, "getInitialURL").mockResolvedValue(null));
afterEach(() => jest.restoreAllMocks());
async function openAccess() {
  await userEvent.press(await screen.findByRole("button", { name: "Get started" }));
}
async function signIn() {
  await openAccess();
  await userEvent.press(screen.getByRole("button", { name: "Continue with passkey" }));
  expect(await screen.findByRole("header", { name: "Your portfolio" })).toBeVisible();
}
test("welcome, access, all tabs, UI preview and disconnect form a complete demo journey", async () => {
  renderApp();
  await signIn();
  for (const name of ["Vaults", "Exchange", "Settings"]) {
    await userEvent.press(screen.getByLabelText(`${name} tab`));
  }
  expect(screen.getByText("Access method: Passkey")).toBeVisible();
  await userEvent.press(screen.getByRole("button", { name: "Open UI preview" }));
  expect(await screen.findByRole("header", { name: "UI preview" })).toBeVisible();
  expect(screen.getByRole("button", { name: "Loading action" })).toBeDisabled();
  await userEvent.press(screen.getByRole("button", { name: "Back" }));
  await userEvent.press(await screen.findByRole("button", { name: "Disconnect" }));
  expect(await screen.findByRole("button", { name: "Get started" })).toBeVisible();
  expect(screen.queryByLabelText("Settings tab")).toBeNull();
  await userEvent.press(screen.getByRole("button", { name: "I have access" }));
  await userEvent.press(screen.getByRole("button", { name: "Back" }));
  expect(await screen.findByRole("button", { name: "Get started" })).toBeVisible();
});
test.each(walletProviders)("selects %s as a simulated provider", async (method) => {
  const request = jest.fn().mockResolvedValue({ kind: "demo", method });
  renderApp({ request });
  await openAccess();
  await userEvent.press(screen.getByRole("button", { name: "Choose wallet" }));
  await userEvent.press(await screen.findByRole("button", { name: method }));
  expect(await screen.findByRole("header", { name: "Your portfolio" })).toBeVisible();
  expect(request).toHaveBeenCalledWith(method);
});
test.each([new Error("offline"), new AccessRejectedError("rejected")])(
  "recovers from access failure %s",
  async (cause) => {
    const request = jest
      .fn()
      .mockRejectedValueOnce(cause)
      .mockResolvedValue({ kind: "demo", method: "Demo passkey" });
    renderApp({ request });
    await openAccess();
    await userEvent.press(screen.getByRole("button", { name: "Continue with passkey" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      cause instanceof AccessRejectedError
        ? "Access was rejected. You can try again."
        : "Access failed. Please try again.",
    );
    await userEvent.press(screen.getByRole("button", { name: "Continue with passkey" }));
    expect(await screen.findByRole("header", { name: "Your portfolio" })).toBeVisible();
  },
);
test("prevents duplicate requests and ignores a late success after cancellation", async () => {
  const pending = deferred<DemoSession>();
  const request = jest.fn().mockReturnValue(pending.promise);
  renderApp({ request });
  await openAccess();
  await userEvent.press(screen.getByRole("button", { name: "Continue with passkey" }));
  const loading = screen.getByRole("button", { name: "Opening access" });
  expect(loading).toBeDisabled();
  await userEvent.press(loading);
  expect(request).toHaveBeenCalledTimes(1);
  await userEvent.press(screen.getByRole("button", { name: "Cancel access" }));
  await act(async () => pending.resolve({ kind: "demo", method: "Demo passkey" }));
  expect(screen.getByRole("button", { name: "Continue with passkey" })).toBeVisible();
  expect(screen.queryByRole("header", { name: "Your portfolio" })).toBeNull();
});
test("dismissing a pending wallet selection cannot later sign in", async () => {
  const pending = deferred<DemoSession>();
  renderApp({ request: () => pending.promise });
  await openAccess();
  await userEvent.press(screen.getByRole("button", { name: "Choose wallet" }));
  await userEvent.press(await screen.findByRole("button", { name: "MetaMask" }));
  expect(screen.getByText("Opening access…")).toBeVisible();
  await userEvent.press(screen.getByRole("button", { name: "Cancel wallet selection" }));
  await act(async () => pending.resolve({ kind: "demo", method: "MetaMask" }));
  expect(await screen.findByRole("button", { name: "Continue with passkey" })).toBeVisible();
});
test.each(["home", "vaults", "exchange", "settings", "garbage?token=ignored"])(
  "signed-out deep link %s never exposes tabs",
  async (path) => {
    jest.mocked(Linking.getInitialURL).mockResolvedValue(`gizu-dev://${path}`);
    renderApp();
    expect(await screen.findByRole("button", { name: "Get started" })).toBeVisible();
    expect(screen.queryByRole("header", { name: "Your portfolio" })).toBeNull();
    expect(screen.queryByLabelText("Settings tab")).toBeNull();
  },
);

test("an access deep link still has a safe way back to welcome", async () => {
  jest.mocked(Linking.getInitialURL).mockResolvedValue("gizu-dev://access");
  renderApp();
  await userEvent.press(await screen.findByRole("button", { name: "Back" }));
  expect(await screen.findByRole("button", { name: "Get started" })).toBeVisible();
});

test("leaving access invalidates pending work even when the service rejects later", async () => {
  const pending = deferred<DemoSession>();
  renderApp({ request: () => pending.promise });
  await openAccess();
  await userEvent.press(screen.getByRole("button", { name: "Continue with passkey" }));
  await userEvent.press(screen.getByRole("button", { name: "Back" }));
  await act(async () => pending.reject(new Error("late failure")));
  expect(await screen.findByRole("button", { name: "Get started" })).toBeVisible();
  expect(screen.queryByRole("alert")).toBeNull();
});

test("wallet rejection can be retried or dismissed", async () => {
  const request = jest
    .fn()
    .mockRejectedValueOnce(new AccessRejectedError())
    .mockResolvedValue({ kind: "demo", method: "Rainbow" });
  renderApp({ request });
  await openAccess();
  await userEvent.press(screen.getByRole("button", { name: "Choose wallet" }));
  await userEvent.press(await screen.findByRole("button", { name: "Rainbow" }));
  expect(await screen.findByRole("alert")).toBeVisible();
  await userEvent.press(screen.getByRole("button", { name: "Rainbow" }));
  expect(await screen.findByRole("header", { name: "Your portfolio" })).toBeVisible();
});

test("runtime links are gated before access and work only inside a demo session", async () => {
  const subscribe = jest.spyOn(Linking, "addEventListener");
  renderApp();
  await screen.findByRole("button", { name: "Get started" });
  async function send(url: string) {
    const listener = subscribe.mock.calls.filter(([type]) => type === "url").at(-1)?.[1];
    if (!listener) throw new Error("URL subscription missing");
    await act(async () => listener({ url }));
  }
  await send("gizu-dev://settings");
  expect(screen.queryByLabelText("Settings tab")).toBeNull();
  await signIn();
  await send("gizu-dev://settings");
  expect(await screen.findByRole("header", { name: "Account" })).toBeVisible();
  await userEvent.press(screen.getByRole("button", { name: "Disconnect" }));
  await screen.findByRole("button", { name: "Get started" });
  await send("gizu-dev://exchange");
  expect(screen.queryByLabelText("Exchange tab")).toBeNull();
});

test("UI preview demonstrates action, filter and feedback states without changing the account", async () => {
  renderApp();
  await signIn();
  await userEvent.press(screen.getByLabelText("Settings tab"));
  await userEvent.press(screen.getByRole("button", { name: "Open UI preview" }));
  for (const name of [
    "Primary example",
    "Secondary example",
    "Quiet example",
    "Destructive example",
  ]) {
    await userEvent.press(await screen.findByRole("button", { name }));
  }
  expect(screen.getByText("Destructive style previewed. Nothing was deleted.")).toBeVisible();
  await userEvent.press(screen.getByRole("radio", { name: "Example risk filter" }));
  expect(screen.getByRole("radio", { name: "Example risk filter" })).toBeChecked();
  await userEvent.press(screen.getByRole("button", { name: "Refresh data" }));
  expect(screen.getByText("Refresh previewed.")).toBeVisible();
  await userEvent.press(screen.getByRole("button", { name: "Retry data" }));
  expect(screen.getByText("Retry previewed.")).toBeVisible();
  await userEvent.press(screen.getByRole("button", { name: "View Helix Alpha" }));
  expect(screen.getByText("Vault card previewed.")).toBeVisible();
  await userEvent.press(screen.getByRole("button", { name: "Back" }));
  expect(await screen.findByRole("button", { name: "Disconnect" })).toBeVisible();
});

test("new account actions remain unavailable and the selected capsule tab is accessible", async () => {
  renderApp();
  await signIn();
  expect(screen.getByRole("button", { name: "Home tab", selected: true })).toBeVisible();
  expect(screen.getByRole("button", { name: "Deposit" })).toBeDisabled();
  expect(screen.getByRole("button", { name: "Withdraw" })).toBeDisabled();
  expect(screen.getByRole("button", { name: "Notifications — unavailable" })).toBeDisabled();
  expect(screen.queryByText(/Demo mode|No real funds/)).toBeNull();
  await userEvent.press(screen.getByLabelText("Settings tab"));
  expect(screen.getByRole("button", { name: "Settings tab", selected: true })).toBeVisible();
  for (const name of [
    "Passkey wallet",
    "Transaction signing",
    "Push alerts",
    "Currency",
    "Statements",
    "Contact desk",
    "Terms and disclosures",
  ]) {
    const row = screen.getByRole("button", { name });
    expect(row).toBeDisabled();
    await userEvent.press(row);
    expect(screen.getByRole("header", { name: "Account" })).toBeVisible();
  }
  await userEvent.press(screen.getByRole("button", { name: "Disconnect" }));
  expect(await screen.findByRole("button", { name: "Get started" })).toBeVisible();
});
