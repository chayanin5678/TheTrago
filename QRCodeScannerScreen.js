import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';

const QRCodeScannerScreen = ({ navigation }) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = ({ data }) => {
    setScanned(true);
    Alert.alert('QR code', data, [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>กำลังขออนุญาตกล้อง...</Text>
      </View>
    );
  }
  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>ไม่ได้รับอนุญาตให้ใช้กล้อง</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.captureButton}>
          <Text style={styles.buttonText}>ย้อนกลับ</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>{'‹'}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>ถ่ายภาพ QR Code</Text>
      </View>
      <View style={styles.cameraContainer}>
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={StyleSheet.absoluteFillObject}
        />
        {scanned && (
          <Text style={styles.scanCompleteText}>
            Scan complete
          </Text>
        )}
        {/* Overlay - single scan area centered */}
        <View style={styles.overlay} pointerEvents="none">
          <View style={styles.centeredOverlay}>
            <View style={styles.scanArea} />
          </View>
        </View>
        <View style={styles.scanGuideContainerCentered} pointerEvents="none">
          <Text style={styles.scanGuideText}>กรุณาวาง QR ให้อยู่ในกรอบแล้วกดปุ่มถ่ายภาพ</Text>
        </View>
      </View>
      <View style={styles.buttonRowCentered}>
        <TouchableOpacity onPress={() => setScanned(false)} style={styles.captureButton}>
          <Text style={styles.buttonText}>ถ่ายภาพใหม่</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(0,0,0,0.7)',
    zIndex: 2,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  backButtonText: { color: '#fff', fontSize: 28, fontWeight: 'bold' },
  title: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  cameraContainer: {
    flex: 1,
    width: '100%',
    alignSelf: 'center',
    position: 'relative',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  centeredOverlay: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  scanArea: {
    width: 240,
    height: 240,
    borderColor: '#FD501E',
    borderRadius: 16,
    borderWidth: 3,
    backgroundColor: 'transparent',
  },
  scanGuideContainerCentered: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -120 }, { translateY: 140 }],
    width: 240,
    alignItems: 'center',
    zIndex: 3,
  },
  buttonRowCentered: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 24,
  },
  scanGuideText: {
    color: '#fff',
    fontSize: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 16,
    textAlign: 'center',
  },
  captureButton: {
    backgroundColor: '#FD501E',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 32,
    alignSelf: 'center',
    marginVertical: 24,
  },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  scanCompleteText: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    color: '#FD501E',
    fontWeight: 'bold',
  },
});

export default QRCodeScannerScreen;
