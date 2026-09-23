import { act, fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { AppState } from "react-native";
import { webcrypto } from "node:crypto";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { PasskeyProbeScreen } from "@/features/passkey-probe/PasskeyProbeScreen";
import { createMeraProbeService } from "@/services/meraProbe";
import { ProbeError } from "@/domain/probeWallet";
import { probeBoundaries, testProbeWallet } from "../../support/probe";
import { deferred } from "../../support/renderApp";

function show(deps = probeBoundaries()) {
  const service = createMeraProbeService(deps);
  render(
    <SafeAreaProvider>
      <PasskeyProbeScreen service={service} />
    </SafeAreaProvider>,
  );
  return deps;
}
const press = (name: string) => fireEvent.press(screen.getByRole("button", { name }));

test("creates, recovers and signs the fixed message, then forgets metadata", async () => {
  const deps = show();
  await screen.findByText("Ready for an unfunded test passkey.");
  press("Create test passkey");
  await screen.findByText(testProbeWallet.address);
  expect(screen.getByRole("button", { name: "Create test passkey" })).toBeDisabled();
  press("Recover same address");
  await screen.findByText("Same passkey recovered the same address.");
  press("Sign and verify test message");
  await screen.findByText("Test signature verified against the recovered address.");
  expect(deps.ceremonies.get).toHaveBeenCalledTimes(2);
  press("Forget local test metadata");
  await screen.findByText("Local metadata removed. The provider still holds the passkey.");
  expect(screen.queryByText(testProbeWallet.address)).toBeNull();
});

test("missing configuration visibly disables native operations without fake success", async () => {
  const deps = probeBoundaries();
  show({ ...deps, availability: () => "Blocked: missing signing identities" });
  await screen.findByText("Ready for an unfunded test passkey.");
  expect(screen.getByText("Blocked: missing signing identities")).toBeTruthy();
  expect(screen.getByRole("button", { name: "Create test passkey" })).toBeDisabled();
  expect(deps.ceremonies.create).not.toHaveBeenCalled();
});

test("offline self-check can run while passkeys are blocked and never persists a wallet", async () => {
  const original = Object.getOwnPropertyDescriptor(globalThis, "crypto");
  Object.defineProperty(globalThis, "crypto", { value: webcrypto, configurable: true });
  try {
    const deps = probeBoundaries();
    show({ ...deps, availability: () => "Blocked: missing signing identities" });
    await screen.findByText("Ready for an unfunded test passkey.");
    press("Run offline crypto self-check");
    await screen.findByText(
      "Offline crypto self-check passed. Known public test vector; no passkey used or wallet stored.",
    );
    expect(deps.ceremonies.create).not.toHaveBeenCalled();
    expect(deps.ceremonies.get).not.toHaveBeenCalled();
    expect(deps.storage.write).not.toHaveBeenCalled();
    expect(screen.queryByText(testProbeWallet.address)).toBeNull();
  } finally {
    if (original) Object.defineProperty(globalThis, "crypto", original);
    else Reflect.deleteProperty(globalThis, "crypto");
  }
});

test("cancellation and unknown failures are safe to retry without leaking native payloads", async () => {
  const deps = probeBoundaries();
  deps.ceremonies.create.mockRejectedValueOnce(new ProbeError("Passkey request cancelled."));
  deps.ceremonies.get.mockRejectedValueOnce(new Error("SECRET_NATIVE_PAYLOAD"));
  show(deps);
  await screen.findByText("Ready for an unfunded test passkey.");
  press("Create test passkey");
  await screen.findByText("Passkey request cancelled.");
  press("Open existing test passkey");
  await screen.findByText(/Probe failed/);
  expect(screen.queryByText(/SECRET_NATIVE_PAYLOAD/)).toBeNull();
  press("Open existing test passkey");
  await screen.findByText(testProbeWallet.address);
  await waitFor(() => expect(deps.ceremonies.create).toHaveBeenCalledTimes(1));
});

test("duplicate taps and a backgrounded native prompt cannot sign in with a late result", async () => {
  const deps = probeBoundaries();
  const pending = deferred<{ credentialId: string; prfOutput: Uint8Array }>();
  deps.ceremonies.create.mockReturnValueOnce(pending.promise);
  let onChange: (state: "active" | "background") => void = () => {};
  const spy = jest.spyOn(AppState, "addEventListener").mockImplementation((_event, listener) => {
    onChange = listener;
    return { remove: jest.fn() };
  });
  try {
    show(deps);
    await screen.findByText("Ready for an unfunded test passkey.");
    press("Create test passkey");
    press("Create test passkey");
    await waitFor(() => expect(deps.ceremonies.create).toHaveBeenCalledTimes(1));
    expect(screen.getByRole("button", { name: "Open existing test passkey" })).toBeDisabled();
    act(() => onChange("background"));
    const secret = new Uint8Array(32).fill(7);
    await act(async () => {
      pending.resolve({ credentialId: testProbeWallet.credentialId, prfOutput: secret });
    });
    expect(screen.queryByText(testProbeWallet.address)).toBeNull();
    expect(deps.storage.write).not.toHaveBeenCalled();
    expect(secret.every((byte) => byte === 0)).toBe(true);
    act(() => onChange("active"));
    expect(screen.getByRole("button", { name: "Open existing test passkey" })).not.toBeDisabled();
  } finally {
    spy.mockRestore();
  }
});
