import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Alert, StyleSheet, TouchableOpacity, ScrollView, Image, ImageBackground, ActivityIndicator } from "react-native";
import ipAddress from "../ipconfig";
import LogoHeader from "./../(component)/Logo";
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
  const [totalPayment, settotalPayment] = useState('');
  const [bookingcode, setBookingcode] = useState([]);
  const [bookingcodeGroup, setBookingcodeGroup] = useState([]);
  const { customerData, updateCustomerData } = useCustomer();
  // Compute booking_code only if bookingcode is available
  const booking_code = bookingcode.length > 0
    ? "TG" + (parseInt(bookingcode[0].booking_code) + 1)
    : " "; // ใช้ "N/A" แทนค่าที่ไม่มี
  const booking_codeGroup = bookingcodeGroup.length > 0
    ? "TG" + (parseInt(bookingcodeGroup[0].booking_code) + 1)
    : " "; // ใช้ "N/A" แทนค่าที่ไม่มี


  const [paymentcode, setpaymentcode] = useState('');
  const [paymentfee, setPaymentfee] = useState(0);
  const [totalpaymentfee, setTotalPaymentfee] = useState('');
  const [currentDateTime, setCurrentDateTime] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [brand, setBrand] = useState(null);


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
      const response = await fetch(`${ipAddress}/bookingcode`);
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

    setTotalPaymentfee(customerData.total * (paymentfee / 100));
    settotalPayment(formatNumber(parseFloat(customerData.total) + totalpaymentfee));

  }, [Discount, customerData.total, paymentfee, totalpaymentfee, customerData.timeTableReturnId, bookingcode, bookingcodeGroup]);


  const calculateDiscountedPrice = (price) => {

    const discountedPrice = price * 0.10; // ลด 10%
    return discountedPrice.toFixed(2); // ปัดเศษทศนิยม 2 ตำแหน่ง
  };




  const handlePayment = async () => {

    let newErrors = {};
    if (!cardName) newErrors.cardName = true;
    if (!cardNumber) newErrors.cardNumber = true;
    if (!expirationDate) newErrors.expirationDate = true;
    if (!cvv) newErrors.cvv = true;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      Alert.alert("❌ Incomplete Information", "Please fill in all required fields.");
      return;
    }

    setIsLoading(true);
    console.log("🔄 Loading started...");


    try {
      // ✅ 1. สร้าง Token ของบัตรเครดิต
      const tokenResponse = await fetch(`${ipAddress}/create-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          card: {
            name: cardName,
            number: cardNumber,
            expiration_month: month,
            expiration_year: year,
            security_code: cvv,
          },
        }),
      });


      if (!tokenResponse.ok) throw new Error("❌ Failed to create payment token");
      const tokenData = await tokenResponse.json();
      if (!tokenData.success) throw new Error(tokenData.error);

      // ✅ 2. ทำการชำระเงิน
      const paymentResponse = await fetch(`${ipAddress}/charge`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true", },
        body: JSON.stringify({
          amount: totalPayment,
          token: tokenData.token,
          return_uri: `${ipAddress}/redirect`, // ✅ ให้ Omise Redirect กลับมา
        }),
      });


      if (!paymentResponse.ok) throw new Error("❌ Payment failed");
      const paymentResult = await paymentResponse.json();
      if (!paymentResult.success) throw new Error("❌ Payment declined");

      if (paymentResult.authorize_uri) {
        console.log("🔗 Redirecting to:", paymentResult.authorize_uri);
        await Linking.openURL(paymentResult.authorize_uri); // 👉 เปิดหน้า OTP หรือธนาคาร

      } else {
        throw new Error("❌ No authorize URI found.");
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
      updateCustomerData({
        bookingdate: moment().tz("Asia/Bangkok").format("YYYY-MM-DD"),
        paymentfee: paymentfee,
        total: totalPayment,
        bookingcode: booking_code,
        bookingcodegroup: booking_codeGroup,
      });
      createBooking(paymentResult.charge_id);
      setIsLoading(false);
      console.log("✅ Loading stopped...");

    } catch (error) {
      console.error("❌ Error:", error);
      setIsLoading(false);
      Alert.alert("❌ Error", error.message);
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
     
    
      setIsLoading(false);
      console.log("✅ Loading stopped...");
      navigation.navigate("PromptPayScreen", { Paymenttotal: totalPayment });
  };




  // 🛠️ ฟังก์ชันสำหรับสร้าง Booking
  const createBooking = async (paymentCode) => {
    try {
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
      throw new Error("❌ Failed to create booking");
    }
  };

  useEffect(() => {
    const handleDeepLink = async (event) => {
      let url = event.url || "";
      console.log("🔗 Deep Link Received:", url);

      if (url.includes("payment/success")) {
        try {
          // ส่งคำขอตรวจสอบการชำระเงิน
          const res = await axios.post(`${ipAddress}/check-charge`, {
            charge_id: paymentcode,
          });

          if (res.data.success && res.data.status === "successful") { //successful failed
            // Alert.alert("✅ Payment Successful", "Your payment was completed successfully!");

            createBooking(paymentcode);
            navigation.navigate("ResultScreen", { success: true });
          } else {
            // Alert.alert("❌ Payment Failed", "Payment was not successful.");
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

  return (
    <View style={{ flex: 1 }}>
      {/* ✅ หน้าหมุนแสดงระหว่างรอการชำระเงิน */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FD501E" />
          <Text style={styles.loadingText}>Processing Payment...</Text>
        </View>
      )}
      <ScrollView contentContainerStyle={styles.container}>

        <ImageBackground
          source={{ uri: 'https://www.thetrago.com/assets/images/bg/Aliments.png' }}
          style={styles.background}>
          <LogoHeader />
          <Step logoUri={3} />
          <Text style={styles.header}>Payment</Text>
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
                <>
                  <View style={styles.payment}>
                    <View style={styles.row}>
                      <Text style={styles.label}>We Accept:</Text>
                      <Image source={{ uri: 'https://www.thetrago.com/assets/images/credit1.png' }}
                        style={{ width: wp('35%'), height: hp('2%') }} />
                    </View>
                    <Text style={styles.label}>Card Holder Name </Text>
                    <TextInput
                      value={cardName}
                      onChangeText={(text) => {
                        setcardName(text);
                        setErrors((prev) => ({ ...prev, cardName: false }));
                      }}
                      placeholder="Cardholder name"
                      style={[styles.input, errors.cardName && styles.errorInput]}
                    />
                    <Text style={styles.label}>Card Number </Text>
                    <View style={styles.inputWrapper}>
                      <TextInput
                        value={cardNumber}
                        onChangeText={(text) => {
                          const clean = text.replace(/\D/g, "").slice(0, 16); // ลบตัวอักษรที่ไม่ใช่ตัวเลข
                          const formatted = clean.replace(/(.{4})/g, "$1 ").trim();
                          setCardNumber(formatted);
                          setErrors((prev) => ({ ...prev, cardNumber: false }));

                          // 🔍 เดา brand เองโดยไม่ใช้ API
                          if (clean.length >= 6) {
                            const detectedBrand = detectCardBrand(clean);
                            setBrand(detectedBrand);
                          } else {
                            setBrand(null);
                          }
                        }}
                        placeholder="**** **** **** ****"
                        keyboardType="number-pad"
                        style={styles.textInput}
                      />

                      {brand && (
                        <Image
                          source={brandIcons[brand] || brandIcons.Unknown}
                          style={styles.brandIcon}
                          resizeMode="contain"
                        />
                      )}
                    </View>


                    <View style={styles.row}>
                      <View style={styles.inputContainer}>
                        <Text style={styles.label}>Expiry Date</Text>
                        <TextInput
                          value={expirationDate}
                          onChangeText={(text) => {
                            handleChange(text);
                            setErrors((prev) => ({ ...prev, expirationDate: false }));
                          }}
                          keyboardType="number-pad"
                          placeholder="MM/YY"
                          maxLength={5}  // จำกัดให้กรอกได้สูงสุด 5 ตัวอักษร (เช่น 12/34)
                          style={[styles.input, errors.expirationDate && styles.errorInput]}
                        />

                      </View>


                      <View style={styles.inputContainer}>

                        <Text style={styles.label}>CVV / CVC *</Text>
                        <TextInput
                          value={cvv}
                          onChangeText={(text) => {
                            setCvv(text);
                            setErrors((prev) => ({ ...prev, cvv: false }));
                          }}
                          keyboardType="number-pad"
                          placeholder="***"
                          secureTextEntry
                          maxLength={3}
                          style={[styles.input, errors.cvv && styles.errorInput]}
                        />
                      </View>
                    </View>
                  </View>
                </>
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
                <View style={styles.row}>
                  <Text>Discount</Text>
                  <Text style={styles.redText}>- ฿ {formatNumberWithComma(customerData.discountDepart)}</Text>
                </View>
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
                    <View style={styles.row}>
                      <Text>Discount</Text>
                      <Text style={styles.redText}>- ฿ {formatNumberWithComma(customerData.discountReturn)}</Text>
                    </View>
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


});

export default PaymentScreen;
