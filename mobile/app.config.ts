import type { ExpoConfig } from "expo/config";

// Release identity and real services must be selected before shipping this demo.
if (process.env.EAS_BUILD_PROFILE === "production") {
  throw new Error(
    "Production builds are blocked until release identity and services are configured.",
  );
}

const config: ExpoConfig = {
  name: "Gizu Dev",
  slug: "gizu-mobile",
  version: "0.1.0",
  scheme: "gizu-dev",
  userInterfaceStyle: "dark",
  ios: { bundleIdentifier: "com.example.gizu.dev", supportsTablet: false },
  android: { package: "com.example.gizu.dev" },
  plugins: [["expo-splash-screen", { backgroundColor: "#050706" }]],
};
export default config;
