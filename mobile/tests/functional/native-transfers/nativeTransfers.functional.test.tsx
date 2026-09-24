import { act, fireEvent, render, screen, userEvent } from "@testing-library/react-native";
import { NativeTransferScreen } from "@/features/native-transfers/NativeTransferScreen";
import { deferred } from "../../support/renderApp";

const hash = "0x" + "a".repeat(64);
const recipient = "0x" + "1".repeat(40);
function service() {
  return {
    executeOperation: jest
      .fn()
      .mockResolvedValue(JSON.stringify([{ transactionHash: hash, status: "pending" }])),
    getOperationStatus: jest
      .fn()
      .mockResolvedValue(JSON.stringify([{ transactionHash: hash, status: "finalized" }])),
    cancelOperation: jest.fn(),
  };
}
test("validates the proposal, delegates approval to native and reconciles public status", async () => {
  const native = service();
  render(<NativeTransferScreen service={native} onBack={jest.fn()} />);
  await userEvent.press(screen.getByRole("button", { name: "Review native transfer" }));
  expect(native.executeOperation).not.toHaveBeenCalled();
  expect(screen.getByText(/Enter account 0–15/)).toBeVisible();
  fireEvent.changeText(screen.getByLabelText("Recipient address"), recipient);
  await userEvent.press(screen.getByRole("button", { name: "Review native transfer" }));
  expect(native.executeOperation).toHaveBeenCalledWith(
    JSON.stringify({
      kind: "nativeTransfers",
      chainId: 10143,
      transfers: [{ accountIndex: 0, to: recipient, valueWei: "1000000000000000" }],
    }),
  );
  expect(await screen.findByText("pending: " + hash)).toBeVisible();
  await userEvent.press(screen.getByRole("button", { name: "Refresh native status" }));
  expect(await screen.findByText("finalized: " + hash)).toBeVisible();
});
test("prevents concurrent requests and cancels on leaving the screen", async () => {
  const pending = deferred<string>();
  const native = service();
  native.executeOperation.mockImplementation(() => pending.promise);
  const view = render(<NativeTransferScreen service={native} onBack={jest.fn()} />);
  fireEvent.changeText(screen.getByLabelText("Recipient address"), recipient);
  await userEvent.press(screen.getByRole("button", { name: "Review native transfer" }));
  expect(screen.getByRole("button", { name: "Refresh native status" })).toBeDisabled();
  await userEvent.press(screen.getByRole("button", { name: "Review native transfer" }));
  expect(native.executeOperation).toHaveBeenCalledTimes(1);
  view.unmount();
  expect(native.cancelOperation).toHaveBeenCalledTimes(1);
  await act(async () => pending.resolve("[]"));
});
test("sanitizes native failure and allows explicit reconciliation without resubmission", async () => {
  const native = service();
  native.executeOperation.mockRejectedValue(new Error("private diagnostics"));
  render(<NativeTransferScreen service={native} onBack={jest.fn()} />);
  fireEvent.changeText(screen.getByLabelText("Recipient address"), recipient);
  await userEvent.press(screen.getByRole("button", { name: "Review native transfer" }));
  expect(await screen.findByText(/Operation stopped or unavailable/)).toBeVisible();
  expect(screen.queryByText(/private diagnostics/)).toBeNull();
  await userEvent.press(screen.getByRole("button", { name: "Refresh native status" }));
  expect(native.executeOperation).toHaveBeenCalledTimes(1);
});
test("unavailable clients cannot initiate or reconcile transfers", () => {
  render(<NativeTransferScreen service={null} onBack={jest.fn()} />);
  expect(screen.getByRole("button", { name: "Review native transfer" })).toBeDisabled();
  expect(screen.getByRole("button", { name: "Refresh native status" })).toBeDisabled();
});
