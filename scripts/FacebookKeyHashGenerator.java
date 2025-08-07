import java.security.MessageDigest;
import java.util.Base64;

public class FacebookKeyHashGenerator {
    public static void main(String[] args) {
        // ใส่ SHA1 fingerprint ที่ได้จาก gradlew signingReport
        // แทนที่ YOUR_SHA1_HERE ด้วย SHA1 จริง (ไม่มี colon)
        String sha1 = "YOUR_SHA1_HERE"; // เช่น "1234567890ABCDEF1234567890ABCDEF12345678"
        
        try {
            byte[] bytes = hexStringToByteArray(sha1);
            String keyHash = Base64.getEncoder().encodeToString(bytes);
            System.out.println("Facebook Key Hash: " + keyHash);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
    
    public static byte[] hexStringToByteArray(String s) {
        int len = s.length();
        byte[] data = new byte[len / 2];
        for (int i = 0; i < len; i += 2) {
            data[i / 2] = (byte) ((Character.digit(s.charAt(i), 16) << 4)
                                 + Character.digit(s.charAt(i+1), 16));
        }
        return data;
    }
}
