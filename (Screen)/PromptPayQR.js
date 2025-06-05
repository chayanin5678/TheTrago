import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, StyleSheet, Image, TouchableOpacity, Text, ScrollView, Alert } from "react-native";
import axios from "axios";
import ipAddress from "../ipconfig";
import { useCustomer } from './CustomerContext';
import * as FileSystem from 'expo-file-system';
import moment from "moment-timezone";

export default function PromptPayScreen({ route, navigation }) {
  const { Paymenttotal ,selectedOption} = route.params;
  const [chargeid, setChargeid] = useState(null);
  const [qrUri, setQrUri] = useState(null);
  const [loading, setLoading] = useState(true);
  const { customerData, updateCustomerData } = useCustomer();
  const [qrpayment, setqrpayment] = useState(Paymenttotal * 100);
  const [bookingcode, setBookingcode] = useState([]);
  const [bookingcodeGroup, setBookingcodeGroup] = useState([]);
  const [intervalId, setIntervalId] = useState(null);
  let booking_code = bookingcode.length > 0 
  ? "TG" + (parseInt(bookingcode[0].booking_code) + 1) 
  : " "; // ใช้ "N/A" ถ้าไม่มี booking code
let booking_codeGroup = bookingcodeGroup.length > 0
  ? "TG" + (parseInt(bookingcodeGroup[0].booking_codegroup) + 1)
  : " "; // ใช้ "N/A" แทนค่าที่ไม่มี

  

  useEffect(() => {
   

  }, [bookingcode]);

  useEffect(() => {
    const loadAll = async () => {
      try {
        const response = await axios.post(`${ipAddress}/create-promptpay`, {
          amount: parseFloat(qrpayment),
          currency: "thb",
        });
  
        setChargeid(response.data.charge_id);
        setQrUri(response.data.qr_code);
  
        // ✅ โหลด booking code
        const res1 = await fetch(`${ipAddress}/bookingcode`);
        const data1 = await res1.json();
        const bookingCodeNumber = parseInt(data1?.data?.[0]?.booking_code || "0") + 1;
        const newBookingCode = "TG" + bookingCodeNumber;
        booking_code = newBookingCode;
  
        let newGroupBookingCode = null;
        if (customerData.roud === 2) {
          const res2 = await fetch(`${ipAddress}/bookingcodegroup`);
          const data2 = await res2.json();
          const bookingGroupCodeNumber = parseInt(data2?.data?.[0]?.booking_codegroup || "0") + 1;
           newGroupBookingCode = "TG" + bookingGroupCodeNumber;
        }
  
        // ✅ สร้าง booking โดยใช้ booking code ที่ได้จริง
        await createBooking(response.data.charge_id, newBookingCode, newGroupBookingCode);
        await createPassenger(newBookingCode);
       
  
      } catch (error) {
        Alert.alert('Failed to create QR code or booking');
      } finally {
        setLoading(false);
      }
    };
  
    loadAll();
  }, [qrpayment]);
    // เพิ่ม qrpayment เพื่อให้ `loadQR` ทำงานเมื่อ qrpayment เปลี่ยนแปลง

  useEffect(() => {
    let localIntervalId = null;
    const checkPayment = async () => {
      try {
        console.log("Charge ID:", chargeid);
        // ทำการตรวจสอบสถานะการชำระเงิน
        const res = await axios.post(`${ipAddress}/check-charge`, {
          charge_id: chargeid,
        });

        console.log("Payment Status Response:", res.data);

        if (res.data.success && res.data.status === "successful") {
          updatestatus(booking_code); // อัปเดตสถานะการชำระเงิน
          navigation.navigate("ResultScreen", { success: true });
          if (localIntervalId) clearInterval(localIntervalId); // หยุด interval ทันที
        }
      } catch (error) {
        console.error("Error during payment check:", error);
      }
    };

    if (chargeid) {
      localIntervalId = setInterval(() => {
        checkPayment();
      }, 2000);
      setIntervalId(localIntervalId); // เก็บ id ไว้ใน state
      // cleanup
      return () => {
        if (localIntervalId) clearInterval(localIntervalId);
      };
    }
  }, [chargeid]);  // ทำงานเมื่อ `chargeid` เปลี่ยนแปลง

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

  
  const createBooking = async (paymentCode, bookingCode, groupBookingCode) => {
    try {
      console.log("📌 Creating Booking with:", bookingCode, groupBookingCode);
      await axios.post(`${ipAddress}/booking`, {
        md_booking_code: bookingCode,
        md_booking_groupcode: groupBookingCode,
        md_booking_paymentid: paymentCode,
        md_booking_companyid: customerData.companyDepartId,
        md_booking_boattypeid: customerData.boatypeid,
        md_booking_country: customerData.country,
        md_booking_countrycode: customerData.countrycode,
        md_booking_round: customerData.roud,
        md_booking_timetableid: customerData.timeTableDepartId,
        md_booking_tel: customerData.tel,
        md_booking_whatsapp: 0,
        md_booking_email: customerData.email,
        md_booking_price: customerData.subtotalDepart,
        md_booking_total: Paymenttotal,
        md_booking_refund: 0,
        md_booking_refundprice: 0,
        md_booking_credit: 0,
        md_booking_currency: customerData.currency,
        md_booking_net: customerData.netDepart,
        md_booking_adult: customerData.adult,
        md_booking_child: customerData.child,
        md_booking_infant: customerData.infant,
        md_booking_day: customerData.day,
        md_booking_month: customerData.month,
        md_booking_year: customerData.year,
        md_booking_time: customerData.time,
        md_booking_date: moment().tz("Asia/Bangkok").format("YYYY-MM-DD HH:mm:ss"),
        md_booking_departdate: customerData.departdate,
        md_booking_departtime: customerData.departtime,
        md_booking_statuspayment: 0,
        md_booking_status: 0,
        md_booking_pay: customerData.paymenttype,
        md_booking_payfee: customerData.paymentfee,
        md_booking_lang: 'en',
        md_booking_from: 0,
        md_booking_device: 2,
        md_booking_promoprice: 0,
        md_booking_credate: moment().tz("Asia/Bangkok").format("YYYY-MM-DD HH:mm:ss"),
        md_booking_updatedate: moment().tz("Asia/Bangkok").format("YYYY-MM-DD HH:mm:ss"),
      });
  
      console.log("✅ Booking created successfully");
    } catch (error) {
      console.error("❌ Error submitting booking:", error);
    }
  };

  const createPassenger = async (bookingCode) => {
    try {
      console.log("📌 Creating Booking with:", bookingCode);
      await axios.post(`${ipAddress}/passenger`, {
        md_passenger_bookingcode : bookingCode, 
        md_passenger_prefix : customerData.selectedTitle,
        md_passenger_fname : customerData.Firstname, 
        md_passenger_lname : customerData.Lastname,
        md_passenger_idtype : 0, 
        md_passenger_nationality : customerData.country,
    
      });
  
      console.log("✅ Booking created successfully");
    } catch (error) {
      console.error("❌ Error submitting booking:", error);
    }
  };

  
  const updatestatus = async (bookingCode) => {
    try {
      console.log("📌 Creating Booking with:", bookingCode);
      await axios.post(`${ipAddress}/statuspayment`, {
        md_booking_code : bookingCode, 
    
      });
  
      console.log("✅ Booking update status successfully");
    } catch (error) {
      console.error("❌ Error submitting booking:", error);
    }
  };
  
  
  const handlePress = async () => {
    if (intervalId) {
      clearInterval(intervalId); // หยุด interval ทันทีเมื่อกด Paid
    }
    let paid = false;
    try {
      // ตรวจสอบสถานะล่าสุดก่อน
      const res = await axios.post(`${ipAddress}/check-charge`, {
        charge_id: chargeid,
      });
      if (res.data.success && res.data.status === "successful") {
        paid = true;
        await updatestatus(booking_code);
      }
    } catch (e) {
      console.error('Error checking payment status on manual paid:', e);
    }
    navigation.navigate('ResultScreen', { success: paid });
  };

  

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Prompt Pay QR</Text>
      {loading ? (
        <>
          <View style={styles.skeletonContainer}>
            <View style={styles.skeletonQR} />
            <View style={styles.skeletonAmount} />
          </View>
          <View style={styles.skeletonButtonRow}>
            <View style={styles.skeletonButton} />
            <View style={styles.skeletonButton} />
          </View>
        </>
      ) : (
        <>
          {qrUri && (
            <>
              <Image
                source={{ uri: qrUri }}
                style={styles.qr}
                resizeMode="contain"
              />
              <Text style={styles.text}>฿ {Paymenttotal}</Text>
            </>
          )}
          <View style={styles.rowButton}>
            <TouchableOpacity
              style={styles.BackButton}
              onPress={saveQRToFile}
            >
              <Text style={styles.BackButtonText}>Save QR</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.ActionButton}
              onPress={handlePress}
            >
              <Text style={styles.searchButtonText}>Paid</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
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
  },
  // Skeleton loader styles
  skeletonContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 50,
    marginBottom: 30,
    justifyContent: 'flex-start',
  },
  skeletonQR: {
    width: 300,
    height: 300,
    backgroundColor: '#eee',
    borderRadius: 24,
    marginBottom: 32,
  },
  skeletonAmount: {
    width: 140,
    height: 32,
    backgroundColor: '#e0e0e0',
    borderRadius: 12,
    marginBottom: 40,
  },
  skeletonButtonRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingHorizontal: 0,
  },
  skeletonButton: {
    width: '48%',
    height: 60,
    backgroundColor: '#e0e0e0',
    borderRadius: 12,
  },
});
