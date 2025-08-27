import React, { useEffect, useState, useRef, useMemo } from "react";
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, Modal, FlatList,
  KeyboardAvoidingView, SafeAreaView, StatusBar, Animated, Easing, Dimensions,
  Alert, Platform, InteractionManager
} from 'react-native';
import { Entypo, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';
import ipAddress from "../../config/ipconfig";
import DateTimePicker from '@react-native-community/datetimepicker';
import { useCustomer } from './CustomerContext.js';
import { LinearGradient } from 'expo-linear-gradient';
import { useLanguage } from './LanguageContext';
import { styles } from '../../styles/CSS/ProfileScreenStyles';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const ProfileScreen = ({ navigation }) => {
  const { t } = useLanguage();
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

  // === Smooth Animations (Contact-style) ===
  const fadeAnim   = useRef(new Animated.Value(0)).current;
  const scaleAnim  = useRef(new Animated.Value(0.98)).current;
  const headerAnim = useRef(new Animated.Value(-100)).current;

  // Clocks
  const particleClock = useRef(new Animated.Value(0)).current;
  const pulseClock    = useRef(new Animated.Value(0)).current;
  const rotateAnim    = useRef(new Animated.Value(0)).current;

  // Cards
  const cardAnims = useRef(
    Array.from({ length: 3 }, () => ({
      opacity:    new Animated.Value(0),
      translateY: new Animated.Value(24),
      scale:      new Animated.Value(0.98),
    }))
  ).current;

  // Particles driven by one clock
  const PARTICLE_COUNT = 4;
  const particles = useMemo(() => {
    return Array.from({ length: PARTICLE_COUNT }, (_, i) => {
      const phase = i / PARTICLE_COUNT;
      const t = Animated.modulo(Animated.add(particleClock, phase), 1);

      const x = t.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [-40 + i * 8, 40 - i * 8, -40 + i * 8],
        extrapolate: 'clamp',
      });
      const y = t.interpolate({
        inputRange: [0, 1],
        outputRange: [screenHeight * 0.8 + i * 30, -80],
        extrapolate: 'clamp',
      });
      const opacity = t.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0.08, 0.22, 0.08],
      });
      const scale = t.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0.9, 1.12, 0.9],
      });
      return { x, y, opacity, scale };
    });
  }, [particleClock]);

  const pulseScale = pulseClock.interpolate({ inputRange: [0, 1], outputRange: [1, 1.05] });
  const spin = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  useEffect(() => {
    InteractionManager.runAfterInteractions(() => {
      // Entrance: ชะลอ header ให้ไม่ลงมาเร็ว
      Animated.parallel([
        Animated.timing(fadeAnim,   { toValue: 1, duration: 700,  easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(headerAnim, { toValue: 0, duration: 1200, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.spring(scaleAnim,  { toValue: 1, tension: 80, friction: 12, useNativeDriver: true }),
      ]).start();

      // clocks
      Animated.loop(
        Animated.timing(particleClock, { toValue: 1, duration: 16000, easing: Easing.linear, useNativeDriver: true })
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseClock, { toValue: 1, duration: 1600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(pulseClock, { toValue: 0, duration: 1600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ])
      ).start();

      Animated.loop(
        Animated.timing(rotateAnim, { toValue: 1, duration: 20000, easing: Easing.linear, useNativeDriver: true })
      ).start();

      // Cards: stagger นุ่มขึ้น
      Animated.stagger(
        180,
        cardAnims.map(a =>
          Animated.parallel([
            Animated.timing(a.opacity,    { toValue: 1, duration: 520, useNativeDriver: true }),
            Animated.timing(a.translateY, { toValue: 0, duration: 720, easing: Easing.out(Easing.back(1.25)), useNativeDriver: true }),
            Animated.spring(a.scale,      { toValue: 1, tension: 80, friction: 12, useNativeDriver: true }),
          ])
        )
      ).start();
    });
  }, []);

  const formatDate = (dateString) => {
    if (!dateString || isNaN(new Date(dateString))) return t('selectBirthday');
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
  };

  const handleConfirm = (event, selectedDate) => {
    setShowPicker(false);
    if (selectedDate) setBirthdate(selectedDate.toISOString().split('T')[0]);
  };

  // ===== data fetching =====
  useEffect(() => {
    const fetchData = async () => {
      const storedToken = await SecureStore.getItemAsync('userToken');
      try {
        const response = await fetch(`${ipAddress}/profile`, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${storedToken}`, 'Content-Type': 'application/json' },
        });
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();

        if (data && Array.isArray(data.data)) {
          setFirstname(data.data[0].md_member_fname);
          setLastname(data.data[0].md_member_lname);
          setTel(data.data[0].md_member_phone);
          setEmail(data.data[0].md_member_email);

          if (data.data[0].md_member_code) {
            getCountryByCode(data.data[0].md_member_code);
            setCountrycode(data.data[0].md_member_code);
          } else setSelectedTele(t('pleaseSelect'));

          if (data.data[0].md_member_nationality) {
            getCountryByid(data.data[0].md_member_nationality);
            setCountryId(data.data[0].md_member_nationality);
          } else setSelectedCountry(t('pleaseSelect'));

          if (data.data[0].md_member_birthday) setBirthdate(data.data[0].md_member_birthday);
          else setBirthdate(t('selectBirthday'));

          updateCustomerData ({
            Firstname : data.data[0].md_member_fname,
            Lastname : data.data[0].md_member_lname,
            tel : data.data[0].md_member_phone,
            email : data.data[0].md_member_email,
            birthdate : data.data[0].md_member_birthday,
            country : data.data[0].md_member_nationality ,
            selectcoountrycode : data.data[0].md_member_code
          });
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
    checkPassportStatus();
    checkBankStatus();
  }, []);

  useEffect(() => {
    const unsub = navigation.addListener('focus', () => { checkBankStatus(); });
    return unsub;
  }, [navigation]);

  const getCountryByCode = async (code) => {
    try {
      const response = await fetch(`${ipAddress}/membercountry`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ countrycode: code }),
      });
      const json = await response.json();
      if (response.ok) {
        setSelectedTele(`(+${json.data[0].sys_countries_telephone}) ${json.data[0].sys_countries_nameeng}`);
        setCountrycode(json.data[0].sys_countries_telephone);
        return json.data;
      } else return null;
    } catch { return null; }
  };

  const getCountryByid = async (id) => {
    try {
      const response = await fetch(`${ipAddress}/membercountryname`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ countryid: id }),
      });
      const json = await response.json();
      if (response.ok) {
        setSelectedCountry(`${json.data[0].sys_countries_nameeng}`);
        setCountryId(json.data[0].sys_countries_id);
        return json.data;
      } else return null;
    } catch { return null; }
  };

  const checkPassportStatus = async () => {
    try {
      const storedToken = await SecureStore.getItemAsync('userToken');
      if (!storedToken) return;
      const response = await fetch(`${ipAddress}/passport-info`, {
        method: 'GET', headers: { 'Authorization': `Bearer ${storedToken}`, 'Content-Type': 'application/json' },
      });
      const json = await response.json();
      if (response.ok && json.status === 'success') {
        const { has_passport, has_document } = json.data;
        setIsPassportVerified(has_passport && has_document);
      } else setIsPassportVerified(false);
    } catch { setIsPassportVerified(false); }
  };

  const checkBankStatus = async () => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      if (!token) return;
      const response = await fetch(`${ipAddress}/bankbook-info`, {
        method: 'GET', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (!response.ok) return;
      const json = await response.json();
      if (json.status === 'success' && json.data) {
        const { has_bank_id, has_account_name, has_account_number, has_document } = json.data;
        setIsBankVerified(has_bank_id && has_account_name && has_account_number && has_document);
      } else setIsBankVerified(false);
    } catch { setIsBankVerified(false); }
  };

  const toggleTeleModal = () => setIsTeleModalVisible(v => !v);
  const toggleCountryModal = () => setIsCountryModalVisible(v => !v);

  const handleSelectTele = (item) => {
    const selectedValue = item.sys_countries_nameeng === 'Please Select'
      ? t('pleaseSelect') : `(+${item.sys_countries_telephone}) ${item.sys_countries_nameeng}`;
    setSelectedTele(selectedValue);
    setCountryName(item.sys_countries_nameeng);
    setCountrycode(item.sys_countries_telephone);
    setErrors(prev => ({ ...prev, selectedTele: false }));
    toggleTeleModal();
  };

  const handleSelectCountry = (item) => {
    const selectedValue = item.sys_countries_nameeng === 'Please Select' ? t('pleaseSelect') : `${item.sys_countries_nameeng}`;
    setSelectedCountry(selectedValue);
    setCountryId(item.sys_countries_id);
    setErrors(prev => ({ ...prev, selectedCountry: false }));
    toggleCountryModal();
  };

  const filteredTelePhones = useMemo(() => {
    return telePhone.filter(item =>
      `(+${item.sys_countries_telephone}) ${item.sys_countries_nameeng}`.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [telePhone, searchQuery]);

  const filteredCountry = useMemo(() => {
    return telePhone.filter(item =>
      `${item.sys_countries_nameeng}`.toLowerCase().includes(searchQueryCountry.toLowerCase())
    );
  }, [telePhone, searchQueryCountry]);

  useEffect(() => {
    fetch(`${ipAddress}/telephone`)
      .then((r) => r.json())
      .then((data) => {
        if (data && Array.isArray(data.data)) {
          setTelePhone([{ sys_countries_telephone: '', sys_countries_nameeng: 'Please Select', sys_countries_code: '' }, ...data.data]);
        } else {
          setTelePhone([]);
        }
      })
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      if (!token) { alert(t('userTokenNotFound')); return; }

      const response = await fetch(`${ipAddress}/update-profile`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fname: Firstname, lname: Lastname, phone: tel, code: countrycode, birthday: birthdate, nationality: countryId,
        }),
      });
      const json = await response.json();

      if (json.status === 'success') {
        alert("✅ " + t('profileUpdatedSuccess'));
        updateCustomerData({
          Firstname, Lastname, tel,
          selectcoountrycode: `(+${countrycode}) ${countryName}` || t('pleaseSelect'),
          birthdate, country: countryName || t('pleaseSelect'),
        });
      } else {
        alert("❌ " + t('updateFailed') + ": " + json.message);
      }
    } catch (error) {
      console.error("handleSave error:", error);
      alert("⚠️ " + t('errorOccurred'));
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) { alert(t('fillAllPasswordFields')); return; }
    if (newPassword !== confirmPassword) { alert(t('passwordMismatch')); return; }
    if (newPassword.length < 6) { alert(t('passwordTooShort')); return; }

    try {
      const token = await SecureStore.getItemAsync('userToken');
      if (!token) { alert(t('userTokenNotFound')); return; }

      const response = await fetch(`${ipAddress}/change-password`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const json = await response.json();
      if (json.status === 'success') {
        alert(t('passwordChangedSuccess'));
        setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
        setShowCurrentPassword(false); setShowNewPassword(false); setShowConfirmPassword(false);
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
    customerData.Firstname && customerData.Lastname && customerData.tel &&
    customerData.email && customerData.birthdate && customerData.country && customerData.selectcoountrycode;

  const isIdVerified = isPassportVerified;
  const verifiedCount = [isEmailVerified, isProfileVerified, isIdVerified, isBankVerified].filter(Boolean).length;
  const progressPercent = (verifiedCount / 4) * 100;

  if (isLoading) {
    return (
      <View style={styles.containerPremium}>
        <StatusBar barStyle="light-content" backgroundColor="#FD501E" />
        <View style={styles.particlesContainer} pointerEvents="none">
          {particles.map((p, i) => (
            <Animated.View key={i} style={[styles.floatingParticle, { transform: [{ translateX: p.x }, { translateY: p.y }, { scale: p.scale }], opacity: p.opacity }]} />
          ))}
        </View>

        <View style={styles.headerContainer}>
          <LinearGradient colors={['#FD501E', '#FF6B40', '#FD501E']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.headerGradient}>
            <SafeAreaView style={styles.safeAreaHeader}>
              <View style={styles.headerTopRow}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                  <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
              <View style={styles.headerContent}>
                <Text style={styles.headerTitle}>{t('profileSettings')}</Text>
                <Text style={styles.headerSubtitle}>{t('completeProfile')}</Text>
                <Animated.View style={[styles.floatingDecor, { transform: [{ rotate: spin }] }]}>
                  <MaterialCommunityIcons name="account-star" size={20} color="rgba(255,255,255,0.3)" />
                </Animated.View>
              </View>
            </SafeAreaView>
          </LinearGradient>
        </View>

        {/* skeleton content ของคุณ */}
      </View>
    );
  }

  return (
    <View style={styles.containerPremium}>
      <StatusBar barStyle="light-content" backgroundColor="#FD501E" />

      {/* Particles */}
      <View style={styles.particlesContainer} pointerEvents="none">
        {particles.map((p, i) => (
          <Animated.View
            key={i}
            pointerEvents="none"
            style={[styles.floatingParticle, { transform: [{ translateX: p.x }, { translateY: p.y }, { scale: p.scale }], opacity: p.opacity }]}
          />
        ))}
      </View>

      {/* Header */}
      <Animated.View
        renderToHardwareTextureAndroid
        shouldRasterizeIOS
        style={[styles.headerContainer, { opacity: fadeAnim, transform: [{ translateY: headerAnim }] }]}
      >
        <LinearGradient colors={['#FD501E', '#FF6B40', '#FD501E']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.headerGradient}>
          <SafeAreaView style={styles.safeAreaHeader}>
            <View style={styles.headerTopRow}>
              <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.8}>
                <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>{t('profileSettings')}</Text>
              <Text style={styles.headerSubtitle}>{t('completePremiumProfile')}</Text>

              <Animated.View style={[styles.floatingDecor,  { transform: [{ rotate: spin }] }]}>
                <MaterialCommunityIcons name="account-star" size={20} color="rgba(255,255,255,0.3)" />
              </Animated.View>
              <Animated.View style={[styles.floatingDecor2, { transform: [{ rotate: spin }] }]}>
                <MaterialCommunityIcons name="star-four-points" size={16} color="rgba(255,255,255,0.2)" />
              </Animated.View>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </Animated.View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView style={[styles.scrollViewPremium, styles.scrollViewWithMargin]} showsVerticalScrollIndicator={false} bounces>
          <View style={styles.contentContainer}>
            {/* Progress */}
            <Animated.View
              renderToHardwareTextureAndroid
              shouldRasterizeIOS
              style={[
                styles.progressCardPremium,
                { opacity: cardAnims[0].opacity, transform: [{ translateY: cardAnims[0].translateY }, { scale: cardAnims[0].scale }] }
              ]}
            >
              <LinearGradient colors={['rgba(253, 80, 30, 0.1)', 'rgba(255, 107, 64, 0.05)']} style={styles.progressGradient}>
                <View style={styles.progressHeader}>
                  <MaterialCommunityIcons name="account-check" size={24} color="#FD501E" />
                  <Text style={styles.titlePremium}>{t('completeYourProfile')}</Text>
                </View>
                <View style={styles.progressBarBackgroundPremium}>
                  <Animated.View style={[styles.progressBarFillPremium, { width: `${progressPercent}%`, transform: [{ scale: pulseScale }] }]} />
                </View>
                <Text style={styles.infoTextPremium}>{t('getBestBooking')}</Text>

                <View style={styles.verificationListPremium}>
                  {[
                    { label: t('verifiedEmail'), verified: !!customerData.email },
                    { label: t('verifiedProfile'), verified: isProfileVerified },
                    { label: t('verifiedId'), verified: isIdVerified, nav: 'IDCardCameraScreen' },
                    { label: t('verifiedBankAccount'), verified: isBankVerified, nav: 'BankVerificationScreen' }
                  ].map((item, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.verificationItem}
                      onPress={() => {
                        if ((item.nav === 'IDCardCameraScreen' || item.nav === 'BankVerificationScreen') && !isProfileVerified) {
                          Alert.alert(t('pleaseUpdateProfile'), item.nav === 'IDCardCameraScreen' ? t('profileNotComplete') : t('profileIncompleteBank'));
                          return;
                        }
                        item.nav && navigation.navigate(item.nav);
                      }}
                      activeOpacity={item.nav ? 0.7 : 1}
                    >
                      <View style={[styles.verificationIcon, item.verified ? styles.verifiedIcon : styles.unverifiedIcon]}>
                        <MaterialIcons name={item.verified ? "check" : "close"} size={16} color={item.verified ? "#22C55E" : "#EF4444"} />
                      </View>
                      <Text style={item.verified ? styles.verifiedPremium : styles.unverifiedPremium}>{item.label}</Text>
                      {item.nav && <MaterialIcons name="chevron-right" size={16} color="#9CA3AF" />}
                    </TouchableOpacity>
                  ))}
                </View>
              </LinearGradient>
            </Animated.View>

            {/* Form */}
            <Animated.View
              renderToHardwareTextureAndroid
              shouldRasterizeIOS
              style={[
                styles.formCardPremium,
                { opacity: cardAnims[1].opacity, transform: [{ translateY: cardAnims[1].translateY }, { scale: cardAnims[1].scale }] }
              ]}
            >
              <View style={styles.sectionHeaderPremium}>
                <MaterialCommunityIcons name="account-edit" size={24} color="#FD501E" />
                <Text style={styles.sectionTitlePremium}>{t('personalInformation')}</Text>
              </View>

              <View style={styles.inputRowPremium}>
                <View style={styles.inputWrapperPremium}>
                  <Text style={styles.inputLabelPremium}>{t('firstName')}</Text>
                  <TextInput style={styles.inputPremium} placeholder={t('enterFirstName')} value={Firstname} onChangeText={setFirstname} placeholderTextColor="#9CA3AF" />
                </View>
                <View style={styles.inputWrapperPremium}>
                  <Text style={styles.inputLabelPremium}>{t('lastName')}</Text>
                  <TextInput style={styles.inputPremium} placeholder={t('enterLastName')} value={Lastname} onChangeText={setLastname} placeholderTextColor="#9CA3AF" />
                </View>
              </View>

              <View style={styles.inputWrapperPremium}>
                <Text style={styles.inputLabelPremium}>{t('countryCode')}</Text>
                <TouchableOpacity style={[styles.buttonPremium, errors.selectedTele && styles.errorInputPremium]} onPress={toggleTeleModal} activeOpacity={0.8}>
                  <Text style={styles.buttonTextPremium}>{selectedTele}</Text>
                  <MaterialIcons name="expand-more" size={20} color="#FD501E" />
                </TouchableOpacity>
              </View>

              <View style={styles.inputWrapperPremium}>
                <Text style={styles.inputLabelPremium}>{t('phoneNumber')}</Text>
                <TextInput style={styles.inputPremium} placeholder={t('enterPhoneNumber')} value={tel} onChangeText={setTel} keyboardType="numeric" placeholderTextColor="#9CA3AF" />
              </View>

              <View style={styles.inputWrapperPremium}>
                <Text style={styles.inputLabelPremium}>{t('emailAddress')}</Text>
                <TextInput style={[styles.inputPremium, styles.disabledPremium]} placeholder={t('emailAddress')} value={email} editable={false} placeholderTextColor="#9CA3AF" />
              </View>

              <View style={styles.inputWrapperPremium}>
                <Text style={styles.inputLabelPremium}>{t('nationality')}</Text>
                <TouchableOpacity style={[styles.buttonPremium, errors.selectedCountry && styles.errorInputPremium]} onPress={toggleCountryModal} activeOpacity={0.8}>
                  <Text style={styles.buttonTextPremium}>{selectedCountry}</Text>
                  <MaterialIcons name="expand-more" size={20} color="#FD501E" />
                </TouchableOpacity>
              </View>

              <View style={styles.inputWrapperPremium}>
                <Text style={styles.inputLabelPremium}>{t('dateOfBirth')}</Text>
                <TouchableOpacity style={styles.buttonPremium} onPress={() => setShowPicker(true)} activeOpacity={0.8}>
                  <Text style={styles.buttonTextPremium}>{birthdate ? formatDate(birthdate) : t('selectBirthday')}</Text>
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

              <TouchableOpacity style={styles.saveButtonPremium} onPress={handleSave} activeOpacity={0.8}>
                <LinearGradient colors={['#FD501E', '#FF6B40']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.saveGradient}>
                  <MaterialIcons name="save" size={20} color="#FFFFFF" />
                  <Text style={styles.saveButtonTextPremium}>{t('saveProfile')}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>

            {/* Change Password */}
            <Animated.View
              renderToHardwareTextureAndroid
              shouldRasterizeIOS
              style={[
                styles.formCardPremium,
                { opacity: cardAnims[2].opacity, transform: [{ translateY: cardAnims[2].translateY }, { scale: cardAnims[2].scale }] }
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
                  <TouchableOpacity onPress={() => setShowCurrentPassword(p => !p)} style={styles.eyeButtonPremium}>
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
                  <TouchableOpacity onPress={() => setShowNewPassword(p => !p)} style={styles.eyeButtonPremium}>
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
                  <TouchableOpacity onPress={() => setShowConfirmPassword(p => !p)} style={styles.eyeButtonPremium}>
                    <Entypo name={showConfirmPassword ? "eye" : "eye-with-line"} size={20} color="#9CA3AF" />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity style={styles.saveButtonPremium} onPress={handleChangePassword} activeOpacity={0.8}>
                <LinearGradient colors={['#FD501E', '#FF6B40']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.saveGradient}>
                  <MaterialIcons name="lock" size={20} color="#FFFFFF" />
                  <Text style={styles.saveButtonTextPremium}>{t('changePassword')}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modals */}
      <Modal visible={isTeleModalVisible} transparent animationType="fade" onRequestClose={toggleTeleModal}>
        <View style={styles.modalOverlayPremium}>
          <Animated.View style={[styles.modalContentPremium, { transform: [{ scale: scaleAnim }] }]}>
            <LinearGradient colors={['rgba(255, 255, 255, 0.95)', 'rgba(248, 250, 252, 0.95)']} style={styles.modalGradient}>
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
                autoComplete="off" autoCorrect={false} autoCapitalize="none"
              />
              <FlatList
                data={filteredTelePhones}
                keyExtractor={(_, i) => `tel-${i}`}
                removeClippedSubviews
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.optionItemPremium} onPress={() => handleSelectTele(item)} activeOpacity={0.7}>
                    <Text style={styles.optionTextPremium}>
                      {item.sys_countries_nameeng === 'Please Select'
                        ? t('pleaseSelect')
                        : `(+${item.sys_countries_telephone}) ${item.sys_countries_nameeng}`}
                    </Text>
                  </TouchableOpacity>
                )}
                showsVerticalScrollIndicator={false}
              />
            </LinearGradient>
          </Animated.View>
        </View>
      </Modal>

      <Modal visible={isCountryModalVisible} transparent animationType="fade" onRequestClose={toggleCountryModal}>
        <View style={styles.modalOverlayPremium}>
          <Animated.View style={[styles.modalContentPremium, { transform: [{ scale: scaleAnim }] }]}>
            <LinearGradient colors={['rgba(255, 255, 255, 0.95)', 'rgba(248, 250, 252, 0.95)']} style={styles.modalGradient}>
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
                autoComplete="off" autoCorrect={false} autoCapitalize="none"
              />
              <FlatList
                data={filteredCountry}
                keyExtractor={(_, i) => `ct-${i}`}
                removeClippedSubviews
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.optionItemPremium} onPress={() => handleSelectCountry(item)} activeOpacity={0.7}>
                    <Text style={styles.optionTextPremium}>
                      {item.sys_countries_nameeng === 'Please Select' ? t('pleaseSelect') : `${item.sys_countries_nameeng}`}
                    </Text>
                  </TouchableOpacity>
                )}
                showsVerticalScrollIndicator={false}
              />
            </LinearGradient>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
};

export default ProfileScreen;
