# สรุปการแก้ไข Refund Options

## 🎯 ปัญหา
เมื่อเลือก refund 100% จำนวนเงินคืนแสดงเป็นค่าคงที่ (hardcoded) ไม่ใช่จำนวนเงินจริงจาก `all.totalbooking`

## ✅ การแก้ไข

### ไฟล์ที่แก้ไข
`src/screens/Screen/CustomerInfo.js`

### สิ่งที่เปลี่ยนแปลง

#### 1. เปลี่ยนจาก Array คงที่เป็น Function

**ก่อนแก้ไข:**
```javascript
const refundOptions = [
  { key: '100', title: t('refundOption100_title') || '100% Refund', 
    subtitle: t('refundOption100_subtitle') || 'Refund amount : THB827.52', 
    note: t('refundOption100_note') || 'THB124.13 per person' },
  // ... ตัวเลือกอื่นๆ
];
```

**หลังแก้ไข:**
```javascript
const getRefundOptions = (totalbooking, symbol) => {
  const total = parseFloat(totalbooking) || 0;
  const totalPassengers = (customerData.adult || 0) + (customerData.child || 0) + (customerData.infant || 0);
  
  // คำนวณจำนวนเงินคืนสำหรับแต่ละตัวเลือก
  const refund100 = total;        // 100% ของ totalbooking
  const refund70 = total * 0.7;   // 70% ของ totalbooking
  const refund50 = total * 0.5;   // 50% ของ totalbooking
  
  // คำนวณต่อคน
  const perPerson100 = totalPassengers > 0 ? (refund100 / totalPassengers) : 0;
  const perPerson70 = totalPassengers > 0 ? (refund70 / totalPassengers) : 0;
  const perPerson50 = totalPassengers > 0 ? (refund50 / totalPassengers) : 0;
  
  return [
    { 
      key: '100', 
      title: t('refundOption100_title') || '100% Refund', 
      subtitle: `${t('refundAmount') || 'Refund amount'} : ${symbol} ${formatNumberWithComma(refund100.toFixed(2))}`, 
      note: `${symbol} ${formatNumberWithComma(perPerson100.toFixed(2))} ${t('perPerson') || 'per person'}` 
    },
    // ... ตัวเลือกอื่นๆ
  ];
};
```

#### 2. เรียกใช้ Function ในส่วน Render

**ก่อนแก้ไข:**
```javascript
{Array.isArray(PriceDepart) && PriceDepart.map((all, index) => (
  <View key={index}>
    {refundOptions.map(opt => (
      // ... แสดง options
    ))}
  </View>
))}
```

**หลังแก้ไข:**
```javascript
{Array.isArray(PriceDepart) && PriceDepart.map((all, index) => {
  // สร้าง refund options ด้วยจำนวนเงินที่คำนวณจาก totalbooking
  const refundOptions = getRefundOptions(all.totalbooking, customerData.symbol);
  
  return (
    <View key={index}>
      {refundOptions.map(opt => (
        // ... แสดง options
      ))}
    </View>
  );
})}
```

## 📊 ผลลัพธ์

### เดิม (Hardcoded)
- **100% Refund:** แสดง "Refund amount : THB827.52" เสมอ
- **70% Refund:** แสดง "Refund amount : THB579.26" เสมอ
- **50% Refund:** แสดง "Refund amount : THB413.76" เสมอ

### ใหม่ (Dynamic)
- **100% Refund:** แสดงจำนวนเงินจาก `all.totalbooking` (100%)
- **70% Refund:** แสดงจำนวนเงินจาก `all.totalbooking * 0.7` (70%)
- **50% Refund:** แสดงจำนวนเงินจาก `all.totalbooking * 0.5` (50%)

### ตัวอย่าง
หาก `all.totalbooking = 1000` บาท และมีผู้โดยสาร 2 คน:

- **100% Refund:**
  - จำนวนเงินคืน: THB 1,000.00
  - ต่อคน: THB 500.00 per person

- **70% Refund:**
  - จำนวนเงินคืน: THB 700.00
  - ต่อคน: THB 350.00 per person

- **50% Refund:**
  - จำนวนเงินคืน: THB 500.00
  - ต่อคน: THB 250.00 per person

## 🎨 คุณสมบัติ

✅ **คำนวณจำนวนเงินคืนอัตโนมัติ** จาก `all.totalbooking`  
✅ **แสดงจำนวนเงินต่อคน** โดยหารด้วยจำนวนผู้โดยสารทั้งหมด  
✅ **รองรับ Multi-language** ใช้ translation key สำหรับ label  
✅ **จัดรูปแบบตัวเลข** ใช้ `formatNumberWithComma()` เพื่อให้อ่านง่าย  
✅ **Dynamic Symbol** แสดงสกุลเงินตาม `customerData.symbol`

## ⚠️ หมายเหตุ

1. **ตรวจสอบจำนวนผู้โดยสาร:** ป้องกันการหารด้วย 0 โดยตรวจสอบ `totalPassengers > 0`
2. **Format ตัวเลข:** ใช้ `.toFixed(2)` เพื่อแสดงทศนิยม 2 ตำแหน่งเสมอ
3. **Parse Number:** ใช้ `parseFloat()` และ `|| 0` เพื่อป้องกัน NaN

## 🔍 การทดสอบ

เมื่อทดสอบควรตรวจสอบ:
1. ✅ จำนวนเงินคืนแสดงถูกต้องตาม totalbooking
2. ✅ จำนวนเงินต่อคนคำนวณถูกต้อง
3. ✅ รูปแบบตัวเลขมี comma คั่น (เช่น 1,000.00)
4. ✅ สกุลเงินแสดงถูกต้อง
5. ✅ ทำงานได้ทั้งภาษาไทยและอังกฤษ

---

**วันที่แก้ไข:** 7 ตุลาคม 2025  
**ไฟล์ที่แก้ไข:** `src/screens/Screen/CustomerInfo.js`  
**สถานะ:** ✅ แก้ไขสำเร็จ
