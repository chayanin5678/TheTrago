import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { MaterialIcons, FontAwesome6, Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import ipAddress from "../ipconfig";

const AccountScreen = ({ navigation }) => {
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // ใช้ token state
  const [user, setUser] = useState([]);

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync('userToken');
    navigation.replace('LoginScreen');
  };

  // ตรวจสอบสถานะการล็อกอินและโหลดข้อมูลเมื่อเริ่มต้น
  useEffect(() => {
    const checkLoginStatus = async () => {
      const storedToken = await SecureStore.getItemAsync('userToken'); // ตรวจสอบ token
      setToken(storedToken); // อัปเดตสถานะ token

      if (!storedToken) {
        // หากไม่มี token, นำทางไปที่หน้า LoginScreen
        navigation.replace('LoginScreen');
      } else {
        // หากมี token, นำทางไปที่หน้า AccountScreen
        fetchData();
        setIsLoading(false); // หยุดการโหลดหลังจากตรวจสอบเสร็จ
      }
    };
    checkLoginStatus(); // เรียกใช้เมื่อหน้าโหลด

  }, [navigation]); // ใช้ navigation เป็น dependency เพื่อให้ useEffect ทำงานเมื่อคอมโพเนนต์โหลด

    const fetchData = async () => {
      try {
        const response = await fetch(`${ipAddress}/profile`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`, // ส่ง Token ใน Authorization header
            'Content-Type': 'application/json', // ระบุประเภทของข้อมูลที่ส่ง (ถ้าจำเป็น)
          },
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();

        if (data && Array.isArray(data.data)) {
          setUser(data.data);
        } else {
          console.error('Data is not an array', data);
          setUser([]);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);  // ตั้งค่า loading เป็น false หลังจากทำงานเสร็จ
      }
    };



  // แสดง ActivityIndicator ขณะตรวจสอบสถานะการล็อกอิน
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FD501E" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.profileContainer}>
        {/* รูปภาพโปรไฟล์ */}
        <Image source={{ uri: user.profileImage }} style={styles.profileImage} />
        <Text style={styles.userName}>{`${user.firstName} ${user.lastName}`}</Text>
        <Text style={styles.userEmail}>{user.email}</Text>
      </View>

      <View style={styles.menuContainer}>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Dashboard')}>
          <MaterialIcons name="space-dashboard" size={24} color="black" />
          <Text style={styles.menuText}>Dashboard</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('MyBookings')}>
          <FontAwesome6 name="ticket" size={24} color="black" />
          <Text style={styles.menuText}>My Booking</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Profile')}>
          <Ionicons name="person" size={24} color="black" />
          <Text style={styles.menuText}>Profile</Text>
        </TouchableOpacity>

        <Text style={styles.affiliateTitle}>Affiliate Program</Text>

        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Affiliate')}>
          <Text style={styles.menuText}>Affiliate</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Earnings')}>
          <Text style={styles.menuText}>Earnings</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('BookingAffiliate')}>
          <Text style={styles.menuText}>Booking Affiliate</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('DeleteProfile')}>
          <Text style={styles.menuText}>Delete Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  profileContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  userEmail: {
    fontSize: 16,
    color: '#777',
  },
  menuContainer: {
    flex: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f2',
  },
  menuText: {
    fontSize: 16,
    marginLeft: 10,
  },
  affiliateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 20,
    color: '#FD501E',
  },
  logoutButton: {
    marginTop: 20,
    alignItems: 'center',
    backgroundColor: '#FD501E',
    paddingVertical: 12,
    borderRadius: 8,
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // พื้นหลังโปร่งใส
  },
});

export default AccountScreen;
