import mockSafeAreaContext from "react-native-safe-area-context/jest/mock";
jest.mock("react-native-safe-area-context", () => mockSafeAreaContext);
// Native animation runtime is unavailable in Jest.
// eslint-disable-next-line @typescript-eslint/no-require-imports
jest.mock("react-native-reanimated", () => require("react-native-reanimated/mock"));
beforeEach(() => jest.clearAllMocks());
