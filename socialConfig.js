// Social Login Configuration
// คุณต้องไปสร้าง App ใน Google Cloud Console และ Facebook Developers

export const GOOGLE_CONFIG = {
  // ได้จาก Google Cloud Console > APIs & Services > Credentials
  webClientId: 'YOUR_GOOGLE_WEB_CLIENT_ID', // ต้องแทนที่ด้วย Client ID จริง
  iosClientId: 'YOUR_GOOGLE_IOS_CLIENT_ID', // สำหรับ iOS
  offlineAccess: true,
  hostedDomain: '', // optional
  forceCodeForRefreshToken: true,
};

export const FACEBOOK_CONFIG = {
  // ได้จาก Facebook Developers Console
  appId: '1326238592032941', // ต้องแทนที่ด้วย App ID จริง
  permissions: ['public_profile', 'email'],
};

// วิธีการตั้งค่า:
// 
// 1. Google Sign-In:
//    - ไปที่ https://console.developers.google.com/
//    - สร้าง project ใหม่หรือเลือก project ที่มีอยู่
//    - เปิดใช้งาน Google Sign-In API
//    - สร้าง OAuth 2.0 Client IDs สำหรับ Android และ iOS
//    - คัดลอก Web Client ID มาใส่ใน webClientId
//
// 2. Facebook Login:
//    - ไปที่ https://developers.facebook.com/
//    - สร้าง app ใหม่
//    - เพิ่ม Facebook Login product
//    - คัดลอก App ID มาใส่ใน appId
//    - ตั้งค่า Valid OAuth Redirect URIs
//
// 3. Backend API:
//    - สร้าง endpoint POST /social-login ใน backend
//    - รับข้อมูล: { provider, providerId, email, name, photo }
//    - ตรวจสอบ user มีอยู่แล้วหรือไม่
//    - ถ้าไม่มี ให้สร้าง user ใหม่
//    - return token เหมือนการ login ปกติ
