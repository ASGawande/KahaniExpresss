const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.assetExts.push('glb');

// Add 'three' to the assetExts and sourceExts
config.resolver.assetExts.push('bin');

config.resolver.sourceExts = [...config.resolver.sourceExts, 'cjs'];

module.exports = config;
