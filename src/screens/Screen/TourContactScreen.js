import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Alert,
  ScrollView,
  Modal,
  FlatList,
  StyleSheet,
  Platform,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
// removed gradient for simple CTA
import moment from 'moment';
import { AntDesign } from '@expo/vector-icons';

import ipAddress from '../../config/ipconfig';
import { useLanguage } from './LanguageContext';
import { useCustomer } from './CustomerContext';
import styles from '../../styles/CSS/TripDetailStyles';

/** ---------- THEME ---------- */
const palette = {
  bg: '#F6F7FB',
  card: '#FFFFFF',
  text: '#111827',
  textDim: '#6B7280',
  line: '#EEF0F4',
  primary: '#FD501E',
  primary2: '#FF7A3A',
  field: '#FAFAFC',
  fieldBorder: '#E6E8EF',
  danger: '#EF4444',
  orangeInk: '#F55E2E',
};

/** ---------- UTIL ---------- */
const money = (n, locale = 'en-US', digits = 2) =>
  Number(n || 0).toLocaleString(locale, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });

const TourContactScreen = ({ navigation, route }) => {
  const { t, selectedLanguage } = useLanguage();
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerHeight = (insets.top || 0) + 64;
  const { customerData, updateCustomerData } = useCustomer();

  const params = route?.params || {};
  const tourParam = params.tour || {};
  const tourPriceParam = params.price || '';
  const passengersParam = params.passengers || {};
  const bookingDateParam = params.date || null;
  const tourTypeParam = params.tourtype || params.tourType || tourParam?.tourtypeID || tourParam?.tourtype || tourParam?.TourType || tourParam?.type || '';

  // Debug: Log params to see what's being passed
  console.log('TourContactScreen params:', {
    tourParam,
    tourTypeParam,
    bookingDateParam,
    fullParams: params
  });

  /** Prefill */
  const [selectedTitle, setSelectedTitle] = useState(customerData?.md_tours_title || 'Please Select');
  const [Firstname, setFirstname] = useState(customerData.Firstname || '');
  const [Lastname, setLastname] = useState(customerData.Lastname || '');
  const [tel, setTel] = useState(customerData.tel || '');
  const [email, setEmail] = useState(customerData.email || '');

  /** Country / Phone Code */
  const [telePhone, setTelePhone] = useState([]);
  const [isCountryModalVisible, setCountryModalVisible] = useState(false);
  const [searchQueryCountry, setSearchQueryCountry] = useState('');
  const [isPhoneModalVisible, setPhoneModalVisible] = useState(false);
  const [searchQueryPhone, setSearchQueryPhone] = useState('');

  const please = t('pleaseSelect') || 'Please Select';
  const getReadableCountry = (cd) => {
    if (!cd) return null;
    if (cd.md_tours_country) return cd.md_tours_country;
    if (cd.country && typeof cd.country === 'string' && cd.country.length > 3) return cd.country;
    return null;
  };

  // Return country display name depending on selected language
  const getCountryName = (item) => {
    if (!item) return '';
    // prefer Thai name when selectedLanguage is 'th'
    if (selectedLanguage === 'th') {
      return item.sys_countries_namethai || item.sys_countries_nameeng || item.name || item.country || '';
    }
    // default to English
    return item.sys_countries_nameeng || item.name || item.country || item.sys_countries_namethai || '';
  };

  // store selectedCountry as the English name field when possible
  const initialCountryName = customerData?.sys_countries_nameeng || getReadableCountry(customerData) || please;
  const [selectedCountry, setSelectedCountry] = useState(initialCountryName);
  const [selectedTele, setSelectedTele] = useState(
    customerData.md_tours_countryname && (customerData.md_tours_countrycode)
      ? `(+${customerData.md_tours_countrycode || customerData.countrycode}) ${customerData.md_tours_countryname}`
      : please
  );
  const [countrycode, setCountrycode] = useState(customerData.md_tours_countrycode || customerData.countrycode || '');
  // separate IDs for Country modal (primary source for md_tours_country)
  const [countryIdCountry, setCountryIdCountry] = useState(customerData.countryId || '');
  // separate ID for Phone modal selection (used for phone-specific country, but NOT overwrite Country modal display)
  const [countryIdPhone, setCountryIdPhone] = useState(customerData.countryId || '');
  const [selectedCountryFromModal, setSelectedCountryFromModal] = useState(null);
  const [selectedCountryFromPhone, setSelectedCountryFromPhone] = useState(null);

  /** Titles - store English value but display localized label */
  const TITLE_ENTRIES = [
    { key: 'please', en: 'Please Select', tKey: null },
    { key: 'mr', en: 'Mr.', tKey: 'mr' },
    { key: 'mrs', en: 'Mrs.', tKey: 'mrs' },
    { key: 'ms', en: 'Ms.', tKey: 'ms' },
    { key: 'master', en: 'Master', tKey: 'master' },
  ];

  // Options shown in the picker: label is localized, value is English string to store
  const titleOptions = TITLE_ENTRIES.map((e) => ({
    label: e.key === 'please' ? please : (t(e.tKey) || e.en),
    value: e.en,
  }));

  // helper: normalize incoming stored value to the English string we store
  const normalizeTitleToEnglish = (val) => {
    if (!val) return TITLE_ENTRIES[0].en; // Please Select
    // if it's already the English text, return it
    const foundEn = TITLE_ENTRIES.find((it) => it.en === val);
    if (foundEn) return foundEn.en;
    // if it's a key like 'mr', map to english
    const foundKey = TITLE_ENTRIES.find((it) => it.key === val);
    if (foundKey) return foundKey.en;
    // if it's localized label, try to match against translated labels
    const foundByLabel = TITLE_ENTRIES.find((it) => (it.tKey ? (t(it.tKey) || it.en) === val : false));
    if (foundByLabel) return foundByLabel.en;
    // fallback: return as-is
    return val;
  };

  const [isTitleModalVisible, setTitleModalVisible] = useState(false);
  // Basic validators - define before errors so they're available when errors is computed
  const isValidEmail = (value) => {
    if (!value) return false;
    const v = String(value).trim();
    // Simple but practical email regex
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  };

  const isValidPhoneNumber = (value) => {
    if (!value) return false;
    const s = String(value).replace(/[^0-9]+/g, '');
    // allow typical international/local phone lengths
    return s.length >= 6 && s.length <= 15;
  };

  /** Validate */
  const [attempted, setAttempted] = useState(false);
  // forceErrors lets us show field errors immediately when Save is pressed
  const [forceErrors, setForceErrors] = useState({});
  // track field-level touch/blur to show immediate validation
  const [telTouched, setTelTouched] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const errors = {
    title: attempted && (!selectedTitle || selectedTitle === 'Please Select' || selectedTitle === please),
    firstname: attempted && (!Firstname || !Firstname.trim()),
    lastname: attempted && (!Lastname || !Lastname.trim()),
    country: attempted && (
      !(
        (selectedCountryFromModal && selectedCountryFromModal !== please) ||
        (countryIdCountry && telePhone.find((it) => String(it.sys_countries_id) === String(countryIdCountry))) ||
        (selectedCountry && selectedCountry !== 'Please Select' && selectedCountry !== please)
      )
    ),
    telCode: attempted && (!selectedTele || selectedTele === 'Please Select' || selectedTele === please),
    tel: (attempted || telTouched) && (!tel || !tel.trim() || !isValidPhoneNumber(tel.trim())),
    email: (attempted || emailTouched) && (!email || !email.trim() || !isValidEmail(email.trim())),
    tour: attempted && (!tourParam || (!tourParam.name && !tourParam.NameThai && !tourParam.Title)),
    date: attempted && !bookingDateParam,
  };

  const parseNumber = (v) => {
    if (!v) return 0;
    try {
      const s = String(v).replace(/[^0-9.\-]+/g, '');
      const n = Number(s);
      return isNaN(n) ? 0 : n;
    } catch {
      return 0;
    }
  };

  const computeTotal = () => {
    const perAdult = parseNumber(tourPriceParam);
    const adults = Number(passengersParam.adult || 1);
    return perAdult * adults;
  };

  /** Data fetch: telephone list */
  useEffect(() => {
    let mounted = true;
    fetch(`${ipAddress}/telephone`)
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return;
        if (data && Array.isArray(data.data)) {
          setTelePhone([
            { sys_countries_telephone: '', sys_countries_nameeng: please, sys_countries_code: '' },
            ...data.data,
          ]);
        } else {
          setTelePhone([{ sys_countries_telephone: '', sys_countries_nameeng: please, sys_countries_code: '' }]);
        }
      })
      .catch(() => {
        if (!mounted) return;
        setTelePhone([{ sys_countries_telephone: '', sys_countries_nameeng: please, sys_countries_code: '' }]);
      });
    return () => {
      mounted = false;
    };
  }, []);

  /** Sync when context changes */
  useEffect(() => {
    setFirstname(customerData.md_tours_firstname || '');
    setLastname(customerData.md_tours_lastname || '');
    setTel(customerData.md_tours_tel || '');
    setEmail(customerData.md_tours_email || '');
    setSelectedTitle(normalizeTitleToEnglish(customerData.md_tours_title) || 'Please Select');

    if (customerData.md_tours_countryname && (customerData.md_tours_countrycode || customerData.countrycode)) {
      setSelectedTele(`(+${customerData.md_tours_countrycode || customerData.countrycode}) ${customerData.md_tours_countryname}`);
    } else {
      setSelectedTele(please);
    }
    setCountrycode(customerData.md_tours_countrycode || customerData.countrycode || '');
    // prefer sys_countries_nameeng from context when available
    const readable = customerData?.sys_countries_nameeng || getReadableCountry(customerData);
    setSelectedCountry(readable || please);
  }, [customerData]);

  // displayTitle: show localized label while selectedTitle remains the stored English value
  const displayTitle = useMemo(() => {
    if (!selectedTitle || selectedTitle === 'Please Select' || selectedTitle === please) return please;
    // try to find by English stored value
    const found = TITLE_ENTRIES.find((it) => it.en === selectedTitle);
    if (found) return found.tKey ? (t(found.tKey) || found.en) : found.en;
    // fallback: if selectedTitle happens to be a localized label, just return it
    return selectedTitle;
  }, [selectedTitle, selectedLanguage]);

  // Debug: log selectedCountry whenever it changes
  useEffect(() => {
    console.log('TourContactScreen selectedCountry:', selectedCountry);
  }, [selectedCountry]);

  // Resolve a language-aware display name for the currently selected country.
  // Use selectedCountryFromModal if set (from Country Modal), otherwise use countryId (from Phone Modal)
  const displayCountry = useMemo(() => {
    // Country field should show what was chosen in Country Modal (if any)
    if (selectedCountryFromModal) return selectedCountryFromModal;
    if (countryIdCountry) {
      const found = telePhone.find((it) => String(it.sys_countries_id) === String(countryIdCountry));
      if (found) return getCountryName(found) || please;
    }
    return please;
  }, [telePhone, countryIdCountry, selectedCountryFromModal, selectedLanguage]);

  /** Helpers */
  const getTelephoneCode = (item) =>
    item?.sys_countries_telephone ||
    item?.sys_countries_tel ||
    item?.telephone ||
    item?.calling_code ||
    item?.phonecode ||
    item?.country_tel ||
    '';

  const filteredPhone = useMemo(() => {
    return telePhone.filter((item) => {
      const eng = getCountryName(item);
      const code = getTelephoneCode(item);
      const label = `${code ? `(+${code}) ` : ''}${eng}`.toLowerCase();
      return label.includes(searchQueryPhone.toLowerCase());
    });
  }, [telePhone, searchQueryPhone]);

  const filteredCountry = useMemo(() => {
    return telePhone.filter((item) => {
      const eng = getCountryName(item);
      return (eng || '').toLowerCase().includes(searchQueryCountry.toLowerCase());
    });
  }, [telePhone, searchQueryCountry]);

  /** Summary */
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    const tourid =
      tourParam?.tourId || tourParam?.tourid || tourParam?.TourID || params.tourId || params.tourid;
    if (!tourid) return;

    const body = {
      tourid: Number(tourid),
      date: bookingDateParam
        ? moment(bookingDateParam).format('YYYY-MM-DD')
        : params.date
          ? moment(params.date).format('YYYY-MM-DD')
          : '',
      adult: Number(passengersParam.adult || 1),
      child: Number(passengersParam.child || 0),
      infant: Number(passengersParam.infant || 0),
      currency: (customerData && (customerData.currency || customerData.md_tours_currency)) || 'THB',
    };

    let mounted = true;
    setSummaryLoading(true);
    fetch('https://thetrago.com/api_tour/V1/tour/GetTourSummary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
      .then((r) => r.json())
      .then((json) => {
        if (!mounted) return;
        if (json && (json.data || json.result)) {
          setSummary(json.data || json.result || json);
        } else if (json && Array.isArray(json)) {
          setSummary(json[0] || null);
        } else {
          setSummary(null);
        }
      })
      .catch(() => mounted && setSummary(null))
      .finally(() => mounted && setSummaryLoading(false));

    return () => {
      mounted = false;
    };
  }, [tourParam, bookingDateParam, passengersParam, customerData, params]);

  /** Save */
  const handleSave = () => {
    // show inline validation immediately (don't rely on the render-time `errors` object
    // because setAttempted is async). Compute validation synchronously here.
    setAttempted(true);

    // ตรวจสอบแต่ละช่องว่ากรอกครบหรือไม่
    const missingTitle = !selectedTitle || selectedTitle === 'Please Select' || selectedTitle === please;
    const missingFirstname = !Firstname || !Firstname.trim();
    const missingLastname = !Lastname || !Lastname.trim();
    const missingCountry = !displayCountry || displayCountry === 'Please Select' || displayCountry === please;
    const missingTelCode = !selectedTele || selectedTele === 'Please Select' || selectedTele === please;
    const missingTel = !tel || !tel.trim();
    const missingEmail = !email || !email.trim();
    const missingTour = !tourParam || (!tourParam.name && !tourParam.NameThai && !tourParam.Title);
    const missingDate = !bookingDateParam;

    // สร้างรายการช่องที่ยังไม่กรอก
    const missingFields = [];
    if (missingTitle) missingFields.push(t('title') || 'คำนำหน้า');
    if (missingFirstname) missingFields.push(t('firstName') || 'ชื่อ');
    if (missingLastname) missingFields.push(t('lastName') || 'นามสกุล');
    if (missingCountry) missingFields.push(t('country') || 'ประเทศ');
    if (missingTelCode) missingFields.push(t('countryCode') || 'รหัสประเทศ');
    if (missingTel) missingFields.push(t('tel') || 'เบอร์โทรศัพท์');
    if (missingEmail) missingFields.push(t('email') || 'อีเมล');
    if (missingTour) missingFields.push(t('tourInformation') || 'ข้อมูลทัวร์');
    if (missingDate) missingFields.push(t('departureDate') || 'วันที่เดินทาง');

    // format validations
    const invalidTelFormat = !missingTel && !isValidPhoneNumber(tel.trim());
    const invalidEmailFormat = !missingEmail && !isValidEmail(email.trim());
    if (invalidTelFormat) missingFields.push(t('invalidPhone') || 'รูปแบบเบอร์โทรไม่ถูกต้อง');
    if (invalidEmailFormat) missingFields.push(t('invalidEmail') || 'รูปแบบอีเมลไม่ถูกต้อง');

    if (missingFields.length > 0) {
        // mark specific fields to show errors immediately (useful when attempted state
        // may not reflect synchronously during the same tick)
        setForceErrors({
          title: missingTitle,
          firstname: missingFirstname,
          lastname: missingLastname,
          country: missingCountry,
          telCode: missingTelCode,
          tel: missingTel || invalidTelFormat,
          email: missingEmail || invalidEmailFormat,
          tour: missingTour,
          date: missingDate,
        });
      const fieldsList = missingFields.join('\n• ');
      const message = `${t('pleaseFillTheseFields') || 'กรุณากรอกข้อมูลในช่องต่อไปนี้'}:\n\n• ${fieldsList}`;

      Alert.alert(
        t('warning') || 'แจ้งเตือน',
        message,
        [{ text: t('ok') || 'ตกลง' }]
      );
      return;
    }

    // Extra guard: ensure invalid formats always block navigation (defensive)
    if (invalidTelFormat || invalidEmailFormat) {
      // show formatting errors immediately
      setForceErrors({ ...forceErrors, tel: invalidTelFormat, email: invalidEmailFormat });
      const msgs = [];
      if (invalidTelFormat) msgs.push(t('invalidPhone') || 'รูปแบบเบอร์โทรไม่ถูกต้อง');
      if (invalidEmailFormat) msgs.push(t('invalidEmail') || 'รูปแบบอีเมลไม่ถูกต้อง');
      const msg = msgs.join('\n');
      console.log('Validation failed - phone/email format', { tel, email, invalidTelFormat, invalidEmailFormat });
      Alert.alert(t('warning') || 'แจ้งเตือน', msg, [{ text: t('ok') || 'ตกลง' }]);
      return;
    }

    try {
      const countryIdToSave = countryIdCountry || countryIdPhone || '';
      const countryNameToSave = selectedCountryFromPhone || selectedCountryFromModal || selectedCountry || '';
      console.log('handleSave - Saving customer data:', {
        countrycode,
        countryIdCountry,
        countryIdPhone,
        countryIdToSave,
        selectedCountryFromModal,
        selectedCountryFromPhone,
        countryNameToSave,
        selectedTitle,
        Firstname,
        Lastname,
        tel,
        email
      });
      updateCustomerData({

        md_tours_countrycode: countrycode,
        md_tours_country: countryIdToSave,
        md_tours_countryname: countryNameToSave,
        md_tours_tel: tel.trim(),
        md_tours_title: selectedTitle,
        md_tours_firstname: Firstname.trim(),
        md_tours_lastname: Lastname.trim(),
        md_tours_email: email.trim(),

      });
      // clear forced errors on successful save
      setForceErrors({});
    } catch { }

    const totalAmount = summary && (summary.subtotal && (summary.subtotal.total || summary.subtotal))
      ? summary.subtotal.total || summary.subtotal
      : computeTotal();

    // Directly navigate to tour payment screen after saving (no alert)
    navigation.navigate('PaymentTour', {
      tour: tourParam,
      date: bookingDateParam || params.date || null,
      adults: Number(passengersParam.adult || 1),
      children: Number(passengersParam.child || 0),
      infants: Number(passengersParam.infant || 0),
      currencySymbol: customerData.symbol || currency || '฿',
      total: totalAmount,
      // ส่งข้อมูล unit_price และ subtotal จาก API
      unitPrice: summary?.unit_price || {},
      subtotal: summary?.subtotal || {},
    });
  };

  /** UI */
  const currency =  customerData?.currency || 'THB';
  const locale = selectedLanguage === 'th' ? 'th-TH' : 'en-US';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.bg }} edges={["left", "right"]}>
      {/* Header with Back Button and animated background like TourDetailScreen */}
      <Animated.View
        style={[
          styles.topHeaderOverlay,
          {
            flexDirection: 'row',
            alignItems: 'center',
            minHeight: headerHeight,
            paddingTop: (insets.top || 0) + 12,
            backgroundColor: scrollY.interpolate({ inputRange: [0, 50], outputRange: ['transparent', '#ffffff'], extrapolate: 'clamp' }),
            borderBottomWidth: scrollY.interpolate({ inputRange: [0, 150], outputRange: [0, 1], extrapolate: 'clamp' }),
            borderBottomColor: 'rgba(0,0,0,0.06)',
            paddingHorizontal: 12,
          },
        ]}
      >
        <Animated.View style={[styles.backButton, { overflow: 'hidden' }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent' }}>
            <Animated.View style={{ position: 'absolute', alignItems: 'center', justifyContent: 'center', width: 40, height: 40, opacity: scrollY.interpolate({ inputRange: [0, 100], outputRange: [1, 0], extrapolate: 'clamp' }) }}>
              <AntDesign name="left" size={24} color="#111827" />
            </Animated.View>
            <Animated.View style={{ position: 'absolute', alignItems: 'center', justifyContent: 'center', width: 40, height: 40, opacity: scrollY.interpolate({ inputRange: [0, 100], outputRange: [0, 1], extrapolate: 'clamp' }) }}>
              <AntDesign name="left" size={24} color="#111827" />
            </Animated.View>
          </TouchableOpacity>
        </Animated.View>

        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Animated.Text style={[styles.topHeaderTitle, { color: scrollY.interpolate({ inputRange: [0, 120], outputRange: ['#0f172a', '#0f172a'], extrapolate: 'clamp' }) }]} numberOfLines={1}>
            {t('contact') || 'Contact'}
          </Animated.Text>
        </View>

        <View style={{ width: 40 }} />
      </Animated.View>

      <Animated.ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 40 + insets.bottom, paddingTop: headerHeight }}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
        scrollEventThrottle={16}
      >
        {/* --------- TRAVELER --------- */}
        <SectionCard title={t('travelerDetail')}>
          <Field label={t('title') || 'Title'} error={!!errors.title || !!forceErrors.title}>
            <Select
              onPress={() => setTitleModalVisible(true)}
              text={displayTitle}
              error={!!errors.title || !!forceErrors.title}
            />
          </Field>

          {/* Title Modal */}
          <PickerModal
            visible={isTitleModalVisible}
            onClose={() => setTitleModalVisible(false)}
            data={titleOptions}
            renderLabel={(it) => it.label}
            onPick={(it) => {
              setSelectedTitle(it.value);
              setForceErrors((p) => ({ ...p, title: false }));
              setTitleModalVisible(false);
            }}
          />

          <Row>
            <TextField
              value={Firstname}
              onChangeText={setFirstname}
              placeholder={t('firstName') || 'First Name'}
              error={!!errors.firstname}
              style={{ flex: 1, marginRight: 8 }}
            />
            <TextField
              value={Lastname}
              onChangeText={setLastname}
              placeholder={t('lastName') || 'Last Name'}
              error={!!errors.lastname}
              style={{ flex: 1 }}
            />
          </Row>

          <Field label={t('country') || 'Country'} error={!!errors.country || !!forceErrors.country}>
            <Select
              onPress={() => setCountryModalVisible(true)}
              text={displayCountry || please}
              error={!!errors.country || !!forceErrors.country}
            />
          </Field>

          {/* Country Modal */}
          <PickerModal
            visible={isCountryModalVisible}
            onClose={() => setCountryModalVisible(false)}
            data={filteredCountry}
            searchPlaceholder={t('searchCountry') || 'Search country'}
            onSearch={setSearchQueryCountry}
            keyExtractor={(item, idx) => (item.sys_countries_id ? String(item.sys_countries_id) : String(idx))}
            renderLabel={(item) => getCountryName(item)}
            onPick={(item) => {
              const displayName = getCountryName(item) || '';
              console.log('Country Modal - Selected:', {
                countryId: item.sys_countries_id,
                displayName: displayName,
                item: item
              });
              setCountryIdCountry(item.sys_countries_id || '');
              setSelectedCountryFromModal(displayName || please);
              // clear forced country error when user explicitly picks a country (even 'Please Select')
              setForceErrors((p) => ({ ...p, country: false }));
              setCountryModalVisible(false);
              setSearchQueryCountry('');
            }}
          />
        </SectionCard>

        {/* --------- CONTACT --------- */}
        <SectionCard title={t('contactDetails')}>
          <Field
            label={t('phone') || 'Phone'}
            error={!!errors.telCode || !!forceErrors.telCode || !!errors.tel || !!forceErrors.tel}
          >
            <Row>
              <Select
                style={{ flex: 0.46, marginRight: 8 }}
                onPress={() => setPhoneModalVisible(true)}
                text={selectedTele || please}
                error={!!errors.telCode || !!forceErrors.telCode}
              />
              <TextField
                value={tel}
                onChangeText={(v) => { setTel(v); setForceErrors((p) => ({ ...p, tel: false })); }}
                placeholder={t('phone') || 'Phone'}
                keyboardType="phone-pad"
                error={!!errors.tel || !!forceErrors.tel}
                onBlur={() => setTelTouched(true)}
                style={{ flex: 0.54 }}
              />
            </Row>
          {/* Phone Modal */}
          <PickerModal
            visible={isPhoneModalVisible}
            onClose={() => setPhoneModalVisible(false)}
            data={filteredPhone}
            searchPlaceholder={t('searchCountry') || 'Search country'}
            onSearch={setSearchQueryPhone}
            keyExtractor={(item, idx) => (item.sys_countries_id ? String(item.sys_countries_id) : String(idx))}
            renderLabel={(item) => {
              const name = getCountryName(item) || '';
              const code = getTelephoneCode(item);
              return name === please ? please : `${code ? `(+${code}) ` : ''}${name}`;
            }}
            onPick={(item) => {
              const code = getTelephoneCode(item);
              const name = getCountryName(item) || '';
              const label = name === please ? please : `${code ? `(+${code}) ` : ''}${name}`;
              console.log('Phone Modal - Selected:', {
                countryId: item.sys_countries_id,
                countryName: name,
                countrycode: code,
                item: item
              });
              setSelectedTele(label);
              // phone-specific ID/name (do NOT overwrite Country modal selection)
              setCountryIdPhone(item.sys_countries_id || '');
              setSelectedCountryFromPhone(name || please);
              setCountrycode(code || '');
              // clear forced phone/country errors when picking phone country
              setForceErrors((p) => ({ ...p, telCode: false, country: false }));
              setPhoneModalVisible(false);
              setSearchQueryPhone('');
            }}
          />
          {errors.tel ? (
            <Text style={{ color: palette.danger, marginTop: 8, fontSize: 13 }}>{t('invalidPhone') || 'รูปแบบเบอร์โทรไม่ถูกต้อง'}</Text>
          ) : null}
          </Field>

          <Field label={t('email') || 'Email'} error={!!errors.email || !!forceErrors.email}>
            <TextField
              value={email}
              onChangeText={(v) => { setEmail(v); setForceErrors((p) => ({ ...p, email: false })); }}
              placeholder={t('email') || 'Email'}
              keyboardType="email-address"
              error={!!errors.email || !!forceErrors.email}
              onBlur={() => setEmailTouched(true)}
            />
            {errors.email ? (
              <Text style={{ color: palette.danger, marginTop: 8, fontSize: 13 }}>{t('invalidEmail') || 'รูปแบบอีเมลไม่ถูกต้อง'}</Text>
            ) : null}
          </Field>
        </SectionCard>

        {/* --------- SUMMARY --------- */}
        <SectionCard title={t('bookingSummary')}>
          {/* Tour Name */}
          <View style={ui.summaryTourHeader}>
            <Text style={ui.summaryTourName} numberOfLines={2}>
              {tourParam?.name || tourParam?.NameThai || tourParam?.Title || ''}
            </Text>
          </View>

          {/* Tour Type Row */}
          {tourTypeParam && (
            <View style={ui.summaryItemRow}>
              <Text style={ui.summaryItemLabel}>{t('tourType') || 'Tourtype'}</Text>
              <Text style={ui.summaryItemValue}>{tourTypeParam}</Text>
            </View>
          )}

          {/* Departure Date Row */}
          {bookingDateParam && (
            <View style={ui.summaryItemRow}>
              <Text style={ui.summaryItemLabel}>{t('departureDate') || 'Departure Date'}</Text>
              <Text style={ui.summaryItemValue}>{moment(bookingDateParam).format('DD MMM YYYY')}</Text>
            </View>
          )}

          <Divider style={{ marginVertical: 12 }} />

          {summaryLoading ? (
            <View style={{ paddingVertical: 8 }}>
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow wide />
            </View>
          ) : summary ? (
            <>

              {/* Pax + unit price */}
              {summary.subtotal &&
                summary.pax &&
                (() => {
                  const seen = new Set();
                  return Object.keys(summary.pax || {}).map((key) => {
                    const labelKey =
                      key === 'adult' ? (t('adult') || 'ผู้ใหญ่') : key === 'child' ? (t('child') || 'เด็ก') : (t('infant') || 'ทารก');
                    if (seen.has(labelKey)) return null;
                    seen.add(labelKey);

                    const count = Number(summary.pax[key] || 0);
                    if (count <= 0) return null;

                    const unit = summary.subtotal[key] || 0;
                    return (
                      <View key={key} style={ui.summaryItemRow}>
                        <Text style={ui.summaryItemLabel}>{`${labelKey} x${count}`}</Text>
                        <Text style={ui.summaryItemValue}>{`${customerData?.symbol || 'THB'} ${money(unit, locale)}`}</Text>
                      </View>
                    );
                  });
                })()}

              <Divider style={{ marginVertical: 12 }} />


              {/* Total Price */}
              <View style={ui.summaryTotalRow}>
                <Text style={ui.summaryTotal}>{t('totalPrice') || 'ยอดรวม'}</Text>
                <Text style={ui.summaryTotalValue}>
                  {`${customerData?.symbol || 'THB'} ${money((summary.subtotal && (summary.subtotal.total || summary.subtotal)) || 0, locale)}`}
                </Text>
              </View>
            </>
          ) : (
            <>
              {/* Total Price */}
              <View style={ui.summaryTotalRow}>
                <Text style={ui.summaryTotal}>{t('totalPrice') || 'ยอดรวม'}</Text>
                <Text style={ui.summaryTotalValue}>
                  {`${customerData?.symbol || 'THB'} ${money(computeTotal(), locale)}`}
                </Text>
              </View>
            </>
          )}
        </SectionCard>

        {/* Save CTA */}
        <TouchableOpacity activeOpacity={0.9} onPress={handleSave} style={[ui.cta, { marginTop: 12, backgroundColor: palette.primary }]}>
          <Text style={ui.ctaText}>{t('next') || 'Next'}</Text>
        </TouchableOpacity>
      </Animated.ScrollView>
    </SafeAreaView>
  );
};

