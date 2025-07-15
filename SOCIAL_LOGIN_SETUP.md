# Social Login Setup Guide

## การตั้งค่า Google Sign-In

1. **ไปที่ Google Cloud Console**
   - เปิด https://console.developers.google.com/
   - สร้าง project ใหม่หรือเลือก project ที่มีอยู่

2. **เปิดใช้งาน Google Sign-In API**
   - ไปที่ "APIs & Services" > "Library"
   - ค้นหา "Google Sign-In API" และเปิดใช้งาน

3. **สร้าง OAuth 2.0 Credentials**
   - ไปที่ "APIs & Services" > "Credentials"
   - คลิก "Create Credentials" > "OAuth 2.0 Client IDs"
   - เลือก "Web application"
   - เพิ่ม Authorized redirect URIs (ถ้าจำเป็น)
   - คัดลอก "Client ID" มาใส่ใน socialConfig.js

4. **สำหรับ Android**
   - สร้าง OAuth 2.0 Client ID แบบ "Android"
   - ใส่ Package name: `com.chayanin5678.TheTrago`
   - ใส่ SHA-1 fingerprint จาก keystore

5. **สำหรับ iOS**
   - สร้าง OAuth 2.0 Client ID แบบ "iOS"
   - ใส่ Bundle ID: `com.chayanin5678.TheTrago`

## การตั้งค่า Facebook Login

1. **ไปที่ Facebook Developers**
   - เปิด https://developers.facebook.com/
   - คลิก "My Apps" > "Create App"

2. **เลือก App Type**
   - เลือก "Consumer" สำหรับ app ทั่วไป
   - ใส่ Display Name: "TheTrago"

3. **เพิ่ม Facebook Login Product**
   - ไปที่ App Dashboard
   - คลิก "Add Product" > "Facebook Login" > "Set Up"

4. **ตั้งค่า Valid OAuth Redirect URIs**
   - ไปที่ Facebook Login Settings
   - เพิ่ม Valid OAuth Redirect URIs สำหรับ app ของคุณ

5. **คัดลอก App ID และ Client Token**
   - ไปที่ "Settings" > "Basic"
   - คัดลอก "App ID" และ "Client Token"
   - ใส่ใน app.json และ socialConfig.js

## การอัปเดตไฟล์ Config

1. **อัปเดต socialConfig.js**
   ```javascript
   export const GOOGLE_CONFIG = {
     webClientId: 'ใส่ Google Web Client ID ตรงนี้',
     iosClientId: 'ใส่ Google iOS Client ID ตรงนี้',
     offlineAccess: true,
     forceCodeForRefreshToken: true,
   };

   export const FACEBOOK_CONFIG = {
     appId: 'ใส่ Facebook App ID ตรงนี้',
     permissions: ['public_profile', 'email'],
   };
   ```

2. **อัปเดต app.json**
   ```json
   "plugins": [
     "expo-secure-store",
     [
       "react-native-fbsdk-next",
       {
         "appID": "ใส่ Facebook App ID ตรงนี้",
         "clientToken": "ใส่ Facebook Client Token ตรงนี้",
         "displayName": "TheTrago",
         "scheme": "fb-ใส่ Facebook App ID ตรงนี้"
       }
     ]
   ]
   ```

## Backend API

สร้าง endpoint `/social-login` ใน backend ที่รับข้อมูล:
- provider (google/facebook)
- providerId (ID จาก social platform)
- email
- name
- photo

และตอบกลับด้วย JWT token เหมือนการ login ปกติ

## การ Build App

หลังจากตั้งค่าเสร็จแล้ว:

1. **สำหรับ Development**
   ```bash
   expo start
   ```

2. **สำหรับ Production Build**
   ```bash
   eas build --platform android
   eas build --platform ios
   ```

## หมายเหตุ

- Google Sign-In ต้องมี SHA-1 fingerprint ที่ถูกต้องสำหรับ Android
- Facebook Login ต้องตั้งค่า Bundle ID/Package Name ที่ตรงกัน
- ทั้งสอง service ต้องการ internet connection เพื่อทำงาน
