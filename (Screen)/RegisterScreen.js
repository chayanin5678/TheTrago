import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert, ActivityIndicator, ScrollView, Animated, Dimensions, SafeAreaView, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Icon from 'react-native-vector-icons/Ionicons';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import ipAddress from "../ipconfig";
import axios from 'axios';
import moment from "moment-timezone";
import { useAuth } from '../AuthContext';

const { width, height } = Dimensions.get('window');

const RegisterScreen = ({ navigation }) => {
  const { login } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailExists, setEmailExists] = useState(false);
  const [errors, setErrors] = useState({});
  const [memberid, setMemberId] = useState('');
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

  
  

  const checkEmail = async (email) => {
    try {
      const res = await fetch(`${ipAddress}/checkemail/${email}`);
      if (!res.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await res.json();
      
      if (data.message === 'Email exists' && data.data.length > 0) {
        setEmailExists(true); // อีเมลพบในระบบ
      } else {
        setEmailExists(false); // อีเมลไม่พบในระบบ
      }
    } catch (error) {
      console.error("Error during email check:", error);
      Alert.alert("Error", "Failed to check email");
    }
  };
  useEffect(() => {
    if (email) {
      checkEmail(email); // เรียกใช้ฟังก์ชันเมื่อ email เปลี่ยนแปลง
    }
  }, [email]);

  const validateEmail = (email) => {
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return regex.test(email);
  };

  const createMember = async (memberid) => {
    try {
      const response = await axios.post(`${ipAddress}/member`, {
        md_member_no: memberid,//1
        md_member_user: email,//2
        md_member_pass : password,//3
        md_member_upline: 0,//4
        md_member_fname : firstName,//5
        md_member_lname : lastName,//6
        md_member_email : email,//7
        md_member_passport_status : 3,//8
        md_member_bankID : 0,//9
        md_member_bank_status :3,//10
        md_member_status : 1,//11
        md_member_affiliate_status : 0,
        md_member_logintype :0,
        md_member_credate:  moment().tz("Asia/Bangkok").format("YYYY-MM-DD HH:mm:ss"),
        md_member_update: moment().tz("Asia/Bangkok").format("YYYY-MM-DD HH:mm:ss")

      });

      console.log("✅ Member created successfully");
      
      // Auto login after successful registration
      try {
        const loginResponse = await axios.post(`${ipAddress}/login`, {
          email: email,
          password: password
        });

        if (loginResponse.data.token) {
          // Use AuthContext login method
          await login(loginResponse.data.token);
          console.log('AuthContext: Auto-login after registration successful');
          
          // Also call token API
          await axios.post(`${ipAddress}/Token`, {
            email: email,
            token: loginResponse.data.token
          });
        }
      } catch (loginError) {
        console.warn('Auto-login failed after registration:', loginError);
      }

    } catch (error) {
      console.error("❌ Error creating member:", error);
      throw new Error("❌ Failed to create member");
    }
  };

  


  
  const handleRegister = async () => {
    let newErrors = {};
    setIsLoading(true);

    // ตรวจสอบข้อมูลที่กรอกในฟอร์ม
    if (!firstName) newErrors.firstName = true;
    if (!lastName) newErrors.lastName = true;
    if (!email) newErrors.email = true;
    if (!password) newErrors.passwordContainer = true;
    if (!confirmPassword) newErrors.confirmpasswordContainer = true;

    // ถ้ามีข้อมูลที่ยังไม่ครบ
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      Alert.alert('Incomplete Information', 'Please fill in all required fields.');
      return;
    }

    // ตรวจสอบว่า password ตรงกันหรือไม่
    if (password !== confirmPassword) {
      setIsLoading(false);
      Alert.alert("Passwords don't match!");
      return;
    }

    // ตรวจสอบว่าอีเมลถูกต้องหรือไม่
    if (!validateEmail(email)) {
      setIsLoading(false);
      Alert.alert("Invalid email format!");
      return;
    }

    // ตรวจสอบว่าอีเมลมีในระบบหรือไม่
    if (emailExists) {
      setIsLoading(false);
      Alert.alert("Email already exists!");
      return;
    }

    try {
      // ดึงข้อมูล memberid ใหม่จาก API
      const res = await fetch(`${ipAddress}/memberid`);
      const data = await res.json();
      console.log("Member ID Data:", data);

      // ตรวจสอบว่า data.newMemberId มีอยู่หรือไม่
      if (!data.newMemberId) {
        setIsLoading(false);
        Alert.alert("Error", "Unable to retrieve member ID.");
        return;
      }

      // สร้างหมายเลขสมาชิกใหม่โดยเพิ่ม 1 ให้กับหมายเลขที่ดึงมา
      let numberPart = parseInt(data.newMemberId.substring(1)) + 1;

      // สร้าง ID ใหม่โดยใช้ 'M' และหมายเลขที่เพิ่มขึ้น
      let newId = 'M' + numberPart.toString().padStart(6, '0');
      
      console.log("New ID:", newId);

      await createMember(newId);
      setIsLoading(false);
      Alert.alert('Success', 'Registration successful! You are now logged in.');
    } catch (error) {
      setIsLoading(false);
      console.error('Error during registration:', error);
      Alert.alert('Error', 'Registration failed. Please try again.');
    }
  };



  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Premium Background */}
      <LinearGradient
        colors={['#ffffff', '#fefefe', '#fff9f4', '#fef5ed', '#fff2e8', '#ffffff']}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      <SafeAreaView style={styles.safeArea}>
        {isLoading && (
          <BlurView intensity={80} tint="light" style={styles.loadingContainer}>
            <View style={styles.loadingContent}>
              <ActivityIndicator size="large" color="#FD501E" />
              <Text style={styles.loadingText}>Creating your account...</Text>
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
            <Text style={styles.welcomeText}>Join The Trago</Text>
            <Text style={styles.welcomeSubtext}>Create your account and start your journey</Text>
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
                  <Text style={styles.title}>Create Account</Text>
                  <View style={styles.titleUnderline} />
                </View>
                
                <View style={styles.subtitleContainer}>
                  <Text style={styles.subtitle}>Already have an account?</Text>
                  <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.link}> Sign in</Text>
                  </TouchableOpacity>
                </View>

                {/* Premium Input Fields */}
                <View style={styles.inputSection}>
                  {/* First Name */}
                  <View style={[styles.inputContainer, errors.firstName && styles.errorInput]}>
                    <View style={styles.inputIconContainer}>
                      <MaterialIcons name="person" size={22} color="#FD501E" style={styles.inputIcon} />
                    </View>
                    <TextInput
                      style={styles.input}
                      placeholder="First Name"
                      placeholderTextColor="#aaa"
                      value={firstName}
                      onChangeText={(text) => {
                        setFirstName(text);
                        setErrors((prev) => ({ ...prev, firstName: false }));
                      }}
                    />
                    <View style={styles.inputFocusLine} />
                  </View>

                  {/* Last Name */}
                  <View style={[styles.inputContainer, errors.lastName && styles.errorInput]}>
                    <View style={styles.inputIconContainer}>
                      <MaterialIcons name="person-outline" size={22} color="#FD501E" style={styles.inputIcon} />
                    </View>
                    <TextInput
                      style={styles.input}
                      placeholder="Last Name"
                      placeholderTextColor="#aaa"
                      value={lastName}
                      onChangeText={(text) => {
                        setLastName(text);
                        setErrors((prev) => ({ ...prev, lastName: false }));
                      }}
                    />
                    <View style={styles.inputFocusLine} />
                  </View>

                  <View style={[styles.inputContainer, errors.email && styles.errorInput]}>
                    <View style={styles.inputIconContainer}>
                      <MaterialIcons name="email" size={22} color="#FD501E" style={styles.inputIcon} />
                    </View>
                    <TextInput
                      style={styles.input}
                      placeholder="Email address"
                      placeholderTextColor="#aaa"
                      value={email}
                      onChangeText={(text) => {
                        setEmail(text);
                        setErrors((prev) => ({ ...prev, email: false }));
                      }}
                      keyboardType="email-address"
                    />
                    <View style={styles.inputFocusLine} />
                    {emailExists && (
                      <View style={styles.emailExistsIndicator}>
                        <MaterialIcons name="error" size={16} color="#FF3B30" />
                      </View>
                    )}
                  </View>

                  <View style={[styles.inputContainer, errors.passwordContainer && styles.errorInput]}>
                    <View style={styles.inputIconContainer}>
                      <MaterialIcons name="lock" size={22} color="#FD501E" style={styles.inputIcon} />
                    </View>
                    <TextInput
                      style={styles.input}
                      placeholder="Password"
                      placeholderTextColor="#aaa"
                      secureTextEntry={!showPassword}
                      value={password}
                      onChangeText={(text) => {
                        setPassword(text);
                        setErrors((prev) => ({ ...prev, passwordContainer: false }));
                      }}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                      <Icon name={showPassword ? 'eye' : 'eye-off'} size={22} color="#999" />
                    </TouchableOpacity>
                    <View style={styles.inputFocusLine} />
                  </View>

                  <View style={[styles.inputContainer, errors.confirmpasswordContainer && styles.errorInput]}>
                    <View style={styles.inputIconContainer}>
                      <MaterialIcons name="lock-outline" size={22} color="#FD501E" style={styles.inputIcon} />
                    </View>
                    <TextInput
                      style={styles.input}
                      placeholder="Confirm Password"
                      placeholderTextColor="#aaa"
                      secureTextEntry={!showConfirmPassword}
                      value={confirmPassword}
                      onChangeText={(text) => {
                        setConfirmPassword(text);
                        setErrors((prev) => ({ ...prev, confirmpasswordContainer: false }));
                      }}
                    />
                    <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
                      <Icon name={showConfirmPassword ? 'eye' : 'eye-off'} size={22} color="#999" />
                    </TouchableOpacity>
                    <View style={styles.inputFocusLine} />
                  </View>
                </View>

                {/* Premium Register Button */}
                <TouchableOpacity
                  style={styles.registerButton}
                  onPress={handleRegister}
                  disabled={isLoading}
                >
                  <LinearGradient
                    colors={['#FF6B35', '#FD501E', '#E8441C']}
                    style={styles.buttonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <View style={styles.buttonContent}>
                      <Text style={styles.registerText}>Create Account</Text>
                      <MaterialIcons name="arrow-forward" size={20} color="#fff" style={styles.buttonIcon} />
                    </View>
                  </LinearGradient>
                </TouchableOpacity>

                {/* Social Login Section */}
                {/* <View style={styles.dividerContainer}>
                  <View style={styles.divider} />
                  <Text style={styles.orText}>Or register with</Text>
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
                </View> */}

                {/* Policy Text */}
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
};

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
    paddingTop: 10,
    paddingBottom: 100,
    zIndex: 2,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 20,
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
    minHeight: 580,
  },
  cardHeader: {
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 34,
    fontWeight: '900',
    color: '#2c2c2c',
    letterSpacing: -0.8,
    textAlign: 'center',
  },
  titleUnderline: {
    width: 80,
    height: 4,
    backgroundColor: '#FD501E',
    borderRadius: 2,
    marginTop: 8,
  },
  subtitleContainer: {
    flexDirection: 'row',
    marginBottom: 30,
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
  emailExistsIndicator: {
    position: 'absolute',
    right: 60,
    padding: 8,
  },
  eyeIcon: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  errorInput: {
    borderColor: '#FF3B30',
    borderWidth: 2,
    backgroundColor: 'rgba(255,59,48,0.05)',
  },
  registerButton: {
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
  registerText: {
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

export default RegisterScreen;