/** ---------- REUSABLE UI ---------- */
const SectionCard = ({ title, children }) => {
  return (
    <View style={ui.card}>
      <View style={ui.cardHeader}>
        <View style={ui.tab}>
          <Text style={ui.tabText}>{title}</Text>
        </View>
      </View>
      <View style={{ padding: 16 }}>{children}</View>
    </View>
  );
};

const Field = ({ label, children, error }) => (
  <View style={{ marginBottom: 12 }}>
    <Text style={[ui.label, error && { color: palette.danger }]}>{label}</Text>
    {children}
  </View>
);

const Row = ({ children, style }) => <View style={[ui.row, style]}>{children}</View>;

const Divider = () => <View style={ui.divider} />;

const Select = ({ text, onPress, style, error }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.85}
    style={[
      ui.select,
      error && { borderColor: palette.danger, backgroundColor: '#FFF5F5' },
      style
    ]}
  >
    <Text style={ui.selectText} numberOfLines={1} ellipsizeMode="tail">
      {text}
    </Text>
    <AntDesign name="down" size={16} color={palette.primary} />
  </TouchableOpacity>
);

const TextField = ({ error, style, ...rest }) => (
  <TextInput
    {...rest}
    placeholderTextColor={palette.textDim}
    style={[
      ui.input,
      error && { borderColor: palette.danger, backgroundColor: '#FFF5F5' },
      style,
    ]}
  />
);

