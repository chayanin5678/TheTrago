# The Trago - OTP Authentication Integration

## 🎯 สถานะการใช้งาน

✅ **ระบบ OTP พร้อมใช้งานแล้ว!**

- **API Endpoint**: `https://tragoxc1.com/AppApi/`
- **OTP Send**: `POST /send-otp`
- **OTP Verify**: `POST /verify-otp`
- **Database**: MySQL (tragoxc1_thailandferry)
- **Email Service**: Gmail SMTP

## 📱 การทำงานใน React Native App

### 1. หน้า BookingScreen.js
- เมื่อเข้าหร้าการจองจะต้องล็อกอินก่อน
- กรอกอีเมลและกดส่ง OTP
- รับ OTP ใน email และยืนยัน
- เข้าสู่ระบบสำเร็จ

### 2. API Endpoints ที่ใช้

#### ส่ง OTP
```javascript
POST https://tragoxc1.com/AppApi/send-otp
{
  "email": "user@example.com",
  "language": "th" // หรือ "en"
}
```

#### ยืนยัน OTP
```javascript
POST https://tragoxc1.com/AppApi/verify-otp
{
  "email": "user@example.com",
  "otp": "123456",
  "language": "th"
}
```

## 🔧 คุณสมบัติที่พร้อมใช้

### ✅ ระบบ OTP
- ✅ ส่ง OTP จริงไปยังอีเมล (ผ่าน Gmail SMTP)
- ✅ Template อีเมลสวยงาม (ภาษาไทย/อังกฤษ)
- ✅ OTP หมดอายุ 5 นาที
- ✅ จำกัดการลองผิด 3 ครั้ง
- ✅ Rate limiting (5 ครั้งต่อ 15 นาที)
- ✅ Session management
- ✅ Multi-language support

### ✅ UI/UX ใน App
- ✅ หน้าล็อกอินที่สวยงาม
- ✅ Email input validation
- ✅ OTP input (6 หลัก)
- ✅ Loading states
- ✅ Error handling ครบถ้วน
- ✅ ภาษาไทย/อังกฤษ

### ✅ Security Features
- ✅ Email validation
- ✅ OTP expiration
- ✅ Rate limiting
- ✅ Attempt limitation
- ✅ Secure token generation
- ✅ Session management

## 📊 ฐานข้อมูล

### Tables ที่ใช้
- **md_member**: ข้อมูลสมาชิก
- **md_booking**: ข้อมูลการจอง
- **md_passenger**: ข้อมูลผู้โดยสาร

### OTP Storage
- ใช้ In-memory Map สำหรับเก็บ OTP (production ควรใช้ Redis)
- Auto cleanup เมื่อหมดอายุ

## 🌐 การทำงานจริง

### 1. ขั้นตอนการใช้งาน
1. เปิด BookingScreen
2. กรอกอีเมล
3. กด "ส่ง OTP"
4. ตรวจ email (รวม spam folder)
5. กรอก OTP 6 หลัก
6. กด "ยืนยัน"
7. เข้าสู่ระบบสำเร็จ

### 2. Email Template
```html
<div style="background: linear-gradient(135deg, #FD501E, #FF6B35);">
  <h1 style="color: white;">The Trago</h1>
</div>
<div>
  <h2>รหัส OTP ของคุณ</h2>
  <h1 style="color: #FD501E; font-size: 36px;">123456</h1>
  <p>รหัสนี้จะหมดอายุใน 5 นาที</p>
</div>
```

## 🚨 สิ่งสำคัญ

### 1. Email Configuration
```javascript
// ใน server.js
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: 'chayanin0937@gmail.com',
    pass: 'imnh ipfy bzbc ohib'
  }
});
```

### 2. API Response Format
```javascript
// Success
{
  "success": true,
  "message": "รหัส OTP ถูกส่งไปยังอีเมลของคุณแล้ว",
  "token": "abc123...", // สำหรับ verify-otp
  "user": { ... }
}

// Error
{
  "success": false,
  "message": "อีเมลไม่ถูกต้อง"
}
```

### 3. BookingScreen.js Integration
```javascript
// ส่ง OTP
const response = await fetch('https://tragoxc1.com/AppApi/send-otp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: email.trim(),
    language: selectedLanguage
  }),
});

// ยืนยัน OTP
const response = await fetch('https://tragoxc1.com/AppApi/verify-otp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: email.trim(),
    otp: otpCode,
    language: selectedLanguage
  }),
});
```

## 🎮 การทดสอบ

### 1. การส่ง OTP
- กรอกอีเมลจริง
- ตรวจใน inbox และ spam
- OTP จะมาใน 30-60 วินาที

### 2. การยืนยัน OTP
- OTP ที่ได้จาก email
- มีเวลา 5 นาทีในการยืนยัน
- ลองผิดได้ 3 ครั้ง

### 3. Rate Limiting
- ส่ง OTP ได้ 5 ครั้งต่อ 15 นาที
- จำกัดต่อ IP address

## 🔍 Debug & Troubleshooting

### 1. ถ้า OTP ไม่มา
- ตรวจ spam folder
- ตรวจ email ที่กรอกถูกต้อง
- ตรวจ console log ใน server

### 2. ถ้า verify ไม่สำเร็จ
- ตรวจ OTP ครบ 6 หลักหรือไม่
- ตรวจว่าหมดเวลา 5 นาทีหรือยัง
- ตรวจการพิมพ์ผิด

### 3. Server Logs
```javascript
console.log(`OTP sent to ${email}: ${otp}`); // Development only
```

## 🎉 สรุป

**ระบบ OTP ทำงานได้แล้ว 100%!**

- ✅ ใช้ API จริงของ The Trago
- ✅ ส่ง OTP ไปยังอีเมลจริง
- ✅ UI/UX สมบูรณ์แล้ว
- ✅ รองรับภาษาไทย/อังกฤษ
- ✅ Security ครบถ้วน
- ✅ Error handling ครบถ้วน

**พร้อมใช้งานได้เลย!** 🚀
