
import React, { useState , useEffect} from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Tesseract from 'tesseract.js'; // ติดตั้ง tesseract.js
import * as ImageManipulator from 'expo-image-manipulator';


const IDCardCameraScreen = ({ navigation }) => {
  const [photo, setPhoto] = useState(null); // เก็บรูปที่ถ่าย
  const [ocrText, setOcrText] = useState(''); // เก็บข้อความ OCR

  // ฟังก์ชันเปิดกล้องถ่ายรูป
  const pickImage = async () => {
    let permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (permissionResult.granted === false) {
      alert("Permission to access camera is required!");
      return;
    }

  
    // เปิดกล้องถ่ายรูป
    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.7,
    });
  
    // ตรวจสอบว่าได้รูปมาแล้วหรือไม่
    console.log("📷 ผลลัพธ์จากการถ่ายรูป:", result);  // Log ผลลัพธ์ทั้งหมดจาก ImagePicker
  
    if (!result.canceled) {
      setPhoto(result.assets[0].uri); // ใช้ result.assets[0].uri แทน result.uri
      recognizeText(result.assets[0].uri); // เริ่มการแปลง OCR หลังจากถ่ายรูป
      console.log("📷 รูปที่ถ่ายได้ URI:", result.assets[0].uri); // Log URI ของภาพที่ถ่าย
    }
  };
  


  // ฟังก์ชันการใช้ Tesseract.js เพื่อแปลงข้อความจากภาพ
  const recognizeText = async (uri) => {
    Tesseract.recognize(
      uri, // URI ของภาพที่ถ่าย
      'tha', // ตั้งค่าภาษาเป็นภาษาไทย
      {
        langPath: 'assets/tessdata', // กำหนดที่อยู่ของไฟล์ภาษาไทย (ไฟล์ tha.traineddata)
        logger: (m) => console.log(m), // log ข้อมูลระหว่างการแปลง OCR
      }
    ).then(({ data: { text } }) => {
      setOcrText(text); // เก็บข้อความที่แปลงได้จาก OCR
    });
  };

  // ส่งข้อมูลไปยังหน้าจอ OCRResultScreen
  const navigateToOCRResultScreen = () => {
    navigation.navigate('OCRResultScreen', { photo, ocrText });
  };


  useEffect(() => {
    if (photo) console.log("📷 รูปที่ถ่าย:", photo);
  }, [photo]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Take a picture of your ID card</Text>

      <TouchableOpacity onPress={pickImage} style={styles.captureButton}>
        <Text style={styles.buttonText}>Take Picture</Text>
      </TouchableOpacity>

      {/* แสดงภาพที่ถ่าย */}
      {photo && (
        <View style={styles.previewContainer}>
          <Text>Preview</Text>
          <Image source={{ uri: photo }} style={styles.previewImage} />
        </View>
      )}

      {/* แสดงข้อความที่แปลงได้จาก OCR */}
      {ocrText && (
        <View style={styles.ocrContainer}>
          <Text style={styles.ocrText}>OCR Result:</Text>
          <Text style={styles.ocrResult}>{ocrText}</Text>
        </View>
      )}

      {/* ปุ่มส่งข้อมูลไปยังหน้า OCRResultScreen */}
      <TouchableOpacity onPress={navigateToOCRResultScreen} style={styles.actionButton}>
        <Text style={styles.buttonText}>Go to OCR Result</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  title: { color: '#fff', fontSize: 20, marginBottom: 20 },
  captureButton: {
    backgroundColor: '#FD501E',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginBottom: 20,
  },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  previewContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  ocrContainer: { marginTop: 20, padding: 10, backgroundColor: '#fff', borderRadius: 8 },
  ocrText: { fontSize: 18, fontWeight: 'bold' },
  ocrResult: { fontSize: 16, marginTop: 10 },
  actionButton: {
    backgroundColor: '#FD501E',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginTop: 20,
  },

  previewImage: { 
    width: '100%',  // กำหนดความกว้าง
    aspectRatio: 16 / 9,  // กำหนดอัตราส่วน 16:9
    resizeMode: 'contain',  // คงอัตราส่วนของภาพ
    marginVertical: 10 
  },
});


export default IDCardCameraScreen;
