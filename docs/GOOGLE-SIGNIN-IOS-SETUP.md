# Google Sign-In Setup Guide for iOS

## การตั้งค่าใน Google Cloud Console

### 1. เข้าสู่ Google Cloud Console
1. ไปที่ https://console.cloud.google.com/
2. เลือกโปรเจค TheTrago หรือสร้างใหม่
3. ไปที่ **APIs & Services** > **Credentials**

### 2. สร้าง OAuth 2.0 Client IDs
ตาม screenshots ที่คุณแสดง:

#### Web Client Configuration:
- **Name**: Web client 1
- **Client ID**: `136037103391-hurq8nstiovd88khfepi9lrdjr0hdcl3.apps.googleusercontent.com`
- **Creation date**: September 15, 2025
- **Status**: Enabled

#### iOS Client Configuration:
- **Name**: iOS client 1
- **Bundle ID**: `com.thetrago.ios`
- **Team ID**: `98SJYA9G83`
- **App Store ID**: `6751992441`
- **Client ID**: `136037103391-eh2cdfgsle1m1aepspcu9p9vjulo4p78.apps.googleusercontent.com`

#### iOS URL Scheme:
```
com.googleusercontent.apps.136037103391-eh2cdfgsle1m1aepspcu9p9vjulo4p78
```

### 3. ข้อมูลเพิ่มเติม
- **Creation date**: September 3, 2025
- **Last used date**: September 2, 2025

## การตั้งค่าในแอพ

### 1. app.json Configuration
```json
{
  "expo": {
    "plugins": [
      [
        "@react-native-google-signin/google-signin",
        {
          "iosUrlScheme": "com.googleusercontent.apps.136037103391-eh2cdfgsle1m1aepspcu9p9vjulo4p78"
        }
      ]
    ],
    "ios": {
      "bundleIdentifier": "com.thetrago.ios",
      "infoPlist": {
        "CFBundleURLTypes": [
          {
            "CFBundleURLName": "google-signin",
            "CFBundleURLSchemes": [
              "com.googleusercontent.apps.136037103391-eh2cdfgsle1m1aepspcu9p9vjulo4p78"
            ]
          }
        ],
        "LSApplicationQueriesSchemes": [
          "googlechromes",
          "comgooglemaps"
        ]
      }
    }
  }
}
```

### 2. socialConfig.js
```javascript
export const GOOGLE_CONFIG = {
  // Web Client ID (สำหรับ server-side authentication)
  webClientId: '136037103391-hurq8nstiovd88khfepi9lrdjr0hdcl3.apps.googleusercontent.com',
  
  // iOS Client ID (สำหรับ iOS native app)
  iosClientId: '136037103391-eh2cdfgsle1m1aepspcu9p9vjulo4p78.apps.googleusercontent.com',
  
  offlineAccess: true,
  forceCodeForRefreshToken: true,
  bundleId: 'com.thetrago.ios',
  teamId: '98SJYA9G83',
  appStoreId: '6751992441'
};
```

### 3. LoginScreen Implementation
```javascript
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';

useEffect(() => {
  GoogleSignin.configure({
    webClientId: GOOGLE_CONFIG.webClientId,
    iosClientId: GOOGLE_CONFIG.iosClientId,
    offlineAccess: true,
    forceCodeForRefreshToken: true,
    scopes: ['profile', 'email'],
    iosUrlScheme: 'com.googleusercontent.apps.136037103391-eh2cdfgsle1m1aepspcu9p9vjulo4p78',
  });
}, []);

const handleGoogleSignIn = async () => {
  try {
    await GoogleSignin.hasPlayServices();
    const userInfo = await GoogleSignin.signIn();
    
    // ส่งข้อมูลไปยัง backend
    const response = await axios.post(`${ipAddress}/social-login`, {
      provider: 'google',
      providerId: userInfo.user.id,
      email: userInfo.user.email,
      name: userInfo.user.name,
      firstName: userInfo.user.givenName,
      lastName: userInfo.user.familyName,
      photo: userInfo.user.photo,
    });
    
    if (response.data.token) {
      // Login สำเร็จ
      await login(response.data.token);
    }
  } catch (error) {
    console.log('Google Sign-In Error:', error);
  }
};
```

## การทำงานของ Google Sign-In

### Flow:
1. ผู้ใช้กดปุ่ม "Continue with Google"
2. ตรวจสอบ Google Play Services (Android) หรือ Google app (iOS)
3. เปิด Google Sign-In flow
4. ผู้ใช้เลือกบัญชี Google และ authorize
5. กลับมาแอพพร้อมข้อมูลผู้ใช้
6. ส่งข้อมูลไปยัง backend เพื่อสร้าง/login บัญชี

### ข้อดี:
- ✅ รองรับทั้ง iOS และ Android
- ✅ ใช้ Google app บนเครื่องได้ (ถ้ามี)
- ✅ Fallback เป็น web view
- ✅ ได้ข้อมูลผู้ใช้ครบถ้วน (profile, email)
- ✅ Security ระดับสูง

## การทดสอบ

### Prerequisites:
1. Google Cloud Console ตั้งค่าครบถ้วน
2. Bundle ID ตรงกัน: `com.thetrago.ios`
3. Team ID ถูกต้อง: `98SJYA9G83`

### Development Build:
```bash
eas build --profile development --platform ios
```

### Production Build:
```bash
eas build --platform ios
```

### Testing Steps:
1. เปิดแอพบน iOS device/simulator
2. กดปุ่ม "Continue with Google"
3. เลือกบัญชี Google
4. ตรวจสอบ logs ใน console
5. ตรวจสอบว่าได้ user info ครบถ้วน

## Troubleshooting

### ปัญหาที่พบบ่อย:

1. **"Google Sign-In not available"**
   - ตรวจสอบ Bundle ID ใน Google Console
   - ตรวจสอบ iOS URL Scheme

2. **"Play Services not available"** (Android)
   - ตรวจสอบ Google Play Services บนเครื่อง
   - อัปเดต Google Play Services

3. **"Invalid Client ID"**
   - ตรวจสอบ Client ID ใน socialConfig.js
   - ตรวจสอบ Bundle ID ตรงกัน

4. **"Network Error"**
   - ตรวจสอบการเชื่อมต่อ internet
   - ตรวจสอบ backend endpoint

### Debug Commands:
```javascript
// ตรวจสอบ configuration
console.log('Google Config:', GOOGLE_CONFIG);

// ตรวจสอบ Google Play Services
const hasPlayServices = await GoogleSignin.hasPlayServices();
console.log('Has Play Services:', hasPlayServices);

// ตรวจสอบ current user
const currentUser = await GoogleSignin.getCurrentUser();
console.log('Current User:', currentUser);
```

## Security Notes

- ✅ Client ID เป็น public information
- ✅ ไม่ต้องใส่ Client Secret ใน mobile app
- ✅ Google จัดการ OAuth security
- ✅ Access token มี expiration time
- ✅ รองรับ token refresh

---

**หมายเหตุ**: ตรวจสอบให้แน่ใจว่า Bundle ID, Team ID, และ Client ID ตรงกันทุกที่