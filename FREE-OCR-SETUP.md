# 🆓 Free OCR API Setup Guide for Bank Book Reading

## ✅ ได้อัปเดตแอปให้รองรับ OCR ฟรีแล้ว!

### 🎯 **API ฟรีที่รองรับ:**

#### 1. **OCR.Space (แนะนำ)** ⭐
- 🆓 **ฟรี 25,000 requests/เดือน**
- 📝 **ลงทะเบียนง่าย:** https://ocr.space/ocrapi
- 🇹🇭 **รองรับภาษาไทยดี**
- ⚡ **ตั้งค่าง่าย**

#### 2. **Google Vision API** ⭐⭐⭐
- 🆓 **ฟรี 1,000 requests/เดือน**
- 🎯 **ความแม่นยำสูงสุด**
- 🇹🇭 **รองรับภาษาไทยเยี่ยม**
- 📝 **ลงทะเบียน:** https://cloud.google.com/vision

#### 3. **Azure Computer Vision** ⭐⭐
- 🆓 **ฟรี 5,000 requests/เดือน**
- 🏢 **คุณภาพ Microsoft**
- 📝 **ลงทะเบียน:** https://azure.microsoft.com

#### 4. **Tesseract.js (Offline)** ⭐
- 🆓 **ฟรี 100% ตลกฟิงไกล**
- 🔒 **ทำงานออฟไลน์**
- 🛡️ **ปลอดภัย ไม่ส่งข้อมูลออกนอก**

---

## 🚀 **วิธีเริ่มต้น (เลือก 1 วิธี):**

### **วิธีที่ 1: OCR.Space (ง่ายสุด)** 🥇
```javascript
// 1. ไปที่ https://ocr.space/ocrapi
// 2. กรอกอีเมลเพื่อรับ API Key ฟรี
// 3. แทนที่ใน BankVerificationScreen.js:

const OCR_SPACE_API_KEY = "YOUR_FREE_API_KEY"; // ใส่ API Key ที่ได้รับ
```

### **วิธีที่ 2: ใช้ Demo (ไม่ต้องตั้งค่า)** 🎮
```javascript
// ใช้ข้อมูลสาธิตได้เลย ไม่ต้องตั้งค่าอะไร
// แอปจะใช้ข้อมูลตัวอย่างของธนาคารกรุงเทพ
```

---

## 📋 **สิ่งที่เพิ่มเข้าไปในแอป:**

### ✅ **Multi-OCR System:**
- ลองใช้ OCR.Space ก่อน (ถ้ามี API Key)
- หาก OCR.Space ไม่ได้ผล จะลองใช้ Custom Server
- สุดท้ายจะใช้ Demo Data

### ✅ **Enhanced Text Recognition:**
- รองรับธนาคารไทยทุกแห่ง
- รองรับรูปแบบเลขบัญชีไทย
- แยกแยะชื่อ-สกุล ภาษาไทย
- จดจำชื่อสาขาธนาคาร

### ✅ **Better Error Handling:**
- แสดงข้อความชัดเจนว่าใช้ OCR ตัวไหน
- Fallback อัตโนมัติถ้า API ไม่ทำงาน
- ไม่มีค้าง หรือ crash

---

## 🎯 **การใช้งาน:**

1. **อัปโหลดรูปสมุดบัญชี**
2. **แอปจะลองใช้ OCR ฟรีตามลำดับ:**
   - OCR.Space (ถ้ามี API Key)
   - Custom Server (ถ้า server ทำงาน)
   - Demo Data (เสมอใช้ได้)
3. **ระบบจะแสดงผลลัพธ์ที่ได้**
4. **ตรวจสอบและแก้ไขข้อมูลได้**

---

## 💡 **คำแนะนำ:**

### **สำหรับ Development:**
- ใช้ Demo Data เพื่อทดสอบ
- OCR.Space สำหรับทดสอบจริง

### **สำหรับ Production:**
- Google Vision (ความแม่นยำสูงสุด)
- OCR.Space (ราคาถูก, ใช้งานง่าย)

### **สำหรับความปลอดภัย:**
- Tesseract.js (ข้อมูลไม่ออกจากเครื่อง)
- Custom Server (ควบคุมเอง)

---

## 🔧 **ตั้งค่าเพิ่มเติม:**

ดูไฟล์ `ocr-config.js` สำหรับการตั้งค่าทั้งหมด

```javascript
// เปิดใช้ OCR.Space
OCR_SPACE: {
  enabled: true,
  apiKey: 'YOUR_API_KEY', // ใส่ API Key ของคุณ
}

// เปิดใช้ Google Vision
GOOGLE_VISION: {
  enabled: true,
  apiKey: 'YOUR_GOOGLE_API_KEY',
}
```

---

## 📞 **ช่วยเหลือ:**

หากต้องการความช่วยเหลือในการตั้งค่า OCR API ใดๆ สามารถถามได้เสมอ!

### **ปัญหาที่พบบ่อย:**
1. **API Key ไม่ทำงาน** → ตรวจสอบว่าใส่ถูกต้อง
2. **OCR ไม่แม่นยำ** → ลองเปลี่ยน API หรือถ่ายรูปใหม่
3. **ช้า** → ลองใช้ API อื่น หรือลดขนาดรูป
4. **Error** → ดู console log เพื่อหาสาเหตุ
