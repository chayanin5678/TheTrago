# Development Build Guide สำหรับ TheTrago

## ทำไมต้องสร้าง Development Build?

**Expo Go มีข้อจำกัด:**
- ❌ ไม่รองรับ Facebook SDK (react-native-fbsdk-next)
- ❌ ไม่รองรับ Google Sign-In (@react-native-google-signin/google-signin)
- ❌ ไม่รองรับ Apple Sign-In แบบ native
- ❌ ไม่รองรับ native modules อื่นๆ

**Development Build สามารถ:**
- ✅ รองรับ Facebook Login ได้เต็มรูปแบบ
- ✅ รองรับ Google Sign-In ได้เต็มรูปแบบ
- ✅ รองรับ Apple Sign-In ได้เต็มรูปแบบ
- ✅ ทดสอบ native modules ทั้งหมด

## วิธีสร้าง Development Build

### 1. สำหรับ iOS:
```bash
eas build --profile development --platform ios
```

### 2. สำหรับ Android:
```bash
eas build --profile development --platform android
```

### 3. สำหรับทั้งสองแพลตฟอร์ม:
```bash
eas build --profile development
```

## การติดตั้ง Development Build

### iOS:
1. ดาวน์โหลด .ipa file จาก EAS Dashboard
2. ติดตั้งผ่าน TestFlight หรือ
3. ติดตั้งโดยตรงบน device ผ่าน Apple Configurator

### Android:
1. ดาวน์โหลด .apk file จาก EAS Dashboard
2. ติดตั้งโดยตรงบน device
3. หรือ upload ไป Google Play Console (Internal Testing)

## การใช้งาน Development Build

### เชื่อมต่อกับ Metro:
```bash
npx expo start --dev-client
```

### ตัวอย่างการทดสอบ Social Login:

#### Facebook Login:
1. กดปุ่ม "Continue with Facebook"
2. ระบบจะเปิด Facebook app หรือ Safari
3. Login ด้วยบัญชี Facebook
4. กลับมาแอพพร้อมข้อมูลผู้ใช้

#### Google Sign-In:
1. กดปุ่ม "Continue with Google"
2. ระบบจะเปิด Google Sign-In flow
3. เลือกบัญชี Google
4. กลับมาแอพพร้อมข้อมูลผู้ใช้

#### Apple Sign-In (iOS เท่านั้น):
1. กดปุ่ม "Continue with Apple"
2. ระบบจะเปิด Apple Sign-In
3. ยืนยันตัวตนด้วย Face ID/Touch ID
4. กลับมาแอพพร้อมข้อมูลผู้ใช้

## Troubleshooting

### ปัญหาที่พบบ่อย:

#### 1. Facebook Login ไม่ทำงาน:
- ตรวจสอบ Bundle ID ใน Facebook Console
- ตรวจสอบ App ID ใน app.json
- ตรวจสอบ Facebook app permissions

#### 2. Google Sign-In ไม่ทำงาน:
- ตรวจสอบ iOS Client ID ใน Google Console
- ตรวจสอบ Bundle ID ตรงกัน
- ตรวจสอบ URL Scheme ใน app.json

#### 3. Apple Sign-In ไม่ทำงาน:
- ตรวจสอบ Bundle ID
- ตรวจสอบ Team ID
- ตรวจสอบ Signing Certificate

### Debug Commands:
```javascript
// ตรวจสอบ environment
console.log('Is Development Build?', !__DEV__ || Constants.appOwnership === 'standalone');

// ตรวจสอบ Facebook SDK
console.log('Facebook SDK Available?', !!LoginManager.logInWithPermissions);

// ตรวจสอบ Google Sign-In
console.log('Google Sign-In Available?', !!GoogleSignin);
```

## Performance Tips

1. **Build ครั้งแรก**: อาจใช้เวลา 10-20 นาที
2. **Build ครั้งต่อไป**: ใช้เวลา 5-10 นาที (มี cache)
3. **ใช้ Preview**: สำหรับ UI testing ที่ไม่ต้องการ native modules

## สรุป

- **Expo Go**: สำหรับพัฒนา UI และ logic ทั่วไป
- **Development Build**: สำหรับทดสอบ Social Login และ native features
- **Production Build**: สำหรับการ deploy จริง

**คำแนะนำ**: สร้าง Development Build เมื่อต้องการทดสอบ:
- Facebook Login
- Google Sign-In  
- Apple Sign-In
- Native modules อื่นๆ

---

**Command สำหรับเริ่มต้น:**
```bash
eas build --profile development --platform ios
```