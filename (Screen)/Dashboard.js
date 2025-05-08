import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { MaterialCommunityIcons } from '@expo/vector-icons';


const Dashboard = ({ navigation }) => {
  const [token, setToken] = useState(null);
  const [bookings, setBookings] = useState({ upcoming: 0, cancelled: 0, completed: 0 });
  const [accumulatedPoints, setAccumulatedPoints] = useState(0);

 
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.dashboardTitle}>Dashboard</Text>
      <Text style={styles.myBookings}>My Bookings</Text>

      <View style={styles.bookingSection}>
        <View style={[styles.bookingCard, styles.upcoming]}>
        <View style={ styles.row}>
        <View style={ styles.col}>
        <Text style={styles.bookingCount}>{bookings.upcoming}</Text>
          <Text style={styles.bookingStatus}>Upcoming</Text>
        
          </View>
          <View style={[styles.icon, { backgroundColor: '#FFCC00' }]}>
          <MaterialIcons name="flight-takeoff" size={24} color="white"  />
           </View>
          </View>
        </View>

        <View style={[styles.bookingCard, styles.cancelled]}>
        <View style={ styles.row}>
        <View style={ styles.col}>
          <Text style={styles.bookingCount}>{bookings.cancelled}</Text>
          <Text style={styles.bookingStatus}>Cancelled</Text> 
          </View>
          <View style={[styles.icon, { backgroundColor: '#F73202' }]}>
          <FontAwesome5 name="times-circle" size={24} color="white" />
          </View>
          </View>
        </View>

        <View style={[styles.bookingCard, styles.completed]}>
        <View style={ styles.row}>
        <View style={ styles.col}>
        <Text style={styles.bookingCount}>{bookings.completed}</Text>
          <Text style={styles.bookingStatus}>Completed</Text>
     
          </View>
          <View style={[styles.icon, { backgroundColor: '#28A745' }]}>
          <FontAwesome5 name="check-circle" size={24} color="white" />
          </View>
          </View>
        </View>
      </View>

      <View style={styles.card}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="medal-outline" size={16} color="#f4511e" />
        <Text style={styles.headerText}> Accumulated Points</Text>
      </View>

      <View style={styles.progressBar}>
        <Text style={styles.progressText}>0</Text>
      </View>

      <View style={styles.pointRow}>
        <View style={styles.pointCircle}>
          <MaterialCommunityIcons name="medal-outline" size={28} color="#fff" />
        </View>
        <View style={styles.pointTextContainer}>
          <Text style={styles.pointNumber}>0</Text>
          <Text style={styles.pointLabel}>Point</Text>
        </View>
      </View>
    </View>
      <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
        <Text style={styles.buttonText}>Go to Profile</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: '#fff',
    },
    dashboardTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 10,
    },
    myBookings: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 15,
    },
    bookingSection: {
      flexDirection: 'column',
      justifyContent: 'space-between',
    //  flex: 1,
    },
    bookingCard: {
   //   flex: 1,
     alignItems: 'left',
      padding: 15,
      marginHorizontal: 10,
      borderRadius: 8,
    //  justifyContent: 'center',
      marginBottom: 10,
    },
    upcoming: {
      backgroundColor: 'rgba(255, 204, 0, 0.5)',  // ใช้ rgba แทน opacity
      borderColor: '#FFCC00',
      borderWidth: 2,
      //justifyContent: 'center',  // Center content vertically
   
    },
    cancelled: {
      backgroundColor: 'rgba(255, 87, 51, 0.5)', // ใช้ rgba แทน opacity
      borderColor: '#F73202',
      borderWidth: 2,
    },
    completed: {
      backgroundColor: 'rgba(40, 167, 69, 0.5)', // ใช้ rgba แทน opacity
      borderColor: '#28A745',
      borderWidth: 2,
    },
    bookingStatus: {
      fontSize: 16,
     // fontWeight: 'bold',
      color: 'black', // สีข้อความไม่โปร่งใส
    },
    bookingCount: {
      fontSize: 20,
      fontWeight: 'bold',
      color: 'black',
      marginTop: 5,
    },
    pointsContainer: {
      marginTop: 20,
      alignItems: 'center',
    },
    pointsTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 10,
    },
    progressBar: {
      width: '100%',
      height: 10,
      marginBottom: 10,
    },
    pointsText: {
      fontSize: 18,
      fontWeight: 'bold',
    },
    button: {
      backgroundColor: '#FD501E',
      padding: 15,
      borderRadius: 8,
      alignItems: 'center',
      marginTop: 20,
    },
    buttonText: {
      color: '#fff',
      fontWeight: 'bold',
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
     // justifyContent: 'center',  // Center row content horizontally
     // alignItems: 'center', 
    },
    col: {
      flexDirection: 'column',
     // justifyContent: 'center',  // Center row content horizontally
   //   alignItems: 'center', 
    },
    icon: {
      width: 60,
      height: 60,
      borderRadius: 30, // ครึ่งของความกว้าง/สูง
    
      justifyContent: 'center',
      alignItems: 'center',
     
    //  elevation: 5, // เงาสำหรับ Android
    },
    card: {
      backgroundColor: '#fff',
      borderRadius: 10,
      padding: 16,
      alignItems: 'center',
      width: '95%',
      borderWidth: 1,
      borderColor: '#e0e0e0',
      alignSelf: 'center',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    headerText: {
      fontSize: 14,
      color: '#f4511e',
      fontWeight: '600',
    },
    progressBar: {
      width: '100%',
      height: 20,
      borderRadius: 10,
      backgroundColor: '#eee',
      borderWidth: 1,
      borderColor: '#f4511e',
      justifyContent: 'center',
      paddingLeft: 10,
      marginBottom: 12,
    },
    progressText: {
      fontSize: 12,
      color: '#999',
    },
    pointRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    pointCircle: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: '#f4511e',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    pointTextContainer: {
      alignItems: 'flex-start',
    },
    pointNumber: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#000',
    },
    pointLabel: {
      fontSize: 14,
      color: '#666',
    },
  });
  
export default Dashboard;
