import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, Button, Alert, Platform } from "react-native";
import LogoHeader from "./../(component)/Logo";
import Ionicons from '@expo/vector-icons/Ionicons';
import * as FileSystem from 'expo-file-system';
import ipAddress from "../ipconfig";
import AntDesign from '@expo/vector-icons/AntDesign';
import axios from "axios";
import { useCustomer } from './CustomerContext';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
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
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Travel Itinerary</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css">
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }

        .container {
            max-width: 900px;
            margin: auto;
            padding: 20px;
            background: white;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }

        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-bottom: 20px;
        }

        .logo img {
            width: 150px;
        }

        /* ✅ ปรับระยะห่างของ Booking Number และ Booking Date ให้พอดี */
        .booking-info {
            display: flex;
            gap: 20px;
            /* ปรับค่าตามต้องการ */
            align-items: center;
            /* ทำให้ข้อความอยู่ตรงกลาง */
        }

        .bold {
            font-weight: bold;

        }

        .wrap {
            flex-wrap: wrap;
            max-width: 350px;
        }

        .card {
            background: #fff;
            border-radius: 10px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
            overflow: hidden;
            margin-top: 10px;
        }

        .card-header {
            background: #f0f0f0;
            padding: 15px;
            font-weight: bold;
            font-size: 18px;
        }

        .card-body {
            display: flex;
            padding: 20px;
        }

        .card-body img {
            width: 150px;
            height: 150px;
            border-radius: 10px;
        }

        .info {
            flex-grow: 1;
            padding-left: 20px;
        }

        .info p {
            margin: 5px 0;
        }

        .passenger-info {
            font-size: 14px;
            color: #333;
        }

        .passenger-info p {
            display: flex;
            justify-content: space-between;
            gap: 50px;
        }

        .important-info {
            background: #fff;
            padding: 20px;
            margin-top: 10px;
            border-radius: 10px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        }

        .important-info ul {
            padding-left: 20px;
        }

        .qr-code {
            text-align: right;
        }

        .footer {
            text-align: center;
            margin-top: 20px;
            padding: 10px;
            background: #f0f0f0;
            border-radius: 10px;
        }

        .footer a {
            color: #FD501E;
            font-weight: bold;
            text-decoration: none;
        }

        .itinerary-header {
            display: flex;
            align-items: center;
            width: 100%;
        }

        .itinerary-title {
            font-size: 25px;
            font-weight: bold;
            margin-right: 10px;
            white-space: nowrap;
            /* ป้องกันขึ้นบรรทัดใหม่ */
        }

        .line {
            flex-grow: 1;
            height: 1px;
            background-color: #000;
        }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <img src="https://www.thetrago.com/assets/images/logo.png" width="20%" />
        <div class="booking-info">
          <div>
            <p><span class="bold">Booking Number:</span> ${booking_code}</p>
          </div>
          <div>
            <p><span class="bold">Booking Date:</span> ${formatDate(customerData.bookingdate)}</p>
          </div>
        </div>
      </div>
      <div class="itinerary-header">
        <span class="itinerary-title">Travel Itinerary</span>
        <div class="line"></div>
      </div>
      <div class="card">
        <div class="card-header">${formatDate(customerData.departdate)}</div>
        <div class="card-body">
          <img src="https://f.ptcdn.info/332/077/000/rc7v6a3t5pj51YoI6fMg-o.jpg" alt="Statue of Liberty" width="30%" height="auto" />
          <div class="info">
            <p class="wrap"><span class="bold">${customerData.companyname}</span></p>
            <p>⭐⭐⭐⭐⭐ 5.0</p>
            <p><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#FD501E"><path d="M12 2C8.69 2 6 4.69 6 8c0 4.58 6 13 6 13s6-8.42 6-13c0-3.31-2.69-6-6-6zm0 8.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 5.5 12 5.5s2.5 1.12 2.5 2.5S13.38 10.5 12 10.5z" /></svg> ${customerData.startingpoint_name} <i class="fa-solid fa-arrow-right"></i> ${customerData.endpoint_name}</p>
            <p><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#FD501E"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM7 12h5v5H7z"></path></svg> ${formatDate(customerData.departdate)}</p>
            <p><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#FD501E"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"></path></svg> ${customerData.adult} Adult</p>
            <p><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#FD501E"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" /></svg> Free cancellation</p>
          </div>
          <div class="passenger-info">
            <p><span class="bold">Passenger</span></p>
            <p>Adult <span>${customerData.adult} Persons</span></p>
            <p>Passenger name <span>${customerData.Firstname} ${customerData.Lastname}</span></p>
            <p>Phone number <span>${customerData.countrycode} ${formatPhoneNumber(customerData.tel)}</span></p>
            <p>Email address <span>${customerData.email}</span></p>
            <div class="qr-code">
              <img src="https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl=https://g.co/kgs/PhnkPFm&choe=UTF-8" alt="QR Code for Google Maps">
            </div>
          </div>
        </div>
      </div>

      <p class="bold">Important information</p>
      <ul>
        <li>The ticket is valid only for the specified trip, date, time, and passenger name.</li>
        <li>Passengers must present documents and collect their boarding pass at the counter at least 45 minutes before departure.</li>
        <li>Each passenger is allowed 20kg of baggage. For more details, contact us.</li>
        <li>Reservation may be canceled if the passenger is not on board by the specified departure time.</li>
        <li>If the number of passengers or age exceeds the boat company’s conditions, the customer will be charged the difference at the counter.</li>
      </ul>

      <div class="footer">
        <p>Explore the best travel and lifestyle web here!</p>
        <a href="https://www.thetrago.com">www.thetrago.com</a>
      </div>
    </div>
  </body>
  </html>
  `;

  const convertUriToBase64 = async (uri) => {
    try {
      const file = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      return file;
    } catch (error) {
      console.error('Error converting URI to base64:', error);
      return null;
    }
  };

  useEffect(() => {
    const generatePDF = async () => {
      try {
        const { uri } = await Print.printToFileAsync({ html: htmlContent });
        setPdfUri(uri);  // Set the URI when PDF is generated
      } catch (error) {
        console.error('PDF Generation Error:', error);
        Alert.alert('Error', 'Failed to generate PDF');
      }
    };

    generatePDF();  // Generate PDF as soon as the component is mounted
  }, []);

  useEffect(() => {
    if (pdfUri) {
      sendEmail(pdfUri);  // Send email immediately once the PDF URI is available
    }
  }, [pdfUri]);

const sendEmail = async (pdfUri) => {
  try {
    const base64File = await convertUriToBase64(pdfUri);
    const response = await axios.post(`${ipAddress}/send-email`, {
      recipientEmail: customerData.email,
      subject: 'Your Travel Ticket',
      body: 'Dear customer, \n\nPlease find your travel ticket attached.',
      pdfUri: base64File,  // Sending the base64 string instead of the local URI
    });

    if (response.data.success) {
      alert("The email has been sent successfully.");
    } else {
      alert("Failed to send the email.");
    }
  } catch (error) {
    console.error('Error sending email:', error);
    alert("There was an error sending the email.");
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


  return (
    <ScrollView contentContainerStyle={styles.container}>
      <LogoHeader />
      <View style={styles.card}>
        <View style={styles.row}>
          <View style={styles.col}>
            <Image
              source={require('./../assets/result.png')} // Correct way to reference a local image
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
              <Text> {customerData.adult} Adult, {customerData.child} Child</Text>
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
          <Text>฿ {customerData.totaladult}</Text>
        </View>
        {parseFloat(customerData.child) !== 0 && (
          <View style={[styles.row, { justifyContent: 'space-between' }]}>
            <Text>Child x {customerData.child}</Text>
            <Text>฿ {customerData.totalchild}</Text>
          </View>
        )}
        <View style={[styles.row, { justifyContent: 'space-between' }]}>
          <Text>Discount</Text>
          <Text style={styles.redText}>- ฿  {customerData.discount}</Text>
        </View>
        <View style={[styles.row, { justifyContent: 'space-between' }]}>
          <Text>Ticket fare</Text>
          <Text>฿ {customerData.ticketfare}</Text>
        </View>
        <View style={styles.divider} />
        <View style={[styles.row, { justifyContent: 'space-between' }]}>
          <Text>Subtotal </Text>
          <Text>฿ {customerData.subtotal}</Text>
        </View>
        <View style={styles.divider} />
        <View style={[styles.row, { justifyContent: 'space-between' }]}>
          <Text>Payment Fee </Text>
          <Text style={styles.greenText}>+ ฿ {customerData.paymentfee}</Text>
        </View>
        <View style={styles.divider} />
        <View style={[styles.row, { justifyContent: 'space-between' }]}>
          <Text>total </Text>
          <Text> ฿ {customerData.total}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.bookingCodeText}>
        <View style={{ flexDirection: 'column' }}>
          <Text>Booking Code:</Text>
          <Text>{customerData.booking_code || "N/A"}</Text>
          </View>
          <TouchableOpacity style={styles.BackButton} onPress={handleGoBack}>
          <Text style={styles.BackButtonText}>Go Back</Text>
        </TouchableOpacity>
        </View>


      
        <Button title="Generate and Send PDF" onPress={() => sendEmail(pdfUri)} />

      </View>
      {orderStatus === "Failed" && (
          <Text style={styles.errorText}>Please try again later or contact support.</Text>
        )}
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

});

export default ResultScreen;
