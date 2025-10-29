import React, { useState, useEffect, useRef, useImperativeHandle } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, FlatList, TextInput, ImageBackground, Alert, KeyboardAvoidingView, Platform, Animated, Easing, Dimensions, Linking, findNodeHandle, UIManager, InteractionManager } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LogoTheTrago from '../../components/component/Logo';
import Step from '../../components/component/Step';
import Textinput from '../../components/component/Textinput';
import ipAddress from '../../config/ipconfig';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useCustomer } from './CustomerContext';
import * as SecureStore from 'expo-secure-store';
import { useLanguage } from './LanguageContext';
import { useTabBarAutoHide } from '../../utils/useTabBarAutoHide';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import headStyles from '../../styles/CSS/StartingPointScreenStyles';
import axios from 'axios';
import { styles } from '../../styles/CSS/CustomerInfoStyles';
import tripStyles from '../../styles/CSS/TripDetailStyles';


const isTablet = screenWidth >= 768;
const isLargeTablet = screenWidth >= 1024;
const getResponsiveSize = (phone, tablet, largeTablet) => {
  if (isLargeTablet && largeTablet) return largeTablet;
  if (isTablet && tablet) return tablet;
  return phone;
};

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

/* =========================
   Title helpers (เก็บค่า EN เสมอ แต่แสดง label ตามภาษา)
   ========================= */
const getTitleOptions = (t) => ([
  { label: t('pleaseSelect') || 'Please Select', value: 'Please Select' },
  { label: t('mr') || 'Mr.', value: 'Mr.' },
  { label: t('mrs') || 'Mrs.', value: 'Mrs.' },
  { label: t('ms') || 'Ms.', value: 'Ms.' },
  { label: t('master') || 'Master', value: 'Master' },
]);

const getTitleLabel = (value, t) => {
  const opt = getTitleOptions(t).find(o => o.value === value);
  return opt ? opt.label : (t('pleaseSelect') || 'Please Select');
};

// ===== Inline PassengerForm component (ต้องอยู่ก่อน CustomerInfo) =====
const PassengerForm = React.forwardRef(({ type, index, telePhone, showAllErrors }, ref) => {
  const { t, selectedLanguage } = useLanguage();

  // ใช้ options แบบ label/value (value เป็น EN เสมอ)
  const titleOptions = getTitleOptions(t);

  // เก็บค่า EN เสมอ
  const [selectedTitle, setSelectedTitle] = React.useState('Please Select');
  const [isModalVisible, setModalVisible] = React.useState(false);
  const [selectedNationality, setSelectedNationality] = React.useState(t('pleaseSelect') || 'Please Select');
  const [isNationalityModalVisible, setNationalityModalVisible] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [fname, setFname] = React.useState('');
  const [lname, setLname] = React.useState('');
  const [passport, setPassport] = React.useState('');
  const [dateOfIssue, setDateOfIssue] = React.useState('');
  const [showDatePicker, setShowDatePicker] = React.useState(false);
  const [passportExpiry, setPassportExpiry] = React.useState('');
  const [showPassportExpiryPicker, setShowPassportExpiryPicker] = React.useState(false);
  const [birthday, setBirthday] = React.useState('');
  const [showBirthdayPicker, setShowBirthdayPicker] = React.useState(false);
  const [fieldErrors, setFieldErrors] = React.useState({});
  const [nationalityCode, setNationalityCode] = useState('');

  useImperativeHandle(ref, () => ({
    getData: () => ({
      prefix: selectedTitle, // ✅ EN เสมอ
      fname,
      lname,
      idtype: 1,
      nationality: nationalityCode,
      passport,
      dateofissue: dateOfIssue,
      passportexpiry: passportExpiry,
      birthday,
      type: type?.toLowerCase(),
    }),
    validate: () => {
      let errors = {};
      if (!selectedTitle || selectedTitle === 'Please Select') errors.selectedTitle = true; // ✅ เช็ค EN
      if (!fname || fname.trim() === '') errors.fname = true;
      if (!lname || lname.trim() === '') errors.lname = true;
      if (!selectedNationality || selectedNationality === 'Please Select' || selectedNationality === (t('pleaseSelect') || 'Please Select')) errors.nationality = true;
      if (!passport || passport.trim() === '') errors.passport = true;
      if (!dateOfIssue) errors.dateOfIssue = true;
      if (!passportExpiry) errors.passportExpiry = true;
      if (!birthday) errors.birthday = true;
      setFieldErrors(errors);
      return errors;
    },
    setFieldErrors: (errors) => {
      setFieldErrors(errors || {});
    }
  }));

  const filteredCountries = telePhone.filter((item) => {
    const eng = (item.sys_countries_nameeng || '').toLowerCase();
    const thai = (item.sys_countries_namethai || '').toLowerCase();
    const q = searchQuery.toLowerCase();
    return eng.includes(q) || thai.includes(q) || (`(+${item.sys_countries_telephone})`).includes(q);
  });

  const handleFnameChange = (text) => {
    setFname(text);
    setFieldErrors((prev) => ({ ...prev, fname: undefined }));
  };
  const handleLnameChange = (text) => {
    setLname(text);
    setFieldErrors((prev) => ({ ...prev, lname: undefined }));
  };
  const handlePassportChange = (text) => {
    setPassport(text);
    setFieldErrors((prev) => ({ ...prev, passport: undefined }));
  };
  const handleDateOfIssue = (date) => {
    setDateOfIssue(date);
    setFieldErrors((prev) => ({ ...prev, dateOfIssue: undefined }));
  };
  const handlePassportExpiry = (date) => {
    setPassportExpiry(date);
    setFieldErrors((prev) => ({ ...prev, passportExpiry: undefined }));
  };
  const handleBirthday = (date) => {
    setBirthday(date);
    setFieldErrors((prev) => ({ ...prev, birthday: undefined }));
  };

  return (
    <View style={styles.promo}>
      <Text style={styles.TextInput}>{type.charAt(0).toUpperCase() + type.slice(1)} {index + 1}</Text>

      {/* คำนำหน้า */}
      <Text style={styles.textHead}>{t('title') || 'Title'}</Text>
      <TouchableOpacity
        style={[styles.button, (fieldErrors.selectedTitle || (showAllErrors && (selectedTitle === 'Please Select'))) && styles.errorInput]}
        onPress={() => setModalVisible(true)}>
        <Text style={styles.buttonText}>{getTitleLabel(selectedTitle, t)}</Text>
        <Icon name="chevron-down" size={18} color="#FD501E" style={styles.icon} />
      </TouchableOpacity>

      {/* Modal for title selection */}
      <Modal visible={isModalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContentPre}>
            <FlatList
              data={titleOptions}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.optionItem}
                  onPress={() => { setSelectedTitle(item.value); setModalVisible(false); }} // ✅ เก็บค่า EN
                >
                  <Text style={styles.optionText}>{item.label}</Text>
                </TouchableOpacity>
              )}
              keyExtractor={(item, idx) => idx.toString()}
            />
          </View>
        </View>
      </Modal>

      {/* First Name */}
      <Text style={styles.textHead}>{t('firstName') || 'First Name'}</Text>
      <TextInput
        placeholder={t('firstName') || 'First Name'}
        value={fname}
        onChangeText={handleFnameChange}
        placeholderTextColor="#374151"
        style={[styles.input, (fieldErrors.fname || (showAllErrors && !fname)) && styles.errorInput]}
      />

      {/* Last Name */}
      <Text style={styles.textHead}>{t('lastName') || 'Last Name'}</Text>
      <TextInput
        placeholder={t('lastName') || 'Last Name'}
        value={lname}
        onChangeText={handleLnameChange}
        placeholderTextColor="#374151"
        style={[styles.input, (fieldErrors.lname || (showAllErrors && !lname)) && styles.errorInput]}
      />

      {/* Nationality */}
      <Text style={styles.textHead}>{t('nationality') || 'Nationality'}</Text>
      <TouchableOpacity
        style={[styles.button, (showAllErrors && fieldErrors.nationality) && styles.errorInput]}
        onPress={() => setNationalityModalVisible(true)}>
        <Text style={styles.buttonText}>{selectedNationality === 'Please Select' ? t('pleaseSelect') : selectedNationality}</Text>
        <Icon name="chevron-down" size={18} color={(showAllErrors && fieldErrors.nationality) ? 'red' : '#FD501E'} style={styles.icon} />
      </TouchableOpacity>
      <Modal visible={isNationalityModalVisible} transparent animationType="fade" onRequestClose={() => setNationalityModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TextInput
              placeholder={t('searchCountry') || 'Search country'}
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.textInput}
              placeholderTextColor="#374151"
            />
            <FlatList
              data={telePhone.filter((item) => {
                const searchText = `(+${item.sys_countries_telephone}) ${item.sys_countries_nameeng || ''} ${item.sys_countries_namethai || ''}`.toLowerCase();
                return searchText.includes(searchQuery.toLowerCase());
              })}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.optionItem} onPress={() => {
                  const isPlaceholder = (item.sys_countries_nameeng === 'Please Select') || (item.sys_countries_namethai === 'Please Select');
                  const displayName = selectedLanguage === 'th' && item.sys_countries_namethai ? item.sys_countries_namethai : item.sys_countries_nameeng;
                  if (isPlaceholder) {
                    setSelectedNationality('Please Select');
                    setNationalityCode('');
                  } else {
                    setSelectedNationality(`(+${item.sys_countries_telephone}) ${displayName}`);
                    setNationalityCode(item.sys_countries_code);
                    setFieldErrors((prev) => ({ ...prev, nationality: undefined }));
                  }
                  setNationalityModalVisible(false);
                  setSearchQuery('');
                }}>
                  <Text style={[styles.optionText, (item.sys_countries_nameeng === 'Please Select' || item.sys_countries_namethai === 'Please Select')]}>
                    {((item.sys_countries_nameeng === 'Please Select') || (item.sys_countries_namethai === 'Please Select'))
                      ? t('pleaseSelect')
                      : `(+${item.sys_countries_telephone}) ${selectedLanguage === 'th' && item.sys_countries_namethai ? item.sys_countries_namethai : item.sys_countries_nameeng}`}
                  </Text>
                </TouchableOpacity>
              )}
              keyExtractor={(item, idx) => idx.toString()}
              initialNumToRender={5}
              maxToRenderPerBatch={5}
              windowSize={5}
              pagingEnabled
            />
          </View>
        </View>
      </Modal>

      {/* Passport */}
      <Text style={styles.textHead}>{t('passport') || 'Passport'}</Text>
      <TextInput
        placeholder={t('passportNumber') || 'Passport Number'}
        value={passport}
        onChangeText={handlePassportChange}
        placeholderTextColor="#374151"
        style={[styles.input, (fieldErrors.passport || (showAllErrors && !passport)) && styles.errorInput]}
      />

      {/* Date of Issue */}
      <Text style={styles.textHead}>{t('dateOfIssue') || 'Date of Issue'}</Text>
      <TouchableOpacity
        style={[styles.button, (fieldErrors.dateOfIssue || (showAllErrors && !dateOfIssue)) && styles.errorInput]}
        onPress={() => setShowDatePicker(!showDatePicker)}>
        <Text style={styles.buttonText}>
          {dateOfIssue ? new Date(dateOfIssue).toLocaleDateString('en-GB') : (t('selectDate') || 'Select Date')}
        </Text>
        <Icon name="calendar" size={18} color="#FD501E" style={styles.icon} />
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={dateOfIssue ? new Date(dateOfIssue) : new Date()}
          mode="date"
          display="default"
          maximumDate={new Date()}
          onChange={(event, selectedDate) => {
            if (selectedDate) handleDateOfIssue(selectedDate.toISOString().split('T')[0]);
          }}
        />
      )}

      {/* Passport Expiry Date */}
      <Text style={styles.textHead}>{t('passportExpiryDate') || 'Passport Expiry Date'}</Text>
      <TouchableOpacity
        style={[styles.button, (fieldErrors.passportExpiry || (showAllErrors && !passportExpiry)) && styles.errorInput]}
        onPress={() => setShowPassportExpiryPicker(!showPassportExpiryPicker)}>
        <Text style={styles.buttonText}>
          {passportExpiry ? new Date(passportExpiry).toLocaleDateString('en-GB') : (t('selectDate') || 'Select Date')}
        </Text>
        <Icon name="calendar" size={18} color="#FD501E" style={styles.icon} />
      </TouchableOpacity>
      {showPassportExpiryPicker && (
        <DateTimePicker
          value={passportExpiry ? new Date(passportExpiry) : new Date()}
          mode="date"
          display="default"
          minimumDate={new Date()}
          onChange={(event, selectedDate) => {
            if (selectedDate) handlePassportExpiry(selectedDate.toISOString().split('T')[0]);
          }}
        />
      )}

      {/* Date of Birth */}
      <Text style={styles.textHead}>{t('dateOfBirth') || 'Date of Birth'}</Text>
      <TouchableOpacity
        style={[styles.button, (showAllErrors && fieldErrors.birthday) && styles.errorInput]}
        onPress={() => setShowBirthdayPicker(!showBirthdayPicker)}>
        <Text style={styles.buttonText}>
          {birthday ? new Date(birthday).toLocaleDateString('en-GB') : (t('selectDate') || 'Select Date')}
        </Text>
        <Icon name="calendar" size={18} color="#FD501E" style={styles.icon} />
      </TouchableOpacity>
      {showBirthdayPicker && (
        <DateTimePicker
          value={birthday ? new Date(birthday) : new Date()}
          mode="date"
          display="default"
          maximumDate={new Date()}
          onChange={(event, selectedDate) => {
            if (selectedDate) handleBirthday(selectedDate.toISOString().split('T')[0]);
          }}
        />
      )}
    </View>
  );
});

