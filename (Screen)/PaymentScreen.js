import React, { useState, useEffect } from "react";
import { View, Text, SafeAreaView, Alert, StyleSheet, TouchableOpacity, ScrollView, Image, ImageBackground, ActivityIndicator } from "react-native";
import ipAddress from "../ipconfig";
import LogoTheTrago from "./../(component)/Logo";
import Step from "../(component)/Step";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Entypo from '@expo/vector-icons/Entypo';
import { MaterialIcons } from '@expo/vector-icons';
import AntDesign from '@expo/vector-icons/AntDesign';
import axios from 'axios';
import { useCustomer } from './CustomerContext';
import moment from "moment-timezone";
import * as Linking from "expo-linking";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';

const brandIcons = {
  Visa: require("./../assets/visa.png"),
  MasterCard: require("./../assets/mastercard.png"),
  JCB: require("./../assets/jcb.png"),
  "American Express": require("./../assets/amex.png"),
  Unknown: require("./../assets/default-card.png"),
};

const PaymentScreen = ({ navigation, route }) => {

  const [Discount, setDiscount] = useState('');
  const [subtotal, setSubtotal] = useState('');
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setcardName] = useState("");
  const [expirationDate, setExpirationDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [selectedOption, setSelectedOption] = useState(null);
  const [pickup, setPickup] = useState(false);
  const [errors, setErrors] = useState({}); // New state for errors
  const month = expirationDate.substring(0, 2);
  const year = '20' + expirationDate.substring(3, 5);
  const [timetableDepart, settimetableDepart] = useState([]);
  const [timetableReturn, settimetableReturn] = useState([]);
  const [bookingcode, setBookingcode] = useState([]);
  const [bookingcodeGroup, setBookingcodeGroup] = useState([]);
  const { customerData, updateCustomerData } = useCustomer();
  // Compute booking_code only if bookingcode is available
  let booking_code = bookingcode.length > 0
    ? "TG" + (parseInt(bookingcode[0].booking_code) + 1)
    : " "; // ใช้ "N/A" แทนค่าที่ไม่มี
  let booking_codeGroup = bookingcodeGroup.length > 0
    ? "TG" + (parseInt(bookingcodeGroup[0].booking_code) + 1)
    : " "; // ใช้ "N/A" แทนค่าที่ไม่มี
  const [totalPayment, settotalPayment] = useState(0);
  const [totalpaymentfee, setTotalPaymentfee] = useState(0);
  const [paymentcode, setpaymentcode] = useState('');
  const [paymentfee, setPaymentfee] = useState(0);
  const [currentDateTime, setCurrentDateTime] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [brand, setBrand] = useState(null);
  const [isSkeletonLoading, setIsSkeletonLoading] = useState(true); // Skeleton loader state
 

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

  useEffect(() => {
    fetch(`${ipAddress}/paymentfee/${selectedOption}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
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
  }, [selectedOption, paymentcode, bookingcode]);



  const fetchBookingCode = async () => {
    try {
      const response = await fetch(`${ipAddress}/bookingcode`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      if (data && Array.isArray(data.data)) {
        setBookingcode(data.data);
      } else {
        console.error('Data is not an array', data);
        setBookingcode([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const fetchBookingCodeGroup = async () => {
    try {
      const response = await fetch(`${ipAddress}/bookingcodegroup`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      if (data && Array.isArray(data.data)) {
        setBookingcodeGroup(data.data);
      } else {
        console.error('Data is not an array', data);
        setBookingcodeGroup([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };


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
    // เรียก fetchBookingCode ทุกครั้งที่มีการเปลี่ยนแปลงใน customerData หรือ bookingcode
    fetchBookingCode();

    if (customerData.roud === 2) {
      fetchBookingCodeGroup();
    }
  }, [paymentcode]);


  useEffect(() => {

    if (customerData.roud === 2) {
      fetchTimetableReturn();
    }

    // คำนวณค่าธรรมเนียมและยอดรวมแบบ real-time
    const totalpaymentfee = customerData.total && paymentfee ? (parseFloat(customerData.total) * (parseFloat(paymentfee) / 100)) : 0;
    const totalPayment = customerData.total ? (parseFloat(customerData.total) + totalpaymentfee) : 0;

    setTotalPaymentfee(totalpaymentfee);
    settotalPayment(formatNumber(totalPayment));

  }, [Discount, customerData.total, paymentfee, customerData.timeTableReturnId, bookingcode, bookingcodeGroup]);


  const calculateDiscountedPrice = (price) => {

    const discountedPrice = price * 0.10; // ลด 10%
    return discountedPrice.toFixed(2); // ปัดเศษทศนิยม 2 ตำแหน่ง
  };




  const handlePayment = async () => {
    setIsLoading(true); // Show loading spinner immediately
    // ✅ ใช้ selectedCard ที่ได้จากการเลือกบัตร
    if (!selectedCard) {
      setIsLoading(false);
      Alert.alert("No Card Selected", "Please select a card to continue.");
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
      Alert.alert("Invalid Expiry Date", "Please check the card's expiration date format (MM/YY or MM/YYYY). Month must be 2 digits, year must be 4 digits.");
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
          amount: totalPayment, // ส่งยอดรวมจริง
          token: tokenData.token,
          return_uri: `${ipAddress}/redirect`,
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
      console.log('✅ Payment code:', paymentcode);
      console.log('✅ booking code:', booking_code);
      // ✅ 3. เปิด Omise Authorize URL

      fetchBookingCode();
      if (customerData.roud === 2) {
        fetchBookingCodeGroup();
      }
      console.log("📌 Updating Customer Data with Booking Code:", booking_code);
      // แก้ไข: ไม่อัปเดต total ด้วยยอดรวม (totalPayment) แต่เก็บค่าธรรมเนียมแยก
      updateCustomerData({
        bookingdate: moment().tz("Asia/Bangkok").format("YYYY-MM-DD"),
        paymentfee: totalpaymentfee, // เก็บค่าธรรมเนียมแยก
        // total: customerData.total, // ไม่ต้องอัปเดต total
        bookingcode: booking_code,
        bookingcodegroup: booking_codeGroup,
      });
      createBooking(paymentResult.charge_id);
      createPassenger(booking_code);
      setIsLoading(false);
      console.log("✅ Loading stopped...");

    } catch (error) {
      console.error("❌ Error:", error);
      setIsLoading(false);
      Alert.alert("Error", error.message);
    }
  };

  const handlePaymentPromptpay = async () => {
    setIsLoading(true);
    console.log("🔄 Loading started...");
    fetchBookingCode();
    if (customerData.roud === 2) {
      fetchBookingCodeGroup();
    }
    console.log("📌 Updating Customer Data with Booking Code:", booking_code);
    updateCustomerData({
      paymentfee: totalpaymentfee,
      paymenttype: selectedOption,
      // ไม่ต้องอัปเดต total
    });
    navigation.navigate("PromptPayScreen", { Paymenttotal: totalPayment });
    setIsLoading(false);
    console.log("✅ Loading stopped...");
  };




  // 🛠️ ฟังก์ชันสำหรับสร้าง Booking
  const createBooking = async (paymentCode) => {
    try {
      console.log("country:", customerData.country);
      console.log("📌 Creating Booking with Payment Code:", paymentCode);
      await axios.post(`${ipAddress}/booking`, {
        md_booking_memberid: 0,//1
        md_booking_code: booking_code,//2
        md_booking_groupcode: booking_codeGroup,//3
        md_booking_companyid: customerData.companyDepartId,//4
        md_booking_paymentid: paymentCode, // 5
        md_booking_boattypeid: customerData.boatypeid, //6
        md_booking_country: customerData.country,//7
        md_booking_countrycode: customerData.countrycode,//8
        md_booking_round: customerData.roud,//9
        md_booking_timetableid: customerData.timeTableDepartId,//10
        md_booking_tel: customerData.tel,//11
        md_booking_whatsapp: 0,//12
        md_booking_email: customerData.email,//13
        md_booking_price: customerData.total,//14
        md_booking_total: totalPayment,//15
        md_booking_refund: 0,//16
        md_booking_refundprice: 0,//17
        md_booking_credit: 0,//18
        md_booking_currency: customerData.currency,//19
        md_booking_net: customerData.netDepart,//20
        md_booking_adult: customerData.adult,//21
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
        md_booking_pay: selectedOption,
        md_booking_payfee: paymentfee,
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
      throw new Error("Failed to create booking");
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
            charge_id: paymentcode,
          });
          console.log("LOG  Payment Status Response:", JSON.stringify(res.data));
          // ถ้า authorize_uri เป็น null และไม่ได้อยู่ PromptPayScreen ให้หยุด
          if (!res.data.authorize_uri && currentRoute && currentRoute.name !== "PromptPayScreen") {
            console.log("⏹️ Stop: authorize_uri is null and not on PromptPayScreen");
            return;
          }
          if (res.data.success && res.data.status === "successful") {
            updatestatus(booking_code);
            navigation.navigate("ResultScreen", { success: true });
          } else {
            navigation.navigate("ResultScreen", { success: false });
          }
        } catch (error) {
          console.error("Error checking charge:", error);
          Alert.alert("❌ Error", "There was an error processing your payment.");
          navigation.navigate("ResultScreen", { success: false });
        }
      } else if (url.includes("payment/failure")) {
        Alert.alert("❌ Payment Failed", "Something went wrong with your payment.");
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
  }, [navigation, paymentcode, bookingcode, totalPayment]); // เพิ่ม paymentcode และ booking_code ใน dependencies



  const handleSelection = (option) => {
    setSelectedOption(option);

  };

  useEffect(() => {
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
  }, []);

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
    <View style={{ flex: 1 }}>
      {/* ✅ หน้าหมุนแสดงระหว่างรอการชำระเงิน */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FD501E" />
          <Text style={styles.loadingText}>Processing Payment...</Text>
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
              {[1,2].map(i => (
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
         <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
              <View style={{ position: 'relative', alignItems: 'center', paddingTop: 0, marginTop: 0, marginBottom: 0, backgroundColor: '#fff' }}>
                <TouchableOpacity
                  onPress={() => navigation.goBack()}
                  style={{ position: 'absolute', left: 16, top: 6, backgroundColor: '#FFF3ED', borderRadius: 20, padding: 6, zIndex: 2 }}
                >
                  <AntDesign name="arrowleft" size={26} color="#FD501E" />
                </TouchableOpacity>
                <LogoTheTrago style={{ marginTop: 0, marginBottom: 0, alignSelf: 'flex-start', marginLeft: 0 }} />
                <Step logoUri={3} style={{ marginTop: 0, marginBottom: 0 }} />
              </View>
              <Text style={[styles.title, { marginLeft: 30, marginTop: 5, marginBottom: 10 }]}>Payment</Text>
        <ScrollView contentContainerStyle={styles.container}>
          <ImageBackground
            source={{ uri: 'https://www.thetrago.com/assets/images/bg/Aliments.png' }}
            style={styles.background}>
            <View style={styles.card}>
              <View style={styles.row}>
                <FontAwesome name="credit-card" size={24} color="black" marginRight='10' />
                <Text style={styles.header}>Payment Options</Text>
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
                  />
                  <View style={styles.logodown}>
                    <Text style={styles.labelHead}>Credit and Debit Card</Text>
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
                            // setSelectedCard(card); // ไม่ต้อง set ตรงนี้แล้ว ให้ useEffect ข้างบนจัดการ
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
                            {/* Remove button */}
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
                      <Text style={{ color: '#888', marginBottom: 12 }}>No cards saved yet.</Text>
                    )}
                    {/* Add Card Button */}
                    <TouchableOpacity
                      style={styles.addCardButton}
                      onPress={() => {
                        navigation.navigate('AddCardScreen', {
                          onAddCard: (newCard) => {
                            // Pass new card back via navigation params
                            navigation.setParams({ newCard });
                          },
                          nextCardId: (savedCards.length + 1).toString(),
                        });
                      }}
                    >
                      <AntDesign name="pluscircleo" size={18} color="#fff" style={{ marginRight: 6 }} />
                      <Text style={{ color: '#fff', fontWeight: 'bold' }}>Add Card</Text>
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
                  />
                  <View style={styles.logodown}>
                    <Text style={styles.labelHead}>PromptPay</Text>
                  </View>
                  <FontAwesome name="chevron-down" size={18} color="#FD501E" style={styles.icon} />


                </TouchableOpacity>
              </View>
              {/* Radio Button 3 */}
              {/* <View style={styles.radioContian}>
                <TouchableOpacity
                  style={styles.optionContainer}
                  onPress={() => handleSelection("Option 3")}
                >
                  <View
                    style={[
                      styles.radioButton,
                      selectedOption === "Option 3" && styles.selectedRadio,
                    ]}
                  />
                  <View style={styles.logodown}>
                    <Text style={styles.labelHead}>eWallet</Text>
                  </View>
                  <FontAwesome name="chevron-down" size={18} color="#FD501E" style={styles.icon} />
                </TouchableOpacity>
              </View> */}
              <View style={styles.row}>
                <View style={styles.checkboxContainer}>
                  <TouchableOpacity onPress={() => setPickup(!pickup)}>
                    <MaterialIcons name={pickup ? "check-box" : "check-box-outline-blank"} size={24} color="#FD501E" style={{ marginRight: 8, marginTop: -5 }} />
                  </TouchableOpacity>
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.label}>I understand and agree with th <Text style={styles.textcolor}>Terms of Services</Text> and <Text style={styles.textcolor}>Policy</Text></Text>
                </View>
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.title}>Booking Summary</Text>
              <View style={styles.divider} />
              {timetableDepart.map((item, index) => (
                <View key={index}>
                  <Text style={{ fontWeight: 'bold' }}>Depart</Text>
                  <Text style={{ marginTop: 5, color: '#FD501E' }}>{item.startingpoint_name} <AntDesign name="arrowright" size={14} color="#FD501E" /> {item.endpoint_name}</Text>
                  <View style={styles.row}>
                    <Text style={{ color: '#666666' }}>Company </Text>
                    <Text style={{ color: '#666666' }}> {item.md_company_nameeng}</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={{ color: '#666666' }}>Seat</Text>
                    <Text style={{ color: '#666666' }}>{item.md_seat_nameeng}</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={{ color: '#666666' }}>Boat </Text>
                    <Text style={{ color: '#666666' }}>{item.md_boattype_nameeng}</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={{ color: '#666666' }}>Departure Data</Text>
                    <Text style={{ color: '#666666' }}> {formatDate(customerData.departdate)}</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={{ color: '#666666' }}>Departure Time : </Text>
                    <Text style={{ color: '#666666' }}>{formatTime(item.md_timetable_departuretime)} - {formatTime(item.md_timetable_arrivaltime)} | {formatTimeToHoursAndMinutes(item.md_timetable_time)}</Text>
                  </View>
                  <View style={[styles.row, { marginTop: 5 }]}>
                    <Text>Adult x {customerData.adult}</Text>
                    <Text>฿ {formatNumberWithComma(customerData.totaladultDepart)}</Text>
                  </View>
                  {customerData.child !== 0 && (
                    <View style={styles.row}>
                      <Text>Child x {customerData.child}</Text>
                      <Text>฿ {formatNumberWithComma(customerData.totalchildDepart)}</Text>
                    </View>
                  )}
                  {customerData.infant !== 0 && (
                    <View style={styles.row}>
                      <Text>infant x {customerData.infant}</Text>
                      <Text>฿ {formatNumberWithComma(customerData.totalinfantDepart)}</Text>
                    </View>
                  )}
                  {customerData.pickupPriceDepart != 0 && (
                    <View style={styles.row}>
                      <Text>Pick up</Text>
                      <Text style={{ color: 'green' }}>+ ฿ {formatNumberWithComma(customerData.pickupPriceDepart)}</Text>
                    </View>
                  )}
                  {customerData.dropoffPriceDepart != 0 && (
                    <View style={styles.row}>
                      <Text>Drop off</Text>
                      <Text style={{ color: 'green' }}>+ ฿ {formatNumberWithComma(customerData.dropoffPriceDepart)}</Text>
                    </View>
                  )}
                  {customerData.discountDepart != 0 && (
                  <View style={styles.row}>
                    <Text>Discount</Text>
                    <Text className="redText">- ฿ {formatNumberWithComma(customerData.discountDepart)}</Text>
                  </View>
                  )}
                  <View style={styles.row}>
                    <Text>Ticket fare</Text>
                    <Text style={{ fontWeight: 'bold' }}>฿ {formatNumberWithComma(customerData.subtotalDepart)}</Text>
                  </View>
                  <View style={styles.divider} />
                </View>
              ))}
              {customerData.roud === 2 && (
                <>
                  {timetableReturn.map((item, index) => (
                    <View key={index}>
                      <Text style={{ fontWeight: 'bold' }}>Return</Text>
                      <Text style={{ marginTop: 5, color: '#FD501E' }}>
                        {item.startingpoint_name} <AntDesign name="arrowright" size={14} color="#FD501E" /> {item.endpoint_name}
                      </Text>
                      <View style={styles.row}>
                        <Text style={{ color: '#666666' }}>Company </Text>
                        <Text style={{ color: '#666666' }}>{item.md_company_nameeng}</Text>
                      </View>
                      <View style={styles.row}>
                        <Text style={{ color: '#666666' }}>Seat</Text>
                        <Text style={{ color: '#666666' }}>{item.md_seat_nameeng}</Text>
                      </View>
                      <View style={styles.row}>
                        <Text style={{ color: '#666666' }}>Boat </Text>
                        <Text style={{ color: '#666666' }}>{item.md_boattype_nameeng}</Text>
                      </View>
                      <View style={styles.row}>
                        <Text style={{ color: '#666666' }}>Departure Data</Text>
                        <Text style={{ color: '#666666' }}> {formatDate(customerData.returndate)}</Text>
                      </View>
                      <View style={styles.row}>
                        <Text style={{ color: '#666666' }}>Departure Time : </Text>
                        <Text style={{ color: '#666666' }}>
                          {formatTime(item.md_timetable_departuretime)} - {formatTime(item.md_timetable_arrivaltime)} | {formatTimeToHoursAndMinutes(item.md_timetable_time)}
                        </Text>
                      </View>
                      <View style={[styles.row, { marginTop: 5 }]}>
                        <Text>Adult x {customerData.adult}</Text>
                        <Text>฿ {formatNumberWithComma(customerData.totaladultReturn)}</Text>
                      </View>
                      {customerData.child !== 0 && (
                        <View style={styles.row}>
                          <Text>Child x {customerData.child}</Text>
                          <Text>฿ {formatNumberWithComma(customerData.totalchildReturn)}</Text>
                        </View>
                      )}
                      {customerData.infant !== 0 && (
                        <View style={styles.row}>
                          <Text>infant x {customerData.infant}</Text>
                          <Text>฿ {formatNumberWithComma(customerData.totalinfantReturn)}</Text>
                        </View>
                      )}
                      {customerData.pickupPriceReturn != 0 && (
                        <View style={styles.row}>
                          <Text>Pick up</Text>
                          <Text style={{ color: 'green' }}>+ ฿ {formatNumberWithComma(customerData.pickupPriceReturn)}</Text>
                        </View>
                      )}
                      {customerData.dropoffPriceReturn != 0 && (
                        <View style={styles.row}>
                          <Text>Drop off</Text>
                          <Text style={{ color: 'green' }}>+ ฿ {formatNumberWithComma(customerData.dropoffPriceReturn)}</Text>
                        </View>
                      )}
                      {customerData.discountReturn != 0 && (
                      <View style={styles.row}>
                        <Text>Discount</Text>
                        <Text className="redText">- ฿ {formatNumberWithComma(customerData.discountReturn)}</Text>
                      </View>
                      )}
                      <View style={styles.row}>
                        <Text>Ticket fare</Text>
                        <Text style={{ fontWeight: 'bold' }}>฿ {formatNumberWithComma(customerData.subtotalReturn)}</Text>
                      </View>
                      <View style={styles.divider} />
                    </View>
                  ))}
                </>
              )}

              <View style={styles.row}>
                <Text>Subtotal </Text>
                <Text>฿ {formatNumberWithComma(customerData.total)}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.row}>
                <Text>Payment Fee </Text>
                <Text style={styles.greenText}>+ ฿ {formatNumberWithComma(formatNumber(totalpaymentfee))}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.row}>
                <Text>total </Text>
                <Text> ฿ {formatNumberWithComma(formatNumber(totalPayment))}</Text>
              </View>
            </View>




            <TouchableOpacity
              style={[styles.buttonContainer]} // Use an array if you want to combine styles
              onPress={() => {
                if (!pickup) {
                  Alert.alert('Terms and Conditions', 'Please check the Terms and Conditions before proceeding.');
                } else if (selectedOption == "7") {
                  handlePayment();
                } else if (selectedOption == "2") {

                  handlePaymentPromptpay();

                } else {
                  Alert.alert('Payment Option', 'Please select a payment option.');
                }
              }}>
              <Text style={styles.BackButtonText}>Payment ฿{formatNumberWithComma(totalPayment)}</Text>
            </TouchableOpacity>
          </ImageBackground>
        </ScrollView>
        </SafeAreaView>
      )}
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'left',
    color: '#002348',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,

  },
  labelHead: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: 'bold'
  },
  input: {
    borderWidth: 1,
    borderColor: "#ced4da",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    backgroundColor: "#fff",
    marginBottom: 15,
  },
  row: {
    flexDirection: "row",
    justifyContent: 'space-between'
  },
  inputContainer: {
    width: "48%",
    marginRight: 10,
  },
  buttonContainer: {
    backgroundColor: '#FD501E',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    width: '100%',
    marginBottom: 20,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: '100%',
    padding: 16,
    marginVertical: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  optionContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#FD501E",
    marginRight: 10,
  },
  selectedRadio: {
    borderWidth: 5,
  },
  optionText: {
    fontSize: 16,
  },
  payment: {
    marginLeft: 30,
  },
  logodown: {
    justifyContent: 'space-between',
    width: '85%'
  },
  radioContian: {
    backgroundColor: '#F6F6F6',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    paddingBottom: 10,
    shadowColor: '#F6F6F6',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#d0d5d8"
  },
  checkboxContainer: {
    flexDirection: 'col',
    alignItems: 'center',
    width: '10%',
    marginTop: 5
  },
  textContainer: {
    flexDirection: 'col',
    alignItems: 'center',
    width: '90%'
  },
  textcolor: {
    color: '#FD501E'
  },
  divider: {
    height: 1, // ความหนาของเส้น
    width: '100%', // ทำให้ยาวเต็มจอ
    backgroundColor: '#CCCCCC', // สีของเส้น
    marginVertical: 10, // ระยะห่างระหว่าง element
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'left',
    color: '#002348',
    marginBottom: 20,
  },
  qrCodeContainer: {
    marginTop: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chargeInfo: {
    marginTop: 20,
    textAlign: 'center',
  },
  redText: {
    color: 'red'
  },
  greenText: {
    color: 'green'
  },
  BackButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  errorInput: {
    borderColor: 'red',
  },
  background: {
    width: '100%',
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // พื้นหลังโปร่งใส
    zIndex: 9999, // ✅ ให้ ActivityIndicator อยู่ด้านบนสุด
  },
  loadingText: {
    marginTop: 10,
    color: "#FFF",
    fontSize: 18,
  },
  inputWrapper: {
    position: 'relative',
    justifyContent: 'center',
    marginBottom: 20,
  },
  textInput: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingLeft: 15,
    paddingRight: 50, // ให้เว้นที่สำหรับ icon ด้านขวา
    fontSize: 16,
    backgroundColor: '#fff',
  },
  brandIcon: {
    position: 'absolute',
    right: 15,
    width: 45,
    height: 35,
  },
  // เพิ่มสไตล์สำหรับ card list
  savedCardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedCard: {
    borderColor: '#FD501E',
    backgroundColor: '#fff7f3',
    shadowColor: '#FD501E',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  savedCardIcon: {
    width: 38,
    height: 28,
    marginRight: 14,
    resizeMode: 'contain',
  },
  savedCardNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#002348',
  },
  savedCardName: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  addCardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FD501E',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    alignSelf: 'flex-end',
    marginTop: 6,
  },
  skeletonCard: {
    backgroundColor: '#ececec',
    borderRadius: 20,
    width: '100%',
    padding: 16,
    marginVertical: 16,
  },
  skeletonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  skeletonCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e0e0e0',
    marginRight: 10,
  },
  skeletonLineShort: {
    width: 120,
    height: 18,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
  },
  skeletonCardList: {
    marginTop: 10,
  },
  skeletonCardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8e8e8',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  skeletonCardIcon: {
    width: 38,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#d0d0d0',
    marginRight: 14,
  },
  skeletonLine: {
    width: '80%',
    height: 16,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
    marginBottom: 8,
  },
  skeletonLineSmall: {
    width: '50%',
    height: 12,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
    marginBottom: 8,
  },
  skeletonAddCardBtn: {
    width: 100,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#fdcdbb',
    alignSelf: 'flex-end',
    marginTop: 6,
  },
  skeletonButton: {
    width: '100%',
    height: 48,
    borderRadius: 10,
    backgroundColor: '#fdcdbb',
    marginTop: 20,
    marginBottom: 20,
  },
});

export default PaymentScreen;
