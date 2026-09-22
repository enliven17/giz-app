import { render, screen, userEvent } from "@testing-library/react-native";
import { Text } from "react-native";
import { ErrorBoundary } from "@/application/ErrorBoundary";

test("shows a safe fallback and lets the user recover", async () => {
  const errorLog = jest.spyOn(console, "error").mockImplementation(() => {});
  let shouldFail = true;
  function Child() {
    if (shouldFail) throw new Error("test failure");
    return <Text>Recovered</Text>;
  }
  try {
    render(
      <ErrorBoundary>
        <Child />
      </ErrorBoundary>,
    );
    expect(screen.getByRole("alert")).toHaveTextContent("Something went wrong. Please try again.");
    shouldFail = false;
    await userEvent.press(screen.getByRole("button", { name: "Try again" }));
    expect(screen.getByText("Recovered")).toBeVisible();
  } finally {
    errorLog.mockRestore();
  }
});
