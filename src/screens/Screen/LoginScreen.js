import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert, ActivityIndicator, ScrollView, Animated, Dimensions, StatusBar, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as SecureStore from 'expo-secure-store';
import Icon from 'react-native-vector-icons/Ionicons';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ipAddress from "../../config/ipconfig";
import axios from 'axios';
import { useCustomer } from './CustomerContext';
import { useLanguage } from './LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
// Apple Authentication - using expo-apple-authentication
import * as AppleAuthentication from 'expo-apple-authentication';
// Social login imports - using expo-auth-session for better compatibility
import * as AuthSession from 'expo-auth-session';
import { AuthRequest, ResponseType } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

// Google Sign-In - conditional for Expo Go compatibility
let GoogleSignin, statusCodes;
try {
  const googleSignin = require('@react-native-google-signin/google-signin');
  GoogleSignin = googleSignin.GoogleSignin;
  statusCodes = googleSignin.statusCodes;
} catch (error) {
  console.log('Google Sign-In not available in Expo Go');
}

// WebBrowser configuration for better auth experience  
WebBrowser.maybeCompleteAuthSession();

import { GOOGLE_CONFIG } from '../../config/socialConfig';


const { width, height } = Dimensions.get('window');

// Small helper to parse a JWT (identityToken) safely without external deps
const parseJwt = (token) => {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    let jsonPayload = null;

    if (typeof atob === 'function') {
      const decoded = atob(base64);
      jsonPayload = decodeURIComponent(Array.prototype.map.call(decoded, function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
    } else if (typeof Buffer !== 'undefined') {
      jsonPayload = Buffer.from(base64, 'base64').toString('utf8');
    } else {
      // fallback: try decodeURIComponent on atob-like behavior
      return null;
    }

    return JSON.parse(jsonPayload);
  } catch (e) {
    console.log('parseJwt error', e);
    return null;
  }
};

// Constants
const BUNDLE_ID = 'com.thetrago.android'; // Bundle ID จาก app.json สำหรับ Apple Sign-In audience

export default function LoginScreen({ navigation }) {
  const { customerData, updateCustomerData } = useCustomer();
  const { login } = useAuth();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState(customerData.email || '');
  const [password, setPassword] = useState(customerData.password || '');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(customerData.remember || false);
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState({ google: false, facebook: false, apple: false });

  // Premium animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    // Configure Google Sign-In only if available
    if (GoogleSignin) {
      try {
        GoogleSignin.configure({
          webClientId: GOOGLE_CONFIG.webClientId, // จาก Google Cloud Console
          iosClientId: GOOGLE_CONFIG.iosClientId, // สำหรับ iOS
          offlineAccess: GOOGLE_CONFIG.offlineAccess,
          forceCodeForRefreshToken: GOOGLE_CONFIG.forceCodeForRefreshToken,
        });
      } catch (error) {
        console.log('Google Sign-In configuration failed:', error);
      }
    }

    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 80,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Use Expo proxy when running in Expo Go (appOwnership === 'expo')
  const useProxyForDev = Constants.appOwnership === 'expo';




  const handleLogin = async () => {
    if (remember) {
      updateCustomerData({ email: email, password: password, remember: true });
    } else {
      updateCustomerData({ email: '', password: '', remember: false });
    }

    console.log(email, password);
    setIsLoading(true);

    try {
      const loginResponse = await axios.post(`${ipAddress}/login`, {
        email: email,  // ใช้ค่า email จาก state
        password: password  // ใช้ค่า password จาก state
      });

      console.log(loginResponse.data); // แสดงข้อมูลที่ได้รับจาก API

      if (loginResponse.data.token) {
        // Use AuthContext login method
        await login(loginResponse.data.token);
        console.log('AuthContext: Login successful, token saved via AuthContext');

        // Save user email to SecureStore for BookingScreen
        await SecureStore.setItemAsync('userEmail', email);
        console.log('User email saved to SecureStore:', email);

        // Use a different variable name to avoid overwriting `loginResponse`
        const tokenResponse = await axios.post(`${ipAddress}/Token`, {
          email: email,  // ใช้ค่า email จาก state
          token: loginResponse.data.token  // ใช้ token จากการ login
        });

        console.log(tokenResponse.data); // Log the token update response

        // AuthContext จะจัดการการ navigate อัตโนมัติ
        setIsLoading(false);
        console.log('Login successful. AuthContext will handle navigation automatically.');
      } else {
        setIsLoading(false); // หยุดโหลดเมื่อเกิดข้อผิดพลาด
        Alert.alert('เตือน', t('invalidCredentials'));
      }
    } catch (error) {
      setIsLoading(false); // หยุดโหลดเมื่อเกิดข้อผิดพลาด
      console.log('Error:', error);  // Log the error for debugging
      Alert.alert('เตือน', t('emailOrPasswordIncorrect'));
    }
  };

  // Google Sign-In Handler
  // Branch between native Google Sign-In (dev-client / standalone) and a web OAuth fallback (Expo Go / proxy)
  const handleGoogleSignIn = async () => {
    // If native module is present, prefer native Google Sign-In
    if (GoogleSignin) {
      try {
        setSocialLoading(prev => ({ ...prev, google: true }));

        console.log('Google Config (native):', GOOGLE_CONFIG);
        await GoogleSignin.hasPlayServices();

        const userInfo = await GoogleSignin.signIn();
        console.log('Google User Info (native):', userInfo);

        if (!userInfo.user.email) {
          Alert.alert(
            'ต้องการอีเมล',
            'กรุณาแชร์อีเมลของคุณเพื่อใช้งาน Google Sign-In หรือลองเข้าสู่ระบบด้วยวิธีอื่น',
            [{ text: t('understood') }]
          );
          return;
        }

        const userEmail = userInfo.user.email;

        const socialLoginResponse = await axios.post(`${ipAddress}/social-login`, {
          provider: 'google',
          providerId: userInfo.user.id,
          email: userEmail,
          name: userInfo.user.name,
          firstName: userInfo.user.givenName || null,
          lastName: userInfo.user.familyName || null,
          photo: userInfo.user.photo,
        });

        if (socialLoginResponse.data.token) {
          await login(socialLoginResponse.data.token);
          await SecureStore.setItemAsync('userEmail', userEmail);
          Alert.alert(t('success'), t('googleSignInSuccess'));
        } else {
          Alert.alert('เตือน', t('googleSignInError'));
        }
      } catch (error) {
        console.log('Google Sign-In Error (native):', error);
        let errorMessage = t('googleSignInGeneralError');
        if (error.code === statusCodes.SIGN_IN_CANCELLED) return;
        if (error.code === statusCodes.IN_PROGRESS) errorMessage = t('signInInProgress');
        if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) errorMessage = t('playServicesNotAvailable');
        if (error.message) errorMessage = `${t('errorPrefix')} ${error.message}`;
        Alert.alert('เตือน', errorMessage);
      } finally {
        setSocialLoading(prev => ({ ...prev, google: false }));
      }

      return;
    }

    // Fallback: Use expo-auth-session (web OAuth) which works in Expo Go via proxy or in native with the same redirect URI
    try {
      setSocialLoading(prev => ({ ...prev, google: true }));

      const REDIRECT_URI = AuthSession.makeRedirectUri({ scheme: 'thetrago', path: 'auth', useProxy: useProxyForDev });
      console.log('Google Redirect URI (web fallback):', REDIRECT_URI);

      const discovery = {
        authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
        tokenEndpoint: 'https://oauth2.googleapis.com/token',
      };

      const request = new AuthRequest({
        clientId: GOOGLE_CONFIG.webClientId,
        scopes: ['openid', 'profile', 'email'],
        redirectUri: REDIRECT_URI,
        responseType: ResponseType.Code,
        extraParams: { access_type: 'offline', prompt: 'consent' },
      });

      const result = await request.promptAsync(discovery);
      console.log('Google AuthResult (web):', result);

      if (result.type === 'success') {
        const { code } = result.params;
        if (!code) throw new Error('No authorization code received from Google');

        const socialLoginResponse = await axios.post(`${ipAddress}/social-login`, {
          provider: 'google',
          authCode: code,
          redirectUri: REDIRECT_URI,
        });

        if (socialLoginResponse.data.token) {
          const userEmail = socialLoginResponse.data.user?.email || null;
          await login(socialLoginResponse.data.token);
          if (userEmail) await SecureStore.setItemAsync('userEmail', userEmail);
          Alert.alert(t('success'), t('googleSignInSuccess'));
        } else {
          Alert.alert('เตือน', t('googleSignInError'));
        }
      } else if (result.type === 'cancel') {
        console.log('Google login cancelled (web)');
      } else {
        throw new Error('Google authentication failed');
      }
    } catch (error) {
      console.log('Google Login Error (web):', error);
      if (error.response) {
        console.log('API Error Response:', error.response.data);
        Alert.alert('เตือน', `${t('apiError')}: ${error.response.data.message || t('unknownReason')}`);
      } else if (error.request) {
        console.log('Network Error:', error.request);
        Alert.alert('เตือน', t('cannotConnectToServer'));
      } else {
        Alert.alert('เตือน', `Google Login Error: ${error.message}`);
      }
    } finally {
      setSocialLoading(prev => ({ ...prev, google: false }));
    }
  };

  // Facebook Login Handler using expo-auth-session
  const handleFacebookLogin = async () => {
    console.log('Starting Facebook Login with expo-auth-session...');

    try {
      setSocialLoading(prev => ({ ...prev, facebook: true }));

      // Facebook OAuth configuration
      const CLIENT_ID = '1326238592032941'; // Your Facebook App ID
      // Create a scheme-based redirect URI so OAuth redirects back into the app
      // NOTE: Make sure this exact URI (for example: "thetrago://auth") is registered
      // in your Facebook App -> Settings -> Valid OAuth Redirect URIs (or use the expo proxy URI).
      const REDIRECT_URI = AuthSession.makeRedirectUri({
        scheme: 'thetrago',
        path: 'auth',
        useProxy: useProxyForDev
      });

      console.log('Facebook Redirect URI:', REDIRECT_URI);

      // Create AuthRequest for Facebook
      const request = new AuthRequest({
        clientId: CLIENT_ID,
        scopes: ['public_profile', 'email'],
        redirectUri: REDIRECT_URI,
        responseType: ResponseType.Code,
        extraParams: {
          display: 'popup',
        },
      });

      // Facebook discovery endpoint
      const discovery = {
        authorizationEndpoint: 'https://www.facebook.com/v18.0/dialog/oauth',
        tokenEndpoint: 'https://graph.facebook.com/v18.0/oauth/access_token',
      };

      // Start authentication
      const result = await request.promptAsync(discovery);

      console.log('Facebook Auth Result:', result);

      if (result.type === 'success') {
        const { code } = result.params;
        
        if (!code) {
          throw new Error('No authorization code received from Facebook');
        }

        console.log('Facebook authorization code received:', code);

        // Send code to backend for token exchange and user info
        console.log('Sending to backend API...');
        const socialLoginResponse = await axios.post(`${ipAddress}/social-login`, {
          provider: 'facebook',
          authCode: code,
          redirectUri: REDIRECT_URI,
        });

        console.log('Backend response:', socialLoginResponse.data);

        if (socialLoginResponse.data.token && socialLoginResponse.data.user) {
          const userData = socialLoginResponse.data.user;
          
          await login(socialLoginResponse.data.token);
          // Save user email to SecureStore for BookingScreen
          await SecureStore.setItemAsync('userEmail', userData.email);
          console.log('Facebook Sign-In: User email saved to SecureStore:', userData.email);
          Alert.alert(t('success'), t('facebookSignInSuccess'));
        } else {
          Alert.alert('เตือน', t('facebookSignInError'));
        }
      } else if (result.type === 'cancel') {
        console.log('Facebook login was cancelled');
        return;
      } else {
        throw new Error('Facebook authentication failed');
      }
    } catch (error) {
      console.log('Facebook Login Error:', error);
      console.log('Error details:', error.message, error.stack);

      if (error.response) {
        console.log('API Error Response:', error.response.data);
        Alert.alert('เตือน', `${t('apiError')}: ${error.response.data.message || t('unknownReason')}`);
      } else if (error.request) {
        console.log('Network Error:', error.request);
        Alert.alert('เตือน', t('cannotConnectToServer'));
      } else {
        Alert.alert('เตือน', `Facebook Login Error: ${error.message}`);
      }
    } finally {
      setSocialLoading(prev => ({ ...prev, facebook: false }));
    }
  };

  // Apple Sign-In Handler
  const handleAppleSignIn = async () => {
    try {
      setSocialLoading(prev => ({ ...prev, apple: true }));

      // Check if Apple Sign-In is available on this device
      const isAvailable = await AppleAuthentication.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert(
          t('appleSignInError'),
          'Apple Sign-In is not available on this device',
          [{ text: t('understood') }]
        );
        return;
      }

      // Perform Apple Sign-In
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      console.log('Apple Auth Response:', credential);
      console.log('Apple fullName:', fullName);
      console.log('Apple email:', email);
      console.log('Apple user ID:', appleUserId);

      const { identityToken, authorizationCode, user: appleUserId, email, fullName } = credential;

      if (!identityToken) {
        throw new Error('No identity token received from Apple');
      }

      // จัดการกับอีเมลที่ได้จาก Apple - ไม่ซ่อนอีเมล
      let userEmail = email || null;
      let tokenPayload = null;
      if (identityToken) {
        tokenPayload = parseJwt(identityToken);
        console.log('Parsed identity token payload:', tokenPayload);
        if (!userEmail && tokenPayload && tokenPayload.email) {
          userEmail = tokenPayload.email;
          console.log('Extracted email from identityToken:', userEmail);
        }
      }

      // ตรวจสอบว่าต้องมีอีเมลเพื่อใช้งาน
      if (!userEmail) {
        Alert.alert(
          'ต้องการอีเมล',
          'กรุณาแชร์อีเมลของคุณเพื่อใช้งาน Apple Sign-In หรือลองเข้าสู่ระบบด้วยวิธีอื่น',
          [{ text: t('understood') }]
        );
        return;
      }

      // ส่งข้อมูลไปยัง API - ใช้ bundle ID เป็น audience
      const aud = tokenPayload?.aud || BUNDLE_ID; // ใช้ bundle ID เป็น fallback
      
      // จัดการชื่อจาก Apple - ตรวจสอบทั้ง fullName object และ token payload
      let displayName = null;
      let firstName = fullName?.givenName || null;
      let lastName = fullName?.familyName || null;
      
      // ถ้าไม่มีชื่อจาก fullName ให้ลองดึงจาก token payload
      if (!firstName && !lastName && tokenPayload) {
        // บางครั้ง Apple อาจจะใส่ชื่อใน token payload
        firstName = tokenPayload.given_name || tokenPayload.first_name || null;
        lastName = tokenPayload.family_name || tokenPayload.last_name || null;
        console.log('Fallback names from token:', { firstName, lastName });
      }
      
      // สร้าง displayName
      if (firstName || lastName) {
        displayName = `${firstName || ''} ${lastName || ''}`.trim();
      }
      
      // หมายเหตุ: Apple จะส่งชื่อมาเฉพาะครั้งแรกที่ผู้ใช้ sign in เท่านั้น
      // หากไม่มีชื่อ อาจจะเป็นเพราะผู้ใช้เคย sign in แล้ว หรือเลือกไม่แชร์ชื่อ
      if (!displayName) {
        console.log('Warning: No name received from Apple Sign-In. This is normal for returning users or users who chose not to share their name.');
      }
      
      console.log('Apple fullName object:', fullName);
      console.log('Processed name - displayName:', displayName, 'firstName:', firstName, 'lastName:', lastName);
      console.log('Sending to server - aud:', aud, 'providerId:', appleUserId, 'bundleId:', BUNDLE_ID);
      
      let socialLoginResponse;
      try {
        socialLoginResponse = await axios.post(`${ipAddress}/social-login`, {
          provider: 'apple',
          providerId: appleUserId,
          email: userEmail,
          name: displayName,
          firstName: firstName,
          lastName: lastName,
          photo: null, // Apple ไม่ให้รูป
          identityToken: identityToken,
          authorizationCode: authorizationCode,
          accessToken: authorizationCode || null,
          // ใช้ bundle ID เป็น audience หลัก
          audience: BUNDLE_ID,
          aud: BUNDLE_ID,
          bundleId: BUNDLE_ID, // ส่ง bundle ID แยกต่างหาก
          nonce: null, // Expo Apple Auth ไม่ส่ง nonce
        });
        console.log('Apple sign-in success:', socialLoginResponse.data);
      } catch (err) {
        console.log('Apple Sign-In -> backend request failed');
        console.log('Error details:', {
          status: err?.response?.status,
          statusText: err?.response?.statusText,
          data: err?.response?.data,
          message: err?.message
        });
        
        if (err.response) {
          console.log('Backend response status:', err.response.status);
          console.log('Backend response data:', JSON.stringify(err.response.data));
          
          // ถ้าเป็น 500 error และเป็น development mode ให้แสดงรายละเอียด
          if (err.response.status === 500) {
            const errorDetail = err.response.data?.detail || err.response.data?.message || 'Unknown server error';
            Alert.alert('เตือน', `Apple Sign-In server error: ${errorDetail}`);
          } else {
            Alert.alert('เตือน', `Apple Sign-In failed: ${err.response.status} - ${err.response.data?.message || JSON.stringify(err.response.data)}`);
          }
        } else if (err.request) {
          console.log('No response received from backend:', err.request);
          Alert.alert('เตือน', t('cannotConnectToServer'));
        } else {
          console.log('Axios error:', err.message);
          Alert.alert('เตือน', t('appleSignInError'));
        }
        throw err; // rethrow to be handled by outer catch and finally
      }

      if (socialLoginResponse.data.token) {
        await login(socialLoginResponse.data.token);
        // Save user email to SecureStore for BookingScreen
        await SecureStore.setItemAsync('userEmail', userEmail);
        console.log('Apple Sign-In: User email saved to SecureStore:', userEmail);
        Alert.alert(t('success'), t('appleSignInSuccess'));
      } else {
        Alert.alert('เตือน', t('appleSignInError'));
      }
    } catch (error) {
      console.log('Apple Sign-In Error:', error);

      // Handle cancellation with Expo Apple Authentication
      if (error.code === 'ERR_CANCELED' || error.code === 'ERR_REQUEST_CANCELED') {
        // ผู้ใช้ยกเลิกการเข้าสู่ระบบ
        return;
      }

      let errorMessage = t('appleSignInError');
      if (error.message && error.message.includes('not available')) {
        errorMessage = 'Apple Sign-In is not available on this device';
      }

      Alert.alert('เตือน', errorMessage);
    } finally {
      setSocialLoading(prev => ({ ...prev, apple: false }));
    }
  };



  return (
    <View style={styles.container}>
      {/* Set StatusBar for cross-platform consistency */}
      <StatusBar
        barStyle="light-content"
        backgroundColor="#FD501E"
        translucent={Platform.OS === 'android'}
      />

      {/* Premium Background */}
      <LinearGradient
        colors={['#ffffff', '#fefefe', '#fff9f4', '#fef5ed', '#fff2e8', '#ffffff']}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <SafeAreaView
        style={[
          styles.safeArea,
          Platform.OS === 'android' && Platform.Version >= 31 ?
            { paddingTop: insets.top } : // Android 15 edge-to-edge
            { paddingTop: StatusBar.currentHeight || 0 }
        ]}
      >
        {(isLoading || socialLoading.google || socialLoading.facebook || socialLoading.apple) && (
          <BlurView intensity={80} tint="light" style={styles.loadingContainer}>
            <View style={styles.loadingContent}>
              <ActivityIndicator size="large" color="#FD501E" />
              <Text style={styles.loadingText}>
                {socialLoading.google ? t('signInWithGoogle') :
                  socialLoading.facebook ? t('signInWithFacebook') :
                    socialLoading.apple ? t('signInWithApple') :
                      t('signingYouIn')}
              </Text>
            </View>
          </BlurView>
        )}

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Hero Section */}
          <Animated.View
            style={[
              styles.heroSection,
              {
                opacity: fadeAnim,
                transform: [
                  { translateY: slideAnim },
                  { scale: scaleAnim }
                ],
              },
            ]}
          >
            <Text style={styles.welcomeText}>{t('welcomeBack')}</Text>
            <Text style={styles.welcomeSubtext}>{t('signInToContinue')}</Text>
          </Animated.View>

          {/* Main Content Card */}
          <Animated.View
            style={[
              styles.cardContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <BlurView intensity={50} tint="extraLight" style={styles.card}>
              <LinearGradient
                colors={['rgba(255,255,255,0.98)', 'rgba(255,252,248,0.99)', 'rgba(255,249,242,0.97)', 'rgba(255,255,255,0.95)']}
                style={styles.cardGradient}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.title}>{t('signIn')}</Text>
                  <View style={styles.titleUnderline} />
                </View>

                <View style={styles.subtitleContainer}>
                  <Text style={styles.subtitle}>{t('dontHaveAccount')}</Text>
                  <TouchableOpacity onPress={() => navigation.navigate('RegisterScreen')}>
                    <Text style={styles.link}>{t('createAccount')}</Text>
                  </TouchableOpacity>
                </View>

                {/* Premium Input Fields */}
                <View style={styles.inputSection}>
                  <View style={styles.inputContainer}>
                    <View style={styles.inputIconContainer}>
                      <MaterialIcons name="email" size={22} color="#FD501E" style={styles.inputIcon} />
                    </View>
                    <TextInput
                      style={styles.input}
                      placeholder={t('usernameOrEmail')}
                      placeholderTextColor="#aaa"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                    />
                    <View style={styles.inputFocusLine} />
                  </View>

                  <View style={styles.inputContainer}>
                    <View style={styles.inputIconContainer}>
                      <MaterialIcons name="lock" size={22} color="#FD501E" style={styles.inputIcon} />
                    </View>
                    <TextInput
                      style={styles.input}
                      placeholder={t('password')}
                      placeholderTextColor="#aaa"
                      secureTextEntry={!showPassword}
                      value={password}
                      onChangeText={setPassword}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                      <Icon name={showPassword ? 'eye' : 'eye-off'} size={22} color="#999" />
                    </TouchableOpacity>
                    <View style={styles.inputFocusLine} />
                  </View>
                </View>

                <View style={styles.row}>
                  <TouchableOpacity onPress={() => setRemember(!remember)} style={styles.checkboxContainer}>
                    <MaterialIcons name={remember ? "check-box" : "check-box-outline-blank"} size={24} color="#FD501E" />
                    <Text style={styles.rememberText}>{t('rememberMe')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => navigation.navigate('ForgotPasswordScreen')}>
                    <Text style={styles.forgotText}>{t('forgotPassword')}</Text>
                  </TouchableOpacity>
                </View>

                {/* Premium Sign In Button */}
                <TouchableOpacity
                  style={styles.signInButton}
                  onPress={() => {
                    setIsLoading(true);
                    handleLogin();
                  }}
                >
                  <LinearGradient
                    colors={['#FF6B35', '#FD501E', '#E8441C']}
                    style={styles.buttonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <View style={styles.buttonContent}>
                      <Text style={styles.signInText}>{t('signIn')}</Text>
                      <MaterialIcons name="arrow-forward" size={20} color="#fff" style={styles.buttonIcon} />
                    </View>
                  </LinearGradient>
                </TouchableOpacity>

                {/* Social Login Section */}
                <View style={styles.dividerContainer}>
                  <View style={styles.divider} />
                  <Text style={styles.orText}>{t('orContinueWith')}</Text>
                  <View style={styles.divider} />
                </View>

                <View style={styles.socialContainer}>
                  {/* Apple Sign-In Button สำหรับ iOS */}
                  {Platform.OS === 'ios' && (
                    <TouchableOpacity
                      style={[styles.socialButton, styles.appleButton]}
                      onPress={handleAppleSignIn}
                      disabled={socialLoading.apple || isLoading}
                    >
                      <View style={styles.socialButtonContent}>
                        {socialLoading.apple ? (
                          <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                          <FontAwesome name="apple" size={20} color="#FFFFFF" />
                        )}
                        <Text style={[styles.socialButtonText, { color: '#FFFFFF' }]}>
                          {socialLoading.apple ? t('signInWithApple') : `Continue with Apple`}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  )}

                  {/* Google Sign-In Button */}
                  <TouchableOpacity
                    style={[styles.socialButton, styles.googleButton, (socialLoading.google || isLoading) && styles.buttonDisabled]}
                    onPress={handleGoogleSignIn}
                    disabled={socialLoading.google || isLoading}
                  >
                    <View style={styles.socialButtonContent}>
                      {socialLoading.google ? (
                        <ActivityIndicator size="small" color="#757575" />
                      ) : (
                        <FontAwesome name="google" size={20} color="#EA4335" />
                      )}
                      <Text style={[styles.socialButtonText, { color: '#3C4043' }]}>
                        {socialLoading.google ? t('signInWithGoogle') : `Continue with Google`}
                      </Text>
                    </View>
                  </TouchableOpacity>

     

                  {/* Facebook Sign-In Button - using expo-auth-session */}
                  <TouchableOpacity
                    style={[styles.socialButton, styles.facebookButton]}
                    onPress={handleFacebookLogin}
                    disabled={socialLoading.facebook || isLoading}
                  >
                    <View style={styles.socialButtonContent}>
                      {socialLoading.facebook ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <FontAwesome name="facebook-f" size={20} color="#FFFFFF" />
                      )}
                      <Text style={[styles.socialButtonText, { color: '#FFFFFF' }]}>
                        {socialLoading.facebook ? t('signInWithFacebook') : `Continue with Facebook`}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>

                {/* Policy Text */}
                <Text style={styles.policyText}>
                  {t('byContinuing')}{' '}
                  <Text
                    style={styles.linkText}
                    onPress={() => navigation.navigate('TermsScreen')}
                  >
                    {t('termsOfUse')}
                  </Text>
                  {' '}{t('and')}{' '}
                  <Text
                    style={styles.linkText}
                    onPress={() => navigation.navigate('PrivacyPolicyScreen')}
                  >
                    {t('privacyPolicy')}
                  </Text>
                  {t('ofTheTrago')}.
                </Text>
              </LinearGradient>
            </BlurView>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  loadingContent: {
    backgroundColor: 'rgba(255,255,255,0.98)',
    padding: 35,
    borderRadius: 25,
    alignItems: 'center',
    shadowColor: '#FD501E',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.25,
    shadowRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(253,80,30,0.1)',
  },
  loadingText: {
    marginTop: 18,
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
    letterSpacing: 0.5,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    paddingTop: Platform.OS === 'android' ? 20 : 5,
    paddingBottom: 100,
    zIndex: 2,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#2c2c2c',
    marginBottom: 8,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  welcomeSubtext: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
    marginBottom: 25,
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  cardContainer: {
    flex: 1,
  },
  card: {
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 25 },
    shadowOpacity: 0.15,
    shadowRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  cardGradient: {
    padding: 35,
    minHeight: 480,
  },
  cardHeader: {
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: '#2c2c2c',
    letterSpacing: -0.8,
    textAlign: 'center',
  },
  titleUnderline: {
    width: 60,
    height: 4,
    backgroundColor: '#FD501E',
    borderRadius: 2,
    marginTop: 8,
  },
  subtitleContainer: {
    flexDirection: 'row',
    marginBottom: 35,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtitle: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  link: {
    color: '#FD501E',
    fontSize: 16,
    fontWeight: '700',
  },
  inputSection: {
    marginBottom: 25,
  },
  inputContainer: {
    position: 'relative',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 18,
    marginBottom: 20,
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderWidth: 2,
    borderColor: 'rgba(253,80,30,0.08)',
    shadowColor: '#FD501E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(253,80,30,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  inputIcon: {
    // No additional styles needed
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 15,
    fontWeight: '500',
  },
  inputFocusLine: {
    position: 'absolute',
    bottom: 0,
    left: 20,
    right: 20,
    height: 2,
    backgroundColor: 'rgba(253,80,30,0.2)',
    borderRadius: 1,
  },
  eyeIcon: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    paddingHorizontal: 5,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rememberText: {
    fontSize: 15,
    color: '#666',
    marginLeft: 10,
    fontWeight: '500',
  },
  forgotText: {
    color: '#FD501E',
    fontSize: 15,
    fontWeight: '700',
  },
  signInButton: {
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 25,
    shadowColor: '#FD501E',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
  },
  buttonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  signInText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 18,
    letterSpacing: 0.8,
  },
  buttonIcon: {
    marginLeft: 10,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 25,
    paddingHorizontal: 10,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.12)',
  },
  orText: {
    marginHorizontal: 20,
    color: '#999',
    fontSize: 15,
    fontWeight: '600',
  },
  socialContainer: {
    marginBottom: 30,
    gap: 12,
  },
  // Unified social button styles
  socialButton: {
    height: 52,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  socialButtonWrapper: {
    position: 'relative',
  },
  // Apple Button Styles
  appleButton: {
    backgroundColor: '#000000',
  },
  // Google Button Styles
  googleButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#DADCE0',
  },
  // Facebook Button Styles
  facebookButton: {
    backgroundColor: '#1877F2',
  },
  // Button content and text styles
  socialButtonContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    height: '100%',
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
    textAlign: 'center',
    // สีจะถูกกำหนดแยกในแต่ละปุ่ม
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  policyText: {
    fontSize: 13,
    color: '#999',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 15,
    paddingVertical: 10,
    flexWrap: 'wrap',
  },
  inlineLink: {
    // No additional styles needed - the TouchableOpacity wraps the Text
  },
  linkText: {
    color: '#FD501E',
    fontWeight: '700',
    fontSize: 13,
    textDecorationLine: 'underline',
  },
});
