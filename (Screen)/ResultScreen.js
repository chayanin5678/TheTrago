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
  const { success, booking_code } = route.params ;
  const [orderStatus, setOrderStatus] = useState("Pending");
  const [pdfUri, setPdfUri] = useState(null);

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
      line-height: 1.6;
    }
    .logo {
      height: 30px;
      margin-bottom: 5px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://www.thetrago.com/assets/images/logo.png" alt="The Trago">
      <div class="ref-number">
        Ref. number<br>
        <strong>TG680912093</strong>
      </div>
    </div>

    <div class="title-bar">E-TICKET</div>

    <div class="location-row">
      <div>
        <strong>Departure</strong><br>
        Phuket<br>
        (Phuket Bus Terminal 2)
      </div>
      <div>
        <span class="icon">⏱</span><br>
        8 h 30 m<br>
        🚤
      </div>
      <div>
        <strong>Arrival</strong><br>
        Koh Samui<br>
        (Hotel in Koh Samui (Located in Chaweng Bohput))
      </div>
    </div>

    <div class="section">
      <div>
        <h3>Departure</h3>
        <table class="info-table">
          <tr><td><strong>Date:</strong></td><td>04 April 2025</td></tr>
          <tr><td><strong>Time:</strong></td><td>08:00 - 16:30 | 8 h 30 m</td></tr>
          <tr><td><strong>From:</strong></td><td>Phuket (Phuket Bus Terminal 2)</td></tr>
          <tr><td><strong>To:</strong></td><td>Koh Samui (Hotel in Koh Samui...)</td></tr>
          <tr><td><strong>Seat:</strong></td><td>Economy</td></tr>
        </table>
      </div>
      <div>
        <h3>Passenger</h3>
        <table class="info-table">
          <tr><td><strong>Name:</strong></td><td>Mr. Christopher Brown</td></tr>
          <tr><td><strong>Tel.:</strong></td><td>(+66)0842293612</td></tr>
          <tr><td><strong>Adult:</strong></td><td>2 persons</td></tr>
          <tr><td><strong>Child:</strong></td><td>1 persons</td></tr>
          <tr><td><strong>Payment Status:</strong></td><td><span class="highlight">Paid</span></td></tr>
        </table>
      </div>
    </div>

    <div class="operator">
      <h3>Operated By</h3>
      <img src="https://www.phantiptravel.com/wp-content/uploads/2019/09/logo-phantip.png" alt="Phantip" class="logo">
      <p><strong>Tel.:</strong> +66611722751<br>
      <strong>Email:</strong> info@phantiptravel.com</p>
    </div>

    <div class="timeline">
      <div>
        <strong>08:00</strong><br>04 April 2025<br><small>Phuket Bus Terminal 2</small>
      </div>
      <div>
        🚤<br>
        Ferry<br>
        8 h 30 m
      </div>
      <div>
        <strong>16:30</strong><br>04 April 2025<br><small>Koh Samui Hotel</small>
      </div>
    </div>

    <div class="important">
      <strong>Important information</strong><br>
      • The ticket is valid only for the specified trip, date, time, and passenger name.<br>
      • Passengers must present documents and collect their boarding pass at the counter at least 45 minutes before departure.<br>
      • Each passenger is allowed 20kg of baggage. For more details, contact us.<br>
      • Reservation may be canceled if the passenger is not on board by the specified departure time.<br>
      • If the number of passengers or age exceeds the boat company’s conditions, the customer will be charged the difference at the counter.
    </div>
  </div>
</body>
</html>

  `;



  const sendTicket = async () => {
    try {
      const response = await axios.post(`${ipAddress}/send-ticket`, {
        email: customerData.email,  // อีเมลผู้รับ
        htmlContent: htmlContent,        // HTML ที่เราจะส่งไป
      });
      console.log('Email sent successfully: ', response.data);
    } catch (error) {
      console.error('Error sending email: ', error);
    }
  };
  
  useEffect(() => {
    sendTicket();  // เรียกฟังก์ชัน sendTicket เมื่อคอมโพเนนต์โหลด
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
          <Text>฿ {formatNumberWithComma((parseFloat(customerData.subtotalDepart)+parseFloat(customerData.subtotalReturn)))}</Text>
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
      {orderStatus === "Failed" && (
          <Text style={styles.errorText}>Please try again later or contact support.</Text>
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
  background :{
    width:'100%',
  }

});

export default ResultScreen;
