import mockSafeAreaContext from "react-native-safe-area-context/jest/mock";
jest.mock("react-native-safe-area-context", () => mockSafeAreaContext);
// Native animation runtime is unavailable in Jest.
// eslint-disable-next-line @typescript-eslint/no-require-imports
jest.mock("react-native-reanimated", () => require("react-native-reanimated/mock"));
// eslint-disable-next-line @typescript-eslint/no-require-imports
jest.mock("react-native-worklets", () => require("react-native-worklets/lib/module/mock"));
jest.mock("lottie-react-native", () => ({ __esModule: true, default: "LottieView" }));
// Skia renders on the GPU, Jest only needs the component surface.
jest.mock("@shopify/react-native-skia", () => ({
  __esModule: true,
  Canvas: "SkiaCanvas",
  Fill: "SkiaFill",
  Shader: "SkiaShader",
  Points: "SkiaPoints",
  Skia: { RuntimeEffect: { Make: () => ({}) } },
  useClock: () => ({ value: 0 }),
  vec: (x: number, y: number) => ({ x, y }),
}));
beforeEach(() => jest.clearAllMocks());
