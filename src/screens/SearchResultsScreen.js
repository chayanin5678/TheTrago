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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from './Screen/LanguageContext';
import ipAddress from '../config/ipconfig';
import moment from 'moment';

const { width: screenWidth } = Dimensions.get('window');

const SearchResultsScreen = ({ route, navigation }) => {
  const params = route?.params || {};
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState([]);
  const [total, setTotal] = useState(0);
  const { t, selectedLanguage } = useLanguage();

  const fetchResults = async () => {
    setLoading(true);
    try {
      const body = {
        lang: params.lang || 'th',
        currency: params.currency || 'THB',
        country: params.country || '',
        location: params.location || params.q || '',
        night: params.night || 0,
        day: params.day || 0,
        adult: params.adult || params.adults || 1,
        child: params.child || params.children || 0,
        infant: params.infant || 0,
        date: params.date || (params.departureDate ? moment(params.departureDate).format('YYYY-MM-DD') : ''),
        popular: 0,
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

  useEffect(() => {
    fetchResults();
  }, []);

  const renderItem = ({ item }) => {
    const title = item.NameThai || item.NameEng || item.md_tour_name_thai || item.md_tour_name_eng || '';
    const img = item.Picture || item.PictureUrl || item.PictureUrlWebp || null;
    const price = item.Price ? (item.Price.adult || item.Price) : null;
    // Format price with thousand separators
    let formattedPrice = price;
    if (price !== null && price !== undefined && !(typeof price === 'object')) {
      const numeric = Number(price);
      if (!isNaN(numeric)) {
        // use locale based on selectedLanguage (Thai uses th-TH)
        const locale = selectedLanguage === 'th' ? 'th-TH' : 'en-US';
        formattedPrice = numeric.toLocaleString(locale);
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
            <Text style={styles.price}>{typeof price === 'object' ? price : `${params.currency === 'THB' ? '฿' : (params.currency || '')}${formattedPrice}`} <Text style={styles.priceNote}>{t('pricePerPerson') || 'Price per person'}</Text></Text>
          ) : null}

          <TouchableOpacity style={styles.viewBtn} onPress={() => {
            const tourId = item.TourID || item.tourid || item.tourId || item.md_tour_id;
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
        <TouchableOpacity style={styles.filterBtn}>
          <Ionicons name="options" size={18} color="#FD501E" />
          <Text style={styles.filterText}>{t('showFilters') || 'Show filters'}</Text>
        </TouchableOpacity>
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
  header: { padding: 16, paddingTop: 20 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#0f172a' },
  filterBtn: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
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
