import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from './Screen/LanguageContext';
import { useCustomer } from './Screen/CustomerContext';
import ipAddress from '../config/ipconfig';
import moment from 'moment';

const { width: screenWidth } = Dimensions.get('window');

const SearchResultsScreen = ({ route, navigation }) => {
  const params = route?.params || {};
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState([]);
  const [total, setTotal] = useState(0);
  const [currencyList, setCurrencyList] = useState([]);
  const [currencyLoading, setCurrencyLoading] = useState(true);
  const { t, selectedLanguage } = useLanguage();
  const { updateCustomerData, customerData } = useCustomer();
  // Currency selection (use params, then customerData, then default THB)
  const [selectedCurrency, setSelectedCurrency] = useState(params.currency || (customerData && customerData.currency) || 'THB');
  const [isCurrencyModalVisible, setCurrencyModalVisible] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState('฿');

  const fetchResults = async () => {
    setLoading(true);
    try {
      const body = {
        lang: params.lang || (selectedLanguage === 'th' ? 'th' : 'en'),
        currency: selectedCurrency || params.currency || 'THB',
        country: params.country || '',
        location: params.location || params.q || '',
        night: params.night || 0,
        day: params.day || 0,
        adult: params.adult || params.adults || 1,
        child: params.child || params.children || 0,
        infant: params.infant || 0,
        date: params.date || (params.departureDate ? moment(params.departureDate).format('YYYY-MM-DD') : ''),
        popular: typeof params.popular !== 'undefined' ? params.popular : 1,
      };

      // If caller passed a tour duration (e.g. for "Half day"), include it in the request
      // API expects TourDuration (or similar) — include when provided in params using common key variants
      const tourDurationValue = params.tourDuration || params.TourDuration || params.duration || params.tour_type || params.tourType;
      if (tourDurationValue) {
        // Normalize boolean/flag values like 'half' to 'Half day' if needed
        let normalized = tourDurationValue;
        if (typeof tourDurationValue === 'string') {
          const lower = tourDurationValue.toLowerCase();
          if (lower === 'half' || lower === 'half-day' || lower === 'half day') {
            normalized = 'Half day';
          }
        }
        body.TourDuration = normalized;
      }

      const res = await fetch('https://thetrago.com/api_tour/V1/tour/GetList', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (json && (json.data || json.result || json.items)) {
        const list = json.data || json.result || json.items;
        setResults(list);
        setTotal(list.length);
      } else if (Array.isArray(json)) {
        setResults(json);
        setTotal(json.length);
      } else {
        setResults([]);
        setTotal(0);
      }
    } catch (e) {
      setResults([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  // Fetch results when selectedCurrency changes (includes initial mount)
  useEffect(() => {
    fetchResults();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCurrency]);

  // load currency list (same pattern as SearchFerry/ToursScreen)
  useEffect(() => {
    setCurrencyLoading(true);
    let mounted = true;
    fetch(`${ipAddress}/currency`)
      .then((res) => res.json())
      .then((data) => {
        if (!mounted) return;
        if (data && data.status === 'success' && Array.isArray(data.data)) {
          setCurrencyList(data.data);
        } else if (data && Array.isArray(data)) {
          setCurrencyList(data);
        }
      })
      .catch(() => {})
      .finally(() => { if (mounted) setCurrencyLoading(false); });
    return () => { mounted = false; };
  }, []);

  // derive selectedSymbol from customerData or currencyList when available
  useEffect(() => {
    // Priority: customerData.symbol/md_currency_symbol -> currencyList match -> sensible fallback
    if (customerData && (customerData.symbol || customerData.md_currency_symbol)) {
      setSelectedSymbol(customerData.symbol || customerData.md_currency_symbol);
      return;
    }

    if (currencyList && currencyList.length > 0 && selectedCurrency) {
      const found = currencyList.find(
        (c) => (c.md_currency_code || c.md_currency || c.value) === selectedCurrency
      );
      if (found && (found.md_currency_symbol || found.symbol)) {
        setSelectedSymbol(found.md_currency_symbol || found.symbol);
        return;
      }
    }

    // sensible fallbacks
    const fallbackMap = { THB: '฿', USD: '$', EUR: '€' };
    if (selectedCurrency && fallbackMap[selectedCurrency]) {
      setSelectedSymbol(fallbackMap[selectedCurrency]);
    }
  }, [currencyList, selectedCurrency, customerData]);

  const renderItem = ({ item }) => {
    const title = item.NameThai || item.NameEng || item.md_tour_name_thai || item.md_tour_name_eng || '';
    const img = item.Picture || item.PictureUrl || item.PictureUrlWebp || null;
    const price = item.Price ? (item.Price.adult || item.Price) : null;
    // Format price: prefer showing the currency symbol (e.g. "$ 123.00") instead of locale currency name like "US$"
    let formattedPrice = price;
    if (price !== null && price !== undefined && !(typeof price === 'object')) {
      const numeric = Number(price);
      if (!isNaN(numeric)) {
        const locale = selectedLanguage === 'th' ? 'th-TH' : 'en-US';
        try {
          // format number with grouping and decimals
          const numberString = new Intl.NumberFormat(locale, { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(numeric);
          if (selectedSymbol) {
            // no space between symbol and number (e.g. "$123.00")
            formattedPrice = `${selectedSymbol}${numberString}`;
          } else {
            // fallback to currency-formatted string (may produce "US$123.00")
            formattedPrice = new Intl.NumberFormat(locale, { style: 'currency', currency: selectedCurrency || (params.currency || 'THB') }).format(numeric);
          }
        } catch (e) {
          // fallback to simple thousands separator
          formattedPrice = numeric.toLocaleString(locale);
        }
      }
    }
    const rawDuration = item.TourDuration || item.TourType || '';

    // Determine country name from API response (object or string). Fall back to translation.
    let countryName = '';
    if (item.country) {
      if (typeof item.country === 'string') {
        countryName = item.country;
      } else if (Array.isArray(item.country)) {
        countryName = item.country[0]?.name || item.country[0]?.NameThai || '';
      } else if (typeof item.country === 'object') {
        countryName = item.country.name || item.country.NameThai || item.country.name_eng || '';
      }
    }
    if (!countryName) countryName = (t && t('countryThailand')) || 'THAILAND';

    // Normalize / display TourDuration (e.g. show "Half day" when TourDuration indicates half)
    let duration = '';
    if (rawDuration) {
      const rd = String(rawDuration).trim();
      const lower = rd.toLowerCase();
      if (lower === 'half' || lower === 'half-day' || lower === 'half day' || lower === 'ครึ่งวัน') {
        duration = (t && t('halfDay')) || 'Half day';
      } else {
        duration = rd; // show whatever the API returned
      }
    }

    return (
      <View style={styles.card}>
        {img ? (
          <Image source={{ uri: img }} style={styles.cardImage} resizeMode="cover" />
        ) : (
          <View style={[styles.cardImage, { backgroundColor: '#EEE' }]} />
        )}

        <View style={styles.cardBody}>
          <View style={styles.metaRow}>
            <Text style={styles.badge}>{countryName}</Text>
            {duration ? <View style={styles.durationPill}><Text style={styles.durationText}>{duration}</Text></View> : null}
          </View>

          <Text style={styles.title} numberOfLines={2}>{title}</Text>

          {price ? (
            <Text style={styles.price}>{typeof price === 'object' ? price : formattedPrice} <Text style={styles.priceNote}>{t('pricePerPerson') || 'Price per person'}</Text></Text>
          ) : null}

          <TouchableOpacity style={styles.viewBtn} onPress={() => {
            const tourId = item.TourID || item.tourid || item.tourId || item.md_tour_id;
            try {
              // update customer context with selected tour id
              updateCustomerData({ md_tours_id: tourId });
            } catch (e) {
              // ignore if context not available
            }
            navigation.navigate('TourDetailNew', { tourId, item });
          }}>
            <Text style={styles.viewBtnText}>{t('viewDetails') || 'View Details'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{(t('toursAvailable') || '{count} Tours Available').replace('{count}', total)}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity style={[styles.filterBtn, { marginRight: 12 }]}>
            <Ionicons name="options" size={18} color="#FD501E" />
            <Text style={styles.filterText}>{t('showFilters') || 'Show filters'}</Text>
          </TouchableOpacity>

          {/* Compact currency selector */}
          <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }} onPress={() => setCurrencyModalVisible(true)}>
            <Text style={{ fontWeight: '800', color: '#0f172a', marginRight: 6 }}>{selectedCurrency}</Text>
            <Ionicons name="caret-down" size={18} color="#FD501E" />
          </TouchableOpacity>
        </View>

        {/* Currency modal */}
        <Modal visible={isCurrencyModalVisible} transparent animationType="fade" onRequestClose={() => setCurrencyModalVisible(false)}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 16 }}>
            <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 12 }}>
              {currencyLoading ? (
                <ActivityIndicator size="small" color="#FD501E" />
              ) : (
                (currencyList && currencyList.length > 0 ? currencyList : [{ md_currency_code: 'THB', md_currency_symbol: '฿', md_currency_name: 'Thai Baht' }]).map((c) => (
                  <TouchableOpacity
                    key={c.md_currency_id || c.md_currency_code}
                    style={{ paddingVertical: 12, backgroundColor: selectedCurrency === (c.md_currency_code || c.md_currency) ? '#FFF3ED' : '#F9F9F9', paddingHorizontal: 8, borderRadius: 8, marginBottom: 8 }}
                    onPress={() => {
                      const code = c.md_currency_code || c.md_currency || c.value;
                      const sym = c.md_currency_symbol || '';
                      setSelectedCurrency(code);
                      if (sym) setSelectedSymbol(sym);
                      try { updateCustomerData({ currency: code, md_tours_currency: code, symbol: sym, md_currency_symbol: sym }); } catch (e) {}
                      setCurrencyModalVisible(false);
                    }}
                  >
                    <Text style={{ fontSize: 16, fontWeight: '700' }}>{(c.md_currency_symbol ? c.md_currency_symbol + ' ' : '') + (c.md_currency_name || c.md_currency_code || c.md_currency)}</Text>
                    <Text style={{ color: '#666', fontSize: 12 }}>{c.md_currency_code || c.md_currency || ''}</Text>
                  </TouchableOpacity>
                ))
              )}
              <TouchableOpacity style={{ paddingVertical: 12 }} onPress={() => setCurrencyModalVisible(false)}>
                <Text style={{ color: '#666', textAlign: 'center' }}>{t('close') || 'Close'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#FD501E" />
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(i, idx) => (i.TourID || i.md_tour_id || idx).toString()}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16 }}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: { padding: 16, paddingTop: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#0f172a', flex: 1 },
  filterBtn: { flexDirection: 'row', alignItems: 'center' },
  filterText: { marginLeft: 8, color: '#FD501E', fontWeight: '700' },
  card: { backgroundColor: '#fff', borderRadius: 12, marginBottom: 18, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(0,0,0,0.04)' },
  cardImage: { width: '100%', height: 180 },
  cardBody: { padding: 12 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  badge: { backgroundColor: '#FF6363', color: '#fff', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, fontWeight: '800' },
  durationPill: { backgroundColor: '#fff', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)' },
  durationText: { color: '#111', fontWeight: '700' },
  title: { marginTop: 12, fontSize: 18, fontWeight: '800', color: '#0f172a' },
  price: { marginTop: 8, color: '#10B981', fontWeight: '800', fontSize: 16 },
  priceNote: { fontSize: 12, color: '#64748b', fontWeight: '500' },
  viewBtn: { marginTop: 12, backgroundColor: '#FF7A3A', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10, alignSelf: 'flex-start' },
  viewBtnText: { color: '#fff', fontWeight: '700' },
});

export default SearchResultsScreen;
