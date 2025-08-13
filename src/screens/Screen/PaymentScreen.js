import React, { useState, useEffect } from "react";
import { View, Text, SafeAreaView, Alert, StyleSheet, TouchableOpacity, ScrollView, Image, ImageBackground, ActivityIndicator, Modal, StatusBar, KeyboardAvoidingView, Platform } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ipAddress from "../../config/ipconfig";
import LogoTheTrago from "./../../components/component/Logo";
import Step from "../../components/component/Step";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Entypo from '@expo/vector-icons/Entypo';
import { MaterialIcons } from '@expo/vector-icons';
import AntDesign from '@expo/vector-icons/AntDesign';
import axios from 'axios';
import { useCustomer } from './CustomerContext';
import { useLanguage } from './LanguageContext';
import moment from "moment-timezone";
import * as Linking from "expo-linking";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import headStyles from '../../styles/CSS/StartingPointScreenStyles';
import styles from '../../styles/CSS/PaymentScreenStyles';

const brandIcons = {
  Visa: require("../../../assets/visa.png"),
  MasterCard: require("../../../assets/mastercard.png"),
  JCB: require("../../../assets/jcb.png"),
  "American Express": require("../../../assets/amex.png"),
  Unknown: require("../../../assets/default-card.png"),
};

const PaymentScreen = ({ navigation, route }) => {
  const { t, selectedLanguage } = useLanguage();
  const { customerData, updateCustomerData } = useCustomer();
  const insets = useSafeAreaInsets();
  const [expirationDate, setExpirationDate] = useState("");
  const [selectedOption, setSelectedOption] = useState(0);
  const [pickup, setPickup] = useState(false);
  const month = expirationDate.substring(0, 2);
  const year = '20' + expirationDate.substring(3, 5);
  const [timetableDepart, settimetableDepart] = useState([]);
  const [timetableReturn, settimetableReturn] = useState([]);

  const [totalPayment, settotalPayment] = useState(0);
  const [totalPaymentNumber, setTotalPaymentNumber] = useState(0);
  const [totalpaymentfee, setTotalPaymentfee] = useState(0);
  
  // Points related states
  const [usePoints, setUsePoints] = useState(false);
  const [pointsToUse, setPointsToUse] = useState(0);
  const [userPoints, setUserPoints] = useState(0);
  const [pointsDiscount, setPointsDiscount] = useState(0);
  const [pointsToEarn, setPointsToEarn] = useState(0);
  const [paymentcode, setpaymentcode] = useState('');
  const [paymentfee, setPaymentfee] = useState(0);
  const [currentDateTime, setCurrentDateTime] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [brand, setBrand] = useState(null);
  const [isSkeletonLoading, setIsSkeletonLoading] = useState(true); // Skeleton loader state
  const [termsModalVisible, setTermsModalVisible] = useState(false);
  const [privacyModalVisible, setPrivacyModalVisible] = useState(false);
  const [priceDepart, setPriceDepart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  console.log("Year:", year);
  console.log("Booking DateTime:", currentDateTime);
  console.log("Brand:", brand);
  console.log(customerData.departtime);
  const handleChange = (text) => {
    // กำจัดสิ่งที่ไม่ใช่ตัวเลข
    let formattedText = text.replace(/\D/g, "");

    // แทรกเครื่องหมาย / หลังจากกรอกเดือน 2 ตัวแรก
    if (formattedText.length > 2) {
      formattedText = formattedText.slice(0, 2) + "/" + formattedText.slice(2, 6);
    }

    // ตั้งค่า expirationDate ใหม่
    setExpirationDate(formattedText);

  };

  // Debug logs เพื่อตรวจสอบ infinite loop
  console.log('🔍 PaymentScreen rendered');

  useEffect(() => {
    console.log('🔍 Payment fee useEffect triggered', selectedOption);
    fetch(`${ipAddress}/paymentfee/${selectedOption}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        console.log('🔍 Payment fee data received:', data);
        // Check if data.data is valid and contains items
        if (data && Array.isArray(data.data) && data.data.length > 0) {
          // Extract the fee value from the first item
          const fee = data.data[0]?.md_paytype_fee ?? 0;
          setPaymentfee(fee); // Set fee directly if available
        } else {
          console.warn('No data found, using default fee value');
          setPaymentfee(0); // Set default fee value if the array is empty
        }
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        setPaymentfee(0); // Default to 0 if there is an error fetching the data
      });
  }, [selectedOption]); // ลบ paymentcode และ bookingcode ออกจาก dependencies



  function formatDate(dateString) {
    const date = new Date(Date.parse(dateString)); // Parses "14 Feb 2025" correctly
    return date.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
  }

  function formatTime(timeString) {
    if (!timeString) return ""; // Handle empty input
    return timeString.slice(0, 5); // Extracts "HH:mm"
  }

  function formatTimeToHoursAndMinutes(time) {
    let [hours, minutes] = time.split(':');

    // กำจัด 0 ด้านหน้า
    hours = parseInt(hours, 10);
    minutes = parseInt(minutes, 10);

    return `${hours} h ${minutes} min`;
  }

  function formatNumber(value) {
    return parseFloat(value).toFixed(2);
  }

  function formatNumberWithComma(value) {
    if (!value) return "0.00";
    const formattedValue = Number(value).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

    console.log("Formatted Value:", formattedValue);
    return formattedValue;
  }

  const fetchTimetableReturn = async () => {
    try {
      const response = await fetch(`${ipAddress}/timetable/${customerData.timeTableReturnId}`);

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();

      if (data && Array.isArray(data.data)) {
        settimetableReturn(data.data);
      } else {
        console.error('Data is not an array', data);
        settimetableReturn([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };


  useEffect(() => {
    if (customerData.roud === 2) {
      fetchTimetableReturn();
    }
  }, [customerData.roud, customerData.timeTableReturnId]); // แยก useEffect สำหรับ fetchTimetableReturn

  useEffect(() => {
    // คำนวณค่าธรรมเนียมและยอดรวมแบบ real-time
    const totalpaymentfee = customerData.total && paymentfee ? (parseFloat(customerData.total) * (parseFloat(paymentfee) / 100)) : 0;
    const totalPayment = customerData.total ? (parseFloat(customerData.total) + totalpaymentfee) : 0;

    setTotalPaymentfee(totalpaymentfee);
    settotalPayment(formatNumber(totalPayment));
  }, [customerData.total, paymentfee, pointsDiscount]); // เพิ่ม pointsDiscount ใน dependencies

  // Fetch user points
  useEffect(() => {
    if (customerData.customer_id || customerData.md_booking_memberid) {
      fetchUserPoints();
    }
  }, [customerData.customer_id, customerData.md_booking_memberid]);

  const fetchUserPoints = async () => {
    try {
      console.log("📌 CustomerData available fields:", Object.keys(customerData));
      console.log("📌 customerData.customer_id:", customerData.customer_id);
      console.log("📌 customerData.md_booking_memberid:", customerData.md_booking_memberid);
      
      // Try to use md_booking_memberid if customer_id is not available
      const userId = customerData.customer_id || customerData.md_booking_memberid;
      console.log("📌 Using userId:", userId);
      
      if (!userId) {
        console.error("❌ No user ID found");
        setUserPoints(0);
        return;
      }

      const response = await fetch(`${ipAddress}/userpoints/${userId}`, {
        method: "GET",
        headers: { 
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
      });

      console.log("📌 Points API Response status:", response.status);
      const text = await response.text();
      let result;
      try {
        result = JSON.parse(text);
      } catch (jsonError) {
        console.error("❌ API did not return JSON:", text);
        setError('API error: response is not JSON');
        setUserPoints(0);
        return;
      }
      console.log("📌 Points API Response data:", result);
      
      if (response.ok && result.status === "success") {
        const availablePoints = result.data?.available_points || 0;
        setUserPoints(availablePoints);
        console.log(`✅ User points fetched: ${availablePoints}`);
      } else {
        console.error("❌ Error fetching points:", result.message);
        setUserPoints(0);
      }
    } catch (error) {
      console.error('❌ Error fetching user points:', error);
      setUserPoints(0);
    }
  };

  // Calculate points discount
  const calculatePointsDiscount = (points) => {
    // 1 คะแนน = 1 บาท ส่วนลด (แต่ไม่เกินยอด total)
    const maxDiscount = parseFloat(customerData.total || 0);
    const discount = Math.min(points, maxDiscount);
    setPointsDiscount(discount);
    console.log(`💡 Points: ${points}, Max discount: ${maxDiscount}, Applied discount: ${discount}`);
    return discount;
  };

  // Handle points usage toggle
  const handlePointsToggle = () => {
    if (!usePoints) {
      const maxPoints = Math.min(userPoints, parseFloat(customerData.total || 0));
      setPointsToUse(maxPoints);
      calculatePointsDiscount(maxPoints);
    } else {
      setPointsToUse(0);
      setPointsDiscount(0);
    }
    setUsePoints(!usePoints);
  };

  // Calculate points to earn from purchase
  const calculatePointsToEarn = (subtotalAmount) => {
    // คำนวณคะแนนจาก subtotal: 1 บาท = 0.01 คะแนน
    const pointsEarned = (subtotalAmount / 100);
    setPointsToEarn(pointsEarned);
    return pointsEarned;
  };

  // Update points (both deduct and add in single API call)
  const updateUserPoints = async (pointsToDeduct = 0, pointsToAdd = 0) => {
    try {
      console.log("🔄 updateUserPoints called with:");
      console.log("   pointsToDeduct:", pointsToDeduct);
      console.log("   pointsToAdd:", pointsToAdd);
      console.log("   customerData.md_booking_memberid:", customerData.md_booking_memberid);
      
      const requestBody = {
        member_id: customerData.md_booking_memberid.toString(),
        md_point_bookingno: "TRANSACTION", // ใช้ default transaction code
        md_point_deposit: pointsToAdd, // เพิ่มคะแนน
        md_point_withdrawal: pointsToDeduct, // หักคะแนน
      };
      
      console.log("📤 Sending to /updatepoints:", JSON.stringify(requestBody, null, 2));
      
      const response = await fetch(`${ipAddress}/updatepoints`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify(requestBody),
      });

      console.log("📥 Response status:", response.status);
      const result = await response.json();
      console.log("📥 Response data:", JSON.stringify(result, null, 2));
      
      if (!response.ok || result.status !== "success") {
        throw new Error(result.message || "Failed to update points");
      }

      // อัปเดตคะแนนในหน้าจอ
      const newPointsBalance = userPoints - pointsToDeduct + pointsToAdd;
      setUserPoints(newPointsBalance);
      
      console.log(`✅ Points updated successfully:`);
      console.log(`   - Deducted: ${pointsToDeduct} points`);
      console.log(`   - Added: ${pointsToAdd} points`);
      console.log(`   - New balance: ${newPointsBalance} points`);
      
      return result;
    } catch (error) {
      console.error("❌ Error updating points:", error);
      throw error;
    }
  };

  useEffect(() => {
    // คำนวณค่าธรรมเนียมและยอดรวมแบบ real-time รวมกับการหักคะแนน
    const originalTotal = customerData.total ? parseFloat(customerData.total) : 0;
    const subtotalAfterPoints = originalTotal - pointsDiscount;
    const totalpaymentfee = subtotalAfterPoints && paymentfee ? (subtotalAfterPoints * (parseFloat(paymentfee) / 100)) : 0;
    const totalPayment = subtotalAfterPoints + totalpaymentfee;

    console.log(`💰 Calculation:`);
    console.log(`   Original Total: ${originalTotal}`);
    console.log(`   Points Discount: ${pointsDiscount}`);
    console.log(`   Subtotal After Points: ${subtotalAfterPoints}`);
    console.log(`   Payment Fee: ${totalpaymentfee}`);
    console.log(`   Final Total: ${totalPayment}`);

    setTotalPaymentfee(totalpaymentfee);
    setTotalPaymentNumber(totalPayment); // เก็บเป็น number สำหรับการคำนวณ
    settotalPayment(formatNumber(totalPayment)); // เก็บเป็น string สำหรับแสดงผล
    
    // คำนวณคะแนนที่จะได้รับจาก subtotal (ก่อนหักคะแนน)
    calculatePointsToEarn(originalTotal);
  }, [customerData.total, paymentfee, pointsDiscount]);


  useEffect(() => {
    console.log('🔍 fetchPriceferry useEffect triggered');
    fetchPriceferry();
  }, [paymentfee,usePoints]); // ระบุ dependencies เฉพาะที่จำเป็นสำหรับ API call

  const fetchPriceferry = async () => {
    console.log('🔍 fetchPriceferry called');
    try {
      const response = await axios.post(
        'https://thetrago.com/api/V1/ferry/Getprice',
        {
          currency: customerData.currency,
          roundtrip: customerData.roud,
          departtrip: customerData.timeTableDepartId,
          returntrip: customerData.timeTableReturnId,
          adult: customerData.adult,
          child: customerData.child,
          infant: customerData.infant,
          departdate: customerData.departdate,
          returndate: customerData.returndate,
          pickupdepart1: customerData.pickupDepartId,
          pickupdepart2: customerData.pickupReturnId,
          dropoffdepart1: customerData.dropoffDepartId,
          dropoffdepart2: customerData.dropoffReturnId,
          paymentfee: paymentfee,
          promotioncode: customerData.md_booking_promocode,
          credit: usePoints ? parseInt(pointsToUse) : 0, // แปลง boolean เป็น integer
          member: customerData.md_booking_memberid, 
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.status === 'success') {
        setPriceDepart(Array.isArray(response.data.data)
          ? response.data.data
          : [response.data.data]);

        // อัปเดต customerData เฉพาะเมื่อจำเป็น เพื่อป้องกัน infinite loop
        const newBookingData = {
          md_booking_price: response.data.data.totalDepart.priceadult,
          md_booking_total: response.data.data.totalbooking_insert,
          md_booking_vat: response.data.data.vat,
          md_booking_currency: response.data.data.totalDepart.currencycode,
          md_booking_net: response.data.data.totalDepart.priceadultnet,
          md_booking_pay: selectedOption,
          md_booking_payfee: response.data.data.paymentfee,
        };

        // เช็คว่าข้อมูลเปลี่ยนแปลงจริงๆ หรือไม่ก่อนอัปเดต
        const hasChanged = (
          customerData.md_booking_price !== newBookingData.md_booking_price ||
          customerData.md_booking_total !== newBookingData.md_booking_total ||
          customerData.md_booking_vat !== newBookingData.md_booking_vat ||
          customerData.md_booking_currency !== newBookingData.md_booking_currency ||
          customerData.md_booking_net !== newBookingData.md_booking_net ||
          customerData.md_booking_pay !== newBookingData.md_booking_pay ||
          customerData.md_booking_payfee !== newBookingData.md_booking_payfee
        );

        if (hasChanged) {
          updateCustomerData(newBookingData);
        }

      } else {
        setError('ไม่สามารถโหลดข้อมูลได้');
      }
    } catch (err) {
      console.error("❌ API Error:", err.response?.data || err.message);
      setPriceDepart([]);
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ API');
    } finally {
      setLoading(false);
    }
  };





  const handlePayment = async () => {
    setIsLoading(true); // Show loading spinner immediately
    // ✅ ใช้ selectedCard ที่ได้จากการเลือกบัตร
    if (!selectedCard) {
      setIsLoading(false);
      Alert.alert(t('noCardSelected') || "No Card Selected", t('pleaseSelectCard') || "Please select a card to continue.");
      return;
    }
    // log ข้อมูลบัตรที่เลือก
    console.log("Selected Card:", selectedCard);

    let newErrors = {};
    if (!selectedCard.cardName) newErrors.cardName = true;
    if (!selectedCard.cardNumber) newErrors.cardNumber = true;
    if (!selectedCard.expiry) newErrors.expirationDate = true;
    if (!selectedCard.cvv) newErrors.cvv = true;

    // --- Robust expiration year and month handling ---
    let expMonth, expYearRaw, expYear;
    if (selectedCard.expiry && selectedCard.expiry.includes("/")) {
      [expMonth, expYearRaw] = selectedCard.expiry.split("/");
      expMonth = expMonth.trim();
      expYearRaw = expYearRaw.trim();
      // Pad month to 2 digits
      if (/^\d{1}$/.test(expMonth)) {
        expMonth = "0" + expMonth;
      }
      // Year logic
      if (/^\d{4}$/.test(expYearRaw)) {
        expYear = expYearRaw;
      } else if (/^\d{2}$/.test(expYearRaw)) {
        expYear = "20" + expYearRaw;
      } else {
        expYear = null;
      }
    } else {
      expMonth = null;
      expYear = null;
    }
    if (!expMonth || !expYear || !/^\d{2}$/.test(expMonth) || !/^\d{4}$/.test(expYear)) {
      Alert.alert(t('invalidExpiryDate') || "Invalid Expiry Date", t('checkExpiryFormat') || "Please check the card's expiration date format (MM/YY or MM/YYYY). Month must be 2 digits, year must be 4 digits.");
      return;
    }
    // --- End robust expiration year and month handling ---

    // Debug log the card data to be sent
    const cardPayload = {
      name: selectedCard.cardName || selectedCard.name || '',
      number: selectedCard.cardNumber,
      expiration_month: expMonth,
      expiration_year: expYear,
      security_code: selectedCard.cvv,
    };
    console.log("Card payload for token:", cardPayload);

    try {
      // ✅ 1. สร้าง Token ของบัตรเครดิต
      const tokenResponse = await fetch(`${ipAddress}/create-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          card: cardPayload,
        }),
      });
      const tokenText = await tokenResponse.text();
      console.log("Token API raw response:", tokenText);
      let tokenData;
      try {
        tokenData = JSON.parse(tokenText);
      } catch (e) {
        throw new Error(" Invalid JSON from token API");
      }
      if (!tokenResponse.ok) throw new Error("Failed to create payment token");
      if (!tokenData.success) throw new Error(tokenData.error || " Token API error");

      // ✅ 2. ทำการชำระเงิน
      const paymentResponse = await fetch(`${ipAddress}/charge`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true", },
        body: JSON.stringify({
          amount: totalPaymentNumber, // ส่งยอดรวมจริงเป็น number
          token: tokenData.token,
          return_uri: `${ipAddress}/redirect`,
          usePoints: usePoints,
          pointsUsed: pointsToUse,
          pointsDiscount: pointsDiscount,
          userId: customerData.customer_id, // ส่ง customer_id เพื่อหักคะแนน
        }),
      });


      if (!paymentResponse.ok) throw new Error("Payment failed");
      const paymentResult = await paymentResponse.json();
      if (!paymentResult.success) throw new Error("Payment declined");

      if (paymentResult.authorize_uri) {
        console.log("🔗 Redirecting to:", paymentResult.authorize_uri);
        await Linking.openURL(paymentResult.authorize_uri); // 👉 เปิดหน้า OTP หรือธนาคาร

      } else {
        throw new Error("No authorize URI found.");
      }

      // ✅ 4. บันทึก Payment Code และสร้าง Booking

      setpaymentcode(paymentResult.charge_id);
      updateCustomerData({
        md_booking_paymentid: paymentResult.charge_id, // บันทึก Payment ID
      });
      console.log('✅ Payment code:', paymentcode);
      // ✅ 3. เปิด Omise Authorize URL

      // แก้ไข: ไม่อัปเดต total ด้วยยอดรวม (totalPayment) แต่เก็บค่าธรรมเนียมแยก
      updateCustomerData({
        bookingdate: moment().tz("Asia/Bangkok").format("YYYY-MM-DD"),
        paymentfee: totalpaymentfee, // เก็บค่าธรรมเนียมแยก
        // total: customerData.total, // ไม่ต้องอัปเดต total
      });
      
      // ✅ สร้าง Booking และรับ booking code จาก API response
      const bookingResult = await createBooking(paymentResult.charge_id);
      
      if (bookingResult.success) {
        console.log("✅ Booking created with code:", bookingResult.bookingCode);

      if (paymentResult.authorize_uri) {
        console.log("🔗 Redirecting to:", paymentResult.authorize_uri);
        await Linking.openURL(paymentResult.authorize_uri); // 👉 เปิดหน้า OTP หรือธนาคาร
      } else {
        throw new Error("No authorize URI found.");
      }
        
        // ใช้ booking code จาก API response แทนค่าที่ pre-fetch มา
        const actualBookingCode = bookingResult.bookingCode;
        
        if (customerData.international === 1) {
          submitPassengers(customerData.passenger, actualBookingCode);
        } else {
          createPassenger(actualBookingCode);
        }
      } else {
        throw new Error("Failed to create booking");
      }
      setIsLoading(false);
      console.log("✅ Loading stopped...");

    } catch (error) {
      console.error("❌ Error:", error);
      setIsLoading(false);
      Alert.alert(t('error') || "Error", error.message);
    }
  };

  const handlePaymentPromptpay = async () => {
    setIsLoading(true);
    console.log("🔄 Loading started...");
    
    updateCustomerData({
      paymentfee: totalpaymentfee,
      paymenttype: selectedOption,
      usePoints: usePoints,
      pointsUsed: pointsToUse,
      pointsDiscount: pointsDiscount,
      // ไม่ต้องอัปเดต total
    });
    
    navigation.navigate("PromptPayScreen", { 
      Paymenttotal: totalPaymentNumber,
      selectedOption: selectedOption,
      usePoints: usePoints,
      pointsToUse: pointsToUse,
      pointsToEarn: pointsToEarn,
    });
    
    setIsLoading(false);
    console.log("✅ Loading stopped...");
  };




  // 🛠️ ฟังก์ชันสำหรับสร้าง Booking
  const createBooking = async (paymentCode) => {
    try {
      console.log("country:", customerData.country);
      console.log("📌 Creating Booking with Payment Code:", paymentCode);
      const response = await axios.post(`${ipAddress}/booking`, {
        md_booking_memberid: customerData.md_booking_memberid,//1
        md_booking_affiliate_id: customerData.md_booking_affiliate_id,//2
        md_booking_affiliate_subid: customerData.md_booking_affiliate_subid,//3
        md_booking_affiliate_price: customerData.md_booking_affiliate_price, //
        md_booking_companyid: customerData.md_booking_companyid, //
        md_booking_reference: customerData.md_booking_reference, //
        md_booking_paymentid: paymentCode, //
        md_booking_boattypeid: customerData.md_booking_boattypeid, //
        md_booking_country: customerData.md_booking_country, //
        md_booking_countrycode: customerData.md_booking_countrycode, //
        md_booking_round: customerData.md_booking_round, //
        md_booking_timetableid: customerData.md_booking_timetableid, //
        md_booking_tel: customerData.md_booking_tel, //
        md_booking_whatsapp: customerData.md_booking_whatsapp, //
        md_booking_email: customerData.md_booking_email, //
        md_booking_price: customerData.md_booking_price,//
        md_booking_total: customerData.md_booking_total, //
        md_booking_vat: customerData.md_booking_vat, //
        md_booking_paypal: customerData.md_booking_paypal, //
        md_booking_refund: customerData.md_booking_refund,//
        md_booking_refundprice: customerData.md_booking_refundprice, //
        md_booking_credit: customerData.md_booking_credit,//
        md_booking_insurance: customerData.md_booking_insurance, //
        md_booking_currency: customerData.md_booking_currency, //
        md_booking_net: customerData.md_booking_net, //
        md_booking_adult: customerData.md_booking_adult,//
        md_booking_child: customerData.md_booking_child, //
        md_booking_infant: customerData.md_booking_infant,//
        md_booking_departdate:  customerData.md_booking_departdate,//
        md_booking_departtime: customerData.md_booking_departtime, //
        md_booking_remark: customerData.md_booking_remark,//
        md_booking_note: customerData.md_booking_note, //
        md_booking_statuspayment: customerData.md_booking_statuspayment, //
        md_booking_status: customerData.md_booking_status, //
        md_booking_pay: customerData.md_booking_pay, //
        md_booking_payfee: customerData.md_booking_payfee,//
        md_booking_lang: customerData.md_booking_lang, //
        md_booking_from: customerData.md_booking_from,//
        md_booking_sent: customerData.md_booking_sent,//
        md_booking_sentbooking: customerData.md_booking_sentbooking,//
        md_booking_senttransfer: customerData.md_booking_senttransfer, //
        md_booking_device: customerData.md_booking_device,//
        md_booking_agentid: customerData.md_booking_agentid, //
        md_booking_agentprice: customerData.md_booking_agentprice,//
        md_booking_promocode: customerData.md_booking_promocode,
        md_booking_promoprice: customerData.md_booking_promoprice,
        md_booking_crebyid: customerData.md_booking_crebyid, //     
        md_booking_updatebyid:customerData.md_booking_updatebyid,//
      });

      console.log("📋 Booking API Response:", response.data);

      // ✅ ตรวจสอบ status และ set booking code
      if (response.data && response.data.status === 'success') {
        const bookingCode = response.data.booking_code;
        const groupCode = response.data.group_code;
        
        console.log("✅ Booking created successfully");
        console.log("📌 Booking Code:", bookingCode);
        console.log("📌 Group Code:", groupCode);
        
        // อัปเดต customerData ด้วย booking codes
        updateCustomerData({
          md_booking_code: bookingCode,
          md_booking_groupcode: groupCode,
        });
        
        return {
          success: true,
          bookingCode: bookingCode,
          groupCode: groupCode,
          message: response.data.message
        };
      } else {
        console.error("❌ Booking creation failed:", response.data);
        throw new Error(response.data.message || "Failed to create booking");
      }
    } catch (error) {
      console.error("❌ Error submitting booking:", error.response?.data || error.message);
      throw new Error("Failed to create booking");
    }
  };

  const createPassenger = async (bookingCode) => {
    try {
      console.log("📌 Creating Booking with:", bookingCode);
      await axios.post(`${ipAddress}/passenger`, {
        md_passenger_bookingcode: bookingCode,
        md_passenger_prefix: customerData.selectedTitle,
        md_passenger_fname: customerData.Firstname,
        md_passenger_lname: customerData.Lastname,
        md_passenger_idtype: Number(customerData.international),
        md_passenger_nationality: customerData.country,

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
        md_booking_code: bookingCode,

      });

      console.log("✅ Booking update status successfully");
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

      Alert.alert(t('success') || 'Success', t('allPassengersSubmitted') || 'All passengers submitted!');
    } catch (error) {
      console.error('❌ Failed to submit passenger:', error.response?.data || error.message);
      Alert.alert(t('error') || 'Error', t('couldNotSubmitData') || 'Could not submit passenger data');
    }
  };




  useEffect(() => {
    const handleDeepLink = async (event) => {
      let url = event.url || "";
      console.log("🔗 Deep Link Received:", url);

      // ตรวจสอบว่าหน้าปัจจุบันคือ PromptPayScreen หรือไม่
      const currentRoute = navigation.getCurrentRoute && navigation.getCurrentRoute();
      if (currentRoute && currentRoute.name !== "PromptPayScreen") {
        console.log("⏹️ Stop: Not on PromptPayScreen, skipping payment status check.");
        return;
      }

      if (url.includes("payment/success")) {
        try {
          // ส่งคำขอตรวจสอบการชำระเงิน
          const res = await axios.post(`${ipAddress}/check-charge`, {
            charge_id: customerData.md_booking_paymentid,
          });
          console.log("LOG  Payment Status Response:", JSON.stringify(res.data));
          // ถ้า authorize_uri เป็น null และไม่ได้อยู่ PromptPayScreen ให้หยุด
          if (!res.data.authorize_uri && currentRoute && currentRoute.name !== "PromptPayScreen") {
            console.log("⏹️ Stop: authorize_uri is null and not on PromptPayScreen");
            return;
          }
          if (res.data.success && res.data.status === "successful") {
            try {
              // ✅ ตรวจสอบว่ามี booking code หรือไม่ (Credit Card จะมี, PromptPay อาจไม่มี)
              const bookingCodeToUse = customerData.md_booking_code;
              
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
              
              // ✅ จัดการคะแนนหลังจากยืนยันการชำระเงินสำเร็จ
              const pointsToDeduct = usePoints ? pointsToUse : 0;
              const pointsToAdd = pointsToEarn || 0;
              
              if (pointsToDeduct > 0 || pointsToAdd > 0) {
                await updateUserPoints(pointsToDeduct, pointsToAdd);
                console.log(`✅ Points updated: -${pointsToDeduct} +${pointsToAdd}`);
              }
              
            } catch (error) {
              console.error("❌ Error managing points or booking status:", error);
              Alert.alert(
                t('pointsWarning') || "Points Warning", 
                t('pointsErrorMessage') || "Payment successful but there was an issue with points/booking management. Please contact support if needed."
              );
            }
            navigation.navigate("ResultScreen", { success: true });
          } else {
            navigation.navigate("ResultScreen", { success: false });
          }
        } catch (error) {
          console.error("Error checking charge:", error);
          Alert.alert(t('error') || "❌ Error", t('errorProcessingPayment') || "There was an error processing your payment.");
          navigation.navigate("ResultScreen", { success: false });
        }
      } else if (url.includes("payment/failure")) {
        Alert.alert(t('paymentFailed') || "❌ Payment Failed", t('somethingWentWrong') || "Something went wrong with your payment.");
        navigation.navigate("ResultScreen", { success: false });
      }
    };

    // ตรวจจับเมื่อแอปเปิดอยู่ (Foreground)
    const subscription = Linking.addEventListener("url", handleDeepLink);

    // ตรวจจับลิงก์ที่ใช้เปิดแอป (Background หรือ Closed State)
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink({ url });
    });

    return () => {
      subscription.remove();
    };
  }, [navigation, paymentcode, totalPayment]); // ลบ bookingcode และ booking_code ออกจาก dependencies



  const handleSelection = (option) => {
    setSelectedOption(option);

  };

  useEffect(() => {
    if (customerData.timeTableDepartId) {
      fetch(`${ipAddress}/timetable/${customerData.timeTableDepartId}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then((data) => {
          if (data && Array.isArray(data.data)) {
            settimetableDepart(data.data);
          } else {
            console.error('Data is not an array', data);
            settimetableDepart([]);
          }
        })
        .catch((error) => {
          console.error('Error fetching data:', error);
        });
    }
  }, [customerData.timeTableDepartId]); // เพิ่ม dependency ที่จำเป็น

  const detectCardBrand = (number) => {
    if (/^4[0-9]{0,}$/.test(number)) return "Visa";
    if (/^5[1-5]/.test(number)) return "MasterCard";
    if (/^3[47]/.test(number)) return "American Express";
    if (/^35(2[89]|[3-8][0-9])/.test(number)) return "JCB";
    return "Unknown";
  };

  // State for saved cards (mock, replace with backend/local storage as needed)
  const [savedCards, setSavedCards] = useState([]);
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null); // สำหรับเก็บบัตรที่เลือก

  // Sync selectedCard กับ selectedCardId เสมอ
  useEffect(() => {
    if (selectedCardId) {
      const card = savedCards.find(card => card.id === selectedCardId);
      setSelectedCard(card || null);
    } else {
      setSelectedCard(null);
    }
  }, [selectedCardId, savedCards]);

  // Handle new card addition from AddCardScreen
  useEffect(() => {
    if (route.params && route.params.newCard) {
      const newCard = route.params.newCard;
      // Detect card brand before saving
      const brand = detectCardBrand((newCard.cardNumber || '').replace(/\s/g, ''));
      setSavedCards(prev => [...prev, { ...newCard, brand }]);
      setSelectedCardId(newCard.id);
      // Clear the param so it doesn't re-add on re-render
      navigation.setParams({ newCard: undefined });
    }
  }, [route.params?.newCard]);

  // Function to remove a card by id
  const handleRemoveCard = (id) => {
    setSavedCards(prev => prev.filter(card => card.id !== id));
    // If the removed card was selected, clear selection and selectedCard
    if (selectedCardId === id) {
      setSelectedCardId(null);
      setSelectedCard(null);
    }
  };

  // When all required data is loaded, hide skeleton
  useEffect(() => {
    // If both timetableDepart and (if round trip) timetableReturn are loaded, hide skeleton
    if (
      timetableDepart.length > 0 &&
      (customerData.roud !== 2 || timetableReturn.length > 0)
    ) {
      setIsSkeletonLoading(false);
    }
  }, [timetableDepart, timetableReturn, customerData.roud]);

  // โหลดบัตรที่เคยบันทึกไว้จาก AsyncStorage
  useEffect(() => {
    AsyncStorage.getItem('savedCards').then(data => {
      if (data) setSavedCards(JSON.parse(data));
    });
  }, []);

  // บันทึกบัตรลง AsyncStorage ทุกครั้งที่ savedCards เปลี่ยน
  useEffect(() => {
    AsyncStorage.setItem('savedCards', JSON.stringify(savedCards));
  }, [savedCards]);

  return (
    <SafeAreaView 
      style={[
        { flex: 1 },
        Platform.OS === 'android' && Platform.Version >= 31 && {
          paddingTop: 0, // ใน Android 15 จะจัดการ insets เอง
        }
      ]}
    >
      <StatusBar 
        barStyle="light-content" 
        backgroundColor={Platform.OS === 'android' && Platform.Version >= 31 ? "transparent" : "#001233"}
        translucent={true}
      />
      <View style={{ flex: 1 }}>
      {/* ✅ หน้าหมุนแสดงระหว่างรอการชำระเงิน */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FD501E" />
          <Text style={styles.loadingText}>{t('processingPayment') || 'Processing Payment...'}</Text>
        </View>
      )}
      {/* Skeleton Loader */}
      {isSkeletonLoading ? (
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.skeletonCard}>
            <View style={styles.skeletonRow}>
              <View style={styles.skeletonCircle} />
              <View style={styles.skeletonLineShort} />
            </View>
            <View style={styles.skeletonCardList}>
              {[1, 2].map(i => (
                <View key={i} style={styles.skeletonCardItem}>
                  <View style={styles.skeletonCardIcon} />
                  <View style={{ flex: 1 }}>
                    <View style={styles.skeletonLine} />
                    <View style={styles.skeletonLineSmall} />
                  </View>
                </View>
              ))}
              <View style={styles.skeletonAddCardBtn} />
            </View>
          </View>
          <View style={styles.skeletonCard}>
            <View style={styles.skeletonLine} />
            <View style={styles.skeletonLine} />
            <View style={styles.skeletonLineSmall} />
            <View style={styles.skeletonLineSmall} />
            <View style={styles.skeletonLine} />
          </View>
          <View style={styles.skeletonButton} />
        </ScrollView>
      ) : (
        // ...existing code for ScrollView and content...
        <SafeAreaView style={{ flex: 1 }}>
          {/* Premium Gradient Background */}
          <LinearGradient
            colors={['#001233', '#002A5C', '#FD501E']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1.2 }}
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

            {/* Enhanced Ultra Premium Title Section */}
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: hp('1%'),
              marginHorizontal: wp('6%'),
              marginBottom: hp('2%'),
              paddingHorizontal: wp('2%'),
              paddingVertical: hp('1.5%'),
              backgroundColor: 'rgba(255,255,255,0.1)',
              borderRadius: wp('4%'),
              backdropFilter: 'blur(10px)',
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.2)',
            }}>
              <View style={{ flex: 1 }}>
                <Text style={[
                  headStyles.headerTitle,
                  {
                    color: '#FFFFFF',
                    fontSize: wp('7%'),
                    fontWeight: '800',
                    letterSpacing: -0.5,
                    textAlign: 'left',
                    marginLeft: 0,
                    lineHeight: wp('8%'),
                    textShadowColor: 'rgba(0,0,0,0.3)',
                    textShadowRadius: 4,
                    textShadowOffset: { width: 1, height: 1 },
                  }
                ]}>
                  {t('payment') || 'Payment'}
                </Text>
                <Text style={{
                  color: 'rgba(255,255,255,0.8)',
                  fontSize: wp('3.5%'),
                  fontWeight: '500',
                  marginTop: hp('0.5%'),
                  letterSpacing: 0.3,
                  textShadowColor: 'rgba(0,0,0,0.2)',
                  textShadowRadius: 2,
                }}>
                  {t('completeBookingPayment') || 'Complete your booking payment'}
                </Text>
              </View>
            </View>

            <StatusBar barStyle="light-content" backgroundColor="#FD501E" translucent />

            <KeyboardAvoidingView
              behavior="padding"
              style={{ flex: 1 }}
            >
              <ScrollView
                contentContainerStyle={[styles.container, { paddingBottom: hp('12%') }]}
                showsVerticalScrollIndicator={false}
                style={{ flex: 1 }}
                contentInsetAdjustmentBehavior="automatic"
              >
                {/* Step Component */}
                <View style={{
                  alignItems: 'center',
                  marginTop: hp('1%'),
                  marginBottom: hp('2%'),
                }}>
                  <Step logoUri={3} />
                </View>

                {/* Content Container */}
                <View style={styles.contentContainer}>
                  <View style={styles.card}>
                    <View style={styles.row}>
                      <FontAwesome name="credit-card" size={24} color="black" marginRight='10' />
                      <Text style={styles.header}>{t('paymentOptions') || 'Payment Options'}</Text>
                    </View>

                    {/* Radio Button 1 */}
                    <View style={styles.radioContian}>
                      <TouchableOpacity
                        style={styles.optionContainer}
                        onPress={() => handleSelection("7")}
                      >
                        <View
                          style={[
                            styles.radioButton,
                            selectedOption === "7" && styles.selectedRadio,
                          ]}
                        >
                          {selectedOption === "7" && (
                            <AntDesign name="check" size={wp('3%')} color="#FFFFFF" />
                          )}
                        </View>
                        <View style={styles.logodown}>
                          <Text style={styles.labelHead}>{t('creditDebitCard') || 'Credit and Debit Card'}</Text>
                        </View>
                        <FontAwesome name="chevron-down" size={18} color="#FD501E" style={styles.icon} />
                      </TouchableOpacity>
                      {selectedOption === "7" && (
                        <View style={{ marginTop: 10 }}>
                          {/* Card List */}
                          {savedCards.length > 0 ? (
                            savedCards.map(card => (
                              <TouchableOpacity
                                key={card.id}
                                style={[styles.savedCardItem, selectedCardId === card.id && styles.selectedCard]}
                                onPress={() => {
                                  setSelectedCardId(card.id);
                                  console.log('Selected Card:', card);
                                }}
                                activeOpacity={0.8}
                              >
                                <View style={styles.cardInfoRow}>
                                  <Image source={brandIcons[card.brand] || brandIcons.Unknown} style={styles.savedCardIcon} />
                                  <View style={{ flex: 1 }}>
                                    <Text style={styles.savedCardNumber}>{'**** **** **** ' + card.cardNumber.slice(-4)}</Text>
                                    <Text style={styles.savedCardName}>{card.cardName}  |  {card.expiry}</Text>
                                  </View>
                                  {selectedCardId === card.id && (
                                    <AntDesign name="checkcircle" size={22} color="#FD501E" style={{ marginLeft: 8 }} />
                                  )}
                                  <TouchableOpacity
                                    onPress={() => handleRemoveCard(card.id)}
                                    style={{ marginLeft: 10, padding: 4 }}
                                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                  >
                                    <AntDesign name="delete" size={20} color="#FD501E" />
                                  </TouchableOpacity>
                                </View>
                              </TouchableOpacity>
                            ))
                          ) : (
                            <Text style={{ color: '#888', marginBottom: 12 }}>{t('noCardsSaved') || 'No cards saved yet.'}</Text>
                          )}
                          <TouchableOpacity
                            style={styles.addCardButton}
                            onPress={() => {
                              navigation.navigate('AddCardScreen', {
                                onAddCard: (newCard) => {
                                  navigation.setParams({ newCard });
                                },
                                nextCardId: (savedCards.length + 1).toString(),
                              });
                            }}
                          >
                            <AntDesign name="pluscircleo" size={18} color="#fff" style={{ marginRight: 6 }} />
                            <Text style={{ color: '#fff', fontWeight: 'bold' }}>{t('addCard') || 'Add Card'}</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>

                    {/* Radio Button 2 */}
                    <View style={styles.radioContian}>
                      <TouchableOpacity
                        style={styles.optionContainer}
                        onPress={() => handleSelection("2")}
                      >
                        <View
                          style={[
                            styles.radioButton,
                            selectedOption === "2" && styles.selectedRadio,
                          ]}
                        >
                          {selectedOption === "2" && (
                            <AntDesign name="check" size={wp('3%')} color="#FFFFFF" />
                          )}
                        </View>
                        <View style={styles.logodown}>
                          <Text style={styles.labelHead}>{t('promptPay') || 'PromptPay'}</Text>
                        </View>
                        <FontAwesome name="chevron-down" size={18} color="#FD501E" style={styles.icon} />
                      </TouchableOpacity>
                    </View>

                    <View style={styles.row}>
                      <View style={styles.checkboxContainer}>
                        <TouchableOpacity onPress={() => setPickup(!pickup)}>
                          <MaterialIcons name={pickup ? "check-box" : "check-box-outline-blank"} size={24} color="#FD501E" style={{ marginRight: 8, marginTop: -5 }} />
                        </TouchableOpacity>
                      </View>
                      <View style={styles.textContainer}>
                        <Text style={styles.label}>
                          {t('agreeTermsText') || 'I understand and agree with the'}{' '}
                          <Text style={styles.textcolor} onPress={() => setTermsModalVisible(true)}>
                            {t('termsOfServices') || 'Terms of Services'}
                          </Text>
                          {' '}{t('and') || 'and'} <Text style={styles.textcolor} onPress={() => setPrivacyModalVisible(true)}>{t('policy') || 'Policy'}</Text>
                        </Text>
                      </View>
                    </View>
                  </View>
                  {/* Terms and Conditions Modal */}
                  <Modal
                    visible={termsModalVisible}
                    transparent={true}
                    animationType="slide"
                    onRequestClose={() => setTermsModalVisible(false)}
                  >
                    <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
                      <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 20, width: '90%', maxHeight: '85%' }}>
                        <ScrollView>
                          <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 10, color: '#FD501E', textAlign: 'center' }}>{t('termsAndConditions') || 'Terms and conditions'}</Text>
                          <Text style={{ fontSize: 15, color: '#222' }}>{'1. Copyright\nThe Trago.com (Company Registration No.0905560003303) The Trago.com is the sole owner or lawful license of all right to www.thetrago.com\n\n2. Confirmation\nCustomers are responsible to make sure the selection on travelling date, time and destination are correct before making payment. By making payment and the issuance of Order Summary/Booking number/ Itinerary, the seats are confirmed immediately. All passengers above the age of 3 years old will be required to purchase a seat.\n\n3. Cancellations and Refunds\nRefunds are not available if the travel date is less than 72 hours away. Cancellations must be requested at least 72 hours before departure to qualify for a refund. Refunds will be processed within 1-7 business days to the original payment method.\n\n4. Validity\nFerry voucher is issued in the passenger’s name which is personal and non-transferable. It is valid only for the date and the trip for which it was issued.\n\n5. Check –in\nAll Passenger(s) has to contact to check-in at the counter at least 30 minutes in advance before departure time.\n\nFor foreign tourists might take more time at immigration so it is passenger(s) responsibility to make sure you can reach it on time before the ferry leaves. If passenger fail to board on time, passenger has to arrange your own transport to the destination.\n\nIn case a customer is more than the total that stated on the voucher or infant ages is over than boat company conditions , the boat company will charge the difference of amount from a customer right away at the counter.\n\n6. Ferry voucher\nThe voucher will send to you on e-mail when your booking is completed. If you have not received the voucher, please contact us by email or phone call to inform us the issues. Our customer support team will assist you to check and resend the voucher.\n\nPlease print the voucher or screen shot on your phone to show to the staff.\n\nThe Trago reserves the right to automatically change your reserved ticket itinerary if there are services for the same route or close round.\n\n7. No Show\nIf you are unable to board the ferry or bus on time or according to the schedule, you will be charged the full fare and will not be refunded.\n\n8. Passenger’s ticket conditions\nCompany is not responsible for any delay for boarding, deviation or modification of the scheduled route, due to bad weather conditions or pier authority orders. Passengers are entitled to carry maximum 2 pieces of baggage and maximum weight of the total luggage is 15 kilograms. The company is not responsible for any damage or loss of luggage retained under passenger’s personal care during the trip.\n\n9. Shuttle Companies Rights\nShuttle Company reserves the right to change or amend the itineraries without prior notice. Van/Bus seating depending on company design. The Trago.com will not responsible for any sudden change in van/bus schedules and customer waiting at the wrong boarding/pick-up point.\n\n10. Request on Van/Bus Seating Requirement\nCompany will provide the van/bus that are either self-owned or on charter from third parties. Company makes reasonable efforts to deliver the type of vehicle accord to what the customer booked for. However, the company reserves the right to replace, downgrade or upgrade the vehicle type booked by the customers in the event of unforeseen circumstances.\n\nThe company will not be held responsible for any contingent cost incurred by the customer arising from the van/bus delay.\n\nAll passengers above the age of 3 years old will be required to purchase a seat. The company shall not be responsible for any legal implications resulted from passengers not complying with the regularities.\n\n11. The Trago.com Legal Notice\nThe Trago.com will not liable and will not refund due to any action carried out by our ferry/shuttle company partners, or any event happens at our partner’s side. For instances, The Trago.com will not be responsible for any sudden change from ferry company or shuttle company , seat number(s), schedules, departure date & time, arrival date & time, loss or accident incurred while taking the ferry/shuttle or no ferry/shuttle service provided. However, customer may complain to us, and we will take necessary actions to prevent such things from happen again in the future.\n\nThe Trago.com will not include the following responsible of ,\n\n(a) Ferry/Shuttle not departing / reaching on time.\n\n(b) Maintaining the quality of Ferry/Shuttle, staff behavior and punctuality.\n\n(c) Ferry/Shuttle operator canceling the service due to unavoidable reasons.\n\n(d) The baggage of the customer getting lost / stolen / damaged.\n\n(e) The customer waiting at the wrong boarding point/pick-up point (please call the ferry/shuttle operator to find out the exact boarding point).\n\n(f) The Ferry/Shuttle operator changing the boarding point and/or using a pick-up vehicle (i.e : van transfer) at the boarding point to take customers to the ferry departure point.\n\n(g) The Trago.com is not be responsible for any sudden change in Ferry/Shuttle, schedules, departure date & time, arrival date & time, loss or accident incurred while taking ferry/shuttle.\n\n(h) Ferry / shuttle operators Request a fare increase before travelling. As the oil price situation\n\n12. Financial proof\nI confirm that the proof of payment. (Transfer slip) is a true and correct document It is not a fake document. Add or shorten the message Or modify by any means If it is later detected that it is a fake document I solely accept my breach of the law.'}</Text>
                        </ScrollView>
                        <TouchableOpacity
                          style={{ alignSelf: 'center', marginTop: 18, backgroundColor: '#FD501E', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 30 }}
                          onPress={() => setTermsModalVisible(false)}
                        >
                          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>{t('close') || 'Close'}</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </Modal>
                  {/* Privacy Policy Modal */}
                  <Modal
                    visible={privacyModalVisible}
                    transparent={true}
                    animationType="slide"
                    onRequestClose={() => setPrivacyModalVisible(false)}
                  >
                    <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
                      <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 20, width: '90%', maxHeight: '85%' }}>
                        <ScrollView>
                          <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 10, color: '#FD501E', textAlign: 'center' }}>{t('privacyPolicy') || 'Privacy Policy'}</Text>
                          <Text style={{ fontSize: 15, color: '#222' }}>{`The Trago is committed to respecting and protecting your privacy and complying with data protection and privacy laws. We have provided this Privacy Policy to help you understand how we collect, use, store, and protect your information as one of our customers. Please take a few moments to read the sections below and learn how we may use your personal information.\n\nFor all our services, the data controller, the company responsible for your privacy is The Trago\n\nYou should read this notice in conjunction with our cookies policy and the terms & conditions of use for The Trago websites and any separate terms & conditions issued with your booking of Thetrago or other products and services.\n\nOur Legal Basis for Using Your Personal Information\nWe will only process your personal information where we have a legal basis to do so. The legal basis will depend on the reason or reasons The Trago has collected and needs to use your information. Under EU and UK data protection laws, in almost all cases the legal basis will be:\n\nBecause we need to use your information to process your booking, fulfill your travel arrangements, and otherwise perform the contract we have with you.\nBecause it is in The Trago’s legitimate interests as a company to use your personal information to operate and improve our business as a travel provider.\nBecause we need to use your personal information to comply with a legal obligation.\n>To protect the vital interests of you or another person.\nBecause you have consented to The Trago using your information for a particular purpose.\nIf processing of your data is subject to any other laws, then the basis of processing your data may be different to that set out above and may in those circumstances be based on your consent in all cases.\n\nWhat Types of Personal Information Do We Collect From You?\nWe endeavor to collect and use your personal information only with your knowledge and consent. We collect information when you use the The Trago website, one of our products or services, or communicate with us. This information and the details of anyone traveling with you are necessary for the adequate performance of our contract with you and to allow us to comply with our legal obligations. Without it, we may not be able to provide you with all requested services.\n\nWe collect the following categories of personal information:\n\nyou provide to us to complete and manage your booking or another service you have requested from us: For example, your name, address, email, contact details, date of birth, gender, passport number, your vehicle details, and payment information. The exact information required will depend on the requirements of the ferry operator.\nInformation about your travel arrangements: For example, your travel itinerary and other information related to your booking.\nInformation about the services we have provided to you in the past: Details of any past bookings you have made with us, including any customer feedback you may have provided.\nInformation about your use of our websites, contact centers, and mobile applications: To help us to personalize your experience and improve our website, we collect information about your searches and the content you have viewed on our website using cookies and similar technologies.\nWhat Do We Use Your Personal Information For?\nTo fulfill and manage your bookings and deliver any other services you have asked for.\nTo send you status updates, if requested, and service communications.\nTo provide services tailored to your requirements and to treat you in a more personal way.\nTo carry out analysis and market research.\nTo improve our websites, products, and services.\nFor management and administrative purposes.\nTo carry out marketing and keep you informed of The Trago ’s products and services.\nWhen Will We Send You Marketing?\nWe may send you marketing messages via email to keep you up to date with the latest and best offers, ferry timetable releases, and to help you find Thetrago prices.\n\nYou can stop receiving marketing messages from us at any time by:\n\nClicking the unsubscribe link found in any email marketing message\nReplying to an email marketing message with a request to be unsubscribed\nContacting our Customer Service Team\nOnce you do this, we will update your account details so you don’t receive any more marketing messages. While we will update your details as quickly as possible, please allow for up to 2 business days for this to take effect. Unsubscribing from marketing messages will not stop service communications, such as booking confirmations and updates.\n\nWhen Will We Share Your Information With Others?\nWhen you make a booking, we may need to share your personal information with the providers (e.g., ferry operators, insurance providers, product distributors) of the services and products you’re purchasing. This information may also be shared with other third parties, including port authorities, customs, and passport offices, where this is necessary to fulfill the ferry service contract.\n\nWe may disclose information about you, your account, and booking history to:\n\nCompanies within the The Trago Group for the purposes and subject to the terms of this Privacy Policy.\nIn the event that we undergo re-organization or are sold to a third party, in which case you agree that any personal information we hold about you may be transferred to that re-organized entity or third party for the purposes and subject to the terms of this Privacy Policy.\nWe will not sell or pass your personal information to third parties (other than as set out above) unless you have given us permission or unless it is necessary to deliver and improve upon the products and services ordered or used by you. For example, we may disclose your data to a credit card company to validate your credit card details and obtain payment when you buy a product or service. It may also be necessary to pass your data to the organization from whom you have ordered any products or services.\n\nThe Trago may also be obliged to disclose your personal information to meet any legal or regulatory requirements or obligations in accordance with applicable law.\n\nHow We Use Cookies?\nWe may use cookies to record details such as a user identity and general registration details on your PC. This helps us recognize you on subsequent visits so that you do not have to re-enter your registration details each time you visit us and allows us to personalize your experience and improve our website.\n\nDepending upon the type of browser you are using, you may be able to configure your browser so that:\n\nYou are prompted to accept or reject cookies on an individual basis\nYou may be able to prevent your browser from accepting any cookies at all.\nYou should refer to the supplier or manufacturer of your web browser for specific details about cookie security.\n\nYou can read more about our cookie policy here.\n\nYour Rights Regarding Your Personal Information\nto Access & Transfer Data: You have the right to request a copy of any personal information that we hold about you or to have it transferred to a third party. We may ask you to supply appropriate evidence to verify your identity before responding to your request.\n\nOnce your identity has been verified, we will respond as quickly as possible and in any event within 30 business days.\n\nIf you have an online account, you can log in to your account at any time to view any personal information stored there.\n\nRight to Update & Amend: If any of the personal information we hold on you is inaccurate, you have the right to have that information corrected or completed where it is incomplete.\n\nRight to Complain: If you feel at any point that we have mishandled your data or infringed upon your rights set out under data protection laws, you can let us know by getting in touch with our customer service team or lodge a complaint with the supervisory authority responsible for data protection in the country you live in or the place of the alleged infringement.\n\nRight to be Forgotten: You can request to have your personal information erased when it is no longer required to process a transaction or we are not legally required to retain the information. Where your personal information is no longer required, any request to have the information erased will be carried out without undue delay.\n\nRight to Withdraw Consent: You can withdraw or restrict your consent to marketing or the processing of your personal information completely or partially, where it is no longer required.\n\nHow to Access, Amend or Transfer Your Information
  Trident Master Company Limited (www.thetrago.com)
  
  Email : info@thetrago.com , sale@thetrago.com , info@worldferry.com
  
  Please quote your name together with your booking reference and/or account number. We would be grateful if you could also provide brief details of what information you want a copy of (this helps us to more readily locate your data). We will take all reasonable steps to confirm your identity before providing you with details of any personal information we may hold about you.
  
  Your Personal Information and Countries Outside the EU
  All our customer data is stored on servers held within the EU. To perform our contract with you, we may need to send some of your personal details to our partner ferry operators outside of the EU. Where this is necessary, we take steps to restrict the data transferred to only the data that is required to perform the contract.
  
  We protect your privacy and your rights through the use of the European Commission’s standard data protection clauses.
  
  Retaining and Anonymizing Personal Data
  We keep your personal information for either 3 years from the date of your last booking or interaction or, if longer, for any period for which we are required to keep personal information to comply with our legal and regulatory requirements. After this time has passed, we anonymize all data so that it is no longer personally identifiable.
  
  Information Security
  The Trago recognizes that its customers are increasingly concerned about how companies protect personal information from misuse and abuse and about privacy in general. The Trago is constantly reviewing and enhancing its technical, physical and managerial procedures and rules to protect your personal data from unauthorised access, accidental loss and/or destruction.
  
  Changes to this Policy
  We may occasionally make changes to this page and our Privacy Policy to reflect changes in how we are processing your data.
  
  If there are any significant changes, we make these clear either through the website or through another means of contact such as email.
  
  Privacy Support
  Trident Master Co,. Ltd,. (www.thetrago.com) reserves the right to amend or modify this Privacy Policy Statement at any time and in response to changes in applicable data protection and privacy legislation.`}</Text>
                        </ScrollView>
                        <TouchableOpacity
                          style={{ alignSelf: 'center', marginTop: 18, backgroundColor: '#FD501E', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 30 }}
                          onPress={() => setPrivacyModalVisible(false)}
                        >
                          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>{t('close') || 'Close'}</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </Modal>
                </View>

                {Array.isArray(priceDepart) && priceDepart.map((all, index) => (
                  <View key={index}>
                    <View style={styles.card}>
                      <Text style={styles.title}>{t('bookingSummary') || 'Booking Summary'}</Text>
                      <View style={styles.divider} />
                      {timetableDepart.map((item, index) => (
                        <View key={index}>
                          <Text style={{ fontWeight: 'bold' }}>{t('depart') || 'Depart'}</Text>
                          <Text style={{ marginTop: 5, color: '#FD501E' }}>
                            {selectedLanguage === 'en' ? item.startingpoint_nameeng : item.startingpoint_namethai} 
                            <AntDesign name="arrowright" size={14} color="#FD501E" /> 
                            {selectedLanguage === 'en' ? item.endpoint_nameeng : item.endpoint_namethai}
                          </Text>
                          <View style={styles.row}>
                            <Text style={{ color: '#666666' }}>{t('company') || 'Company'} </Text>
                            <Text style={{ color: '#666666' }}>
                              {selectedLanguage === 'en' ? item.md_company_nameeng : item.md_company_nameth}
                            </Text>
                          </View>
                          <View style={styles.row}>
                            <Text style={{ color: '#666666' }}>{t('seat') || 'Seat'}</Text>
                            <Text style={{ color: '#666666' }}>
                              {selectedLanguage === 'en' ? item.md_seat_nameeng : item.md_seat_nameth}
                            </Text>
                          </View>
                          <View style={styles.row}>
                            <Text style={{ color: '#666666' }}>{t('boat') || 'Boat'} </Text>
                            <Text style={{ color: '#666666' }}>{item.md_boattype_nameeng}</Text>
                          </View>
                          <View style={styles.row}>
                            <Text style={{ color: '#666666' }}>{t('departureDate') || 'Departure Date'}</Text>
                            <Text style={{ color: '#666666' }}> {formatDate(customerData.departdate)}</Text>
                          </View>
                          <View style={styles.row}>
                            <Text style={{ color: '#666666' }}>{t('departureTime') || 'Departure Time'} : </Text>
                            <Text style={{ color: '#666666' }}>{formatTime(item.md_timetable_departuretime)} - {formatTime(item.md_timetable_arrivaltime)} | {formatTimeToHoursAndMinutes(item.md_timetable_time)}</Text>
                          </View>
                          <View style={[styles.row, { marginTop: 5 }]}>
                            <Text>{t('adult') || 'Adult'} x {customerData.adult}</Text>
                            <Text>{customerData.symbol} {formatNumberWithComma(all.totalDepart.priceadult)}</Text>
                          </View>
                          {customerData.child !== 0 && (
                            <View style={styles.row}>
                              <Text>{t('child') || 'Child'} x {customerData.child}</Text>
                              <Text>{customerData.symbol} {formatNumberWithComma(all.totalDepart.pricechild)}</Text>
                            </View>
                          )}
                          {customerData.infant !== 0 && (
                            <View style={styles.row}>
                              <Text>{t('infant') || 'Infant'} x {customerData.infant}</Text>
                              <Text>{customerData.symbol} {formatNumberWithComma(all.totalDepart.priceinfant)}</Text>
                            </View>
                          )}
                          {customerData.pickupDepartId && (
                            <View style={styles.rowpromo}>
                              <Text>{t('pickup') || 'Pick up'}</Text>
                              <Text style={{ color: 'green' }}>+ {customerData.symbol} {formatNumberWithComma(all.totalDepart.pricepickupdepart)}</Text>
                            </View>
                          )}
                          {customerData.dropoffDepartId && (
                            <View style={styles.rowpromo}>
                              <Text>{t('dropoff') || 'Drop off'}</Text>
                              <Text style={{ color: 'green' }}>+ {customerData.symbol} {formatNumberWithComma(all.totalDepart.pricedropoffdepart)}</Text>
                            </View>
                          )}
                          {all.totalDepart.save != 0 && (
                            <View style={styles.rowpromo}>
                              <Text>{t('discount') || 'Discount'}</Text>
                              <Text style={styles.redText}>- {customerData.symbol} {formatNumberWithComma(all.totalDepart.discount)}</Text>
                            </View>
                          )}
                          {all.totalDepart.credit != 0 && (
                            <View style={styles.rowpromo}>
                              <Text>{t('credit') || 'Credit'}</Text>
                              <Text style={styles.redText}>- {customerData.symbol} {formatNumberWithComma(all.totalDepart.credit)}</Text>
                            </View>
                          )}
                          {all.totalDepart.promotionprice != 0 && (
                            <View style={styles.rowpromo}>
                              <Text>{t('promotionCode') || 'Promotion Code'}</Text>
                              <Text style={styles.redText}>- {customerData.symbol} {formatNumberWithComma(all.totalDepart.promotionprice)}</Text>
                            </View>
                          )}
                          <View style={styles.rowpromo}>
                            <Text>{t('ticketFare') || 'Ticket fare'}</Text>
                            <Text style={{ fontWeight: 'bold' }}>{customerData.symbol} {formatNumberWithComma(all.totalDepart.showtotal)}</Text>
                          </View>
                          <View style={styles.divider} />
                        </View>
                      ))}
                      {customerData.roud === 2 && (
                        <>
                          {timetableReturn.map((item, index) => (
                            <View key={index}>
                              <Text style={{ fontWeight: 'bold' }}>{t('return') || 'Return'}</Text>
                              <Text style={{ marginTop: 5, color: '#FD501E' }}>
                                {selectedLanguage === 'en' ? item.startingpoint_nameeng : item.startingpoint_namethai} 
                                <AntDesign name="arrowright" size={14} color="#FD501E" /> 
                                {selectedLanguage === 'en' ? item.endpoint_nameeng : item.endpoint_namethai}
                              </Text>
                              <View style={styles.row}>
                                <Text style={{ color: '#666666' }}>{t('company') || 'Company'} </Text>
                                <Text style={{ color: '#666666' }}>
                                  {selectedLanguage === 'en' ? item.md_company_nameeng : item.md_company_nameth}
                                </Text>
                              </View>
                              <View style={styles.row}>
                                <Text style={{ color: '#666666' }}>{t('seat') || 'Seat'}</Text>
                                <Text style={{ color: '#666666' }}>
                                  {selectedLanguage === 'en' ? item.md_seat_nameeng : item.md_seat_nameth}
                                </Text>
                              </View>
                              <View style={styles.row}>
                                <Text style={{ color: '#666666' }}>{t('boat') || 'Boat'} </Text>
                                <Text style={{ color: '#666666' }}>{item.md_boattype_nameeng}</Text>
                              </View>
                              <View style={styles.row}>
                                <Text style={{ color: '#666666' }}>{t('departureDate') || 'Departure Date'}</Text>
                                <Text style={{ color: '#666666' }}> {formatDate(customerData.returndate)}</Text>
                              </View>
                              <View style={styles.row}>
                                <Text style={{ color: '#666666' }}>{t('departureTime') || 'Departure Time'} : </Text>
                                <Text style={{ color: '#666666' }}>
                                  {formatTime(item.md_timetable_departuretime)} - {formatTime(item.md_timetable_arrivaltime)} | {formatTimeToHoursAndMinutes(item.md_timetable_time)}
                                </Text>
                              </View>

                              <View style={[styles.rowpromo, { marginTop: 5 }]}>
                                <Text>{t('adult') || 'Adult'} x {customerData.adult}</Text>
                                <Text>{customerData.symbol} {formatNumberWithComma(all.totalReturn.priceadult)}</Text>
                              </View>
                              {customerData.child !== 0 && (
                                <View style={styles.rowpromo}>
                                  <Text>{t('child') || 'Child'} x {customerData.child}</Text>
                                  <Text>{customerData.symbol} {formatNumberWithComma(all.totalReturn.pricechild)}</Text>
                                </View>
                              )}
                              {customerData.infant !== 0 && (
                                <View style={styles.rowpromo}>
                                  <Text>{t('infant') || 'Infant'} x {customerData.infant}</Text>
                                  <Text>{customerData.symbol} {formatNumberWithComma(all.totalReturn.priceinfant)}</Text>
                                </View>
                              )}
                              {customerData.pickupReturnId != 0 && (
                                <View style={styles.rowpromo}>
                                  <Text>{t('pickup') || 'Pick up'}</Text>
                                  <Text style={{ color: 'green' }}>+ {customerData.symbol} {formatNumberWithComma(all.totalReturn.pricepickupdepart)}</Text>
                                </View>
                              )}
                              {customerData.dropoffReturnId != 0 && (
                                <View style={styles.rowpromo}>
                                  <Text>{t('dropoff') || 'Drop off'}</Text>
                                  <Text style={{ color: 'green' }}>+ {customerData.symbol} {formatNumberWithComma(all.totalReturn.pricedropoffdepart)}</Text>
                                </View>
                              )}
                              {all.totalReturn.save != 0 && (
                                <View style={styles.rowpromo}>
                                  <Text>{t('discount') || 'Discount'}</Text>
                                  <Text style={styles.redText}>- {customerData.symbol} {formatNumberWithComma(all.totalReturn.discount)}</Text>
                                </View>
                              )}
                              {all.totalReturn.credit != 0 && (
                                <View style={styles.rowpromo}>
                                  <Text>{t('credit') || 'Credit'}</Text>
                                  <Text style={styles.redText}>- {customerData.symbol} {formatNumberWithComma(all.totalReturn.credit)}</Text>
                                </View>
                              )}
                              
                              {all.totalReturn.promotionprice != 0 && (
                                <View style={styles.rowpromo}>
                                  <Text>{t('promotionCode') || 'Promotion Code'}</Text>
                                  <Text style={styles.redText}>- {customerData.symbol} {formatNumberWithComma(all.totalReturn.promotionprice)}</Text>
                                </View>
                              )}
                              <View style={styles.rowpromo}>
                                <Text>{t('ticketFare') || 'Ticket fare'}</Text>
                                <Text style={{ fontWeight: 'bold' }}>{customerData.symbol} {formatNumberWithComma(all.totalReturn.showtotal)}</Text>
                              </View>
                              <View style={styles.divider} />
                            </View>
                          ))}
                        </>
                      )}

                      <View style={styles.row}>
                        <Text>{t('subtotal') || 'Subtotal'} </Text>
                        <Text>{customerData.symbol} {formatNumberWithComma(all.total)}</Text>
                      </View>
                      <View style={styles.divider} />
                      
                      {/* Points Usage Section */}
                      <View style={{
                        backgroundColor: 'rgba(255, 214, 0, 0.05)',
                        borderRadius: wp('3%'),
                        padding: wp('3%'),
                        marginVertical: hp('1%'),
                        borderWidth: 1,
                        borderColor: 'rgba(255, 214, 0, 0.2)',
                      }}>
                        <TouchableOpacity 
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: usePoints ? hp('1%') : 0,
                          }}
                          onPress={handlePointsToggle}
                        >
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <MaterialIcons 
                              name="stars" 
                              size={wp('5%')} 
                              color="#FFD600" 
                              style={{ marginRight: wp('2%') }}
                            />
                            <Text style={{ 
                              fontWeight: '600', 
                              color: '#1E293B',
                              fontSize: wp('3.8%') 
                            }}>
                              {t('usePoints') || 'ใช้คะแนน'}
                            </Text>
                            <Text style={{ 
                              color: '#6B7280', 
                              fontSize: wp('3.2%'),
                              marginLeft: wp('2%')
                            }}>
                              ({userPoints} {t('pointsAvailable') || 'คะแนนที่มี'})
                            </Text>
                            {userPoints === 0 && (
                              <TouchableOpacity 
                                onPress={fetchUserPoints}
                                style={{
                                  marginLeft: wp('2%'),
                                  padding: wp('1%'),
                                }}
                              >
                                <Text style={{ 
                                  color: '#3B82F6', 
                                  fontSize: wp('3%'),
                                  textDecorationLine: 'underline'
                                }}>
                                  {t('refresh') || 'รีเฟรช'}
                                </Text>
                              </TouchableOpacity>
                            )}
                          </View>
                          <View style={{
                            width: wp('5%'),
                            height: wp('5%'),
                            borderRadius: wp('2.5%'),
                            borderWidth: 2,
                            borderColor: usePoints ? '#FFD600' : '#D1D5DB',
                            backgroundColor: usePoints ? '#FFD600' : 'transparent',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                            {usePoints && (
                              <MaterialIcons name="check" size={wp('3%')} color="#1E293B" />
                            )}
                          </View>
                        </TouchableOpacity>
                        
                        {usePoints && (
                          <View style={styles.row}>
                            <Text style={{ color: '#6B7280' }}>
                              {t('pointsUsed') || 'คะแนนที่ใช้'}: {pointsToUse} {t('points') || 'คะแนน'}
                            </Text>
                            <Text style={styles.redText}>
                              - {customerData.symbol} {formatNumberWithComma(pointsDiscount.toFixed(2))}
                            </Text>
                          </View>
                        )}
                      </View>
                      
                      <View style={styles.row}>
                        <Text>{t('paymentFee') || 'Payment Fee'} </Text>
                        <Text style={styles.greenText}>+ {customerData.symbol} {formatNumberWithComma(all.paymentfee)}</Text>

                      </View>
                      <View style={styles.divider} />



                      <View style={styles.row}>
                        <Text>{t('total') || 'Total'} </Text>
                        <Text> {customerData.symbol} {formatNumberWithComma(all.totalbooking)}</Text>
                      </View>
                      
                      {/* Points to Earn Section */}
                      {pointsToEarn > 0 && (
                        <>
                          <View style={styles.divider} />
                          <View style={styles.row}>
                            <Text style={{ 
                              color: '#10B981', 
                              fontSize: wp('3.8%'),
                              fontWeight: '600'
                            }}>
                              {t('pointsToEarn') || 'คะแนนที่จะได้รับ'}
                            </Text>
                            <Text style={{ 
                              color: '#10B981', 
                              fontSize: wp('3.8%'),
                              fontWeight: '600'
                            }}>
                              +{pointsToEarn.toFixed(2)} {t('points') || 'คะแนน'}
                            </Text>
                          </View>
                        </>
                      )}
                    </View>
                     <TouchableOpacity
                  style={[styles.buttonContainer]} // Use an array if you want to combine styles
                  onPress={() => {
                    if (!pickup) {
                      Alert.alert(t('termsAndConditions') || 'Terms and Conditions', t('pleaseCheckTerms') || 'Please check the Terms and Conditions before proceeding.');
                    } else if (selectedOption == "7") {
                      handlePayment();
                    } else if (selectedOption == "2") {

                      handlePaymentPromptpay();

                    } else {
                      Alert.alert(t('paymentOption') || 'Payment Option', t('pleaseSelectPayment') || 'Please select a payment option.');
                    }
                  }}>
                  <Text style={styles.BackButtonText}>{t('payment') || 'Payment'} {customerData.symbol} {formatNumberWithComma(all.totalbooking)}</Text>
                </TouchableOpacity>
                  </View>
                ))}




               
              </ScrollView>
            </KeyboardAvoidingView>
          </LinearGradient>
        </SafeAreaView>
      )}
    </View>
    </SafeAreaView>
  );
};


export default PaymentScreen;
