const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname, {
  // Enable CSS support
  isCSSEnabled: true,
});

// Force React Native to use the older architecture
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Add React Native compatibility resolver
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

// Fix for React Native 0.73.x compatibility issues
config.transformer.minifierConfig = {
  keep_fnames: true,
  mangle: {
    keep_fnames: true,
  },
};

module.exports = config;
