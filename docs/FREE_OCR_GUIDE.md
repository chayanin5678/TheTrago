# 🆓 FREE OCR Services Guide for TheTrago App

## 🎉 ตัวเลือก OCR ฟรีที่พร้อมใช้งาน

### 1. 🔥 OCR.space (แนะนำ!)
- **ฟรี**: 25,000 requests/เดือน
- **ไม่ต้องสมัคร**: ใช้ API key ฟรีได้เลย
- **รองรับภาษาไทย**: เยี่ยม
- **ความแม่นยำ**: 85-90%
- **API Key**: `K87899142388957` (ใช้ได้เลย)

```javascript
// Already configured in the app!
const OCR_SPACE_API_KEY = 'K87899142388957';
```

### 2. 🌟 Google Cloud Vision
- **ฟรี**: 1,000 requests/เดือน  
- **ต้องสมัคร**: [Google Cloud Console](https://console.cloud.google.com/)
- **ความแม่นยำ**: 95-99%
- **รองรับภาษาไทย**: ดีเยี่ยม

### 3. 🔵 Azure Computer Vision
- **ฟรี**: 5,000 requests/เดือน
- **ต้องสมัคร**: [Azure Portal](https://portal.azure.com/)
- **ความแม่นยำ**: 90-95%
- **รองรับภาษาไทย**: ดี

## 🚀 การใช้งานทันที

### OCR.space (พร้อมใช้เลย!)
```javascript
// แอปได้ config ไว้แล้ว ใช้ได้เลย!
// ไม่ต้องสมัคร ไม่ต้องใส่ API key
```

✅ **ข้อดี**:
- ใช้ได้ทันที
- ไม่ต้องสมัคร
- 25,000 ครั้ง/เดือน (เยอะมาก!)
- รองรับภาษาไทย

❌ **ข้อเสีย**:
- ความแม่นยำไม่เท่า Google
- อาจช้าในช่วงเวลาคับคั่ง

## 📋 วิธีเพิ่ม API Key อื่นๆ

### Google Cloud Vision (ฟรี 1,000 ครั้ง/เดือน)

1. **สมัคร Google Cloud**:
   - ไป [Google Cloud Console](https://console.cloud.google.com/)
   - สร้าง project ใหม่
   - เปิดใช้ Cloud Vision API

2. **ได้ API Key**:
   - APIs & Services > Credentials
   - Create Credentials > API Key
   - Copy API key

3. **แทนที่ในโค้ด**:
```javascript
const GOOGLE_CLOUD_VISION_API_KEY = 'YOUR_FREE_GOOGLE_API_KEY';
// เปลี่ยนเป็น
const GOOGLE_CLOUD_VISION_API_KEY = 'AIzaSyC-your-actual-key-here';
```

### Azure Computer Vision (ฟรี 5,000 ครั้ง/เดือน)

1. **สมัคร Azure**:
   - ไป [Azure Portal](https://portal.azure.com/)
   - สร้าง Computer Vision resource

2. **ได้ API Key**:
   - Keys and Endpoint
   - Copy Key 1 และ Endpoint

3. **แทนที่ในโค้ด**:
```javascript
const AZURE_ENDPOINT = 'https://yourname.cognitiveservices.azure.com/';
const AZURE_API_KEY = 'your-azure-api-key-here';
```

## 💰 เปรียบเทียบแพ็คเกจฟรี

| Service | Free Tier | Accuracy | Thai Support | Setup |
|---------|-----------|----------|--------------|-------|
| **OCR.space** | 25,000/month | 85-90% | ⭐⭐⭐⭐ | ✅ Ready |
| **Google Vision** | 1,000/month | 95-99% | ⭐⭐⭐⭐⭐ | 🔧 Setup needed |
| **Azure Vision** | 5,000/month | 90-95% | ⭐⭐⭐⭐ | 🔧 Setup needed |

## 🔄 ลำดับการทำงาน

แอปจะลองใช้บริการตามลำดับ:

1. **OCR.space** (ฟรี 25,000) ← ลองก่อน
2. **Google Cloud Vision** (ฟรี 1,000) ← ถ้า #1 ล้มเหลว
3. **Azure Computer Vision** (ฟรี 5,000) ← ถ้า #2 ล้มเหลว
4. **Smart OCR Demo** ← ถ้าทุกอย่างล้มเหลว

## 🎯 คำแนะนำการใช้งาน

### สำหรับการทดสอบ:
- ใช้ **OCR.space** (พร้อมใช้ 25,000 ครั้ง)

### สำหรับ Production:
1. **ใช้น้อย (<1,000/เดือน)**: Google Cloud Vision
2. **ใช้ปานกลาง (<5,000/เดือน)**: Azure Computer Vision  
3. **ใช้เยอะ (<25,000/เดือน)**: OCR.space

### สำหรับความแม่นยำสูงสุด:
1. Google Cloud Vision (99% accurate)
2. Azure Computer Vision (95% accurate)
3. OCR.space (90% accurate)

## 🔧 การแก้ปัญหา

### ถ้า OCR.space ช้า:
```javascript
// เพิ่ม timeout และ retry
const response = await fetch('https://api.ocr.space/parse/image', {
  method: 'POST',
  timeout: 15000, // 15 วินาที
  // ...
});
```

### ถ้าต้องการความแม่นยำสูง:
- ใช้ Google Cloud Vision API
- ถ่ายรูปให้ชัดเจน
- ใช้แสงสว่างเพียงพอ

### ถ้าต้องการประหยัด quota:
- Resize ภาพให้เล็กลง (800px)
- ใช้ compression สูงขึ้น
- เก็บ cache ผลลัพธ์

## 📊 การติดตาม Usage

### OCR.space:
- ดูได้ที่ [OCR.space Dashboard](https://ocr.space/ocrapi)

### Google Cloud:
- ดูได้ที่ [Google Cloud Console](https://console.cloud.google.com/apis/api/vision.googleapis.com/quotas)

### Azure:
- ดูได้ที่ [Azure Portal](https://portal.azure.com/) > Your Computer Vision Resource

## 🛡️ ความปลอดภัย

- ✅ ภาพไม่ถูกเก็บบน server
- ✅ ประมวลผลแล้วลบทันที
- ✅ เข้ารหัส HTTPS
- ✅ ไม่ส่งข้อมูลส่วนตัวอื่น

## 🎉 สรุป

**ใช้ได้เลยตอนนี้**: OCR.space (25,000 ครั้งฟรี)
**สำหรับ Production**: เพิ่ม Google Cloud Vision API
**สำหรับความแม่นยำ**: Google Cloud Vision (99%)

---

💡 **Tips**: เริ่มด้วย OCR.space ฟรี 25,000 ครั้ง ถ้าไม่พอค่อยเพิ่ม Google Cloud Vision!
