# Android 15 & 16KB Page Size Migration Guide

## Overview
แอป TheTrago ได้รับการปรับปรุงให้รองรับ Android 15 และ 16KB page size requirements โดยมีการเปลี่ยนแปลงที่สำคัญดังนี้:

## ✅ Completed Implementations

### 1. Android 15 Edge-to-Edge Support
- **SafeAreaInsets**: ใช้ `useSafeAreaInsets` ใน 14+ screens
- **StatusBar**: ตั้งค่า `translucent={true}` และ `backgroundColor="transparent"`
- **SafeAreaProvider**: wrap App.js with SafeAreaProvider
- **Conditional Padding**: ใช้ insets.top และ insets.bottom สำหรับ Android 15+

### 2. Android 16 Adaptive Layouts
- **AdaptiveLayoutsManager**: สร้าง utility class สำหรับจัดการ responsive design
- **Orientation Support**: รองรับทุก orientation (landscape/portrait)
- **Large Screen Support**: รองรับหน้าจอขนาด ≥600dp
- **Flexible Layouts**: ใช้ flexDirection และ responsive design patterns

### 3. 16KB Page Size Optimization
- **Gradle Configuration**: อัปเดต gradle.properties สำหรับ 16KB page size
- **Native Libraries**: ปรับแต่ง packagingOptions สำหรับ native libraries
- **Memory Management**: เพิ่ม JVM heap size และ garbage collection
- **Bundle Optimization**: ใช้ R8 และ Hermes engine

## 🔧 Configuration Files Updated

### app.json
```json
{
  "expo": {
    "android": {
      "compileSdkVersion": 35,
      "targetSdkVersion": 35,
      "minSdkVersion": 24
    }
  }
}
```

### gradle.properties
```properties
# Android 15 16KB Page Size Compatibility
android.bundle.enableUncompressedNativeLibs=true
android.packagingOptions.pickFirst=**/libc++_shared.so,**/libjsc.so
android.enableR8=true
org.gradle.jvmargs=-Xmx6g -XX:MaxMetaspaceSize=1g
```

### metro.config.js
```javascript
// Memory-efficient transformer config
config.transformer.minifierConfig = {
  keep_fnames: false,
  mangle: { keep_fnames: false },
  compress: { drop_console: true }
};
```

## 📱 Screen Updates

### Major Screens Updated:
1. **SearchFerry.js** - ใช้ AdaptiveLayoutsManager และ useSafeAreaInsets
2. **TripDetail.js** - Android 15 edge-to-edge support
3. **HomeScreen.js** - SafeAreaInsets implementation
4. **App.js** - SafeAreaProvider wrapper

### Import Path Changes:
```javascript
// Old
import { AuthProvider } from './AuthContext';
import HomeScreen from './HomeScreen';

// New  
import { AuthProvider } from './src/contexts/AuthContext';
import HomeScreen from './src/screens/HomeScreen';
```

## 🚀 Build Process

### Development Build
```bash
npm run start              # Start expo dev server
npm run android           # Run on Android device
```

### Production Build
```bash
npm run build:android-16kb    # Build with 16KB support
eas build --platform android --profile production
```

### Build Scripts
- `scripts/build-android-15-16kb.bat` - Windows build script
- `scripts/android-15-16kb-config.sh` - Linux/macOS config script

## 🧪 Testing Recommendations

### Devices to Test:
- **Pixel 8/9 series** - Native 16KB page size
- **Samsung Galaxy S24 series** - Android 15 with 16KB support
- **Android 15 emulator** - với 16KB configuration

### Test Cases:
1. **Edge-to-Edge Display** - ตรวจสอบ StatusBar และ SafeArea
2. **Orientation Changes** - ทดสอบ landscape/portrait rotation
3. **Large Screen Support** - ทดสอบบน tablet และหน้าจอใหญ่
4. **Memory Performance** - ตรวจสอบ memory usage บน 16KB devices

## 🔍 Troubleshooting

### Common Issues:

#### 1. Build Failures
```bash
# Clear caches
npm run clean:all
npx expo prebuild --clean --platform android
```

#### 2. Native Library Issues
```bash
# Check gradle.properties
android.packagingOptions.pickFirst=**/libc++_shared.so,**/libjsc.so
```

#### 3. Memory Issues
```bash
# Increase heap size
org.gradle.jvmargs=-Xmx6g -XX:MaxMetaspaceSize=1g
```

## 📋 Checklist

### Before Release:
- [ ] ทดสอบบน Android 15 device
- [ ] ตรวจสอบ 16KB page size compatibility
- [ ] ทดสอบทุก orientation
- [ ] ตรวจสอบ SafeAreaInsets ทุกหน้าจอ
- [ ] ทดสอบบน large screen devices
- [ ] ตรวจสอบ memory performance
- [ ] Test build บน EAS Build

### Performance Metrics:
- App startup time < 3 seconds
- Memory usage < 200MB on 16KB devices
- Smooth transitions between screens
- No memory leaks during navigation

## 📞 Support
สำหรับปัญหาและคำถาม กรุณาติดต่อ:
- Developer: chayanin5678
- GitHub: https://github.com/chayanin5678/TheTrago
