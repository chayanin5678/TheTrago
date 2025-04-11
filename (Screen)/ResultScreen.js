import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, ImageBackground, Alert, Platform } from "react-native";
import LogoHeader from "./../(component)/Logo";
import Ionicons from '@expo/vector-icons/Ionicons';
import ipAddress from "../ipconfig";
import AntDesign from '@expo/vector-icons/AntDesign';
import axios from "axios";
import { useCustomer } from './CustomerContext';
import * as Print from 'expo-print';




const ResultScreen = ({ navigation, route }) => {
  const { customerData } = useCustomer();
  const { success, booking_code } = route.params;
  const [orderStatus, setOrderStatus] = useState("Pending");
  const [pdfUri, setPdfUri] = useState(null);
  const [timetableDepart, settimetableDepart] = useState([]);

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
  width 50px;
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
          <tr><td><strong>Name:</strong></td><td>${customerData.selectedTitle} ${customerData.Firstname}  ${customerData.Lastname}</td></tr>
          <tr><td><strong>Tel.:</strong></td><td>(${customerData.countrycode})  ${formatPhoneNumber(customerData.tel)}</td></tr>
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
    return date.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
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
    <ScrollView contentContainerStyle={styles.container}>
      <ImageBackground
        source={{ uri: 'https://www.thetrago.com/assets/images/bg/Aliments.png' }}
        style={styles.background}>
        <LogoHeader />
        {success && (
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.col}>
              <Image
                source={{ uri: `https://thetrago.com/Api/uploads/company/${customerData.piccompanyDepart}` }}// Correct way to reference a local image
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <View style={styles.col}>
              <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10, flexWrap: "wrap", width: "90%" }}>{customerData.companyname}</Text>
              <View style={styles.row}>
                <Ionicons name="location-outline" size={16} color="#FD501E" />
                <Text> {customerData.startingpoint_name}</Text>
                <AntDesign name="arrowright" size={10} color="black" />
                <Text> {customerData.endpoint_name}</Text>
              </View>
              <View style={styles.row}>
                <Ionicons name="calendar-outline" size={16} color="#FD501E" />
                <Text> {formatDate(customerData.departdate)}</Text>
              </View>
              <View style={styles.row}>
                <Ionicons name="person-outline" size={16} color="#FD501E" />
                <Text> {customerData.adult} Adult, {customerData.child} Child, {customerData.infant} Infant</Text>
              </View>
              <View style={styles.row}>
                <Ionicons name="checkmark-circle-outline" size={16} color="#FD501E" />
                <Text> Free Cancellation</Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />
          <View style={[styles.row, { justifyContent: 'space-between' }]}>
            <Text style={styles.titel}>Summary</Text>
            <Text> Booking date: {formatDate(customerData.bookingdate)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={[styles.row, { justifyContent: 'space-between' }]}>
            <Text >Adult </Text>
            <Text> {customerData.adult} Persons</Text>
          </View>
          <View style={[styles.row, { justifyContent: 'space-between' }]}>
            <Text >Passenger name </Text>
            <Text>{customerData.Firstname} {customerData.Lastname}</Text>
          </View>
          <View style={[styles.row, { justifyContent: 'space-between' }]}>
            <Text >Phone number </Text>
            <Text>{customerData.countrycode} {formatPhoneNumber(customerData.tel)}</Text>
          </View>
          <View style={[styles.row, { justifyContent: 'space-between' }]}>
            <Text >Email address </Text>
            <Text>{customerData.email}</Text>
          </View>
          <View style={styles.divider} />
          <View style={[styles.row, { justifyContent: 'space-between' }]}>
            <Text style={styles.titel}>Price Details</Text>
          </View>

          <View style={[styles.row, { justifyContent: 'space-between' }]}>
            <Text >Adult x {customerData.adult} </Text>
            <Text>฿ {formatNumberWithComma(customerData.totaladultDepart)}</Text>
          </View>
          {customerData.child !== 0 && (
            <View style={[styles.row, { justifyContent: 'space-between' }]}>
              <Text>Child x {customerData.child}</Text>
              <Text>฿ {formatNumberWithComma(customerData.totalchildDepart)}</Text>
            </View>
          )}
          {customerData.infant !== 0 && (
            <View style={[styles.row, { justifyContent: 'space-between' }]}>
              <Text>Infant x {customerData.infant}</Text>
              <Text>฿ {formatNumberWithComma(customerData.totalinfantDepart)}</Text>
            </View>
          )}
            {customerData.pickupPriceDepart !== 0 && (
            <View style={[styles.row, { justifyContent: 'space-between' }]}>
              <Text>Pickup {customerData.infant}</Text>
              <Text>฿ {formatNumberWithComma(customerData.pickupPriceDepart)}</Text>
            </View>
          )}
            {customerData.dropoffPriceDepart !== 0 && (
            <View style={[styles.row, { justifyContent: 'space-between' }]}>
              <Text>Drop off {customerData.infant}</Text>
              <Text>฿ {formatNumberWithComma(customerData.dropoffPriceDepart)}</Text>
            </View>
          )}
          <View style={[styles.row, { justifyContent: 'space-between' }]}>
            <Text>Discount</Text>
            <Text style={styles.redText}>- ฿  {formatNumberWithComma(customerData.discountDepart)}</Text>
          </View>
          <View style={[styles.row, { justifyContent: 'space-between' }]}>
            <Text>Ticket fare</Text>
            <Text>฿ {formatNumberWithComma(customerData.subtotalDepart)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={[styles.row, { justifyContent: 'space-between' }]}>
            <Text>Subtotal </Text>
            <Text>฿ {formatNumberWithComma((parseFloat(customerData.subtotalDepart) + parseFloat(customerData.subtotalReturn)))}</Text>
          </View>
          <View style={styles.divider} />
          <View style={[styles.row, { justifyContent: 'space-between' }]}>
            <Text>Payment Fee </Text>
            <Text style={styles.greenText}>+ ฿ {formatNumberWithComma(customerData.paymentfee)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={[styles.row, { justifyContent: 'space-between' }]}>
            <Text>total </Text>
            <Text> ฿ {formatNumberWithComma(customerData.total)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.bookingCodeText}>
            <View style={{ flexDirection: 'column' }}>
              <Text>Booking Code:</Text>
              <Text>{customerData.bookingcode || "N/A"}</Text>
            </View>
            <TouchableOpacity style={styles.BackButton} onPress={printTicket}>
              <Text style={styles.BackButtonText}>Print Ticket</Text>
            </TouchableOpacity>
          </View>
        </View>
        )}
        {!success && (
           <View style={styles.card}>
            <View style={{alignItems: 'center'}}>
          <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Your card is not valid. Please check again.</Text>
          <Text style={{ fontSize: 16}}>Please contact the officer.</Text>
          <Text style={{ fontSize: 16, marginTop: 20}}>Email : info@thetrago.com</Text>
          </View>
          </View>
        )}
      </ImageBackground>
    </ScrollView>
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
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  titel: {
    fontSize: 18,
    fontWeight: "bold",
  },
  statusText: {
    fontSize: 18,
    marginBottom: 20,
  },
  errorText: {
    color: "red",
    fontSize: 16,
    marginBottom: 20,
  },
  bookingCodeText: {
    flexDirection: 'row',
    alignItems: 'center',
    fontSize: 20,
    marginBottom: 30,
    justifyContent: "space-between",
  },
  BackButton: {
    backgroundColor: "#FD501E",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    width: "60%",
    alignItems: "center",
  },
  BackButtonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',


  },
  col: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginLeft: '5%',

  },
  logo: {
    width: 100,
    height: 100,
    marginTop: -10,
  },
  divider: {
    height: 1, // ความหนาของเส้น
    width: '100%', // ทำให้ยาวเต็มจอ
    backgroundColor: '#CCCCCC', // สีของเส้น
    marginVertical: 10, // ระยะห่างระหว่าง element
  },
  redText: {
    color: 'red',
  },
  greenText: {
    color: 'green',
  },
  background: {
    width: '100%',
  }

});

export default ResultScreen;
