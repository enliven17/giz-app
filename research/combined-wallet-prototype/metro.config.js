const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const fs = require('fs');
const path = require('path');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const sharedModules = fs.realpathSync(path.join(__dirname, 'node_modules'));
const config = {
  watchFolders: [sharedModules],
  resolver: {nodeModulesPaths: [sharedModules]},
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
