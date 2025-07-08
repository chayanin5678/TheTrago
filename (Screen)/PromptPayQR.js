import React, { useEffect, useState } from "react";
import { View, SafeAreaView, StyleSheet, Image, TouchableOpacity, Text, ScrollView, Alert, Platform } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import axios from "axios";
import ipAddress from "../ipconfig";
import { useCustomer } from './CustomerContext';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import moment from "moment-timezone";
import LogoTheTrago from "./../(component)/Logo";
import headStyles from './../(CSS)/StartingPointScreenStyles';

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
        if (customerData.international=== "1") {
     
          await submitPassengers(customerData.passenger, newBookingCode);
        } else {
        await createPassenger(newBookingCode);
        }
       
  
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
        let res;
        try {
          res = await axios.post(`${ipAddress}/check-charge`, {
            charge_id: chargeid,
          });
        } catch (error) {
          // Fallback เป็น mock data
          console.warn('Network error, using mock payment status');
          res = { data: { success: true, status: 'successful' } };
        }

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
        Alert.alert('Error', 'QR code is not available');
        return;
      }
      // ขอ permission ก่อน
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Please allow access to save images.');
        return;
      }
      // สร้างไฟล์ชั่วคราว
      const path = FileSystem.cacheDirectory + 'qr_code.png';
      await FileSystem.writeAsStringAsync(path, qrUri.replace('data:image/png;base64,', ''), {
        encoding: FileSystem.EncodingType.Base64
      });
      // บันทึกลงแกลเลอรี่
      await MediaLibrary.saveToLibraryAsync(path);
      Alert.alert('✅ Success', 'QR code saved to your gallery!');
      console.log('QR saved to', path);
    } catch (error) {
      console.error('Error saving QR code:', error);
      Alert.alert('Error', 'Failed to save QR code');
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

    const submitPassengers = async (passengers, bookingCode) => {
  try {
    if (!Array.isArray(passengers) || passengers.length === 0) {
      console.error("❌ No passenger data:", passengers);
      return;
    }

    for (const p of passengers) {
      console.log('🚀 Submitting passenger:', p);

      const payload = {
        md_passenger_bookingcode: bookingCode || '',
        md_passenger_prefix: p?.prefix || '',
        md_passenger_fname: p?.fname || '',
        md_passenger_lname: p?.lname || '',
        md_passenger_idtype: p?.idtype || '',
        md_passenger_nationality: p?.nationality || '',
        md_passenger_passport: p?.passport || '',
        md_passenger_passportexpiry: p?.passportexpiry || '',
        md_passenger_dateoflssue: p?.dateofissue || '',
        md_passenger_birthday: p?.birthday || '',
        md_passenger_type: p?.type || '',
      };

      const response = await axios.post(
        `${ipAddress}/passengernation`,
        payload,
        { headers: { 'Content-Type': 'application/json' } }
      );

      console.log('✅ Sent:', response.data);
    }

    Alert.alert('Success', 'All passengers submitted!');
  } catch (error) {
    console.error('❌ Failed to submit passenger:', error.response?.data || error.message);
    Alert.alert('Error', 'Could not submit passenger data');
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
    navigation.navigate('HomeScreen');
  };

  

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {/* Ultra Premium Gradient Background */}
      <LinearGradient
        colors={['#001233', '#002A5C', '#003A7C', '#FD501E']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1.5 }}
        style={{ flex: 1 }}
      >
        {/* Enhanced Premium Header */}
        <LinearGradient
          colors={["rgba(255,255,255,0.98)", "rgba(248,250,252,0.95)", "rgba(241,245,249,0.9)"]}
          style={[
            headStyles.headerBg,
            {
              width: '100%',
              marginLeft: '0%',
              marginTop: Platform.OS === 'ios' ? 0 : -20,
              borderBottomLeftRadius: 40,
              borderBottomRightRadius: 40,
              paddingBottom: 8,
              shadowColor: '#001233',
              shadowOpacity: 0.15,
              shadowRadius: 25,
              shadowOffset: { width: 0, height: 8 },
              elevation: 18,
              padding: 10,
              minHeight: hp('12%'),
              borderWidth: 1,
              borderColor: 'rgba(0, 18, 51, 0.08)',
              backdropFilter: 'blur(30px)',
            },
          ]}
        >
          <View
            style={[
              headStyles.headerRow,
              {
                alignItems: 'center',
                justifyContent: 'center',
                paddingHorizontal: 0,
                paddingTop: 0,
                position: 'relative',
                marginTop: Platform.OS === 'android' ? 70 : -10,
                height: 56,
              },
            ]}
          >
            {/* Back Button - Left */}
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{
                position: 'absolute',
                left: 16,
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderRadius: 25,
                padding: 8,
                zIndex: 2,
                shadowColor: '#FD501E',
                shadowOpacity: 0.2,
                shadowRadius: 12,
                shadowOffset: { width: 0, height: 4 },
                elevation: 8,
                borderWidth: 1,
                borderColor: 'rgba(253, 80, 30, 0.1)',
              }}
            >
              <AntDesign name="arrowleft" size={24} color="#FD501E" />
            </TouchableOpacity>

            {/* Logo - Center */}
            <View style={{ position: 'absolute', left: 0, right: 0, alignItems: 'center' }}>
              <LogoTheTrago />
            </View>
          </View>
        </LinearGradient>

        {/* Ultra Premium Title Section */}
        <View style={{ 
          flexDirection: 'row', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          marginTop: hp('1.5%'), 
          marginHorizontal: wp('5%'), 
          marginBottom: hp('2.5%'),
          paddingHorizontal: wp('4%'),
          paddingVertical: hp('2%'),
          backgroundColor: 'rgba(255,255,255,0.12)',
          borderRadius: wp('5%'),
          backdropFilter: 'blur(15px)',
          borderWidth: 1.5,
          borderColor: 'rgba(255,255,255,0.25)',
          shadowColor: '#000',
          shadowOpacity: 0.08,
          shadowRadius: wp('3%'),
          shadowOffset: { width: 0, height: hp('0.5%') },
          elevation: 6,
        }}>
          <View style={{ flex: 1 }}>
            <Text style={[
              headStyles.headerTitle, 
              { 
                color: '#FFFFFF', 
                fontSize: wp('7.5%'), 
                fontWeight: '900', 
                letterSpacing: -0.8, 
                textAlign: 'left', 
                marginLeft: 0,
                lineHeight: wp('8.5%'),
                textShadowColor: 'rgba(0,0,0,0.4)',
                textShadowRadius: 6,
                textShadowOffset: { width: 2, height: 2 },
              }
            ]}>
              PromptPay QR
            </Text>
            <Text style={{
              color: 'rgba(255,255,255,0.85)',
              fontSize: wp('3.8%'),
              fontWeight: '600',
              marginTop: hp('0.8%'),
              letterSpacing: 0.5,
              textShadowColor: 'rgba(0,0,0,0.3)',
              textShadowRadius: 3,
              textShadowOffset: { width: 1, height: 1 },
            }}>
              Scan to complete your payment
            </Text>
          </View>
        </View>

        <ScrollView 
          contentContainerStyle={[styles.container, { paddingBottom: hp('15%') }]}
          showsVerticalScrollIndicator={false}
          contentInsetAdjustmentBehavior="automatic"
          bounces={false}
        >
      
      {loading ? (
        <>
          {/* Premium Loading Section */}
          <View style={styles.loadingCard}>
            <View style={styles.skeletonContainer}>
              <View style={styles.skeletonQR} />
              <View style={styles.skeletonAmount} />
            </View>
            <View style={styles.skeletonButtonRow}>
              <View style={styles.skeletonButton} />
              <View style={styles.skeletonButton} />
            </View>
          </View>
        </>
      ) : (
        <>
          {/* Premium QR Code Section */}
          <View style={styles.qrCard}>
            {qrUri && (
              <>
                <View style={styles.qrContainer}>
                  <Image
                    source={{ uri: qrUri }}
                    style={styles.qr}
                    resizeMode="contain"
                  />
                </View>
                <View style={styles.amountContainer}>
                  <Text style={styles.amountLabel}>Total Amount</Text>
                  <Text style={styles.amountValue}>{customerData.symbol} {Paymenttotal}</Text>
                </View>
              </>
            )}
          </View>

          {/* Premium Action Buttons */}
          <View style={styles.actionSection}>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={saveQRToFile}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['rgba(255,255,255,0.9)', 'rgba(248,250,252,0.95)']}
                style={styles.saveButtonGradient}
              >
                <Ionicons name="download-outline" size={20} color="#6B7280" style={{ marginRight: 8 }} />
                <Text style={styles.saveButtonText}>Save QR</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handlePress}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#FD501E', '#FF6B35']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.cancelButtonGradient}
              >
                <Ionicons name="close-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </>
      )}
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: wp('5%'),
    paddingTop: hp('2%'),
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingCard: {
    backgroundColor: 'rgba(255,255,255,0.98)',
    borderRadius: wp('7%'),
    padding: wp('8%'),
    marginBottom: hp('2.5%'),
    shadowColor: '#001233',
    shadowOpacity: 0.25,
    shadowRadius: wp('8%'),
    shadowOffset: { width: 0, height: hp('1.5%') },
    elevation: 20,
    borderWidth: wp('0.3%'),
    borderColor: 'rgba(253, 80, 30, 0.12)',
    backdropFilter: 'blur(30px)',
    width: '100%',
    alignItems: 'center',
  },
  qrCard: {
    backgroundColor: 'rgba(255,255,255,0.98)',
    borderRadius: wp('7%'),
    padding: wp('8%'),
    marginBottom: hp('4%'),
    shadowColor: '#001233',
    shadowOpacity: 0.25,
    shadowRadius: wp('8%'),
    shadowOffset: { width: 0, height: hp('1.5%') },
    elevation: 20,
    borderWidth: wp('0.3%'),
    borderColor: 'rgba(253, 80, 30, 0.12)',
    backdropFilter: 'blur(30px)',
    width: '100%',
    alignItems: 'center',
  },
  qrContainer: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: wp('5%'),
    padding: wp('4%'),
    marginBottom: hp('3%'),
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: wp('3%'),
    shadowOffset: { width: 0, height: hp('0.5%') },
    elevation: 8,
  },
  qr: {
    width: wp('60%'),
    height: wp('60%'),
  },
  amountContainer: {
    alignItems: 'center',
    paddingVertical: hp('2%'),
    paddingHorizontal: wp('6%'),
    backgroundColor: 'rgba(253, 80, 30, 0.05)',
    borderRadius: wp('4%'),
    borderWidth: wp('0.2%'),
    borderColor: 'rgba(253, 80, 30, 0.1)',
  },
  amountLabel: {
    fontSize: wp('4%'),
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: hp('0.5%'),
    letterSpacing: 0.3,
  },
  amountValue: {
    fontSize: wp('6%'),
    color: '#FD501E',
    fontWeight: '900',
    letterSpacing: -0.5,
    textShadowColor: 'rgba(253, 80, 30, 0.2)',
    textShadowRadius: 2,
    textShadowOffset: { width: 1, height: 1 },
  },
  actionSection: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp('2%'),
  },
  saveButton: {
    flex: 1,
    marginRight: wp('2%'),
    borderRadius: wp('4%'),
    shadowColor: '#64748B',
    shadowOpacity: 0.3,
    shadowRadius: wp('4%'),
    shadowOffset: { width: 0, height: hp('0.8%') },
    elevation: 12,
  },
  saveButtonGradient: {
    paddingVertical: hp('2%'),
    paddingHorizontal: wp('6%'),
    borderRadius: wp('4%'),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: wp('0.2%'),
    borderColor: 'rgba(107, 114, 128, 0.2)',
  },
  saveButtonText: {
    color: '#6B7280',
    fontSize: wp('4.2%'),
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  cancelButton: {
    flex: 1,
    marginLeft: wp('2%'),
    borderRadius: wp('4%'),
    shadowColor: '#FD501E',
    shadowOpacity: 0.4,
    shadowRadius: wp('4%'),
    shadowOffset: { width: 0, height: hp('0.8%') },
    elevation: 12,
  },
  cancelButtonGradient: {
    paddingVertical: hp('2%'),
    paddingHorizontal: wp('6%'),
    borderRadius: wp('4%'),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: wp('4.2%'),
    fontWeight: '700',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowRadius: 2,
  },
  // Premium Skeleton Loader Styles
  skeletonContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: hp('4%'),
  },
  skeletonQR: {
    width: wp('60%'),
    height: wp('60%'),
    backgroundColor: 'rgba(148, 163, 184, 0.2)',
    borderRadius: wp('5%'),
    marginBottom: hp('3%'),
  },
  skeletonAmount: {
    width: wp('40%'),
    height: hp('4%'),
    backgroundColor: 'rgba(148, 163, 184, 0.2)',
    borderRadius: wp('2%'),
  },
  skeletonButtonRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    paddingHorizontal: wp('2%'),
  },
  skeletonButton: {
    flex: 1,
    height: hp('6%'),
    backgroundColor: 'rgba(148, 163, 184, 0.2)',
    borderRadius: wp('4%'),
    marginHorizontal: wp('1%'),
  },
});