const PickerModal = ({
  visible,
  onClose,
  data,
  onPick,
  onSearch,
  searchPlaceholder = 'Search…',
  renderLabel,
  keyExtractor,
}) => {
  const { t } = useLanguage();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity activeOpacity={1} style={ui.modalOverlay} onPress={onClose}>
        <TouchableWithoutFeedback>
          <View style={ui.modalCard}>
            {!!onSearch && (
              <TextInput
                placeholder={searchPlaceholder}
                onChangeText={onSearch}
                placeholderTextColor={palette.textDim}
                style={[ui.input, { marginBottom: 8 }]}
              />
            )}
            <FlatList
              data={data}
              keyExtractor={keyExtractor || ((_, idx) => String(idx))}
              renderItem={({ item }) => (
                <TouchableOpacity style={ui.optionItem} onPress={() => onPick && onPick(item)}>
                  <Text style={ui.optionText} numberOfLines={1} ellipsizeMode="tail">
                    {typeof renderLabel === 'function' ? renderLabel(item) : String(item)}
                  </Text>
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: palette.line }} />}
              style={{ maxHeight: '100%' }}
            />
            {/* Close button removed per request - modal now closes only via selection or system back */}
          </View>
        </TouchableWithoutFeedback>
      </TouchableOpacity>
    </Modal>
  );
};

