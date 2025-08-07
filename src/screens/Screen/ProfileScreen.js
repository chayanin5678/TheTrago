import React, { useEffect, useState, useRef } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Modal, FlatList, KeyboardAvoidingView, SafeAreaView, StatusBar, Animated, Easing, Dimensions, Alert, Platform } from 'react-native';
import { Entypo, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';
import ipAddress from "../../config/ipconfig";
import Icon from 'react-native-vector-icons/FontAwesome';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useCustomer } from './CustomerContext.js';
import { LinearGradient } from 'expo-linear-gradient';
import { useLanguage } from './LanguageContext';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');


const ProfileScreen = ({ navigation }) => {
  const { language, t } = useLanguage();
  const { customerData, updateCustomerData } = useCustomer();
  const insets = useSafeAreaInsets();
  const [Firstname, setFirstname] = useState('');
  const [Lastname, setLastname] = useState('');
  const [tel, setTel] = useState('');
  const [email, setEmail] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [searchQueryCountry, setSearchQueryCountry] = useState('');
  const [isCountryModalVisible, setIsCountryModalVisible] = useState(false);
  const [isTeleModalVisible, setIsTeleModalVisible] = useState(false);
  const [telePhone, setTelePhone] = useState([]);
  const [countrycode, setCountrycode] = useState('');
  const [errors, setErrors] = useState({});

  const [selectedTele, setSelectedTele] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [countryId, setCountryId] = useState('');
  const [birthdate, setBirthdate] = useState(null);
  const [showPicker, setShowPicker] = useState(false);
  const [countryName, setCountryName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isPassportVerified, setIsPassportVerified] = useState(false);
  const [isBankVerified, setIsBankVerified] = useState(false);

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Ultra Premium Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  
  // Floating particles animation
  const floatingAnims = useRef(
    [...Array(6)].map(() => ({
      x: new Animated.Value(Math.random() * screenWidth - screenWidth/2), // Center around screen
      y: new Animated.Value(Math.random() * screenHeight * 0.8),
      opacity: new Animated.Value(0.1),
      scale: new Animated.Value(1),
    }))
  ).current;

  // Card staggered animations
  const cardAnims = useRef(
    [...Array(3)].map(() => ({
      opacity: new Animated.Value(0),
      translateY: new Animated.Value(30),
      scale: new Animated.Value(0.9),
    }))
  ).current;



  const formatDate = (dateString) => {
    if (!dateString || isNaN(new Date(dateString))) {
      return t('selectBirthday');
    }

    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date);
  };

  // Premium animations initialization
  useEffect(() => {
    // Premium entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        delay: 300,
        easing: Easing.bezier(0.175, 0.885, 0.32, 1.275),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1200,
        delay: 500,
        easing: Easing.bezier(0.68, -0.55, 0.265, 1.55),
        useNativeDriver: true,
      }),
    ]).start();

    // Floating particles animation
    floatingAnims.forEach((anim, index) => {
      const animateParticle = () => {
        Animated.loop(
          Animated.parallel([
            Animated.sequence([
              Animated.timing(anim.y, {
                toValue: -50,
                duration: 4000 + index * 400,
                easing: Easing.inOut(Easing.sin),
                useNativeDriver: true,
              }),
              Animated.timing(anim.y, {
                toValue: screenHeight * 0.8,
                duration: 0,
                useNativeDriver: true,
              }),
            ]),
            Animated.sequence([
              Animated.timing(anim.opacity, {
                toValue: 0.3,
                duration: 2000,
                useNativeDriver: true,
              }),
              Animated.timing(anim.opacity, {
                toValue: 0.1,
                duration: 2000,
                useNativeDriver: true,
              }),
            ]),
            Animated.loop(
              Animated.sequence([
                Animated.timing(anim.scale, {
                  toValue: 1.2,
                  duration: 2500,
                  easing: Easing.inOut(Easing.sin),
                  useNativeDriver: true,
                }),
                Animated.timing(anim.scale, {
                  toValue: 0.8,
                  duration: 2500,
                  easing: Easing.inOut(Easing.sin),
                  useNativeDriver: true,
                }),
              ])
            ),
          ])
        ).start();
      };
      
      setTimeout(() => animateParticle(), index * 500);
    });

    // Card staggered animations
    cardAnims.forEach((anim, index) => {
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(anim.opacity, {
            toValue: 1,
            duration: 700,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(anim.translateY, {
            toValue: 0,
            duration: 900,
            easing: Easing.bezier(0.175, 0.885, 0.32, 1.275),
            useNativeDriver: true,
          }),
          Animated.timing(anim.scale, {
            toValue: 1,
            duration: 800,
            easing: Easing.bezier(0.68, -0.55, 0.265, 1.55),
            useNativeDriver: true,
          }),
        ]).start();
      }, index * 200 + 800);
    });

    // Continuous pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Continuous rotation for decorative elements
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 20000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });



  const handleConfirm = (event, selectedDate) => {
    setShowPicker(false);
    if (selectedDate) {
      const formatted = selectedDate.toISOString().split('T')[0]; // YYYY-MM-DD
      setBirthdate(formatted);
    }
  };


  useEffect(() => {

    const fetchData = async () => {
      const storedToken = await SecureStore.getItemAsync('userToken');
      try {
        const response = await fetch(`${ipAddress}/profile`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${storedToken}`, // ส่ง Token ใน Authorization header
            'Content-Type': 'application/json', // ระบุประเภทของข้อมูลที่ส่ง (ถ้าจำเป็น)
          },
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();

        if (data && Array.isArray(data.data)) {
          setFirstname(data.data[0].md_member_fname);
          setLastname(data.data[0].md_member_lname);
          setTel(data.data[0].md_member_phone);
          setEmail(data.data[0].md_member_email);
          if (data.data[0].md_member_code) {
            getCountryByCode(data.data[0].md_member_code);

            setCountrycode(data.data[0].md_member_code);

          } else {
            setSelectedTele(t('pleaseSelect'));
          }
          if (data.data[0].md_member_nationality) {
            getCountryByid(data.data[0].md_member_nationality);

            setCountryId(data.data[0].md_member_nationality);

          } else {
            setSelectedCountry(t('pleaseSelect'));
          }
          if (data.data[0].md_member_birthday) {
            setBirthdate(data.data[0].md_member_birthday);
          } else {
            setBirthdate(t('selectBirthday'));
          }

          updateCustomerData ({
            Firstname : data.data[0].md_member_fname,
            Lastname : data.data[0].md_member_lname,
            tel : data.data[0].md_member_phone,
            email : data.data[0].md_member_email,
            birthdate : data.data[0].md_member_birthday,
            country : data.data[0].md_member_nationality ,
            selectcoountrycode : data.data[0].md_member_code
          });

        } else {
          console.error('Data is not an array', data);
          setUser([]);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);  // ตั้งค่า loading เป็น false หลังจากทำงานเสร็จ
      }
    };    fetchData();
    checkPassportStatus();
    checkBankStatus();

  }, []);

  // Add focus listener to refresh bank status when returning from BankVerificationScreen
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // Refresh bank status when screen comes into focus
      checkBankStatus();
    });

    return unsubscribe;
  }, [navigation]);

  const getCountryByCode = async (code) => {
    try {
      const response = await fetch(`${ipAddress}/membercountry`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ countrycode: code }),
      });

      const json = await response.json();

      if (response.ok) {
        console.log('Country data:', json.data);
        setSelectedTele(`(+${json.data[0].sys_countries_telephone}) ${json.data[0].sys_countries_nameeng}`);

        setCountrycode(json.data[0].sys_countries_telephone);

        return json.data;
      } else {
        console.warn('Not found or error:', json.message);
        return null;
      }
    } catch (error) {
      console.error('Error fetching country:', error);
      return null;
    }
  };

  const getCountryByid = async (id) => {
    try {
      const response = await fetch(`${ipAddress}/membercountryname`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ countryid: id }),
      });

      const json = await response.json();

      if (response.ok) {
        console.log('Country data:', json.data);
        setSelectedCountry(`${json.data[0].sys_countries_nameeng}`);
        setCountryId(json.data[0].sys_countries_id);

        return json.data;
      } else {
        console.warn('Not found or error:', json.message);
        return null;
      }
    } catch (error) {
      console.error('Error fetching country:', error);
      return null;
    }
  };

  const checkPassportStatus = async () => {
    try {
      const storedToken = await SecureStore.getItemAsync('userToken');
      
      if (!storedToken) {
        console.warn('No token found');
        return;
      }

      const response = await fetch(`${ipAddress}/passport-info`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${storedToken}`,
          'Content-Type': 'application/json',
        },
      });

      const json = await response.json();

      if (response.ok && json.status === 'success') {
        const { has_passport, has_document } = json.data;
        // Set passport as verified if user has both passport number and document
        setIsPassportVerified(has_passport && has_document);
      } else {
        console.warn('Passport check failed:', json.message);
        setIsPassportVerified(false);
      }
    } catch (error) {
      console.error('Error checking passport status:', error);
      setIsPassportVerified(false);
    }
  };

  const checkBankStatus = async () => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      
      if (!token) {
        console.warn('No token found for bank check');
        return;
      }

      const response = await fetch(`${ipAddress}/bankbook-info`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.warn('Failed to check bank status:', response.status);
        return;
      }

      const json = await response.json();
      
      if (json.status === 'success' && json.data) {
        const { has_bank_id, has_account_name, has_account_number, has_document } = json.data;
        // Set bank as verified if user has all required bank information
        setIsBankVerified(has_bank_id && has_account_name && has_account_number && has_document);
      } else {
        console.warn('Bank check failed:', json.message);
        setIsBankVerified(false);
      }
    } catch (error) {
      console.error('Error checking bank status:', error);
      setIsBankVerified(false);
    }
  };

  const toggleTeleModal = () => setIsTeleModalVisible(!isTeleModalVisible);
  const toggleCountryModal = () => setIsCountryModalVisible(!isCountryModalVisible);

  const handleSelectTele = (item) => {
    const selectedValue =
      item.sys_countries_nameeng === 'Please Select'
        ? t('pleaseSelect')
        : `(+${item.sys_countries_telephone}) ${item.sys_countries_nameeng}`; // แสดงแค่ชื่อประเทศ

    setSelectedTele(selectedValue);
    setCountryName(item.sys_countries_nameeng);
    let country_code = item.sys_countries_telephone;
    setCountrycode(country_code); // ใช้ตอนส่งออก
    setErrors((prev) => ({ ...prev, selectedTele: false }));
    toggleTeleModal();
  };

  const handleSelectCountry = (item) => {
    const selectedValue =
      item.sys_countries_nameeng === 'Please Select'
        ? t('pleaseSelect')
        : `${item.sys_countries_nameeng}`; // แสดงแค่ชื่อประเทศ

    setSelectedCountry(selectedValue);
    let country_id = item.sys_countries_id;
    setCountryId(country_id);
    //  setCountryName(item.sys_countries_nameeng); // ใช้ตอนส่งออก
    setErrors((prev) => ({ ...prev, selectedCountry: false })); 

    toggleCountryModal();
  };



  const filteredTelePhones = telePhone.filter((item) => {
    const searchText = `(+${item.sys_countries_telephone}) ${item.sys_countries_nameeng}`.toLowerCase();
    return searchText.includes(searchQuery.toLowerCase());
  });


  const filteredCountry = telePhone.filter((item) => {
    const searchText = `${item.sys_countries_nameeng}`.toLowerCase();
    return searchText.includes(searchQueryCountry.toLowerCase());
  });

  useEffect(() => {
    fetch(`${ipAddress}/telephone`)
      .then((response) => response.json())
      .then((data) => {
        if (data && Array.isArray(data.data)) {
          // เพิ่ม "Please Select" ที่ด้านบนของรายการ
          const countryList = [
            {
              sys_countries_telephone: '',
              sys_countries_nameeng: 'Please Select',
              sys_countries_code: ''
            },
            ...data.data
          ];
          setTelePhone(countryList);
        } else {
          console.error('Data is not an array', data);
          setTelePhone([]);
        }
      })
      .catch((error) => console.error('Error fetching data:', error));
  }, []);

  const handleSave = async () => {
    try {
      const token = await SecureStore.getItemAsync('userToken');

      if (!token) {
        alert(t('userTokenNotFound'));
        return;
      }

      const response = await fetch(`${ipAddress}/update-profile`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fname: Firstname,
          lname: Lastname,
          phone: tel,
          code: countrycode,
          birthday: birthdate,
          nationality: countryId,
        }),
      });

      const json = await response.json();

      if (json.status === 'success') {
        alert("✅ " + t('profileUpdatedSuccess'));

        // รวมอัปเดตไว้ใน object เดียว
        updateCustomerData({
          Firstname: Firstname,
          Lastname: Lastname,
          tel: tel,
          selectcoountrycode: `(+${countrycode}) ${countryName}` || t('pleaseSelect'),
          birthdate: birthdate,
          country: countryName || t('pleaseSelect'),
        });

      } else {
        alert("❌ " + t('updateFailed') + ": " + json.message);
      }

    } catch (error) {
      console.error("handleSave error:", error);
      alert("⚠️ " + t('errorOccurred'));
    }
  };

  // เพิ่ม function สำหรับเปลี่ยนรหัสผ่าน
  const handleChangePassword = async () => {
    // ตรวจสอบว่ากรอกข้อมูลครบถ้วน
    if (!currentPassword || !newPassword || !confirmPassword) {
      alert(t('fillAllPasswordFields'));
      return;
    }

    // ตรวจสอบว่ารหัสผ่านใหม่ตรงกัน
    if (newPassword !== confirmPassword) {
      alert(t('passwordMismatch'));
      return;
    }

    // ตรวจสอบความยาวรหัสผ่านใหม่
    if (newPassword.length < 6) {
      alert(t('passwordTooShort'));
      return;
    }

    try {
      const token = await SecureStore.getItemAsync('userToken');

      if (!token) {
        alert(t('userTokenNotFound'));
        return;
      }

      const response = await fetch(`${ipAddress}/change-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: currentPassword,
          newPassword: newPassword,
        }),
      });

      const json = await response.json();

      if (json.status === 'success') {
        alert(t('passwordChangedSuccess'));
        // เคลียร์ข้อมูลในฟอร์ม
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setShowCurrentPassword(false);
        setShowNewPassword(false);
        setShowConfirmPassword(false);
      } else {
        alert("❌ " + json.message);
      }

    } catch (error) {
      console.error("handleChangePassword error:", error);
      alert(t('passwordChangeError'));
    }
  };



  const isEmailVerified = !!customerData.email;

  const isProfileVerified =
    customerData.Firstname &&
    customerData.Lastname &&
    customerData.tel &&
    customerData.email &&
    customerData.birthdate &&
    customerData.country &&
    customerData.selectcoountrycode;

  // สมมุติยังไม่เชื่อม ID และ Bank Status
  const isIdVerified = isPassportVerified;

  const verifiedCount = [
    isEmailVerified,
    isProfileVerified,
    isIdVerified,
    isBankVerified
  ].filter(Boolean).length;

  const progressPercent = (verifiedCount / 4) * 100;


  if (isLoading) {
    // Premium Skeleton Loader UI
    return (
      <View style={styles.containerPremium}>
        <StatusBar barStyle="light-content" backgroundColor="#FD501E" />
        
        {/* Floating Particles Background */}
        <View style={styles.particlesContainer}>
          {floatingAnims.map((anim, index) => (
            <Animated.View
              key={index}
              style={[
                styles.floatingParticle,
                {
                  transform: [
                    { translateX: anim.x },
                    { translateY: anim.y },
                    { scale: anim.scale },
                  ],
                  opacity: anim.opacity,
                },
              ]}
            />
          ))}
        </View>

        {/* Premium Header - Full Screen */}
        <View style={styles.headerContainer}>
          <LinearGradient
            colors={['#FD501E', '#FF6B40', '#FD501E']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerGradient}
          >
            <SafeAreaView style={styles.safeAreaHeader}>
              <View style={styles.headerTopRow}>
                <TouchableOpacity 
                  style={styles.backButton}
                  onPress={() => navigation.goBack()}
                >
                  <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.headerContent}>
                <Text style={styles.headerTitle}>{t('profileSettings')}</Text>
                <Text style={styles.headerSubtitle}>{t('completeProfile')}</Text>
                
                {/* Floating decorative elements */}
                <Animated.View 
                  style={[
                    styles.floatingDecor,
                    { transform: [{ rotate: spin }] }
                  ]}
                >
                  <MaterialCommunityIcons name="account-star" size={20} color="rgba(255,255,255,0.3)" />
                </Animated.View>
              </View>
            </SafeAreaView>
          </LinearGradient>
        </View>

        <ScrollView style={[styles.scrollViewPremium, styles.scrollViewWithMargin]}>
          <View style={styles.contentContainer}>
            {/* Skeleton for Progress Card */}
            <Animated.View style={[styles.progressCardPremium, { opacity: 0.7 }]}>  
              <View style={[styles.skeletonPremium, { width: 200, height: 24, marginBottom: 15 }]} />
              <View style={[styles.skeletonPremium, { width: '100%', height: 12, marginBottom: 12, borderRadius: 6 }]} />
              <View style={[styles.skeletonPremium, { width: 280, height: 16, marginBottom: 15 }]} />
              <View style={{ gap: 8 }}>
                {[1,2,3,4].map((_,i) => (
                  <View key={i} style={[styles.skeletonPremium, { width: 180, height: 18, marginBottom: 6 }]} />
                ))}
              </View>
            </Animated.View>
            
            {/* Skeleton for Form Cards */}
            {[1,2].map((_, index) => (
              <Animated.View key={index} style={[styles.formCardPremium, { opacity: 0.7, marginBottom: 25 }]}>  
                <View style={[styles.skeletonPremium, { width: 160, height: 22, marginBottom: 20 }]} />
                {[1,2,3,4,5,6].map((_,i) => (
                  <View key={i} style={[styles.skeletonPremium, { width: '100%', height: 48, marginBottom: 16, borderRadius: 12 }]} />
                ))}
                <View style={[styles.skeletonPremium, { width: 120, height: 48, borderRadius: 12 }]} />
              </Animated.View>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.containerPremium}>
      <StatusBar barStyle="light-content" backgroundColor="#FD501E" />
      
      {/* Floating Particles Background */}
      <View style={styles.particlesContainer}>
        {floatingAnims.map((anim, index) => (
          <Animated.View
            key={index}
            style={[
              styles.floatingParticle,
              {
                transform: [
                  { translateX: anim.x },
                  { translateY: anim.y },
                  { scale: anim.scale },
                ],
                opacity: anim.opacity,
              },
            ]}
          />
        ))}
      </View>

      {/* Premium Header - Full Screen */}
      <Animated.View
        style={[
          styles.headerContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
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
            <View style={styles.headerTopRow}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => navigation.goBack()}
                activeOpacity={0.8}
              >
                <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>{t('profileSettings')}</Text>
              <Text style={styles.headerSubtitle}>{t('completePremiumProfile')}</Text>
              
              {/* Floating decorative elements */}
              <Animated.View 
                style={[
                  styles.floatingDecor,
                  { transform: [{ rotate: spin }] }
                ]}
              >
                <MaterialCommunityIcons name="account-star" size={20} color="rgba(255,255,255,0.3)" />
              </Animated.View>
              
              <Animated.View 
                style={[
                  styles.floatingDecor2,
                  { transform: [{ rotate: spin }] }
                ]}
              >
                <MaterialCommunityIcons name="star-four-points" size={16} color="rgba(255,255,255,0.2)" />
              </Animated.View>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </Animated.View>

      <KeyboardAvoidingView
        behavior="padding"
        style={{ flex: 1 }}
      >
        <ScrollView 
          style={[styles.scrollViewPremium, styles.scrollViewWithMargin]}
          showsVerticalScrollIndicator={false}
          bounces={true}
        >
          <View style={styles.contentContainer}>
            {/* Premium Profile Progress Card */}
            <Animated.View
              style={[
                styles.progressCardPremium,
                {
                  opacity: cardAnims[0]?.opacity || 1,
                  transform: [
                    { translateY: cardAnims[0]?.translateY || 0 },
                    { scale: cardAnims[0]?.scale || 1 },
                  ],
                },
              ]}
            >
              <LinearGradient
                colors={['rgba(253, 80, 30, 0.1)', 'rgba(255, 107, 64, 0.05)']}
                style={styles.progressGradient}
              >
                <View style={styles.progressHeader}>
                  <MaterialCommunityIcons name="account-check" size={24} color="#FD501E" />
                  <Text style={styles.titlePremium}>{t('completeYourProfile')}</Text>
                </View>
                
                <View style={styles.progressBarBackgroundPremium}>
                  <Animated.View 
                    style={[
                      styles.progressBarFillPremium, 
                      { 
                        width: `${progressPercent}%`,
                        transform: [{ scale: pulseAnim }]
                      }
                    ]} 
                  />
                </View>

                <Text style={styles.infoTextPremium}>
                  {t('getBestBooking')}
                </Text>
                
                <View style={styles.verificationListPremium}>
                  {[
                    { label: t('verifiedEmail'), verified: isEmailVerified },
                    { label: t('verifiedProfile'), verified: isProfileVerified },
                    { label: t('verifiedId'), verified: isIdVerified, nav: 'IDCardCameraScreen' },
                    { label: t('verifiedBankAccount'), verified: isBankVerified, nav: 'BankVerificationScreen' }
                  ].map((item, index) => (
                    <TouchableOpacity 
                      key={index}
                      style={styles.verificationItem}
                      onPress={() => {
                        if (item.nav === 'IDCardCameraScreen') {
                          // Check if profile is verified before allowing ID verification
                          if (!isProfileVerified) {
                            Alert.alert(
                              t('pleaseUpdateProfile'),
                              t('profileNotComplete'),
                              [
                                { text: 'OK', style: 'default' }
                              ]
                            );
                            return;
                          }
                        }
                        
                        if (item.nav === 'BankVerificationScreen') {
                          // Check if profile is verified before allowing bank verification
                          if (!isProfileVerified) {
                            Alert.alert(
                              t('pleaseUpdateProfile'),
                              t('profileIncompleteBank'),
                              [
                                { text: 'OK', style: 'default' }
                              ]
                            );
                            return;
                          }
                        }
                        
                        item.nav && navigation.navigate(item.nav);
                      }}
                      activeOpacity={item.nav ? 0.7 : 1}
                    >
                      <View style={[styles.verificationIcon, item.verified ? styles.verifiedIcon : styles.unverifiedIcon]}>
                        <MaterialIcons 
                          name={item.verified ? "check" : "close"} 
                          size={16} 
                          color={item.verified ? "#22C55E" : "#EF4444"} 
                        />
                      </View>
                      <Text style={item.verified ? styles.verifiedPremium : styles.unverifiedPremium}>
                        {item.label}
                      </Text>
                      {item.nav && (
                        <MaterialIcons name="chevron-right" size={16} color="#9CA3AF" />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </LinearGradient>
            </Animated.View>

            {/* Premium Personal Information Form */}
            <Animated.View
              style={[
                styles.formCardPremium,
                {
                  opacity: cardAnims[1]?.opacity || 1,
                  transform: [
                    { translateY: cardAnims[1]?.translateY || 0 },
                    { scale: cardAnims[1]?.scale || 1 },
                  ],
                },
              ]}
            >
              <View style={styles.sectionHeaderPremium}>
                <MaterialCommunityIcons name="account-edit" size={24} color="#FD501E" />
                <Text style={styles.sectionTitlePremium}>{t('personalInformation')}</Text>
              </View>
              
              <View style={styles.inputRowPremium}>
                <View style={styles.inputWrapperPremium}>
                  <Text style={styles.inputLabelPremium}>{t('firstName')}</Text>
                  <TextInput 
                    style={styles.inputPremium} 
                    placeholder={t('enterFirstName')} 
                    value={Firstname}
                    onChangeText={setFirstname}
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
                <View style={styles.inputWrapperPremium}>
                  <Text style={styles.inputLabelPremium}>{t('lastName')}</Text>
                  <TextInput 
                    style={styles.inputPremium} 
                    placeholder={t('enterLastName')} 
                    value={Lastname}
                    onChangeText={setLastname}
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>

              <View style={styles.inputWrapperPremium}>
                <Text style={styles.inputLabelPremium}>{t('countryCode')}</Text>
                <TouchableOpacity
                  style={[styles.buttonPremium, errors.selectedTele && styles.errorInputPremium]}
                  onPress={toggleTeleModal}
                  activeOpacity={0.8}
                >
                  <Text style={styles.buttonTextPremium}>{selectedTele}</Text>
                  <MaterialIcons name="expand-more" size={20} color="#FD501E" />
                </TouchableOpacity>
              </View>

              <View style={styles.inputWrapperPremium}>
                <Text style={styles.inputLabelPremium}>{t('phoneNumber')}</Text>
                <TextInput
                  style={styles.inputPremium}
                  placeholder={t('enterPhoneNumber')}
                  value={tel}
                  onChangeText={setTel}
                  keyboardType="numeric"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.inputWrapperPremium}>
                <Text style={styles.inputLabelPremium}>{t('emailAddress')}</Text>
                <TextInput 
                  style={[styles.inputPremium, styles.disabledPremium]} 
                  placeholder={t('emailAddress')} 
                  value={email} 
                  editable={false}
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.inputWrapperPremium}>
                <Text style={styles.inputLabelPremium}>{t('nationality')}</Text>
                <TouchableOpacity
                  style={[styles.buttonPremium, errors.selectedCountry && styles.errorInputPremium]}
                  onPress={toggleCountryModal}
                  activeOpacity={0.8}
                >
                  <Text style={styles.buttonTextPremium}>{selectedCountry}</Text>
                  <MaterialIcons name="expand-more" size={20} color="#FD501E" />
                </TouchableOpacity>
              </View>

              <View style={styles.inputWrapperPremium}>
                <Text style={styles.inputLabelPremium}>{t('dateOfBirth')}</Text>
                <TouchableOpacity
                  style={styles.buttonPremium}
                  onPress={() => setShowPicker(true)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.buttonTextPremium}>
                    {birthdate ? formatDate(birthdate) : t('selectBirthday')}
                  </Text>
                  <MaterialIcons name="calendar-today" size={20} color="#FD501E" />
                </TouchableOpacity>
              </View>

              {showPicker && (
                <DateTimePicker
                  value={birthdate ? new Date(birthdate) : new Date(2000, 0, 1)}
                  mode="date"
                  display="default"
                  onChange={handleConfirm}
                  maximumDate={new Date()}
                  style={{ width: '100%', alignItems: 'center' }}
                />
              )}
              
              <TouchableOpacity 
                style={styles.saveButtonPremium} 
                onPress={handleSave}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#FD501E', '#FF6B40']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.saveGradient}
                >
                  <MaterialIcons name="save" size={20} color="#FFFFFF" />
                  <Text style={styles.saveButtonTextPremium}>{t('saveProfile')}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>

            {/* Premium Change Password Form */}
            <Animated.View
              style={[
                styles.formCardPremium,
                {
                  opacity: cardAnims[2]?.opacity || 1,
                  transform: [
                    { translateY: cardAnims[2]?.translateY || 0 },
                    { scale: cardAnims[2]?.scale || 1 },
                  ],
                },
              ]}
            >
              <View style={styles.sectionHeaderPremium}>
                <MaterialCommunityIcons name="lock-reset" size={24} color="#FD501E" />
                <Text style={styles.sectionTitlePremium}>{t('changePassword')}</Text>
              </View>
              
              <View style={styles.inputWrapperPremium}>
                <Text style={styles.inputLabelPremium}>{t('currentPassword')}</Text>
                <View style={styles.passwordFieldPremium}>
                  <TextInput 
                    style={styles.inputFlexPremium} 
                    placeholder={t('enterCurrentPassword')} 
                    secureTextEntry={!showCurrentPassword}
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    placeholderTextColor="#9CA3AF"
                  />
                  <TouchableOpacity 
                    onPress={() => setShowCurrentPassword((prev) => !prev)}
                    style={styles.eyeButtonPremium}
                  >
                    <Entypo name={showCurrentPassword ? "eye" : "eye-with-line"} size={20} color="#9CA3AF" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputWrapperPremium}>
                <Text style={styles.inputLabelPremium}>{t('newPassword')}</Text>
                <View style={styles.passwordFieldPremium}>
                  <TextInput 
                    style={styles.inputFlexPremium} 
                    placeholder={t('enterNewPassword')} 
                    secureTextEntry={!showNewPassword}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    placeholderTextColor="#9CA3AF"
                  />
                  <TouchableOpacity 
                    onPress={() => setShowNewPassword((prev) => !prev)}
                    style={styles.eyeButtonPremium}
                  >
                    <Entypo name={showNewPassword ? "eye" : "eye-with-line"} size={20} color="#9CA3AF" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputWrapperPremium}>
                <Text style={styles.inputLabelPremium}>{t('confirmPassword')}</Text>
                <View style={styles.passwordFieldPremium}>
                  <TextInput 
                    style={styles.inputFlexPremium} 
                    placeholder={t('confirmNewPassword')} 
                    secureTextEntry={!showConfirmPassword}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholderTextColor="#9CA3AF"
                  />
                  <TouchableOpacity 
                    onPress={() => setShowConfirmPassword((prev) => !prev)}
                    style={styles.eyeButtonPremium}
                  >
                    <Entypo name={showConfirmPassword ? "eye" : "eye-with-line"} size={20} color="#9CA3AF" />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity 
                style={styles.saveButtonPremium} 
                onPress={handleChangePassword}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#FD501E', '#FF6B40']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.saveGradient}
                >
                  <MaterialIcons name="lock" size={20} color="#FFFFFF" />
                  <Text style={styles.saveButtonTextPremium}>{t('changePassword')}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Premium Modals */}
      <Modal visible={isTeleModalVisible} transparent animationType="fade" onRequestClose={toggleTeleModal}>
        <View style={styles.modalOverlayPremium}>
          <Animated.View style={[styles.modalContentPremium, { transform: [{ scale: scaleAnim }] }]}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.95)', 'rgba(248, 250, 252, 0.95)']}
              style={styles.modalGradient}
            >
              <View style={styles.modalHeaderPremium}>
                <Text style={styles.modalTitlePremium}>{t('selectCountryCode')}</Text>
                <TouchableOpacity onPress={toggleTeleModal} style={styles.closeButtonPremium}>
                  <MaterialIcons name="close" size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>
              
              <TextInput
                placeholder={t('searchCountry')}
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={styles.searchInputPremium}
                placeholderTextColor="#9CA3AF"
                autoComplete="off"
                autoCorrect={false}
                autoCapitalize="none"
              />
              
              <FlatList
                data={filteredTelePhones}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={styles.optionItemPremium} 
                    onPress={() => handleSelectTele(item)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.optionTextPremium}>
                      {item.sys_countries_nameeng === 'Please Select'
                        ? t('pleaseSelect')
                        : `(+${item.sys_countries_telephone}) ${item.sys_countries_nameeng}`}
                    </Text>
                  </TouchableOpacity>
                )}
                keyExtractor={(item, index) => index.toString()}
                showsVerticalScrollIndicator={false}
              />
            </LinearGradient>
          </Animated.View>
        </View>
      </Modal>

      <Modal visible={isCountryModalVisible} transparent animationType="fade" onRequestClose={toggleCountryModal}>
        <View style={styles.modalOverlayPremium}>
          <Animated.View style={[styles.modalContentPremium, { transform: [{ scale: scaleAnim }] }]}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.95)', 'rgba(248, 250, 252, 0.95)']}
              style={styles.modalGradient}
            >
              <View style={styles.modalHeaderPremium}>
                <Text style={styles.modalTitlePremium}>{t('selectNationality')}</Text>
                <TouchableOpacity onPress={toggleCountryModal} style={styles.closeButtonPremium}>
                  <MaterialIcons name="close" size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>
              
              <TextInput
                placeholder={t('searchCountry')}
                value={searchQueryCountry}
                onChangeText={setSearchQueryCountry}
                style={styles.searchInputPremium}
                placeholderTextColor="#9CA3AF"
                autoComplete="off"
                autoCorrect={false}
                autoCapitalize="none"
              />
              
              <FlatList
                data={filteredCountry}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={styles.optionItemPremium} 
                    onPress={() => handleSelectCountry(item)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.optionTextPremium}>
                      {item.sys_countries_nameeng === 'Please Select'
                        ? t('pleaseSelect')
                        : `${item.sys_countries_nameeng}`}
                    </Text>
                  </TouchableOpacity>
                )}
                keyExtractor={(item, index) => index.toString()}
                showsVerticalScrollIndicator={false}
              />
            </LinearGradient>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}
const styles = StyleSheet.create({
  // Ultra Premium Container
  containerPremium: {
    flex: 1,
    backgroundColor: 'linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 100%)',
  },

  // Floating Particles
  particlesContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 20,
    zIndex: 0,
    pointerEvents: 'none',
  },
  floatingParticle: {
    position: 'absolute',
    width: 8,
    height: 8,
    backgroundColor: '#FD501E',
    borderRadius: 4,
    opacity: 0.1,
  },

  // Premium Header
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 2,
  },
  headerGradient: {
    paddingTop: 0,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#FD501E',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  safeAreaHeader: {
    paddingTop: 0,
  },
  headerTopRow: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 0,
    paddingTop: 0,
    position: 'relative',
    marginTop: Platform.OS === 'android' ? -20 : -50,
    height: 56,
  },
  headerContent: {
    alignItems: 'center',
    position: 'relative',
    zIndex: 3,
  },
  backButton: {
    position: 'absolute',
    left: 0,
  top: Platform.OS === 'android' ? 60 : 60,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  headerSubtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
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

  // Premium Content
  scrollViewPremium: {
    flex: 1,
    zIndex: 1,
  },
  scrollViewWithMargin: {
    marginTop: 140, // เพิ่มระยะห่างเพื่อไม่ให้ทับกับ header
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 100,
  },

  // Progress Card Premium
  progressCardPremium: {
    marginBottom: 25,
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: '#FD501E',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
  },
  progressGradient: {
    padding: 25,
    borderRadius: 25,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  titlePremium: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1F2937',
    marginLeft: 10,
    letterSpacing: 0.3,
  },
  progressBarBackgroundPremium: {
    height: 12,
    backgroundColor: 'rgba(253, 80, 30, 0.1)',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 15,
    shadowColor: '#FD501E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  progressBarFillPremium: {
    height: '100%',
    backgroundColor: '#FD501E',
    borderRadius: 6,
    shadowColor: '#FD501E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  infoTextPremium: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
    fontWeight: '500',
    lineHeight: 20,
  },
  verificationListPremium: {
    gap: 12,
  },
  verificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    padding: 15,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  verificationIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  verifiedIcon: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
  },
  unverifiedIcon: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  verifiedPremium: {
    fontSize: 15,
    color: '#22C55E',
    fontWeight: '600',
    flex: 1,
    letterSpacing: 0.2,
  },
  unverifiedPremium: {
    fontSize: 15,
    color: '#EF4444',
    fontWeight: '600',
    flex: 1,
    letterSpacing: 0.2,
  },

  // Form Card Premium
  formCardPremium: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 25,
    padding: 25,
    marginBottom: 25,
    shadowColor: '#FD501E',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(253, 80, 30, 0.1)',
    backdropFilter: 'blur(20px)',
  },
  sectionHeaderPremium: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },
  sectionTitlePremium: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1F2937',
    marginLeft: 12,
    letterSpacing: 0.3,
  },

  // Input Premium
  inputRowPremium: {
    flexDirection: 'row',
    gap: 15,
  },
  inputWrapperPremium: {
    flex: 1,
    marginBottom: 20,
  },
  inputLabelPremium: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  inputPremium: {
    borderWidth: 1,
    borderColor: 'rgba(209, 213, 219, 0.8)',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 15,
    borderRadius: 15,
    fontSize: 16,
    color: '#1F2937',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    fontWeight: '500',
  },
  disabledPremium: {
    backgroundColor: 'rgba(243, 244, 246, 0.8)',
    color: '#9CA3AF',
  },

  // Button Premium
  buttonPremium: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: 'rgba(209, 213, 219, 0.8)',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  buttonTextPremium: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
    flex: 1,
  },
  errorInputPremium: {
    borderColor: '#EF4444',
    shadowColor: '#EF4444',
  },

  // Password Field Premium
  passwordFieldPremium: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(209, 213, 219, 0.8)',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  inputFlexPremium: {
    flex: 1,
    paddingVertical: 15,
    paddingLeft: 15,
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
  eyeButtonPremium: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },

  // Save Button Premium
  saveButtonPremium: {
    marginTop: 10,
    borderRadius: 18,
    shadowColor: '#FD501E',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    overflow: 'hidden',
  },
  saveGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 25,
  },
  saveButtonTextPremium: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 10,
    letterSpacing: 0.5,
  },

  // Modal Premium
  modalOverlayPremium: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContentPremium: {
    width: '100%',
    maxHeight: '70%',
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
  },
  modalGradient: {
    padding: 0,
  },
  modalHeaderPremium: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(229, 231, 235, 0.5)',
  },
  modalTitlePremium: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    letterSpacing: 0.3,
  },
  closeButtonPremium: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(107, 114, 128, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchInputPremium: {
    margin: 20,
    marginTop: 15,
    marginBottom: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(209, 213, 219, 0.8)',
    borderRadius: 15,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  optionItemPremium: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(229, 231, 235, 0.3)',
  },
  optionTextPremium: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },

  // Skeleton Premium
  skeletonPremium: {
    backgroundColor: 'rgba(229, 231, 235, 0.6)',
    borderRadius: 8,
    marginBottom: 8,
  },

  // Legacy styles (keeping for backward compatibility)
  container: {
    padding: 16,
    backgroundColor: '#fff',
  },
  progressCard: {
    backgroundColor: '#fff7f1',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 8,
  },
  progressBarBackground: {
    height: 10,
    backgroundColor: '#ddd',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    width: '50%',
    height: '100%',
    backgroundColor: 'mediumseagreen',
  },
  infoText: {
    fontSize: 12,
    color: '#666',
    marginVertical: 8,
  },
  verificationList: {
    gap: 6,
  },
  verified: {
    fontSize: 14,
    color: 'green',
  },
  unverified: {
    fontSize: 14,
    color: 'orangered',
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  sectionTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  disabled: {
    backgroundColor: '#eee',
  },
  saveButton: {
    backgroundColor: '#ff6b1c',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  passwordField: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 12,
  },
  inputFlex: {
    flex: 1,
    paddingVertical: 10,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 8,
    width: '100%',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  errorInput: {
    borderColor: 'red',
  },
  icon: {
    marginLeft: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContentPre: {
    backgroundColor: '#FFF',
    width: '80%',
    borderRadius: 10,
    padding: 15,
  },
  modalContent: {
    backgroundColor: '#FFF',
    width: '80%',
    height: '40%',
    borderRadius: 10,
    padding: 15,
  },
  optionItem: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  optionText: {
    fontSize: 16,
    fontclor: '#333',
  },
  textInput: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 5,
  },
  skeleton: {
    backgroundColor: '#e0e0e0',
    borderRadius: 6,
    marginBottom: 8,
  },
});

export default ProfileScreen;
