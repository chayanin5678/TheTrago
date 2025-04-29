import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ProgressBarAndroid, Alert } from 'react-native';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { ScrollView } from 'react-native-gesture-handler';

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
          <View style={styles.icon}>
          <MaterialIcons name="flight-takeoff" size={24} color="white" />
          </View>
          </View>
        </View>

        <View style={[styles.bookingCard, styles.cancelled]}>
        <View style={ styles.row}>
        <View style={ styles.col}>
          <Text style={styles.bookingStatus}>Cancelled</Text>
          <Text style={styles.bookingCount}>{bookings.cancelled}</Text>
          </View>
          <FontAwesome5 name="times-circle" size={24} color="white" />
          </View>
        </View>

        <View style={[styles.bookingCard, styles.completed]}>
        <View style={ styles.row}>
        <View style={ styles.col}>
          <Text style={styles.bookingStatus}>Completed</Text>
          <Text style={styles.bookingCount}>{bookings.completed}</Text>
          </View>
          <FontAwesome5 name="check-circle" size={24} color="white" />
          </View>
        </View>
      </View>

      <View style={styles.pointsContainer}>
        <Text style={styles.pointsTitle}>Accumulated Points</Text>
        <ProgressBarAndroid
          style={styles.progressBar}
          progress={accumulatedPoints / 100} // Assume max points are 100
          indeterminate={false}
        />
        <Text style={styles.pointsText}>{accumulatedPoints} Points</Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Profile')}>
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
      flex: 1,
    },
    bookingCard: {
      flex: 1,
      alignItems: 'left',
      padding: 15,
      marginHorizontal: 10,
      borderRadius: 8,
      justifyContent: 'center',
      marginBottom: 10,
    },
    upcoming: {
      backgroundColor: 'rgba(255, 204, 0, 0.5)',  // ใช้ rgba แทน opacity
      borderColor: '#FFCC00',
      borderWidth: 2,
    },
    cancelled: {
      backgroundColor: 'rgba(255, 87, 51, 0.5)', // ใช้ rgba แทน opacity
    },
    completed: {
      backgroundColor: 'rgba(40, 167, 69, 0.5)', // ใช้ rgba แทน opacity
    },
    bookingStatus: {
      fontSize: 16,
      fontWeight: 'bold',
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
    },
    col: {
      flexDirection: 'column',
    },
    icon:{
        height: 30,
        width: 30,
        alignSelf: 'center',
        backgroundColor: 'Yellow',
    }
  });
  
export default Dashboard;
