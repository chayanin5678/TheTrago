import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert, ActivityIndicator, ScrollView, Animated, Dimensions, SafeAreaView, StatusBar, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Icon from 'react-native-vector-icons/Ionicons';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import ipAddress from "../ipconfig";
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useCustomer } from './CustomerContext';
import { useAuth } from '../AuthContext';
// Social login imports - conditional for Expo Go compatibility
let GoogleSignin, statusCodes, LoginManager, AccessToken;
try {
  const googleSignin = require('@react-native-google-signin/google-signin');
  GoogleSignin = googleSignin.GoogleSignin;
  statusCodes = googleSignin.statusCodes;
} catch (error) {
  console.log('Google Sign-In not available in Expo Go');
}

try {
  const fbSdk = require('react-native-fbsdk-next');
  LoginManager = fbSdk.LoginManager;
  AccessToken = fbSdk.AccessToken;
} catch (error) {
  console.log('Facebook SDK not available in Expo Go');
}

import { GOOGLE_CONFIG } from '../socialConfig';


const { width, height } = Dimensions.get('window');

export default function LoginScreen({ navigation }) {
  const { customerData, updateCustomerData } = useCustomer();
  const { login } = useAuth();
  const [email, setEmail] = useState(customerData.email || '');
  const [password, setPassword] = useState(customerData.password || '');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(customerData.remember || false);
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState({ google: false, facebook: false });

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
        Alert.alert('Error', 'Invalid credentials');
      }
    } catch (error) {
      setIsLoading(false); // หยุดโหลดเมื่อเกิดข้อผิดพลาด
      console.log('Error:', error);  // Log the error for debugging
      Alert.alert('Error', 'Email or password is incorrect');
    }
  };

  // Google Sign-In Handler
  const handleGoogleSignIn = async () => {
    // Check if Google Sign-In is available (not in Expo Go)
    if (!GoogleSignin) {
      Alert.alert(
        'Google Sign-In ไม่พร้อมใช้งาน', 
        'Google Sign-In ต้องใช้ Development Build และไม่สามารถทำงานใน Expo Go ได้\n\nโปรดใช้:\n• expo build หรือ eas build\n• หรือทดสอบด้วย Facebook Login แทน',
        [{ text: 'เข้าใจแล้ว' }]
      );
      return;
    }

    try {
      setSocialLoading(prev => ({ ...prev, google: true }));
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      
      console.log('Google User Info:', userInfo);
      
      // ส่งข้อมูลไปยัง API เพื่อตรวจสอบหรือสร้างบัญชี
      const socialLoginResponse = await axios.post(`${ipAddress}/AppApi/social-login`, {
        provider: 'google',
        providerId: userInfo.user.id,
        email: userInfo.user.email,
        name: userInfo.user.name,
        firstName: userInfo.user.givenName || null,
        lastName: userInfo.user.familyName || null,
        photo: userInfo.user.photo,
      });

      if (socialLoginResponse.data.token) {
        await login(socialLoginResponse.data.token);
        Alert.alert('สำเร็จ', 'เข้าสู่ระบบด้วย Google สำเร็จ');
      } else {
        Alert.alert('ข้อผิดพลาด', 'ไม่สามารถเข้าสู่ระบบด้วย Google ได้');
      }
    } catch (error) {
      console.log('Google Sign-In Error:', error);
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // ผู้ใช้ยกเลิกการเข้าสู่ระบบ
        return;
      } else if (error.code === statusCodes.IN_PROGRESS) {
        Alert.alert('กำลังดำเนินการ', 'การเข้าสู่ระบบกำลังดำเนินการอยู่');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert('ข้อผิดพลาด', 'Google Play Services ไม่พร้อมใช้งาน');
      } else {
        Alert.alert('ข้อผิดพลาด', 'เกิดข้อผิดพลาดในการเข้าสู่ระบบด้วย Google');
      }
    } finally {
      setSocialLoading(prev => ({ ...prev, google: false }));
    }
  };

  // Facebook Login Handler
  const handleFacebookLogin = async () => {
    console.log('Starting Facebook Login...');
    
    // Check if Facebook SDK is available
    if (!LoginManager || !AccessToken) {
      console.log('Facebook SDK not available');
      Alert.alert(
        'Facebook Login ไม่พร้อมใช้งาน', 
        'Facebook SDK ต้องใช้ Development Build และไม่สามารถทำงานใน Expo Go ได้\n\nโปรดใช้:\n• expo build หรือ eas build\n• หรือใช้การ login ปกติแทน',
        [{ text: 'เข้าใจแล้ว' }]
      );
      return;
    }

    try {
      setSocialLoading(prev => ({ ...prev, facebook: true }));
      console.log('Attempting Facebook login...');
      
      const result = await LoginManager.logInWithPermissions(['public_profile', 'email']);
      console.log('Facebook login result:', result);
      
      if (result.isCancelled) {
        console.log('Facebook login was cancelled');
        return;
      }

      console.log('Getting Facebook access token...');
      const data = await AccessToken.getCurrentAccessToken();
      console.log('Facebook access token data:', data);
      
      if (!data) {
        console.log('No Facebook access token available');
        Alert.alert('ข้อผิดพลาด', 'ไม่สามารถเข้าถึง Facebook token ได้');
        return;
      }

      // ดึงข้อมูลผู้ใช้จาก Facebook Graph API
      console.log('Fetching Facebook user info...');
      const facebookResponse = await fetch(`https://graph.facebook.com/me?access_token=${data.accessToken}&fields=id,name,email,first_name,last_name,picture.type(large)`);
      const facebookUserInfo = await facebookResponse.json();
      
      console.log('Facebook User Info:', facebookUserInfo);

      // ตรวจสอบว่ามี email หรือไม่
      if (!facebookUserInfo.email) {
        Alert.alert('ข้อผิดพลาด', 'ไม่สามารถเข้าถึงอีเมลจาก Facebook ได้ กรุณาตรวจสอบการอนุญาต');
        return;
      }

      // ส่งข้อมูลไปยัง API เพื่อตรวจสอบหรือสร้างบัญชี
      console.log('Sending to backend API...');
      const socialLoginResponse = await axios.post(`${ipAddress}/social-login`, {
        provider: 'facebook',
        providerId: facebookUserInfo.id,
        email: facebookUserInfo.email,
        name: facebookUserInfo.name,
        firstName: facebookUserInfo.first_name || null,
        lastName: facebookUserInfo.last_name || null,
        photo: facebookUserInfo.picture?.data?.url,
      });

      console.log('Backend response:', socialLoginResponse.data);

      if (socialLoginResponse.data.token) {
        await login(socialLoginResponse.data.token);
        Alert.alert('สำเร็จ', 'เข้าสู่ระบบด้วย Facebook สำเร็จ');
      } else {
        Alert.alert('ข้อผิดพลาด', 'ไม่สามารถเข้าสู่ระบบด้วย Facebook ได้');
      }
    } catch (error) {
      console.log('Facebook Login Error:', error);
      console.log('Error details:', error.message, error.stack);
      
      if (error.response) {
        console.log('API Error Response:', error.response.data);
        Alert.alert('ข้อผิดพลาด', `เกิดข้อผิดพลาดจาก API: ${error.response.data.message || 'ไม่ทราบสาเหตุ'}`);
      } else if (error.request) {
        console.log('Network Error:', error.request);
        Alert.alert('ข้อผิดพลาด', 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
      } else {
        Alert.alert('ข้อผิดพลาด', 'เกิดข้อผิดพลาดในการเข้าสู่ระบบด้วย Facebook');
      }
    } finally {
      setSocialLoading(prev => ({ ...prev, facebook: false }));
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
      
      <SafeAreaView style={[styles.safeArea, Platform.OS === 'android' && { paddingTop: StatusBar.currentHeight || 0 }]}>
        {(isLoading || socialLoading.google || socialLoading.facebook) && (
          <BlurView intensity={80} tint="light" style={styles.loadingContainer}>
            <View style={styles.loadingContent}>
              <ActivityIndicator size="large" color="#FD501E" />
              <Text style={styles.loadingText}>
                {socialLoading.google ? 'เข้าสู่ระบบด้วย Google...' : 
                 socialLoading.facebook ? 'เข้าสู่ระบบด้วย Facebook...' : 
                 'Signing you in...'}
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
          <Text style={styles.welcomeText}>Welcome Back</Text>
          <Text style={styles.welcomeSubtext}>Sign in to continue your journey</Text>
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
                <Text style={styles.title}>Sign In</Text>
                <View style={styles.titleUnderline} />
              </View>
              
              <View style={styles.subtitleContainer}>
                <Text style={styles.subtitle}>Don't have an account?</Text>
                <TouchableOpacity onPress={() => navigation.navigate('RegisterScreen')}>
                  <Text style={styles.link}> Create account</Text>
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
                    placeholder="Email address"
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
                    placeholder="Password"
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
                  <Text style={styles.rememberText}>Remember me</Text>
                </TouchableOpacity>
                <TouchableOpacity>
                  <Text style={styles.forgotText}>Forgot password?</Text>
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
                    <Text style={styles.signInText}>Sign In</Text>
                    <MaterialIcons name="arrow-forward" size={20} color="#fff" style={styles.buttonIcon} />
                  </View>
                </LinearGradient>
              </TouchableOpacity>

              {/* Social Login Section */}
              <View style={styles.dividerContainer}>
                <View style={styles.divider} />
                <Text style={styles.orText}>Or continue with</Text>
                <View style={styles.divider} />
              </View>

              <View style={styles.socialContainer}>
                <TouchableOpacity 
                  style={styles.socialButton} 
                  onPress={handleGoogleSignIn}
                  disabled={socialLoading.google || isLoading}
                >
                  <BlurView intensity={30} tint="light" style={styles.socialBlur}>
                    <LinearGradient
                      colors={['rgba(255,255,255,0.9)', 'rgba(250,250,250,0.95)']}
                      style={styles.socialGradient}
                    >
                      {socialLoading.google ? (
                        <ActivityIndicator size="small" color="#EA4335" />
                      ) : (
                        <FontAwesome name="google" size={22} color="#EA4335" />
                      )}
                      <Text style={styles.socialText}>
                        {socialLoading.google ? 'กำลังเข้าสู่ระบบ...' : 'Google'}
                      </Text>
                    </LinearGradient>
                  </BlurView>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.socialButton} 
                  onPress={handleFacebookLogin}
                  disabled={socialLoading.facebook || isLoading}
                >
                  <BlurView intensity={30} tint="light" style={styles.socialBlur}>
                    <LinearGradient
                      colors={['rgba(255,255,255,0.9)', 'rgba(250,250,250,0.95)']}
                      style={styles.socialGradient}
                    >
                      {socialLoading.facebook ? (
                        <ActivityIndicator size="small" color="#3b5998" />
                      ) : (
                        <FontAwesome name="facebook" size={22} color="#3b5998" />
                      )}
                      <Text style={styles.socialText}>
                        {socialLoading.facebook ? 'กำลังเข้าสู่ระบบ...' : 'Facebook'}
                      </Text>
                    </LinearGradient>
                  </BlurView>
                </TouchableOpacity>
              </View>

              {/* Fixed Policy Text */}
              <Text style={styles.policyText}>
                By continuing, you agree to The Trago's{' '}
                <TouchableOpacity 
                  onPress={() => navigation.navigate('TermsScreen')} 
                  style={styles.inlineLink}
                >
                  <Text style={styles.linkText}>Terms of Use</Text>
                </TouchableOpacity>
                {' '}and{' '}
                <TouchableOpacity 
                  onPress={() => navigation.navigate('PrivacyPolicyScreen')} 
                  style={styles.inlineLink}
                >
                  <Text style={styles.linkText}>Privacy Policy</Text>
                </TouchableOpacity>.
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    gap: 15,
  },
  socialButton: {
    flex: 1,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
  },
  socialBlur: {
    overflow: 'hidden',
  },
  socialGradient: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialText: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  policyText: {
    fontSize: 13,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 10,
  },
  inlineLink: {
    // No additional styles needed - the TouchableOpacity wraps the Text
  },
  linkText: {
    color: '#FD501E',
    fontWeight: '700',
    fontSize: 13,
  },
});
