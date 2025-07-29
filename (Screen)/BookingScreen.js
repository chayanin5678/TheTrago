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
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLanguage } from './LanguageContext';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import ipAddress from '../ipconfig';

const BookingScreen = () => {
  const { t, selectedLanguage } = useLanguage();
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [email, setEmail] = useState('');
  const [otp, setOTP] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isOTPLogin, setIsOTPLogin] = useState(false); // Track if user logged in via OTP on this screen
  const [bookings, setBookings] = useState([]); // Store booking data from API
  const [isLoadingBookings, setIsLoadingBookings] = useState(false); // Loading state for bookings
  const [imageErrors, setImageErrors] = useState({}); // Track image loading errors
  
  // Animation for loading spinner
  const spinValue = useState(new Animated.Value(0))[0];
  
  // Check if user is already logged in when component mounts
  useEffect(() => {
    checkAuthStatus();
  }, []);
  
  // Add focus effect to check auth status when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      console.log('BookingScreen: Screen focused, checking auth status...');
      debugCurrentEmailState(); // Debug current email state first
      checkAuthStatus();
    }, [])
  );

  // Listen for Account logout to automatically logout from BookingScreen
  useFocusEffect(
    React.useCallback(() => {
      const checkAccountLogout = async () => {
        try {
          const userToken = await SecureStore.getItemAsync('userToken');
          const bookingToken = await SecureStore.getItemAsync('bookingToken');
          const isOTPLoginFlag = await SecureStore.getItemAsync('isOTPLogin');
          
          // Only logout if:
          // 1. User was logged in via Account previously (userToken existed before)
          // 2. userToken is now gone (Account logout)
          // 3. bookingToken still exists
          // 4. Current login is NOT from OTP
          if (!userToken && bookingToken && isLoggedIn && isOTPLoginFlag !== 'true') {
            console.log('🔄 Account logout detected, logging out from BookingScreen...');
            console.log('🔄 This is NOT an OTP login, so safe to logout');
            await handleLogout();
          } else {
            console.log('🔄 Logout check - conditions not met:');
            console.log('  userToken:', !!userToken);
            console.log('  bookingToken:', !!bookingToken);
            console.log('  isLoggedIn:', isLoggedIn);
            console.log('  isOTPLogin:', isOTPLoginFlag === 'true');
            console.log('  Should logout?', !userToken && bookingToken && isLoggedIn && isOTPLoginFlag !== 'true');
          }
        } catch (error) {
          console.error('Error checking account logout:', error);
        }
      };
      
      checkAccountLogout();
    }, [isLoggedIn])
  );
  
  // Add function to debug all SecureStore keys
  const debugSecureStore = async () => {
    try {
      console.log('=== DEBUG: All SecureStore values ===');
      const keys = ['userToken', 'userEmail', 'bookingToken', 'bookingEmail', 'isOTPLogin'];
      
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
  
  // Add function to debug current email state
  const debugCurrentEmailState = () => {
    console.log('=== CURRENT EMAIL STATE DEBUG ===');
    console.log('📧 Email field state:', email || 'empty');
    console.log('📧 Email field length:', email ? email.length : 0);
    console.log('📧 isLoggedIn:', isLoggedIn);
    console.log('📧 isOTPLogin:', isOTPLogin);
    console.log('📧 showOTP:', showOTP);
    console.log('📧 Email being displayed to user:', email || '[no email]');
    console.log('=== END EMAIL STATE DEBUG ===');
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
          resolve({ authToken: null, userEmail: null, otpLoginFlag: null });
        }, 3000); // 3 second timeout
      });
      
      // ตรวจสอบทั้ง bookingToken และ userToken (จากหน้า Account)
      const authPromise = Promise.all([
        SecureStore.getItemAsync('bookingToken'), // ใช้ bookingToken แยกจาก userToken
        SecureStore.getItemAsync('bookingEmail'), // ใช้ bookingEmail แยกจาก userEmail
        SecureStore.getItemAsync('userToken'),    // ตรวจสอบ userToken จากหน้า Account ด้วย
        SecureStore.getItemAsync('userEmail'),    // ตรวจสอบ userEmail จากหน้า Account ด้วย
        SecureStore.getItemAsync('isOTPLogin')    // Check if user logged in via OTP
      ]).then(([bookingToken, bookingEmail, userToken, userEmail, otpLoginFlag]) => {
        console.log('BookingScreen: Retrieved from SecureStore:', { 
          hasBookingToken: !!bookingToken, 
          hasUserToken: !!userToken,
          hasBookingEmail: !!bookingEmail,
          hasUserEmail: !!userEmail,
          bookingTokenLength: bookingToken?.length || 0,
          userTokenLength: userToken?.length || 0,
          bookingEmail: bookingEmail,
          userEmail: userEmail,
          isOTPLogin: otpLoginFlag === 'true'
        });
        
        console.log('📧 Email from Account (userEmail):', userEmail);
        console.log('📧 Email from Booking (bookingEmail):', bookingEmail);
        
        // ตรวจสอบว่า Account ถูก logout หรือไม่ 
        // หาก userToken หายไปแต่ bookingToken ยังอยู่ แสดงว่า Account logout แล้ว
        // แต่ถ้าเป็น OTP login ไม่ต้อง logout
        if (!userToken && bookingToken && otpLoginFlag !== 'true') {
          console.log('🔄 Account logout detected! userToken is gone but bookingToken still exists');
          console.log('🔄 This means user logged out from Account screen');
          console.log('🔄 Current login is NOT from OTP, so will logout from BookingScreen too');
          
          // ถ้าตรวจพบว่า Account logout แล้ว และไม่ใช่ OTP login ให้ logout จาก BookingScreen ด้วย
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
            
            console.log('🔄 BookingScreen logout completed due to Account logout');
          }).catch((error) => {
            console.error('Error during auto-logout:', error);
            // ถึงแม้จะมี error ก็ให้ logout ได้
            setIsLoggedIn(false);
            setEmail('');
            setOTP(['', '', '', '', '', '']);
            setShowOTP(false);
            setIsOTPLogin(false);
          });
          
          setIsCheckingAuth(false);
          return;
        } else if (!userToken && bookingToken && otpLoginFlag === 'true') {
          console.log('🔄 No userToken but this is OTP login - keeping BookingScreen logged in');
          console.log('🔄 OTP login should not be affected by Account logout');
        }
        
        // ให้ความสำคัญกับ userToken จากหน้า Account ก่อน
        const authToken = userToken || bookingToken;
        const email = userEmail || bookingEmail;
        const loginSource = userToken ? 'Account' : (bookingToken ? 'OTP' : null);
        
        console.log('🔍 Email Comparison Debug:');
        console.log('  userEmail (from Account):', userEmail || 'null');
        console.log('  bookingEmail (from OTP):', bookingEmail || 'null');
        console.log('  Final email selected:', email || 'null');
        console.log('  Email source priority: userEmail > bookingEmail');
        console.log('  Will use email from:', loginSource === 'Account' ? 'Account screen' : 'OTP login');
        console.log('  📊 Email Match Check:');
        console.log('    - userEmail (Account):', userEmail || 'null');
        console.log('    - bookingEmail (OTP):', bookingEmail || 'null');
        console.log('    - Final email selected:', email || 'null');
        console.log('    - All emails are accepted (no specific requirement)');
        
        return { authToken, userEmail: email, otpLoginFlag, loginSource };
      });
      
      const { authToken, userEmail, otpLoginFlag, loginSource } = await Promise.race([authPromise, timeoutPromise]);
      
      console.log('📧 === FINAL EMAIL SELECTION DEBUG ===');
      console.log('📧 Selected authToken:', authToken ? (authToken.length > 20 ? `${authToken.substring(0, 20)}...` : authToken) : 'null');
      console.log('📧 Selected userEmail:', userEmail || 'null');
      console.log('📧 Login source:', loginSource || 'null');
      console.log('📧 Will this email be used?', !!userEmail);
      console.log('📧 === END FINAL EMAIL DEBUG ===');
      
      if (authToken) {
        console.log('✅ BookingScreen: Valid token found, user is already logged in, skipping OTP');
        console.log('BookingScreen: Token type:', authToken.startsWith('eyJ') ? 'JWT' : 'Simple');
        console.log('BookingScreen: Email available:', !!userEmail);
        console.log('BookingScreen: Login source:', loginSource);
        console.log('BookingScreen: OTP Login Flag:', otpLoginFlag);
        
        console.log('📧 Email validation for booking:');
        console.log('  Current stored email:', userEmail);
        console.log('  Login source:', loginSource);
        console.log('  Authentication strategy: Accept any valid email from Account login or OTP');
        
        // Simplified authentication logic:
        // 1. If user has valid token from Account or OTP, accept it
        // 2. No email validation required - accept any email from Account
        // 3. Only show login if no token exists
        
        console.log('✅ User authentication accepted:', {
          hasUserEmail: !!userEmail,
          loginSource,
          reason: loginSource === 'Account' ? 'Account login - email accepted' : 'OTP login - email verified'
        });
        
        // Set email if available, otherwise keep current state
        if (userEmail) {
          console.log('📧 BEFORE setEmail - current email state:', email);
          setEmail(userEmail);
          console.log('📧 AFTER setEmail called - should update to:', userEmail);
          console.log('📧 Email set from stored data:', userEmail);
          console.log('📧 Email source:', loginSource === 'Account' ? 'userEmail (Account)' : 'bookingEmail (OTP)');
          console.log('📧 Current email field state before update:', email);
          console.log('📧 Email field will be updated to:', userEmail);
          console.log('📧 Email consistency check:');
          console.log('  - Setting email to UI field:', userEmail);
          console.log('  - Email source:', loginSource === 'Account' ? 'Account (md_member_email)' : 'OTP verification');
          console.log('  - Email will be accepted as valid');
          
          // Debug email state after setting with longer delay
          setTimeout(() => {
            console.log('📧 DELAYED CHECK - Email state after 500ms:', email);
            debugCurrentEmailState();
          }, 500);
        } else {
          console.log('⚠️ No email found in storage - user will need to enter email manually');
          console.log('📧 Current email field state (unchanged):', email);
          console.log('📧 User can enter any valid email address');
          // Don't pre-fill email - let user enter their own email
        }
        
        setIsLoggedIn(true);
        setShowOTP(false); // ไม่ให้แสดง OTP screen
        
        // ตั้งค่า isOTPLogin ตาม login source
        const isFromOTP = loginSource === 'OTP' && otpLoginFlag === 'true';
        const isFromAccount = loginSource === 'Account';
        
        setIsOTPLogin(isFromOTP);
        
        console.log('🔍 Auth check found existing token - State updated:');
        console.log('  isLoggedIn:', true);
        console.log('  loginSource:', loginSource);
        console.log('  isOTPLogin:', isFromOTP);
        console.log('  isFromAccount:', isFromAccount);
        console.log('  Logout button will be', isFromOTP ? 'VISIBLE (OTP login)' : 'HIDDEN (Account login)');
      } else {
        console.log('❌ BookingScreen: No token found, user needs to login with OTP');
        console.log('BookingScreen: authToken:', authToken);
        console.log('BookingScreen: userEmail:', userEmail);
        console.log('BookingScreen: otpLoginFlag:', otpLoginFlag);
        console.log('📊 Debug - What caused login screen to show:');
        console.log('  - authToken is falsy:', !authToken);
        console.log('  - authToken value:', JSON.stringify(authToken));
        setIsLoggedIn(false);
        setIsOTPLogin(false);
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

  // Function to fetch bookings from API
  const fetchBookings = async (status) => {
    if (!email || email.trim() === '') {
      console.log('📧 No email available for booking fetch');
      setBookings([]);
      return;
    }

    setIsLoadingBookings(true);
    try {
      console.log(`📋 Fetching bookings for status ${status} with email: ${email.trim()}`);
      
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

      console.log('📋 Booking API Response status:', response.status);
      console.log('📋 Booking API Response status text:', response.statusText);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('📋 Booking API Response data:', data);

      if (data && Array.isArray(data.data)) {
        setBookings(data.data);
        console.log(`📋 Successfully loaded ${data.data.length} bookings for status ${status}`);
        
        // Debug company image data with correct field name
        data.data.forEach((booking, index) => {
          console.log(`📸 Booking ${index + 1} - Company Image Debug:`, {
            md_company_picname: booking.md_company_picname,
            company_name: booking.md_company_nameeng || booking.md_company_namethai,
            full_image_url: booking.md_company_picname ? `https://thetrago.com/Api/uploads/company/${booking.md_company_picname}` : 'no image available',
            all_booking_fields: Object.keys(booking)
          });
        });
      } else {
        console.log('📋 No bookings found or invalid data format');
        setBookings([]);
      }
    } catch (error) {
      console.error('📋 Error fetching bookings:', error);
      setBookings([]);
    } finally {
      setIsLoadingBookings(false);
    }
  };

  // Effect to fetch bookings when tab changes or email is available
  useEffect(() => {
    if (isLoggedIn && email && email.trim() !== '') {
      let status;
      switch (activeTab) {
        case 'upcoming':
          status = 0; // Confirmed
          break;
        case 'cancelled':
          status = 2; // Cancelled
          break;
        case 'past':
          status = 1; // Completed
          break;
        default:
          status = 0;
      }
      fetchBookings(status);
    }
  }, [activeTab, isLoggedIn, email]);

  const sendOTP = async (retryCount = 0) => {
    // Ensure retryCount is always a number
    if (typeof retryCount !== 'number') {
      retryCount = 0;
    }
    
    console.log('📧 === SEND OTP DEBUG ===');
    console.log('📧 Email from state:', email || 'empty');
    console.log('📧 Email trimmed:', email.trim() || 'empty');
    console.log('📧 Email length:', email ? email.length : 0);
    console.log('📧 === END SEND OTP DEBUG ===');
    
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
        console.log('✅ OTP sent successfully');
        console.log('OTP response data:', data);
        
        setShowOTP(true);
        // Clear previous OTP values when showing OTP screen
        setOTP(['', '', '', '', '', '']);
        // Focus first OTP input when OTP screen appears
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
    
    console.log('=== OTP Verification Debug ===');
    console.log('OTP Code entered:', otpCode);
    console.log('OTP Code length:', otpCode.length);
    console.log('Email being used:', email.trim());
    console.log('Language:', selectedLanguage);
    
    if (otpCode.length !== 6) {
      Alert.alert(
        selectedLanguage === 'th' ? 'OTP ไม่ครบ' : 'Incomplete OTP',
        selectedLanguage === 'th' ? 'กรุณากรอก OTP ให้ครบ 6 หลัก' : 'Please enter all 6 digits of OTP'
      );
      return;
    }

    // Check if OTP contains only numbers
    if (!/^\d{6}$/.test(otpCode)) {
      Alert.alert(
        selectedLanguage === 'th' ? 'OTP ไม่ถูกต้อง' : 'Invalid OTP Format',
        selectedLanguage === 'th' ? 'กรุณากรอกเฉพาะตัวเลข 6 หลัก' : 'Please enter only 6 digits'
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
        // เก็บ token หรือ user data ที่ได้จาก API ใช้ SecureStore แต่ key แยกจากหน้า Account
        if (data.token) {
          // เก็บ token และ email สำหรับการใช้งานต่อไป แยกจากหน้า Account
          await SecureStore.setItemAsync('bookingToken', data.token);  // ใช้ bookingToken แยกจาก userToken
          await SecureStore.setItemAsync('bookingEmail', email.trim());
        } else {
          // หากไม่มี token จาก API ให้เก็บข้อมูลพื้นฐาน
          await SecureStore.setItemAsync('bookingToken', 'verified');  // ใช้ bookingToken แยกจาก userToken
          await SecureStore.setItemAsync('bookingEmail', email.trim());
        }
        
        // Save OTP login flag to SecureStore to persist across tab changes
        await SecureStore.setItemAsync('isOTPLogin', 'true');
        
        setIsLoggedIn(true);
        setShowOTP(false);
        setIsOTPLogin(true); // This is OTP login method
        
        console.log('✅ OTP Login Success - State updated:');
        console.log('  isLoggedIn:', true);
        console.log('  isOTPLogin:', true);
        console.log('  email saved:', email.trim());
        console.log('  📧 Email consistency final check:');
        console.log('    - Email being saved:', email.trim());
        console.log('    - Email source: OTP verification');
        console.log('    - All verified emails are accepted');
        console.log('  Logout button should now be visible!');
        console.log('  Token saved to SecureStore for persistence');
        
        // Debug what we saved - ใช้ key ที่ถูกต้องสำหรับ BookingScreen
        const savedToken = await SecureStore.getItemAsync('bookingToken');
        const savedEmail = await SecureStore.getItemAsync('bookingEmail');
        const savedOTPFlag = await SecureStore.getItemAsync('isOTPLogin');
        console.log('📱 Saved to SecureStore:');
        console.log('  bookingToken:', savedToken);
        console.log('  bookingEmail:', savedEmail);
        console.log('  isOTPLogin:', savedOTPFlag);
        
        Alert.alert(
          selectedLanguage === 'th' ? 'เข้าสู่ระบบสำเร็จ' : 'Login Successful',
          selectedLanguage === 'th' ? 'ยินดีต้อนรับเข้าสู่ระบบ' : 'Welcome to The Trago'
        );
      } else {
        console.error('Verify API Error Response:', data);
        console.log('=== OTP Verification Failed ===');
        console.log('Server response status:', response.status);
        console.log('Server response message:', data.message);
        console.log('OTP that was sent:', otpCode);
        console.log('Email that was used:', email.trim());
        
        // Clear OTP on error for fresh input
        setOTP(['', '', '', '', '', '']);
        setTimeout(() => {
          otpRefs[0].current?.focus();
        }, 100);
        
        // Show more detailed error message
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
      // ใช้ SecureStore แต่ใช้ key แยกจากหน้า Account
      await SecureStore.deleteItemAsync('bookingToken');  // ใช้ bookingToken แยกจาก userToken
      await SecureStore.deleteItemAsync('bookingEmail');  // ลบ bookingEmail ด้วย
      await SecureStore.deleteItemAsync('isOTPLogin'); // Clear OTP login flag
      setIsLoggedIn(false);
      setEmail(''); // Clear email state
      setOTP(['', '', '', '', '', '']);
      setShowOTP(false);
      setIsOTPLogin(false); // Reset OTP login flag
      
      console.log('📱 Logout completed - All booking data cleared:');
      console.log('  bookingToken: deleted');
      console.log('  bookingEmail: deleted');
      console.log('  isOTPLogin: deleted');
      console.log('  email state: cleared');
    } catch (error) {
      console.error('Error logging out:', error);
      // ถึงแม้จะมี error ก็ให้ logout ได้
      setIsLoggedIn(false);
      setEmail(''); // Clear email state even on error
      setOTP(['', '', '', '', '', '']);
      setShowOTP(false);
      setIsOTPLogin(false); // Reset OTP login flag
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
                onChangeText={(newEmail) => {
                  console.log('📧 Email input changed:', newEmail);
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
    // Map API data to display format
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
                  onLoad={() => {
                    console.log(`✅ Image loaded successfully: ${booking.md_company_picname}`);
                  }}
                  onError={(error) => {
                    console.log(`❌ Image failed to load: ${booking.md_company_picname}`);
                    console.log('Image error:', error.nativeEvent.error);
                    console.log('Full URL attempted:', `https://thetrago.com/Api/uploads/company/${booking.md_company_picname}`);
                  }}
                  onLoadStart={() => {
                    console.log(`🔄 Image loading started: ${booking.md_company_picname}`);
                  }}
                  onLoadEnd={() => {
                    console.log(`🏁 Image loading ended: ${booking.md_company_picname}`);
                  }}
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
              {selectedLanguage === 'th' ? 'เวลาออกเดินทาง' : 'Departure Time'}
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
              {booking.md_booking_adult > 0 ? `${booking.md_booking_adult} ${selectedLanguage === 'th' ? 'ผู้ใหญ่' : 'Adult'}` : ''}
              {booking.md_booking_child > 0 ? ` ${booking.md_booking_child} ${selectedLanguage === 'th' ? 'เด็ก' : 'Child'}` : ''}
              {booking.md_booking_infant > 0 ? ` ${booking.md_booking_infant} ${selectedLanguage === 'th' ? 'ทารก' : 'Infant'}` : ''}
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
      </View>
    );
  };

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
      
      {/* Debug current email state in console */}
      {console.log('🔍 RENDER DEBUG - Current email being used:', email || '[no email]')}
      {console.log('🔍 RENDER DEBUG - isLoggedIn:', isLoggedIn)}
      {console.log('🔍 RENDER DEBUG - isOTPLogin:', isOTPLogin)}
      
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
                {/* Debug log for logout button */}
                {console.log('🔍 Logout button debug:', { isOTPLogin, isLoggedIn })}
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
    paddingRight: 4,
  },
  routeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
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
  companyImageContainer: {
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  companyImage: {
    width: 40,
    height: 40,
    borderRadius: 12,
  },
  routeTextContainer: {
    flex: 1,
    paddingRight: 8,
  },
  routeText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 2,
    flexShrink: 1,
  },
  companyText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
    flexShrink: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    flexShrink: 0,
    minWidth: 100,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#22C55E',
    marginLeft: 4,
    flexShrink: 1,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
    marginTop: 16,
    textAlign: 'center',
  },
});

export default BookingScreen;
