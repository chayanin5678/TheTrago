# Facebook Native SDK Setup Guide (react-native-fbsdk-next)

## การตั้งค่าใน Facebook Developer Console

### 1. เข้าสู่ Facebook Developers Console
1. ไปที่ https://developers.facebook.com
2. เข้าสู่ระบบด้วยบัญชี Facebook ของคุณ
3. เลือกแอพ TheTrago (App ID: 1326238592032941)

### 2. ตั้งค่า iOS Platform
1. ไปที่ **Settings** -> **Basic**
2. คลิก **+ Add Platform** 
3. เลือก **iOS**
4. กรอกข้อมูล:
   - **Bundle ID**: `com.thetrago.ios`
   - **Optional URL suffix**: ปล่อยว่าง

### 3. ตั้งค่า Facebook Login
1. ไปที่ **Products** -> **Facebook Login** -> **Settings**
2. ตั้งค่า Client OAuth Settings:
   - ✅ Use Strict Mode for Redirect URIs
   - ✅ Native or Desktop App OAuth Login
   - ✅ Embedded Browser OAuth Login

### 4. Valid OAuth Redirect URIs
**ลบ `fb1326238592032941://authorize` ออกจาก Valid OAuth Redirect URIs**
- สามารถปล่อยช่องนี้ว่างได้
- Native SDK จัดการ OAuth flow เอง ไม่ต้องใช้ redirect URI

### 5. App Domains
ใส่โดเมนที่เกี่ยวข้อง (ถ้ามี):
```
thetrago.com
www.thetrago.com
```

## การตั้งค่าในแอพ

### 1. app.json Configuration
```json
{
  "expo": {
    "plugins": [
      [
        "react-native-fbsdk-next",
        {
          "appID": "1326238592032941",
          "displayName": "The Trago",
          "scheme": "fb1326238592032941",
          "isAutoInitEnabled": true
        }
      ]
    ]
  }
}
```

### 2. socialConfig.js
```javascript
export const FACEBOOK_CONFIG = {
  appId: '1326238592032941',
  permissions: ['public_profile', 'email'],
};
```

### 3. LoginScreen Implementation
```javascript
import { LoginManager, AccessToken } from 'react-native-fbsdk-next';

const handleFacebookLogin = async () => {
  const result = await LoginManager.logInWithPermissions(
    ['public_profile', 'email'],
    { loginTrackingIOS: 'enabled' }
  );
  
  if (!result.isCancelled) {
    const accessToken = await AccessToken.getCurrentAccessToken();
    // ส่ง accessToken?.accessToken ไป backend
  }
};
```

## การทำงานของ Native SDK

### ข้อดี:
- ✅ ไม่ต้องใช้ redirect URI
- ✅ ไม่พึ่งโดเมนหรือ web service
- ✅ ใช้ Facebook app บนเครื่องได้ (ถ้ามี)
- ✅ Fallback เป็น web view ได้
- ✅ รองรับ App Tracking Transparency (iOS 14.5+)

### การทำงาน:
1. Native SDK ตรวจสอบ Facebook app บนเครื่อง
2. ถ้ามี Facebook app -> เปิด app เพื่อ login
3. ถ้าไม่มี -> เปิด Safari/Chrome เพื่อ login
4. กลับมาแอพพร้อม access token

## การทดสอบ

### Development:
```bash
npx expo run:ios
# หรือ
eas build --profile development --platform ios
```

### Production:
```bash
eas build --platform ios
```

## Troubleshooting

### ปัญหาที่พบบ่อย:

1. **"App not in development mode"**
   - เพิ่ม Test Users ใน Facebook Console
   - หรือส่ง App Review

2. **"Invalid Bundle ID"**
   - ตรวจสอบ Bundle ID ใน Facebook Console: `com.thetrago.ios`
   - ต้องตรงกับ `app.json`

3. **"Permission denied"**
   - ตรวจสอบ permissions ใน FacebookConfig
   - ตรวจสอบ App Review status

### Debug Commands:
```javascript
// ดู current access token
const accessToken = await AccessToken.getCurrentAccessToken();
console.log('Facebook Access Token:', accessToken);

// ดู permissions ที่ได้รับ
console.log('Granted permissions:', accessToken?.permissions);
console.log('Declined permissions:', accessToken?.declinedPermissions);
```

## Security Notes

- ✅ App Secret ไม่ต้องใส่ใน client-side code
- ✅ Native SDK จัดการ security ให้
- ✅ Access token มี expiration time
- ✅ รองรับ permission review process

---

**หมายเหตุ**: การใช้ Native SDK ไม่ต้องตั้งค่า redirect URI ซับซ้อน และทำงานได้เสถียรกว่า web-based OAuth flow