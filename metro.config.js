// metro.config.js - Simplified for Android 15 compatibility
const { getDefaultConfig } = require("@expo/metro-config");

const config = getDefaultConfig(__dirname);

// Basic optimizations for Android 15
config.resolver.platforms = ['ios', 'android', 'native', 'web'];
// Ensure Metro resolves TypeScript files — some packages (expo) use .ts entrypoints
config.resolver.sourceExts = config.resolver.sourceExts || [];
config.resolver.sourceExts = Array.from(new Set([...config.resolver.sourceExts, 'ts', 'tsx', 'cjs']));

// Map missing package imports to compatibility paths
// Note: react-native-reanimated v4+ handles worklets internally, no manual mapping needed

// Asset optimization
config.resolver.assetExts.push('bin', 'txt', 'jpg', 'png', 'json');

module.exports = config;
