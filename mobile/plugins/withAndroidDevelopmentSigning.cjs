const { withAppBuildGradle } = require("expo/config-plugins");

// Keep the unique development certificate outside the regenerated native tree.
// Never associate the public Expo template's shared debug key with gizu.io.
module.exports = function withAndroidDevelopmentSigning(config) {
  return withAppBuildGradle(config, (mod) => {
    const original = "storeFile file('debug.keystore')";
    const replacement = "storeFile file('../../.credentials/android-debug.keystore')";
    const source = mod.modResults.contents;
    if (mod.modResults.language !== "groovy") {
      throw new Error("Android development signing requires the Groovy build template.");
    }
    if (source.includes(replacement)) return mod;
    if (source.split(original).length !== 2) {
      throw new Error("Android signing template changed; review the debug signing configuration.");
    }
    mod.modResults.contents = source.replace(original, replacement);
    return mod;
  });
};
