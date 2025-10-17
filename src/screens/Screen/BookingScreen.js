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
  ActivityIndicator,
  Image,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLanguage } from './LanguageContext';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useTabBarAutoHide } from '../../utils/useTabBarAutoHide';
import ipAddress from '../../config/ipconfig';
import styles from '../../styles/CSS/BookingScreenStyles';

const BookingScreen = () => {
  const { t, selectedLanguage } = useLanguage();
  const navigation = useNavigation();
  const tabBarScrollProps = useTabBarAutoHide();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [email, setEmail] = useState('');
  const [otp, setOTP] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isOTPLogin, setIsOTPLogin] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);
  const [imageErrors, setImageErrors] = useState({});
  
  const spinValue = useState(new Animated.Value(0))[0];
  
  useEffect(() => {
    // Email state changed
  }, [email]);
  
  useEffect(() => {
    checkAuthStatus();
  }, []);
  
  useFocusEffect(
    React.useCallback(() => {
      console.log('📱 BookingScreen focused - clearing state and checking auth...');
      setEmail('');
      setBookings([]);
      setIsLoggedIn(false);
      checkAuthStatus();
    }, [])
  );

  useFocusEffect(
    React.useCallback(() => {
      const checkAccountLogout = async () => {
        try {
          const userToken = await SecureStore.getItemAsync('userToken');
          const bookingToken = await SecureStore.getItemAsync('bookingToken');
          const isOTPLoginFlag = await SecureStore.getItemAsync('isOTPLogin');
          
          if (!userToken && bookingToken && isLoggedIn && isOTPLoginFlag !== 'true') {
            await handleLogout();
          }
        } catch (error) {
          console.error('Error checking account logout:', error);
        }
      };
      
      checkAccountLogout();
    }, [isLoggedIn])
  );
  
  const checkAuthStatus = async () => {
    try {
      console.log('🔍 CheckAuthStatus: Starting auth check...');
      setIsCheckingAuth(true);
      
      const timeoutPromise = new Promise((resolve) => {
        setTimeout(() => {
          resolve({ authToken: null, userEmail: null, otpLoginFlag: null });
        }, 3000);
      });
      
      const authPromise = Promise.all([
        SecureStore.getItemAsync('bookingToken'),
        SecureStore.getItemAsync('bookingEmail'),
        SecureStore.getItemAsync('userToken'),
        SecureStore.getItemAsync('userEmail'),
        SecureStore.getItemAsync('isOTPLogin')
      ]).then(([bookingToken, bookingEmail, userToken, userEmail, otpLoginFlag]) => {
        console.log('📧 SecureStore values retrieved:');
        console.log('  userToken:', userToken ? 'exists' : 'null');
        console.log('  userEmail:', userEmail || 'null');
        console.log('  bookingToken:', bookingToken ? 'exists' : 'null');
        console.log('  bookingEmail:', bookingEmail || 'null');
        console.log('  otpLoginFlag:', otpLoginFlag || 'null');
        
        if (!userToken && bookingToken && otpLoginFlag !== 'true') {
          Promise.all([
            SecureStore.deleteItemAsync('bookingToken'),
            SecureStore.deleteItemAsync('bookingEmail'),
            SecureStore.deleteItemAsync('isOTPLogin')
          ]).then(() => {
            setIsLoggedIn(false);
            setEmail('');
            setOTP(['', '', '', '', '', '']);
            setShowOTP(false);
            setIsOTPLogin(false);
          }).catch((error) => {
            setIsLoggedIn(false);
            setEmail('');
            setOTP(['', '', '', '', '', '']);
            setShowOTP(false);
            setIsOTPLogin(false);
          });
          
          setIsCheckingAuth(false);
          return;
        }
        
        const authToken = userToken || bookingToken;
        const selectedEmail = userEmail || bookingEmail;
        const loginSource = userToken ? 'Account' : (bookingToken ? 'OTP' : null);
        
        console.log('🔍 Email selection logic:');
        console.log('  selectedEmail:', selectedEmail || 'null');
        console.log('  loginSource:', loginSource || 'null');
        console.log('  userEmail priority:', userEmail || 'null');
        console.log('  bookingEmail fallback:', bookingEmail || 'null');
        
        return { authToken, userEmail: selectedEmail, otpLoginFlag, loginSource };
      });
      
      const { authToken, userEmail, otpLoginFlag, loginSource } = await Promise.race([authPromise, timeoutPromise]);
      
      if (authToken) {
        console.log('✅ Auth token found, processing login...');
        if (userEmail) {
          console.log('📧 Setting email in UI:');
          console.log('  Current email state:', email || 'empty');
          console.log('  New email from auth:', userEmail);
          console.log('  Email needs update:', email !== userEmail);
          
          if (email !== userEmail) {
            setBookings([]);
            setIsLoadingBookings(true);
          }
          
          setEmail(userEmail);
          console.log('📧 Email state updated to:', userEmail);
          
          setTimeout(() => {
            console.log('🔄 Fetching bookings for email:', userEmail, 'activeTab:', activeTab);
            let status;
            switch (activeTab) {
              case 'upcoming':
                status = 0;
                break;
              case 'cancelled':
                status = 3;
                break;
              case 'past':
                status = 1;
                break;
              default:
                status = 0;
            }
            
            console.log('🔄 Calling fetchBookingsWithEmail with:', userEmail, 'status:', status);
            fetchBookingsWithEmail(userEmail, status);
          }, 100);
        }
        
        setIsLoggedIn(true);
        setShowOTP(false);
        
        const isFromOTP = loginSource === 'OTP' && otpLoginFlag === 'true';
        setIsOTPLogin(isFromOTP);
        
        console.log('✅ Auth state updated:');
        console.log('  isLoggedIn: true');
        console.log('  email:', userEmail || 'null');
        console.log('  loginSource:', loginSource || 'null');
        console.log('  isOTPLogin:', isFromOTP);
      } else {
        console.log('❌ No auth token found, showing login screen');
        setIsLoggedIn(false);
        setIsOTPLogin(false);
      }
    } catch (error) {
      console.error('BookingScreen: Error checking auth status:', error);
      setIsLoggedIn(false);
    } finally {
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

  const fetchBookingsWithEmail = async (specificEmail, status) => {
    if (!specificEmail || specificEmail.trim() === '') {
      setBookings([]);
      return;
    }

    setIsLoadingBookings(true);
    try {
      const response = await fetch(`${ipAddress}/checkbooking`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          md_booking_email: specificEmail.trim(),
          md_booking_status: status.toString()
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data && Array.isArray(data.data)) {
        setBookings(data.data);
      } else {
        setBookings([]);
      }
    } catch (error) {
      console.error('Error fetching bookings with specific email:', error);
      setBookings([]);
    } finally {
      setIsLoadingBookings(false);
    }
  };

  const fetchBookings = async (status) => {
    if (!email || email.trim() === '') {
      setBookings([]);
      return;
    }

    setIsLoadingBookings(true);
    try {
      const response = await fetch(`${ipAddress}/checkbooking`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          md_booking_email: email.trim(),
          md_booking_status: status.toString()
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data && Array.isArray(data.data)) {
        setBookings(data.data);
      } else {
        setBookings([]);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setBookings([]);
    } finally {
      setIsLoadingBookings(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn && email && email.trim() !== '') {
      setBookings([]);
      setIsLoadingBookings(true);
      
      let status;
      switch (activeTab) {
        case 'upcoming':
          status = 0;
          break;
        case 'cancelled':
          status = 2;
          break;
        case 'past':
          status = 1;
          break;
        default:
          status = 0;
      }
      
      fetchBookings(status);
    }
  }, [activeTab, isLoggedIn, email]);

  const sendOTP = async (retryCount = 0) => {
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

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text();
        
        const isCloudFlareError = textResponse.includes('cloudflare.com') && textResponse.includes('Bad gateway');
        
        if (response.status === 502 && retryCount < 2) {
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
        setOTP(['', '', '', '', '', '']);
        setTimeout(() => {
          otpRefs[0].current?.focus();
        }, 300);
        Alert.alert(
          selectedLanguage === 'th' ? 'ส่ง OTP แล้ว' : 'OTP Sent',
          selectedLanguage === 'th' ? 
            `รหัส OTP ถูกส่งไปยังอีเมล:\n${email.trim()}\n\nกรุณาตรวจสอบในกล่องจดหมายและ Spam/Junk ด้วย\nรหัส OTP จะหมดอายุใน 10 นาที` : 
            `OTP code has been sent to:\n${email.trim()}\n\nPlease check your inbox and Spam/Junk folder\nOTP code will expire in 10 minutes`
        );
      } else {
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
        return;
      }
    } catch (error) {
      let errorMessage = selectedLanguage === 'th' ? 
        'ไม่สามารถส่ง OTP ได้ กรุณาลองใหม่อีกครั้ง' : 
        'Unable to send OTP. Please try again.';
      
      if (error.message.includes('502')) {
        if (retryCount < 2) {
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

    if (!/^\d{6}$/.test(otpCode)) {
      Alert.alert(
        selectedLanguage === 'th' ? 'OTP ไม่ถูกต้อง' : 'Invalid OTP Format',
        selectedLanguage === 'th' ? 'กรุณากรอกเฉพาะตัวเลข 6 หลัก' : 'Please enter only 6 digits'
      );
      return;
    }

    setIsLoading(true);
    try {
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

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text();
        throw new Error(`Server error (${response.status}): ${textResponse.substring(0, 200)}...`);
      }

      const data = await response.json();

      if (response.ok && data.status === 'success') {
        if (data.token) {
          await SecureStore.setItemAsync('bookingToken', data.token);
          await SecureStore.setItemAsync('bookingEmail', email.trim());
        } else {
          await SecureStore.setItemAsync('bookingToken', 'verified');
          await SecureStore.setItemAsync('bookingEmail', email.trim());
        }
        
        await SecureStore.setItemAsync('isOTPLogin', 'true');
        
        setIsLoggedIn(true);
        setShowOTP(false);
        setIsOTPLogin(true);
        
        Alert.alert(
          selectedLanguage === 'th' ? 'เข้าสู่ระบบสำเร็จ' : 'Login Successful',
          selectedLanguage === 'th' ? 'ยินดีต้อนรับเข้าสู่ระบบ' : 'Welcome to The Trago'
        );
      } else {
        setOTP(['', '', '', '', '', '']);
        setTimeout(() => {
          otpRefs[0].current?.focus();
        }, 100);
        
        let errorTitle = selectedLanguage === 'th' ? 'OTP ไม่ถูกต้อง' : 'Invalid OTP';
        let errorMessage = '';
        
        if (data.message === 'Invalid OTP') {
          errorMessage = selectedLanguage === 'th' ? 
            'รหัส OTP ที่กรอกไม่ถูกต้อง\n\nสาเหตุที่เป็นไปได้:\n• รหัส OTP หมดอายุแล้ว (โดยปกติ 5-10 นาที)\n• กรอกรหัสผิด\n• ส่ง OTP ใหม่แล้วแต่ใช้รหัสเก่า\n\nกรุณาตรวจสอบรหัสในอีเมลล่าสุด หรือส่ง OTP ใหม่' : 
            'The OTP code you entered is incorrect\n\nPossible causes:\n• OTP code has expired (usually 5-10 minutes)\n• Wrong code entered\n• New OTP sent but using old code\n\nPlease check the latest code in your email or request a new OTP';
        } else if (data.message === 'OTP expired') {
          errorTitle = selectedLanguage === 'th' ? 'OTP หมดอายุ' : 'OTP Expired';
          errorMessage = selectedLanguage === 'th' ? 
            'รหัส OTP หมดอายุแล้ว\nกรุณาส่ง OTP ใหม่' : 
            'OTP code has expired\nPlease request a new OTP';
        } else {
          errorMessage = selectedLanguage === 'th' ? 
            `เกิดข้อผิดพลาด: ${data.message}\n\nกรุณาลองใหม่อีกครั้ง` : 
            `Error: ${data.message}\n\nPlease try again.`;
        }
        
        Alert.alert(errorTitle, errorMessage);
      }
    } catch (error) {
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
    
    if (value && index < 5) {
      otpRefs[index + 1].current?.focus();
    }
    
    if (value && index === 5) {
      const isComplete = newOTP.every(digit => digit !== '');
      if (isComplete) {
        setTimeout(() => {
          verifyOTP(newOTP);
        }, 300);
      }
    }
  };

  const handleOTPKeyPress = (index, key) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  };

  const handleSendOTP = () => {
    sendOTP(0);
  };

  const resendOTP = () => {
    setOTP(['', '', '', '', '', '']);
    setTimeout(() => {
      otpRefs[0].current?.focus();
    }, 100);
    sendOTP(0);
  };

  const handleLogout = async () => {
    try {
      await SecureStore.deleteItemAsync('bookingToken');
      await SecureStore.deleteItemAsync('bookingEmail');
      await SecureStore.deleteItemAsync('isOTPLogin');
      setIsLoggedIn(false);
      setEmail('');
      setOTP(['', '', '', '', '', '']);
      setShowOTP(false);
      setIsOTPLogin(false);
    } catch (error) {
      console.error('Error logging out:', error);
      setIsLoggedIn(false);
      setEmail('');
      setOTP(['', '', '', '', '', '']);
      setShowOTP(false);
      setIsOTPLogin(false);
    }
  };

  const handlePrintTicket = (booking) => {
    const ticketUrl = `https://thetrago.com/ferry/print/${booking.md_booking_code}`;
    
    Alert.alert(
      selectedLanguage === 'th' ? 'พิมพ์ตั๋ว' : 'Print Ticket',
      selectedLanguage === 'th' 
        ? `ต้องการเปิดตั๋วสำหรับการจอง ${booking.md_booking_code} หรือไม่?` 
        : `Do you want to open ticket for booking ${booking.md_booking_code}?`,
      [
        {
          text: selectedLanguage === 'th' ? 'ยกเลิก' : 'Cancel',
          style: 'cancel'
        },
        {
          text: selectedLanguage === 'th' ? 'เปิดตั๋ว' : 'Open Ticket',
          onPress: async () => {
            try {
              const canOpen = await Linking.canOpenURL(ticketUrl);
              
              if (canOpen) {
                await Linking.openURL(ticketUrl);
                console.log('✅ Successfully opened ticket URL:', ticketUrl);
              } else {
                Alert.alert(
                  selectedLanguage === 'th' ? 'ไม่สามารถเปิดได้' : 'Cannot Open',
                  selectedLanguage === 'th' 
                    ? 'ไม่สามารถเปิด URL ได้ กรุณาลองใหม่อีกครั้ง' 
                    : 'Unable to open URL. Please try again.'
                );
              }
            } catch (error) {
              console.error('❌ Error opening ticket URL:', error);
              Alert.alert(
                selectedLanguage === 'th' ? 'เกิดข้อผิดพลาด' : 'Error',
                selectedLanguage === 'th' 
                  ? 'ไม่สามารถเปิดตั๋วได้ กรุณาลองใหม่อีกครั้ง' 
                  : 'Unable to open ticket. Please try again.'
              );
            }
          }
        }
      ]
    );
  };

  const handleEditTicket = (booking) => {
    // Navigate to EditBookingScreen
    navigation.navigate('EditBookingScreen', { booking });
  };

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

  const renderLoginScreen = () => {
    return (
      <KeyboardAvoidingView 
        style={styles.loginContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          {...tabBarScrollProps}
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
                onChangeText={(newEmail) => {
                  setEmail(newEmail);
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoFocus={true}
                returnKeyType="done"
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
                setOTP(['', '', '', '', '', '']);
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
  };

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
        <TouchableOpacity 
          style={styles.startBookingButton}
          onPress={() => navigation.navigate('Home', { screen: 'HomeScreen' })}
        >
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

  const renderBookingItem = (booking) => {
    const statusConfig = {
      0: { 
        icon: 'clock-outline', 
        color: '#FD501E', 
        text: selectedLanguage === 'th' ? 'รอยืนยัน' : 'Confirmed'
      },
      1: { 
        icon: 'check-circle', 
        color: '#22C55E', 
        text: selectedLanguage === 'th' ? 'เสร็จสิ้น' : 'Completed'
      },
      2: { 
        icon: 'close-circle', 
        color: '#EF4444', 
        text: selectedLanguage === 'th' ? 'ยกเลิก' : 'Cancelled'
      }
    };

    const status = statusConfig[booking.md_booking_status] || statusConfig[0];
    
    return (
      <View key={booking.md_booking_id} style={styles.bookingCard}>
        <View style={styles.bookingHeader}>
          <View style={styles.routeInfo}>
            <View style={[styles.ferryIconContainer, booking.md_company_picname && styles.companyImageContainer]}>
              {booking.md_company_picname ? (
                <Image 
                  source={{ uri: `https://thetrago.com/Api/uploads/company/${booking.md_company_picname}` }} 
                  style={styles.companyImage}
                  resizeMode="cover"
                />
              ) : (
                <MaterialCommunityIcons name="ferry" size={20} color="#FD501E" />
              )}
            </View>
            <View style={styles.routeTextContainer}>
              <Text style={styles.routeText}>
                {selectedLanguage === 'th' 
                  ? `${booking.start_locationthai || booking.start_locationeng} → ${booking.end_locationthai || booking.end_locationeng}`
                  : `${booking.start_locationeng || booking.start_locationthai} → ${booking.end_locationeng || booking.end_locationthai}`
                }
              </Text>
              <Text style={styles.companyText}>
                {selectedLanguage === 'th' 
                  ? booking.md_company_namethai || booking.md_company_nameeng
                  : booking.md_company_nameeng || booking.md_company_namethai
                }
              </Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: `${status.color}15` }]}>
            <MaterialCommunityIcons name={status.icon} size={16} color={status.color} />
            <Text style={[styles.statusText, { color: status.color }]}>
              {status.text}
            </Text>
          </View>
        </View>

        <View style={styles.bookingDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>
              {selectedLanguage === 'th' ? 'หมายเลขอ้างอิง' : 'Booking Code'}
            </Text>
            <Text style={styles.detailValue}>{booking.md_booking_code}</Text>
          </View>
          <View style={styles.separator} />
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>
              {selectedLanguage === 'th' ? 'วันที่เดินทาง' : 'Departure Date'}
            </Text>
            <Text style={styles.detailValue}>
              {new Date(booking.md_booking_departdate).toLocaleDateString(
                selectedLanguage === 'th' ? 'th-TH' : 'en-US',
                { 
                  weekday: 'short', 
                  year: 'numeric', 
                  month: 'short', 
                  day: 'numeric' 
                }
              )}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>
              {selectedLanguage === 'th' ? 'เวลา ขาไป' : 'Departure Time'}
            </Text>
            <Text style={styles.detailValue}>{booking.md_timetable_departuretime}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>
              {selectedLanguage === 'th' ? 'เวลาถึง' : 'Arrival Time'}
            </Text>
            <Text style={styles.detailValue}>{booking.md_timetable_arrivaltime}</Text>
          </View>
          <View style={styles.separator} />
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>
              {selectedLanguage === 'th' ? 'ผู้โดยสาร' : 'Passengers'}
            </Text>
            <Text style={styles.detailValue}>
              {booking.md_booking_adult > 0 ? `${booking.md_booking_adult} ${t('adult') || (selectedLanguage === 'th' ? 'ผู้ใหญ่' : 'Adult')}` : ''}
              {booking.md_booking_child > 0 ? ` ${booking.md_booking_child} ${t('child') || (selectedLanguage === 'th' ? 'เด็ก' : 'Child')}` : ''}
              {booking.md_booking_infant > 0 ? ` ${booking.md_booking_infant} ${t('infant') || (selectedLanguage === 'th' ? 'ทารก' : 'Infant')}` : ''}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>
              {selectedLanguage === 'th' ? 'ประเภทที่นั่ง' : 'Seat Type'}
            </Text>
            <Text style={styles.detailValue}>
              {selectedLanguage === 'th' ? booking.md_seat_namethai : booking.md_seat_nameeng}
            </Text>
          </View>
        </View>

        {/* Action Buttons - Show for all upcoming bookings */}
        {activeTab === 'upcoming' && (
          <View style={styles.actionButtonsContainer}>
            {/* Edit Ticket Button */}
            <TouchableOpacity 
              style={styles.editTicketButton}
              onPress={() => handleEditTicket(booking)}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={['#3B82F6', '#2563EB']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.actionButtonGradient}
              >
                <MaterialCommunityIcons name="pencil" size={20} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>
                  {selectedLanguage === 'th' ? 'แก้ไขตั๋ว' : 'Edit Ticket'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Print Ticket Button */}
            <TouchableOpacity 
              style={styles.printTicketButton}
              onPress={() => handlePrintTicket(booking)}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={['#FD501E', '#FF6B35']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.actionButtonGradient}
              >
                <MaterialCommunityIcons name="printer" size={20} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>
                  {selectedLanguage === 'th' ? 'พิมพ์ตั๋ว' : 'Print Ticket'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {isCheckingAuth ? (
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
                {isOTPLogin && (
                  <TouchableOpacity 
                    style={styles.logoutButton}
                    onPress={handleLogout}
                  >
                    <MaterialCommunityIcons name="logout" size={24} color="#6B7280" />
                  </TouchableOpacity>
                )}
              </View>
            </LinearGradient>
          </View>

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

          <ScrollView 
            {...tabBarScrollProps}
            style={styles.contentContainer} 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {isLoadingBookings ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FD501E" />
                <Text style={styles.loadingText}>
                  {selectedLanguage === 'th' ? 'กำลังโหลดข้อมูล...' : 'Loading...'}
                </Text>
              </View>
            ) : bookings && bookings.length > 0 ? (
              <View style={styles.bookingsContainer}>
                <Text style={styles.bookingsCountText}>
                  {selectedLanguage === 'th' 
                    ? `${
                        activeTab === 'upcoming' 
                          ? 'การจองที่รอยืนยัน' 
                          : activeTab === 'past' 
                            ? 'การจองที่เสร็จสิ้น' 
                            : 'การจองที่ยกเลิก'
                      } (${bookings.length})`
                    : `${
                        activeTab === 'upcoming' 
                          ? 'Pending Confirmations' 
                          : activeTab === 'past' 
                            ? 'Completed Bookings' 
                            : 'Cancelled Bookings'
                      } (${bookings.length})`
                  }
                </Text>
                {bookings.map(renderBookingItem)}
              </View>
            ) : (
              renderEmptyState()
            )}
          </ScrollView>
        </>
      )}
    </View>
  );
};

export default BookingScreen;
