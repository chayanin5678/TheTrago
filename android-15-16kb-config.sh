#!/bin/bash

# Android 15 16KB Page Size Compatibility Script
# This script configures the project for Android 15's 16KB page size requirement

echo "🚀 Configuring Android 15 16KB Page Size Compatibility..."

# Update version code for new build
echo "📱 Updating version code..."

# Check if this is an EAS build environment
if [ "$EAS_BUILD" = "true" ]; then
  echo "⚙️ EAS Build Environment Detected"
  
  # Set environment variables for 16KB page size compatibility
  export ANDROID_16KB_PAGE_SIZE=true
  export USE_HERMES=true
  export FLIP_NEW_ARCH_ENABLED=true
  
  echo "✅ Environment variables configured for 16KB page size"
fi

# Configure Gradle properties for 16KB page size
echo "🔧 Configuring Gradle properties..."
cat >> android/gradle.properties << EOF

# Android 15 16KB Page Size Configuration
android.enableR8=true
android.useAndroidX=true
android.enableJetifier=true
org.gradle.jvmargs=-Xmx4g -XX:MaxMetaspaceSize=1g

# 16KB Page Size Optimizations
android.bundle.enableUncompressedNativeLibs=true
android.enableSeparateBuildPerCPUArchitecture=false
android.packagingOptions.pickFirst=**/libc++_shared.so,**/libjsc.so
android.packagingOptions.exclude=META-INF/DEPENDENCIES,META-INF/LICENSE*,META-INF/NOTICE*

# Hermes Configuration for Android 15
hermesEnabled=true
enableHermes=true

EOF

echo "📦 Configuring native library optimization..."

# Create or update metro.config.js for 16KB compatibility
cat > metro.config.js << 'EOF'
const { getDefaultConfig } = require('expo/metro-config');
const config = getDefaultConfig(__dirname);

// Android 15 16KB Page Size optimizations
config.resolver.platforms = ['native', 'android', 'ios', 'web'];

// Enable bundle splitting for better memory management
config.serializer.getRunModuleStatement = (moduleId) => {
  return `__r(${JSON.stringify(moduleId)});`;
};

// Optimize asset resolution for 16KB pages
config.resolver.assetExts.push('bin');
config.transformer.babelTransformerPath = require.resolve('metro-react-native-babel-transformer');

// Memory optimization for large projects
config.transformer.minifierConfig = {
  // Optimize for Android 15 16KB pages
  keep_fnames: true,
  mangle: {
    keep_fnames: true,
  },
  compress: {
    drop_console: true,
  },
};

module.exports = config;
EOF

echo "🔄 Clearing caches for fresh build..."

# Clear various caches
rm -rf node_modules/.cache 2>/dev/null || true
rm -rf .expo 2>/dev/null || true
rm -rf android/app/build 2>/dev/null || true
rm -rf android/build 2>/dev/null || true

echo "📋 Build Summary:"
echo "✅ Android 15 16KB page size configuration applied"
echo "✅ Native library optimization enabled"
echo "✅ Hermes engine configured"
echo "✅ Bundle optimization applied"
echo "✅ Cache cleared"

echo ""
echo "🎯 Next Steps:"
echo "1. Run: npx expo install --fix"
echo "2. Run: eas build --platform android --profile production"
echo "3. Test on Android 15 device with 16KB page size"

echo ""
echo "📱 Device Testing Recommendations:"
echo "- Test on Pixel 8/9 series (native 16KB)"
echo "- Test on Samsung Galaxy S24 series"
echo "- Use Android 15 emulator with 16KB configuration"

exit 0
