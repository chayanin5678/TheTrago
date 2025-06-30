import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert, ActivityIndicator, ScrollView, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Icon from 'react-native-vector-icons/Ionicons';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import ipAddress from "../ipconfig";
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useCustomer } from './CustomerContext';


const { width, height } = Dimensions.get('window');

export default function LoginScreen({ navigation }) {
  const { customerData, updateCustomerData } = useCustomer();
  const [email, setEmail] = useState(customerData.email || '');
  const [password, setPassword] = useState(customerData.password || '');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(customerData.remember || false);
  const [isLoading, setIsLoading] = useState(false);

  // Premium animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
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
      Alert.alert('Error', 'Email or password is incorrect');
    }
  };
  


  return (
    <View style={styles.container}>
      {/* Premium Background */}
      <LinearGradient
        colors={['#ffffff', '#fefefe', '#fff9f4', '#fef5ed', '#fff2e8', '#ffffff']}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      


      {isLoading && (
        <BlurView intensity={80} tint="light" style={styles.loadingContainer}>
          <View style={styles.loadingContent}>
            <ActivityIndicator size="large" color="#FD501E" />
            <Text style={styles.loadingText}>Signing you in...</Text>
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
                <TouchableOpacity style={styles.socialButton}>
                  <BlurView intensity={30} tint="light" style={styles.socialBlur}>
                    <LinearGradient
                      colors={['rgba(255,255,255,0.9)', 'rgba(250,250,250,0.95)']}
                      style={styles.socialGradient}
                    >
                      <FontAwesome name="google" size={22} color="#EA4335" />
                      <Text style={styles.socialText}>Google</Text>
                    </LinearGradient>
                  </BlurView>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.socialButton}>
                  <BlurView intensity={30} tint="light" style={styles.socialBlur}>
                    <LinearGradient
                      colors={['rgba(255,255,255,0.9)', 'rgba(250,250,250,0.95)']}
                      style={styles.socialGradient}
                    >
                      <FontAwesome name="facebook" size={22} color="#3b5998" />
                      <Text style={styles.socialText}>Facebook</Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
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
    elevation: 15,
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
    paddingTop: 70,
    zIndex: 2,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 45,
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
    elevation: 25,
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
    elevation: 6,
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
    elevation: 15,
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
    elevation: 8,
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
