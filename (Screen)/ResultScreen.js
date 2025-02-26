import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from "react-native";
import LogoHeader from "./../(component)/Logo";
import Ionicons from '@expo/vector-icons/Ionicons';
import ipAddress from "../ipconfig";
import AntDesign from '@expo/vector-icons/AntDesign';

import { useCustomer } from './CustomerContext';

const ResultScreen = ({ navigation, route }) => {
  const { customerData } = useCustomer();
  const { success, booking_code } = route.params;
  const [orderStatus, setOrderStatus] = useState("Pending");

  useEffect(() => {
    if (success === true) {
      setOrderStatus("Success");
    } else if (success === false) {
      setOrderStatus("Failed");
    } else {
      setOrderStatus("Pending");
    }
  }, [success]);

  const handleGoBack = () => {
    navigation.goBack();
  };

  function formatDate(dateString) {
    const date = new Date(Date.parse(dateString)); // Parses "14 Feb 2025" correctly
    return date.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
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
          <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10, flexWrap: "wrap", width:"90%" }}>{customerData.companyname}</Text>
          <View style={styles.row}>
          <Ionicons name="location-outline" size={16} color="#FD501E" />
          <Text>{customerData.startingpoint_name}</Text>
          <AntDesign name="arrowright" size={10} color="black" />
          <Text>{customerData.endpoint_name}</Text>
          </View>
          <View style={styles.row}>
          <Ionicons name="calendar-outline" size={16} color="#FD501E" />
          <Text>{formatDate(customerData.departtime)}</Text>
          </View>
          <View style={styles.row}>
          <Ionicons name="person-outline" size={16} color="#FD501E" />
          <Text>{customerData.adult} Adult, {customerData.child} Child</Text>
          </View>
          <Ionicons name="globe-outline" size={16} color="#FD501E" />
          <Ionicons name="checkmark-circle-outline" size={16} color="#FD501E" />
          </View>
        </View>
        
        <View style={styles.divider} />
        <View style={[styles.row, { justifyContent: 'space-between' }]}>
        <Text style={styles.titel}>Summary</Text>
        <Text> Booking date: {bookdate}</Text>
        </View>
        {orderStatus === "Failed" && (
          <Text style={styles.errorText}>Please try again later or contact support.</Text>
        )}
        <Text style={styles.bookingCodeText}>Booking Code: {booking_code || "N/A"}</Text>

        <TouchableOpacity style={styles.BackButton} onPress={handleGoBack}>
          <Text style={styles.BackButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
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
    fontSize: 16,
    marginBottom: 30,
    textAlign: "center",
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
 
});

export default ResultScreen;
