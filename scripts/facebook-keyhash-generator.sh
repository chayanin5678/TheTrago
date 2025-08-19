#!/bin/bash
# Facebook Key Hash Generator Script

echo "=== Facebook Key Hash Generator ==="
echo ""

# สำหรับ Debug Key (ใช้ได้ทันที)
echo "1. Debug Key Hash:"
echo "   Command: keytool -exportcert -alias androiddebugkey -keystore debug.keystore | openssl sha1 -binary | openssl base64"
echo "   Password: android"
echo ""

# สำหรับ Release Key 
echo "2. Release Key Hash:"
echo "   Command: keytool -exportcert -alias my-key-alias -keystore my-release-key.keystore | openssl sha1 -binary | openssl base64"
echo "   (ใช้ password ของ release keystore)"
echo ""

echo "=== วิธีใช้ (Windows) ==="
echo "1. เปิด Command Prompt ใน folder android/app"
echo "2. รันคำสั่ง:"
echo "   keytool -exportcert -alias androiddebugkey -keystore debug.keystore -storepass android -keypass android | openssl sha1 -binary | openssl base64"
echo ""
echo "3. คัดลอก Key Hash ที่ได้ไปใส่ใน Facebook Developer Console"
echo "   ที่ Settings > Basic > Key Hashes"
echo ""

echo "=== อีกวิธี (ง่ายกว่า) ==="
echo "ใช้ React Native command:"
echo "cd android && ./gradlew signingReport"
echo "แล้วเอา SHA1 ไปแปลงเป็น Facebook Key Hash ด้วย online tool"
echo ""

echo "=== หรือใช้ Java Code ==="
cat << 'EOF'
// เพิ่มโค้ดนี้ใน MainActivity.java เพื่อ print Key Hash
try {
    PackageInfo info = getPackageManager().getPackageInfo(
            "com.thetrago.android",
            PackageManager.GET_SIGNATURES);
    for (Signature signature : info.signatures) {
        MessageDigest md = MessageDigest.getInstance("SHA");
        md.update(signature.toByteArray());
        Log.d("KeyHash:", Base64.encodeToString(md.digest(), Base64.DEFAULT));
    }
} catch (PackageManager.NameNotFoundException e) {
} catch (NoSuchAlgorithmException e) {
}
EOF
