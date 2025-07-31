import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView, Animated, SafeAreaView, StatusBar, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { MaterialIcons } from '@expo/vector-icons';
import { useLanguage } from './LanguageContext';
import ipAddress from "../ipconfig";
import axios from 'axios';

export default function OTPVerificationScreen({ route, navigation }) {
  const { t } = useLanguage();
  const { email, type } = route.params; // type: 'password_reset' or 'registration'
  
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);

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

  const handleResetPassword = async () => {
    if (!otp.trim()) {
      Alert.alert(t('error'), t('pleaseEnterOTP'));
      return;
    }

    if (!newPassword.trim()) {
      Alert.alert(t('error'), t('pleaseEnterNewPassword'));
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert(t('error'), t('passwordMinLength'));
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert(t('error'), t('passwordsDoNotMatch'));
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(`${ipAddress}/reset-password`, {
        email: email,
        otp: otp.trim(),
        newPassword: newPassword,
        language: 'th'
      });

      if (response.data.success) {
        Alert.alert(
          t('success'),
          t('passwordResetSuccess'),
          [
            {
              text: t('ok'),
              onPress: () => {
                // Navigate back to login screen
                navigation.navigate('LoginScreen');
              }
            }
          ]
        );
      } else {
        Alert.alert(t('error'), response.data.message || t('resetPasswordFailed'));
      }
    } catch (error) {
      console.log('Reset password error:', error);
      
      if (error.response && error.response.data && error.response.data.message) {
        Alert.alert(t('error'), error.response.data.message);
      } else {
        Alert.alert(t('error'), t('connectionError'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resendOTP = async () => {
    setIsLoading(true);
    
    try {
      const response = await axios.post(`${ipAddress}/forgot-password`, {
        email: email,
        language: 'th'
      });

      if (response.data.success) {
        Alert.alert(t('success'), t('otpResent'));
      } else {
        Alert.alert(t('error'), response.data.message || t('failedToResendOTP'));
      }
    } catch (error) {
      console.log('Resend OTP error:', error);
      Alert.alert(t('error'), t('connectionError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
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
        {isLoading && (
          <BlurView intensity={80} tint="light" style={styles.loadingContainer}>
            <View style={styles.loadingContent}>
              <ActivityIndicator size="large" color="#FD501E" />
              <Text style={styles.loadingText}>{t('resettingPassword')}</Text>
            </View>
          </BlurView>
        )}

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header Section */}
          <Animated.View 
            style={[
              styles.headerSection,
              {
                opacity: fadeAnim,
                transform: [
                  { translateY: slideAnim },
                  { scale: scaleAnim }
                ],
              },
            ]}
          >
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.8}
            >
              <MaterialIcons name="arrow-back" size={24} color="#FD501E" />
            </TouchableOpacity>
            
            <View style={styles.iconContainer}>
              <LinearGradient
                colors={['#FF6B35', '#FD501E', '#E8441C']}
                style={styles.iconGradient}
              >
                <MaterialIcons name="security" size={48} color="#FFFFFF" />
              </LinearGradient>
            </View>
            
            <Text style={styles.headerTitle}>{t('verifyOTP')}</Text>
            <Text style={styles.headerSubtitle}>
              {t('enterOTPSentTo')} {email}
            </Text>
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
                {/* OTP Input */}
                <View style={styles.inputContainer}>
                  <View style={styles.inputIconContainer}>
                    <MaterialIcons name="verified-user" size={22} color="#FD501E" />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder={t('enterOTPCode')}
                    placeholderTextColor="#aaa"
                    value={otp}
                    onChangeText={setOtp}
                    keyboardType="numeric"
                    maxLength={6}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <View style={styles.inputFocusLine} />
                </View>

                {/* New Password Input */}
                <View style={styles.inputContainer}>
                  <View style={styles.inputIconContainer}>
                    <MaterialIcons name="lock" size={22} color="#FD501E" />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder={t('newPassword')}
                    placeholderTextColor="#aaa"
                    secureTextEntry={!showPassword}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                    <MaterialIcons name={showPassword ? 'visibility' : 'visibility-off'} size={22} color="#999" />
                  </TouchableOpacity>
                  <View style={styles.inputFocusLine} />
                </View>

                {/* Confirm Password Input */}
                <View style={styles.inputContainer}>
                  <View style={styles.inputIconContainer}>
                    <MaterialIcons name="lock-outline" size={22} color="#FD501E" />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder={t('confirmNewPassword')}
                    placeholderTextColor="#aaa"
                    secureTextEntry={!showConfirmPassword}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
                    <MaterialIcons name={showConfirmPassword ? 'visibility' : 'visibility-off'} size={22} color="#999" />
                  </TouchableOpacity>
                  <View style={styles.inputFocusLine} />
                </View>

                {/* Instructions */}
                <View style={styles.instructionsContainer}>
                  <Text style={styles.instructionsText}>
                    {t('otpPasswordResetInstructions')}
                  </Text>
                </View>

                {/* Reset Password Button */}
                <TouchableOpacity
                  style={styles.resetButton}
                  onPress={handleResetPassword}
                  disabled={isLoading}
                >
                  <LinearGradient
                    colors={['#FF6B35', '#FD501E', '#E8441C']}
                    style={styles.buttonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <View style={styles.buttonContent}>
                      <Text style={styles.resetText}>{t('resetPassword')}</Text>
                      <MaterialIcons name="check" size={20} color="#fff" style={styles.buttonIcon} />
                    </View>
                  </LinearGradient>
                </TouchableOpacity>

                {/* Resend OTP */}
                <View style={styles.resendContainer}>
                  <Text style={styles.resendText}>{t('didntReceiveOTP')}</Text>
                  <TouchableOpacity onPress={resendOTP}>
                    <Text style={styles.resendLink}>{t('resendOTP')}</Text>
                  </TouchableOpacity>
                </View>

                {/* Back to Login */}
                <View style={styles.backToLoginContainer}>
                  <Text style={styles.backToLoginText}>{t('rememberPassword')}</Text>
                  <TouchableOpacity onPress={() => navigation.navigate('LoginScreen')}>
                    <Text style={styles.backToLoginLink}>{t('backToLogin')}</Text>
                  </TouchableOpacity>
                </View>
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
    paddingTop: Platform.OS === 'android' ? 20 : 50,
    paddingBottom: 100,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  backButton: {
    position: 'absolute',
    top: -30,
    left: 0,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(253,80,30,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  iconContainer: {
    marginBottom: 20,
  },
  iconGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FD501E',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#2c2c2c',
    marginBottom: 8,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
    letterSpacing: 0.3,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
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
    minHeight: 400,
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
  instructionsContainer: {
    backgroundColor: 'rgba(253,80,30,0.05)',
    padding: 20,
    borderRadius: 15,
    marginBottom: 30,
    borderLeft: 4,
    borderLeftColor: '#FD501E',
  },
  instructionsText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
    textAlign: 'center',
  },
  resetButton: {
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
  resetText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 18,
    letterSpacing: 0.8,
  },
  buttonIcon: {
    marginLeft: 10,
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25,
  },
  resendText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  resendLink: {
    color: '#FD501E',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 5,
  },
  backToLoginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  backToLoginText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  backToLoginLink: {
    color: '#FD501E',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 5,
  },
});
