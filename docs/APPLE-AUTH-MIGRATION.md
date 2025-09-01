# Backend API Changes for @invertase/react-native-apple-authentication

## สิ่งที่เปลี่ยนแปลงจาก expo-apple-authentication เป็น @invertase/react-native-apple-authentication

### 1. ข้อมูลที่ส่งมาจาก Client
```javascript
// เดิม (expo-apple-authentication)
{
  user: "000535.e59faa0c9e474736...",
  fullName: { givenName: "John", familyName: "Doe" },
  email: "user@privaterelay.appleid.com",
  identityToken: "eyJraWQi...",
  authorizationCode: "c2bbd95f..."
}

// ใหม่ (@invertase/react-native-apple-authentication)
{
  user: "000535.e59faa0c9e474736...",  // Same as providerId
  fullName: { givenName: "John", familyName: "Doe" },
  email: "user@privaterelay.appleid.com",
  identityToken: "eyJraWQi...",
  authorizationCode: "c2bbd95f...",
  nonce: "randomString"  // เพิ่มเติม
}
```

### 2. การตรวจสอบ Identity Token
ใน backend ต้องแก้ไข `verifyAppleIdentityToken()` function:

```javascript
// เดิม - ใช้ expo-apple-authentication format
async function verifyAppleIdentityToken(identityToken, audience) {
  // audience จาก expo มักจะเป็น "host.exp.Exponent"
}

// ใหม่ - ใช้ @invertase/react-native-apple-authentication format  
async function verifyAppleIdentityToken(identityToken, audience) {
  // audience ควรจะเป็น bundle ID ของ app จริง
  // เช่น "com.yourcompany.thetrago"
}
```

### 3. สิ่งที่ต้องแก้ใน Backend

#### 3.1 อัพเดท Dependencies
```bash
npm install jwks-rsa jsonwebtoken
```

#### 3.2 แก้ไข API Endpoint
```javascript
app.post('/AppApi/social-login', async (req, res) => {
  const { 
    provider, 
    providerId, 
    email, 
    identityToken, 
    authorizationCode,
    audience,  // เพิ่มฟิลด์นี้
    aud,       // เพิ่มฟิลด์นี้ (fallback)
    nonce      // เพิ่มฟิลด์นี้
  } = req.body;

  if (provider === 'apple') {
    // ใช้ audience หรือ aud สำหรับ verify token
    const audienceToVerify = audience || aud;
    
    try {
      const verifiedPayload = await verifyAppleIdentityToken(identityToken, audienceToVerify);
      // Process verified user data
    } catch (error) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid Apple identity token',
        detail: error.message
      });
    }
  }
});
```

### 4. Configuration Changes

#### 4.1 iOS Bundle ID
ตรวจสอบให้แน่ใจว่า `audience` ที่ส่งมาจาก client ตรงกับ Bundle ID ใน Apple Developer Console

#### 4.2 Apple Services ID
ถ้าใช้ web app ด้วย ต้องตั้งค่า Services ID ใน Apple Developer Console

### 5. Error Handling Improvements

```javascript
// เพิ่ม error handling ที่ดีขึ้น
try {
  const verifiedPayload = await verifyAppleIdentityToken(identityToken, audience);
} catch (error) {
  console.error('Apple verification error:', {
    error: error.message,
    audience,
    tokenPreview: identityToken?.substring(0, 50) + '...'
  });
  
  return res.status(400).json({
    status: 'error',
    message: 'Apple token verification failed',
    detail: error.message
  });
}
```

### 6. Testing

1. ตรวจสอบ logs ว่า `audience` field มีค่าถูกต้อง
2. ทดสอบการ verify token กับ Apple's JWKS endpoint
3. ตรวจสอบ error responses ที่ชัดเจน

### 7. ข้อดีของการเปลี่ยนแปลง

- **ความเสถียร**: ใช้ native library แทน Expo wrapper
- **Performance**: ดีกว่าใน production builds
- **Features**: รองรับ Apple Sign-In features ครบถ้วนกว่า
- **Error Handling**: ได้ error messages ที่ชัดเจนกว่า

### 8. ข้อควรระวัง

- ต้อง rebuild app (ไม่สามารถใช้ใน Expo Go)
- ต้องตั้งค่า iOS project ใหม่
- Bundle ID ต้องตรงกับที่ register ใน Apple Developer Console
