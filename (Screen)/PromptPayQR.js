import React, { use, useEffect, useState } from "react";
import { View, ActivityIndicator, StyleSheet, Image, TouchableOpacity, Text, ScrollView, Alert } from "react-native";
import axios from "axios";
import ipAddress from "../ipconfig";
import { useCustomer } from './CustomerContext';
import * as FileSystem from 'expo-file-system'; // ใช้ expo-file-system แทน react-native-fs

export default function PromptPayScreen({ route, navigation }) {
  const { Paymenttotal } = route.params;
  const [chargeid, setChargeid] = useState(null);
  const [qrUri, setQrUri] = useState(null);
  const [loading, setLoading] = useState(true);
  const { customerData, updateCustomerData } = useCustomer();
  const [qrpayment, setqrpayment] = useState(Paymenttotal * 100);
  console.log("Paymenttotal", qrpayment);



  useEffect(() => {
    const loadQR = async () => {
      try {
        const response = await axios.post(`${ipAddress}/create-promptpay`, {
          amount: 3000,
          currency: "thb",
          //  return_uri: `${ipAddress}/redirect`,
        });
        setChargeid(response.data.charge_id);
        setQrUri(response.data.qr_code);
        console.log("✅ QR URI:", response.data.qr_code);
      } catch (error) {
        console.error("❌ โหลด QR ล้มเหลว:", error);
      } finally {
        setLoading(false);
      }
    };

    loadQR();

  }, [qrpayment]); // เพิ่ม chargeid ใน dependencies

  useEffect(() => {
    const checkPayment = async () => {
      if (chargeid) {
      try {
        console.log("Charge ID:", chargeid);
        // ทำการตรวจสอบสถานะการชำระเงิน
        const res = await axios.post(`${ipAddress}/check-charge`, {
          charge_id: chargeid,
        });

        if (res.data.success && res.data.status === "successful") {  // ตรวจสอบสถานะ successful
          navigation.navigate("ResultScreen", { success: true });
        }else{
          checkPayment();
        }
      } catch (error) {
        console.error("Error during payment check:", error);
      }
    };

    checkPayment();
  }
  
  }, [chargeid, qrUri]);  // ทำงานเมื่อ `chargeid` หรือ `qrUri` เปลี่ยนแปลง

  // ฟังก์ชันสำหรับบันทึก QR ลงเครื่อง
  const saveQRToFile = async () => {
    try {
      if (!qrUri) {
        Alert.alert('❌ Error', 'QR code is not available');
        return;
      }

      // สร้างพาธที่เก็บไฟล์
      const path = FileSystem.documentDirectory + 'qr_code.png';  // ใช้ documentDirectory ของ Expo

      // บันทึก QR ที่เป็น base64 ลงในไฟล์
      await FileSystem.writeAsStringAsync(path, qrUri.replace('data:image/png;base64,', ''), {
        encoding: FileSystem.EncodingType.Base64
      });

      Alert.alert('✅ Success', 'QR code saved to your device!');
      console.log('QR saved to', path);
    } catch (error) {
      console.error('Error saving QR code:', error);
      Alert.alert('❌ Error', 'Failed to save QR code');
    }
  };

  

  function formatNumberWithComma(value) {
    if (!value) return "0.00";
    const formattedValue = Number(value).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

    console.log("Formatted Value:", formattedValue);
    return formattedValue;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Prompt Pay QR</Text>
      {loading && <ActivityIndicator size="large" color="#000" />}
      {!loading && qrUri && (
        <>
          <Image
            source={{ uri: qrUri }}
            style={styles.qr}
            resizeMode="contain"
          />
          <Text style={styles.text}>฿ {formatNumberWithComma(Paymenttotal)}</Text>
        </>
      )}

      <View style={styles.rowButton}>
        <TouchableOpacity
          style={styles.BackButton}
          onPress={() => navigation.navigate("ResultScreen", { success: true })}  // เรียกใช้ฟังก์ชัน saveQRToFile เมื่อกดปุ่ม
        >
          <Text style={styles.BackButtonText}>Go Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.ActionButton}
          onPress={saveQRToFile}  // ใช้ฟังก์ชันห่อหุ้มเพื่อให้ทำงานเมื่อผู้ใช้กด
        >
          <Text style={styles.searchButtonText}>Save QR</Text>
        </TouchableOpacity>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  qr: {
    width: '100%',
    height: '100%',
    marginTop: -90,
    marginBottom: -80,
  },
  rowButton: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row'
  },
  BackButton: {
    backgroundColor: '#EAEAEA',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    width: '45%',
    marginBottom: 20,
    justifyContent: 'flex-end',
  },
  BackButtonText: {
    color: '#666666',
    fontWeight: 'bold',
    fontSize: 16,
  },
  ActionButton: {
    backgroundColor: '#FD501E',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    width: '45%',
    marginBottom: 20,
    justifyContent: 'flex-end',
  },
  searchButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'left', // Ensure left alignment
    color: '#002348',
    marginBottom: 20,
    marginTop: 50,
    marginLeft: 0, // Optional: ensure no margin if not needed
  },
  text: {
    fontSize: 16,
    color: '#FD501E',
    marginBottom: 20,
    fontWeight: 'bold',
  }
});
