import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, Alert, SafeAreaView, StatusBar, Platform } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LogoTheTrago from './../../components/component/Logo';
import headStyles from '../../styles/CSS/StartingPointScreenStyles';
import ipAddress from "../../config/ipconfig";
import axios from "axios";
import { useCustomer } from './CustomerContext';
import { useLanguage } from './LanguageContext';
import * as Print from 'expo-print';
import * as SecureStore from 'expo-secure-store';
import moment from 'moment';
import { styles } from '../../styles/CSS/ResultScreenStyles';




const ResultScreen = ({ navigation, route }) => {
  const { customerData } = useCustomer();
  const { selectedLanguage, t } = useLanguage();
  const insets = useSafeAreaInsets();
  const { success, booking_code } = route.params;
  const [orderStatus, setOrderStatus] = useState("Pending");
  const [pdfUri, setPdfUri] = useState(null);
  const [timetableDepart, settimetableDepart] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [imageLoadError, setImageLoadError] = useState(false);

      const EXTRA_TOP_GUTTER = Platform.OS === 'android' ? 0 : 50;

  // ฟังก์ชันจัดการ countrycode ให้มี + เพียงตัวเดียว
  const formatCountryCode = (code) => {
    if (!code) return '';
    const codeStr = code.toString();
    // ลบ + ทั้งหมด แล้วเพิ่ม + หนึ่งตัวหน้า
    const cleanCode = codeStr.replace(/\+/g, '');
    return '+' + cleanCode;
  };

  // ฟังก์ชันแปลงคำนำหน้าชื่อจากไทยเป็นอังกฤษ
  const convertTitleToEnglish = (thaiTitle) => {
    const titleMapping = {
      'นาย': 'Mr.',
      'นาง': 'Mrs.',
      'นางสาว': 'Miss',
      'ดร.': 'Dr.',
      'ผศ.ดร.': 'Dr.',
      'รศ.ดร.': 'Dr.',
      'ศ.ดร.': 'Dr.',
      'เด็กชาย': 'Master',
      'เด็กหญิง': 'Miss'
    };
    
    return titleMapping[thaiTitle] || thaiTitle; // ถ้าไม่เจอให้ใช้ค่าเดิม
  };

  const htmlContent = `
  
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>E-TICKET</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f5f5f5;
      color: #002348;
    }
    .container {
      background-color: #fff;
      max-width: 800px;
      margin: 20px auto;
      padding: 30px;
      box-shadow: 0 0 10px rgba(0,0,0,0.1);
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .header img {
      height: 50px;
    }
    .ref-number {
      font-size: 14px;
      text-align: right;
    }
    .title-bar {
      background-color: #002348;
      color: white;
      padding: 10px;
      margin: 20px 0;
      text-align: center;
      font-weight: bold;
    }
    .location-row {
      display: flex;
      justify-content: space-between;
      text-align: center;
      margin: 20px 0;
    }
    .location-row div {
      flex: 1;
    }
    .icon {
      font-size: 24px;
    }
    .section {
      display: flex;
      justify-content: space-between;
      margin: 20px 0;
    }
    .section > div {
      width: 48%;
    }
    .section h3 {
      margin-bottom: 10px;
    }
    .info-table td {
      padding: 4px 0;
      vertical-align: top;
    }
    .centerOperator {
      text-align: center;
    }
    .highlight {
      color: green;
      font-weight: bold;
    }
    .operator {
      margin-top: 20px;
      border-top: 1px solid #ccc;
      padding-top: 10px;
    }
    .timeline {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 20px;
      padding: 10px 0;
      border-top: 1px solid #ccc;
      border-bottom: 1px solid #ccc;
    }
    .timeline div {
      text-align: center;
      flex: 1;
    }
    .important {
      font-size: 12px;
      margin-top: 20px;
      margin-left: 20px;
      line-height: 1.6;
      
    }
    .logo {
      height: 30px;
      margin-bottom: 5px;
    }
    .timeline-box {
      width: 100%;
      max-width: 500px;
      margin: 30px auto;
      background-color: #f9f7f7;
      border-radius: 8px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .timeline-row {
      display: flex;
      width: 100%;
      padding: 15px;
      align-items: center;
      background-color: #f4f1f1;
      position: relative;
    }

    .left {
      width: 40%;
      text-align: left;
      padding-left: 15px;
    }

    .center {
      width: 20%;
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .right {
      width: 40%;
      padding-right: 15px;
      text-align: right;
    }

    .circle {
      width: 10px;
      height: 10px;
      background-color: white;
      border: 2px solid black;
      border-radius: 50%;
      z-index: 2;
    }

  .middle-row {
  position: relative;
  height: 70px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.line {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 50%;
  width: 2px;
  background-color: #333;
  transform: translateX(-50%);
  z-index: 0;
}

.middle-content {
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

.label-left,
.label-right {
  font-size: 14px;
  color: #333;
  width: 80px;
  text-align: center;
}

.circle-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
}

.circle-icon {
  width: 40px;
  height: 40px;
  background-color: white;
  border: 2px solid #333;
  border-radius: 50%;
  font-size: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
}
.ferry-icon {
  width: 50px;
  height: 50px;
  margin-top: 5px;
  object-fit: contain;
}





  </style>
</head>
<body>
  <div class="container">
      ${timetableDepart.map((item) => `
    <div class="header">
      <img src="https://www.thetrago.com/assets/images/logo.png" alt="The Trago">
      <div class="ref-number">
        Ref. number<br>
        <strong>${customerData.bookingcode}</strong>
      </div>
    </div>

    <div class="title-bar">E-TICKET</div>

    <div class="location-row">
      <div>
        <strong>Departure</strong><br>
       ${item.startingpoint_name}<br>
        (${item.startpier_name})
      </div>
      <div>
        <span class="icon">⏱</span><br>
        ${formatTimeToHoursAndMinutes(item.md_timetable_time)}<br>
       <img src="https://www.thetrago.com/Api/uploads/timetabledetail/shiplogo.png" class="ferry-icon" />
        
      </div>
      <div>
        <strong>Arrival</strong><br>
         ${item.endpoint_name}<br>
        (${item.endpier_name})
      </div>
    </div>

    <div class="section">
      <div>
        <h3>Departure</h3>
        <table class="info-table">
          <tr><td><strong>Date:</strong></td><td>${formatDate(customerData.departdate)}</td></tr>
          <tr><td><strong>Time:</strong></td><td>${formatTime(item.md_timetable_departuretime)} - ${formatTime(item.md_timetable_arrivaltime)} |   ${formatTimeToHoursAndMinutes(item.md_timetable_time)}</td></tr>
          <tr><td><strong>From:</strong></td><td> ${item.startingpoint_name} ${item.startpier_name})</td></tr>
          <tr><td><strong>To:</strong></td><td>${item.endpoint_name} (${item.endpier_name})</td></tr>
          <tr><td><strong>Seat:</strong></td><td>${item.md_seat_nameeng}</td></tr>
        </table>
      </div>
      <div>
        <h3>Passenger</h3>
        <table class="info-table">
          <tr><td><strong>Name:</strong></td><td>${convertTitleToEnglish(customerData.selectedTitle)} ${customerData.Firstname}  ${customerData.Lastname}</td></tr>
          <tr><td><strong>Tel.:</strong></td><td>(${formatCountryCode(customerData.countrycode)})  ${formatPhoneNumber(customerData.tel)}</td></tr>
          <tr><td><strong>Adult:</strong></td><td>${customerData.adult} persons</td></tr>
          ${customerData.child !== 0 ? `<tr><td><strong>Child:</strong></td><td>${customerData.child} persons</td></tr>` : ''}
          ${customerData.infant !== 0 ? `<tr><td><strong>Infant:</strong></td><td>${customerData.infant} persons</td></tr>` : ''}
          <tr><td><strong>Payment Status:</strong></td><td><span class="highlight">Paid</span></td></tr>
        </table>
      </div>
    </div>
    <div class="section">
    <div class="operator">
      <h3>Operated By</h3>
       <div class="centerOperator">
      <img src="https://thetrago.com/Api/uploads/company/${customerData.piccompanyDepart}" 
     alt="Company Logo" 
     width="100" 
     height="auto" 
     style="max-height: 100px; object-fit: contain;" />
      <p><strong>Tel.:</strong> ${item.md_company_tel}<br>
      <strong>Email:</strong> ${item.md_company_email}</p>
      </div>
    </div>

   <div class="timeline-box">

    <div class="timeline-row">
      <div class="left">
        <div class="text-bold">${formatTime(item.md_timetable_departuretime)}</div>
        <div class="text-sm">${formatDate(customerData.departdate)}</div>
      </div>
      <div class="center">
        <div class="circle"></div>
      </div>
      <div class="right">
        <div class="text-bold">${item.startingpoint_name}</div>
        <div class="text-sm">${item.startpier_name}</div>
      </div>
    </div>

 <div class="middle-row">
  <div class="line"></div>
  <div class="middle-content">
    <div class="label-left">${item.md_boattype_nameeng}</div>
    <div class="circle-wrapper">
      <div class="circle-icon"><img src="https://www.thetrago.com/Api/uploads/timetabledetail/shiplogo.png" class="ferry-icon" /></div>
    </div>
    <div class="label-right"> ${formatTimeToHoursAndMinutes(item.md_timetable_time)}</div>
  </div>


