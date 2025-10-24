import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Image, Modal, Alert, Dimensions } from 'react-native';
import CrossPlatformStatusBar from '../components/component/CrossPlatformStatusBar';
import LogoTheTrago from '../components/component/Logo';
import { AntDesign } from '@expo/vector-icons';
import Icon from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar } from 'react-native-calendars';
import { MaterialIcons } from '@expo/vector-icons';
import moment from 'moment';
import { useLanguage } from './Screen/LanguageContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform } from 'react-native';
import ipAddress from '../config/ipconfig';
import headStyles from '../styles/CSS/StartingPointScreenStyles';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const isTablet = screenWidth >= 768;
const isLargeTablet = screenWidth >= 1024;
const getResponsiveSize = (phone, tablet, largeTablet) => {
  if (isLargeTablet && largeTablet) return largeTablet;
  if (isTablet && tablet) return tablet;
  return phone;
};

const ToursScreen = ({ navigation }) => {
  const [packageText, setPackageText] = useState('');
  const [departureDate, setDepartureDate] = useState(null);
  const [showDepartModal, setShowDepartModal] = useState(false);
  const [calendarStartDate, setCalendarStartDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }); // string YYYY-MM-DD
  const [isPassengerModalVisible, setPassengerModalVisible] = useState(false);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infant, setInfant] = useState(0);
  const [selectedCurrency, setSelectedCurrency] = useState('THB');
  const [selectedSysmbol, setSelectedSysmbol] = useState('฿');
  const [isCurrencyModalVisible, setCurrencyModalVisible] = useState(false);
  const [currencyList, setCurrencyList] = useState([]);
  const [currencyLoading, setCurrencyLoading] = useState(true);
  const abortControllerRef = useRef(null);
  const { t, selectedLanguage } = useLanguage();

  // Fetch currency list (mirrors SearchFerry behavior)
  useEffect(() => {
    setCurrencyLoading(true);
    // AbortController so we can cancel if needed
    const controller = new AbortController();
    abortControllerRef.current = controller;

    fetch(`${ipAddress}/currency`, { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => {
        if (data && data.status === 'success') {
          setCurrencyList(data.data || []);
        }
      })
      .catch((err) => {
        // ignore errors silently for now
      })
      .finally(() => {
        setCurrencyLoading(false);
      });

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const insets = useSafeAreaInsets();
  const EXTRA_TOP_GUTTER = Platform.OS === 'android' ? 0 : 50;

  return (
     <View style={{ flex: 1 }}>
        {/* Inner light header with rounded bottom (copy of SearchFerry header) */}
        <LinearGradient
          colors={["rgba(255,255,255,0.98)", "rgba(248,250,252,0.95)", "rgba(241,245,249,0.9)"]}
          style={[
            headStyles.headerBg,
            {
              width: '100%',
              marginLeft: '0%',
              paddingTop: insets.top + EXTRA_TOP_GUTTER,
              borderBottomLeftRadius: 56,
              borderBottomRightRadius: 56,
              paddingBottom: 8,
              padding: 10,
              minHeight: hp('12%'),
              borderWidth: 1,
              borderColor: 'rgba(0, 18, 51, 0.08)'
            }
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
                width: '100%'
              }
            ]}
          >
            {/* Back Button - Left (absolute) */}
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
                borderColor: 'rgba(253, 80, 30, 0.1)'
              }}
            >
              <AntDesign name="arrow-left" size={getResponsiveSize(20, 22, 24)} color="#FD501E" />
            </TouchableOpacity>

            {/* Logo - Center */}
            <View style={{ position: 'absolute', left: 0, right: 0, alignItems: 'center' }}>
              <LogoTheTrago />
            </View>

            {/* Currency Button - Right (absolute) */}
            <TouchableOpacity
              onPress={() => setCurrencyModalVisible(true)}
              style={{
                position: 'absolute',
                right: getResponsiveSize(16, 20, 30),
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                padding: getResponsiveSize(10, 12, 14),
                borderRadius: getResponsiveSize(18, 16, 14),
                flexDirection: 'row',
                alignItems: 'center',
                zIndex: 2,
                borderWidth: 1,
                borderColor: 'rgba(253, 80, 30, 0.1)',
                minWidth: getResponsiveSize(70, 80, 90)
              }}
            >
              <Icon
                name="cash-outline"
                size={getResponsiveSize(18, 20, 22)}
                color="#FD501E"
                style={{ marginRight: getResponsiveSize(8, 10, 12) }}
              />
              <Text style={{ fontWeight: 'bold', color: '#FD501E', fontSize: getResponsiveSize(14, 16, 18), letterSpacing: 0.5 }}>
                {selectedCurrency}
              </Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
   

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>

          <View style={styles.formRow}>
            <Text style={styles.label}>{t('tourPackage') || 'Tour Package'}</Text>
            <View style={styles.pillInput}>
              <View style={styles.inputIconWrap}><Icon name="search" size={18} color="#FD501E" /></View>
              <TextInput
                placeholder={t('findPlacesPlaceholder') || 'Find places or your next experience'}
                placeholderTextColor="#64748B"
                value={packageText}
                onChangeText={setPackageText}
                style={[styles.pillInputText, { color: '#1E293B' }]}
              />
            </View>

            <Text style={styles.label}>{t('departureDate') || 'Departure'}</Text>
            <TouchableOpacity
              style={[styles.pillInputTouchable, styles.inputRowTouchable]}
              activeOpacity={0.8}
              onPress={() => setShowDepartModal(true)}
            >
              <View style={styles.inputIconWrap}><MaterialIcons name="event" size={20} color="#FD501E" /></View>
              <Text
                style={{ color: departureDate ? '#222' : '#9CA3AF', flex: 1 }}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {departureDate ? moment(departureDate).locale(selectedLanguage).format('DD MMM YYYY') : (calendarStartDate ? moment(calendarStartDate).locale(selectedLanguage).format('DD MMM YYYY') : (t('departureDate') || 'Departure'))}
              </Text>
            </TouchableOpacity>

            <Text style={styles.label}>{t('passenger') || 'Passenger'}</Text>
            <TouchableOpacity style={[styles.pillInputTouchable, styles.inputRowTouchable]} activeOpacity={0.8} onPress={() => setPassengerModalVisible(true)}>
              <View style={styles.inputIconWrap}><Icon name="people-outline" size={20} color="#FD501E" /></View>
              <Text style={[styles.passengerText, { flex: 1 }]} numberOfLines={1} ellipsizeMode="tail">{adults} {t('adult') || 'Adult'}, {children} {t('child') || 'Child'}, {infant} {t('infant') || 'Infant'}</Text>
            </TouchableOpacity>

            <TouchableOpacity activeOpacity={0.9} style={styles.searchButtonWrapper}>
              <LinearGradient colors={[ '#FD501E', '#FF7A3A' ]} style={styles.searchButtonGradient}>
                <Icon name="search" size={18} color="#fff" style={{ marginRight: 10 }} />
                <Text style={styles.searchText}>{t('searchButton') || 'Search'}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

       

      </ScrollView>
      {/* Calendar modal copied from SearchFerry (departure date) */}
      <Modal
        visible={showDepartModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDepartModal(false)}
        statusBarTranslucent
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0,18,51,0.75)',
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: Platform.OS === 'android' ? 12 : 16,
          paddingVertical: Platform.OS === 'android' ? 16 : 24,
          paddingTop: Platform.OS === 'android' ? 40 : 30,
        }}>
          <View style={{
            backgroundColor: 'rgba(255,255,255,0.98)',
            borderRadius: Platform.OS === 'android' ? 16 : 24,
            padding: Platform.OS === 'android' ? 20 : 24,
            width: Platform.OS === 'android' ? '98%' : '95%',
            maxWidth: Platform.OS === 'android' ? 420 : 450,
            maxHeight: Platform.OS === 'android' ? '90%' : '85%',
            minHeight: Platform.OS === 'android' ? hp('70%') : hp('65%'),
            shadowColor: Platform.OS === 'android' ? 'transparent' : '#001233',
            shadowOpacity: Platform.OS === 'android' ? 0 : 0.25,
            shadowRadius: Platform.OS === 'android' ? 0 : 20,
            shadowOffset: Platform.OS === 'android' ? { width: 0, height: 0 } : { width: 0, height: 8 },
            elevation: Platform.OS === 'android' ? 8 : 20,
            borderWidth: 1,
            borderColor: 'rgba(253, 80, 30, 0.08)',
            transform: [{ scale: showDepartModal ? 1 : 0.9 }],
            opacity: showDepartModal ? 1 : 0,
          }}>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: Platform.OS === 'android' ? 12 : 20,
            }}>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                flex: 1,
              }}>
                <MaterialIcons name="event" size={Platform.OS === 'android' ? 20 : 24} color="#FD501E" style={{ marginRight: 8 }} />
                <Text style={{
                  fontWeight: '800',
                  fontSize: Platform.OS === 'android' ? 16 : 18,
                  color: '#1E293B',
                  letterSpacing: -0.3,
                  flex: 1,
                }} numberOfLines={1}>{t('selectDepartureDate') || 'Select departure date'}</Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowDepartModal(false)}
                style={{
                  backgroundColor: 'rgba(248,250,252,0.8)',
                  padding: Platform.OS === 'android' ? 6 : 8,
                  borderRadius: Platform.OS === 'android' ? 16 : 20,
                }}
                activeOpacity={0.7}
              >
                <AntDesign name="close" size={Platform.OS === 'android' ? 16 : 20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={{ flex: 1, minHeight: Platform.OS === 'android' ? hp('55%') : hp('50%') }}>
              <ScrollView
                style={{ maxHeight: Platform.OS === 'android' ? hp('55%') : hp('50%') }}
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled={true}
              >
                <View style={{
                  backgroundColor: 'rgba(253, 80, 30, 0.06)',
                  borderRadius: Platform.OS === 'android' ? 12 : 16,
                  padding: Platform.OS === 'android' ? 12 : 16,
                  borderWidth: 1,
                  borderColor: 'rgba(253, 80, 30, 0.1)',
                  marginBottom: Platform.OS === 'android' ? 8 : 12,
                  minHeight: Platform.OS === 'android' ? 350 : 380,
                }}>
                  <Calendar
                    current={calendarStartDate}
                    minDate={new Date().toISOString().split('T')[0]}
                    onDayPress={(day) => setCalendarStartDate(day.dateString)}
                    markedDates={{
                      [calendarStartDate]: {
                        selected: true,
                        selectedColor: '#FD501E',
                        selectedTextColor: '#FFFFFF'
                      }
                    }}
                    theme={{
                      backgroundColor: 'transparent',
                      calendarBackground: 'transparent',
                      textSectionTitleColor: '#1E293B',
                      selectedDayBackgroundColor: '#FD501E',
                      selectedDayTextColor: '#FFFFFF',
                      todayTextColor: '#FD501E',
                      dayTextColor: '#1E293B',
                      textDisabledColor: '#94A3B8',
                      arrowColor: '#FD501E',
                      monthTextColor: '#1E293B',
                      textDayFontWeight: '600',
                      textMonthFontWeight: '700',
                      textDayHeaderFontWeight: '600',
                      textDayFontSize: Platform.OS === 'android' ? 14 : 16,
                      textMonthFontSize: Platform.OS === 'android' ? 16 : 18,
                      textDayHeaderFontSize: Platform.OS === 'android' ? 12 : 14,
                    }}
                    enableSwipeMonths={true}
                    firstDay={1}
                    hideExtraDays={false}
                    disableMonthChange={false}
                    hideDayNames={false}
                    showWeekNumbers={false}
                  />
                </View>
              </ScrollView>

              <View style={{ paddingTop: Platform.OS === 'android' ? 16 : 20, paddingBottom: Platform.OS === 'android' ? 8 : 12 }}>
                <TouchableOpacity
                    onPress={() => {
                    if (calendarStartDate) {
                      setDepartureDate(new Date(calendarStartDate));
                      setShowDepartModal(false);
                    } else {
                      Alert.alert(t('warning') || 'Warning', t('pleaseSelectDepartureDate') || 'Please select departure date');
                    }
                  }}
                  style={{
                    backgroundColor: '#FD501E',
                    borderRadius: Platform.OS === 'android' ? 12 : 16,
                    padding: Platform.OS === 'android' ? 14 : 18,
                    alignItems: 'center',
                    elevation: Platform.OS === 'android' ? 4 : 12,
                    borderWidth: 1,
                    borderColor: 'rgba(255, 255, 255, 0.25)',
                  }}
                  activeOpacity={0.85}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <MaterialIcons name="check" size={Platform.OS === 'android' ? 20 : 22} color="#FFFFFF" style={{ marginRight: 8 }} />
                    <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: Platform.OS === 'android' ? 16 : 18, letterSpacing: 0.5 }}>
                      {t('confirmDepartureDate') || 'Confirm'}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
      {/* Currency modal (copied from SearchFerry, but without auto-search on change) */}
      <Modal
        visible={isCurrencyModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCurrencyModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 20, padding: 20, width: '100%', maxWidth: 420, borderWidth: 1, borderColor: 'rgba(253,80,30,0.08)' }}>
            <TouchableOpacity
              onPress={() => setCurrencyModalVisible(false)}
              style={{ position: 'absolute', top: 12, right: 12, zIndex: 10, backgroundColor: '#FFF3ED', padding: 6, borderRadius: 20 }}
            >
              <AntDesign name="close" size={20} color="#FD501E" />
            </TouchableOpacity>

            <Text style={{ fontSize: 18, fontWeight: '800', color: '#FD501E', textAlign: 'center', marginBottom: 12 }}>{t('selectCurrency') || 'Select Currency'}</Text>

            <ScrollView style={{ maxHeight: 300 }}>
              {currencyList.map((currency) => (
                <TouchableOpacity
                  key={currency.md_currency_id}
                  onPress={() => {
                    setSelectedCurrency(currency.md_currency_code);
                    setSelectedSysmbol(currency.md_currency_symbol);
                    setCurrencyModalVisible(false);
                  }}
                  style={{
                    paddingVertical: 12,
                    paddingHorizontal: 10,
                    borderRadius: 12,
                    backgroundColor: selectedCurrency === currency.md_currency_code ? '#FFF3ED' : '#F9F9F9',
                    marginBottom: 10,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <Text style={{ fontSize: 16, color: '#333' }}>{currency.md_currency_symbol} {currency.md_currency_name} ({currency.md_currency_code})</Text>
                  {selectedCurrency === currency.md_currency_code && (
                    <AntDesign name="check-circle" size={18} color="#FD501E" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
      {/* Passenger modal copied from SearchFerry */}
      <Modal
        visible={isPassengerModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPassengerModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }}>
          <View style={{
            backgroundColor: '#fff',
            borderRadius: 32,
            padding: 24,
            width: '100%',
            maxWidth: 420,
            borderWidth: 1,
            borderColor: 'rgba(253, 80, 30, 0.1)'
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <Text style={{ fontWeight: '800', fontSize: 22, color: '#1E293B', letterSpacing: -0.5 }}>{t('selectPassengers') || 'Select Passengers'}</Text>
              <TouchableOpacity onPress={() => setPassengerModalVisible(false)} style={{ backgroundColor: '#F1F5F9', padding: 8, borderRadius: 20 }}>
                <AntDesign name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={{ marginBottom: 20, gap: 16 }}>
              {/* Adults Row */}
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(253, 80, 30, 0.05)', borderRadius: 20, paddingVertical: 12, paddingHorizontal: 16, marginBottom: 10, borderWidth: 1, borderColor: 'rgba(253, 80, 30, 0.1)' }}>
                <Text style={{ color: '#FD501E', fontWeight: '800', fontSize: 16, flex: 1, letterSpacing: -0.3 }}>{t('adults') || 'Adults'}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', flexShrink: 0 }}>
                  <TouchableOpacity onPress={() => setAdults(Math.max(1, adults - 1))} style={{ padding: 4, borderRadius: 16, backgroundColor: adults > 1 ? 'rgba(253, 80, 30, 0.15)' : '#F1F5F9' }}>
                    <Icon name="remove-circle" size={24} color={adults > 1 ? '#FD501E' : '#94A3B8'} />
                  </TouchableOpacity>
                  <Text style={{ fontSize: 18, fontWeight: '800', marginHorizontal: 12, minWidth: 24, textAlign: 'center', color: '#1E293B', letterSpacing: -0.5 }}>{adults}</Text>
                  <TouchableOpacity onPress={() => setAdults(Math.min(10, adults + 1))} style={{ padding: 4, borderRadius: 16, backgroundColor: adults < 10 ? 'rgba(253, 80, 30, 0.15)' : '#F1F5F9' }}>
                    <Icon name="add-circle" size={24} color={adults < 10 ? '#FD501E' : '#94A3B8'} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Children Row */}
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(253, 80, 30, 0.05)', borderRadius: 20, paddingVertical: 12, paddingHorizontal: 16, marginBottom: 10, borderWidth: 1, borderColor: 'rgba(253, 80, 30, 0.1)' }}>
                <Text style={{ color: '#FD501E', fontWeight: '800', fontSize: 16, flex: 1, letterSpacing: -0.3 }}>{t('children') || 'Children'}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', flexShrink: 0 }}>
                  <TouchableOpacity onPress={() => setChildren(Math.max(0, children - 1))} style={{ padding: 4, borderRadius: 16, backgroundColor: children > 0 ? 'rgba(253, 80, 30, 0.15)' : '#F1F5F9' }}>
                    <Icon name="remove-circle" size={24} color={children > 0 ? '#FD501E' : '#94A3B8'} />
                  </TouchableOpacity>
                  <Text style={{ fontSize: 18, fontWeight: '800', marginHorizontal: 12, minWidth: 24, textAlign: 'center', color: '#1E293B', letterSpacing: -0.5 }}>{children}</Text>
                  <TouchableOpacity onPress={() => setChildren(Math.min(10, children + 1))} style={{ padding: 4, borderRadius: 16, backgroundColor: children < 10 ? 'rgba(253, 80, 30, 0.15)' : '#F1F5F9' }}>
                    <Icon name="add-circle" size={24} color={children < 10 ? '#FD501E' : '#94A3B8'} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Infants Row */}
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(253, 80, 30, 0.05)', borderRadius: 20, paddingVertical: 12, paddingHorizontal: 16, borderWidth: 1, borderColor: 'rgba(253, 80, 30, 0.1)' }}>
                <Text style={{ color: '#FD501E', fontWeight: '800', fontSize: 16, flex: 1, letterSpacing: -0.3 }}>{t('infants') || 'Infants'}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', flexShrink: 0 }}>
                  <TouchableOpacity onPress={() => setInfant(Math.max(0, infant - 1))} style={{ padding: 4, borderRadius: 16, backgroundColor: infant > 0 ? 'rgba(253, 80, 30, 0.15)' : '#F1F5F9' }}>
                    <Icon name="remove-circle" size={24} color={infant > 0 ? '#FD501E' : '#94A3B8'} />
                  </TouchableOpacity>
                  <Text style={{ fontSize: 18, fontWeight: '800', marginHorizontal: 12, minWidth: 24, textAlign: 'center', color: '#1E293B', letterSpacing: -0.5 }}>{infant}</Text>
                  <TouchableOpacity onPress={() => setInfant(Math.min(10, infant + 1))} style={{ padding: 4, borderRadius: 16, backgroundColor: infant < 10 ? 'rgba(253, 80, 30, 0.15)' : '#F1F5F9' }}>
                    <Icon name="add-circle" size={24} color={infant < 10 ? '#FD501E' : '#94A3B8'} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <TouchableOpacity onPress={() => setPassengerModalVisible(false)} style={{ backgroundColor: '#FD501E', borderRadius: 20, padding: 16, alignItems: 'center', marginTop: 12, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.2)' }}>
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16, letterSpacing: 0.5 }}>{t('confirmSelection') || 'Confirm'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  container: { padding: 16, paddingBottom: 40, marginTop: 10 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 18,
    marginTop: 0,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 6,
  },
  tabsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  tabItem: { flex: 1, alignItems: 'center', paddingVertical: 6 },
  tabText: { color: '#666', fontWeight: '600', marginTop: 4 },
  tabActiveWrapper: { alignItems: 'center' },
  tabActivePill: { backgroundColor: '#FD501E', paddingVertical: 8, paddingHorizontal: 18, borderRadius: 22, flexDirection: 'row', alignItems: 'center' },
  tabActiveText: { color: '#fff', fontWeight: '700' },

  formRow: { marginTop: 6 },
  label: { color: '#888', marginBottom: 6, marginLeft: 4, fontSize: 13 },
  input: {
    borderWidth: 1,
    borderColor: '#e6e6e6',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
    backgroundColor: '#fff'
  },
  passengerInput: { justifyContent: 'center' },
  passengerText: { color: '#222' },

  searchButton: {
    backgroundColor: '#FD501E',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 6,
    shadowColor: '#FD501E',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 4,
    width: '100%'
  },
  searchText: { color: '#fff', fontWeight: '700', fontSize: 16 },

  /* New input row styles */
  inputRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  inputIconWrap: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#FFF7F5', alignItems: 'center', justifyContent: 'center', marginRight: 10, borderWidth: 1, borderColor: 'rgba(253,80,30,0.06)' },
  inputWithIcon: { flex: 1, paddingLeft: 0 },
  inputRowTouchable: { flexDirection: 'row', alignItems: 'center' },
  /* Pill input styles */
  pillInput: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E6E6E6', borderRadius: 12, paddingVertical: 10, paddingHorizontal: 12, marginBottom: 12, backgroundColor: '#fff' },
  pillInputTouchable: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E6E6E6', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 12, marginBottom: 12, backgroundColor: '#fff' },
  pillInputText: { flex: 1, fontSize: 16, color: '#222' },

  /* Card polish */
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 18,
    marginTop: 12,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 18,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(253,80,30,0.04)'
  },

  /* Search button gradient wrapper */
  searchButtonWrapper: { marginTop: 6 },
  searchButtonGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, paddingHorizontal: 18, borderRadius: 12 },

  sectionTitle: { fontSize: 20, fontWeight: '700', marginTop: 8, marginBottom: 8 },
  titleAccent: { color: '#ff7a3a' },

  headerWrapper: { height: 56, justifyContent: 'center' },
  headerLeft: {
    position: 'absolute',
    left: 16,
    top: 12,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 20,
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(253,80,30,0.1)'
  },
  headerCenter: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  headerRight: {
    position: 'absolute',
    right: 16,
    top: 10,
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(253,80,30,0.1)',
    flexDirection: 'row',
    alignItems: 'center'
  },

  /* New polished header styles */

  headerRowCustom: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 6,
    paddingHorizontal: 18,
  },
  backCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(253,80,30,0.12)'
  },
  currencyPill: {
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(253,80,30,0.12)',
    flexDirection: 'row',
    alignItems: 'center'
  },
  currencyIconWrap: {
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: '#FFF7F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(253,80,30,0.06)'
  },
  currencyText: { color: '#222', fontWeight: '600' },

  bannerWrap: { borderRadius: 12, overflow: 'hidden', marginBottom: 18 },
  banner: { width: '100%', height: 140, backgroundColor: '#eee' },

  heading: { fontSize: 26, fontWeight: '800', marginBottom: 8 },
  headingAccent: { color: '#ff7a3a' },
  description: { color: '#666', fontSize: 15, lineHeight: 22 }
});

export default ToursScreen;
