# คำแนะนำการติดตั้งและใช้งานระบบ OTP จริง

## 🚀 การติดตั้ง Backend API

### 1. ติดตั้ง Node.js และ npm
```bash
# ตรวจสอบว่าติดตั้งแล้วหรือไม่
node --version
npm --version
```

### 2. ติดตั้ง dependencies
```bash
# ใน folder ของโปรเจค
npm install express nodemailer express-rate-limit cors dotenv nodemon
```

### 3. สร้างไฟล์ .env
```bash
# คัดลอกจาก .env.example
cp .env.example .env
```

แก้ไขไฟล์ .env:
```env
PORT=3000
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASSWORD=your-app-password
```

### 4. ตั้งค่า Gmail สำหรับส่งอีเมล

#### ขั้นตอนการสร้าง App Password:
1. เข้า Google Account Settings: https://myaccount.google.com/
2. เปิด "2-Step Verification" (การยืนยันแบบ 2 ขั้นตอน)
3. ไป Security > 2-Step Verification > App passwords
4. สร้าง App password ใหม่
5. คัดลอก password 16 หลักที่ได้
6. ใส่ใน .env ที่ EMAIL_PASSWORD

### 5. เริ่มใช้งาน Backend
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## 📱 การตั้งค่า React Native App

### 1. หา IP Address ของเครื่อง
```bash
# Windows
ipconfig

# macOS/Linux
ifconfig
```

### 2. แก้ไข IP ใน BookingScreen.js
เปลี่ยนจาก `192.168.1.100` เป็น IP ของเครื่องคุณ:
```javascript
const response = await fetch('http://YOUR_IP_ADDRESS:3000/api/auth/send-otp', {
```

### 3. ทดสอบการเชื่อมต่อ
```bash
# ทดสอบ API
curl -X POST http://YOUR_IP_ADDRESS:3000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","language":"th"}'
```

## 🔧 การปรับแต่งเพิ่มเติม

### 1. เปลี่ยน Email Provider
แก้ไขใน `backend-otp-api.js`:
```javascript
const transporter = nodemailer.createTransporter({
  host: 'smtp.your-provider.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});
```

### 2. ใช้ Database แทน In-Memory Storage
```bash
# ติดตั้ง MongoDB
npm install mongodb mongoose

# หรือ Redis
npm install redis
```

### 3. เพิ่ม Security
```bash
# ติดตั้ง JWT
npm install jsonwebtoken

# ติดตั้ง bcrypt สำหรับ hash
npm install bcrypt
```

## 🧪 การทดสอบ

### 1. ทดสอบส่ง OTP
```javascript
// ใน app จะมี log ใน console
console.log(`OTP sent to ${email}: ${otp}`);
```

### 2. ตรวจสอบ Email
- เช็คใน Inbox และ Spam folder
- OTP จะหมดอายุใน 5 นาที
- สามารถลองผิด 3 ครั้ง

### 3. Debug
```javascript
// เพิ่มใน app สำหรับ debug
console.log('Response:', data);
console.log('Error:', error);
```

## 🚨 ข้อสำคัญ

### 1. Security
- ใช้ HTTPS ใน production
- เก็บ Environment Variables ให้ปลอดภัย
- ตั้ง Rate Limiting ที่เหมาะสม

### 2. Email Delivery
- ทดสอบกับ email provider ต่างๆ
- ตรวจสอบ spam filter
- ใช้ dedicated email service (SendGrid, AWS SES) ใน production

### 3. Performance
- ใช้ Redis สำหรับ OTP storage
- ใช้ Database สำหรับ user management
- ตั้ง proper logging และ monitoring

## 📞 การแก้ปัญหา

### ปัญหาที่อาจพบ:
1. **ส่งอีเมลไม่ได้**: ตรวจสอบ Gmail App Password
2. **เชื่อมต่อไม่ได้**: ตรวจสอบ IP Address และ Firewall
3. **OTP ไม่มา**: ตรวจสอบ spam folder และ email template

### Log ที่ควรดู:
- Backend console log
- React Native debugger
- Network tab ใน browser developer tools
