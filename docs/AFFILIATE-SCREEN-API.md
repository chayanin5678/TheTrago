# Affiliate Screen API Integration

## ✅ สิ่งที่แก้ไขแล้ว

### 1. CSS Separation
- แยก CSS ออกจาก `AffiliateScreen.js` ไปยัง `src/styles/CSS/AffiliateScreenStyles.js`
- ย้าย styles ทั้งหมด 270+ บรรทัด
- เพิ่ม styles สำหรับ loading และ error states

### 2. API Integration
- เปลี่ยนจาก mock data เป็น real API calls
- เพิ่ม API endpoint: `GET /affiliate-stats`
- เพิ่ม error handling และ timeout (10 วินาที)
- เพิ่ม fallback data เมื่อ API ไม่พร้อม

### 3. UI Improvements
- เพิ่ม Loading indicator พร้อม text
- เพิ่ม Error state พร้อม retry button  
- เพิ่ม Pull-to-refresh functionality
- เพิ่ม RefreshControl ใน ScrollView

## 🔌 API Endpoints ที่ใช้

### GET /affiliate-stats
```json
Response:
{
  "success": true,
  "data": {
    "upcoming_bookings": 3,
    "cancelled_bookings": 1, 
    "completed_bookings": 12,
    "total_referrals": 16,
    "total_earnings": 2450.00
  }
}
```

### Authentication
- ใช้ Bearer Token จาก SecureStore
- Header: `Authorization: Bearer <token>`

## 📱 Features

### Loading States
- แสดง ActivityIndicator เมื่อโหลดข้อมูล
- แสดงข้อความ "Loading data..."
- ซ่อน content จนกว่าข้อมูลจะโหลดเสร็จ

### Error Handling  
- จับ error จาก API calls
- แสดง error message ให้ user
- มีปุ่ม "Try Again" สำหรับ retry
- Fallback เป็น mock data ถ้า API timeout

### Refresh Functionality
- Pull down เพื่อ refresh ข้อมูล  
- RefreshControl แสดงสี orange (#FD501E)
- รีเฟรช data ทั้งหมด (profile + affiliate stats)

## 🎨 Styling
- ใช้ responsive design (wp/hp)
- Consistent color scheme
- Loading และ error states มี styling แยก
- Modern UI components

## 🔧 Backend API Example
- สร้าง `backend-example/affiliate-api.js`
- มี sample endpoints สำหรับ affiliate system
- Database schema ตัวอย่าง
- Authentication middleware

## 🚀 Next Steps
1. ติดตั้ง backend API ตาม example ที่ให้ไว้
2. เชื่อมต่อ database สำหรับเก็บ affiliate data
3. Test API endpoints
4. ปรับแต่ง UI ตามต้องการ

## 📊 Data Flow
```
AffiliateScreen -> loadAffiliateData() -> API Call -> Update State -> Render UI
                                      -> Error -> Show Error UI
                                      -> Timeout -> Use Fallback Data
```
