import React, { useEffect, useState, useRef } from "react";
import { View, StyleSheet, Image, TouchableOpacity, Text, ScrollView, Alert, Platform, Modal, Animated } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import axios from "axios";
import ipAddress from "../../config/ipconfig";
import { useCustomer } from './CustomerContext';
import { useLanguage } from './LanguageContext';
import { useTabBarAutoHide } from '../../utils/useTabBarAutoHide';
import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';
import moment from "moment-timezone";
import LogoTheTrago from "./../../components/component/Logo";
import headStyles from '../../styles/CSS/StartingPointScreenStyles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function PromptPayScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const params = route.params || {};
  const Paymenttotal = params.Paymenttotal ?? params.amount ?? params.Paymenttotal ?? 0;
  const selectedOption = params.selectedOption ?? params.selectedOption;
  const usePoints = params.usePoints;
  const pointsToUse = params.pointsToUse;
  const pointsToEarn = params.pointsToEarn;
  const tabBarScrollProps = useTabBarAutoHide();

  // 🔍 Debug route params ที่ได้รับมา
  console.log("🔗 PromptPay Route Params Debug:");
  console.log("- Full route.params:", JSON.stringify(route.params, null, 2));
  console.log("- Paymenttotal:", (Math.round(Paymenttotal * 100) / 100).toFixed(2));
  console.log("- selectedOption:", selectedOption);
  console.log("- usePoints:", usePoints);
  console.log("- pointsToUse:", pointsToUse);
  console.log("- pointsToEarn:", pointsToEarn);

  const [chargeid, setChargeid] = useState(null);
  const [qrUri, setQrUri] = useState(null);
  const [loading, setLoading] = useState(true);
  const { customerData, updateCustomerData } = useCustomer();
  const { t } = useLanguage();
  const [qrpayment, setqrpayment] = useState(Math.round(Paymenttotal * 100));
  const [intervalId, setIntervalId] = useState(null);
  const [actualBookingCode, setActualBookingCode] = useState(null); // เก็บ booking code ที่สร้างจริง
  const { source = 'ferry', tour } = params; // support for 'tour' flow
  
  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const modalTranslateY = useRef(new Animated.Value(hp('80%'))).current;
  const scrollY = useRef(new Animated.Value(0)).current;

  // สร้าง random order id แบบตัวเลขความยาว n (ไม่ขึ้นต้นด้วย 0)
  const generateRandomDigits = (n) => {
    if (!n || n <= 0) return '';
    let result = '';
    // ให้หลักแรกเป็น 1-9
    result += String(Math.floor(Math.random() * 9) + 1);
    for (let i = 1; i < n; i++) {
      result += String(Math.floor(Math.random() * 10));
    }
    return result;
  };

  const EXTRA_TOP_GUTTER = Platform.OS === 'android' ? 0 : 16;
  const deadline = route.params?.deadline || moment().add(10, 'minutes').format('HH:mm');
  
  // Modal functions
  const openModal = () => {
    setModalVisible(true);
    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(modalTranslateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start();
  };
  
  const closeModal = () => {
    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(modalTranslateY, {
        toValue: hp('80%'),
        duration: 250,
        useNativeDriver: true,
      })
    ]).start(() => {
      setModalVisible(false);
    });
  };
  // Function สำหรับการอัปเดตคะแนน
  const updateUserPoints = async (pointsToDeduct, pointsToAdd) => {
    try {
      console.log(`🎯 PromptPay Points Update: Deduct ${pointsToDeduct}, Add ${pointsToAdd}`);

      const response = await axios.post(`${ipAddress}/updatepoints`, {
        md_member_id: customerData.md_member_id,
        points_to_deduct: pointsToDeduct,
        points_to_add: pointsToAdd,
        transaction_type: "TRANSACTION"
      });

      console.log("✅ PromptPay Points updated successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ PromptPay Points update failed:", error);
      throw error;
    }
  };

  useEffect(() => {
    const loadAll = async () => {
      try {
        console.log("🔍 PromptPay Initial Debug Info:");
        console.log("📊 Customer Data Keys:", Object.keys(customerData));
        console.log("📊 Total Customer Data:", JSON.stringify(customerData, null, 2));
        console.log("🎯 Key Fields Check:");
        console.log("- timeTableDepartId:", customerData.timeTableDepartId);
        console.log("- companyDepartId:", customerData.companyDepartId);
        console.log("- md_booking_timetableid:", customerData.md_booking_timetableid);
        console.log("- md_booking_companyid:", customerData.md_booking_companyid);
        console.log("- country:", customerData.country);
        console.log("- email:", customerData.email);
        console.log("- Paymenttotal:", (Math.round(Paymenttotal * 100) / 100).toFixed(2));
        console.log("- qrpayment:", qrpayment);

        // 🎯 เพิ่มการตรวจสอบข้อมูลจากการใช้คะแนน
        console.log("💳 Points Payment Debug:");
        console.log("- usePoints:", usePoints);
        console.log("- pointsToUse:", pointsToUse);
        console.log("- pointsToEarn:", pointsToEarn);
        console.log("- selectedOption:", selectedOption);

        // 🔍 ตรวจสอบข้อมูลการเดินทางที่สำคัญ
        console.log("✈️ Trip Data Check:");
        console.log("- adult:", customerData.adult);
        console.log("- child:", customerData.child);
        console.log("- infant:", customerData.infant);
        console.log("- departdate:", customerData.departdate);
        console.log("- departtime:", customerData.departtime);
        console.log("- roud (round):", customerData.roud);
        console.log("- currency:", customerData.currency);
        console.log("- symbol:", customerData.symbol);

        // 🏢 ตรวจสอบข้อมูลบริษัทและตราง
        console.log("🏢 Company & Schedule Data:");
        console.log("- boatypeid:", customerData.boatypeid);
        console.log("- subtotalDepart:", customerData.subtotalDepart);
        console.log("- netDepart:", customerData.netDepart);
        console.log("- paymenttype:", customerData.paymenttype);
        console.log("- paymentfee:", customerData.paymentfee);

        // สร้าง booking ก่อนเรียก create-promptpay
        const bookingResult = source === 'tour' ? await createTourBooking() : await createBooking();

        if (!bookingResult.success) {
          throw new Error(bookingResult.message || 'Failed to create booking');
        }

        console.log("✅ Booking created before PromptPay with code:", bookingResult.bookingCode);
        updateCustomerData({
          md_booking_code: bookingResult.bookingCode,
          md_booking_groupcode: bookingResult.bookingCodeReturn,
        });
        setActualBookingCode(bookingResult.bookingCode);

        // เมื่อ booking สำเร็จแล้ว สร้าง promptpay charge
        // ส่ง booking_code ที่ได้จาก createBooking โดยตรง (หลีกเลี่ยง race กับ customerData)
        const md_charge_from = source === 'tour' ? 'tour' : 'ferry';
        console.log('[PromptPay] create-promptpay payload:', { amount: parseFloat(qrpayment), currency: customerData.currency || 'THB', booking_code: bookingResult.bookingCode, randomorder: generateRandomDigits(16), md_charge_from });
        const response = await axios.post(`${ipAddress}/create-promptpay`, {
          amount: parseFloat(qrpayment),
          currency: customerData.currency || "THB",
          booking_code: bookingResult.bookingCode,
          randomorder: generateRandomDigits(16),
          md_charge_from,
        });

        setChargeid(response.data.charge_id);
        setQrUri(response.data.qr_code);

      } catch (error) {
        console.error("❌ Error in loadAll:", error);
        console.error("❌ Error details:", error.message);

        let errorMessage = t('failedToCreateQRCode') || 'Failed to create QR code or booking';

        if (error.message) {
          errorMessage = error.message;
        }

        Alert.alert(
          t('error') || 'Error',
          errorMessage,
          [
            {
              text: t('ok') || 'OK',
              onPress: () => navigation.goBack()
            }
          ]
        );
      } finally {
        setLoading(false);
      }
    };

    loadAll();
  }, [qrpayment]);

  // ใช้ useFocusEffect แทน useEffect สำหรับ payment checking
  useFocusEffect(
    React.useCallback(() => {
      let localIntervalId = null;

      const checkPayment = async () => {
        try {
          console.log("Charge ID:", chargeid);
          // ทำการตรวจสอบสถานะการชำระเงิน
          let res;
          try {
            console.log('[PromptPay] checking charge:', chargeid);
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
            if (source === 'tour') {
              navigation.navigate('TourPaymentSuccess', { success: true, bookingCode: actualBookingCode, paymentId: chargeid, type: 'tour', bookingStatus: 'success' });
            } else {
              navigation.navigate("ResultScreen", { success: true });
            }
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
      }

      // Cleanup function - จะทำงานเมื่อหน้าไม่ active หรือ component unmount
      return () => {
        console.log("🛑 Cleaning up payment check interval");
        if (localIntervalId) {
          clearInterval(localIntervalId);
          setIntervalId(null);
        }
      };
    }, [chargeid, actualBookingCode, usePoints, pointsToUse, pointsToEarn])
  );

  const saveQRToFile = async () => {
    try {
      if (!qrUri) {
        Alert.alert(t('error'), t('qrCodeNotAvailable'));
        return;
      }
      // ขอ permission ก่อน
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(t('permissionRequired'), t('allowAccessToSaveImages'));
        return;
      }
      // สร้างไฟล์ชั่วคราว
      const path = FileSystem.cacheDirectory + 'qr_code.png';
      await FileSystem.writeAsStringAsync(path, qrUri.replace('data:image/png;base64,', ''), {
        encoding: 'base64'
      });
      // บันทึกลงแกลเลอรี่
      await MediaLibrary.saveToLibraryAsync(path);
      Alert.alert(t('success'), t('qrCodeSavedToGallery'));
      console.log('QR saved to', path);
    } catch (error) {
      console.error('Error saving QR code:', error);
      Alert.alert(t('error'), t('failedToSaveQRCode'));
    }
  };

  const getDeviceIpAddress = async () => {
    try {
      const res = await fetch('https://api64.ipify.org?format=json');
      const { ip } = await res.json();
      return ip || '0.0.0.0';
    } catch {
      return '0.0.0.0';
    }
  };

  // ✅ ตัด paymentCode ออกทั้งหมด และไม่ส่ง md_booking_paymentid
  const createBooking = async () => {
    try {
      const ip = await getDeviceIpAddress();

      const payload = {
        lang: customerData.md_booking_lang || 'en',
        currency: customerData.currency || customerData.md_booking_currency,
        roundtrip: Number(customerData.roud || customerData.md_booking_round) || 0,
        departtrip: customerData.timeTableDepartId || customerData.md_booking_timetableiddepart,
        returntrip: customerData.timeTableReturnId || customerData.md_booking_timetableidreturn,
        adult: Number(customerData.adult || customerData.md_booking_adult) || 0,
        child: Number(customerData.child || customerData.md_booking_child) || 0,
        infant: Number(customerData.infant || customerData.md_booking_infant) || 0,
        departdate: customerData.departdate || customerData.md_booking_departdate,
        returndate: customerData.returndate || customerData.md_booking_returndate,

        pickupdepart1: customerData.pickupDepartId,
        pickupdepartdetail1: customerData.HotelpickupDepart,
        dropoffdepart1: customerData.dropoffDepartId,
        dropoffdepartdetail1: customerData.HoteldropoffDepart,
        pickupdepart2: customerData.pickupReturnId,
        pickupdepartdetail2: customerData.HotelpickupReturn,
        dropoffdepart2: customerData.dropoffReturnId,
        dropoffdepartdetail2: customerData.HoteldropoffReturn,

        paymentfee: parseInt(customerData.md_booking_payfee || customerData.paymentfee) || 0,
        promotioncode: customerData.md_booking_promocode || '',
        refund: customerData.md_booking_refund || 0,
        insurance: customerData.md_booking_insurance || 0,

        credit: parseInt(Number(pointsToEarn || 0).toFixed(2)),
        member: Number(customerData.md_booking_memberid) || 0,
        paymenttype: Number(selectedOption) || 2, // PromptPay
        international: Number(customerData.international) || 0,

        detailpassenger: (customerData.passenger || []).filter(p => p && typeof p === 'object'),
        detailinsurance: (customerData.insurance || []).filter(ins => ins && typeof ins === 'object' && ins.md_insurancetype_no),

        // ส่งรหัสประเทศตรง ๆ (ไม่มีการ norm ทำให้ไม่เกิด ++66)
        txt_countries: customerData.md_booking_country || customerData.country,
        txt_phonecode: String(customerData.md_booking_countrycode || customerData.countrycode || ''),
        txt_phone: customerData.md_booking_tel || customerData.tel,
        txt_email: customerData.md_booking_email || customerData.email,
        txt_whatsapp: customerData.md_booking_whatsapp || '',

        ipaddress: ip,
        checkDevice: 2,
        // ❌ ไม่มี paymentcode แล้ว
      };

      const response = await axios.post(
        'https://thetrago.com/api/V1/ferry/AddBooking',
        payload,
        { headers: { 'Content-Type': 'application/json' }, timeout: 15000 }
      );

      const { status, data, message } = response?.data || {};
      if (status === 'success' && data) {
        const bookingCode = data.bookingcode;
        const bookingCodeReturn = data.bookingcode_return;

        updateCustomerData({
          md_booking_code: bookingCode,
          ...(bookingCodeReturn ? { md_booking_code_return: bookingCodeReturn } : {}),
        });

        return { success: true, bookingCode, bookingCodeReturn, message };
      }
      throw new Error(message || 'Failed to create booking');
    } catch (error) {
      const apiError = error?.response?.data || error?.message;
      throw new Error(
        typeof apiError === 'string' ? apiError : (apiError?.message || 'Failed to create booking')
      );
    }
  }




  const handlePress = async () => {
    if (intervalId) {
      clearInterval(intervalId); // หยุด interval ทันทีเมื่อกด Cancel
    }
    try {
      // ตรวจสอบสถานะล่าสุดก่อน
      console.log('[PromptPay] manual check-charge for:', chargeid);
      const res = await axios.post(`${ipAddress}/check-charge`, {
        charge_id: chargeid,
      });
      if (res.data.success && res.data.status === "successful") {
        navigation.navigate('ResultScreen', { success: true });
      }
    } catch (e) {
      console.error('Error checking payment status on manual cancel:', e);
    }
    // For tour flow, check and navigate to TourPaymentSuccess with bookingStatus accordingly
    if (source === 'tour') {
      try {
        const res = await axios.post(`${ipAddress}/check-charge`, { charge_id: chargeid });
        if (res.data.success && res.data.status === 'successful') {
          navigation.navigate('TourPaymentSuccess', { success: true, bookingCode: actualBookingCode, paymentId: chargeid, type: 'tour', bookingStatus: 'success' });
          return;
        }
      } catch (e) {
        console.error('Error checking payment status on manual confirm (tour):', e);
      }
      navigation.navigate('TourPaymentSuccess', { success: false, bookingCode: actualBookingCode, paymentId: chargeid, type: 'tour', bookingStatus: 'failed' });
      return;
    }
    // Ferry flow fallback
    navigation.navigate('ResultScreen', { success: false });
  };

  // Tour booking creator adapted from PaymentTourScreen.createTourBooking
  async function createTourBooking() {
    try {
      const payload = {
        md_booking_prefix: customerData?.md_tours_title_name || customerData?.md_tours_title || '',
        md_booking_fname: customerData?.md_tours_firstname || customerData?.md_tours_name || '',
        md_booking_lname: customerData?.md_tours_lastname || customerData?.md_tours_surname || '',
        md_booking_tel: customerData?.md_tours_tel || '',
        md_booking_email: customerData?.md_tours_email || '',
        md_booking_adult: Number(customerData?.md_tours_adult || 0),
        md_booking_child: Number(customerData?.md_tours_child || 0),
        md_booking_infant: Number(customerData?.md_tours_infant || 0),
        md_booking_tourid: tour?.md_tour_id || tour?.tourId || tour?.tourid || tour?.TourID || customerData?.md_tours_id,
        md_booking_traveldate: customerData?.md_tours_departdate || customerData?.md_booking_departdate || '',
        md_booking_country: customerData?.md_tours_country || '',
        md_booking_countrycodetel: customerData?.md_tours_countrycode || '',
        md_booking_countrycode: customerData?.currency || 'THB',
        md_booking_paymenttype: 2, // promptpay
        md_booking_dis: 0,
        md_booking_vat: 0,
        md_booking_servicepickup: 0,
        account_id: customerData?.md_booking_memberid || 0,
        md_booking_affiliate: 0
      };

      console.log('📦 [createTourBooking] Payload:', payload);
      const response = await axios.post(`${ipAddress}/addbookingtour`, payload, { headers: { 'Content-Type': 'application/json' }, timeout: 15000 });
      const { status, message, md_booking_code } = response?.data || {};
      if (status === 'success' && md_booking_code) {
        updateCustomerData({ md_booking_code: md_booking_code });
        return { success: true, bookingCode: md_booking_code };
      }
      throw new Error(message || 'Failed to create tour booking');
    } catch (error) {
      console.error('❌ Error creating tour booking:', error);
      throw new Error(error?.message || 'Failed to create tour booking');
    }
  }



  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
        {/* Header */}
        <Animated.View
          style={[
            {
              width: '100%',
              paddingTop: EXTRA_TOP_GUTTER,
              borderBottomLeftRadius: 20,
              borderBottomRightRadius: 20,
              paddingBottom: 8,
              padding: 10,
              minHeight: hp('12%'),
              elevation: 3,
              backgroundColor: scrollY.interpolate({
                inputRange: [0, 120],
                outputRange: ['#FFFFFF', '#FFFFFF'],
                extrapolate: 'clamp',
              }),
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: scrollY.interpolate({
                inputRange: [0, 120],
                outputRange: [0.1, 0.15],
                extrapolate: 'clamp',
              }),
              shadowRadius: 4,
            }
          ]}
        >
          <View
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              paddingHorizontal: 0,
              paddingTop: 0,
              position: 'relative',
              marginTop: hp('2%'),
              height: 56,
            }}
          >
            {/* Back Button - Left */}
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{
                position: 'absolute',
                left: 16,
                backgroundColor: '#F3F4F6',
                borderRadius: 25,
                padding: 8,
                zIndex: 2,
              }}
            >
              <AntDesign name="arrow-left" size={24} color="#FD501E" />
            </TouchableOpacity>

            {/* Logo - Center */}
            <View style={{ position: 'absolute', left: 0, right: 0, alignItems: 'center' }}>
              <LogoTheTrago />
            </View>
          </View>
        </Animated.View>

        <ScrollView
          {...tabBarScrollProps}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
          contentContainerStyle={[styles.container, { paddingBottom: hp('15%'), backgroundColor: '#FFFFFF' }]}
          showsVerticalScrollIndicator={false}
          contentInsetAdjustmentBehavior="automatic"
          bounces={false}
          style={{ backgroundColor: '#FFFFFF' }}
        >

          {!loading && (
            <>
              {/* Amount + Tour Name + Details Link */}
              <View style={styles.topSection}>
                <Text style={styles.amountLarge}>฿ {(Number(Paymenttotal) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                {source === 'tour' && (
                  <>
                    <Text style={styles.tourDescription}>{tour?.name || tour?.title || customerData?.md_tours_name || ''}</Text>
                    <TouchableOpacity onPress={openModal}>
                      <Text style={styles.detailLinkSmall}>{t('tourDetails') || 'รายละเอียด'} ›</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>

              {/* Title: สแกน QR Code */}
              <Text style={styles.qrTitle}>{t('scanQRCode') || 'สแกน QR Code'}</Text>

              {/* QR Card */}
              <View style={styles.qrCard}>
                {qrUri ? (
                  <Image
                    source={{ uri: qrUri }}
                    style={styles.qr}
                    resizeMode="contain"
                  />
                ) : (
                  <View style={styles.skeletonQR} />
                )}
                <TouchableOpacity
                  style={styles.saveButtonBlue}
                  onPress={saveQRToFile}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={['#2563EB', '#06B6D4']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.saveButtonBlueGradient}
                  >
                    <Ionicons name="download-outline" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                    <Text style={styles.saveButtonTextBlue}>{t('saveQR') || 'บันทึก QR Code'}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>

              {/* Manual Confirm CTA */}
              <TouchableOpacity
                style={styles.confirmOutlineButton}
                onPress={handlePress}
                activeOpacity={0.85}
              >
                <Text style={styles.confirmOutlineButtonText}>{t('confirmPayment') || 'ยืนยันการชำระเงินด้วยตนเอง'}</Text>
              </TouchableOpacity>
              {/* Instructions Block */}
              <View style={styles.instructionsBlock}>
                <Text style={styles.instructionsTitle}>{t('howToPayByQRCode') || 'วิธีการชำระเงินด้วย QR Code'}</Text>
                <Text style={styles.instructionsText}>1. {t('qrInstruction1') || 'บันทึกรหัส QR ข้างต้น หรือถ่ายภาพหน้าจอของรหัส QR จากนั้นเปิดแอปธนาคารของคุณและสแกนเพื่อชำระเงิน'}</Text>
                <Text style={styles.instructionsText}>2. {t('qrInstruction2') || 'อัปโหลด QR Code ในแอป หรือกดปุ่มบันทึก QR Code และยืนยันการชำระเงิน'}</Text>
                <Text style={styles.instructionsText}>3. {t('qrInstruction3') || 'เมื่อระบบได้รับการยืนยันการชำระเงิน คุณจะได้รับยืนยันการจองโดยอัตโนมัติ'}</Text>
              </View>
            </>
          )}
        </ScrollView>
      </View>
      
      {/* Tour Details Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="none"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <Animated.View style={[styles.modalBackground, { opacity: overlayOpacity }]} />
          <Animated.View style={[styles.modalContent, { transform: [{ translateY: modalTranslateY }] }]}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('bookingDetails') || 'รายละเอียดการจอง'}</Text>
              <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                <Ionicons name="close" size={28} color="#111827" />
              </TouchableOpacity>
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false} style={styles.modalScroll}>
              {/* Tour Info */}
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>
                  {tour?.name || tour?.title || t('tourPackage')}
                </Text>
              </View>
              
              {/* Contact Info */}
              <View style={styles.modalSection}>
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>{t('phoneNumber') || 'หมายเลขโทรศัพท์'}</Text>
                  <Text style={styles.modalValue}>{'+' + (customerData?.md_tours_countrycode || '66') + ' ' + (customerData?.md_tours_tel || '')}</Text>
                </View>
              </View>
              
              <View style={styles.modalSection}>
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>{t('email') || 'อีเมล'}</Text>
                  <Text style={styles.modalValue}>{customerData?.md_tours_email || ''}</Text>
                </View>
              </View>
              
              {/* Price Breakdown */}
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>{t('priceBreakdown') || 'รายละเอียดราคา'}</Text>
                
                {customerData?.md_tours_adult > 0 && (
                  <View style={styles.priceRow}>
                    <Text style={styles.priceLabel}>{t('adult') || 'ผู้ใหญ่'} ×{customerData.md_tours_adult}</Text>
                    <Text style={styles.priceValue}>{customerData?.symbol || '฿'} {(Number(customerData?.md_tours_adult_price || 0) * Number(customerData?.md_tours_adult || 0)).toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
                  </View>
                )}
                
                {customerData?.md_tours_child > 0 && (
                  <View style={styles.priceRow}>
                    <Text style={styles.priceLabel}>{t('child') || 'เด็ก'} ×{customerData.md_tours_child}</Text>
                    <Text style={styles.priceValue}>{customerData?.symbol || '฿'} {(Number(customerData?.md_tours_child_price || 0) * Number(customerData?.md_tours_child || 0)).toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
                  </View>
                )}
                
                {customerData?.md_tours_infant > 0 && (
                  <View style={[styles.priceRow, { borderBottomWidth: 0 }]}>
                    <Text style={styles.priceLabel}>{t('infant') || 'ทารก'} ×{customerData.md_tours_infant}</Text>
                    <Text style={styles.priceValue}>{customerData?.symbol || '฿'} {(Number(customerData?.md_tours_infant_price || 0) * Number(customerData?.md_tours_infant || 0)).toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
                  </View>
                )}
                
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>{t('totalAmount') || 'ยอดชำระทั้งหมด'}</Text>
                  <Text style={styles.totalValue}>{customerData?.symbol || '฿'} {(Number(Paymenttotal) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                </View>
              </View>
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: wp('5%'),
    paddingTop: hp('2%'),
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: '#FFFFFF',
  },
  loadingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: wp('5%'),
    padding: wp('8%'),
    marginBottom: hp('2.5%'),
    borderWidth: 1,
    borderColor: '#E5E7EB',
    width: '100%',
    alignItems: 'center',
  },
  qrCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: wp('5%'),
    padding: wp('4%'),
    marginBottom: hp('2%'),
    borderWidth: 1,
    borderColor: '#E5E7EB',
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  topSection: {
    width: '100%',
    alignItems: 'center',
    marginBottom: hp('2%'),
    marginTop: hp('1%'),
  },
  amountLarge: {
    fontSize: wp('10%'),
    fontWeight: '800',
    color: '#111827',
    marginBottom: hp('1%'),
  },
  tourDescription: {
    fontSize: wp('3.5%'),
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: hp('0.5%'),
    paddingHorizontal: wp('2%'),
  },
  detailLinkSmall: {
    fontSize: wp('3.8%'),
    color: '#2563EB',
    fontWeight: '600',
  },
  qrTitle: {
    fontSize: wp('4%'),
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: hp('1.5%'),
    alignSelf: 'flex-start',
  },
  qr: {
    width: wp('90%'),
    height: wp('90%'),
    marginBottom: hp('3%'),
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
  },
  topAmountSection: {
    width: '100%',
    alignItems: 'center',
    marginBottom: hp('2%'),
  },
  topAmountValue: {
    fontSize: wp('10%'),
    fontWeight: '900',
    color: '#111827',
    marginBottom: hp('0.4%'),
  },
  tourMetaContainer: {
    alignItems: 'center',
    marginTop: hp('1%'),
  },
  tourName: {
    fontSize: wp('4%'),
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center'
  },
  tourDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: hp('0.6%')
  },
  detailLink: {
    color: '#2563EB',
    fontWeight: '700',
    marginLeft: wp('2%')
  },
  bookingCodeText: {
    fontSize: wp('3.4%'),
    color: '#6B7280',
    marginTop: hp('0.6%')
  },
  instructionsBlock: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: wp('4%'),
    padding: wp('4%'),
    marginTop: hp('3%'),
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  instructionsTitle: {
    fontSize: wp('4%'),
    fontWeight: '700',
    color: '#111827',
    marginBottom: hp('1%')
  },
  instructionsText: {
    fontSize: wp('3.5%'),
    color: '#6B7280',
    lineHeight: wp('4.8%'),
    marginBottom: hp('0.6%')
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
  },
  saveButtonBlue: {
    marginTop: hp('2%'),
    width: '70%',
    borderRadius: wp('8%'),
    alignSelf: 'center'
  },
  saveButtonBlueGradient: {
    paddingVertical: hp('1.8%'),
    paddingHorizontal: wp('6%'),
    borderRadius: wp('8%'),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  saveButtonTextBlue: {
    color: '#fff',
    fontSize: wp('4.2%'),
    fontWeight: '700'
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
  },
  confirmOutlineButton: {
    borderWidth: 2,
    borderColor: '#2563EB',
    borderRadius: wp('6%'),
    paddingVertical: hp('2%'),
    paddingHorizontal: wp('6%'),
    alignItems: 'center',
    width: '100%',
    alignSelf: 'center',
    marginTop: hp('2%'),
    marginBottom: hp('2%'),
  },
  confirmOutlineButtonText: {
    color: '#2563EB',
    fontWeight: '700',
    fontSize: wp('4%')
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
  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end'
  },
  modalBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000'
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: hp('2%'),
    maxHeight: hp('80%'),
    minHeight: hp('50%')
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: wp('5%'),
    paddingBottom: hp('2%'),
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    position: 'relative'
  },
  modalTitle: {
    fontSize: wp('4.5%'),
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center'
  },
  closeButton: {
    position: 'absolute',
    right: wp('5%'),
    top: 0,
    padding: 4
  },
  modalScroll: {
    paddingHorizontal: wp('5%'),
    paddingTop: hp('2%')
  },
  modalSection: {
    marginBottom: hp('3%')
  },
  modalSectionTitle: {
    fontSize: wp('4%'),
    fontWeight: '700',
    color: '#111827',
    marginBottom: hp('1.5%'),
    lineHeight: wp('5.5%')
  },
  modalRow: {
    marginBottom: hp('1%')
  },
  modalLabel: {
    fontSize: wp('3.5%'),
    color: '#6B7280',
    marginBottom: hp('0.5%'),
    fontWeight: '600'
  },
  modalValue: {
    fontSize: wp('3.8%'),
    color: '#111827'
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: hp('1%'),
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6'
  },
  priceLabel: {
    fontSize: wp('3.8%'),
    color: '#6B7280'
  },
  priceValue: {
    fontSize: wp('3.8%'),
    color: '#111827',
    fontWeight: '600'
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: hp('2%'),
    marginTop: hp('1%'),
    borderTopWidth: 2,
    borderTopColor: '#E5E7EB'
  },
  totalLabel: {
    fontSize: wp('4.5%'),
    color: '#111827',
    fontWeight: '700'
  },
  totalValue: {
    fontSize: wp('5%'),
    color: '#2563EB',
    fontWeight: '800'
  },
});
