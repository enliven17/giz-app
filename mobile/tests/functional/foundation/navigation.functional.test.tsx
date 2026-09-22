import { render, screen, userEvent } from "@testing-library/react-native";
import { AppRoot } from "@/application/AppRoot";

test("opens the foundation details and returns to the demo landing screen", async () => {
  const user = userEvent.setup();
  render(<AppRoot />);
  expect(screen.getByText("Demo only — no real funds or wallet connection.")).toBeVisible();
  await user.press(screen.getByRole("button", { name: "Explore foundation" }));
  expect(await screen.findByRole("header", { name: "Built for native" })).toBeVisible();
  await user.press(screen.getByRole("button", { name: "Back to foundation" }));
  expect(await screen.findByRole("header", { name: "Nexum mobile" })).toBeVisible();
});
