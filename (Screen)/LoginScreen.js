import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert,ActivityIndicator, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { FontAwesome } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';
import ipAddress from "../ipconfig";
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useCustomer } from './CustomerContext';


export default function LoginScreen({ navigation }) {
  const { customerData, updateCustomerData } = useCustomer();
  const [email, setEmail] = useState(customerData.email || '');
  const [password, setPassword] = useState(customerData.password || '');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(customerData.remember || false);
  const [isLoading, setIsLoading] = useState(false);




  const handleLogin = async () => {
    if (remember) {
      updateCustomerData({ email: email, password: password, remember: true });
    } else {
      updateCustomerData({ email: '', password: '', remember: false });
    }
    
    console.log(email, password);
    
    try {
      const loginResponse = await axios.post(`${ipAddress}/login`, {
        email: email,  // ใช้ค่า email จาก state
        password: password  // ใช้ค่า password จาก state
      });
  
      console.log(loginResponse.data); // แสดงข้อมูลที่ได้รับจาก API
  
      if (loginResponse.data.token) {
        await SecureStore.setItemAsync('userToken', loginResponse.data.token);
  
        // Use a different variable name to avoid overwriting `loginResponse`
        const tokenResponse = await axios.post(`${ipAddress}/Token`, {
          email: email,  // ใช้ค่า email จาก state
          token: loginResponse.data.token  // ใช้ token จากการ login
        });
  
        console.log(tokenResponse.data); // Log the token update response
  
        // ไปที่หน้า AccountScreen
        setIsLoading(false); // หยุดโหลดเมื่อเกิดข้อผิดพลาด
        navigation.replace('AccountScreen');
      } else {
        setIsLoading(false); // หยุดโหลดเมื่อเกิดข้อผิดพลาด
        Alert.alert('Error', 'Invalid credentials');
      }
    } catch (error) {
      setIsLoading(false); // หยุดโหลดเมื่อเกิดข้อผิดพลาด
      console.log('Error:', error);  // Log the error for debugging
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };
  


  return (
    <View style={{ flex: 1 }}>
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FD501E" />
        </View>
      )}
       <ScrollView contentContainerStyle={styles.container}>
     
        <Text style={styles.title}>Sign In</Text>
        <View style={{ flexDirection: 'row' }}>
          <Text style={styles.subtitle}>
            Don't have an account?
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('RegisterScreen')}>
            <Text style={styles.link}> Create account</Text>
          </TouchableOpacity>

        </View>

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />

        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Password"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Icon name={showPassword ? 'eye' : 'eye-off'} size={20} color="#777" />
          </TouchableOpacity>
        </View>

        <View style={styles.row}>
          <TouchableOpacity onPress={() => setRemember(!remember)} style={styles.checkboxContainer}>
            <MaterialIcons name={remember ? "check-box" : "check-box-outline-blank"} size={24} color="#FD501E" />
            <Text style={styles.label}> Remember me</Text>
          </TouchableOpacity>

          <Text style={styles.forgotText}>Forgot your password</Text>
        </View>

        <TouchableOpacity
          style={styles.signInButton}
          onPress={() => {
            setIsLoading(true); // เริ่มโหลด
            handleLogin(); // เรียกฟังก์ชัน handleLogin
          }}
        >
          <Text style={styles.signInText}>Sign In</Text>
        </TouchableOpacity>


        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
          <Text style={styles.orText}>Or sign in with</Text>
          <View style={styles.divider} />
        </View>

        <TouchableOpacity style={styles.socialButton}>
          <FontAwesome name="google" size={20} color="#EA4335" />
          <Text style={styles.socialText}> Sign in with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.socialButton}>
          <FontAwesome name="facebook" size={20} color="#3b5998" />
          <Text style={styles.socialText}> Sign in with Facebook</Text>
        </TouchableOpacity>

        <Text style={styles.policyText}>
          By continuing, you agree to The Tragos' <Text style={styles.link}>Terms of Use</Text> and <Text style={styles.link}>Privacy Policy</Text>.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    color: '#555',
    marginBottom: 20,
  },
  link: {
    color: '#5A31D1',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  passwordContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
  },
  row: {
    marginVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rememberText: {
    fontSize: 14,
    color: '#333',
  },
  forgotText: {
    color: '#5A31D1',
    fontSize: 14,
  },
  signInButton: {
    backgroundColor: '#FD501E',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
  },
  signInText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 14,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#ccc',
  },
  orText: {
    marginHorizontal: 10,
    color: '#777',
  },
  socialButton: {
    backgroundColor: '#fdf0ec',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  socialText: {
    marginLeft: 8,
    fontSize: 16,
  },
  policyText: {
    marginTop: 20,
    color: '#777',
    fontSize: 12,
    textAlign: 'center',
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
});