const SkeletonRow = ({ wide = false }) => (
  <View
    style={{
      height: 16,
      marginVertical: 6,
      borderRadius: 8,
      backgroundColor: '#ECEEF3',
      width: wide ? '80%' : '50%',
      alignSelf: 'flex-end',
    }}
  />
);

/** ---------- STYLES ---------- */
const ui = StyleSheet.create({
  card: {
    backgroundColor: palette.card,
    borderRadius: 18,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  cardHeader: {
    paddingTop: 6,
    paddingHorizontal: 0,
  },
  tab: {
    backgroundColor: palette.primary,
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    transform: [{ translateY: -6 }],
    shadowColor: palette.primary,
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  tabText: {
    color: '#fff',
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  label: {
    color: palette.text,
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    backgroundColor: palette.field,
    borderColor: palette.fieldBorder,
    borderWidth: 1,
    paddingVertical: Platform.select({ ios: 14, android: 12 }),
    paddingHorizontal: 14,
    borderRadius: 12,
    fontSize: 16,
    color: palette.text,
    minHeight: 48,
  },
  select: {
    backgroundColor: palette.field,
    borderColor: palette.fieldBorder,
    borderWidth: 1,
    paddingVertical: Platform.select({ ios: 12, android: 10 }),
    paddingHorizontal: 14,
    borderRadius: 12,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  selectText: {
    color: palette.text,
    flexShrink: 1,
    marginRight: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: palette.line,
    marginVertical: 8,
  },
  routeTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: palette.text,
    marginBottom: 8,
  },
  meta: {
    color: palette.textDim,
    fontSize: 13,
  },
  itemLabel: {
    color: palette.text,
    fontSize: 14,
  },
  itemValue: {
    color: palette.text,
    fontSize: 14,
    fontWeight: '700',
  },
  subtotal: {
    color: palette.text,
    fontWeight: '600',
  },
  subtotalValue: {
    color: palette.text,
    fontWeight: '700',
  },
  total: {
    color: palette.text,
    fontWeight: '800',
    fontSize: 16,
  },
  totalValue: {
    color: palette.orangeInk,
    fontWeight: '900',
    fontSize: 18,
  },
  // ===== NEW SUMMARY STYLES =====
  summaryTourHeader: {
    marginBottom: 12,
  },
  summaryTourName: {
    fontSize: 18,
    fontWeight: '700',
    color: palette.text,
    lineHeight: 24,
  },
  summaryMetaRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  metaChip: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  metaChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: palette.textDim,
  },
  pricePerPersonLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: palette.textDim,
    marginTop: 4,
  },
  summaryItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  summaryItemLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: palette.text,
  },
  summaryItemValue: {
    fontSize: 15,
    fontWeight: '700',
    color: palette.text,
  },
  summarySubtotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summarySubtotal: {
    fontSize: 15,
    fontWeight: '600',
    color: palette.text,
  },
  summarySubtotalValue: {
    fontSize: 15,
    fontWeight: '700',
    color: palette.text,
  },
  summaryTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#FFF5F2',
    borderRadius: 12,
    marginTop: 4,
  },
  summaryTotal: {
    fontSize: 16,
    fontWeight: '700',
    color: palette.text,
  },
  summaryTotalValue: {
    fontSize: 20,
    fontWeight: '800',
    color: palette.primary,
    letterSpacing: 0.5,
  },
  cta: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: palette.primary,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  ctaText: {
    color: '#fff',
    fontWeight: '800',
    letterSpacing: 0.3,
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(17,23,41,0.35)',
    padding: 20,
    justifyContent: 'center',
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    paddingBottom: 0,
    maxHeight: '85%',
  },
  optionItem: {
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  optionText: {
    color: palette.text,
    fontSize: 15,
  },
  modalCloseButton: {
    marginTop: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: palette.primary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.primary,
    alignItems: 'center',
  },
  modalCloseText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default TourContactScreen;
