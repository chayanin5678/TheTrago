# แก้ไขปัญหา Android Build Error

## ปัญหาที่พบ
```
Could not find method compile() for arguments [com.facebook.react:react-native:+] on object of type org.gradle.api.internal.artifacts.dsl.dependencies.DefaultDependencyHandler.
```

## สาเหตุ
Package `react-native-omise` เวอร์ชัน 0.0.2 ใช้ Gradle syntax เก่าที่ไม่รองรับใน Gradle รุ่นใหม่:
- `compile` ถูกเปลี่ยนเป็น `implementation`
- `compileSdkVersion` และ `targetSdkVersion` ต้องอัปเดต

## วิธีแก้ไข

### ขั้นตอนที่ 1: สร้าง Patch File
ไฟล์ `patches/react-native-omise+0.0.2.patch` ถูกสร้างแล้ว

### ขั้นตอนที่ 2: Apply Patch
```bash
cd C:\Users\Admin\Desktop\project\TheTrago
npx patch-package
```

### ขั้นตอนที่ 3: Clean และ Build
```bash
cd android
.\gradlew clean
.\gradlew assembleDebug
```

## การตรวจสอบ

ตรวจสอบไฟล์ `node_modules/react-native-omise/android/build.gradle` ว่ามีการเปลี่ยนแปลงแล้ว:

### เก่า (เสีย):
```gradle
dependencies {
    compile 'com.facebook.react:react-native:+'
    compile 'co.omise:omise-android:2.3.+'
}
```

### ใหม่ (แก้แล้ว):
```gradle
dependencies {
    implementation 'com.facebook.react:react-native:+'
    implementation 'co.omise:omise-android:2.3.+'
}
```

## ทางเลือกอื่น

หากยังมีปัญหา สามารถ:

1. **ใช้ Omise SDK โดยตรง** แทน react-native-omise
2. **อัปเดตเป็น package ใหม่** ที่รองรับ React Native เวอร์ชันใหม่
3. **ลบ react-native-omise** ออกหากไม่ได้ใช้งาน

## คำสั่งสำหรับทดสอบ

```bash
# Clean everything
cd C:\Users\Admin\Desktop\project\TheTrago
rm -rf node_modules
npm install
npx patch-package

# Clean Android
cd android
.\gradlew clean

# Build
.\gradlew assembleDebug
```

## หมายเหตุ
- Patch นี้จะต้อง apply ทุกครั้งที่ run `npm install` ใหม่
- สามารถใช้ `postinstall` script ใน package.json เพื่อ apply patch อัตโนมัติ

### เพิ่มใน package.json:
```json
{
  "scripts": {
    "postinstall": "patch-package"
  }
}
```
