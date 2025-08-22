import React, { useEffect, useState, useRef } from "react";
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, Modal, FlatList,
  KeyboardAvoidingView, SafeAreaView, StatusBar, Animated, Easing,
  Dimensions, Alert, Platform
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

  // --- form state ---
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

  // --- safe-area / header measuring ---
  const [headerHeight, setHeaderHeight] = useState(0);
  const topPad = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : insets.top;

  // --- animations ---
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const headerAnim = useRef(new Animated.Value(-120)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const floatingAnims = useRef(
    [...Array(6)].map(() => ({
      x: new Animated.Value(Math.random() * screenWidth - screenWidth / 2),
      y: new Animated.Value(Math.random() * screenHeight * 0.8),
      opacity: new Animated.Value(0.1),
      scale: new Animated.Value(1),
    }))
  ).current;

  const cardAnims = useRef(
    [...Array(3)].map(() => ({
      opacity: new Animated.Value(0),
      translateY: new Animated.Value(30),
      scale: new Animated.Value(0.9),
    }))
  ).current;

  useEffect(() => {
    // Entrance
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 1000, easing: Easing.bezier(0.25, 0.46, 0.45, 0.94), useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 800, delay: 300, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 1200, delay: 500, easing: Easing.bezier(0.68, -0.55, 0.265, 1.55), useNativeDriver: true }),
      Animated.timing(headerAnim, { toValue: 0, duration: 1200, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    ]).start();

    // Particles
    floatingAnims.forEach((anim, index) => {
      const animateParticle = () => {
        Animated.loop(
          Animated.parallel([
            Animated.sequence([
              Animated.timing(anim.y, { toValue: -50, duration: 4000 + index * 400, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
              Animated.timing(anim.y, { toValue: screenHeight * 0.8, duration: 0, useNativeDriver: true }),
            ]),
            Animated.sequence([
              Animated.timing(anim.opacity, { toValue: 0.3, duration: 2000, useNativeDriver: true }),
              Animated.timing(anim.opacity, { toValue: 0.1, duration: 2000, useNativeDriver: true }),
            ]),
            Animated.loop(
              Animated.sequence([
                Animated.timing(anim.scale, { toValue: 1.2, duration: 2500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
                Animated.timing(anim.scale, { toValue: 0.8, duration: 2500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
              ])
            ),
          ])
        ).start();
      };
      setTimeout(() => animateParticle(), index * 500);
    });

    // Cards
    cardAnims.forEach((anim, index) => {
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(anim.opacity, { toValue: 1, duration: 700, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
          Animated.timing(anim.translateY, { toValue: 0, duration: 900, easing: Easing.bezier(0.175, 0.885, 0.32, 1.275), useNativeDriver: true }),
          Animated.timing(anim.scale, { toValue: 1, duration: 800, easing: Easing.bezier(0.68, -0.55, 0.265, 1.55), useNativeDriver: true }),
        ]).start();
      }, index * 200 + 800);
    });

    // Pulse + rotate
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 2000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 2000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(Animated.timing(rotateAnim, { toValue: 1, duration: 20000, easing: Easing.linear, useNativeDriver: true })).start();
  }, []);

  const spin = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  const formatDate = (dateString) => {
    if (!dateString || isNaN(new Date(dateString))) return t('selectBirthday');
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
  };

  const handleConfirm = (event, selectedDate) => {
    setShowPicker(false);
    if (selectedDate) setBirthdate(selectedDate.toISOString().split('T')[0]);
  };

  // --- data loading ---
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
          const d = data.data[0];
          setFirstname(d.md_member_fname);
          setLastname(d.md_member_lname);
          setTel(d.md_member_phone);
          setEmail(d.md_member_email);

          if (d.md_member_code) { getCountryByCode(d.md_member_code); setCountrycode(d.md_member_code); } else { setSelectedTele(t('pleaseSelect')); }
          if (d.md_member_nationality) { getCountryByid(d.md_member_nationality); setCountryId(d.md_member_nationality); } else { setSelectedCountry(t('pleaseSelect')); }
          setBirthdate(d.md_member_birthday || null);

          updateCustomerData({
            Firstname: d.md_member_fname,
            Lastname: d.md_member_lname,
            tel: d.md_member_phone,
            email: d.md_member_email,
            birthdate: d.md_member_birthday,
            country: d.md_member_nationality,
            selectcoountrycode: d.md_member_code
          });
        } else {
          setFirstname(''); setLastname(''); setTel(''); setEmail('');
        }
      } catch (e) {
        console.error('Error fetching data:', e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    checkPassportStatus();
    checkBankStatus();
  }, []);

  // Refresh bank status when coming back
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => { checkBankStatus(); });
    return unsubscribe;
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
      }
      return null;
    } catch (e) { console.error(e); return null; }
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
      }
      return null;
    } catch (e) { console.error(e); return null; }
  };

  const checkPassportStatus = async () => {
    try {
      const storedToken = await SecureStore.getItemAsync('userToken');
      if (!storedToken) return;
      const response = await fetch(`${ipAddress}/passport-info`, { method: 'GET', headers: { 'Authorization': `Bearer ${storedToken}`, 'Content-Type': 'application/json' } });
      const json = await response.json();
      if (response.ok && json.status === 'success') {
        const { has_passport, has_document } = json.data;
        setIsPassportVerified(has_passport && has_document);
      } else { setIsPassportVerified(false); }
    } catch (e) { console.error(e); setIsPassportVerified(false); }
  };

  const checkBankStatus = async () => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      if (!token) return;
      const response = await fetch(`${ipAddress}/bankbook-info`, { method: 'GET', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } });
      if (!response.ok) return;
      const json = await response.json();
      if (json.status === 'success' && json.data) {
        const { has_bank_id, has_account_name, has_account_number, has_document } = json.data;
        setIsBankVerified(has_bank_id && has_account_name && has_account_number && has_document);
      } else { setIsBankVerified(false); }
    } catch (e) { console.error(e); setIsBankVerified(false); }
  };

  const toggleTeleModal = () => setIsTeleModalVisible(!isTeleModalVisible);
  const toggleCountryModal = () => setIsCountryModalVisible(!isCountryModalVisible);

  const handleSelectTele = (item) => {
    const selectedValue = item.sys_countries_nameeng === 'Please Select'
      ? t('pleaseSelect')
      : `(+${item.sys_countries_telephone}) ${item.sys_countries_nameeng}`;
    setSelectedTele(selectedValue);
    setCountryName(item.sys_countries_nameeng);
    setCountrycode(item.sys_countries_telephone);
    setErrors((prev) => ({ ...prev, selectedTele: false }));
    toggleTeleModal();
  };

  const handleSelectCountry = (item) => {
    const selectedValue = item.sys_countries_nameeng === 'Please Select' ? t('pleaseSelect') : `${item.sys_countries_nameeng}`;
    setSelectedCountry(selectedValue);
    setCountryId(item.sys_countries_id);
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
      .then((r) => r.json())
      .then((data) => {
        if (data && Array.isArray(data.data)) {
          setTelePhone([{ sys_countries_telephone: '', sys_countries_nameeng: 'Please Select', sys_countries_code: '' }, ...data.data]);
        } else {
          setTelePhone([]);
        }
      })
      .catch((e) => console.error('Error fetching telephone:', e));
  }, []);

  const handleSave = async () => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      if (!token) { alert(t('userTokenNotFound')); return; }

      const response = await fetch(`${ipAddress}/update-profile`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ fname: Firstname, lname: Lastname, phone: tel, code: countrycode, birthday: birthdate, nationality: countryId }),
      });
      const json = await response.json();

      if (json.status === 'success') {
        alert("✅ " + t('profileUpdatedSuccess'));
        updateCustomerData({
          Firstname,
          Lastname,
          tel,
          selectcoountrycode: `(+${countrycode}) ${countryName}` || t('pleaseSelect'),
          birthdate,
          country: countryName || t('pleaseSelect'),
        });
      } else {
        alert("❌ " + t('updateFailed') + ": " + json.message);
      }
    } catch (e) { console.error('handleSave error:', e); alert("⚠️ " + t('errorOccurred')); }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) { alert(t('fillAllPasswordFields')); return; }
    if (newPassword !== confirmPassword) { alert(t('passwordMismatch')); return; }
    if (newPassword.length < 6) { alert(t('passwordTooShort')); return; }

    try {
      const token = await SecureStore.getItemAsync('userToken');
      if (!token) { alert(t('userTokenNotFound')); return; }
      const response = await fetch(`${ipAddress}/change-password`, {
        method: 'POST', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const json = await response.json();
      if (json.status === 'success') {
        alert(t('passwordChangedSuccess'));
        setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
        setShowCurrentPassword(false); setShowNewPassword(false); setShowConfirmPassword(false);
      } else { alert("❌ " + json.message); }
    } catch (e) { console.error('handleChangePassword error:', e); alert(t('passwordChangeError')); }
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

  const isIdVerified = isPassportVerified;
  const verifiedCount = [isEmailVerified, isProfileVerified, isIdVerified, isBankVerified].filter(Boolean).length;
  const progressPercent = Math.min(100, Math.max(0, (verifiedCount / 4) * 100));

  // --- loading skeleton ---
  if (isLoading) {
    return (
      <View style={styles.containerPremium}>
        <StatusBar barStyle="light-content" backgroundColor="#FD501E" />

        {/* particles behind everything */}
        <View pointerEvents="none" style={styles.particlesContainer}>
          {floatingAnims.map((anim, idx) => (
            <Animated.View
              key={idx}
              style={[
                styles.floatingParticle,
                { transform: [{ translateX: anim.x }, { translateY: anim.y }, { scale: anim.scale }], opacity: anim.opacity }
              ]}
            />
          ))}
        </View>

        {/* header with measurement */}
        <Animated.View
          onLayout={(e) => setHeaderHeight(e.nativeEvent.layout.height)}
          style={[styles.headerContainer, { transform: [{ translateY: headerAnim }] }]}
        >
          <LinearGradient colors={['#FD501E', '#FF6B40', '#FD501E']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.headerGradient}>
            <SafeAreaView edges={['top']} style={[styles.safeAreaHeader, { paddingTop: topPad }]}>
              <View style={styles.headerTopRow}>
                <TouchableOpacity style={[styles.backButton, { top: topPad + 12 }]} onPress={() => navigation.goBack()}>
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
        </Animated.View>

        <ScrollView
          style={{ marginTop: headerHeight }}
          contentContainerStyle={{ paddingBottom: insets.bottom + 140 }}
          showsVerticalScrollIndicator={false}
          bounces
          contentInsetAdjustmentBehavior="never"
        >
          {/* simple skeleton blocks */}
          <View style={styles.contentContainer}>
            <Animated.View style={[styles.progressCardPremium, { opacity: 0.7 }]}>
              <View style={[styles.skeletonPremium, { width: 200, height: 24, marginBottom: 15 }]} />
              <View style={[styles.skeletonPremium, { width: '100%', height: 12, marginBottom: 12, borderRadius: 6 }]} />
              <View style={[styles.skeletonPremium, { width: 280, height: 16, marginBottom: 15 }]} />
              {[1, 2, 3, 4].map((i) => <View key={i} style={[styles.skeletonPremium, { width: 180, height: 18, marginBottom: 6 }]} />)}
            </Animated.View>

            {[1, 2].map((i) => (
              <Animated.View key={i} style={[styles.formCardPremium, { opacity: 0.7, marginBottom: 25 }]}>
                <View style={[styles.skeletonPremium, { width: 160, height: 22, marginBottom: 20 }]} />
                {[1, 2, 3, 4, 5, 6].map((j) => <View key={j} style={[styles.skeletonPremium, { width: '100%', height: 48, marginBottom: 16, borderRadius: 12 }]} />)}
                <View style={[styles.skeletonPremium, { width: 120, height: 48, borderRadius: 12 }]} />
              </Animated.View>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  }

  // --- main UI ---
  return (
    <View style={styles.containerPremium}>
      <StatusBar barStyle="light-content" backgroundColor="#FD501E" />

      {/* particles */}
      <View pointerEvents="none" style={styles.particlesContainer}>
        {floatingAnims.map((anim, idx) => (
          <Animated.View
            key={idx}
            style={[
              styles.floatingParticle,
              { transform: [{ translateX: anim.x }, { translateY: anim.y }, { scale: anim.scale }], opacity: anim.opacity }
            ]}
          />
        ))}
      </View>

      {/* header */}
      <Animated.View
        onLayout={(e) => setHeaderHeight(e.nativeEvent.layout.height)}
        style={[styles.headerContainer, { transform: [{ translateY: headerAnim }] }]}
      >
        <LinearGradient colors={['#FD501E', '#FF6B40', '#FD501E']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.headerGradient}>
          <SafeAreaView edges={['top']} style={[styles.safeAreaHeader, { paddingTop: topPad }]}>
            <View style={styles.headerTopRow}>
              <TouchableOpacity
                style={[styles.backButton, { top: topPad + 12 }]}
                onPress={() => navigation.goBack()}
                activeOpacity={0.8}
              >
                <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>{t('profileSettings')}</Text>
              <Text style={styles.headerSubtitle}>{t('completePremiumProfile')}</Text>

              <Animated.View style={[styles.floatingDecor, { transform: [{ rotate: spin }] }]}>
                <MaterialCommunityIcons name="account-star" size={20} color="rgba(255,255,255,0.3)" />
              </Animated.View>
              <Animated.View style={[styles.floatingDecor2, { transform: [{ rotate: spin }] }]}>
                <MaterialCommunityIcons name="star-four-points" size={16} color="rgba(255,255,255,0.2)" />
              </Animated.View>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </Animated.View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={headerHeight} style={{ flex: 1 }}>
        <ScrollView
          style={{ marginTop: headerHeight }}
          contentContainerStyle={{ paddingBottom: insets.bottom + 140 }}
          showsVerticalScrollIndicator={false}
          bounces
          contentInsetAdjustmentBehavior="never"
          removeClippedSubviews={false}
        >
          <View style={styles.contentContainer}>
            {/* progress */}
            <Animated.View
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
                  <Animated.View
                    style={[styles.progressBarFillPremium, { width: `${progressPercent}%`, transform: [{ scale: pulseAnim }] }]}
                  />
                </View>

                <Text style={styles.infoTextPremium}>{t('getBestBooking')}</Text>

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
                        if ((item.nav === 'IDCardCameraScreen' || item.nav === 'BankVerificationScreen') && !isProfileVerified) {
                          Alert.alert(t('pleaseUpdateProfile'), item.nav === 'IDCardCameraScreen' ? t('profileNotComplete') : t('profileIncompleteBank'), [{ text: 'OK' }]);
                          return;
                        }
                        item.nav && navigation.navigate(item.nav);
                      }}
                      activeOpacity={item.nav ? 0.7 : 1}
                    >
                      <View style={[styles.verificationIcon, item.verified ? styles.verifiedIcon : styles.unverifiedIcon]}>
                        <MaterialIcons name={item.verified ? 'check' : 'close'} size={16} color={item.verified ? '#22C55E' : '#EF4444'} />
                      </View>
                      <Text style={item.verified ? styles.verifiedPremium : styles.unverifiedPremium}>{item.label}</Text>
                      {item.nav && <MaterialIcons name="chevron-right" size={16} color="#9CA3AF" />}
                    </TouchableOpacity>
                  ))}
                </View>
              </LinearGradient>
            </Animated.View>

            {/* form */}
            <Animated.View
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

            {/* change password */}
            <Animated.View
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
                  <TouchableOpacity onPress={() => setShowCurrentPassword((p) => !p)} style={styles.eyeButtonPremium}>
                    <Entypo name={showCurrentPassword ? 'eye' : 'eye-with-line'} size={20} color="#9CA3AF" />
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
                  <TouchableOpacity onPress={() => setShowNewPassword((p) => !p)} style={styles.eyeButtonPremium}>
                    <Entypo name={showNewPassword ? 'eye' : 'eye-with-line'} size={20} color="#9CA3AF" />
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
                  <TouchableOpacity onPress={() => setShowConfirmPassword((p) => !p)} style={styles.eyeButtonPremium}>
                    <Entypo name={showConfirmPassword ? 'eye' : 'eye-with-line'} size={20} color="#9CA3AF" />
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

      {/* --- Modals --- */}
      <Modal visible={isTeleModalVisible} transparent animationType="fade" onRequestClose={toggleTeleModal}>
        <View style={styles.modalOverlayPremium}>
          <Animated.View style={[styles.modalContentPremium, { transform: [{ scale: scaleAnim }] }]}>
            <LinearGradient colors={['rgba(255, 255, 255, 0.95)', 'rgba(248, 250, 252, 0.95)']} style={[styles.modalGradient, { paddingBottom: insets.bottom + 12 }]}>
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
                  <TouchableOpacity style={styles.optionItemPremium} onPress={() => handleSelectTele(item)} activeOpacity={0.7}>
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
            <LinearGradient colors={['rgba(255, 255, 255, 0.95)', 'rgba(248, 250, 252, 0.95)']} style={[styles.modalGradient, { paddingBottom: insets.bottom + 12 }]}>
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
                  <TouchableOpacity style={styles.optionItemPremium} onPress={() => handleSelectCountry(item)} activeOpacity={0.7}>
                    <Text style={styles.optionTextPremium}>
                      {item.sys_countries_nameeng === 'Please Select' ? t('pleaseSelect') : `${item.sys_countries_nameeng}`}
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
};

export default ProfileScreen;
