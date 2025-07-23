// Backend API Example for OTP System
// ตัวอย่างการสร้าง API สำหรับระบบ OTP

const express = require('express');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');
const app = express();

// Middleware
app.use(express.json());

// Rate limiting for OTP requests
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: 'Too many OTP requests, please try again later.'
  }
});

// In-memory storage (ใน production ใช้ Redis หรือ Database)
const otpStorage = new Map();
const userSessions = new Map();

// Email configuration
const transporter = nodemailer.createTransporter({
  host: 'smtp.gmail.com', // หรือ SMTP server อื่นๆ
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER, // อีเมลสำหรับส่ง OTP
    pass: process.env.EMAIL_PASSWORD // App Password
  }
});

// Generate 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Generate session token
function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Send OTP Email Template
function getEmailTemplate(otp, language = 'en') {
  const templates = {
    th: {
      subject: 'รหัส OTP สำหรับเข้าสู่ระบบ The Trago',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #FD501E, #FF6B35); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">The Trago</h1>
          </div>
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333;">รหัส OTP ของคุณ</h2>
            <p style="font-size: 16px; color: #666;">
              ใช้รหัสนี้เพื่อเข้าสู่ระบบ The Trago:
            </p>
            <div style="background: white; padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0;">
              <h1 style="color: #FD501E; font-size: 36px; margin: 0; letter-spacing: 5px;">${otp}</h1>
            </div>
            <p style="font-size: 14px; color: #999;">
              รหัสนี้จะหมดอายุใน 5 นาที<br>
              หากคุณไม่ได้ร้องขอรหัสนี้ กรุณาละเว้นอีเมลนี้
            </p>
          </div>
        </div>
      `
    },
    en: {
      subject: 'OTP Code for The Trago Login',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #FD501E, #FF6B35); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">The Trago</h1>
          </div>
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333;">Your OTP Code</h2>
            <p style="font-size: 16px; color: #666;">
              Use this code to sign in to The Trago:
            </p>
            <div style="background: white; padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0;">
              <h1 style="color: #FD501E; font-size: 36px; margin: 0; letter-spacing: 5px;">${otp}</h1>
            </div>
            <p style="font-size: 14px; color: #999;">
              This code will expire in 5 minutes<br>
              If you didn't request this code, please ignore this email
            </p>
          </div>
        </div>
      `
    }
  };
  
  return templates[language] || templates.en;
}

// API Route: Send OTP
app.post('/api/auth/send-otp', otpLimiter, async (req, res) => {
  try {
    const { email, language = 'en' } = req.body;

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: language === 'th' ? 'อีเมลไม่ถูกต้อง' : 'Invalid email address'
      });
    }

    // Generate OTP
    const otp = generateOTP();
    
    // Store OTP with expiration (5 minutes)
    otpStorage.set(email, {
      otp,
      expires: Date.now() + 5 * 60 * 1000, // 5 minutes
      attempts: 0
    });

    // Get email template
    const template = getEmailTemplate(otp, language);

    // Send email
    await transporter.sendMail({
      from: `"The Trago" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: template.subject,
      html: template.html
    });

    console.log(`OTP sent to ${email}: ${otp}`); // For development only

    res.json({
      success: true,
      message: language === 'th' ? 
        'รหัส OTP ถูกส่งไปยังอีเมลของคุณแล้ว' : 
        'OTP code has been sent to your email'
    });

  } catch (error) {
    console.error('Send OTP Error:', error);
    res.status(500).json({
      success: false,
      message: language === 'th' ? 
        'เกิดข้อผิดพลาดในการส่ง OTP' : 
        'Error sending OTP'
    });
  }
});

// API Route: Verify OTP
app.post('/api/auth/verify-otp', async (req, res) => {
  try {
    const { email, otp, language = 'en' } = req.body;

    // Validate input
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: language === 'th' ? 
          'กรุณากรอกอีเมลและรหัส OTP' : 
          'Email and OTP are required'
      });
    }

    // Check if OTP exists
    const storedOTP = otpStorage.get(email);
    if (!storedOTP) {
      return res.status(400).json({
        success: false,
        message: language === 'th' ? 
          'ไม่พบรหัส OTP กรุณาขอรหัสใหม่' : 
          'OTP not found. Please request a new one.'
      });
    }

    // Check if OTP expired
    if (Date.now() > storedOTP.expires) {
      otpStorage.delete(email);
      return res.status(400).json({
        success: false,
        message: language === 'th' ? 
          'รหัส OTP หมดอายุแล้ว กรุณาขอรหัสใหม่' : 
          'OTP has expired. Please request a new one.'
      });
    }

    // Check attempt limit
    if (storedOTP.attempts >= 3) {
      otpStorage.delete(email);
      return res.status(400).json({
        success: false,
        message: language === 'th' ? 
          'พยายามยืนยันครบ 3 ครั้งแล้ว กรุณาขอรหัสใหม่' : 
          'Too many attempts. Please request a new OTP.'
      });
    }

    // Verify OTP
    if (storedOTP.otp !== otp) {
      storedOTP.attempts++;
      return res.status(400).json({
        success: false,
        message: language === 'th' ? 
          `รหัส OTP ไม่ถูกต้อง (เหลือ ${3 - storedOTP.attempts} ครั้ง)` : 
          `Invalid OTP (${3 - storedOTP.attempts} attempts remaining)`
      });
    }

    // OTP is valid - create session
    const token = generateToken();
    const userData = {
      email,
      loginTime: new Date().toISOString(),
      // เพิ่มข้อมูล user อื่นๆ ได้ที่นี่
    };

    // Store session
    userSessions.set(token, userData);

    // Clean up OTP
    otpStorage.delete(email);

    res.json({
      success: true,
      message: language === 'th' ? 
        'เข้าสู่ระบบสำเร็จ' : 
        'Login successful',
      token,
      user: userData
    });

  } catch (error) {
    console.error('Verify OTP Error:', error);
    res.status(500).json({
      success: false,
      message: language === 'th' ? 
        'เกิดข้อผิดพลาดในการยืนยัน OTP' : 
        'Error verifying OTP'
    });
  }
});

// API Route: Validate Session
app.get('/api/auth/validate', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token || !userSessions.has(token)) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired session'
    });
  }

  const userData = userSessions.get(token);
  res.json({
    success: true,
    user: userData
  });
});

// API Route: Logout
app.post('/api/auth/logout', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (token) {
    userSessions.delete(token);
  }

  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`OTP API Server running on port ${PORT}`);
});

// Environment Variables Required:
// EMAIL_USER=your-email@gmail.com
// EMAIL_PASSWORD=your-app-password
// PORT=3000

module.exports = app;
