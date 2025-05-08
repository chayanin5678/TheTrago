import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

const OCRResultScreen = ({ route }) => {
  const { photo, ocrText } = route.params; // รับข้อมูลจากหน้า IDCardCameraScreen

  return (
    <View style={styles.container}>
      <Text style={styles.title}>OCR Result</Text>

      {/* แสดงรูปที่ถ่าย */}
      {photo && (
        <View style={styles.previewContainer}>
          <Image source={{ uri: photo }} style={styles.previewImage} />
        </View>
      )}

      {/* แสดงข้อความ OCR */}
      {ocrText && (
        <View style={styles.ocrContainer}>
          <Text style={styles.ocrText}>OCR Text:</Text>
          <Text style={styles.ocrResult}>{ocrText}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  previewContainer: { marginBottom: 20 },
  previewImage: { width: 200, height: 200, resizeMode: 'contain' },
  ocrContainer: { padding: 10, backgroundColor: '#f0f0f0', borderRadius: 8 },
  ocrText: { fontSize: 18, fontWeight: 'bold' },
  ocrResult: { fontSize: 16, marginTop: 10 },
});

export default OCRResultScreen;
