import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ActivityIndicator, ScrollView, Animated, TouchableWithoutFeedback, Button ,Alert} from 'react-native';
import { MaterialIcons, FontAwesome6, Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import ipAddress from "../ipconfig";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import * as ImagePicker from 'expo-image-picker';
import Feather from '@expo/vector-icons/Feather';

const AccountScreen = ({ navigation }) => {
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // ใช้ token state
  const [user, setUser] = useState([]);
  const [profileImage, setProfileImage] = useState(null);
  const scaleAnim = useState(new Animated.Value(1))[0];
  const [isUploading, setIsUploading] = useState(false);
  


  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.9, // ย่อเล็กลง 10%
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1, // กลับมาเหมือนเดิม
      friction: 3, // ความหนืด เวลาคืนตัวนุ่ม ๆ
      tension: 35, // ความเร็ว
      useNativeDriver: true,
    }).start(() => {
      pickImage(); // เรียก pickImage ตอนปล่อยนิ้ว
    });
  };

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

        setIsLoading(false); // หยุดการโหลดหลังจากตรวจสอบเสร็จ
        // console.log(user); // แสดง token ใน console

      }
    };
    checkLoginStatus(); // เรียกใช้เมื่อหน้าโหลด


  }, []); // ใช้ navigation เป็น dependency เพื่อให้ useEffect ทำงานเมื่อคอมโพเนนต์โหลด

  useEffect(() => {

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
        setIsLoading(false);  // ตั้งค่า loading เป็น false หลังจากทำงานเสร็จ
      }
    };
    if (token) {
      fetchData();
    }

  }, [token]);



  // แสดง ActivityIndicator ขณะตรวจสอบสถานะการล็อกอิน
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FD501E" />
      </View>
    );
  }

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      alert("Permission to access camera roll is required!");
      return;
    }

    let pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!pickerResult.canceled) {
      setProfileImage(pickerResult.assets[0].uri);
      // เรียก upload function ได้ตรงนี้ถ้าอยากอัปโหลดไป Server ทันที
       uploadImage(pickerResult.assets[0].uri);
    }
  };

  const uploadImage = async (imageUri) => {
    setIsUploading(true);

    const formData = new FormData();
    formData.append('profile_image', {
      uri: imageUri,
      name: 'profile.jpg', // ชื่อส่งไป ไม่มีผลเพราะ Server แปลงเป็น webp
      type: 'image/jpeg',
    });

    try {
      const response = await fetch(`${ipAddress}/upload-member`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      const result = await response.json();
      if (result.status === 'success') {
        Alert.alert("Success", "Profile image uploaded!");
      } else {
        Alert.alert("Error", result.message || "Upload failed.");
      }
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert("Error", "Upload failed.");
    } finally {
      setIsUploading(false);
    }
  };
  

  return (
    <ScrollView contentContainerStyle={styles.container}>

      <View style={styles.profileContainer}>
        {/* รูปภาพโปรไฟล์ */}
        {user.map((item, index) => (
          <View key={index}>
          
           
            {isUploading && <ActivityIndicator size="large" color="#FD501E" />}
      {profileImage && !isUploading && (
         <TouchableWithoutFeedback
         onPressIn={handlePressIn}
         onPressOut={handlePressOut}
       >
         <Animated.View style={[styles.profileWrapper, { transform: [{ scale: scaleAnim }] }]}>
           <Image
           source={{ uri: profileImage }}
             style={styles.profileImage}
           />
           <Feather name="edit" size={24} color="#FD501E" style={styles.edit} />
         </Animated.View>
       </TouchableWithoutFeedback>
      
      )}
      {!profileImage &&!isUploading && (
        <TouchableWithoutFeedback onPressIn={handlePressIn} onPressOut={handlePressOut}>
        <Animated.View style={[styles.profileWrapper, { transform: [{ scale: scaleAnim }] }]}>
          <Image
            source={
              profileImage // ถ้าเลือกรูปใหม่
                ? { uri: profileImage }
                : item.md_member_photo // ถ้ามีรูปในฐาน
                  ? { uri: `https://www.thetrago.com/${item.md_member_photo}` }
                  : require('../assets/icontrago.png') // ถ้าไม่มีอะไรเลย
            }
            style={styles.profileImage}
          />
          <Feather name="edit" size={24} color="#FD501E" style={styles.edit} />
        </Animated.View>
      </TouchableWithoutFeedback>
      )}

            <Text style={styles.userName}>{item.md_member_fname} {item.md_member_lname}</Text>
            <Text style={styles.userEmail}>{item.md_member_email}</Text>
          </View>

        ))}
      </View>

      <View style={styles.menuContainer}>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Dashboard')}>
          <MaterialIcons name="space-dashboard" size={24} color="#FD501E" />
          <Text style={styles.menuText}>Dashboard</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('MyBookings')}>
          <FontAwesome6 name="ticket" size={24} color="#FD501E" />
          <Text style={styles.menuText}>My Booking</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Profile')}>
          <Ionicons name="person" size={24} color="#FD501E" />
          <Text style={styles.menuText}>Profile</Text>
        </TouchableOpacity>

        <Text style={styles.affiliateTitle}>Affiliate Program</Text>

        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Affiliate')}>
          <Text style={styles.menuText}>Affiliate</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('DeleteProfile')}>
          <Text style={styles.menuText}>Delete Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
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
    marginTop: 20,
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
    borderWidth: 2,
    alignSelf: 'center',
    borderColor: '#FD501E',
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  userEmail: {
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
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
  edit: {
    bottom: 35,
    fontSize: wp('5%'),
    left: 120,
    backgroundColor: 'white',
    borderRadius: 50,
    padding: 5,
    width: 30,
    marginBottom: -20,

  }
});

export default AccountScreen;
