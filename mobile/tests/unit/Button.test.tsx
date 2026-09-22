import { render, screen, userEvent } from "@testing-library/react-native";
import { Button } from "@/components/atoms/Button";

test("a disabled action cannot be submitted", async () => {
  const onPress = jest.fn();
  render(<Button label="Continue" disabled onPress={onPress} />);
  const button = screen.getByRole("button", { name: "Continue" });
  expect(button).toBeDisabled();
  await userEvent.press(button);
  expect(onPress).not.toHaveBeenCalled();
});
