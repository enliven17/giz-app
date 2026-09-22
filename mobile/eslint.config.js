const { defineConfig } = require("eslint/config");
const expo = require("eslint-config-expo/flat");
module.exports = defineConfig([
  expo,
  { files: ["scripts/*.cjs"], languageOptions: { globals: { __dirname: "readonly" } } },
  { ignores: ["coverage/**", "dist/**", "ios/**", "android/**", ".expo/**"] },
  {
    files: ["src/components/atoms/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            "@/features/*",
            "@/navigation/*",
            "@/services/*",
            "@/components/molecules/*",
            "@/components/organisms/*",
          ],
        },
      ],
    },
  },
]);
