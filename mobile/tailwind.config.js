module.exports = {
  content: ["./App.tsx", "./src/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: { extend: { colors: require("./src/theme/colors.json") } },
  plugins: [],
};
