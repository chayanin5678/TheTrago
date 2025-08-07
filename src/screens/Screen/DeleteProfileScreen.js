import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, SafeAreaView, StatusBar, TextInput, ActivityIndicator, ScrollView, Animated, Platform, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLanguage } from './LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import ipAddress from '../../config/ipconfig';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const DeleteProfileScreen = ({ navigation }) => {
  const { t } = useLanguage();
  const { logout } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Debug: ตรวจสอบสถานะปุ่ม
  const isButtonDisabled = isDeleting || !currentPassword.trim() || !confirmPassword.trim() || currentPassword !== confirmPassword;
  
  // Debug log
  useEffect(() => {
    console.log('Button state:', {
      isDeleting,
      currentPassword: currentPassword.length,
      confirmPassword: confirmPassword.length,
      passwordsMatch: currentPassword === confirmPassword,
      isDisabled: isButtonDisabled
    });
  }, [currentPassword, confirmPassword, isDeleting]);
  
  // Animation สำหรับ decorative elements
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // สร้าง animation loop สำหรับ decorative elements
    Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      }),
    ).start();
  }, []);

  const spinInterpolate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const handleEmailSupport = () => {
    const email = 'support@thetrago.com';
    const subject = encodeURIComponent('Account Deletion Support Request');
    const body = encodeURIComponent('Hi TheTrago Support Team,\n\nI need assistance with account deletion.\n\nThank you.');
    
    const mailtoUrl = `mailto:${email}?subject=${subject}&body=${body}`;
    
    Linking.openURL(mailtoUrl).catch(err => {
      Alert.alert(
        t('error') || 'Error',
        t('emailAppNotFound') || 'Unable to open email app. Please contact support@thetrago.com manually.',
        [{ text: t('ok') || 'OK' }]
      );
    });
  };

  const handleDeleteAccount = async () => {
    console.log('Delete button pressed!');
    console.log('Current password:', currentPassword);
    console.log('Confirm password:', confirmPassword);
    console.log('Passwords match:', currentPassword === confirmPassword);
    
    // ตรวจสอบรหัสผ่าน
    if (!currentPassword.trim()) {
      console.log('Current password is empty');
      Alert.alert(
        t('error') || 'Error',
        t('pleaseEnterPassword') || 'Please enter your current password to confirm.',
        [{ text: t('ok') || 'OK' }]
      );
      return;
    }

    if (currentPassword.length < 6) {
      console.log('Password too short');
      Alert.alert(
        t('error') || 'Error',
        t('passwordTooShort') || 'Password must be at least 6 characters long.',
        [{ text: t('ok') || 'OK' }]
      );
      return;
    }

    // ตรวจสอบการยืนยันรหัสผ่าน
    if (!confirmPassword.trim()) {
      console.log('Confirm password is empty');
      Alert.alert(
        t('error') || 'Error',
        t('pleaseConfirmPassword') || 'Please confirm your password.',
        [{ text: t('ok') || 'OK' }]
      );
      return;
    }

    if (currentPassword !== confirmPassword) {
      console.log('Passwords do not match');
      Alert.alert(
        t('error') || 'Error',
        t('passwordsDoNotMatch') || 'Passwords do not match. Please try again.',
        [{ text: t('ok') || 'OK' }]
      );
      return;
    }

    console.log('All validations passed, showing confirmation dialog');
    // แสดง confirmation dialog สุดท้าย
    Alert.alert(
      t('deleteAccountConfirm') || 'Delete Account',
      `${t('deleteAccountWarning') || 'This action cannot be undone. All your data will be permanently deleted.'}\n\n${t('passwordConfirmationRequired') || 'Your password will be verified before deletion.'}`,
      [
        {
          text: t('cancel') || 'Cancel',
          style: 'cancel'
        },
        {
          text: t('deleteAccount') || 'Delete Account',
          style: 'destructive',
          onPress: () => performAccountDeletion()
        }
      ]
    );
  };

  const performAccountDeletion = async () => {
    setIsDeleting(true);
    try {
      const token = await SecureStore.getItemAsync('userToken');
      
      const response = await axios.post(
        `${ipAddress}/delete-account`,
        {
          password: currentPassword
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        Alert.alert(
          t('accountDeleted') || 'Account Deleted',
          t('accountDeletedSuccess') || 'Your account has been successfully deleted.',
          [
            {
              text: t('ok') || 'OK',
              onPress: async () => {
                // ลบ token และ logout
                await SecureStore.deleteItemAsync('userToken');
                logout();
              }
            }
          ],
          { cancelable: false }
        );
      } else {
        // จัดการกับข้อผิดพลาดต่างๆ
        const errorMessage = response.data.message;
        if (errorMessage && errorMessage.includes('password')) {
          Alert.alert(
            t('error') || 'Error',
            t('incorrectPassword') || 'Incorrect password. Please try again.',
            [{ text: t('ok') || 'OK' }]
          );
        } else {
          Alert.alert(
            t('error') || 'Error',
            errorMessage || t('deleteAccountFailed') || 'Failed to delete account. Please try again.',
            [{ text: t('ok') || 'OK' }]
          );
        }
      }
    } catch (error) {
      console.error('Delete account error:', error);
      Alert.alert(
        t('error') || 'Error',
        t('networkError') || 'Network error. Please check your connection and try again.',
        [{ text: t('ok') || 'OK' }]
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#FD501E" />
      
      {/* Premium Header - เหมือนหน้าอื่นๆ ทุกประการ */}
      <Animated.View 
        style={[
          styles.headerContainer,
          {
            opacity: 1,
            transform: [{ translateY: 0 }],
          },
        ]}
      >
        <LinearGradient
          colors={['#FD501E', '#FF6B40', '#FD501E']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <SafeAreaView style={styles.safeAreaHeader}>
            <View style={styles.headerContent}>
              {/* Back Button - Top Left */}
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => navigation.goBack()}
                activeOpacity={0.8}
              >
                <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              
              <Text style={styles.headerTitle}>{t('deleteAccount') || 'Delete Account'}</Text>
              <Text style={styles.headerSubtitle}>{t('dangerZone') || 'Danger Zone'}</Text>
              
              {/* Floating decorative elements */}
              <Animated.View 
                style={[
                  styles.floatingDecor,
                  { transform: [{ rotate: spinInterpolate }] }
                ]}
              >
                <MaterialCommunityIcons name="alert-circle" size={20} color="rgba(255,255,255,0.4)" />
              </Animated.View>
              
              <Animated.View 
                style={[
                  styles.floatingDecor2,
                  { transform: [{ rotate: spinInterpolate }] }
                ]}
              >
                <MaterialCommunityIcons name="delete-alert" size={16} color="rgba(255,255,255,0.3)" />
              </Animated.View>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </Animated.View>

      <ScrollView 
        style={[styles.scrollContainer, styles.scrollViewWithMargin]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
        {/* Warning Section */}
        <View style={styles.warningSection}>
          <MaterialCommunityIcons name="alert-circle" size={48} color="#EF4444" />
          <Text style={styles.warningTitle}>
            {t('dangerZone') || 'Danger Zone'}
          </Text>
          <Text style={styles.warningText}>
            {t('deleteAccountDescription') || 'Once you delete your account, there is no going back. Please be certain.'}
          </Text>
        </View>

        {/* What will be deleted */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>
            {t('whatWillBeDeleted') || 'What will be deleted:'}
          </Text>
          <View style={styles.infoList}>
            <Text style={styles.infoItem}>• {t('personalInformation') || 'Personal information'}</Text>
            <Text style={styles.infoItem}>• {t('bookingHistory') || 'Booking history'}</Text>
            <Text style={styles.infoItem}>• {t('paymentMethods') || 'Payment methods'}</Text>
            <Text style={styles.infoItem}>• {t('preferences') || 'Preferences and settings'}</Text>
            <Text style={styles.infoItem}>• {t('allAccountData') || 'All other account data'}</Text>
          </View>
        </View>

        {/* Password Input */}
        <View style={styles.passwordSection}>
          <Text style={styles.passwordLabel}>
            {t('enterCurrentPassword') || 'Enter your current password:'}
          </Text>
          <View style={styles.passwordInputContainer}>
            <TextInput
              style={styles.passwordInput}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder={t('password') || 'Password'}
              placeholderTextColor="#9CA3AF"
              secureTextEntry={!showCurrentPassword}
            />
            <TouchableOpacity
              onPress={() => setShowCurrentPassword(!showCurrentPassword)}
              style={styles.eyeButton}
            >
              <MaterialIcons 
                name={showCurrentPassword ? "visibility-off" : "visibility"} 
                size={20} 
                color="#6B7280" 
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Confirm Password Input */}
        <View style={styles.passwordSection}>
          <Text style={styles.passwordLabel}>
            {t('confirmPassword') || 'Confirm your password:'}
          </Text>
          <View style={styles.passwordInputContainer}>
            <TextInput
              style={styles.passwordInput}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder={t('confirmPassword') || 'Confirm Password'}
              placeholderTextColor="#9CA3AF"
              secureTextEntry={!showConfirmPassword}
            />
            <TouchableOpacity
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              style={styles.eyeButton}
            >
              <MaterialIcons 
                name={showConfirmPassword ? "visibility-off" : "visibility"} 
                size={20} 
                color="#6B7280" 
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Delete Button */}
        <TouchableOpacity
          style={[
            styles.deleteButton,
            isButtonDisabled && styles.deleteButtonDisabled
          ]}
          onPress={handleDeleteAccount}
          disabled={isButtonDisabled}
        >
          {isDeleting ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <MaterialIcons name="delete-forever" size={20} color="#FFFFFF" />
              <Text style={styles.deleteButtonText}>
                {t('deleteMyAccount') || 'Delete My Account'}
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* Contact Support */}
        <View style={styles.supportSection}>
          <Text style={styles.supportText}>
            {t('needHelp') || 'Need help? Contact our support team:'}
          </Text>
          <TouchableOpacity onPress={handleEmailSupport} activeOpacity={0.7}>
            <Text style={styles.supportEmail}>support@thetrago.com</Text>
          </TouchableOpacity>
        </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: hp('10%'), // เพิ่ม padding ล่างให้มากขึ้น
  },
  // Premium Header Styles - เหมือนหน้าอื่นๆ ทุกประการ
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 2,
  },
  headerGradient: {
    paddingTop: 0,
    paddingBottom: 40,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
    shadowColor: '#FD501E',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  safeAreaHeader: {
    paddingTop: Platform.OS === 'android' ? 40 : 0,
  },
  headerContent: {
    alignItems: 'center',
    position: 'relative',
    zIndex: 3,
  },
  backButton: {
    position: 'absolute',
    top: 15,
    left: 0,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 6,
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  headerSubtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.95)',
    textAlign: 'center',
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  floatingDecor: {
    position: 'absolute',
    top: -10,
    right: 20,
    opacity: 0.4,
  },
  floatingDecor2: {
    position: 'absolute',
    bottom: -5,
    left: 30,
    opacity: 0.3,
  },
  scrollViewWithMargin: {
    marginTop: 140, // เพิ่มระยะห่างเพื่อไม่ให้ทับกับ header
    flex: 1,
  },
  content: {
    paddingHorizontal: wp('4%'),
    paddingTop: hp('2%'),
    paddingBottom: hp('5%'), // เพิ่ม padding ล่าง
    minHeight: '100%', // ให้เนื้อหามีความสูงขั้นต่ำ
  },
  warningSection: {
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: wp('4%'),
    padding: wp('6%'),
    marginBottom: hp('3%'),
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  warningTitle: {
    fontSize: wp('5%'),
    fontWeight: 'bold',
    color: '#EF4444',
    marginTop: hp('1%'),
    marginBottom: hp('1%'),
  },
  warningText: {
    fontSize: wp('3.5%'),
    color: '#7F1D1D',
    textAlign: 'center',
    lineHeight: wp('5%'),
  },
  infoSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: wp('3%'),
    padding: wp('4%'),
    marginBottom: hp('3%'),
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  infoTitle: {
    fontSize: wp('4%'),
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: hp('1.5%'),
  },
  infoList: {
    marginLeft: wp('2%'),
  },
  infoItem: {
    fontSize: wp('3.5%'),
    color: '#4B5563',
    marginBottom: hp('0.5%'),
    lineHeight: wp('5%'),
  },
  confirmationSection: {
    marginBottom: hp('3%'),
  },
  confirmationLabel: {
    fontSize: wp('4%'),
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: hp('1%'),
  },
  confirmationInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: wp('3%'),
    padding: wp('4%'),
    fontSize: wp('4%'),
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  passwordSection: {
    marginBottom: hp('4%'),
  },
  passwordLabel: {
    fontSize: wp('4%'),
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: hp('1%'),
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: wp('3%'),
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  passwordInput: {
    flex: 1,
    padding: wp('4%'),
    fontSize: wp('4%'),
  },
  eyeButton: {
    padding: wp('4%'),
  },
  deleteButton: {
    backgroundColor: '#EF4444',
    borderRadius: wp('3%'),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: wp('4%'),
    marginTop: hp('2%'),
    marginBottom: hp('3%'),
    minHeight: hp('6%'),
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  deleteButtonDisabled: {
    backgroundColor: '#9CA3AF',
    shadowColor: '#9CA3AF',
    shadowOpacity: 0.1,
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: wp('4%'),
    fontWeight: 'bold',
    marginLeft: wp('2%'),
  },
  supportSection: {
    alignItems: 'center',
    paddingTop: hp('2%'),
  },
  supportText: {
    fontSize: wp('3.5%'),
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: hp('1%'),
  },
  supportEmail: {
    fontSize: wp('3.5%'),
    color: '#FD501E',
    fontWeight: '600',
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});

export default DeleteProfileScreen;
