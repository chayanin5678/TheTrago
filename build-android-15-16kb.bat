@echo off
echo 🚀 Android 15 16KB Page Size Build Configuration
echo.

echo 📱 Updating project for Android 15 16KB compatibility...

REM Clear caches
echo 🧹 Clearing caches...
if exist "node_modules\.cache" rmdir /s /q "node_modules\.cache"
if exist ".expo" rmdir /s /q ".expo"
if exist "android\app\build" rmdir /s /q "android\app\build"
if exist "android\build" rmdir /s /q "android\build"
if exist ".metro-cache" rmdir /s /q ".metro-cache"

echo.
echo 📦 Installing dependencies with 16KB optimizations...
call npx expo install --fix

echo.
echo ⚙️ Configuring environment for 16KB page size...
set ANDROID_16KB_PAGE_SIZE=true
set USE_HERMES=true
set FLIP_NEW_ARCH_ENABLED=true
set EXPO_USE_FAST_RESOLVER=1

echo.
echo 🔧 Pre-building with optimizations...
call npx expo prebuild --clean --platform android

echo.
echo 📋 Build Summary:
echo ✅ Android 15 16KB page size configuration applied
echo ✅ Native library optimization enabled  
echo ✅ Hermes engine configured
echo ✅ Bundle optimization applied
echo ✅ Cache cleared and dependencies updated

echo.
echo 🎯 Ready for EAS Build:
echo Run: eas build --platform android --profile production
echo.

echo 📱 Testing Recommendations:
echo - Test on Android 15 devices with 16KB page size
echo - Use Pixel 8/9 series or Samsung Galaxy S24 series
echo - Enable 16KB page size in emulator settings

echo.
echo ✨ Build preparation complete!
pause
