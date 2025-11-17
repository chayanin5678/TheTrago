import React, { useRef, useState } from 'react';
import { View, Text, Image, Alert, StyleSheet, Dimensions, Animated, Platform, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguage } from './LanguageContext';
import { useCustomer } from './CustomerContext';
import LogoTheTrago from './../../components/component/Logo';
import Ionicons from '@expo/vector-icons/Ionicons';
import { AntDesign } from '@expo/vector-icons';
import moment from 'moment';

const { width } = Dimensions.get('window');

const TourPaymentSuccess = ({ navigation, route }) => {
  const { t } = useLanguage();
  const { customerData } = useCustomer();
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;
  const AnimatedScrollView = Animated.createAnimatedComponent(Animated.ScrollView);

  const headerTranslateY = scrollY.interpolate({ inputRange: [0, 120], outputRange: [0, -40], extrapolate: 'clamp' });
  const logoOpacity = scrollY.interpolate({ inputRange: [0, 80], outputRange: [1, 0], extrapolate: 'clamp' });
  const backIconOpacityWhite = scrollY.interpolate({ inputRange: [0, 100], outputRange: [1, 0], extrapolate: 'clamp' });
  const backIconOpacityDark = scrollY.interpolate({ inputRange: [0, 100], outputRange: [0, 1], extrapolate: 'clamp' });
  const titleColor = scrollY.interpolate({ inputRange: [0, 120], outputRange: ['transparent', '#0f172a'], extrapolate: 'clamp' });
  const titleOpacity = scrollY.interpolate({ inputRange: [0, 80], outputRange: [0, 1], extrapolate: 'clamp' });

  const { bookingCode, paymentId } = route.params || {};

  // Prefer an explicit bookingStatus passed via navigation params. Fallback to customerData flags.
  const deriveStatusFromFlags = (p) => {
    const pay = Number(p?.md_booking_pay ?? customerData?.md_booking_pay ?? 0);
    const statuspayment = Number(p?.md_booking_statuspayment ?? customerData?.md_booking_statuspayment ?? 0);
    const status = Number(p?.md_booking_status ?? customerData?.md_booking_status ?? 0);
    if (pay === 1 || statuspayment === 1 || status === 1) return 'paid';
    return 'pending';
  };

  const initialBookingStatus = route.params?.bookingStatus ?? deriveStatusFromFlags(route.params);
  const [bookingStatus, setBookingStatus] = useState(initialBookingStatus);
  const [bookingLoading] = useState(false);

  const fmt = (v) => {
    if (v === null || v === undefined) return '-';
    if (typeof v === 'object') {
      if ('adult' in v || 'child' in v || 'infant' in v) {
        const a = v.adult ?? 0;
        const c = v.child ?? 0;
        const i = v.infant ?? 0;
        return `${a} ${t('adultShort') || 'A'}/${c} ${t('childShort') || 'C'}/${i} ${t('infantShort') || 'I'}`;
      }
      try {
        return JSON.stringify(v);
      } catch (e) {
        return String(v);
      }
    }
    return String(v);
  };

  // Debug: examine incoming params and customer data
  const params = route.params || {};
  console.log('TourPaymentSuccess - route.params:', params);
  console.log('TourPaymentSuccess - customerData:', customerData);

  // No API call: bookingStatus should be passed from previous screen.

  // Robust tour object/name extraction (support multiple shapes)
  const tourObj = params.tour ?? params.tourParam ?? params.tourObj ?? params.tourData ?? {};
  const tourName = (
    tourObj?.title || tourObj?.name || tourObj?.NameThai || tourObj?.Title || tourObj?.tourName || params?.title || params?.name || customerData?.md_tours_name || ''
  );

  // Format date nicely
  const formatDate = (d) => {
    if (!d) return '-';
    try {
      // Accept ISO or plain date strings; show time when present
      const raw = String(d);
      const m = moment(raw);
      if (!m.isValid()) return raw;
      const hasTime = /\d{2}:\d{2}/.test(raw);
      return hasTime ? m.format('DD MMM YYYY, HH:mm') : m.format('DD MMM YYYY');
    } catch (e) {
      return String(d);
    }
  };

  // Format passenger counts into a human readable string
  const formatPax = (p) => {
    if (!p) return '-';
    // Support both object shapes and flattened params
    const adult = Number(p.adult ?? p.adults ?? route.params?.adults ?? customerData?.md_tours_adult ?? 0) || 0;
    const child = Number(p.child ?? p.children ?? route.params?.children ?? customerData?.md_tours_child ?? 0) || 0;
    const infant = Number(p.infant ?? p.infants ?? route.params?.infants ?? customerData?.md_tours_infant ?? 0) || 0;
    const parts = [];
    if (adult > 0) parts.push(`${adult} ${t('adult') || 'Adult'}`);
    if (child > 0) parts.push(`${child} ${t('child') || 'Child'}`);
    if (infant > 0) parts.push(`${infant} ${t('infant') || 'Infant'}`);
    if (parts.length === 0) return '';
    return parts.join(', ');
  };

  // Format money with optional currency symbol
  const formatMoney = (n, symbol, symbolOnRight = false) => {
    try {
      const num = Number(n || 0);
      const formatted = num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      if (!symbol) return formatted;
      return symbolOnRight ? `${formatted} ${symbol}` : `${symbol} ${formatted}`;
    } catch (e) {
      return String(n);
    }
  };

  // Format unitPrice which may be a number or an object with pax keys
  const formatUnitPrice = (u) => {
    if (!u) return '-';
    const symbol = route.params?.currencySymbol || customerData?.symbol || '';
    if (typeof u === 'number' || (!isNaN(Number(u)) && typeof u !== 'object')) {
      return formatMoney(u, symbol);
    }
    // if it's an object like { adult: 1200, child: 900 }
    if (typeof u === 'object') {
      const parts = [];
      if (u.adult !== undefined) parts.push(`${t('adultShort') || 'A'}: ${formatMoney(u.adult, symbol)}`);
      if (u.child !== undefined) parts.push(`${t('childShort') || 'C'}: ${formatMoney(u.child, symbol)}`);
      if (u.infant !== undefined) parts.push(`${t('infantShort') || 'I'}: ${formatMoney(u.infant, symbol)}`);
      if (parts.length === 0) return JSON.stringify(u);
      return parts.join(' / ');
    }
    return String(u);
  };

  // Get pax counts from params or customerData
  const paxCounts = () => {
    const params = route.params || {};
    const adult = Number(params.adults ?? params.quantity?.adult ?? customerData?.md_tours_adult ?? 0) || 0;
    const child = Number(params.children ?? params.quantity?.child ?? customerData?.md_tours_child ?? 0) || 0;
    const infant = Number(params.infants ?? params.quantity?.infant ?? customerData?.md_tours_infant ?? 0) || 0;
    return { adult, child, infant };
  };

  const renderUnitPriceDisplay = (u) => {
    const symbol = route.params?.currencySymbol || customerData?.symbol || '';
    const counts = paxCounts();
    if (!u) return formatMoney(route.params?.total ?? customerData?.total ?? 0, symbol);
    if (typeof u === 'object') {
      const rows = [];
      if (u.adult !== undefined && counts.adult > 0) {
        const unit = Number(u.adult || 0);
        const total = unit * counts.adult;
        rows.push(`${formatMoney(unit, symbol)} ×${counts.adult} = ${formatMoney(total, symbol)}`);
      }
      if (u.child !== undefined && counts.child > 0) {
        const unit = Number(u.child || 0);
        const total = unit * counts.child;
        rows.push(`${formatMoney(unit, symbol)} ×${counts.child} = ${formatMoney(total, symbol)}`);
      }
      if (u.infant !== undefined && counts.infant > 0) {
        const unit = Number(u.infant || 0);
        const total = unit * counts.infant;
        rows.push(`${formatMoney(unit, symbol)} ×${counts.infant} = ${formatMoney(total, symbol)}`);
      }
      if (rows.length === 0) return '-';
      return rows.join('\n');
    }
    // primitive number
    return formatMoney(u, symbol);
  };

  

  return (
    <View style={{ flex: 1, backgroundColor: '#F3F4F6' }}>
      <LinearGradient colors={["#ffffff", "#ffffff"]} style={{ flex: 1 }}>
        <Animated.View
          style={[
            stylesLocal.topHeaderOverlay,
            {
              flexDirection: 'row',
              alignItems: 'center',
              minHeight: (insets.top || 0) + 64,
              paddingTop: (insets.top || 0) + 12,
              backgroundColor: scrollY.interpolate({ inputRange: [0, 120], outputRange: ['transparent', '#ffffff'], extrapolate: 'clamp' }),
              borderBottomWidth: scrollY.interpolate({ inputRange: [0, 120], outputRange: [0, 1], extrapolate: 'clamp' }),
              borderBottomColor: 'rgba(0,0,0,0.06)',
              paddingHorizontal: 12,
            },
          ]}
        >
          <Animated.View
            style={[
              stylesLocal.backButton,
              {
                overflow: 'hidden',
                alignItems: 'center',
                justifyContent: 'center',
                // animated circular background like TourDetail
                backgroundColor: scrollY.interpolate({ inputRange: [0, 100], outputRange: ['rgba(0,0,0,0.12)', 'rgba(0,0,0,0.04)'], extrapolate: 'clamp' }),
                shadowColor: '#000',
                shadowOpacity: 0.12,
                shadowRadius: 6,
                elevation: 3,
              },
            ]}
          >
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent' }} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Animated.View style={{ position: 'absolute', alignItems: 'center', justifyContent: 'center', width: 40, height: 40, opacity: backIconOpacityWhite }}>
                <AntDesign name="left" size={24} color="#FFFFFF" />
              </Animated.View>
              <Animated.View style={{ position: 'absolute', alignItems: 'center', justifyContent: 'center', width: 40, height: 40, opacity: backIconOpacityDark }}>
                <AntDesign name="left" size={24} color="#111827" />
              </Animated.View>
            </TouchableOpacity>
          </Animated.View>

            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' , alignSelf: 'center' }}>
              <Animated.View style={{ opacity: logoOpacity, position: 'absolute', left: 0, right: 0, alignItems: 'center' }}>
                <LogoTheTrago />
              </Animated.View>
              <Animated.View style={{ opacity: titleOpacity }}>
                <Animated.Text style={[stylesLocal.topHeaderTitle, { color: titleColor }]} numberOfLines={1}>
                  {tourName ? tourName : (t('paymentComplete') || 'Payment Complete')}
                </Animated.Text>
              </Animated.View>
            </View>

          <View style={{ width: 44 }} />
        </Animated.View>

        <Animated.ScrollView
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          contentContainerStyle={{ padding: 20, paddingTop: 150, paddingBottom: 120 }}
        >
          {/* Move payment status into scrollable content */}
          <View style={{ alignItems: 'flex-end', marginBottom: 8 }}>
            {bookingLoading ? (
              <View style={[stylesLocal.headerStatus, { backgroundColor: 'rgba(59,130,246,0.08)' }]}> 
                <Ionicons name="time" size={18} color="#2563EB" style={{ marginRight: 6 }} />
                <Text style={[stylesLocal.headerStatusText, { color: '#1E3A8A' }]}>{t('processingPayment') || 'Processing...'}</Text>
              </View>
            ) : (
              <View style={[stylesLocal.headerStatus, bookingStatus === 'paid' ? { backgroundColor: 'rgba(16,185,129,0.08)' } : bookingStatus === 'failed' ? { backgroundColor: 'rgba(239,68,68,0.08)' } : { backgroundColor: 'rgba(245,158,11,0.06)' }]}>
                <Ionicons name={bookingStatus === 'paid' ? 'checkmark-circle' : bookingStatus === 'failed' ? 'close-circle' : 'time'} size={20} color={bookingStatus === 'paid' ? '#10B981' : bookingStatus === 'failed' ? '#DC2626' : '#D97706'} style={{ marginRight: 6 }} />
                <Text style={[stylesLocal.headerStatusText, { color: bookingStatus === 'paid' ? '#065F46' : bookingStatus === 'failed' ? '#991B1B' : '#92400E' }]}>
                  {bookingStatus === 'paid' ? (t('paymentComplete') || 'Payment Complete') : bookingStatus === 'failed' ? (t('paymentFailed') || 'Payment Failed') : (t('paymentPending') || 'Payment Pending')}
                </Text>
              </View>
            )}
          </View>
          {bookingStatus === 'failed' ? (
            <View style={stylesLocal.failedWrapper}>
              <View style={stylesLocal.failedCard}>
                <View style={{ alignItems: 'center', marginBottom: 8 }}>
                  <AntDesign name="exclamationcircleo" size={96} color="#374151" />
                </View>

                <Text style={[stylesLocal.failedTitle, { fontSize: 20 }]}>{t('paymentFailed') || 'Payment Failed'}</Text>
                <Text style={[stylesLocal.failedMessage, { marginTop: 8, marginBottom: 18, color: '#374151' }]}>
                  {t('bookingFailed') || 'Square encountered an unexpected error. Please try again or contact support if the problem continues.'}
                </Text>

                <TouchableOpacity
                  style={stylesLocal.cancelButton}
                  onPress={() => {
                    navigation.goBack();
                  }}
                >
                  <Text style={stylesLocal.cancelButtonText}>{t('cancelPayment') || 'Cancel Payment'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <>
              <View style={stylesLocal.ticketCard}>
                <View style={stylesLocal.ticketInner}>
                  {/* Details table */}
                  <View style={stylesLocal.row}><Text style={stylesLocal.label}>{t('tourName') || 'Tour Name'}</Text><Text style={stylesLocal.value}>{fmt(tourName || '-')}</Text></View>
                  {/* Venue removed per request */}
                  <View style={stylesLocal.row}><Text style={stylesLocal.label}>{t('dateTime') || 'Date & Time'}</Text><Text style={stylesLocal.value}>{formatDate(route.params?.date ?? customerData?.md_tours_departdate ?? route.params?.bookingDate)}</Text></View>
                  
                  {/* Payment Channel removed per request */}
                  {(() => {
                    const counts = paxCounts();
                    if (counts.adult > 0 || counts.child > 0 || counts.infant > 0) {
                      return (
                        <View style={stylesLocal.row}>
                          <Text style={stylesLocal.label}>{t('quantity') || 'Quantity'}</Text>
                          <Text style={stylesLocal.value}>{formatPax(route.params?.quantity ?? { adult: route.params?.adults ?? customerData?.md_tours_adult ?? 0, child: route.params?.children ?? customerData?.md_tours_child ?? 0, infant: route.params?.infants ?? customerData?.md_tours_infant ?? 0 })}</Text>
                        </View>
                      );
                    }
                    return null;
                  })()}
                  <View style={stylesLocal.row}>
                    <Text style={stylesLocal.label}>{t('unitPrice') || 'Unit Price'}</Text>
                    <Text style={stylesLocal.value} numberOfLines={5} ellipsizeMode="tail">
                      {renderUnitPriceDisplay(route.params?.unitPrice ?? (customerData?.unitPrice ?? customerData?.total))}
                    </Text>
                  </View>
                  <View style={stylesLocal.row}><Text style={stylesLocal.label}>{t('discount') || 'Discount'}</Text><Text style={stylesLocal.value}>{fmt(route.params?.discount ?? '0')}</Text></View>
                  <View style={stylesLocal.row}><Text style={stylesLocal.label}>{t('serviceFee') || 'Service Fee'}</Text><Text style={stylesLocal.value}>{fmt(route.params?.serviceFee ?? '0')}</Text></View>
                  {/* Shipping Fee removed per request */}
                  {/* Counter Service Fee removed per request */}

                  <View style={[stylesLocal.row, stylesLocal.totalRow]}>
                    <Text style={[stylesLocal.label, { fontWeight: '800' }]}>{t('totalAmount') || 'Total Amount'}</Text>
                    <Text style={[stylesLocal.value, { fontWeight: '900', fontSize: 18 }]}>
                      {formatMoney(route.params?.total ?? customerData?.total ?? 0, route.params?.currencySymbol || customerData?.symbol || '', false)}
                    </Text>
                  </View>
                </View>
              </View>

              <Text style={stylesLocal.sectionTitle}>{t('customerInformation') || 'Customer Information'}</Text>

              <View style={stylesLocal.customerCard}>
                {/* Show customer fields as label/value rows (left/right) to match ticket rows */}
                <View style={stylesLocal.row}>
                  <Text style={stylesLocal.label}>{t('name') || 'Name'}</Text>
                  <Text style={stylesLocal.value}>{`${customerData?.md_tours_title ? (customerData.md_tours_title + ' ') : ''}${customerData?.md_tours_firstname || customerData?.Firstname || ''} ${customerData?.md_tours_lastname || customerData?.Lastname || ''}`.trim() || '-'}</Text>
                </View>

                {customerData?.md_tours_email || customerData?.email ? (
                  <View style={stylesLocal.row}>
                    <Text style={stylesLocal.label}>{t('email') || 'Email'}</Text>
                    <Text style={stylesLocal.value}>{customerData?.md_tours_email || customerData?.email}</Text>
                  </View>
                ) : null}

                {(customerData?.md_tours_countryname || customerData?.md_tours_tel || customerData?.md_tours_countrycode) ? (
                  <View style={stylesLocal.row}>
                    <Text style={stylesLocal.label}>{t('contact') || 'Contact'}</Text>
                    <Text style={stylesLocal.value}>{(customerData?.md_tours_countrycode ? `+${customerData.md_tours_countrycode} ` : '') + (customerData?.md_tours_tel || customerData?.tel || '')}</Text>
                  </View>
                ) : null}
              </View>
            </>
          )}

          
        </Animated.ScrollView>
      </LinearGradient>
    </View>
  );
};

export default TourPaymentSuccess;

const stylesLocal = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  topHeaderOverlay: { position: 'absolute', left: 0, right: 0, top: 0, zIndex: 20 },
  backButton: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  topHeaderTitle: { fontSize: 16, fontWeight: '700' },
  headerLeft: { flex: 1 },
  headerRight: { flex: 1, alignItems: 'flex-end', justifyContent: 'center' },
  headerStatus: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(16,185,129,0.08)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  headerStatusText: { fontWeight: '700', color: '#065F46', fontSize: 13 },
  closeBtn: { position: 'absolute', right: 12, top: 12, padding: 8, borderRadius: 20, backgroundColor: '#F3F4F6' },
  ticketCard: { backgroundColor: 'transparent', marginTop: 24 },
  ticketInner: { backgroundColor: '#E5E7EB', borderRadius: 16, padding: 24, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 10, elevation: 4, position: 'relative', overflow: 'hidden' },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: '#D1D5DB', zIndex: 2 },
  label: { color: '#1F2937', fontSize: 14, fontWeight: '600', width: width * 0.42 },
  value: { color: '#111827', fontSize: 14, fontWeight: '600', width: width * 0.42, textAlign: 'right' },
  totalRow: { paddingTop: 14, paddingBottom: 6, borderBottomWidth: 0, marginTop: 4 },
  sectionTitle: { marginTop: 24, marginBottom: 4, fontSize: 20, fontWeight: '900', color: '#111827' },
  customerCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginTop: 12, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  customerLabel: { color: '#6B7280', fontSize: 13, marginBottom: 4, fontWeight: '600' },
  primaryButton: { backgroundColor: '#2563EB', paddingVertical: 16, borderRadius: 10, alignItems: 'center', shadowColor: '#2563EB', shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  primaryButtonText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  secondaryButton: { backgroundColor: '#FFFFFF', paddingVertical: 16, borderRadius: 10, alignItems: 'center', borderWidth: 2, borderColor: '#D1D5DB', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 },
  secondaryButtonText: { color: '#111827', fontWeight: '800', fontSize: 16 },
  retryButton: { backgroundColor: '#10B981', paddingVertical: 14, borderRadius: 10, alignItems: 'center', shadowColor: '#10B981', shadowOpacity: 0.25, shadowRadius: 6, elevation: 3, marginTop: 6 },
  retryButtonText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  failedWrapper: { alignItems: 'center', marginTop: 8 },
  failedCard: { width: '100%', maxWidth: 720, backgroundColor: '#FFF', borderRadius: 20, padding: 28, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 12, elevation: 6 },
  failedStatusPill: { position: 'absolute', right: 18, top: 18, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF2F2', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#FEE2E2' },
  failedPillText: { color: '#991B1B', fontWeight: '700', marginLeft: 6, fontSize: 13 },
  failedIconRow: { width: '100%', alignItems: 'center', marginBottom: 6 },
  failedIconWrapLarge: { width: 84, height: 84, borderRadius: 42, borderWidth: 1, borderColor: '#FEE2E2', backgroundColor: '#FFF5F5', alignItems: 'center', justifyContent: 'center' },
  failedTitle: { color: '#991B1B', fontSize: 18, fontWeight: '800', marginTop: 8, marginBottom: 6, textAlign: 'center' },
  failedMessage: { color: '#6B7280', fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 12, maxWidth: 520 },
  retryButtonCompact: { backgroundColor: '#10B981', paddingVertical: 10, paddingHorizontal: 22, borderRadius: 12, alignItems: 'center', shadowColor: '#10B981', shadowOpacity: 0.22, shadowRadius: 6, elevation: 4, marginTop: 6 },
  cancelButton: { backgroundColor: '#DC2626', paddingVertical: 14, paddingHorizontal: 18, borderRadius: 10, alignItems: 'center', width: '100%', shadowColor: '#DC2626', shadowOpacity: 0.15, shadowRadius: 8, elevation: 3 },
  cancelButtonText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});
