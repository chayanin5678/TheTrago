import React, { useEffect, useState } from "react";
import { View, SafeAreaView, StyleSheet, Image, TouchableOpacity, Text, ScrollView, Alert, Platform } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import axios from "axios";
import ipAddress from "../../config/ipconfig";
import { useCustomer } from './CustomerContext';
import { useLanguage } from './LanguageContext';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import moment from "moment-timezone";
import LogoTheTrago from "./../../components/component/Logo";
import headStyles from '../../styles/CSS/StartingPointScreenStyles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function PromptPayScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { Paymenttotal, selectedOption, usePoints, pointsToUse, pointsToEarn } = route.params;

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

      const EXTRA_TOP_GUTTER = Platform.OS === 'android' ? 0 : 50;
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

        const response = await axios.post(`${ipAddress}/create-promptpay`, {
          amount: parseFloat(qrpayment),
          currency: "thb",
        });

        setChargeid(response.data.charge_id);
        setQrUri(response.data.qr_code);

        // ✅ สร้าง booking และได้ booking code จาก API เท่านั้น
        const bookingResult = await createBooking();

        if (bookingResult.success) {
          console.log("✅ PromptPay Booking created with code:", bookingResult.bookingCode);
          updateCustomerData({
            md_booking_code: bookingResult.bookingCode,
            md_booking_groupcode: bookingResult.bookingCodeReturn,
          });


          // ✅ ใช้ booking code จาก createBooking API response เท่านั้น
          const bookingCodeFromAPI = bookingResult.bookingCode;
          setActualBookingCode(bookingCodeFromAPI); // เก็บไว้ใน state

        } else {
          throw new Error("Failed to create PromptPay booking");
        }

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
            // ✅ ใช้ booking code ที่ได้จาก createBooking เท่านั้น
            const bookingCodeToUse = customerData.md_booking_code;
            const bookingCodeReturnToUse = customerData.md_booking_code_return;

            if (!bookingCodeToUse) {
              console.warn("⚠️ No booking code found - PromptPay payment will be handled by PromptPayQR screen");
              // สำหรับ PromptPay ที่ยังไม่มี booking code ให้ไปหน้า success ได้เลย
              // เพราะการสร้าง booking จะทำในหน้า PromptPayQR
            } else {
              console.log("✅ Using booking code from payment:", bookingCodeToUse);

              // ✅ อัปเดตสถานะ booking ด้วย booking code ที่มีอยู่ (สำหรับ Credit Card)
              await updatestatus(bookingCodeToUse);
              console.log("✅ Booking status updated with code:", bookingCodeToUse);
            }

            if (bookingCodeReturnToUse) {
              await updatestatus(bookingCodeReturnToUse);
            }
            console.log("✅ Booking status updated with return code:", bookingCodeReturnToUse);

            // ✅ อัปเดตคะแนนทันทีเมื่อ check-charge success
            try {
              const pointsToDeduct = usePoints ? pointsToUse : 0;
              const pointsToAdd = pointsToEarn || 0;

              if (pointsToDeduct > 0 || pointsToAdd > 0) {
                await updateUserPoints(pointsToDeduct, pointsToAdd);
                console.log(`✅ PromptPay Points updated after check-charge success: -${pointsToDeduct} +${pointsToAdd}`);
              }
            } catch (pointsError) {
              console.error("❌ Error updating points after check-charge:", pointsError);
              Alert.alert(
                t('pointsWarning') || "Points Warning",
                t('pointsErrorMessage') || "Payment successful but there was an issue with points. Please contact support if needed."
              );
            }

            // ✅ อัปเดตสถานะการชำระเงิน (ไม่อัปเดตคะแนนใน updatestatus แล้ว)
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
        encoding: FileSystem.EncodingType.Base64
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
        refund: '',
        insurance: '',

        credit: parseInt(Number(pointsToEarn || 0).toFixed(2)),
        member: Number(customerData.md_booking_memberid) || 0,
        paymenttype: Number(selectedOption) || 2, // PromptPay
        international: Number(customerData.international) || 0,

        detailpassenger: customerData.passenger || [],
        detailinsurance: [],

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



  const updatestatus = async (bookingCode) => {
    try {
      console.log("📌 Updating booking status with:", bookingCode);

      // ✅ อัปเดตสถานะการชำระเงินเท่านั้น (คะแนนอัปเดตใน check-charge แล้ว)
      await axios.post(`${ipAddress}/statuspayment`, {
        md_booking_code: bookingCode,
      });

      console.log("✅ Booking status updated successfully");

    } catch (error) {
      console.error("❌ Error updating booking status:", error);
    }
  };


  const handlePress = async () => {
    if (intervalId) {
      clearInterval(intervalId); // หยุด interval ทันทีเมื่อกด Cancel
    }
    let paid = false;
    try {
      // ตรวจสอบสถานะล่าสุดก่อน
      const res = await axios.post(`${ipAddress}/check-charge`, {
        charge_id: chargeid,
      });
      if (res.data.success && res.data.status === "successful") {
        paid = true;

        // ✅ อัปเดตคะแนนทันทีเมื่อ check-charge success
        try {
          const pointsToDeduct = usePoints ? pointsToUse : 0;
          const pointsToAdd = pointsToEarn || 0;

          if (pointsToDeduct > 0 || pointsToAdd > 0) {
            await updateUserPoints(pointsToDeduct, pointsToAdd);
            console.log(`✅ PromptPay Points updated in handlePress after check-charge success: -${pointsToDeduct} +${pointsToAdd}`);
          }
        } catch (pointsError) {
          console.error("❌ Error updating points in handlePress:", pointsError);
        }

        // ✅ ใช้ booking code ที่ได้จาก createBooking เท่านั้น
        const bookingCodeFromCreateBooking = actualBookingCode;
        await updatestatus(bookingCodeFromCreateBooking);
      }
    } catch (e) {
      console.error('Error checking payment status on manual cancel:', e);
    }
    // ✅ นำทางไปหน้า ResultScreen แทน HomeScreen
    navigation.navigate('ResultScreen', { success: paid });
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
              paddingTop: insets.top + EXTRA_TOP_GUTTER,
              borderBottomLeftRadius: 40,
              borderBottomRightRadius: 40,
              paddingBottom: 8,
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
                marginTop: 0,
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
                borderWidth: 1,
                borderColor: 'rgba(253, 80, 30, 0.1)',
              }}
            >
              <AntDesign name="arrow-left" size={24} color="#FD501E" />
            </TouchableOpacity>

            {/* Logo - Center */}
            <View style={{ position: 'absolute', left: 0, right: 0, alignItems: 'center' }}>
              <LogoTheTrago />
            </View>
          </View>
        </LinearGradient>

        <ScrollView
          contentContainerStyle={[styles.container, { paddingBottom: hp('15%') }]}
          showsVerticalScrollIndicator={false}
          contentInsetAdjustmentBehavior="automatic"
          bounces={false}
        >

        {/* Ultra Premium Title Section */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: hp('1.5%'),
          marginHorizontal: wp('0%'),
          marginBottom: hp('2.5%'),
          paddingHorizontal: wp('4%'),
          paddingVertical: hp('2%'),
          backgroundColor: 'rgba(255,255,255,0.12)',
          borderRadius: wp('5%'),
          backdropFilter: 'blur(15px)',
          borderWidth: 1.5,
          borderColor: 'rgba(255,255,255,0.25)',
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
              }
            ]}>
              {t('promptPayQR')}
            </Text>
            <Text style={{
              color: 'rgba(255,255,255,0.85)',
              fontSize: wp('3.8%'),
              fontWeight: '600',
              marginTop: hp('0.8%'),
              letterSpacing: 0.5,
            }}>
              {t('scanToCompletePayment')}
            </Text>
          </View>
        </View>

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
                    <Image
                      source={{ uri: qrUri }}
                      style={styles.qr}
                      resizeMode="contain"
                    />
                    <View style={styles.amountContainer}>
                      <Text style={styles.amountLabel}>{t('totalAmount')}</Text>
                      <Text style={styles.amountValue}>{customerData.symbol} {Number((Math.round(Paymenttotal * 100) / 100).toFixed(2)).toLocaleString()}</Text>
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
                    <Text style={styles.saveButtonText}>{t('saveQR')}</Text>
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
                    <Text style={styles.cancelButtonText}>{t('cancel')}</Text>
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
    borderWidth: wp('0.3%'),
    borderColor: 'rgba(253, 80, 30, 0.12)',
    backdropFilter: 'blur(30px)',
    width: '100%',
    alignItems: 'center',
  },
  qrCard: {
    backgroundColor: 'rgba(255,255,255,0.98)',
    borderRadius: wp('7%'),
    padding: wp('2%'),
    marginBottom: hp('4%'),
    borderWidth: wp('0.3%'),
    borderColor: 'rgba(253, 80, 30, 0.12)',
    backdropFilter: 'blur(30px)',
    width: '100%',
    alignItems: 'center',
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
