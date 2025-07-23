import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  SafeAreaView,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLanguage } from './LanguageContext';
import ipAddress from '../ipconfig';

const BookingScreen = () => {
  const { t, selectedLanguage } = useLanguage();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [email, setEmail] = useState('');
  const [otp, setOTP] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  
  // Animation for loading spinner
  const spinValue = useState(new Animated.Value(0))[0];
  
  // Check if user is already logged in when component mounts
  useEffect(() => {
    checkAuthStatus();
  }, []);
  
  // Add function to debug all SecureStore keys
  const debugSecureStore = async () => {
    try {
      console.log('=== DEBUG: All SecureStore values ===');
      const keys = ['userToken', 'userEmail', 'authToken', 'email'];
      
      for (const key of keys) {
        try {
          const value = await SecureStore.getItemAsync(key);
          console.log(`SecureStore['${key}']:`, value ? `"${value}" (length: ${value.length})` : 'null');
        } catch (error) {
          console.log(`SecureStore['${key}']:`, 'ERROR -', error.message);
        }
      }
      console.log('=== END DEBUG ===');
    } catch (error) {
      console.error('Debug SecureStore error:', error);
    }
  };
  
  const checkAuthStatus = async () => {
    try {
      console.log('=== BookingScreen: Starting auth check ===');
      
      // Debug all SecureStore values first
      await debugSecureStore();
      
      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise((resolve) => {
        setTimeout(() => {
          console.log('BookingScreen: Auth check timeout');
          resolve({ authToken: null, userEmail: null });
        }, 3000); // 3 second timeout
      });
      
      // ใช้ SecureStore เหมือนหน้า Account แทน AsyncStorage - ใช้ของจริงเท่านั้น
      const authPromise = Promise.all([
        SecureStore.getItemAsync('userToken'), // เปลี่ยนจาก authToken เป็น userToken
        SecureStore.getItemAsync('userEmail')  // เปลี่ยนจาก AsyncStorage เป็น SecureStore
      ]).then(([authToken, userEmail]) => {
        console.log('BookingScreen: Retrieved from SecureStore:', { 
          hasToken: !!authToken, 
          hasEmail: !!userEmail,
          tokenLength: authToken?.length || 0,
          email: userEmail 
        });
        return { authToken, userEmail };
      });
      
      const { authToken, userEmail } = await Promise.race([authPromise, timeoutPromise]);
      
      if (authToken) {
        console.log('✅ BookingScreen: Valid token found, user is already logged in, skipping OTP');
        console.log('BookingScreen: Token type:', authToken.startsWith('eyJ') ? 'JWT' : 'Simple');
        console.log('BookingScreen: Email available:', !!userEmail);
        
        // Set email if available, otherwise keep current state
        if (userEmail) {
          setEmail(userEmail);
        }
        
        setIsLoggedIn(true);
        setShowOTP(false); // ไม่ให้แสดง OTP screen
      } else {
        console.log('❌ BookingScreen: No token found, user needs to login with OTP');
        console.log('BookingScreen: authToken:', authToken);
        console.log('BookingScreen: userEmail:', userEmail);
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error('BookingScreen: Error checking auth status:', error);
      setIsLoggedIn(false);
    } finally {
      console.log('BookingScreen: Auth check completed, setting isCheckingAuth to false');
      setIsCheckingAuth(false);
    }
  };
  
  React.useEffect(() => {
    if (isLoading || isCheckingAuth) {
      const spinAnimation = Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      );
      spinAnimation.start();
      return () => spinAnimation.stop();
    }
  }, [isLoading, isCheckingAuth, spinValue]);

  const tabs = [
    { id: 'upcoming', label: selectedLanguage === 'th' ? 'กำลังมา' : 'Upcoming', icon: 'clock-outline', color: '#FD501E' },
    { id: 'cancelled', label: selectedLanguage === 'th' ? 'ยกเลิก' : 'Cancelled', icon: 'close-circle-outline', color: '#EF4444' },
    { id: 'past', label: selectedLanguage === 'th' ? 'จองแล้ว' : 'Past Bookings', icon: 'check-circle-outline', color: '#22C55E' }
  ];

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const sendOTP = async (retryCount = 0) => {
    // Ensure retryCount is always a number
    if (typeof retryCount !== 'number') {
      retryCount = 0;
    }
    
    if (!email || email.trim() === '') {
      Alert.alert(
        selectedLanguage === 'th' ? 'กรุณากรอกอีเมล' : 'Please enter email',
        selectedLanguage === 'th' ? 'กรุณากรอกอีเมลของคุณ' : 'Please enter your email address'
      );
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert(
        selectedLanguage === 'th' ? 'อีเมลไม่ถูกต้อง' : 'Invalid Email',
        selectedLanguage === 'th' ? 'กรุณากรอกอีเมลที่ถูกต้อง' : 'Please enter a valid email address'
      );
      return;
    }

    setIsLoading(true);
    try {
      // ส่ง OTP จริงผ่าน API
      console.log('Sending OTP to:', `${ipAddress}/send-otp`);
      console.log('Request body:', { email: email.trim(), language: selectedLanguage });
      console.log('Retry attempt:', retryCount);
      
      const response = await fetch(`${ipAddress}/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          language: selectedLanguage
        }),
      });

      console.log('Response status:', response.status);
      console.log('Response status text:', response.statusText);

      // ตรวจสอบ Content-Type ก่อนที่จะ parse JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text();
        console.error('API returned non-JSON response (Status:', response.status, '):', textResponse);
        
        // ตรวจสอบว่าเป็น CloudFlare error page หรือไม่
        const isCloudFlareError = textResponse.includes('cloudflare.com') && textResponse.includes('Bad gateway');
        
        // ถ้าเป็น 502 และยังไม่ retry ให้ลองใหม่อีกครั้ง
        if (response.status === 502 && retryCount < 2) {
          console.log('502 error detected, retrying...');
          setIsLoading(false);
          
          const retryMessage = isCloudFlareError 
            ? (selectedLanguage === 'th' 
                ? `เซิร์ฟเวอร์ TheTrago ไม่สามารถเข้าถึงได้ชั่วคราว\nกำลังลองใหม่ครั้งที่ ${retryCount + 1}/2` 
                : `TheTrago server temporarily unavailable\nRetrying attempt ${retryCount + 1}/2`)
            : (selectedLanguage === 'th' 
                ? `การเชื่อมต่อขัดข้อง กำลังลองใหม่ครั้งที่ ${retryCount + 1}/2` 
                : `Connection issue, retrying attempt ${retryCount + 1}/2`);
          
          Alert.alert(
            selectedLanguage === 'th' ? 'กำลังลองใหม่...' : 'Retrying...',
            retryMessage,
            [{ text: 'OK' }]
          );
          setTimeout(() => sendOTP(retryCount + 1), 3000);
          return;
        }
        
        throw new Error(`Server error (${response.status}): ${textResponse.substring(0, 200)}...`);
      }

      const data = await response.json();

      if (response.ok && data.status === 'success') {
        setShowOTP(true);
        // Clear previous OTP values when showing OTP screen
        setOTP(['', '', '', '', '', '']);
        // Focus first OTP input when OTP screen appears
        setTimeout(() => {
          otpRefs[0].current?.focus();
        }, 300);
        Alert.alert(
          selectedLanguage === 'th' ? 'ส่ง OTP แล้ว' : 'OTP Sent',
          selectedLanguage === 'th' ? 'รหัส OTP ถูกส่งไปยังอีเมลของคุณแล้ว' : 'OTP code has been sent to your email'
        );
      } else {
        console.error('API Error Response:', data);
        
        // Handle specific server errors
        let errorTitle = selectedLanguage === 'th' ? 'ไม่สามารถส่ง OTP ได้' : 'Failed to Send OTP';
        let errorMessage = '';
        
        if (response.status === 500) {
          errorTitle = selectedLanguage === 'th' ? 'เซิร์ฟเวอร์มีปัญหา' : 'Server Error';
          errorMessage = selectedLanguage === 'th' ? 
            `เซิร์ฟเวอร์ TheTrago มีปัญหาภายใน\n\nข้อผิดพลาด: ${data.message}\n\nระบบอีเมล OTP อาจมีปัญหาชั่วคราว\nกรุณาลองใหม่ในอีกสักครู่` : 
            `TheTrago server internal error\n\nError: ${data.message}\n\nOTP email system may have temporary issues\nPlease try again in a moment`;
        } else {
          errorMessage = selectedLanguage === 'th' ? 
            `เกิดข้อผิดพลาด: ${data.message}\n\nกรุณาตรวจสอบอีเมลและลองใหม่อีกครั้ง` : 
            `Error: ${data.message}\n\nPlease check your email and try again.`;
        }
        
        Alert.alert(errorTitle, errorMessage);
        return; // Don't throw error, just return
      }
    } catch (error) {
      console.error('Send OTP Error Details:', {
        message: error.message,
        stack: error.stack,
        url: `${ipAddress}/send-otp`,
        email: email.trim()
      });
      
      let errorMessage = selectedLanguage === 'th' ? 
        'ไม่สามารถส่ง OTP ได้ กรุณาลองใหม่อีกครั้ง' : 
        'Unable to send OTP. Please try again.';
      
      // Handle specific error types
      if (error.message.includes('Failed to send OTP')) {
        errorMessage = selectedLanguage === 'th' ? 
          'เซิร์ฟเวอร์ TheTrago ไม่สามารถส่งอีเมล OTP ได้\n\nสาเหตุที่เป็นไปได้:\n• ระบบอีเมลของเซิร์ฟเวอร์มีปัญหา\n• การตั้งค่า SMTP มีข้อผิดพลาด\n• อีเมลที่กรอกอาจไม่ถูกต้อง\n\nกรุณาลองใหม่ในอีกสักครู่ หรือติดต่อฝ่ายสนับสนุน' : 
          'TheTrago server cannot send OTP email\n\nPossible causes:\n• Server email system issues\n• SMTP configuration error\n• Invalid email address\n\nPlease try again later or contact support';
      } else if (error.message.includes('500')) {
        errorMessage = selectedLanguage === 'th' ? 
          'เซิร์ฟเวอร์ TheTrago มีปัญหาภายใน (Error 500)\n\nระบบอีเมล OTP อาจมีปัญหาชั่วคราว\nกรุณาลองใหม่ในอีกสักครู่\n\nหากปัญหายังคงอยู่ กรุณาติดต่อฝ่ายสนับสนุน' : 
          'TheTrago server internal error (Error 500)\n\nOTP email system may have temporary issues\nPlease try again in a moment\n\nIf problem persists, please contact support';
      } else if (error.message.includes('502')) {
        if (retryCount < 2) {
          console.log('502 error in catch, retrying...');
          setIsLoading(false);
          Alert.alert(
            selectedLanguage === 'th' ? 'กำลังลองใหม่...' : 'Retrying...',
            selectedLanguage === 'th' ? `เซิร์ฟเวอร์ TheTrago ไม่สามารถเข้าถึงได้ชั่วคราว\nกำลังลองใหม่ครั้งที่ ${retryCount + 1}/2` : `TheTrago server temporarily unavailable\nRetrying attempt ${retryCount + 1}/2`,
            [{ text: 'OK' }]
          );
          setTimeout(() => sendOTP(retryCount + 1), 3000);
          return;
        }
        errorMessage = selectedLanguage === 'th' ? 
          'เซิร์ฟเวอร์ TheTrago ไม่สามารถเข้าถึงได้ในขณะนี้\nกรุณาลองใหม่ในอีกสักครู่\n\n(CloudFlare Error 502 - Bad Gateway)' : 
          'TheTrago server is currently unavailable\nPlease try again in a moment\n\n(CloudFlare Error 502 - Bad Gateway)';
      } else if (error.message.includes('500')) {
        errorMessage = selectedLanguage === 'th' ? 
          'เซิร์ฟเวอร์มีปัญหา กรุณาลองใหม่ในภายหลัง' : 
          'Server error. Please try again later.';
      } else if (error.message.includes('Network request failed') || error.message.includes('fetch')) {
        errorMessage = selectedLanguage === 'th' ? 
          'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต' : 
          'Cannot connect to server. Please check your internet connection.';
      }
      
      Alert.alert(
        selectedLanguage === 'th' ? 'เกิดข้อผิดพลาด' : 'Error',
        errorMessage
      );
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOTP = async (otpArray = null) => {
    const otpCode = otpArray ? otpArray.join('') : otp.join('');
    if (otpCode.length !== 6) {
      Alert.alert(
        selectedLanguage === 'th' ? 'OTP ไม่ครบ' : 'Incomplete OTP',
        selectedLanguage === 'th' ? 'กรุณากรอก OTP ให้ครบ 6 หลัก' : 'Please enter all 6 digits of OTP'
      );
      return;
    }

    setIsLoading(true);
    try {
      // ยืนยัน OTP จริงผ่าน API
      console.log('Verifying OTP at:', `${ipAddress}/verify-otp`);
      console.log('Request body:', { email: email.trim(), otp: otpCode, language: selectedLanguage });
      
      const response = await fetch(`${ipAddress}/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          otp: otpCode,
          language: selectedLanguage
        }),
      });

      console.log('Response status:', response.status);
      console.log('Response status text:', response.statusText);

      // ตรวจสอบ Content-Type ก่อนที่จะ parse JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text();
        console.error('API returned non-JSON response (Status:', response.status, '):', textResponse);
        throw new Error(`Server error (${response.status}): ${textResponse.substring(0, 200)}...`);
      }

      const data = await response.json();

      if (response.ok && data.status === 'success') {
        // เก็บ token หรือ user data ที่ได้จาก API ใช้ SecureStore เหมือนหน้า Account
        if (data.token) {
          // เก็บ token และ email สำหรับการใช้งานต่อไป
          await SecureStore.setItemAsync('userToken', data.token);  // เปลี่ยนจาก authToken เป็น userToken
          await SecureStore.setItemAsync('userEmail', email.trim());
        } else {
          // หากไม่มี token จาก API ให้เก็บข้อมูลพื้นฐาน
          await SecureStore.setItemAsync('userToken', 'verified');  // เปลี่ยนจาก authToken เป็น userToken
          await SecureStore.setItemAsync('userEmail', email.trim());
        }
        
        setIsLoggedIn(true);
        setShowOTP(false);
        Alert.alert(
          selectedLanguage === 'th' ? 'เข้าสู่ระบบสำเร็จ' : 'Login Successful',
          selectedLanguage === 'th' ? 'ยินดีต้อนรับเข้าสู่ระบบ' : 'Welcome to The Trago'
        );
      } else {
        console.error('Verify API Error Response:', data);
        // Clear OTP on error for fresh input
        setOTP(['', '', '', '', '', '']);
        setTimeout(() => {
          otpRefs[0].current?.focus();
        }, 100);
        Alert.alert(
          selectedLanguage === 'th' ? 'OTP ไม่ถูกต้อง' : 'Invalid OTP',
          selectedLanguage === 'th' ? 
            data.message || 'รหัส OTP ไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง' : 
            data.message || 'Invalid OTP code. Please try again.'
        );
      }
    } catch (error) {
      console.error('Verify OTP Error Details:', {
        message: error.message,
        stack: error.stack,
        url: `${ipAddress}/verify-otp`,
        email: email.trim(),
        otp: otpCode
      });
      
      let errorMessage = selectedLanguage === 'th' ? 
        'ไม่สามารถยืนยัน OTP ได้ กรุณาลองใหม่อีกครั้ง' : 
        'Unable to verify OTP. Please try again.';
      
      if (error.message.includes('502')) {
        errorMessage = selectedLanguage === 'th' ? 
          'เซิร์ฟเวอร์ไม่สามารถเข้าถึงได้ชั่วคราว กรุณาลองใหม่ในอีกสักครู่' : 
          'Server temporarily unavailable. Please try again in a moment.';
      } else if (error.message.includes('500')) {
        errorMessage = selectedLanguage === 'th' ? 
          'เซิร์ฟเวอร์มีปัญหา กรุณาลองใหม่ในภายหลัง' : 
          'Server error. Please try again later.';
      } else if (error.message.includes('Network request failed') || error.message.includes('fetch')) {
        errorMessage = selectedLanguage === 'th' ? 
          'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต' : 
          'Cannot connect to server. Please check your internet connection.';
      }
      
      Alert.alert(
        selectedLanguage === 'th' ? 'เกิดข้อผิดพลาด' : 'Error',
        errorMessage
      );
    } finally {
      setIsLoading(false);
    }
  };

  const otpRefs = useState(Array(6).fill(null).map(() => React.createRef()))[0];

  const handleOTPChange = (index, value) => {
    if (value.length > 1) return;
    
    const newOTP = [...otp];
    newOTP[index] = value;
    setOTP(newOTP);
    
    // Auto focus next input when typing
    if (value && index < 5) {
      otpRefs[index + 1].current?.focus();
    }
    
    // Auto verify when all 6 digits are filled
    if (value && index === 5) {
      // Check if all digits are filled
      const isComplete = newOTP.every(digit => digit !== '');
      if (isComplete) {
        // Auto verify after a short delay and pass the completed OTP array
        setTimeout(() => {
          verifyOTP(newOTP);
        }, 300);
      }
    }
  };

  const handleOTPKeyPress = (index, key) => {
    // Auto focus previous input when backspace on empty field
    if (key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  };

  const handleSendOTP = () => {
    sendOTP(0);
  };

  const resendOTP = () => {
    setOTP(['', '', '', '', '', '']);
    // Focus first OTP input after resetting
    setTimeout(() => {
      otpRefs[0].current?.focus();
    }, 100);
    sendOTP(0);
  };

  const handleLogout = async () => {
    try {
      // ใช้ SecureStore เหมือนหน้า Account
      await SecureStore.deleteItemAsync('userToken');  // เปลี่ยนจาก authToken เป็น userToken
      await SecureStore.deleteItemAsync('userEmail');
      setIsLoggedIn(false);
      setEmail('');
      setOTP(['', '', '', '', '', '']);
      setShowOTP(false);
    } catch (error) {
      console.error('Error logging out:', error);
      // ถึงแม้จะมี error ก็ให้ logout ได้
      setIsLoggedIn(false);
      setEmail('');
      setOTP(['', '', '', '', '', '']);
      setShowOTP(false);
    }
  };

  // Loading spinner component
  const LoadingSpinner = () => {
    const spin = spinValue.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });

    return (
      <Animated.View style={{ transform: [{ rotate: spin }] }}>
        <MaterialCommunityIcons name="loading" size={20} color="#FFFFFF" />
      </Animated.View>
    );
  };

  const renderLoginScreen = () => (
    <KeyboardAvoidingView 
      style={styles.loginContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.loginScrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.loginIllustration}>
          <View style={styles.loginIconContainer}>
            <MaterialCommunityIcons name="email-outline" size={60} color="#FD501E" />
          </View>
        </View>

        {!showOTP ? (
          <View style={styles.emailSection}>
            <Text style={styles.loginTitle}>
              {selectedLanguage === 'th' ? 'เข้าสู่ระบบ' : 'Sign In'}
            </Text>
            <Text style={styles.loginSubtitle}>
              {selectedLanguage === 'th' 
                ? 'กรอกอีเมลของคุณเพื่อรับรหัส OTP' 
                : 'Enter your email to receive OTP code'
              }
            </Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>
                {selectedLanguage === 'th' ? 'อีเมล' : 'Email'}
              </Text>
              <TextInput
                style={[styles.emailInput, email ? styles.emailInputFilled : null]}
                placeholder={selectedLanguage === 'th' ? 'กรอกอีเมลของคุณ' : 'Enter your email'}
                placeholderTextColor="#9CA3AF"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoFocus={true}
                returnKeyType="done"
                onSubmitEditing={handleSendOTP}
              />
            </View>

            <TouchableOpacity 
              style={[styles.primaryButton, isLoading && styles.disabledButton]}
              onPress={handleSendOTP}
              disabled={isLoading}
            >
              <LinearGradient
                colors={isLoading ? ['#9CA3AF', '#6B7280'] : ['#FD501E', '#FF6B35']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.buttonGradient}
              >
                {isLoading ? (
                  <LoadingSpinner />
                ) : (
                  <Text style={styles.buttonText}>
                    {selectedLanguage === 'th' ? 'ส่ง OTP' : 'Send OTP'}
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.otpSection}>
            <Text style={styles.loginTitle}>
              {selectedLanguage === 'th' ? 'ยืนยัน OTP' : 'Verify OTP'}
            </Text>
            <Text style={styles.loginSubtitle}>
              {selectedLanguage === 'th' 
                ? `รหัส OTP ถูกส่งไปยัง\n${email}${isLoading ? '\n\nกำลังยืนยัน...' : (otp.join('').length === 6 && !isLoading ? '\n\nกรอกครบแล้ว กำลังยืนยันอัตโนมัติ...' : '')}` 
                : `OTP code sent to\n${email}${isLoading ? '\n\nVerifying...' : (otp.join('').length === 6 && !isLoading ? '\n\nComplete! Auto-verifying...' : '')}`
              }
            </Text>

            <View style={styles.otpContainer}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={otpRefs[index]}
                  style={[
                    styles.otpInput,
                    digit ? styles.otpInputFilled : null,
                    isLoading ? styles.otpInputDisabled : null
                  ]}
                  value={digit}
                  onChangeText={(value) => handleOTPChange(index, value)}
                  onKeyPress={({ nativeEvent: { key } }) => handleOTPKeyPress(index, key)}
                  keyboardType="numeric"
                  maxLength={1}
                  textAlign="center"
                  selectTextOnFocus={true}
                  blurOnSubmit={false}
                  editable={!isLoading}
                />
              ))}
            </View>

            <TouchableOpacity style={styles.resendButton} onPress={resendOTP}>
              <Text style={styles.resendText}>
                {selectedLanguage === 'th' ? 'ส่ง OTP ใหม่' : 'Resend OTP'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.backButton} 
              onPress={() => {
                setShowOTP(false);
                setOTP(['', '', '', '', '', '']); // Clear OTP when going back
              }}
            >
              <MaterialCommunityIcons name="arrow-left" size={20} color="#6B7280" />
              <Text style={styles.backButtonText}>
                {selectedLanguage === 'th' ? 'กลับ' : 'Back'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <View style={styles.illustrationContainer}>
        <View style={styles.phoneContainer}>
          <View style={styles.phoneFrame}>
            <View style={styles.phoneScreen}>
              <View style={styles.hotelIcon}>
                <MaterialCommunityIcons name="domain" size={24} color="#FD501E" />
              </View>
              <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map(star => (
                  <MaterialCommunityIcons key={star} name="star" size={8} color="#FFD700" />
                ))}
              </View>
              <View style={styles.bookButton}>
                <Text style={styles.bookButtonText}>Book</Text>
              </View>
            </View>
          </View>
        </View>
        <View style={styles.handsContainer}>
          <View style={styles.leftHand}>
            <View style={styles.handPalm} />
            <View style={styles.thumb} />
          </View>
          <View style={styles.rightHand}>
            <View style={styles.handPalm} />
            <View style={styles.finger} />
          </View>
        </View>
      </View>

      <View style={styles.emptyTextContainer}>
        <Text style={styles.emptyTitle}>
          {selectedLanguage === 'th' 
            ? 'ดูเหมือนว่าคุณยังไม่เคยจองกับ\nThe Trago' 
            : 'Looks like you have never booked with\nThe Trago'
          }
        </Text>
        <Text style={styles.emptySubtitle}>
          {selectedLanguage === 'th'
            ? 'เมื่อคุณจองทริปแล้ว\nจะแสดงที่นี่'
            : 'When you book your trip\nwill be shown here.'
          }
        </Text>
        <TouchableOpacity style={styles.startBookingButton}>
          <LinearGradient
            colors={['#FD501E', '#FF6B35']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.startBookingGradient}
          >
            <Text style={styles.startBookingText}>
              {selectedLanguage === 'th' ? 'เริ่มจองเลย' : 'Start Booking Now'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderBookingItem = (booking) => (
    <View key={booking.id} style={styles.bookingCard}>
      <View style={styles.bookingHeader}>
        <View style={styles.routeInfo}>
          <View style={styles.ferryIconContainer}>
            <MaterialCommunityIcons name="ferry" size={20} color="#FD501E" />
          </View>
          <View>
            <Text style={styles.routeText}>{booking.route}</Text>
            <Text style={styles.companyText}>{booking.company}</Text>
          </View>
        </View>
        <View style={styles.statusBadge}>
          <MaterialCommunityIcons name="check-circle" size={16} color="#22C55E" />
          <Text style={styles.statusText}>
            {selectedLanguage === 'th' ? 'จองเสร็จสิ้น' : 'Booking Completed'}
          </Text>
        </View>
      </View>

      <View style={styles.bookingDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>
            {selectedLanguage === 'th' ? 'หมายเลขอ้างอิง' : 'Ref. number'}
          </Text>
          <Text style={styles.detailValue}>{booking.refNumber}</Text>
        </View>
        <View style={styles.separator} />
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>
            {selectedLanguage === 'th' ? 'เวลาออกเดินทาง' : 'Departure Time'}
          </Text>
          <Text style={styles.detailValue}>{booking.departureTime}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>
            {selectedLanguage === 'th' ? 'เวลาถึง' : 'Arrive Time'}
          </Text>
          <Text style={styles.detailValue}>{booking.arriveTime}</Text>
        </View>
        <View style={styles.separator} />
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>
            {selectedLanguage === 'th' ? 'ผู้โดยสาร' : 'Passenger'}
          </Text>
          <Text style={styles.detailValue}>{booking.passenger}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>
            {selectedLanguage === 'th' ? 'ที่นั่ง' : 'Seat'}
          </Text>
          <Text style={styles.detailValue}>{booking.seat}</Text>
        </View>
      </View>
    </View>
  );

  const mockBookings = [
    {
      id: 1,
      route: 'Valletta → Gozo',
      company: 'GoZo High Speed',
      refNumber: 'TG68091_2014',
      departureTime: 'Sat, 08 Mar 25 09:45',
      arriveTime: 'Sat, 08 Mar 25 10:30',
      passenger: '1 Adult',
      seat: 'Economy'
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {isCheckingAuth ? (
        // Loading screen while checking authentication
        <View style={styles.loadingContainer}>
          <Animated.View style={{ transform: [{ rotate: spinValue.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '360deg'],
          }) }] }}>
            <MaterialCommunityIcons name="loading" size={40} color="#FD501E" />
          </Animated.View>
          <Text style={styles.loadingText}>
            {selectedLanguage === 'th' ? 'กำลังตรวจสอบการเข้าสู่ระบบ...' : 'Checking authentication...'}
          </Text>
        </View>
      ) : !isLoggedIn ? (
        renderLoginScreen()
      ) : (
        <>
          {/* Ultra Premium Header */}
          <View style={styles.headerContainer}>
            <LinearGradient
              colors={['#FFFFFF', '#F8FAFC']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.headerGradient}
            >
              <View style={styles.headerRow}>
                <Text style={styles.headerTitle}>
                  {selectedLanguage === 'th' ? 'การจองของฉัน' : 'My booking'}
                </Text>
                <TouchableOpacity 
                  style={styles.logoutButton}
                  onPress={handleLogout}
                >
                  <MaterialCommunityIcons name="logout" size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>

          {/* Ultra Premium Tab Bar */}
          <View style={styles.tabContainer}>
            <View style={styles.tabBackground}>
              {tabs.map((tab, index) => (
                <TouchableOpacity
                  key={tab.id}
                  style={[
                    styles.tab,
                    activeTab === tab.id && styles.activeTab
                  ]}
                  onPress={() => setActiveTab(tab.id)}
                  activeOpacity={0.8}
                >
                  {activeTab === tab.id && (
                    <LinearGradient
                      colors={[`${tab.color}15`, `${tab.color}08`]}
                      style={styles.tabActiveBackground}
                    />
                  )}
                  <MaterialCommunityIcons
                    name={tab.icon}
                    size={16}
                    color={activeTab === tab.id ? tab.color : '#9CA3AF'}
                    style={styles.tabIcon}
                  />
                  <Text style={[
                    styles.tabText,
                    activeTab === tab.id && { color: tab.color, fontWeight: '700' }
                  ]}>
                    {tab.label}
                  </Text>
                  {activeTab === tab.id && (
                    <View style={[styles.activeIndicator, { backgroundColor: tab.color }]} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Content */}
          <ScrollView 
            style={styles.contentContainer} 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {activeTab === 'past' && mockBookings.length > 0 ? (
              <View style={styles.bookingsContainer}>
                <Text style={styles.bookingsCountText}>
                  {selectedLanguage === 'th' ? 'การจองที่ผ่านมา (8)' : 'Booking Passed (8)'}
                </Text>
                {mockBookings.map(renderBookingItem)}
              </View>
            ) : (
              renderEmptyState()
            )}
          </ScrollView>
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerContainer: {
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerGradient: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1F2937',
    letterSpacing: -0.5,
    textAlign: 'left',
  },
  tabContainer: {
    paddingHorizontal: 24,
    marginBottom: 8,
  },
  tabBackground: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 6,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    position: 'relative',
    minHeight: 44,
  },
  activeTab: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#FD501E',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  tabActiveBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 12,
  },
  tabIcon: {
    marginRight: 6,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    textAlign: 'center',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -2,
    left: '25%',
    right: '25%',
    height: 3,
    borderRadius: 2,
  },
  contentContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 120,
  },
  bookingsContainer: {
    padding: 24,
  },
  bookingsCountText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 20,
    letterSpacing: -0.3,
  },
  bookingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.04)',
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  routeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  ferryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(253, 80, 30, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  routeText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 2,
  },
  companyText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#22C55E',
    marginLeft: 4,
  },
  bookingDetails: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },
  separator: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 8,
  },
  emptyStateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingTop: 60,
  },
  illustrationContainer: {
    marginBottom: 48,
    alignItems: 'center',
  },
  phoneContainer: {
    position: 'relative',
    zIndex: 2,
  },
  phoneFrame: {
    width: 120,
    height: 200,
    backgroundColor: '#6366F1',
    borderRadius: 24,
    padding: 8,
    shadowColor: '#6366F1',
    shadowOffset: {
      width: 0,
      height: 20,
    },
    shadowOpacity: 0.3,
    shadowRadius: 40,
    elevation: 20,
  },
  phoneScreen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  hotelIcon: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(253, 80, 30, 0.1)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  bookButton: {
    backgroundColor: '#FFB800',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  handsContainer: {
    position: 'absolute',
    bottom: -30,
    left: -20,
    right: -20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 1,
  },
  leftHand: {
    position: 'relative',
  },
  rightHand: {
    position: 'relative',
  },
  handPalm: {
    width: 60,
    height: 80,
    backgroundColor: '#FBBF24',
    borderRadius: 30,
    transform: [{ rotate: '15deg' }],
  },
  thumb: {
    position: 'absolute',
    top: 15,
    right: -8,
    width: 20,
    height: 30,
    backgroundColor: '#FBBF24',
    borderRadius: 15,
    transform: [{ rotate: '-30deg' }],
  },
  finger: {
    position: 'absolute',
    top: 10,
    left: -8,
    width: 16,
    height: 25,
    backgroundColor: '#FBBF24',
    borderRadius: 12,
    transform: [{ rotate: '45deg' }],
  },
  emptyTextContainer: {
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  startBookingButton: {
    borderRadius: 16,
    shadowColor: '#FD501E',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  startBookingGradient: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  startBookingText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  // Login Styles
  loginContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loginScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  loginIllustration: {
    alignItems: 'center',
    marginBottom: 40,
  },
  loginIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(253, 80, 30, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FD501E',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  emailSection: {
    marginBottom: 20,
  },
  otpSection: {
    marginBottom: 20,
  },
  loginTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  loginSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  emailInput: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: '#F9FAFB',
  },
  emailInputFilled: {
    borderColor: '#FD501E',
    backgroundColor: '#FFFFFF',
  },
  emailPreview: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
    fontStyle: 'italic',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  otpInput: {
    width: 48,
    height: 56,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    backgroundColor: '#F9FAFB',
  },
  otpInputFilled: {
    borderColor: '#FD501E',
    backgroundColor: '#FFFFFF',
    shadowColor: '#FD501E',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  otpInputDisabled: {
    backgroundColor: '#F3F4F6',
    borderColor: '#D1D5DB',
    color: '#9CA3AF',
  },
  primaryButton: {
    borderRadius: 16,
    shadowColor: '#FD501E',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
    marginBottom: 16,
  },
  disabledButton: {
    shadowOpacity: 0.1,
  },
  buttonGradient: {
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  resendButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 16,
  },
  resendText: {
    color: '#FD501E',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  backButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoutButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
});

export default BookingScreen;
