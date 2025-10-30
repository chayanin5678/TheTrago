import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import ipAddress from '../../config/ipconfig';
import { useMemo } from 'react';
import { useLanguage } from './LanguageContext';
import { useCustomer } from './CustomerContext';
import { LinearGradient } from 'expo-linear-gradient';
import { styles as customerStyles } from '../../styles/CSS/CustomerInfoStyles';
import { AntDesign } from '@expo/vector-icons';

const local = StyleSheet.create({
  selectCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingRight: 12,
    minHeight: 56,
  },
  iconInline: { position: 'relative', marginLeft: 8 }, // override absolute
  textShrink: { flexShrink: 1 }, // กันข้อความยาวดันไอคอน
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

  // Prefill from customerData when available
  const [selectedTitle, setSelectedTitle] = useState(customerData.selectedTitle || 'Please Select');
  const [Firstname, setFirstname] = useState(customerData.Firstname || '');
  const [Lastname, setLastname] = useState(customerData.Lastname || '');
  const [tel, setTel] = useState(customerData.tel || '');
  const [email, setEmail] = useState(customerData.email || '');
  // Country picker state (use same pattern as Profile/CustomerInfo)
  const [telePhone, setTelePhone] = useState([]);
  const [isCountryModalVisible, setCountryModalVisible] = useState(false);
  const [searchQueryCountry, setSearchQueryCountry] = useState('');
  // selectedCountry will store the plain country name; selectedTele stores the display label like "(+66) Thailand"
  // Default to Thailand (+66) when no customerData present
  const defaultCountryName = t('countryThailand') || 'Thailand';
  const defaultCountryCode = '66';
  const [selectedCountry, setSelectedCountry] = useState(
    customerData.country || defaultCountryName
  );
  const [selectedTele, setSelectedTele] = useState(
    customerData.md_tours_country && (customerData.md_tours_countrycode || customerData.countrycode)
      ? `(+${customerData.md_tours_countrycode || customerData.countrycode}) ${customerData.md_tours_country}`
      : `(+${defaultCountryCode}) ${defaultCountryName}`
  );
  const [countrycode, setCountrycode] = useState(customerData.md_tours_countrycode || customerData.countrycode || defaultCountryCode);
  const [countryId, setCountryId] = useState(customerData.countryId || '');
  // currency removed from this screen

  useEffect(() => {
    // update local fields if customerData changes externally
    setFirstname(customerData.Firstname || '');
    setLastname(customerData.Lastname || '');
    setTel(customerData.tel || '');
    setEmail(customerData.email || '');
    setSelectedTitle(customerData.selectedTitle || 'Please Select');
    setSelectedTele(
      customerData.md_tours_country && (customerData.md_tours_countrycode || customerData.countrycode)
        ? `(+${customerData.md_tours_countrycode || customerData.countrycode}) ${customerData.md_tours_country}`
        : (t('pleaseSelect') || 'Please Select')
    );
    setCountrycode(customerData.md_tours_countrycode || customerData.countrycode || defaultCountryCode);
    // if customerData does not provide a country, ensure defaults remain Thailand
    if (!customerData || (!customerData.md_tours_country && !customerData.country)) {
      setSelectedCountry(defaultCountryName);
      setSelectedTele(`(+${defaultCountryCode}) ${defaultCountryName}`);
    }
  }, [customerData]);

  useEffect(() => {
    // fetch telephone/country list
    let mounted = true;
    fetch(`${ipAddress}/telephone`)
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return;
        if (data && Array.isArray(data.data)) {
          setTelePhone([
            { sys_countries_telephone: '', sys_countries_nameeng: t('pleaseSelect') || 'Please Select', sys_countries_code: '' },
            ...data.data,
          ]);
        } else {
          setTelePhone([{ sys_countries_telephone: '', sys_countries_nameeng: t('pleaseSelect') || 'Please Select', sys_countries_code: '' }]);
        }
      })
      .catch(() => {
        if (!mounted) return;
        setTelePhone([{ sys_countries_telephone: '', sys_countries_nameeng: t('pleaseSelect') || 'Please Select', sys_countries_code: '' }]);
      });
    return () => { mounted = false; };
  }, []);

  const filteredCountry = useMemo(() => {
    return telePhone.filter((item) => {
      const eng = item.sys_countries_nameeng || '';
      const telPrefix = item.sys_countries_telephone ? `(+${item.sys_countries_telephone}) ` : '';
      const combined = `${telPrefix}${eng}`.toLowerCase();
      return combined.includes(searchQueryCountry.toLowerCase());
    });
  }, [telePhone, searchQueryCountry]);

  // Title modal state and options (reuse CustomerInfo pattern)
  const [isTitleModalVisible, setTitleModalVisible] = useState(false);
  const getTitleOptions = (t) => ([
    { label: t('pleaseSelect') || 'Please Select', value: 'Please Select' },
    { label: t('mr') || 'Mr.', value: 'Mr.' },
    { label: t('mrs') || 'Mrs.', value: 'Mrs.' },
    { label: t('ms') || 'Ms.', value: 'Ms.' },
    { label: t('master') || 'Master', value: 'Master' },
  ]);
  const titleOptions = getTitleOptions(t);

  const validate = () => {
    const errors = {};
    if (!Firstname || Firstname.trim() === '') errors.firstname = true;
    if (!tel || tel.trim() === '') errors.tel = true;
    if (!email || email.trim() === '') errors.email = true;
    return errors;
  };

  const parseNumber = (v) => {
    if (!v) return 0;
    try {
      const s = String(v).replace(/[^0-9.\-]+/g, '');
      const n = Number(s);
      return isNaN(n) ? 0 : n;
    } catch (e) { return 0; }
  };

  const computeTotal = () => {
    const perAdult = parseNumber(tourPriceParam);
    const adults = Number(passengersParam.adult || 1);
    return perAdult * adults;
  };

  const handleSave = () => {
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      Alert.alert(t('warning') || 'Warning', t('pleaseFillRequiredFields') || 'Please fill required fields (name, phone, email)');
      return;
    }

    // Update customer context
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
        // tours-specific fields
        md_tours_countrycode: countrycode,
        md_tours_country: selectedCountry,
        md_tours_tel: tel.trim(),
      });
    } catch (e) {
      // ignore
    }

    Alert.alert('', t('saved') || 'Saved');
    if (navigation && navigation.goBack) navigation.goBack();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F6F7FB' }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingTop: insets.top + 12 }}>

        {/* Traveler card */}
        <View style={[customerStyles.promo, { marginBottom: 16 }]}>
          <Text style={customerStyles.sectionHeading}>{t('travelerDetail') || 'Traveler Detail'}</Text>

          <Text style={customerStyles.textHead}>{t('title') || 'Title'}</Text>
          <TouchableOpacity style={[customerStyles.button]} onPress={() => setTitleModalVisible(true)}>
            <Text style={customerStyles.buttonText}>{selectedTitle === 'Please Select' ? (t('pleaseSelect') || 'Please Select') : selectedTitle}</Text>
            <AntDesign name="down" size={18} color="#FD501E" style={customerStyles.icon} />
          </TouchableOpacity>

          {/* Title selection modal */}
          <Modal visible={isTitleModalVisible} transparent animationType="fade" onRequestClose={() => setTitleModalVisible(false)}>
            <View style={customerStyles.modalOverlay}>
              <View style={customerStyles.modalContentPre}>
                <FlatList
                  data={titleOptions}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={customerStyles.optionItem}
                      onPress={() => { setSelectedTitle(item.value); setTitleModalVisible(false); }}
                    >
                      <Text style={customerStyles.optionText}>{item.label}</Text>
                    </TouchableOpacity>
                  )}
                  keyExtractor={(item, idx) => idx.toString()}
                />
              </View>
            </View>
          </Modal>

          <View style={{ flexDirection: 'row', marginTop: 8, alignItems: 'center' }}>
            <TextInput value={Firstname} onChangeText={setFirstname} placeholder={t('firstName') || 'First Name'} style={[customerStyles.input, { flex: 1, marginRight: 8 }]} placeholderTextColor="#374151" />
            <TextInput value={Lastname} onChangeText={setLastname} placeholder={t('lastName') || 'Last Name'} style={[customerStyles.input, { flex: 1 }]} placeholderTextColor="#374151" />
          </View>

          <Text style={[customerStyles.textHead, { marginTop: 8 }]}>{t('country') || 'Country'}</Text>
          <TouchableOpacity style={[customerStyles.button, { paddingRight: 12, paddingVertical: 14, minHeight: 56 }]} onPress={() => setCountryModalVisible(true)}>
            <Text style={[customerStyles.buttonText, { flexWrap: 'wrap', lineHeight: 18 }]}>{selectedCountry || (t('pleaseSelect') || 'กรุณาเลือก')}</Text>
            <AntDesign name="down" size={16} color="#FD501E" style={[customerStyles.icon, { marginLeft: 8 }]} />
          </TouchableOpacity>

          {/* Country selection modal (searchable) */}
          <Modal visible={isCountryModalVisible} transparent animationType="fade" onRequestClose={() => setCountryModalVisible(false)}>
            <View style={customerStyles.modalOverlay}>
              <View style={customerStyles.modalContent}>
                <TextInput
                  placeholder={t('searchCountry') || 'Search country'}
                  value={searchQueryCountry}
                  onChangeText={setSearchQueryCountry}
                  style={customerStyles.textInput}
                  placeholderTextColor="#374151"
                />
                <FlatList
                  data={filteredCountry}
                  renderItem={({ item }) => {
                    const isPlaceholder = (item.sys_countries_nameeng === (t('pleaseSelect') || 'Please Select'));
                    const displayName = item.sys_countries_nameeng || '';
                    const teleLabel = isPlaceholder ? (t('pleaseSelect') || 'Please Select') : `(+${item.sys_countries_telephone}) ${displayName}`;
                    return (
                      <TouchableOpacity style={customerStyles.optionItem} onPress={() => {
                        setSelectedTele(teleLabel);
                        setSelectedCountry(isPlaceholder ? (t('pleaseSelect') || 'Please Select') : displayName);
                        setCountryId(item.sys_countries_id || '');
                        setCountrycode(item.sys_countries_telephone || '');
                        setCountryModalVisible(false);
                        setSearchQueryCountry('');
                      }}>
                        <Text style={customerStyles.optionText}>{teleLabel}</Text>
                      </TouchableOpacity>
                    );
                  }}
                  keyExtractor={(item, idx) => (item.sys_countries_id ? String(item.sys_countries_id) : idx.toString())}
                />
              </View>
            </View>
          </Modal>
        </View>

        {/* Contact card */}
        <View style={[customerStyles.promo, { marginBottom: 16 }]}>
          <Text style={customerStyles.sectionHeading}>{t('contactDetails') || 'Contact Details'}</Text>

          <Text style={customerStyles.textHead}>{t('phone') || 'Phone'}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity
              onPress={() => setCountryModalVisible(true)}
              style={[customerStyles.button, local.selectCompact, { flex: 0.44, marginRight: 8 }]}
            >
              <Text
                style={[customerStyles.buttonText, local.textShrink]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {selectedTele || (t('pleaseSelect') || '(+66) Thailand')}
              </Text>
              <AntDesign name="down" size={16} color="#FD501E" style={local.iconInline} />
            </TouchableOpacity>

            <TextInput
              value={tel}
              onChangeText={setTel}
              placeholder={t('phone') || 'Phone'}
              style={[customerStyles.input, { flex: 0.58, marginHorizontal: 0 }]}
              placeholderTextColor="#374151"
              keyboardType="phone-pad"
            />
          </View>

          <Text style={[customerStyles.textHead, { marginTop: 12 }]}>{t('email') || 'Email'}</Text>
          <TextInput value={email} onChangeText={setEmail} placeholder={t('email') || 'Email'} style={customerStyles.input} placeholderTextColor="#374151" keyboardType="email-address" />

          {/* Company field removed as requested */}
        </View>

        {/* Booking summary (currency selector removed) */}
        <View style={[customerStyles.premiumContent, { marginBottom: 16 }]}>
          <Text style={customerStyles.sectionHeading}>{t('bookingSummary') || 'Booking Summary'}</Text>
          <Text style={customerStyles.routeText}>{tourParam?.name || tourParam?.NameThai || tourParam?.Title || ''}</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 }}>
            <Text style={customerStyles.premiumLabel}>{t('totalPrice') || 'Total Price'}</Text>
            <Text style={customerStyles.premiumFare}>{new Intl.NumberFormat(selectedLanguage === 'th' ? 'th-TH' : 'en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(computeTotal())}</Text>
          </View>
        </View>

        <TouchableOpacity onPress={handleSave} activeOpacity={0.85} style={{ marginBottom: 40 }}>
          <LinearGradient colors={["#FD501E", "#FF7A3A"]} style={{ paddingVertical: 14, borderRadius: 12, alignItems: 'center' }}>
            <Text style={{ color: '#fff', fontWeight: '800', fontSize: 16 }}>{t('save') || 'Save'}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default TourContactScreen;
