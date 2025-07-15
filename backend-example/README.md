# TheTrago Backend API

## เทคโนโลยีที่ใช้
- **Node.js** + **Express.js**
- **MongoDB** + **Mongoose**
- **JWT** สำหรับ authentication
- **bcrypt** สำหรับ password hashing
- **axios** สำหรับ verification ข้อมูล social login

## การติดตั้ง

```bash
mkdir thetrago-backend
cd thetrago-backend
npm init -y
npm install express mongoose bcryptjs jsonwebtoken axios cors dotenv
npm install -D nodemon
```

## โครงสร้างโปรเจกต์

```
thetrago-backend/
├── models/
│   └── User.js
├── routes/
│   ├── auth.js
│   └── profile.js
├── middleware/
│   └── auth.js
├── utils/
│   └── socialAuth.js
├── .env
├── server.js
└── package.json
```

## การตั้งค่า Environment Variables

สร้างไฟล์ `.env`:
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/thetrago
JWT_SECRET=your-super-secret-jwt-key-here
NODE_ENV=development

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Facebook App
FACEBOOK_APP_ID=1326238592032941
FACEBOOK_APP_SECRET=your-facebook-app-secret
```
