import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  Modal,
  FlatList,
  StyleSheet,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
// removed gradient for simple CTA
import moment from 'moment';
import { AntDesign } from '@expo/vector-icons';

import ipAddress from '../../config/ipconfig';
import { useLanguage } from './LanguageContext';
import { useCustomer } from './CustomerContext';

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
  const [selectedTitle, setSelectedTitle] = useState(customerData.selectedTitle || 'Please Select');
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

  const [selectedCountry, setSelectedCountry] = useState(getReadableCountry(customerData) || please);
  const [selectedTele, setSelectedTele] = useState(
    customerData.md_tours_country && (customerData.md_tours_countrycode || customerData.countrycode)
      ? `(+${customerData.md_tours_countrycode || customerData.countrycode}) ${customerData.md_tours_country}`
      : please
  );
  const [countrycode, setCountrycode] = useState(customerData.md_tours_countrycode || customerData.countrycode || '');
  const [countryId, setCountryId] = useState(customerData.countryId || '');

  /** Titles */
  const titleOptions = [
    { label: please, value: please },
    { label: t('mr') || 'Mr.', value: t('mr') || 'Mr.' },
    { label: t('mrs') || 'Mrs.', value: t('mrs') || 'Mrs.' },
    { label: t('ms') || 'Ms.', value: t('ms') || 'Ms.' },
    { label: t('master') || 'Master', value: t('master') || 'Master' },
  ];
  const [isTitleModalVisible, setTitleModalVisible] = useState(false);

  /** Validate */
  const [attempted, setAttempted] = useState(false);
  const errors = {
    title: attempted && (!selectedTitle || selectedTitle === 'Please Select' || selectedTitle === please),
    firstname: attempted && (!Firstname || !Firstname.trim()),
    lastname: attempted && (!Lastname || !Lastname.trim()),
    country: attempted && (!selectedCountry || selectedCountry === 'Please Select' || selectedCountry === please),
    telCode: attempted && (!selectedTele || selectedTele === 'Please Select' || selectedTele === please),
    tel: attempted && (!tel || !tel.trim()),
    email: attempted && (!email || !email.trim()),
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
    setFirstname(customerData.Firstname || '');
    setLastname(customerData.Lastname || '');
    setTel(customerData.tel || '');
    setEmail(customerData.email || '');
    setSelectedTitle(customerData.selectedTitle || 'Please Select');

    if (customerData.md_tours_country && (customerData.md_tours_countrycode || customerData.countrycode)) {
      setSelectedTele(`(+${customerData.md_tours_countrycode || customerData.countrycode}) ${customerData.md_tours_country}`);
    } else {
      setSelectedTele(please);
    }
    setCountrycode(customerData.md_tours_countrycode || customerData.countrycode || '');
    const readable = getReadableCountry(customerData);
    setSelectedCountry(readable || please);
  }, [customerData]);

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
      const eng = item.sys_countries_nameeng || item.name || item.country || '';
      const code = getTelephoneCode(item);
      const label = `${code ? `(+${code}) ` : ''}${eng}`.toLowerCase();
      return label.includes(searchQueryPhone.toLowerCase());
    });
  }, [telePhone, searchQueryPhone]);

  const filteredCountry = useMemo(() => {
    return telePhone.filter((item) => {
      const eng = item.sys_countries_nameeng || item.name || item.country || '';
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
    const missingCountry = !selectedCountry || selectedCountry === 'Please Select' || selectedCountry === please;
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

    if (missingFields.length > 0) {
      const fieldsList = missingFields.join('\n• ');
      const message = `${t('pleaseFillTheseFields') || 'กรุณากรอกข้อมูลในช่องต่อไปนี้'}:\n\n• ${fieldsList}`;
      
      Alert.alert(
        t('warning') || 'แจ้งเตือน',
        message,
        [{ text: t('ok') || 'ตกลง' }]
      );
      return;
    }

    try {
      updateCustomerData({
        selectedTitle,
        Firstname: Firstname.trim(),
        Lastname: Lastname.trim(),
        tel: tel.trim(),
        email: email.trim(),
        country: selectedCountry,
        countryId: countryId,
        countrycode: countrycode,
        md_tours_countrycode: countrycode,
        md_tours_country: selectedCountry,
        md_tours_tel: tel.trim(),
      });
    } catch {}

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
  const currency = summary?.currency || customerData?.currency || 'THB';
  const locale = selectedLanguage === 'th' ? 'th-TH' : 'en-US';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.bg }}>
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 40 + insets.bottom }}
        showsVerticalScrollIndicator={false}
      >
        {/* --------- TRAVELER --------- */}
  <SectionCard title={t('travelerDetail')}>
          <Field label={t('title') || 'Title'}>
            <Select 
              onPress={() => setTitleModalVisible(true)} 
              text={selectedTitle === 'Please Select' ? please : selectedTitle}
              error={!!errors.title}
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

          <Field label={t('country') || 'Country'}>
            <Select 
              onPress={() => setCountryModalVisible(true)} 
              text={selectedCountry || please}
              error={!!errors.country}
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
            renderLabel={(item) => item.sys_countries_nameeng || item.name || item.country || ''}
            onPick={(item) => {
              const name = item.sys_countries_nameeng || item.name || item.country || '';
              setSelectedCountry(name || please);
              setCountryId(item.sys_countries_id || '');
              setCountryModalVisible(false);
              setSearchQueryCountry('');
            }}
          />
        </SectionCard>

        {/* --------- CONTACT --------- */}
  <SectionCard title={t('contactDetails')}>
          <Field label={t('phone') || 'Phone'}>
            <Row>
              <Select
                style={{ flex: 0.46, marginRight: 8 }}
                onPress={() => setPhoneModalVisible(true)}
                text={selectedTele || please}
                error={!!errors.telCode}
              />
              <TextField
                value={tel}
                onChangeText={setTel}
                placeholder={t('phone') || 'Phone'}
                keyboardType="phone-pad"
                error={!!errors.tel}
                style={{ flex: 0.54 }}
              />
            </Row>
          </Field>

          {/* Phone Modal */}
          <PickerModal
            visible={isPhoneModalVisible}
            onClose={() => setPhoneModalVisible(false)}
            data={filteredPhone}
            searchPlaceholder={t('searchCountry') || 'Search country'}
            onSearch={setSearchQueryPhone}
            keyExtractor={(item, idx) => (item.sys_countries_id ? String(item.sys_countries_id) : String(idx))}
            renderLabel={(item) => {
              const name = item.sys_countries_nameeng || item.name || item.country || '';
              const code = getTelephoneCode(item);
              return item.sys_countries_nameeng === please ? please : `${code ? `(+${code}) ` : ''}${name}`;
            }}
            onPick={(item) => {
              const code = getTelephoneCode(item);
              const name = item.sys_countries_nameeng || item.name || item.country || '';
              const label = item.sys_countries_nameeng === please ? please : `${code ? `(+${code}) ` : ''}${name}`;
              setSelectedTele(label);
              setCountryId(item.sys_countries_id || '');
              setCountrycode(code || '');
              setPhoneModalVisible(false);
              setSearchQueryPhone('');
            }}
          />

          <Field label={t('email') || 'Email'}>
            <TextField
              value={email}
              onChangeText={setEmail}
              placeholder={t('email') || 'Email'}
              keyboardType="email-address"
              error={!!errors.email}
            />
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
                        <Text style={ui.summaryItemValue}>{`THB ${money(unit, locale)}`}</Text>
                      </View>
                    );
                  });
                })()}

              <Divider style={{ marginVertical: 12 }} />

       
              {/* Total Price */}
              <View style={ui.summaryTotalRow}>
                <Text style={ui.summaryTotal}>{t('totalPrice') || 'ยอดรวม'}</Text>
                <Text style={ui.summaryTotalValue}>
                  {`THB ${money((summary.subtotal && (summary.subtotal.total || summary.subtotal)) || 0, locale)}`}
                </Text>
              </View>
            </>
          ) : (
            <>
              {/* Total Price */}
              <View style={ui.summaryTotalRow}>
                <Text style={ui.summaryTotal}>{t('totalPrice') || 'ยอดรวม'}</Text>
                <Text style={ui.summaryTotalValue}>
                  {`${currency} ${money(computeTotal(), locale)}`}
                </Text>
              </View>
            </>
          )}
        </SectionCard>

        {/* Save CTA */}
        <TouchableOpacity activeOpacity={0.9} onPress={handleSave} style={[ui.cta, { marginTop: 12, backgroundColor: palette.primary }]}>
          <Text style={ui.ctaText}>{t('next') || 'Next'}</Text>
        </TouchableOpacity>
      </ScrollView>
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

const Field = ({ label, children }) => (
  <View style={{ marginBottom: 12 }}>
    <Text style={ui.label}>{label}</Text>
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
    <View style={ui.modalOverlay}>
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
          style={{ maxHeight: '80%' }}
        />
        <TouchableOpacity 
          onPress={onClose} 
          activeOpacity={0.8}
          style={ui.modalCloseButton}
        >
          <Text style={ui.modalCloseText}>{t('close') || 'Close'}</Text>
        </TouchableOpacity>
      </View>
    </View>
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