// helper to strip HTML tags and decode common entities
// This explicitly handles: <br>, <a ...>...</a>, <b>, <small>, <span ...> and other tags
const stripHtml = (str) => {
  if (str === null || str === undefined || str === '') return '';
  try {
    let s = String(str);

    // convert <br> to newlines first (handle variations)
    s = s.replace(/<br\s*\/?\s*>/gi, '\n');

    // Convert anchor tags to their inner text (remove <a ...> and </a>)
    // e.g. <a href="...">text</a> -> text
    s = s.replace(/<a\b[^>]*>([\s\S]*?)<\/a>/gi, '$1');

    // Remove any remaining tags (b, small, span with attributes, etc.) but keep inner text
    s = s.replace(/<\/??[^>]+(>|$)/g, '');

    // Decode common HTML entities
    const entities = {
      '&nbsp;': ' ',
      '&amp;': '&',
      '&lt;': '<',
      '&gt;': '>',
      '&quot;': '"',
      '&#39;': "'",
    };
    s = s.replace(/&[a-zA-Z0-9#]+?;/g, (entity) => {
      if (entities[entity]) return entities[entity];
      // decode numeric entities like &#39; or &#x27;
      const m = entity.match(/^&#(x?[0-9a-fA-F]+);$/);
      if (m) {
        const code = m[1].startsWith('x') ? parseInt(m[1].substr(1), 16) : parseInt(m[1], 10);
        if (!Number.isNaN(code)) return String.fromCharCode(code);
      }
      return entity;
    });

    return s.trim();
  } catch (e) {
    return String(str);
  }
};

const CustomerInfo = ({ navigation }) => {
  const { t, selectedLanguage } = useLanguage();
  const { customerData, updateCustomerData } = useCustomer();
  const insets = useSafeAreaInsets();
  const tabBarScrollProps = useTabBarAutoHide();

  // ใช้ options แบบ label/value (value เป็น EN เสมอ)
  const titleOptions = getTitleOptions(t);

  const [code, setcode] = useState('');
  const [Firstname, setFirstname] = useState(customerData.Firstname);
  const [Lastname, setLastname] = useState(customerData.Lastname);
  // เก็บค่า EN เสมอ
  const [selectedTitle, setSelectedTitle] = useState(customerData.selectedTitle || 'Please Select');
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedTele, setSelectedTele] = useState(customerData.selectcoountrycode);
  const [isTeleModalVisible, setIsTeleModalVisible] = useState(false);
  const [telePhone, setTelePhone] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileNumber, setmobileNumber] = useState(customerData.tel);
  const [email, setemail] = useState(customerData.email);
  const [timetableDepart, settimetableDepart] = useState([]);
  const [timetableReturn, settimetableReturn] = useState([]);
  const [country, setCountry] = useState(customerData.country);
  const [countrycode, setCountrycode] = useState(customerData.countrycode);
  const [errors, setErrors] = useState({});
  const [isWhatsapp, setIsWhatsapp] = useState('');
  const [contactErrors, setContactErrors] = useState({ phone: false, mobile: false, email: false });
  const passengerFormRefs = useRef([]);
  const [showAllErrors, setShowAllErrors] = useState(false);
  const [PriceDepart, setPriceDepart] = useState([]);
  const [PriceReturn, setPriceReturn] = useState([]);
  // Cache refund options so getRefundOptions is computed only once on initial load
  const [computedRefundOptions, setComputedRefundOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [setError] = useState('');
  const [hasToken, setHasToken] = useState(false);
  const [refundOption, setRefundOption] = useState('50'); // '100' | '70' | '50'
  const [selectedInsurancePlan, setSelectedInsurancePlan] = useState(null); // selected insurance id
  // Insurance holders stored per passenger (adult, child, infant).
  // Each holder: { name: '', day: '', month: '', monthLabel: '', year: '' }
  const toCount = (v) => {
    const n = Number(v);
    return Number.isFinite(n) && n > 0 ? n : 0;
  };
  const totalPassengersInitial = toCount(customerData.adult) + toCount(customerData.child) + toCount(customerData.infant) || 1;
  const [insuranceHolders, setInsuranceHolders] = useState(() => Array.from({ length: totalPassengersInitial }, () => ({ name: '', day: '', month: '', monthLabel: '', year: '' })));
  // Active DOB modal: { visible: boolean, type: 'day'|'month'|'year'|null, index: number|null }
  const [activeDobModal, setActiveDobModal] = useState({ visible: false, type: null, index: null });
  // localized month names
  const monthsEn = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const monthsTh = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
  const [insuranceOptions, setInsuranceOptions] = useState([]);
  const [insuranceLoading, setInsuranceLoading] = useState(false);
  // ref to main scroll view so we can scroll to insurance section when a plan is selected
  const scrollRef = useRef(null);
  const [insuranceSectionY, setInsuranceSectionY] = useState(0);
  const [insuranceDetailsY, setInsuranceDetailsY] = useState(null);
  const insuranceDetailsRef = useRef(null);
  const firstHolderRef = useRef(null);
  const firstHolderInputRef = useRef(null);

  // refs for auto-scrolling to incomplete sections
  const passengerSectionRef = useRef(null);
  const contactSectionRef = useRef(null);
  const refundSectionRef = useRef(null);


  useEffect(() => {
    const fetchInsurance = async () => {
      setInsuranceLoading(true);
      try {
        const res = await fetch('https://thetrago.com/AppApi/insurance');
        const json = await res.json();
        if (json && json.status === 'success' && Array.isArray(json.data)) {
          setInsuranceOptions(json.data);
        } else {
          console.warn('Unexpected insurance API response', json);
          setInsuranceOptions([]);
        }
      } catch (err) {
        console.warn('Failed to load insurance options', err);
        setInsuranceOptions([]);
      } finally {
        setInsuranceLoading(false);
      }
    };

    fetchInsurance();
  }, []);

  // keep insurance holders array length in sync with passenger counts
  useEffect(() => {
    const total = toCount(customerData.adult) + toCount(customerData.child) + toCount(customerData.infant) || 1;
    setInsuranceHolders((prev) => {
      if (!prev) return Array.from({ length: total }, () => ({ name: '', day: '', month: '', monthLabel: '', year: '' }));
      if (prev.length === total) return prev;
      if (prev.length < total) {
        return prev.concat(Array.from({ length: total - prev.length }, () => ({ name: '', day: '', month: '', monthLabel: '', year: '' })));
      }
      // prev.length > total -> truncate
      return prev.slice(0, total);
    });
  }, [customerData.adult, customerData.child, customerData.infant]);

  // Helper function to convert insuranceHolders to API format
  const convertInsuranceHoldersToAPI = (holders) => {
    const result = holders.map(h => {
      const birthday = (h.year && h.month && h.day)
        ? `${h.year}-${String(h.month).padStart(2, '0')}-${String(h.day).padStart(2, '0')}`
        : '';
      return {
        md_insurance_name: h.name || '',
        md_insurance_birthday: birthday
      };
    });
    console.log('🔵 [Insurance Array] Converted insurance data:', JSON.stringify(result, null, 2));
    return result;
  };

  // initialize from persisted md_insurancetype_holders (if exists)
  useEffect(() => {
    try {
      if (customerData.md_insurancetype_holders) {
        const parsed = JSON.parse(customerData.md_insurancetype_holders);
        if (Array.isArray(parsed)) {
          setInsuranceHolders(parsed.map(h => ({ name: h.name || '', day: h.day || '', month: h.month || '', monthLabel: h.monthLabel || h.monthLabel || '', year: h.year || '' })));
        }
      }
    } catch (e) {
      // ignore parse errors
    }
  }, [customerData.md_insurancetype_holders]);

  // Function to get refund options with calculated amounts based on totalbooking
  const getRefundOptions = (totalbooking, symbol) => {
    const total = parseFloat(totalbooking) || 0;
    const totalPassengers = (customerData.adult || 0) + (customerData.child || 0) + (customerData.infant || 0);

    // Calculate refund amounts for each option
    const refund100 = total;
    const refund70 = total * 0.7;
    const refund50 = total * 0.5;


    const passengers = totalPassengers > 0 ? totalPassengers : 1; // avoid division by zero
    const perPerson100 = (total * 0.15) / passengers;
    const perPerson70 = (total * 0.05) / passengers;
    const perPerson50 = 0;

    return [
      {
        key: '100',
        title: t('refundOption100_title') || '100% Refund',
        subtitle: `${t('refundAmount') || 'Refund amount'} : ${symbol} ${formatNumberWithComma(refund100.toFixed(2))}`,
        note: `${symbol} ${formatNumberWithComma(perPerson100.toFixed(2))} ${t('perPerson') || 'per person'}`
      },
      {
        key: '70',
        title: t('refundOption70_title') || '70% Refund',
        subtitle: `${t('refundAmount') || 'Refund amount'} : ${symbol} ${formatNumberWithComma(refund70.toFixed(2))}`,
        note: `${symbol} ${formatNumberWithComma(perPerson70.toFixed(2))} ${t('perPerson') || 'per person'}`
      },
      {
        key: '50',
        title: t('refundOption50_title') || '50% Refund',
        subtitle: `${t('refundAmount') || 'Refund amount'} : ${symbol} ${formatNumberWithComma(refund50.toFixed(2))}`,
        note: `${symbol} ${formatNumberWithComma(perPerson50.toFixed(2))} ${t('perPerson') || 'per person'}`
      },
    ];
  };

  // Map refund option keys to the numeric values required by backend
  // '100' -> 15, '70' -> 5, '50' -> 0
  const getRefundOptionValue = (key) => {
    switch (String(key)) {
      case '100':
        return 15;
      case '70':
        return 5;
      case '50':
      default:
        return 0;
    }
  };

  // Check if user has token (is logged in)
  const checkToken = async () => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      setHasToken(!!token);
    } catch (error) {
      console.log('Error checking token:', error);
      setHasToken(false);
    }
  };

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
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

  function formatTime(timeString) {
    if (!timeString) return "";
    return timeString.slice(0, 5);
  }

  useEffect(() => {
    checkToken(); // Check token on component mount

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

  console.log('customerData:', customerData.Firstname);
  console.log('customerData:', customerData.Lastname);
  console.log('customerData:', customerData.email);
  console.log('customerData:', customerData.countrycode);
  console.log('customerData.international:', customerData.international);


  const fetchPrice = async () => {
    try {
      const response = await axios.post(
        'https://thetrago.com/api/V1/ferry/Getprice',
        {
          currency: customerData.currency,
          roundtrip: customerData.roud,
          departtrip: customerData.timeTableDepartId,
          returntrip: customerData.timeTableReturnId,
          adult: customerData.adult,
          child: customerData.child,
          infant: customerData.infant,
          departdate: customerData.departdate,
          returndate: customerData.returndate,
          pickupdepart1: customerData.pickupDepartId,
          pickupdepart2: customerData.pickupReturnId,
          dropoffdepart1: customerData.dropoffDepartId,
          dropoffdepart2: customerData.dropoffReturnId,
          paymentfee: 0,
          refund: getRefundOptionValue(refundOption),
          insurance: selectedInsurancePlan,
        },
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );

      if (response.data.status === 'success') {
        setPriceDepart([response.data.data]);
      } else {
        setPriceDepart([]);
        setPriceReturn([]);
      }
    } catch (err) {
      console.error("❌ API Error:", err.response?.data || err.message);
      setPriceDepart([]);
      setPriceReturn([]);
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ API');
    } finally {
      setIsLoading(false);
    }
  };


  const handlepromo = async () => {
    try {
      const response = await axios.post(
        'https://thetrago.com/api/V1/ferry/Getprice',
        {
          currency: customerData.currency,
          roundtrip: customerData.roud,
          departtrip: customerData.timeTableDepartId,
          returntrip: customerData.timeTableReturnId,
          adult: customerData.adult,
          child: customerData.child,
          infant: customerData.infant,
          departdate: customerData.departdate,
          returndate: customerData.returndate,
          pickupdepart1: customerData.pickupDepartId,
          pickupdepart2: customerData.pickupReturnId,
          dropoffdepart1: customerData.dropoffDepartId,
          dropoffdepart2: customerData.dropoffReturnId,
          paymentfee: 0,
          promotioncode: code,
          refund: getRefundOptionValue(refundOption),
          insurance: selectedInsurancePlan,
        },
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );

      if (response.data.status === 'success') {
        if (response.data.data.totalDepart.promotionprice !== 0) {
          Alert.alert(t('codeSuccess') || 'โค้ดสำเร็จ');
        } else {
          Alert.alert(t('invalidCode') || 'โค้ดไม่ถูกต้อง');
        }

        setPriceDepart([response.data.data]);

        updateCustomerData({
          md_booking_promoprice: response.data.data.totalDepart.promotionprice || 0,
        });

        if (response.data.data.totalReturn) {
          setPriceReturn([response.data.data.totalReturn]);
        }
      } else {
        Alert.alert(t('invalidCode') || 'โค้ดไม่ถูกต้อง');
        setPriceDepart([]);
        setPriceReturn([]);
      }
    } catch (err) {
      console.error("❌ API Error:", err.response?.data || err.message);
      setPriceDepart([]);
      setPriceReturn([]);
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ API');
    } finally {
      setIsLoading(false);
    }
  };

  // แปลงข้อมูลจาก PassengerForm -> พารามิเตอร์ API (idtype เป็น int)
  const toPassengerParam = (raw, fallbackType = 'adult') => {
    const parsed = Number.isFinite(raw?.idtype)
      ? raw.idtype
      : parseInt(raw?.idtype ?? '', 10);
    const idtypeNum = Number.isFinite(parsed) ? parsed : 0;

    return {
      md_passenger_prefix: raw.prefix || '', // ✅ prefix เป็น EN
      md_passenger_fname: (raw.fname || '').trim(),
      md_passenger_lname: (raw.lname || '').trim(),
      md_passenger_idtype: idtypeNum,
      md_passenger_nationality: raw.nationality || '',
      md_passenger_passport: raw.passport || '',
      md_passenger_passportexpiry: raw.passportexpiry || '',
      md_passenger_dateoflssue: raw.dateofissue || '',
      md_passenger_birthday: raw.birthday || '',
      md_passenger_type: (raw.type || fallbackType || '').toLowerCase(),
    };
  };

  // Helper function to scroll to incomplete section
  const scrollToIncompleteSection = (sectionRef, sectionName = 'section') => {
    if (sectionRef && sectionRef.current && scrollRef && scrollRef.current) {
      try {
        sectionRef.current.measureLayout(
          scrollRef.current,
          (x, y) => {
            const HEADER_OFFSET = insets ? (insets.top + 20) : 60;
            const targetY = Math.max(0, y - HEADER_OFFSET);
            console.warn(`[ScrollToIncomplete] Scrolling to ${sectionName}: y=${y}, targetY=${targetY}`);
            scrollRef.current.scrollTo({ y: targetY, animated: true });
          },
          (error) => {
            console.warn(`[ScrollToIncomplete] Failed to measure ${sectionName}:`, error);
          }
        );
      } catch (err) {
        console.warn(`[ScrollToIncomplete] Error scrolling to ${sectionName}:`, err);
      }
    }
  };

  const handleNext = () => {
    console.log('🔵 [handleNext] refundOption:', refundOption, '-> value:', getRefundOptionValue(refundOption));
    console.log('🔵 [handleNext] selectedInsurancePlan:', selectedInsurancePlan);

    if (customerData.international == 0) {
      let newErrors = {};
      if (selectedTitle === 'Please Select') newErrors.selectedTitle = true; // ✅ เช็ค EN
      if (!Firstname) newErrors.Firstname = true;
      if (!Lastname) newErrors.Lastname = true;
      if (selectedTele === 'Please Select' || selectedTele === (t('pleaseSelect') || 'Please Select')) newErrors.selectedTele = true;
      if (!mobileNumber) newErrors.mobileNumber = true;

      // Email validation
      if (!email) {
        newErrors.email = true;
      } else {
        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        if (!emailRegex.test(email)) {
          newErrors.email = true;
        }
      }

      const passengerDataArr = [
        toPassengerParam({
          prefix: selectedTitle, // ✅ EN
          fname: Firstname,
          lname: Lastname,
          idtype: 0,
          nationality: country,
          passport: '',
          passportexpiry: '',
          dateofissue: '',
          birthday: '',
          type: 'adult',
        })
      ];

      updateCustomerData({
        selectedTitle: selectedTitle, // ✅ EN
        Firstname: Firstname,
        Lastname: Lastname,
        tel: mobileNumber,
        email: email,
        companyname: timetableDepart[0].md_company_nameeng,
        startingpoint_name: timetableDepart[0].startingpoint_name,
        endpoint_name: timetableDepart[0].endpoint_name,
        boatypeid: timetableDepart[0].md_timetable_boattypeid,
        country: country,
        countrycode: '+' + countrycode,
        time: timetableDepart[0].md_timetable_time,
        departtime: timetableDepart[0].md_timetable_departuretime,
        passenger: passengerDataArr,
        // booking information
        md_booking_country: country,
        md_booking_countrycode: '+' + countrycode,
        md_booking_tel: mobileNumber,
        md_booking_email: email,
        md_booking_whatsapp: isWhatsapp,
        md_booking_promocode: code,
        md_booking_promoprice: PriceDepart[0].totalDepart.promotionprice,
        md_booking_refund: getRefundOptionValue(refundOption),
        md_booking_refundpriceDepart: PriceDepart[0].totalDepart.pricerefund_insert || 0,
        md_booking_refundpriceReturn: PriceDepart[0].totalReturn.pricerefund_insert || 0,
        md_booking_insurance: selectedInsurancePlan || '',
      });

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        setShowAllErrors(true);

        // Determine which section to scroll to based on first error
        let scrollTarget = null;
        if (newErrors.selectedTitle || newErrors.Firstname || newErrors.Lastname) {
          scrollTarget = { ref: passengerSectionRef, name: 'Passenger Details' };
        } else if (newErrors.selectedTele || newErrors.mobileNumber || newErrors.email) {
          scrollTarget = { ref: contactSectionRef, name: 'Contact Details' };
        }

        if (newErrors.email) {
          Alert.alert(t('invalidEmail') || 'Invalid Email', t('pleaseEnterValidEmail') || 'Please enter a valid email address.', [
            {
              text: t('ok') || 'OK',
              onPress: () => {
                console.log('OK Pressed');
                if (scrollTarget) {
                  setTimeout(() => scrollToIncompleteSection(scrollTarget.ref, scrollTarget.name), 300);
                }
              }
            }
          ]);
        } else {
          Alert.alert(t('incompleteInformation') || 'Incomplete Information', t('pleaseFillAllRequiredFields') || 'Please fill in all required fields.', [
            {
              text: t('ok') || 'OK',
              onPress: () => {
                console.log('OK Pressed');
                if (scrollTarget) {
                  setTimeout(() => scrollToIncompleteSection(scrollTarget.ref, scrollTarget.name), 300);
                }
              }
            }
          ]);
        }
        return;
      }
      setShowAllErrors(false);
      // If an insurance plan is selected, require all holder fields to be filled
      if (selectedInsurancePlan) {
        const incomplete = (insuranceHolders || []).some(h => {
          return !h || !h.name || !h.day || !h.month || !h.year;
        });
        if (incomplete) {
          setShowAllErrors(true);
          Alert.alert(
            t('incompleteInformation') || 'Incomplete Information',
            t('pleaseFillInsuranceHolders') || 'Please fill in all insurance holder information before continuing.',
            [{
              text: t('ok') || 'OK', onPress: () => {
                // attempt to scroll to insurance details block to help the user
                try {
                  const targetY = (insuranceDetailsY || insuranceSectionY) - 20;
                  if (scrollRef && scrollRef.current && typeof scrollRef.current.scrollTo === 'function') {
                    scrollRef.current.scrollTo({ y: targetY, animated: true });
                  }
                } catch (e) {
                  // ignore
                }
              }
            }]
          );
          return;
        }
        // Save insurance data when clicking Next (only if all fields are complete)
        console.log('🔵 [CustomerInfo - Before Convert] insuranceHolders:', JSON.stringify(insuranceHolders, null, 2));
        const apiFormat = convertInsuranceHoldersToAPI(insuranceHolders);
        console.log('🔵 [CustomerInfo - After Convert] apiFormat:', JSON.stringify(apiFormat, null, 2));
        updateCustomerData({
          insurance: apiFormat,
          md_insurancetype_holder_name1: insuranceHolders[0]?.name || ''
        });
        console.log('🔵 [CustomerInfo - After Save] customerData.insurance:', JSON.stringify(customerData.insurance, null, 2));
      }
      navigation.navigate('PaymentScreen');
      // navigation.navigate('ResultScreen', { success: true });
    } else {
      const totalPassenger = (customerData.adult || 0) + (customerData.child || 0) + (customerData.infant || 0);
      if (!passengerFormRefs.current || passengerFormRefs.current.length !== totalPassenger) {
        Alert.alert(t('incompleteInformation') || 'Incomplete Information', t('pleaseFillAllRequiredPassengerFields') || 'Please fill in all required passenger fields.', [
          {
            text: t('ok') || 'OK',
            onPress: () => {
              setTimeout(() => scrollToIncompleteSection(passengerSectionRef, 'Passenger Forms'), 300);
            }
          }
        ]);
        return;
      }
      let passengerErrors = [];
      let hasPassengerError = false;
      let firstErrorIndex = -1;
      passengerErrors = passengerFormRefs.current.map(ref => ref?.validate?.() || {});
      hasPassengerError = passengerErrors.some((err, idx) => {
        const hasError = Object.keys(err).length > 0;
        if (hasError && firstErrorIndex === -1) {
          firstErrorIndex = idx;
        }
        return hasError;
      });
      passengerFormRefs.current.forEach((formRef, idx) => {
        if (formRef) {
          const data = formRef.getData?.() || {};
          const allFields = ['prefix', 'fname', 'lname', 'nationality', 'passport', 'dateofissue', 'passportexpiry', 'birthday'];
          const errorObj = {};
          allFields.forEach(f => {
            if (!data[f] || data[f] === 'Please Select' || data[f] === (t('pleaseSelect') || 'Please Select')) errorObj[f] = true;
          });
          formRef.setFieldErrors?.(errorObj);
        }
      });
      if (hasPassengerError) {
        setShowAllErrors(true);
        Alert.alert(t('incompleteInformation') || 'Incomplete Information', t('pleaseFillAllRequiredPassengerFields') || 'Please fill in all required passenger fields.', [
          {
            text: t('ok') || 'OK',
            onPress: () => {
              // Scroll to first passenger form with error
              if (firstErrorIndex >= 0 && passengerFormRefs.current[firstErrorIndex]) {
                const formRef = passengerFormRefs.current[firstErrorIndex];
                if (formRef.getRef && formRef.getRef()) {
                  setTimeout(() => scrollToIncompleteSection(formRef.getRef(), `Passenger ${firstErrorIndex + 1}`), 300);
                } else {
                  setTimeout(() => scrollToIncompleteSection(passengerSectionRef, 'Passenger Forms'), 300);
                }
              }
            }
          }
        ]);
        return;
      }
      setShowAllErrors(false);
      const passengerDataArr = passengerFormRefs.current.map(ref => {
        const d = ref?.getData?.() || {};
        if (d.idtype == null || d.idtype === '') d.idtype = 1;
        return toPassengerParam(d);
      });
      updateCustomerData({
        selectedTitle: selectedTitle, // ✅ EN
        Firstname: Firstname,
        Lastname: Lastname,
        tel: mobileNumber,
        email: email,
        companyname: timetableDepart[0].md_company_nameeng,
        startingpoint_name: timetableDepart[0].startingpoint_name,
        endpoint_name: timetableDepart[0].endpoint_name,
        boatypeid: timetableDepart[0].md_timetable_boattypeid,
        country: country,
        countrycode: '+' + countrycode,
        time: timetableDepart[0].md_timetable_time,
        departtime: timetableDepart[0].md_timetable_departuretime,
        passenger: passengerDataArr,
        // booking information
        md_booking_country: country,
        md_booking_countrycode: countrycode,
        md_booking_tel: mobileNumber,
        md_booking_email: email,
        md_booking_whatsapp: isWhatsapp,
        md_booking_promocode: code,
        md_booking_promoprice: PriceDepart[0].totalDepart.promotionprice,
        md_booking_refund: getRefundOptionValue(refundOption),
        md_booking_refundpriceDepart: PriceDepart[0].totalDepart.pricerefund_insert || 0,
        md_booking_refundpriceReturn: PriceDepart[0].totalReturn.pricerefund_insert || 0,
        md_booking_insurance: selectedInsurancePlan || '',
      });
      // If an insurance plan is selected, require all holder fields to be filled
      if (selectedInsurancePlan) {
        const incomplete = (insuranceHolders || []).some(h => {
          return !h || !h.name || !h.day || !h.month || !h.year;
        });
        if (incomplete) {
          setShowAllErrors(true);
          Alert.alert(
            t('incompleteInformation') || 'Incomplete Information',
            t('pleaseFillInsuranceHolders') || 'Please fill in all insurance holder information before continuing.',
            [{
              text: t('ok') || 'OK', onPress: () => {
                try {
                  const targetY = (insuranceDetailsY || insuranceSectionY) - 20;
                  if (scrollRef && scrollRef.current && typeof scrollRef.current.scrollTo === 'function') {
                    scrollRef.current.scrollTo({ y: targetY, animated: true });
                  }
                } catch (e) { }
              }
            }]
          );
          return;
        }
        // Save insurance data when clicking Next (only if all fields are complete)
        console.log('🔵 [CustomerInfo - Before Convert] insuranceHolders:', JSON.stringify(insuranceHolders, null, 2));
        const apiFormat = convertInsuranceHoldersToAPI(insuranceHolders);
        console.log('🔵 [CustomerInfo - After Convert] apiFormat:', JSON.stringify(apiFormat, null, 2));
        updateCustomerData({
          insurance: apiFormat,
          md_insurancetype_holder_name1: insuranceHolders[0]?.name || ''
        });
        console.log('🔵 [CustomerInfo - After Save] customerData.insurance:', JSON.stringify(customerData.insurance, null, 2));
      }
      navigation.navigate('PaymentScreen');
    }
  };

  const toggleModal = () => setModalVisible(!isModalVisible);
  const toggleTeleModal = () => setIsTeleModalVisible(!isTeleModalVisible);

  function formatNumberWithComma(value) {
    if (!value) return "0.00";
    const formattedValue = Number(value).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    return formattedValue;
  }

  // รับค่า EN
  const handleSelectTitle = (value) => {
    setSelectedTitle(value); // ✅ EN
    setErrors((prev) => ({ ...prev, selectedTitle: false }));
    toggleModal();
  };

  const handleSelectTele = (item) => {
    const isPlaceholder = (item.sys_countries_nameeng === 'Please Select') || (item.sys_countries_namethai === 'Please Select');
    const displayName = selectedLanguage === 'th' && item.sys_countries_namethai ? item.sys_countries_namethai : item.sys_countries_nameeng;
    const selectedValue = isPlaceholder ? t('pleaseSelect') : `(+${item.sys_countries_telephone}) ${displayName}`;

    setSelectedTele(selectedValue);
    setCountry(item.sys_countries_code);
    setCountrycode(item.sys_countries_telephone);
    setErrors((prev) => ({ ...prev, selectedTele: false }));
    toggleTeleModal();
  };

  const filteredTelePhones = telePhone.filter((item) => {
    const eng = (item.sys_countries_nameeng || '').toLowerCase();
    const thai = (item.sys_countries_namethai || '').toLowerCase();
    const searchText = `(+${item.sys_countries_telephone}) ${eng} ${thai}`.toLowerCase();
    return searchText.includes(searchQuery.toLowerCase());
  });

  function formatDate(dateString) {
    const date = new Date(Date.parse(dateString));
    return date.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
  }

  function formatTimeToHoursAndMinutes(time) {
    let [hours, minutes] = time.split(':');
    hours = parseInt(hours, 10);
    minutes = parseInt(minutes, 10);
    return `${hours} h ${minutes} min`;
  }

  const fetchTimetableReturn = async () => {
    try {
      const response = await fetch(`${ipAddress}/timetable/${customerData.timeTableReturnId}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      if (data && Array.isArray(data.data)) {
        settimetableReturn(data.data);
      } else {
        console.error('Data is not an array', data);
        settimetableReturn([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const teleResponse = await fetch(`${ipAddress}/telephone`);
        const teleData = await teleResponse.json();
        if (teleData && Array.isArray(teleData.data)) {
          const countryList = [
            {
              sys_countries_telephone: '',
              sys_countries_nameeng: 'Please Select',
              sys_countries_code: ''
            },
            ...teleData.data
          ];
          setTelePhone(countryList);
        } else {
          console.error('Data is not an array', teleData);
          setTelePhone([]);
        }

        const timetableResponse = await fetch(`${ipAddress}/timetable/${customerData.timeTableDepartId}`);
        if (!timetableResponse.ok) {
          throw new Error('Network response was not ok');
        }
        const timetableData = await timetableResponse.json();
        console.log('Timetable Depart Data:', timetableData); // Debug log
        if (timetableData && Array.isArray(timetableData.data)) {
          settimetableDepart(timetableData.data);
          console.log('Timetable Depart Set:', timetableData.data); // Debug log
        } else {
          console.error('Data is not an array', timetableData);
          settimetableDepart([]);
        }

        await fetchPrice();

        if (customerData.roud === 2) {
          await fetchTimetableReturn();
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Error loading data:', error);
        setIsLoading(false);
      }
    };

    loadData();
  }, [customerData.timeTableReturnId]);

  // Refetch price when refundOption or insurance plan changes
  useEffect(() => {
    // Skip on initial mount (when timetable is not loaded yet)
    if (!isLoading && timetableDepart.length > 0) {
      console.log('🔵 [useEffect] refundOption changed to:', refundOption, '-> value:', getRefundOptionValue(refundOption));
      console.log('🔵 [useEffect] selectedInsurancePlan:', selectedInsurancePlan);
      fetchPrice();
    }
  }, [refundOption, selectedInsurancePlan]);

  // Compute refund options once after PriceDepart is populated
  useEffect(() => {
    if (computedRefundOptions.length === 0 && Array.isArray(PriceDepart) && PriceDepart.length > 0) {
      const arr = PriceDepart.map((all) => getRefundOptions(all.totalbooking, customerData.symbol));
      setComputedRefundOptions(arr);
    }
  }, [PriceDepart, computedRefundOptions.length, customerData.symbol]);

  const EXTRA_TOP_GUTTER = Platform.OS === 'android' ? 0 : 50;

  if (isLoading) {
    return (
      <View style={{ flex: 1 }}>


        <LinearGradient
          colors={['#002A5C', '#2563EB']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1.2 }}
          style={{ flex: 1 }}
        >
          <View style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            zIndex: 1,
          }}>
            {floatingAnims.map((anim, index) => (
              <Animated.View
                key={index}
                style={[
                  {
                    position: 'absolute',
                    width: 4,
                    height: 4,
                    backgroundColor: 'rgba(255,255,255,0.3)',
                    borderRadius: 2,
                  },
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

          <LinearGradient
            colors={["rgba(255,255,255,0.98)", "rgba(248,250,252,0.95)", "rgba(241,245,249,0.9)"]}
            style={[
              headStyles.headerBg,
              {
                width: '100%',
                marginLeft: '0%',
                paddingTop: insets.top + EXTRA_TOP_GUTTER,
                borderBottomLeftRadius: getResponsiveSize(40, 35, 30),
                borderBottomRightRadius: getResponsiveSize(40, 35, 30),
                paddingBottom: getResponsiveSize(8, 6, 5),
                padding: getResponsiveSize(10, 8, 6),
                minHeight: getResponsiveSize(hp('12%'), hp('10%'), hp('8%')),
                borderWidth: 1,
                borderColor: 'rgba(0, 18, 51, 0.08)',
                // Ultra premium glass morphism
                backdropFilter: 'blur(30px)',
              },
            ]}
          >
            <View
              style={[
                headStyles.headerRow,
                {
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingHorizontal: getResponsiveSize(0, wp('2%'), wp('5%')),
                  paddingTop: 0,
                  position: 'relative',
                  marginTop: 0,
                  height: getResponsiveSize(56, 50, 45),
                  maxWidth: isTablet ? 1200 : '100%',
                  alignSelf: 'center',
                  width: '100%',
                },
              ]}
            >
              {/* Back Button - Left */}
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={{
                  position: 'absolute',
                  left: getResponsiveSize(16, 20, 30),
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  borderRadius: getResponsiveSize(25, 22, 20),
                  padding: getResponsiveSize(8, 10, 12),
                  zIndex: 2,
                  borderWidth: 1,
                  borderColor: 'rgba(253, 80, 30, 0.1)',
                }}
              >
                <AntDesign name="arrow-left" size={24} color="#FD501E" />
              </TouchableOpacity>

              {/* Logo - Center */}
              <View style={{ position: 'absolute', left: 0, right: 0, alignItems: 'center' }}>
                <LogoTheTrago />
              </View>

            </View>

          </LinearGradient>


          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: hp('1%'),
            marginHorizontal: wp('6%'),
            marginBottom: hp('2%'),
            paddingHorizontal: wp('2%'),
            paddingVertical: hp('1.5%'),
            backgroundColor: 'rgba(255,255,255,0.1)',
            borderRadius: wp('4%'),
            backdropFilter: 'blur(10px)',
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.2)',
          }}>
            <View style={{ flex: 1 }}>
              <Text style={[
                headStyles.headerTitle,
                {
                  color: '#FFFFFF',
                  fontSize: wp('7%'),
                  fontWeight: '800',
                  letterSpacing: -0.5,
                  textAlign: 'left',
                  marginLeft: 0,
                  lineHeight: wp('8%'),
                }
              ]}>
                {t('customerInformation') || 'Customer Information'}
              </Text>
              <Text style={{
                color: 'rgba(255,255,255,0.8)',
                fontSize: wp('3.5%'),
                fontWeight: '500',
                marginTop: hp('0.5%'),
                letterSpacing: 0.3,
              }}>
                {t('findYourPerfectJourney') || 'Find your perfect journey'}
              </Text>
            </View>
          </View>

          <ScrollView
            {...tabBarScrollProps}
            contentContainerStyle={{ paddingBottom: hp('12%') }}
            showsVerticalScrollIndicator={false}
            style={{ flex: 1 }}
          >
            <View style={{
              alignItems: 'center',
              marginTop: hp('1%'),
              marginBottom: hp('2%'),
            }}>
              <View style={{
                width: wp('80%'),
                height: hp('6%'),
                backgroundColor: 'rgba(255,255,255,0.1)',
                borderRadius: wp('3%'),
                marginBottom: hp('2%'),
              }} />
            </View>

            <View style={{
              paddingHorizontal: wp('6%'),
            }}>
              {[1, 2, 3].map((_, index) => (
                <View key={index} style={{
                  backgroundColor: 'rgba(255,255,255,0.95)',
                  borderRadius: wp('5%'),
                  padding: wp('5%'),
                  marginBottom: hp('3%'),
                  borderWidth: 1,
                  borderColor: 'rgba(200, 200, 200, 0.2)',
                }}>
                  <View style={{
                    width: wp('40%'),
                    height: hp('3%'),
                    backgroundColor: 'rgba(200, 200, 200, 0.3)',
                    borderRadius: wp('2%'),
                    marginBottom: hp('2%'),
                  }} />
                  {[1, 2, 3, 4].map((_, i) => (
                    <View key={i} style={{
                      width: '100%',
                      height: hp('6%'),
                      backgroundColor: 'rgba(200, 200, 200, 0.2)',
                      borderRadius: wp('3%'),
                      marginBottom: hp('2%'),
                    }} />
                  ))}
                </View>
              ))}
            </View>
          </ScrollView>
        </LinearGradient>
      </View>
    );
  }



  return (
    <View style={{ flex: 1 }}>

      <LinearGradient
        colors={['#002A5C', '#2563EB']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1.2 }}
        style={{ flex: 1 }}
      >
        <LinearGradient
          colors={["rgba(255,255,255,0.98)", "rgba(248,250,252,0.95)", "rgba(241,245,249,0.9)"]}
          style={[
            headStyles.headerBg,
            {
              width: '100%',
              marginLeft: '0%',
              paddingTop: insets.top + EXTRA_TOP_GUTTER,
              borderBottomLeftRadius: getResponsiveSize(40, 35, 30),
              borderBottomRightRadius: getResponsiveSize(40, 35, 30),
              paddingBottom: getResponsiveSize(8, 6, 5),
              padding: getResponsiveSize(10, 8, 6),
              minHeight: getResponsiveSize(hp('12%'), hp('10%'), hp('8%')),
              borderWidth: 1,
              borderColor: 'rgba(0, 18, 51, 0.08)',
              // Ultra premium glass morphism
              backdropFilter: 'blur(30px)',
            },
          ]}
        >
          <View
            style={[
              headStyles.headerRow,
              {
                alignItems: 'center',
                justifyContent: 'center',
                paddingHorizontal: getResponsiveSize(0, wp('2%'), wp('5%')),
                paddingTop: 0,
                position: 'relative',
                marginTop: 0,
                height: getResponsiveSize(56, 50, 45),
                maxWidth: isTablet ? 1200 : '100%',
                alignSelf: 'center',
                width: '100%',
              },
            ]}
          >
            {/* Back Button - Left */}
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{
                position: 'absolute',
                left: getResponsiveSize(16, 20, 30),
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderRadius: getResponsiveSize(25, 22, 20),
                padding: getResponsiveSize(8, 10, 12),
                zIndex: 2,
                shadowColor: '#FD501E',
                shadowOpacity: 0.2,
                shadowRadius: getResponsiveSize(12, 10, 8),
                shadowOffset: { width: 0, height: getResponsiveSize(4, 3, 2) },
                borderWidth: 1,
                borderColor: 'rgba(253, 80, 30, 0.1)',
              }}
            >
              <AntDesign name="arrow-left" size={24} color="#FD501E" />
            </TouchableOpacity>

            {/* Logo - Center */}
            <View style={{ position: 'absolute', left: 0, right: 0, alignItems: 'center' }}>
              <LogoTheTrago />
            </View>

          </View>

        </LinearGradient>



        <KeyboardAvoidingView
          behavior="padding"
          style={{ flex: 1 }}
        >
          <ScrollView
            {...tabBarScrollProps}
            contentContainerStyle={[
              styles.container,
              {
                paddingBottom: Platform.OS === 'android' ? (Platform.Version >= 31 ? insets.bottom + hp('12%') : hp('12%')) : hp('12%')
              }
            ]}
            showsVerticalScrollIndicator={false}
            style={[
              { flex: 1 },
              Platform.OS === 'android' && Platform.Version >= 31 && {
                paddingBottom: 0,
              }
            ]}
            ref={scrollRef}
            contentInsetAdjustmentBehavior="automatic"
          >
            {/* Step Component */}
            <View style={{
              alignItems: 'center',
              marginTop: hp('1%'),
              marginBottom: hp('2%'),
            }}>
              <Step logoUri={2} />
            </View>

            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: hp('1%'),
              marginHorizontal: wp('6%'),
              marginBottom: hp('2%'),
              paddingHorizontal: wp('2%'),
              paddingVertical: hp('1.5%'),
              backgroundColor: 'rgba(255,255,255,0.1)',
              borderRadius: wp('4%'),
              backdropFilter: 'blur(10px)',
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.2)',
            }}>
              <View style={{ flex: 1 }}>
                <Text style={[
                  headStyles.headerTitle,
                  {
                    color: '#FFFFFF',
                    fontSize: wp('7%'),
                    fontWeight: '800',
                    letterSpacing: -0.5,
                    textAlign: 'left',
                    marginLeft: 0,
                    lineHeight: wp('8%'),
                    textShadowColor: 'rgba(0,0,0,0.3)',
                    textShadowRadius: 4,
                    textShadowOffset: { width: 1, height: 1 },
                  }
                ]}>
                  {t('customerInformation') || 'Customer Information'}
                </Text>
                <Text style={{
                  color: 'rgba(255,255,255,0.8)',
                  fontSize: wp('3.5%'),
                  fontWeight: '500',
                  marginTop: hp('0.5%'),
                  letterSpacing: 0.3,
                  textShadowColor: 'rgba(0,0,0,0.2)',
                  textShadowRadius: 2,
                }}>
                  {t('findYourPerfectJourney') || 'Find your perfect journey'}
                </Text>
              </View>
            </View>

            {/* Content Container */}
            <View style={styles.contentContainer}>
              {/* เงื่อนไขแสดงฟอร์มตาม international */}
              {Number(customerData.international) === 0 ? (
                <View
                  ref={passengerSectionRef}
                  style={styles.promo}
                  onLayout={(e) => {
                    // Measure passenger section position for auto-scroll
                    try {
                      const y = e.nativeEvent.layout.y;
                      console.log('[PassengerSection] Y position:', y);
                    } catch (err) {
                      // ignore
                    }
                  }}
                >
                  <Text style={styles.TextInput}>{t('passengerDetails') || 'Passenger Details'}</Text>

                  {/* คำนำหน้า */}
                  <Text style={styles.textHead}>{t('title') || 'Title'}</Text>
                  <TouchableOpacity
                    style={[styles.button, (showAllErrors && (errors.selectedTitle || (selectedTitle === 'Please Select'))) && styles.errorInput]}
                    onPress={toggleModal}>
                    <Text style={styles.buttonText}>{getTitleLabel(selectedTitle, t)}</Text>
                    <Icon name="chevron-down" size={18} color="#FD501E" style={styles.icon} />
                  </TouchableOpacity>

                  {/* Modal for title selection */}
                  <Modal visible={isModalVisible} transparent animationType="fade" onRequestClose={toggleModal}>
                    <View style={styles.modalOverlay}>
                      <View style={styles.modalContentPre}>
                        <FlatList
                          data={titleOptions}
                          renderItem={({ item }) => (
                            <TouchableOpacity style={styles.optionItem} onPress={() => handleSelectTitle(item.value)}>
                              <Text style={styles.optionText}>{item.label}</Text>
                            </TouchableOpacity>
                          )}
                          keyExtractor={(item, index) => index.toString()}
                          initialNumToRender={5}
                          maxToRenderPerBatch={5}
                          windowSize={5}
                          pagingEnabled
                        />
                      </View>


                    </View>
                  </Modal>

                  {/* ชื่อจริง & นามสกุล */}
                  <Text style={styles.textHead}>{t('firstName') || 'First Name'}</Text>
                  <TextInput
                    placeholder={t('firstName') || 'First Name'}
                    value={Firstname}
                    onChangeText={(text) => {
                      setFirstname(text);
                      setErrors((prev) => ({ ...prev, Firstname: false }));
                    }}
                    placeholderTextColor="#374151"
                    style={[styles.input, (errors.Firstname || (showAllErrors && !Firstname)) && styles.errorInput]}
                  />

                  <Text style={styles.textHead}>{t('lastName') || 'Last Name'}</Text>
                  <TextInput
                    placeholder={t('lastName') || 'Last Name'}
                    value={Lastname}
                    onChangeText={(text) => {
                      setLastname(text);
                      setErrors((prev) => ({ ...prev, Lastname: false }));
                    }}
                    placeholderTextColor="#374151"
                    style={[styles.input, (errors.Lastname || (showAllErrors && !Lastname)) && styles.errorInput]}
                  />

                  {/* รายละเอียดการติดต่อ */}
                  <View
                    ref={contactSectionRef}
                    onLayout={(e) => {
                      try {
                        const y = e.nativeEvent.layout.y;
                        console.log('[ContactSection] Y position:', y);
                      } catch (err) {
                        // ignore
                      }
                    }}
                  >
                    <Text style={styles.TextInput}>{t('contactDetails') || 'Contact Details'}</Text>
                  </View>
                  <Text style={styles.textHead}>{t('phoneNumber') || 'Phone number'}</Text>
                  <TouchableOpacity
                    style={[styles.button, (showAllErrors && (errors.selectedTele || (selectedTele === 'Please Select' || selectedTele === (t('pleaseSelect') || 'Please Select')))) && styles.errorInput]}
                    onPress={toggleTeleModal}>
                    <Text style={styles.buttonText}>{selectedTele === 'Please Select' ? t('pleaseSelect') : selectedTele}</Text>
                    <Icon name="chevron-down" size={18} color="#FD501E" style={styles.icon} />
                  </TouchableOpacity>

                  {/* Modal for selecting telephone */}
                  <Modal visible={isTeleModalVisible} transparent animationType="fade" onRequestClose={toggleTeleModal}>
                    <View style={styles.modalOverlay}>
                      <View style={styles.modalContent}>
                        <TextInput
                          placeholder={t('searchCountry') || 'Search country'}
                          value={searchQuery}
                          onChangeText={setSearchQuery}
                          style={styles.textInput}
                          placeholderTextColor="#374151"
                        />
                        <FlatList
                          data={filteredTelePhones}
                          renderItem={({ item }) => (
                            <TouchableOpacity style={styles.optionItem} onPress={() => handleSelectTele(item)}>
                              <Text style={[styles.optionText, (item.sys_countries_nameeng === 'Please Select' || item.sys_countries_namethai === 'Please Select')]}>
                                {(item.sys_countries_nameeng === 'Please Select' || item.sys_countries_namethai === 'Please Select')
                                  ? t('pleaseSelect')
                                  : `(+${item.sys_countries_telephone}) ${selectedLanguage === 'th' && item.sys_countries_namethai ? item.sys_countries_namethai : item.sys_countries_nameeng}`}
                              </Text>
                            </TouchableOpacity>
                          )}
                          keyExtractor={(item, index) => index.toString()}
                          initialNumToRender={5}
                          maxToRenderPerBatch={5}
                          windowSize={5}
                          pagingEnabled
                        />
                      </View>
                    </View>
                  </Modal>

                  <TextInput
                    placeholder={t('mobileNumber') || 'Phone number'}
                    value={mobileNumber}
                    keyboardType="number-pad"
                    returnKeyType="done"
                    onChangeText={(text) => {
                      setmobileNumber(text);
                      setErrors((prev) => ({ ...prev, mobileNumber: false }));
                    }}
                    placeholderTextColor="#374151"
                    style={[styles.input, (errors.mobileNumber || (showAllErrors && !mobileNumber)) && styles.errorInput]}
                  />
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 10, marginBottom: 10 }}>
                    <TouchableOpacity
                      onPress={() => setIsWhatsapp(isWhatsapp ? "0" : "on")}
                      style={{ width: 24, height: 24, justifyContent: 'center', alignItems: 'center', marginRight: 6 }}>
                      <MaterialIcons name={isWhatsapp ? "check-box" : "check-box-outline-blank"} size={24} color="#FD501E" />
                    </TouchableOpacity>
                    <Text style={{ color: '#FD501E', fontWeight: 'bold' }}>WhatsApp</Text>
                  </View>
                  <Text style={[styles.title, { color: '#1E293B', fontSize: wp('4%'), fontWeight: '600', marginBottom: hp('1%'), textAlign: 'left' }]}>{t('whereToSendBookingConfirmation') || 'Where should we send your booking confirmation?'}</Text>
                  <Text style={styles.textHead}>{t('email') || 'Email'}</Text>
                  <TextInput
                    placeholder={t('enterYourEmail') || 'Enter Your Email'}
                    value={email}
                    placeholderTextColor="#374151"
                    onChangeText={(text) => {
                      setemail(text);

                      // Real-time email validation
                      if (text && text.length > 0) {
                        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
                        if (!emailRegex.test(text)) {
                          // Don't clear errors immediately, let validation show
                        } else {
                          // Clear errors when email is valid
                          setErrors((prev) => ({ ...prev, email: false }));
                          setContactErrors(prev => ({ ...prev, email: false }));
                        }
                      } else {
                        // Clear errors when field is empty
                        setErrors((prev) => ({ ...prev, email: false }));
                        setContactErrors(prev => ({ ...prev, email: false }));
                      }
                    }}
                    style={[styles.input, (errors.email || contactErrors.email || (showAllErrors && !email)) && styles.errorInput, hasToken && styles.disabledInput]}
                    editable={!hasToken}
                    selectTextOnFocus={!hasToken}
                    keyboardType="email-address"
                  />
                </View>
              ) : (
                <>
                  {passengerFormRefs.current = []}

                  {[...Array(customerData.adult)].map((_, i) => (
                    <PassengerForm
                      ref={el => (passengerFormRefs.current[i] = el)}
                      key={`adult-${i}`}
                      type="adult"
                      index={i}
                      telePhone={telePhone}
                      showAllErrors={showAllErrors}
                    />
                  ))}
                  {[...Array(customerData.child)].map((_, i) => (
                    <PassengerForm
                      ref={el => (passengerFormRefs.current[customerData.adult + i] = el)}
                      key={`child-${i}`}
                      type="child"
                      index={i}
                      telePhone={telePhone}
                      showAllErrors={showAllErrors}
                    />
                  ))}
                  {[...Array(customerData.infant)].map((_, i) => (
                    <PassengerForm
                      ref={el => (passengerFormRefs.current[customerData.adult + customerData.child + i] = el)}
                      key={`infant-${i}`}
                      type="infant"
                      index={i}
                      telePhone={telePhone}
                      showAllErrors={showAllErrors}
                    />
                  ))}

                  {/* Contact Details Section */}
                  <View
                    ref={contactSectionRef}
                    style={styles.promo}
                    onLayout={(e) => {
                      try {
                        const y = e.nativeEvent.layout.y;
                        console.log('[ContactSection-International] Y position:', y);
                      } catch (err) {
                        // ignore
                      }
                    }}
                  >
                    <Text style={styles.TextInput}>{t('contactDetails') || 'Contact Details'}</Text>
                    <Text style={styles.textHead}>{t('phoneNumber') || 'Phone number'}</Text>
                    <TouchableOpacity
                      style={[styles.button, (showAllErrors && (errors.selectedTele || (selectedTele === 'Please Select' || selectedTele === (t('pleaseSelect') || 'Please Select')))) && styles.errorInput]}
                      onPress={toggleTeleModal}>
                      <Text style={styles.buttonText}>{selectedTele === 'Please Select' ? t('pleaseSelect') : selectedTele}</Text>
                      <Icon name="chevron-down" size={18} color="#FD501E" style={styles.icon} />
                    </TouchableOpacity>

                    <Modal visible={isTeleModalVisible} transparent animationType="fade" onRequestClose={toggleTeleModal}>
                      <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                          <TextInput
                            placeholder={t('searchCountry') || 'Search country'}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            style={styles.textInput}
                            placeholderTextColor="#374151"
                          />
                          <FlatList
                            data={filteredTelePhones}
                            renderItem={({ item }) => (
                              <TouchableOpacity style={styles.optionItem} onPress={() => handleSelectTele(item)}>
                                <Text style={[styles.optionText, (item.sys_countries_nameeng === 'Please Select' || item.sys_countries_namethai === 'Please Select')]}>
                                  {(item.sys_countries_nameeng === 'Please Select' || item.sys_countries_namethai === 'Please Select')
                                    ? t('pleaseSelect')
                                    : `(+${item.sys_countries_telephone}) ${selectedLanguage === 'th' && item.sys_countries_namethai ? item.sys_countries_namethai : item.sys_countries_nameeng}`}
                                </Text>
                              </TouchableOpacity>
                            )}
                            keyExtractor={(item, index) => index.toString()}
                            initialNumToRender={5}
                            maxToRenderPerBatch={5}
                            windowSize={5}
                            pagingEnabled
                          />
                        </View>
                      </View>
                    </Modal>
                    <TextInput
                      placeholder={t('enterYourMobileNumber') || 'Enter your phone number'}
                      placeholderTextColor="#374151"
                      style={[styles.input, (showAllErrors && contactErrors.mobile) && styles.errorInput]}
                      keyboardType="number-pad"
                      returnKeyType="done"
                      value={mobileNumber}
                      onChangeText={text => {
                        setmobileNumber(text);
                        setContactErrors(prev => ({ ...prev, mobile: false }));
                      }}
                    />
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 10, marginBottom: 10 }}>
                      <TouchableOpacity
                        onPress={() => setIsWhatsapp(isWhatsapp ? "0" : "on")}
                        style={{ width: 24, height: 24, justifyContent: 'center', alignItems: 'center', marginRight: 6 }}>
                        <MaterialIcons name={isWhatsapp ? "check-box" : "check-box-outline-blank"} size={24} color="#FD501E" />
                      </TouchableOpacity>
                      <Text style={{ color: '#FD501E', fontWeight: 'bold' }}>WhatsApp</Text>
                    </View>
                    <Text style={[styles.title, { color: '#1E293B', fontSize: wp('4%'), fontWeight: '600', marginBottom: hp('1%'), textAlign: 'left' }]}>{t('whereToSendBookingConfirmation') || 'Where should we send your booking confirmation?'}</Text>
                    <Text style={styles.textHead}>{t('email') || 'Email'}</Text>
                    <TextInput
                      placeholder={t('enterYourEmail') || 'Enter Your Email'}
                      placeholderTextColor="#374151"
                      style={[styles.input, (showAllErrors && contactErrors.email) && styles.errorInput]}
                      keyboardType="email-address"
                      value={email}
                      editable={true}
                      selectTextOnFocus={true}
                      onChangeText={text => {
                        setemail(text);
                        // Clear both error states when user starts typing
                        setContactErrors(prev => ({ ...prev, email: false }));
                        setErrors(prev => ({ ...prev, email: false }));
                      }}
                    />
                  </View>
                </>
              )}

              {/* Refund options section */}
              {Array.isArray(PriceDepart) && PriceDepart.map((all, index) => {
                // Use cached refund options (computed once on initial load) if available,
                // otherwise compute on the fly as a fallback.
                const refundOptions = (Array.isArray(computedRefundOptions) && computedRefundOptions[index])
                  ? computedRefundOptions[index]
                  : getRefundOptions(all.totalbooking, customerData.symbol);

                return (
                  <View key={index} >
                    {(timetableDepart?.[0]?.md_timetable_refundable === 1 || timetableReturn?.[0]?.md_timetable_refundable === 1) && (
                      <View
                        ref={refundSectionRef}
                        style={[styles.promo, { backgroundColor: '#fff', borderRadius: wp('3%'), padding: wp('4%'), borderWidth: 1, borderColor: 'rgba(253,80,30,0.08)' }]}
                        onLayout={(e) => {
                          try {
                            const y = e.nativeEvent.layout.y;
                            console.log('[RefundSection] Y position:', y);
                          } catch (err) {
                            // ignore
                          }
                        }}
                      >
                        <Text style={{ fontWeight: '700', fontSize: wp('4%'), color: '#1F2937', marginBottom: hp('0.5%') }}>{t('addCancelForAnyReason') || 'Add Cancel for Any Reason'}</Text>
                        <Text style={{ color: '#6B7280', fontSize: wp('3%'), marginBottom: hp('1%') }}>{t('cancelInfo') || 'Cancel at least 72 hours before departure to be eligible for a refund'}</Text>

                        {refundOptions.map(opt => (
                          <TouchableOpacity
                            key={opt.key}
                            onPress={() => setRefundOption(opt.key)}
                            style={{
                              width: '100%',
                              flexDirection: 'row',
                              alignItems: 'flex-start',
                              paddingVertical: hp('2%'),
                              paddingHorizontal: wp('3%'),
                              marginTop: wp('3%'),
                              borderRadius: wp('2%'),
                              borderWidth: refundOption === opt.key ? 2 : 1,
                              borderColor: refundOption === opt.key ? '#FD501E' : 'rgba(0,0,0,0.06)',
                              backgroundColor: '#fff'
                            }}
                          >
                            <View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: refundOption === opt.key ? '#FD501E' : '#D1D5DB', alignItems: 'center', justifyContent: 'center', marginRight: wp('3%') }}>
                              {refundOption === opt.key && <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: '#FD501E' }} />}
                            </View>
                            <View style={{ flex: 1 }}>
                              <Text style={{ fontWeight: '700', color: '#111827' }}>{opt.title}</Text>
                              <Text style={{ color: '#FD501E', fontWeight: '700', marginTop: hp('0.4%') }}>{opt.subtitle}</Text>
                              <Text style={{ color: '#9CA3AF', marginTop: hp('0.6%') }}>{opt.note}</Text>
                            </View>
                          </TouchableOpacity>
                        ))}

                        <View style={{ marginTop: hp('2%'), padding: wp('3%'), backgroundColor: 'rgba(0,0,0,0.03)', borderRadius: wp('2%') }}>
                          <Text style={{ color: '#6B7280', fontSize: wp('3%') }}>
                            {t('refundInfo') || 'You will receive a refund of the fare (excluding service charges and fees) if the cancellation is made at least 72 hours before departure. The refund will be credited to your original payment method.'}
                          </Text>
                        </View>
                      </View>

                    )}
                    {/* Insurance / Trip Protection selection block (Plan A/B/C) */}
                    {customerData.country_insurance === 217 && (
                      <View
                        style={[styles.promo, { backgroundColor: '#fff', borderRadius: wp('3%'), padding: wp('4%'), borderWidth: 1, borderColor: 'rgba(0,0,0,0.04)', marginTop: hp('2%') }]}
                        onLayout={(e) => {
                          const y = e.nativeEvent.layout.y;
                          setInsuranceSectionY(y);
                        }}
                      >
                        <Text style={{ fontWeight: '700', fontSize: wp('4%'), color: '#1F2937', marginBottom: hp('0.5%') }}>{t('TripProtection') || 'Trip Protection'}</Text>
                        <Text style={{ color: '#6B7280', fontSize: wp('3%'), marginBottom: hp('1%') }}>{t('insuranceProvidedBy') || 'รับประกันโดย CHUBB'}</Text>


                        {insuranceLoading ? (
                          <Text style={{ color: '#6B7280' }}>{t('loading') || 'Loading...'}</Text>
                        ) : (
                          (insuranceOptions || []).map((plan, idx) => (
                            <TouchableOpacity
                              key={plan.md_insurancetype_id}
                              onPress={() => {
                                // Toggle: if already selected, deselect and clear related data; otherwise select and persist
                                if (selectedInsurancePlan === plan.md_insurancetype_id) {
                                  setSelectedInsurancePlan(null);
                                  // clear persisted insurance fields and holder info
                                  updateCustomerData({
                                    md_insurancetype_id: null,
                                    md_insurancetype_price: null,
                                    md_insurancetype_holder_name1: '',
                                    insurance: []
                                  });
                                  // clear local holders array
                                  setInsuranceHolders(Array.from({ length: totalPassengersInitial }, () => ({ name: '', day: '', month: '', monthLabel: '', year: '' })));
                                } else {
                                  setSelectedInsurancePlan(plan.md_insurancetype_id);
                                  // persist selected insurance id to booking data for backend
                                  updateCustomerData({ md_insurancetype_id: plan.md_insurancetype_id, md_insurancetype_price: plan.md_insurancetype_price });
                                  // scroll to insurance holder inputs block — wait for the holder inputs to render after plan selection
                                  InteractionManager.runAfterInteractions(() => {
                                    // Give extra time for the holder inputs block to render and measure its position
                                    setTimeout(() => {
                                      try {
                                        // After selecting a plan, the holder inputs block appears and insuranceDetailsY will be measured
                                        // Wait a bit more to ensure insuranceDetailsY is updated via onLayout
                                        setTimeout(() => {
                                          if (typeof insuranceDetailsY === 'number' && scrollRef && scrollRef.current) {
                                            // insuranceDetailsY points to the holder inputs block that appears after selecting a plan
                                            // Reduce header offset to scroll down more (showing more of the holder inputs)
                                            const HEADER_OFFSET = insets ? (insets.top - 25) : 100;
                                            const targetY = Math.max(0, insuranceDetailsY - HEADER_OFFSET);
                                            console.warn('[InsuranceScroll] scrolling to holder inputs: insuranceDetailsY=', insuranceDetailsY, '- HEADER_OFFSET=', HEADER_OFFSET, '-> targetY=', targetY);
                                            scrollRef.current.scrollTo({ y: targetY, animated: true });
                                          } else {
                                            console.warn('[InsuranceScroll] insuranceDetailsY not yet measured, cannot scroll. insuranceDetailsY=', insuranceDetailsY);
                                          }
                                        }, 200); // additional delay to let insuranceDetailsY update from onLayout
                                      } catch (err) {
                                        console.warn('[InsuranceScroll] Failed to scroll to insurance holder inputs', err);
                                      }
                                    }, 300);
                                  });
                                }
                              }}
                              style={{
                                width: '100%',
                                backgroundColor: '#fff',
                                borderRadius: wp('3%'),
                                padding: wp('3%'),
                                marginBottom: hp('1.2%'),
                                borderWidth: selectedInsurancePlan === plan.md_insurancetype_id ? 2 : 1,
                                borderColor: selectedInsurancePlan === plan.md_insurancetype_id ? '#FD501E' : 'rgba(0,0,0,0.06)',
                                flexDirection: 'row',
                                alignItems: 'center'
                              }}
                            >
                              {idx === 0 && (
                                <View style={{ position: 'absolute', left: 10, top: -10, zIndex: 5 }}>
                                  <View style={{ backgroundColor: '#FF7A42', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 12 }}>
                                    <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>{selectedLanguage === 'th' ? 'แนะนำ' : 'Recommended'}</Text>
                                  </View>
                                </View>
                              )}

                              <View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: selectedInsurancePlan === plan.md_insurancetype_id ? '#FD501E' : '#D1D5DB', alignItems: 'center', justifyContent: 'center', marginRight: wp('3%') }}>
                                {selectedInsurancePlan === plan.md_insurancetype_id && <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: '#FD501E' }} />}
                              </View>
                              <View style={{ flex: 1 }}>
                                <Text style={{ fontWeight: '700', color: '#111827' }}>{selectedLanguage === 'th' ? (stripHtml(plan.md_insurancetype_nameth) || plan.md_insurancetype_no) : (stripHtml(plan.md_insurancetype_nameen) || plan.md_insurancetype_no)}</Text>

                                <Text style={{ color: '#9CA3AF', marginTop: hp('0.6%') }}>{customerData.symbol} {formatNumberWithComma(plan.md_insurancetype_price?.toFixed ? plan.md_insurancetype_price.toFixed(2) : (plan.md_insurancetype_price ?? 0))}</Text>
                              </View>
                            </TouchableOpacity>
                          ))
                        )}
                      </View>
                    )}
                    {/* When a plan is selected, show holder inputs and plan details */}
                    {selectedInsurancePlan && (() => {
                      const plan = (insuranceOptions || []).find(p => p.md_insurancetype_id === selectedInsurancePlan);
                      if (!plan) return null;
                      const detailText = selectedLanguage === 'th' ? stripHtml(plan.md_insurancetype_detailth || plan.md_insurancetype_detail) : stripHtml(plan.md_insurancetype_detailen || plan.md_insurancetype_detail);
                      return (
                        <View
                          ref={insuranceDetailsRef}
                          style={{ marginTop: hp('2%'), backgroundColor: '#fff', borderRadius: wp('3%'), padding: wp('4%'), borderWidth: 1, borderColor: 'rgba(0,0,0,0.04)' }}
                          onLayout={(e) => {
                            try {
                              // Use pageY for absolute position from top of ScrollView
                              if (insuranceDetailsRef.current) {
                                insuranceDetailsRef.current.measureLayout(
                                  scrollRef.current,
                                  (x, y) => {
                                    console.warn('[InsuranceScroll] insuranceDetailsY measured via measureLayout:', y);
                                    setInsuranceDetailsY(y);
                                  },
                                  () => {
                                    // Fallback to pageY if measureLayout fails
                                    const pageY = e.nativeEvent.layout.y;
                                    console.warn('[InsuranceScroll] insuranceDetailsY fallback to layout.y:', pageY);
                                    setInsuranceDetailsY(pageY);
                                  }
                                );
                              }
                            } catch (err) {
                              console.warn('[InsuranceScroll] onLayout error:', err);
                            }
                          }}
                        >
                          {/* Render one holder input per passenger */}
                          <View>
                            {(insuranceHolders || []).map((holder, idx) => {
                              // determine passenger type label based on ordering (adults, then children, then infants)
                              const adults = customerData.adult || 0;
                              const children = customerData.child || 0;
                              const infants = customerData.infant || 0;
                              let typeLabel = '';
                              if (idx < adults) typeLabel = t('adult') || 'Adult';
                              else if (idx < adults + children) typeLabel = t('child') || 'Child';
                              else typeLabel = t('infant') || 'Infant';

                              return (
                                <View key={`ins-holder-${idx}`} ref={idx === 0 ? firstHolderRef : null} style={{ marginBottom: hp('1.2%') }}>
                                  {/* show insurance holder title for all holders */}
                                  <Text style={{ fontWeight: '700', fontSize: wp('3.6%'), color: '#111827', marginBottom: hp('0.5%') }}>
                                    {`${t('insuranceHolderTitle') ? t('insuranceHolderTitle').replace(/\d+/, '') : 'ชื่อผู้จอง'} ${idx + 1}`}
                                  </Text>
                                  <TextInput
                                    placeholder={t('insuranceHolderPlaceholder') || ''}
                                    ref={idx === 0 ? firstHolderInputRef : null}
                                    value={holder.name}
                                    onChangeText={(text) => {
                                      const next = [...insuranceHolders];
                                      next[idx] = { ...next[idx], name: text };
                                      setInsuranceHolders(next);
                                    }}
                                    placeholderTextColor="#374151"
                                    style={[
                                      styles.input,
                                      { marginBottom: hp('0.8%') },
                                      showAllErrors && !holder.name && styles.errorInput
                                    ]}
                                  />

                                  <Text style={{ fontWeight: '700', fontSize: wp('3.6%'), color: '#111827', marginBottom: hp('1%') }}>{t('dateOfBirth') || 'วันเกิด'}</Text>
                                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: hp('1%'), paddingHorizontal: wp('2%') }}>
                                    <View style={{ flex: 1, marginRight: wp('2%') }}>
                                      <TouchableOpacity
                                        style={{
                                          flexDirection: 'row',
                                          alignItems: 'center',
                                          backgroundColor: '#FFFFFF',
                                          paddingVertical: hp('1.5%'),
                                          paddingHorizontal: wp('3%'),
                                          borderWidth: 1,
                                          borderColor: (showAllErrors && !holder.day) ? '#EF4444' : '#E5E7EB',
                                          borderRadius: wp('3%'),
                                          justifyContent: 'space-between'
                                        }}
                                        onPress={() => setActiveDobModal({ visible: true, type: 'day', index: idx })}>
                                        <Text style={styles.buttonText}>{holder.day ? holder.day : (t('day') || 'Day')}</Text>
                                        <Icon name="chevron-down" size={18} color="#FD501E" style={styles.icon} />
                                      </TouchableOpacity>
                                    </View>

                                    <View style={{ flex: 1, marginRight: wp('2%') }}>
                                      <TouchableOpacity
                                        style={{
                                          flexDirection: 'row',
                                          alignItems: 'center',
                                          backgroundColor: '#FFFFFF',
                                          paddingVertical: hp('1.5%'),
                                          paddingHorizontal: wp('3%'),
                                          borderWidth: 1,
                                          borderColor: (showAllErrors && !holder.month) ? '#EF4444' : '#E5E7EB',
                                          borderRadius: wp('3%'),
                                          justifyContent: 'space-between',
                                          minHeight: hp('6%'),
                                        }}
                                        onPress={() => setActiveDobModal({ visible: true, type: 'month', index: idx })}>
                                        <Text numberOfLines={1} ellipsizeMode='tail' style={[styles.buttonText, { flex: 1, fontSize: wp('3.6%'), textAlign: 'center', flexWrap: 'nowrap', flexShrink: 1 }]}> {
                                          holder.monthLabel || (holder.month ? (selectedLanguage === 'th' ? monthsTh[parseInt(holder.month, 10) - 1] : monthsEn[parseInt(holder.month, 10) - 1]) : (t('month') || 'Month'))
                                        } </Text>
                                        <Icon name="chevron-down" size={18} color="#FD501E" style={[styles.icon, { marginLeft: wp('2%') }]} />
                                      </TouchableOpacity>
                                    </View>

                                    <View style={{ flex: 1 }}>
                                      <TouchableOpacity
                                        style={{
                                          flexDirection: 'row',
                                          alignItems: 'center',
                                          backgroundColor: '#FFFFFF',
                                          paddingVertical: hp('1.5%'),
                                          paddingHorizontal: wp('3%'),
                                          borderWidth: 1,
                                          borderColor: (showAllErrors && !holder.year) ? '#EF4444' : '#E5E7EB',
                                          borderRadius: wp('3%'),
                                          justifyContent: 'space-between'
                                        }}
                                        onPress={() => setActiveDobModal({ visible: true, type: 'year', index: idx })}>
                                        <Text style={styles.buttonText}>{holder.year ? holder.year : (t('year') || 'Year')}</Text>
                                        <Icon name="chevron-down" size={18} color="#FD501E" style={styles.icon} />
                                      </TouchableOpacity>
                                    </View>
                                  </View>
                                </View>
                              );
                            })}

                            {/* Plan details */}
                            <View style={{ borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.04)', paddingTop: hp('1%'), marginTop: hp('1%') }}>
                              <Text style={{ color: '#6B7280', fontSize: wp('3%'), lineHeight: 20 }}>{detailText}</Text>
                            </View>
                          </View>
                        </View>
                      );
                    })()}

                    {/* DOB modals for insurance holders */}
                    <Modal visible={activeDobModal.visible && activeDobModal.type === 'day'} transparent animationType="fade" onRequestClose={() => setActiveDobModal({ visible: false, type: null, index: null })}>
                      <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: hp('1%'), borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.04)', marginBottom: hp('1%') }}>
                            <Text style={{ fontWeight: '700', fontSize: wp('4%') }}>{t('day') || 'Day'}</Text>
                            <TouchableOpacity onPress={() => setActiveDobModal({ visible: false, type: null, index: null })}>
                              <Text style={{ color: '#FD501E', fontWeight: '600' }}>{t('close') || 'Close'}</Text>
                            </TouchableOpacity>
                          </View>
                          <FlatList
                            data={Array.from({ length: 31 }, (_, i) => String(i + 1))}
                            renderItem={({ item }) => (
                              <TouchableOpacity style={styles.optionItem} onPress={() => {
                                const idx = Number(activeDobModal.index);
                                if (!Number.isInteger(idx)) return setActiveDobModal({ visible: false, type: null, index: null });
                                const next = [...insuranceHolders];
                                next[idx] = { ...next[idx], day: item };
                                setInsuranceHolders(next);
                                setActiveDobModal({ visible: false, type: null, index: null });
                              }}>
                                <Text style={styles.optionText}>{item}</Text>
                              </TouchableOpacity>
                            )}
                            keyExtractor={(item) => item}
                          />
                        </View>
                      </View>
                    </Modal>

                    <Modal visible={activeDobModal.visible && activeDobModal.type === 'month'} transparent animationType="fade" onRequestClose={() => setActiveDobModal({ visible: false, type: null, index: null })}>
                      <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: hp('1%'), borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.04)', marginBottom: hp('1%') }}>
                            <Text style={{ fontWeight: '700', fontSize: wp('4%') }}>{t('month') || 'Month'}</Text>
                            <TouchableOpacity onPress={() => setActiveDobModal({ visible: false, type: null, index: null })}>
                              <Text style={{ color: '#FD501E', fontWeight: '600' }}>{t('close') || 'Close'}</Text>
                            </TouchableOpacity>
                          </View>
                          <FlatList
                            data={Array.from({ length: 12 }, (_, i) => String(i + 1))}
                            renderItem={({ item }) => {
                              const idxM = parseInt(item, 10) - 1;
                              const label = selectedLanguage === 'th' ? monthsTh[idxM] : monthsEn[idxM];
                              return (
                                <TouchableOpacity style={styles.optionItem} onPress={() => {
                                  const sel = Number(activeDobModal.index);
                                  if (!Number.isInteger(sel)) return setActiveDobModal({ visible: false, type: null, index: null });
                                  const next = [...insuranceHolders];
                                  next[sel] = { ...next[sel], month: item, monthLabel: label };
                                  setInsuranceHolders(next);
                                  setActiveDobModal({ visible: false, type: null, index: null });
                                }}>
                                  <Text style={styles.optionText}>{label}</Text>
                                </TouchableOpacity>
                              );
                            }}
                            keyExtractor={(item) => item}
                          />
                        </View>
                      </View>
                    </Modal>

                    <Modal visible={activeDobModal.visible && activeDobModal.type === 'year'} transparent animationType="fade" onRequestClose={() => setActiveDobModal({ visible: false, type: null, index: null })}>
                      <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: hp('1%'), borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.04)', marginBottom: hp('1%') }}>
                            <Text style={{ fontWeight: '700', fontSize: wp('4%') }}>{t('year') || 'Year'}</Text>
                            <TouchableOpacity onPress={() => setActiveDobModal({ visible: false, type: null, index: null })}>
                              <Text style={{ color: '#FD501E', fontWeight: '600' }}>{t('close') || 'Close'}</Text>
                            </TouchableOpacity>
                          </View>
                          <FlatList
                            data={Array.from({ length: 81 }, (_, i) => String(new Date().getFullYear() - i))}
                            renderItem={({ item }) => (
                              <TouchableOpacity style={styles.optionItem} onPress={() => {
                                const idx = Number(activeDobModal.index);
                                if (!Number.isInteger(idx)) return setActiveDobModal({ visible: false, type: null, index: null });
                                const next = [...insuranceHolders];
                                next[idx] = { ...next[idx], year: item };
                                setInsuranceHolders(next);
                                setActiveDobModal({ visible: false, type: null, index: null });
                              }}>
                                <Text style={styles.optionText}>{item}</Text>
                              </TouchableOpacity>
                            )}
                            keyExtractor={(item) => item}
                          />
                        </View>
                      </View>
                    </Modal>

                    <View style={{ width: '100%', paddingHorizontal: 1, alignSelf: 'center', marginTop: 15 }}>
                      <View style={[tripStyles.premiumWrapper, { width: wp('90%'), alignSelf: 'center' }]}>
                        <View style={[tripStyles.premiumHeader, tripStyles.premiumHeaderSimple]}>
                          <Text style={tripStyles.premiumTitle}>{t('bookingSummary') || 'Booking Summary'}</Text>
                        </View>

                        <View style={tripStyles.premiumContent}>
                          {timetableDepart && timetableDepart.length > 0 ? (
                            timetableDepart.map((item, idx) => (
                              <View key={idx}>
                                <Text style={tripStyles.sectionHeading}>{t('depart') || 'Depart'}</Text>

                                <Text style={tripStyles.routeText}>
                                  {selectedLanguage === 'th' ? item.startingpoint_namethai : item.startingpoint_nameeng} <AntDesign name="arrow-right" size={14} color="#FD501E" /> {selectedLanguage === 'th' ? item.endpoint_namethai : item.endpoint_nameeng}
                                </Text>

                                <View style={tripStyles.rowpromo}>
                                  <Text style={tripStyles.premiumLabel}>{t('company') || 'Company'}</Text>
                                  <Text style={tripStyles.premiumValue}>{(selectedLanguage === 'th' ? item.md_company_namethai : item.md_company_nameeng) || 'Loading...'}</Text>
                                </View>

                                <View style={tripStyles.rowpromo}>
                                  <Text style={tripStyles.premiumLabel}>{t('seat') || 'Seat'}</Text>
                                  <Text style={tripStyles.premiumValue}>{(selectedLanguage === 'th' ? item.md_seat_namethai : item.md_seat_nameeng) || 'Loading...'}</Text>
                                </View>

                                <View style={tripStyles.rowpromo}>
                                  <Text style={tripStyles.premiumLabel}>{t('boat') || 'Boat'}</Text>
                                  <Text style={tripStyles.premiumValue}>{(selectedLanguage === 'th' ? item.md_boattype_namethai : item.md_boattype_nameeng) || 'Loading...'}</Text>
                                </View>

                                <View style={tripStyles.rowpromo}>
                                  <Text style={tripStyles.premiumLabel}>{t('departureDate') || 'Departure Date'}</Text>
                                  <Text style={tripStyles.premiumValue}>{formatDate(customerData.departdate)}</Text>
                                </View>

                                <View style={tripStyles.rowpromo}>
                                  <Text style={tripStyles.premiumLabel}>{t('departureTime') || 'Departure Time'}</Text>
                                  <Text style={tripStyles.premiumValue}>{formatTime(item.md_timetable_departuretime)} - {formatTime(item.md_timetable_arrivaltime)} | {formatTimeToHoursAndMinutes(item.md_timetable_time)}</Text>
                                </View>

                                <View style={[tripStyles.rowpromo, { marginTop: hp('1%') }]}>
                                  <Text style={tripStyles.premiumTotalLabel}>{t('adult') || 'Adult'} x {customerData.adult}</Text>
                                  <Text style={tripStyles.premiumTotalValue}>{customerData.symbol} {formatNumberWithComma(parseFloat(all.totalDepart.priceadult).toFixed(2))}</Text>
                                </View>

                                {customerData.child !== 0 && (
                                  <View style={tripStyles.rowpromo}>
                                    <Text style={tripStyles.premiumTotalLabel}>{t('child') || 'Child'} x {customerData.child}</Text>
                                    <Text style={tripStyles.premiumTotalValue}>{customerData.symbol} {formatNumberWithComma(parseFloat(all.totalDepart.pricechild).toFixed(2))}</Text>
                                  </View>
                                )}

                                {customerData.infant !== 0 && (
                                  <View style={tripStyles.rowpromo}>
                                    <Text style={tripStyles.premiumTotalLabel}>{t('infant') || 'Infant'} x {customerData.infant}</Text>
                                    <Text style={tripStyles.premiumTotalValue}>{customerData.symbol} {formatNumberWithComma(parseFloat(all.totalDepart.priceinfant).toFixed(2))}</Text>
                                  </View>
                                )}

                                {customerData.pickupDepartId && (
                                  <View style={tripStyles.rowpromo}>
                                    <Text style={tripStyles.premiumLabel}>{t('pickUp') || 'Pick up'}</Text>
                                    <Text style={[tripStyles.premiumValue, { color: 'green' }]}>+ {customerData.symbol} {formatNumberWithComma(parseFloat(all.totalDepart.pricepickupdepart).toFixed(2))}</Text>
                                  </View>
                                )}

                                {customerData.dropoffDepartId && (
                                  <View style={tripStyles.rowpromo}>
                                    <Text style={tripStyles.premiumLabel}>{t('dropOff') || 'Drop off'}</Text>
                                    <Text style={[tripStyles.premiumValue, { color: 'green' }]}>+ {customerData.symbol} {formatNumberWithComma(parseFloat(all.totalDepart.pricedropoffdepart).toFixed(2))}</Text>
                                  </View>
                                )}

                                {all.totalDepart.save != 0 && (
                                  <View style={tripStyles.rowpromo}>
                                    <Text style={tripStyles.premiumLabel}>{t('discount') || 'Discount'}</Text>
                                    <Text style={tripStyles.redText}>- {customerData.symbol} {formatNumberWithComma(parseFloat(all.totalDepart.discount).toFixed(2))}</Text>
                                  </View>
                                )}

                                {all.totalDepart.promotionprice != 0 && (
                                  <View style={tripStyles.rowpromo}>
                                    <Text style={tripStyles.premiumLabel}>{t('promotionCode') || 'Discount Code'}</Text>
                                    <Text style={tripStyles.redText}>- {customerData.symbol} {formatNumberWithComma(parseFloat(all.totalDepart.promotionprice).toFixed(2))}</Text>
                                  </View>
                                )}

                                {(all.totalDepart.pricerefund != 0 || all.totalDepart.priceinsurance != 0) && (
                                  <View >
                                    <View style={tripStyles.divider} />
                                    <Text style={tripStyles.sectionHeading}>{t('TripProtection') || 'Trip Protection'}</Text>
                                    {all.totalDepart.pricerefund != 0 && (
                                      <View style={tripStyles.rowpromo}>
                                        <Text style={tripStyles.premiumLabel}>{t('RefundableBooking') || 'Refundable booking'}</Text>
                                        <Text style={[tripStyles.premiumValue, { color: 'green' }]}> + {customerData.symbol} {formatNumberWithComma(parseFloat(all.totalDepart.pricerefund_show).toFixed(2))}</Text>
                                      </View>
                                    )}
                                    {all.totalDepart.priceinsurance != 0 && (
                                      <View style={tripStyles.rowpromo}>
                                        <Text style={tripStyles.premiumLabel}>{t('TravelInsurance') || 'Travel insurance'}</Text>
                                        <Text style={[tripStyles.premiumValue, { color: 'green' }]}> + {customerData.symbol} {formatNumberWithComma(parseFloat(all.totalDepart.priceinsurance_show).toFixed(2))}</Text>
                                      </View>
                                    )}

                                    <Text style={tripStyles.premiumLabel}>{t('refundCoverageNote') || 'Refundability and coverage depend on the plan selected'}</Text>
                                    <View style={tripStyles.divider} />
                                  </View>
                                )}


                                <View style={tripStyles.rowpromo}>
                                  <Text style={tripStyles.premiumLabel}>{t('ticketFare') || 'Ticket fare'}</Text>
                                  <Text style={tripStyles.premiumFare}>{customerData.symbol} {formatNumberWithComma(parseFloat(all.totalDepart.showtotal).toFixed(2))}</Text>
                                </View>

                                <View style={tripStyles.divider} />
                              </View>
                            ))
                          ) : (
                            <View>
                              <Text style={{ color: '#6B7280', textAlign: 'center', marginVertical: hp('2%') }}>{t('loadingTimetable') || 'Loading timetable information...'}</Text>
                            </View>
                          )}

                          {customerData.roud === 2 && (
                            <>
                              {timetableReturn && timetableReturn.length > 0 && timetableReturn.map((item, idx) => (
                                <View key={idx}>
                                  <Text style={tripStyles.sectionHeading}>{t('return') || 'Return'}</Text>
                                  <Text style={tripStyles.routeText}>{selectedLanguage === 'th' ? item.startingpoint_namethai : item.startingpoint_nameeng} <AntDesign name="arrow-right" size={14} color="#FD501E" /> {selectedLanguage === 'th' ? item.endpoint_namethai : item.endpoint_nameeng}</Text>

                                  <View style={tripStyles.rowpromo}>
                                    <Text style={tripStyles.premiumLabel}>{t('company') || 'Company'}</Text>
                                    <Text style={tripStyles.premiumValue}>{(selectedLanguage === 'th' ? item.md_company_namethai : item.md_company_nameeng) || 'Loading...'}</Text>
                                  </View>

                                  <View style={tripStyles.rowpromo}>
                                    <Text style={tripStyles.premiumLabel}>{t('seat') || 'Seat'}</Text>
                                    <Text style={tripStyles.premiumValue}>{(selectedLanguage === 'th' ? item.md_seat_namethai : item.md_seat_nameeng) || 'Loading...'}</Text>
                                  </View>

                                  <View style={tripStyles.rowpromo}>
                                    <Text style={tripStyles.premiumLabel}>{t('boat') || 'Boat'}</Text>
                                    <Text style={tripStyles.premiumValue}>{(selectedLanguage === 'th' ? item.md_boattype_namethai : item.md_boattype_nameeng) || 'Loading...'}</Text>
                                  </View>

                                  <View style={tripStyles.rowpromo}>
                                    <Text style={tripStyles.premiumLabel}>{t('returnDate') || 'Return Date'}</Text>
                                    <Text style={tripStyles.premiumValue}>{formatDate(customerData.returndate)}</Text>
                                  </View>

                                  <View style={tripStyles.rowpromo}>
                                    <Text style={tripStyles.premiumLabel}>{t('departureTime') || 'Departure Time'}</Text>
                                    <Text style={tripStyles.premiumValue}>{formatTime(item.md_timetable_departuretime)} - {formatTime(item.md_timetable_arrivaltime)} | {formatTimeToHoursAndMinutes(item.md_timetable_time)}</Text>
                                  </View>

                                  <View style={[tripStyles.rowpromo, { marginTop: hp('1%') }]}>
                                    <Text style={tripStyles.premiumTotalLabel}>{t('adult') || 'Adult'} x {customerData.adult}</Text>
                                    <Text style={tripStyles.premiumTotalValue}>{customerData.symbol} {formatNumberWithComma(parseFloat(all.totalReturn.priceadult).toFixed(2))}</Text>
                                  </View>

                                  {customerData.child !== 0 && (
                                    <View style={tripStyles.rowpromo}>
                                      <Text style={tripStyles.premiumTotalLabel}>{t('child') || 'Child'} x {customerData.child}</Text>
                                      <Text style={tripStyles.premiumTotalValue}>{customerData.symbol} {formatNumberWithComma(parseFloat(all.totalReturn.pricechild).toFixed(2))}</Text>
                                    </View>
                                  )}

                                  {customerData.infant !== 0 && (
                                    <View style={tripStyles.rowpromo}>
                                      <Text style={tripStyles.premiumTotalLabel}>{t('infant') || 'Infant'} x {customerData.infant}</Text>
                                      <Text style={tripStyles.premiumTotalValue}>{customerData.symbol} {formatNumberWithComma(parseFloat(all.totalReturn.priceinfant).toFixed(2))}</Text>
                                    </View>
                                  )}

                                  {customerData.pickupReturnId != 0 && (
                                    <View style={tripStyles.rowpromo}>
                                      <Text style={tripStyles.premiumLabel}>{t('pickUp') || 'Pick up'}</Text>
                                      <Text style={[tripStyles.premiumValue, { color: 'green' }]}>+ {customerData.symbol} {formatNumberWithComma(parseFloat(all.totalReturn.pricepickupdepart).toFixed(2))}</Text>
                                    </View>
                                  )}

                                  {customerData.dropoffReturnId != 0 && (
                                    <View style={tripStyles.rowpromo}>
                                      <Text style={tripStyles.premiumLabel}>{t('dropOff') || 'Drop off'}</Text>
                                      <Text style={[tripStyles.premiumValue, { color: 'green' }]}>+ {customerData.symbol} {formatNumberWithComma(parseFloat(all.totalReturn.pricedropoffdepart).toFixed(2))}</Text>
                                    </View>
                                  )}

                                  {all.totalReturn.save != 0 && (
                                    <View style={tripStyles.rowpromo}>
                                      <Text style={tripStyles.premiumLabel}>{t('discount') || 'Discount'}</Text>
                                      <Text style={tripStyles.redText}>- {customerData.symbol} {formatNumberWithComma(parseFloat(all.totalReturn.discount).toFixed(2))}</Text>
                                    </View>
                                  )}

                                  {all.totalReturn.promotionprice != 0 && (
                                    <View style={tripStyles.rowpromo}>
                                      <Text style={tripStyles.premiumLabel}>{t('promotionCode') || 'Discount Code'}</Text>
                                      <Text style={tripStyles.redText}>- {customerData.symbol} {formatNumberWithComma(parseFloat(all.totalReturn.promotionprice).toFixed(2))}</Text>
                                    </View>
                                  )}

                                  {(all.totalReturn.pricerefund != 0 || all.totalReturn.priceinsurance != 0) && (
                                    <View >
                                      <View style={tripStyles.divider} />
                                      <Text style={tripStyles.sectionHeading}>{t('TripProtection') || 'Trip Protection'}</Text>
                                      {all.totalReturn.pricerefund != 0 && (
                                        <View style={tripStyles.rowpromo}>
                                          <Text style={tripStyles.premiumLabel}>{t('RefundableBooking') || 'Refundable booking'}</Text>
                                          <Text style={[tripStyles.premiumValue, { color: 'green' }]}> + {customerData.symbol} {formatNumberWithComma(parseFloat(all.totalReturn.pricerefund_show).toFixed(2))}</Text>
                                        </View>
                                      )}
                                      {all.totalReturn.priceinsurance != 0 && (
                                        <View style={tripStyles.rowpromo}>
                                          <Text style={tripStyles.premiumLabel}>{t('TravelInsurance') || 'Travel insurance'}</Text>
                                          <Text style={[tripStyles.premiumValue, { color: 'green' }]}> + {customerData.symbol} {formatNumberWithComma(parseFloat(all.totalReturn.priceinsurance_show).toFixed(2))}</Text>
                                        </View>
                                      )}

                                      <Text style={tripStyles.premiumLabel}>{t('refundCoverageNote') || 'Refundability and coverage depend on the plan selected'}</Text>
                                      <View style={tripStyles.divider} />
                                    </View>
                                  )}

                                  <View style={tripStyles.rowpromo}>
                                    <Text style={tripStyles.premiumLabel}>{t('ticketFare') || 'Ticket fare'}</Text>
                                    <Text style={tripStyles.premiumFare}>{customerData.symbol} {formatNumberWithComma(parseFloat(all.totalReturn.showtotal).toFixed(2))}</Text>
                                  </View>

                                  <View style={tripStyles.divider} />
                                </View>
                              ))}

                              {(!timetableReturn || timetableReturn.length === 0) && (
                                <View>
                                  <Text style={{ color: '#6B7280', textAlign: 'center', marginVertical: hp('2%') }}>{t('loadingReturnTimetable') || 'Loading return timetable information...'}</Text>
                                </View>
                              )}
                            </>
                          )}

                          <View style={tripStyles.totalRow}>
                            <Text style={tripStyles.totalLabel}>{t('subtotal') || 'Subtotal'}</Text>
                            <Text style={tripStyles.premiumValue}>{customerData.symbol} {formatNumberWithComma(parseFloat(all.total).toFixed(2))}</Text>
                          </View>

                          <View style={tripStyles.divider} />

                          <View style={tripStyles.totalRow}>
                            <Text style={[tripStyles.totalLabel, { color: '#FD501E' }]}>{t('total') || 'Total'}</Text>
                            <Text style={tripStyles.totalValueBig}>{customerData.symbol} {formatNumberWithComma(parseFloat(all.totalbooking).toFixed(2))}</Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  </View>
                );
              })}


              <View style={styles.promo}>
                <Text style={tripStyles.premiumLabel}>{t('promotionCode') || 'Discount Code'}</Text>

                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.promoInput}
                    placeholder={t('couponCode') || 'Coupon code'}
                    value={code}
                    onChangeText={setcode}
                    placeholderTextColor="#374151"
                  />

                  <TouchableOpacity style={styles.applyButton} onPress={handlepromo}>
                    <Text style={styles.applyText}>{t('apply') || 'Apply'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.rowButton}>
                <TouchableOpacity
                  style={[styles.ActionButton, { width: '100%' }]}
                  onPress={() => {
                    handleNext();
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.searchButtonText}>{t('next') || 'Next'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </View>
  );
}

export default CustomerInfo;