</div>



    <div class="timeline-row">
      <div class="left">
        <div class="text-bold">${formatTime(item.md_timetable_arrivaltime)}</div>
        <div class="text-sm">${formatDate(customerData.departdate)}</div>
      </div>
      <div class="center">
        <div class="circle"></div>
      </div>
      <div class="right">
        <div class="text-bold"> ${item.endpoint_name}</div>
        <div class="text-sm">${item.endpier_name}</div>
      </div>
    </div>
        </div>

  </div>
    </div>
    <div class="section">
    <div class="important">
      <strong>Important information</strong><br>
      • The ticket is valid only for the specified trip, date, time, and passenger name.<br>
      • Passengers must present documents and collect their boarding pass at the counter at least 45 minutes before departure.<br>
      • Each passenger is allowed 20kg of baggage. For more details, contact us.<br>
      • Reservation may be canceled if the passenger is not on board by the specified departure time.<br>
      • If the number of passengers or age exceeds the boat company’s conditions, the customer will be charged the difference at the counter.
    </div>
    </div>
     `).join('')}
  </div>
</body>
</html>

  `;

  function formatTime(time) {
    // แยกเวลาเป็นชั่วโมง นาที และวินาที
    const [hours, minutes, seconds] = time.split(':');

    // แปลงชั่วโมงจาก 24 ชั่วโมงเป็น 12 ชั่วโมง
    const hour = (parseInt(hours) % 12) || 12;

    // ตรวจสอบ AM หรือ PM
    const period = parseInt(hours) >= 12 ? 'PM' : 'AM';

    // คืนค่าผลลัพธ์ในรูปแบบ 12 ชั่วโมง
    return `${hour}:${minutes} ${period}`;
  }

  function formatTimeToHoursAndMinutes(time) {
    let [hours, minutes] = time.split(':');

    // กำจัด 0 ด้านหน้า
    hours = parseInt(hours, 10);
    minutes = parseInt(minutes, 10);

    return `${hours} h ${minutes} min`;
  }


  useEffect(() => {
    // ตรวจสอบสถานะการ login และ token เหมือนหน้า Account
    const checkLoginStatus = async () => {
      try {
        const storedToken = await SecureStore.getItemAsync('userToken');
        setToken(storedToken);
        setIsLoggedIn(!!storedToken);
        
        if (!storedToken) {
          console.log('ResultScreen: No token found, user is not logged in');
        } else {
          console.log('ResultScreen: Token found, user is logged in');
        }
      } catch (error) {
        console.error('ResultScreen: Error checking login status:', error);
        setIsLoggedIn(false);
      }
    };
    
    checkLoginStatus();
    
    // Debug log สำหรับ customerData
    console.log("🔍 CustomerData Debug:");
    console.log("Full customerData:", JSON.stringify(customerData, null, 2));
    console.log("piccompanyDepart:", customerData.piccompanyDepart);
    console.log("companyname:", customerData.companyname);
    
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
          console.log("📊 Timetable data:", data.data);
        } else {
          console.error('Data is not an array', data);
          settimetableDepart([]);
        }
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }, []);


  const sendTicket = async () => {
    try {
      const response = await axios.post(`https://thetrago.com/ferry/sendticket/${customerData.bookingcode}`);
      console.log('Email sent successfully: ', response.data);
    } catch (error) {
      console.error('Error sending email: ', error);
    }
  };

  useEffect(() => {
    if (success) {
      sendTicket();
    }

  }, []);

  const printTicket = async () => {
    try {
      await Print.printAsync({
        html: htmlContent, // พิมพ์ HTML ที่กำหนด
      });
    } catch (error) {
      console.error('Error printing ticket: ', error);
    }
  };
  const handleGoBack = () => {
    navigation.goBack();
  };
  function formatDate(dateString) {
    const date = new Date(Date.parse(dateString)); // Parses "14 Feb 2025" correctly
    
    if (selectedLanguage === 'en') {
      return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
      });
    } else {
      return date.toLocaleDateString('th-TH', { 
        weekday: 'short', 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
      });
    }
  }

  function formatPhoneNumber(phoneNumber) {
    // ตรวจสอบว่าหมายเลขมีความยาวเพียงพอ
    if (phoneNumber.length !== 10) return "Invalid number";

    // ตัดเลขตัวแรกออก แล้วจัดรูปแบบใหม่
    return `${phoneNumber.slice(1, 3)}-${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6)}`;
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


  return (
    <SafeAreaView style={{ flex: 1 }}>
      {/* Ultra Premium Gradient Background */}
      <LinearGradient
        colors={['#001233', '#002A5C', '#003A7C', '#FD501E']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1.5 }}
        style={{ flex: 1 }}
      >
        {/* Ultra Premium Glass-Morphism Header */}
        <LinearGradient
          colors={["rgba(255,255,255,0.98)", "rgba(248,250,252,0.96)", "rgba(241,245,249,0.94)"]}
          style={[
            headStyles.headerBg,
            {
              width: '100%',
              marginLeft: '0%',
              paddingTop: insets.top + EXTRA_TOP_GUTTER,
              borderBottomLeftRadius: 45,
              borderBottomRightRadius: 45,
              paddingBottom: 12,
              padding: 12,
              minHeight: hp('13%'),
              borderWidth: 1.5,
              borderColor: 'rgba(0, 18, 51, 0.1)',
              backdropFilter: 'blur(40px)',
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
            {/* Ultra Back Button - Left */}
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{
                position: 'absolute',
                left: 16,
                backgroundColor: 'rgba(255, 255, 255, 0.98)',
                borderRadius: 28,
                padding: 10,
                zIndex: 2,
                borderWidth: 1.5,
                borderColor: 'rgba(253, 80, 30, 0.12)',
                backdropFilter: 'blur(20px)',
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
              {success ? t('bookingConfirmed') : t('bookingFailed')}
            </Text>
            <Text style={{
              color: 'rgba(255,255,255,0.85)',
              fontSize: wp('3.8%'),
              fontWeight: '600',
              marginTop: hp('0.8%'),
              letterSpacing: 0.5,
            }}>
              {success ? t('ticketConfirmed') : t('contactSupport')}
            </Text>
          </View>
        </View>

        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

        <ScrollView 
          contentContainerStyle={[styles.container, { paddingBottom: hp('15%') }]}
          showsVerticalScrollIndicator={false}
          contentInsetAdjustmentBehavior="automatic"
          bounces={false}
        >
        {success && (
        <View style={styles.card}>
          {/* Ultra Premium Company Header */}
          <View style={styles.companyHeader}>
            <View style={styles.logoContainer}>
              {customerData.piccompanyDepart && !imageError ? (
                <Image
                  source={{ 
                    uri: `https://thetrago.com/Api/uploads/company/${customerData.piccompanyDepart}?v=${Date.now()}`,
                    cache: 'reload'
                  }}
                  style={styles.logo}
                  resizeMode="contain"
                  onError={(error) => {
                    console.log("Image failed, trying alternative...");
                    setImageError(true);
                  }}
                  onLoad={() => {
                    console.log("Image loaded successfully");
                    setImageError(false);
                  }}
                />
              ) : customerData.piccompanyDepart && imageError ? (
                <Image
                  source={{ 
                    uri: `https://www.thetrago.com/Api/uploads/company/${customerData.piccompanyDepart}`,
                    cache: 'force-cache'
                  }}
                  style={styles.logo}
                  resizeMode="contain"
                  onError={() => {
                    console.log("Alternative URL also failed");
                  }}
                  onLoad={() => {
                    console.log("Alternative image loaded");
                    setImageError(false);
                  }}
                />
              ) : (
                <View style={[styles.logo, { 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  backgroundColor: '#ffffff',
                  borderWidth: 1,
                  borderColor: '#e0e0e0',
                }]}>
                  <Ionicons name="business" size={40} color="#FD501E" />
                  <Text style={{ 
                    fontSize: 8, 
                    color: '#666', 
                    textAlign: 'center', 
                    marginTop: 2,
                    fontWeight: '600' 
                  }}>
                    {customerData.companyname || 'บริษัท'}
                  </Text>
                </View>
              )}
            </View>
            
            <View style={styles.companyInfo}>
              <Text style={styles.companyName}>{customerData.companyname}</Text>
              
              <View style={styles.infoRow}>
                <Ionicons name="location-outline" size={16} color="#FD501E" />
                <Text style={styles.infoText}> {customerData.startingpoint_name}</Text>
                <AntDesign name="arrowright" size={12} color="#6B7280" style={{ marginHorizontal: 8 }} />
                <Text style={styles.infoText}>{customerData.endpoint_name}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Ionicons name="calendar-outline" size={16} color="#FD501E" />
                <Text style={styles.infoText}> {formatDate(customerData.departdate)}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Ionicons name="person-outline" size={16} color="#FD501E" />
                <Text style={styles.infoText}> {customerData.adult} {t('adult')}, {customerData.child} {t('child')}, {customerData.infant} {t('infant')}</Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />
          
          {/* Ultra Premium Summary Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('summary')}</Text>
            <Text style={styles.dateText}>{t('bookingDate')}: {formatDate(customerData.bookingdate)}</Text>
          </View>
          
          <View style={styles.divider} />
          
          {/* Ultra Premium Details Grid */}
          <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>{t('adult')}</Text>
            <Text style={styles.detailValue}>{customerData.adult} {t('person')}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t('passengerName')}</Text>
            <Text style={styles.detailValue}>{customerData.Firstname} {customerData.Lastname}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t('phoneNumber')}</Text>
            <Text style={styles.detailValue}>{formatCountryCode(customerData.countrycode)} {formatPhoneNumber(customerData.tel)}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t('email')}</Text>
            <Text style={styles.detailValue}>{customerData.email}</Text>
          </View>
          
          <View style={styles.divider} />
          
          {/* Ultra Premium Price Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('priceDetails')}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t('adult')} x {customerData.adult}</Text>
            <Text style={styles.detailValue}>{customerData.symbol} {formatNumberWithComma(customerData.totaladultDepart)}</Text>
          </View>
          
          {customerData.child !== 0 && customerData.totalchildDepart && customerData.totalchildDepart !== "0" && customerData.totalchildDepart !== 0 && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t('child')} x {customerData.child}</Text>
              <Text style={styles.detailValue}>{customerData.symbol} {formatNumberWithComma(customerData.totalchildDepart)}</Text>
            </View>
          )}
          
          {customerData.infant !== 0 && customerData.totalinfantDepart && customerData.totalinfantDepart !== "0" && customerData.totalinfantDepart !== 0 && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t('infant')} x {customerData.infant}</Text>
              <Text style={styles.detailValue}>{customerData.symbol} {formatNumberWithComma(customerData.totalinfantDepart)}</Text>
            </View>
          )}
          
          {customerData.pickupPriceDepart && customerData.pickupPriceDepart !== "0" && customerData.pickupPriceDepart !== 0 && customerData.pickupPriceDepart !== "0.00" && parseFloat(customerData.pickupPriceDepart) > 0 && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t('pickupService')}</Text>
              <Text style={styles.detailValue}>{customerData.symbol} {formatNumberWithComma(customerData.pickupPriceDepart)}</Text>
            </View>
          )}
          
          {customerData.dropoffPriceDepart && customerData.dropoffPriceDepart !== "0" && customerData.dropoffPriceDepart !== 0 && customerData.dropoffPriceDepart !== "0.00" && parseFloat(customerData.dropoffPriceDepart) > 0 && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t('dropoffService')}</Text>
              <Text style={styles.detailValue}>{customerData.symbol} {formatNumberWithComma(customerData.dropoffPriceDepart)}</Text>
            </View>
          )}

          {/* บริการรับส่งสำหรับเที่ยวกลับ */}
          {customerData.pickupPriceReturn && customerData.pickupPriceReturn !== "0" && customerData.pickupPriceReturn !== 0 && customerData.pickupPriceReturn !== "0.00" && parseFloat(customerData.pickupPriceReturn) > 0 && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t('pickupServiceReturn')}</Text>
              <Text style={styles.detailValue}>{customerData.symbol} {formatNumberWithComma(customerData.pickupPriceReturn)}</Text>
            </View>
          )}
          
          {customerData.dropoffPriceReturn && customerData.dropoffPriceReturn !== "0" && customerData.dropoffPriceReturn !== 0 && customerData.dropoffPriceReturn !== "0.00" && parseFloat(customerData.dropoffPriceReturn) > 0 && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t('dropoffServiceReturn')}</Text>
              <Text style={styles.detailValue}>{customerData.symbol} {formatNumberWithComma(customerData.dropoffPriceReturn)}</Text>
            </View>
          )}

          {/* เพิ่มราคาข้อมูลตั๋วรถ/เรือ Return ถ้ามี */}
          {customerData.subtotalReturn && customerData.subtotalReturn !== "0" && customerData.subtotalReturn !== 0 && (
            <>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{t('returnTicket')}</Text>
                <Text style={styles.detailValue}>{customerData.symbol} {formatNumberWithComma(customerData.subtotalReturn)}</Text>
              </View>
              
              {customerData.totaladultReturn && customerData.totaladultReturn !== "0" && customerData.totaladultReturn !== 0 && (
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { fontSize: wp('3.5%'), color: '#6B7280', paddingLeft: wp('4%') }]}>
                    • {t('adultReturn')} x {customerData.adult}
                  </Text>
                  <Text style={[styles.detailValue, { fontSize: wp('3.5%'), color: '#6B7280' }]}>
                    {customerData.symbol} {formatNumberWithComma(customerData.totaladultReturn)}
                  </Text>
                </View>
              )}
              
              {customerData.totalchildReturn && customerData.totalchildReturn !== "0" && customerData.totalchildReturn !== 0 && customerData.child !== 0 && (
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { fontSize: wp('3.5%'), color: '#6B7280', paddingLeft: wp('4%') }]}>
                    • {t('childReturn')} x {customerData.child}
                  </Text>
                  <Text style={[styles.detailValue, { fontSize: wp('3.5%'), color: '#6B7280' }]}>
                    {customerData.symbol} {formatNumberWithComma(customerData.totalchildReturn)}
                  </Text>
                </View>
              )}
              
              {customerData.totalinfantReturn && customerData.totalinfantReturn !== "0" && customerData.totalinfantReturn !== 0 && customerData.infant !== 0 && (
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { fontSize: wp('3.5%'), color: '#6B7280', paddingLeft: wp('4%') }]}>
                    • {t('infantReturn')} x {customerData.infant}
                  </Text>
                  <Text style={[styles.detailValue, { fontSize: wp('3.5%'), color: '#6B7280' }]}>
                    {customerData.symbol} {formatNumberWithComma(customerData.totalinfantReturn)}
                  </Text>
                </View>
              )}
            </>
          )}
          
          {customerData.discountDepart && customerData.discountDepart !== "0" && customerData.discountDepart !== 0 && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t('discount')}</Text>
              <Text style={styles.discountText}>- {customerData.symbol} {formatNumberWithComma(customerData.discountDepart)}</Text>
            </View>
          )}
          
          {customerData.discountReturn && customerData.discountReturn !== "0" && customerData.discountReturn !== 0 && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t('returnDiscount')}</Text>
              <Text style={styles.discountText}>- {customerData.symbol} {formatNumberWithComma(customerData.discountReturn)}</Text>
            </View>
          )}
          
          {customerData.subtotalDepart && customerData.subtotalDepart !== "0" && customerData.subtotalDepart !== 0 && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t('ticketPrice')}</Text>
              <Text style={styles.detailValue}>{customerData.symbol} {formatNumberWithComma(customerData.subtotalDepart)}</Text>
            </View>
          )}
          
          <View style={styles.divider} />
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t('subtotal')}</Text>
            <Text style={styles.detailValue}>
              {customerData.symbol} {formatNumberWithComma(
                (parseFloat(customerData.subtotalDepart || 0) + parseFloat(customerData.subtotalReturn || 0))
              )}
            </Text>
          </View>
          
          <View style={styles.divider} />
          
          {customerData.paymentfee && customerData.paymentfee !== "0" && customerData.paymentfee !== 0 && (
            <>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{t('paymentFee')}</Text>
                <Text style={styles.feeText}>+ {customerData.symbol} {formatNumberWithComma(customerData.paymentfee)}</Text>
              </View>
              <View style={styles.divider} />
            </>
          )}

          {/* เพิ่มข้อมูลภาษีหรือค่าธรรมเนียมอื่นๆ ถ้ามี */}
          {customerData.tax && customerData.tax !== "0" && customerData.tax !== 0 && (
            <>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{t('tax')}</Text>
                <Text style={styles.feeText}>+ {customerData.symbol} {formatNumberWithComma(customerData.tax)}</Text>
              </View>
              <View style={styles.divider} />
            </>
          )}

          {customerData.serviceFee && customerData.serviceFee !== "0" && customerData.serviceFee !== 0 && (
            <>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{t('serviceFee')}</Text>
                <Text style={styles.feeText}>+ {customerData.symbol} {formatNumberWithComma(customerData.serviceFee)}</Text>
              </View>
              <View style={styles.divider} />
            </>
          )}
          
          {/* Ultra Premium Total Section */}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>{t('total')}</Text>
            <Text style={styles.totalValue}>{customerData.symbol} {formatNumberWithComma(customerData.total)}</Text>
          </View>
          
          <View style={styles.divider} />
          
          {/* Ultra Premium Action Section */}
          <View style={styles.actionSection}>
            <View style={styles.bookingCodeSection}>
              <Text style={styles.bookingLabel}>{t('bookingCode')}</Text>
              <Text style={styles.bookingCode}>{customerData.bookingcode || "N/A"}</Text>
            </View>
            
            <TouchableOpacity style={styles.printButton} onPress={printTicket}>
              <LinearGradient
                colors={['#FD501E', '#FF6B35']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.printButtonGradient}
              >
                <Ionicons name="print-outline" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.printButtonText}>{t('printTicket')}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* เพิ่มส่วนคะแนนที่ผู้ใช้ได้รับ - แสดงเฉพาะผู้ใช้ที่ login แล้ว */}
          {isLoggedIn && (
            <>
              <View style={styles.divider} />
              
              <View style={styles.rewardSection}>
                <View style={styles.rewardHeader}>
                  <Ionicons name="trophy" size={24} color="#FFD700" />
                  <Text style={styles.rewardTitle}>{t('earnedPoints')}</Text>
                </View>
                
                <View style={styles.rewardContainer}>
                  <LinearGradient
                    colors={['#FFD700', '#FFA500']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.rewardGradient}
                  >
                    <View style={styles.rewardContent}>
                      <Text style={styles.rewardPoints}>
                        +{customerData.earnedPoints ? parseFloat(customerData.earnedPoints).toFixed(2) : (() => {
                          // คำนวณคะแนนจาก subtotal เท่านั้น
                          const subtotalDepart = parseFloat(customerData.subtotalDepart || 0);
                          const subtotalReturn = parseFloat(customerData.subtotalReturn || 0);
                          
                          // รวม subtotal และคำนวณคะแนน (1 คะแนนต่อ 100 บาท)
                          const totalSubtotal = subtotalDepart + subtotalReturn;
                          
                          return (totalSubtotal / 100).toFixed(2);
                        })()} 
                      </Text>
                      <Text style={styles.rewardLabel}>{t('points')}</Text>
                    </View>
                    <Ionicons name="star" size={32} color="#FFFFFF" style={{ opacity: 0.8 }} />
                  </LinearGradient>
                </View>
                
                <Text style={styles.rewardNote}>
                  {t('pointsNote')}
                </Text>
              </View>
            </>
          )}

          {/* แสดงข้อความแนะนำให้ login สำหรับผู้ใช้ที่ยังไม่ได้ login */}
          {!isLoggedIn && (
            <>
              <View style={styles.divider} />
              
              <View style={styles.loginPromptSection}>
                <View style={styles.loginPromptHeader}>
                  <Ionicons name="person-circle-outline" size={24} color="#6B7280" />
                  <Text style={styles.loginPromptTitle}>{t('loginForPoints')}</Text>
                </View>
                
                <View style={styles.loginPromptContainer}>
                  <Text style={styles.loginPromptText}>
                    {t('loginPrompt')}
                  </Text>
                  <Text style={styles.loginPromptSubtext}>
                    {t('loginSubtext')}
                  </Text>
                </View>
              </View>
            </>
          )}
        </View>
        )}
        {!success && (
           <View style={styles.card}>
                    {!success && (
          <View style={styles.errorCard}>
            <View style={styles.errorContent}>
              <Ionicons name="alert-circle-outline" size={48} color="#DC2626" style={{ marginBottom: hp('2%') }} />
              <Text style={styles.errorTitle}>{t('invalidCard')}</Text>
              <Text style={styles.errorSubtitle}>{t('contactUs')}</Text>
              <Text style={styles.errorContact}>{t('email')}: info@thetrago.com</Text>
            </View>
          </View>
        )}
          </View>
        )}
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default ResultScreen;
