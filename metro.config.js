// metro.config.js - Simplified for Android 15 compatibility
const { getDefaultConfig } = require("@expo/metro-config");

const config = getDefaultConfig(__dirname);

// Basic optimizations for Android 15
config.resolver.platforms = ['ios', 'android', 'native', 'web'];
config.resolver.sourceExts.push('cjs');

// Asset optimization
config.resolver.assetExts.push('bin', 'txt', 'jpg', 'png', 'json');

module.exports = config;
