const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for additional asset extensions
config.resolver.assetExts = config.resolver.assetExts.filter(ext => ext !== 'svg'); // Ensure no duplicates
config.resolver.assetExts.push('glb', 'bin');

// Add support for additional source extensions
config.resolver.sourceExts = [...config.resolver.sourceExts, 'cjs'];

module.exports = config;
