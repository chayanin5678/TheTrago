# วิธีสร้าง APK แบบ Basic (ไม่มี Social Login)

## ขั้นตอนการแก้ไข APK Crash

### 1. แก้ไข app.json ชั่วคราว
ลบ native plugins ที่อาจทำให้ crash:

```json
{
  "expo": {
    "plugins": [
      "expo-secure-store"
      // ลบ react-native-fbsdk-next ชั่วคราว
    ]
  }
}
```

### 2. แก้ไข package.json ชั่วคราว
Comment dependencies ที่เป็น native modules:

```json
{
  "dependencies": {
    // "@react-native-google-signin/google-signin": "^15.0.0",
    // "react-native-fbsdk-next": "^13.4.1",
    // "react-native-omise": "^0.0.2",
    // "react-native-vision-camera": "^4.7.0"
  }
}
```

### 3. แก้ไข imports ใน LoginScreen.js
Comment การ import native modules:

```javascript
// import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
// import { LoginManager, AccessToken } from 'react-native-fbsdk-next';
```

### 4. Clean และ Build ใหม่
```cmd
cd C:\Users\Admin\Desktop\project\TheTrago
rm -rf node_modules
npm install
cd android
.\gradlew clean
.\gradlew assembleDebug -x test
```

### 5. ทดสอบ APK
APK ควรเปิดได้แล้ว (แต่ไม่มี Social Login)
