# วิธีแก้ไขปัญหา Social Login ใน React Native + Expo

## สาเหตุของปัญหา
Google Sign-In และ Facebook SDK ไม่สามารถทำงานใน **Expo Go** ได้ เพราะต้องใช้ native dependencies ที่ต้อง build แยก

## วิธีแก้ไข

### 1. สำหรับการทดสอบใน Development (Expo Go)
- ✅ แอปจะทำงานปกติโดยแสดงข้อความแจ้งเตือนเมื่อกดปุ่ม Social Login
- ✅ สามารถใช้ระบบ Login ปกติได้เหมือนเดิม
- ⚠️ Google และ Facebook Login จะแสดงข้อความแจ้งเตือนแทน

### 2. สำหรับการใช้งานจริง (Development Build)

#### ขั้นตอนสร้าง Development Build:

```bash
# ติดตั้ง EAS CLI
npm install -g @expo/eas-cli

# Login เข้า Expo
eas login

# สร้าง Development Build สำหรับ Android
eas build --platform android --profile development

# หรือสำหรับ iOS
eas build --platform ios --profile development
```

#### ตั้งค่า EAS Build Profile (eas.json):
```json
{
  "cli": {
    "version": ">= 3.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "resourceClass": "m1-medium"
      }
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {}
  },
  "submit": {
    "production": {}
  }
}
```

### 3. การตั้งค่า API Keys

#### Google Sign-In:
1. ไปที่ [Google Cloud Console](https://console.developers.google.com/)
2. สร้างโปรเจกต์ใหม่หรือเลือกโปรเจกต์ที่มี
3. เปิดใช้งาน Google Sign-In API
4. สร้าง OAuth 2.0 Client IDs
5. คัดลอก Web Client ID ไปใส่ใน `socialConfig.js`

#### Facebook Login:
1. ไปที่ [Facebook Developers](https://developers.facebook.com/)
2. สร้าง App ใหม่
3. เพิ่ม Facebook Login product
4. คัดลอก App ID ไปใส่ใน `socialConfig.js`
5. ตั้งค่า Valid OAuth Redirect URIs

### 4. Backend API Endpoint

สร้าง endpoint `/social-login` ใน backend:

```javascript
// POST /social-login
{
  "provider": "google|facebook",
  "providerId": "user_id_from_provider",
  "email": "user@example.com",
  "name": "User Name",
  "photo": "profile_photo_url"
}

// Response
{
  "token": "jwt_token",
  "user": { ... }
}
```

## สรุป

1. **ปัจจุบัน**: แอปทำงานได้ใน Expo Go แต่ Social Login จะแสดงข้อความแจ้งเตือน
2. **สำหรับ Production**: ต้องสร้าง Development Build ด้วย EAS
3. **API Configuration**: ต้องตั้งค่า Google และ Facebook API Keys
4. **Backend**: ต้องสร้าง endpoint `/social-login`

## การใช้งาน

- กดปุ่ม Google/Facebook ใน Expo Go จะแสดงข้อความแจ้งเตือน
- ใน Development Build จะทำงานเต็มรูปแบบ
- ระบบ Login ปกติทำงานได้ทุกกรณี
