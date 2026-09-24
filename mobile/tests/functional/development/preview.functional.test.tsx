import { render, screen, userEvent } from "@testing-library/react-native";
import { PreviewDebugApp } from "@/development/PreviewDebugApp";
test("UI preview demonstrates action, filter and feedback states without changing the account", async () => {
  render(<PreviewDebugApp />);
  expect(await screen.findByLabelText("Animated Gizu glitch wordmark")).toBeVisible();
  expect(screen.getByLabelText("Animated smooth Gizu glitch wordmark")).toBeVisible();
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
  expect(screen.queryByRole("button", { name: "Disconnect" })).toBeNull();
});
