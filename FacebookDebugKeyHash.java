// Facebook Debug Key Hash Generator
// วิธีใช้: javac FacebookKeyHashGenerator.java && java FacebookKeyHashGenerator

import java.security.MessageDigest;
import java.util.Base64;

public class FacebookDebugKeyHash {
    public static void main(String[] args) {
        // Debug Key SHA1 (Android debug.keystore default)
        // SHA1: 58:E1:C5:E7:11:15:FC:28:D7:79:08:4A:EB:C9:95:A2:3B:DC:41:54
        String debugSha1 = "58E1C5E7111FC28D77904AEBC995A23BDCE4154";
        
        try {
            byte[] bytes = hexStringToByteArray(debugSha1);
            String keyHash = Base64.getEncoder().encodeToString(bytes);
            System.out.println("Debug Key Hash: " + keyHash);
            System.out.println("เอาค่านี้ไปใส่ใน Facebook Developer Console");
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
