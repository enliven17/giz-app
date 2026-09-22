import type { ExpoConfig } from "expo/config";

// Release identity and real services must be selected before shipping this demo.
if (process.env.EAS_BUILD_PROFILE === "production") {
  throw new Error(
    "Production builds are blocked until release identity and services are configured.",
  );
}

const config: ExpoConfig = {
  name: "Nexum Dev",
  slug: "nexum-mobile",
  version: "0.1.0",
  scheme: "nexum-dev",
  userInterfaceStyle: "dark",
  ios: { bundleIdentifier: "com.example.nexum.dev", supportsTablet: false },
  android: { package: "com.example.nexum.dev" },
  plugins: [["expo-splash-screen", { backgroundColor: "#050706" }]],
};
export default config;
