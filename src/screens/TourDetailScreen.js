import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
  Modal,
  StatusBar,
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';
import { useLanguage } from './Screen/LanguageContext';
import { useCustomer } from './Screen/CustomerContext';
import { useHideBottomTabBar } from '../utils/hideBottomTabBar';
import { AntDesign } from '@expo/vector-icons';
import styles from '../styles/CSS/TripDetailStyles';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
// match iOS action sheet width (buttons have 16pt margin each side)
const pickerWidth = screenWidth - 32; // equals action-sheet width (screen - 32)

const TourDetailScreen = ({ route, navigation }) => {
  const { t, selectedLanguage } = useLanguage();
  const insets = useSafeAreaInsets();
  const { customerData } = useCustomer();
  const params = route?.params || {};
  const tourId =
    params.tourId ||
    params.tourid ||
    params.item?.TourID ||
    params.item?.tourid;

  // hide bottom tab bar while on this screen
  useHideBottomTabBar();

  // ----------------------- STATE -----------------------
  const [loading, setLoading] = useState(true);
  const [tour, setTour] = useState(null);
  const [detailText, setDetailText] = useState('');
  const [detailUrl, setDetailUrl] = useState(null);
  const [detailFetchError, setDetailFetchError] = useState(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalIndex, setModalIndex] = useState(0);

  const fullListRef = useRef(null);

  // booking UI state (for the reserve box)
  const [bookingPassengers, setBookingPassengers] = useState(() => {
    const a = (customerData && (customerData.md_tours_adult ?? customerData.adult)) ?? 1;
    const c = (customerData && (customerData.md_tours_child ?? customerData.child)) ?? 0;
    const i = (customerData && (customerData.md_tours_infant ?? customerData.infant)) ?? 0;
    return { adult: Number(a) || 1, child: Number(c) || 0, infant: Number(i) || 0 };
  });

  const [bookingDate, setBookingDate] = useState(() => {
    const dstr =
      (customerData && (customerData.md_tours_departdate || customerData.md_booking_departdate || customerData.departdate || customerData.departDate)) ||
      null;
    if (dstr) {
      const d = new Date(dstr);
      if (!isNaN(d.getTime())) return d;
    }
    // default to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  });
  const [bookingOption, setBookingOption] = useState('normal'); // 'normal' or 'special'
  const [showDateModal, setShowDateModal] = useState(false);

  // Tab navigation state
  const [selectedTab, setSelectedTab] = useState(0); // 0: ภาพรวม, 1: รีวิว, 2: หมายเหตุ, 3: ใกล้เคียง

  // Interesting places data (from toursearch API)
  const [interestingPlaces, setInterestingPlaces] = useState([]);
  const [interestingLoading, setInterestingLoading] = useState(false);

  // repeating long-press refs for passenger controls
  const repeatRef = useRef({});
  const MAX_PASSENGERS = 20;

  const changePassenger = (key, delta) => {
    setBookingPassengers((prev) => {
      const min = key === 'adult' ? 1 : 0;
      const next = Math.max(min, Math.min(MAX_PASSENGERS, (prev[key] || 0) + delta));
      return { ...prev, [key]: next };
    });
  };

  const startRepeat = (key, delta) => {
    stopRepeat(key);
    // apply one immediately
    changePassenger(key, delta);
    // then repeat
    repeatRef.current[key] = setInterval(() => changePassenger(key, delta), 160);
  };

  const stopRepeat = (key) => {
    const id = repeatRef.current[key];
    if (id) {
      clearInterval(id);
      delete repeatRef.current[key];
    }
  };

  // sync booking state when customerData changes (e.g., navigated from search/tours)
  useEffect(() => {
    if (!customerData) return;

    const a = (customerData.md_tours_adult ?? customerData.adult);
    const c = (customerData.md_tours_child ?? customerData.child);
    const i = (customerData.md_tours_infant ?? customerData.infant);
    if (a !== undefined || c !== undefined || i !== undefined) {
      setBookingPassengers({ adult: Number(a) || 1, child: Number(c) || 0, infant: Number(i) || 0 });
    }

    const dstr = customerData.md_tours_departdate || customerData.md_booking_departdate || customerData.departdate || customerData.departDate;
    if (dstr) {
      const d = new Date(dstr);
      if (!isNaN(d.getTime())) setBookingDate(d);
    }
  }, [customerData]);

  const formatBookingDate = (d) => {
    try {
      const opts = { day: '2-digit', month: 'short', year: 'numeric' };
      const locale = selectedLanguage === 'th' ? 'th-TH' : 'en-US';
      return (d instanceof Date ? d : new Date(d)).toLocaleDateString(locale, opts);
    } catch (e) {
      return String(d);
    }
  };

  // ----------------------- HELPERS -----------------------
  const getString = (v) => {
    if (v === null || v === undefined) return '';
    if (typeof v === 'string') return v;
    if (typeof v === 'number') return String(v);
    if (Array.isArray(v))
      return v.map((x) => getString(x)).filter(Boolean).join('\n\n');
    if (typeof v === 'object') {
      return (
        v.name ||
        v.text ||
        v.title ||
        v.url ||
        v.value ||
        v.label ||
        v.displayName ||
        v.NameThai ||
        v.NameEng ||
        v.name_eng ||
        (v.id ? String(v.id) : '') ||
        ''
      );
    }
    return '';
  };

  function stripHtml(html) {
    if (!html) return '';
    let s = String(html);

    // decode entities
    s = s.replace(/&nbsp;/gi, ' ');
    s = s
      .replace(/&amp;/gi, '&')
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/gi, "'");

    // <li> -> bullet line
    s = s.replace(/<li[^>]*>(.*?)<\/li>/gi, '\n• $1');

    // <br> -> newline
    s = s.replace(/<br\s*\/?>(\s*)/gi, '\n');

    // </p> -> blank line
    s = s.replace(/<\/p>/gi, '\n\n');

    // strip all other tags
    s = s.replace(/<[^>]+>/g, '');

    // cleanup spacing
    s = s.replace(/\n{3,}/g, '\n\n');
    s = s.replace(/[ \t]{2,}/g, ' ');
    s = s.replace(/\s+\n/g, '\n').replace(/\n\s+/g, '\n');

    return s.trim();
  }

  const normalizeGallery = (g) => {
    if (!g) return [];
    if (Array.isArray(g)) {
        return g
          .map((item) => {
            if (!item) return null;
            if (typeof item === 'string') return item;
            if (typeof item === 'object')
              return (
                item.url ||
                item.image ||
                item.path ||
                item.src ||
                item.uri ||
                item.picture ||
                item.Picture ||
                getString(item)
              );
            return null;
          })
          .filter(Boolean);
    }
    return [getString(g)];
  };

  const normalizeIncludes = (incList) => {
    if (!incList) return [];
    if (Array.isArray(incList)) return incList.map((i) => getString(i)).filter(Boolean);
    return [getString(incList)].filter(Boolean);
  };

  // ----------------------- EFFECTS -----------------------
  useEffect(() => {
    if (modalVisible && fullListRef.current) {
      try {
        setTimeout(() => {
          fullListRef.current.scrollToIndex({
            index: modalIndex,
            animated: false,
          });
        }, 50);
      } catch (e) {}
    }
  }, [modalVisible, modalIndex]);

  const retryFetchDetail = async () => {
    if (!detailUrl) return;
    setDetailFetchError(null);
    setLoading(true);
    try {
      const txt = await axios.get(detailUrl, { timeout: 15000 });
      const raw =
        typeof txt.data === 'string'
          ? txt.data
          : typeof txt.data === 'object'
          ? JSON.stringify(txt.data)
          : String(txt.data);
      setDetailText(stripHtml(raw));
      setDetailFetchError(null);
    } catch (e) {
      setDetailFetchError(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!tourId) {
      setLoading(false);
      return;
    }

    const fetchDetail = async () => {
      setLoading(true);
      try {
        const body = {
          tourid: tourId,
          lang: selectedLanguage || params.lang || 'th',
          currency: (customerData && (customerData.currency || customerData.md_booking_currency)) || params.currency || 'THB',
        };
        const res = await axios.post(
          'https://thetrago.com/api_tour/V1/tour/GetDetail',
          body,
          { headers: { 'Content-Type': 'application/json' } }
        );

        const data = res?.data || res;
        let item = null;
        if (Array.isArray(data)) {
          item = data[0];
        } else if (Array.isArray(data.data)) {
          item = data.data[0];
        } else {
          item = data.data || data;
        }

        setTour(item || data);
        
        // Debug: Log tour data to see available fields
        console.log('Tour data:', item || data);

        const detailField =
          item?.detail ||
          item?.Detail ||
          item?.detail_eng ||
          item?.detail_th ||
          item?.DetailText ||
          item?.detailText ||
          item?.itinerary ||
          item?.Itinerary ||
          '';

        let computedDetail = '';

        if (Array.isArray(detailField)) {
          computedDetail = detailField
            .map((d) => stripHtml(getString(d)))
            .filter(Boolean)
            .join('\n\n');
        } else if (
          typeof detailField === 'string' &&
          detailField.startsWith('http')
        ) {
          setDetailUrl(detailField);
          setDetailFetchError(null);
          try {
            const txt = await axios.get(detailField, { timeout: 15000 });
            const raw =
              typeof txt.data === 'string'
                ? txt.data
                : typeof txt.data === 'object'
                ? JSON.stringify(txt.data)
                : String(txt.data);
            computedDetail = stripHtml(raw);
          } catch (e) {
            setDetailFetchError(e?.message || String(e));
            computedDetail = '';
          }
        } else if (typeof detailField === 'string') {
          computedDetail = stripHtml(detailField);
        } else if (
          typeof detailField === 'object' &&
          detailField !== null
        ) {
          computedDetail = stripHtml(getString(detailField));
        }

        if (!computedDetail) {
          const fallbackFields = [
            'itinerary',
            'description',
            'desc',
            'detailText',
            'DetailText',
            'program',
            'schedule',
            'introduction',
            'content',
            'overview',
            'detail_eng',
            'detail_th',
          ];
          for (let f of fallbackFields) {
            const v = item[f] || item[f.toLowerCase()];
            if (v) {
              if (Array.isArray(v)) {
                computedDetail = v
                  .map((d) => stripHtml(getString(d)))
                  .filter(Boolean)
                  .join('\n\n');
              } else {
                computedDetail = stripHtml(getString(v));
              }
            }
            if (computedDetail) break;
          }
        }

        setDetailText(computedDetail || '');
      } catch (e) {
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [tourId, selectedLanguage]);

  // Fetch interesting places from toursearch API (reuse same endpoint as ToursScreen)
  useEffect(() => {
    let mounted = true;
    const fetchInteresting = async () => {
      setInterestingLoading(true);
      try {
        // Prepare request similar to ToursScreen -> GetList
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];

        const currencyForReq = (customerData && (customerData.currency || customerData.md_booking_currency)) || params.currency || 'THB';
        const langForReq = selectedLanguage === 'th' ? 'th' : 'en';

        const body = {
          lang: langForReq,
          currency: currencyForReq,
          country: '',
          location: '',
          night: 0,
          day: 0,
          adult: 1,
          child: 0,
          infant: 0,
          date: tomorrowStr,
          popular: 1,
        };

        const res = await axios.post('https://thetrago.com/api_tour/V1/tour/GetList', body, { headers: { 'Content-Type': 'application/json' } });
        const data = res?.data || res;
        let list = [];
        if (Array.isArray(data)) list = data;
        else if (Array.isArray(data.data)) list = data.data;
        else if (Array.isArray(data.result)) list = data.result;

        // remove current tour from suggestions (if matches id)
        const filtered = (list || []).filter((it) => {
          const id = it.TourID || it.tourid || it.tourId || it.md_tour_id || it.Id;
          if (!id) return true;
          // compare loosely to current tour id
          return String(id) !== String(tourId);
        });

        if (mounted) {
          // shuffle results to provide randomized suggestions (Fisher-Yates)
          for (let i = filtered.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const tmp = filtered[i];
            filtered[i] = filtered[j];
            filtered[j] = tmp;
          }
          setInterestingPlaces(filtered.slice(0, 6));
        }
      } catch (e) {
        // ignore failure, keep placeholders
        if (mounted) setInterestingPlaces([]);
      } finally {
        if (mounted) setInterestingLoading(false);
      }
    };

    fetchInteresting();
    return () => {
      mounted = false;
    };
  }, [tourId, selectedLanguage]);

  // ----------------------- EARLY RETURNS -----------------------
  if (loading) {
    return (
      <SafeAreaView
        // allow content to extend to the top (remove top safe area)
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#fff',
        }}
        edges={["left", "right"]}
      >
        <ActivityIndicator size="large" color="#FD501E" />
      </SafeAreaView>
    );
  }

  if (!tour) {
    return (
      <SafeAreaView
        // allow content to extend to the top (remove top safe area)
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#fff',
        }}
        edges={["left", "right"]}
      >
        <Text style={{ color: '#333' }}>
          {t('noData') || 'No tour data available'}
        </Text>
      </SafeAreaView>
    );
  }

  // ----------------------- NORMALIZE DATA -----------------------
  const galleryArr = normalizeGallery(
    tour.gallery ||
      tour.Gallery ||
      (tour.gallery && Array.isArray(tour.gallery) ? tour.gallery : [])
  );
  const gallery = galleryArr;
  const firstImage =
    galleryArr[0] ||
    getString(tour.tourimage) ||
    getString(tour.Picture) ||
    null;

  const title =
    getString(tour.name) ||
    getString(tour.NameThai) ||
    getString(tour.NameEng) ||
    getString(tour.name_eng) ||
    '';

  const country =
    getString(tour.country) || getString(params.item?.country) || '';

  const duration =
    getString(tour.tourduration) ||
    getString(tour.TourDuration) ||
    getString(tour.duration) ||
    '';

  const company =
    getString(tour.company) ||
    getString(tour.companyName) ||
    getString(tour.Company) ||
    '';

  const ages = getString(tour.adultage || tour.age_range || '');

  const includes = normalizeIncludes(
    tour.include || tour.Include || []
  );

  const rawPrice = tour.price || tour.Price || {};

  const extractPriceValue = (p) => {
    if (p === null || p === undefined) return null;
    if (typeof p === 'number') return p;
    if (typeof p === 'string') {
      const num = Number(String(p).replace(/[^0-9.-]+/g, ''));
      return isNaN(num) ? null : num;
    }
    if (typeof p === 'object') {
      const candidates = [
        p.amount,
        p.price,
        p.value,
        p.total,
        p.adult,
        p.adultprice,
        p.adult_price,
        p.child,
        p.childprice,
        p.child_price,
        p.infant,
        p.infantprice,
        p.infant_price,
      ];
      for (let c of candidates) {
        if (c !== undefined && c !== null) {
          const n = Number(String(c).replace(/[^0-9.-]+/g, ''));
          if (!isNaN(n)) return n;
        }
      }
    }
    return null;
  };

  const adultPriceRaw = extractPriceValue(
    rawPrice.adult ||
      rawPrice.adultprice ||
      rawPrice.adult_price ||
      rawPrice.Adult ||
      rawPrice.AdultPrice ||
      rawPrice.adult_amount ||
      rawPrice
  );

  let adultPriceFormatted = '';
  if (adultPriceRaw !== null && adultPriceRaw !== undefined) {
    const numeric = Number(adultPriceRaw);
    if (!isNaN(numeric)) {
      const locale = selectedLanguage === 'th' ? 'th-TH' : 'en-US';
      adultPriceFormatted = numeric.toLocaleString(locale);
    } else {
      adultPriceFormatted = String(adultPriceRaw);
    }
  }

  const childPriceRaw = extractPriceValue(
    rawPrice.child ||
      rawPrice.childprice ||
      rawPrice.child_price ||
      rawPrice.Child ||
      rawPrice.child_amount
  );
  let childPriceFormatted = '';
  if (childPriceRaw !== null && childPriceRaw !== undefined) {
    const numeric = Number(childPriceRaw);
    if (!isNaN(numeric)) {
      const locale = selectedLanguage === 'th' ? 'th-TH' : 'en-US';
      childPriceFormatted = numeric.toLocaleString(locale);
    } else {
      childPriceFormatted = String(childPriceRaw);
    }
  }

  const infantPriceRaw = extractPriceValue(
    rawPrice.infant ||
      rawPrice.infantprice ||
      rawPrice.infant_price ||
      rawPrice.Infant ||
      rawPrice.infant_amount
  );
  let infantPriceFormatted = '';
  if (infantPriceRaw !== null && infantPriceRaw !== undefined) {
    const numeric = Number(infantPriceRaw);
    if (!isNaN(numeric)) {
      const locale = selectedLanguage === 'th' ? 'th-TH' : 'en-US';
      infantPriceFormatted = numeric.toLocaleString(locale);
    } else {
      infantPriceFormatted = String(infantPriceRaw);
    }
  }

  // ----------------------- RENDER DETAIL -----------------------
  // derive currency symbol: prefer customer context, then tour/params, finally fallback to THB symbol
  const currencySymbol =
    (customerData && (customerData.symbol || customerData.md_currency_symbol)) ||
    (tour && (tour.currency === 'THB' || tour.currency === 'THB') ? '฿' : '') ||
    (params && (params.currency === 'THB' ? '฿' : ''));
  const renderDetail = () => {
    if (!detailText) return null;

    // prepare text: insert blank lines before known headings
    let preparedText = detailText;

    // ชื่อทริป
    preparedText = preparedText.replace(
      /ชื่อทริป\s*[:：\-]?/g,
      (match) => `\n\n${match}`
    );

    // ไฮไลท์
    preparedText = preparedText.replace(
      /ไฮไลท์\s*[:：\-]?/g,
      (match) => `\n\n${match}`
    );

    // โปรแกรม (Itinerary)
    preparedText = preparedText.replace(
      /โปรแกรม\s*\(Itinerary\)\s*[:：\-]?/g,
      (match) => `\n\n${match}`
    );

    // รอบทริป (Trip Session)
    preparedText = preparedText.replace(
      /รอบทริป\s*\(Trip Session\)\s*[:：\-]?/g,
      (match) => `\n\n${match}`
    );

    // สิ่งที่ควรนำมา
    preparedText = preparedText.replace(
      /สิ่งที่ควรนำมา\s*[:：\-]?/g,
      (match) => `\n\n${match}`
    );

    // เงื่อนไขผู้เข้าร่วม (Requirements)
    preparedText = preparedText.replace(
      /เงื่อนไขผู้เข้าร่วม\s*\(Requirements\)\s*[:：\-]?/g,
      (match) => `\n\n${match}`
    );

    // ไม่รวมในแพ็คเกจ (Not Included)
    preparedText = preparedText.replace(
      /ไม่รวมในแพ็คเกจ\s*\(Not Included\)\s*[:：\-]?/g,
      (match) => `\n\n${match}`
    );

    // นโยบายการยกเลิก (Cancellation Policy)
    preparedText = preparedText.replace(
      /นโยบายการยกเลิก(?:\s*\(Cancellation Policy\))?\s*[:：\-]?/g,
      (match) => `\n\n${match}`
    );

    // split into logical paragraphs
    const paras = preparedText
      .split(/\n\n+/)
      .map((p) => p.trim())
      .filter(Boolean);

    return paras.map((p, idx) => {
      // ---------- BLOCK: "ชื่อทริป" ----------
      if (p.includes('ชื่อทริป')) {
        const parts = p.split(/ชื่อทริป\s*[:：\-]?/);
        const restRaw = parts[1] ? parts[1].trim() : '';
        const restLines = restRaw
          .split(/\n+/)
          .map((l) => l.trim())
          .filter(Boolean);

        return (
          <View key={`tripname-${idx}`} style={{ marginBottom: 16 }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: 'bold',
                marginBottom: 8,
                color: '#0f172a',
              }}
            >
              {t('tripName') || 'Trip name'}
            </Text>

            {restLines.length > 0 ? (
              <Text
                style={{
                  color: '#374151',
                  lineHeight: 22,
                }}
              >
                {restLines.join('\n')}
              </Text>
            ) : null}
          </View>
        );
      }

      // ---------- BLOCK: "ไฮไลท์" ----------
      if (p.includes('ไฮไลท์')) {
        const parts = p.split(/ไฮไลท์\s*[:：\-]?/);
        const restRaw = parts[1] ? parts[1].trim() : '';
        const restLines = restRaw
          .split(/\n+/)
          .map((l) => l.trim())
          .filter(Boolean);

        const allBullet =
          restLines.length > 1 &&
          restLines.every(
            (l) =>
              l.startsWith('•') ||
              l.startsWith('-') ||
              /^\u2022/.test(l)
          );

        return (
          <View key={`highlight-${idx}`} style={{ marginBottom: 16 }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: 'bold',
                marginBottom: 8,
                color: '#0f172a',
              }}
            >
              {t('highlights') || 'Highlights'}
            </Text>

            {restLines.length > 0 ? (
              allBullet ? (
                <View>
                  {restLines.map((ln, i) => {
                    const cleanText = ln
                      .replace(/^•\s*/, '')
                      .replace(/^\u2022\s*/, '')
                      .replace(/^-+\s*/, '')
                      .trim();

                    return (
                      <View
                        key={`hl-li-${i}`}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'flex-start',
                          marginBottom: 6,
                        }}
                      >
                        <Text
                          style={{
                            marginRight: 8,
                            color: '#374151',
                            fontWeight: 'bold',
                          }}
                        >
                          •
                        </Text>
                        <Text
                          style={{
                            color: '#374151',
                            flex: 1,
                            lineHeight: 20,
                          }}
                        >
                          {cleanText}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              ) : (
                <Text
                  style={{
                    color: '#374151',
                    lineHeight: 22,
                  }}
                >
                  {restLines.join('\n')}
                </Text>
              )
            ) : null}
          </View>
        );
      }

      // ---------- BLOCK: "โปรแกรม (Itinerary)" ----------
      if (p.match(/โปรแกรม\s*\(Itinerary\)/)) {
        const parts = p.split(/โปรแกรม\s*\(Itinerary\)\s*[:：\-]?/);
        const restRaw = parts[1] ? parts[1].trim() : '';

        const restLines = restRaw
          .split(/\n+/)
          .map((l) => l.trim())
          .filter(Boolean);

        const allBulletOrTimeline =
          restLines.length > 1 &&
          restLines.every(
            (l) =>
              l.startsWith('•') ||
              l.startsWith('-') ||
              /^\u2022/.test(l) ||
              /^\d{1,2}:\d{2}/.test(l)
          );

        return (
          <View key={`prog-${idx}`} style={{ marginBottom: 16 }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: 'bold',
                marginBottom: 8,
                color: '#0f172a',
              }}
            >
              {t('itinerary') || 'Itinerary'}
            </Text>

            {restLines.length > 0 ? (
              allBulletOrTimeline ? (
                <View>
                  {restLines.map((ln, i) => {
                    // timeline? e.g. "07:30 blah"
                    const timeMatch = ln.match(/^(\d{1,2}:\d{2})\s*(.*)$/);
                    if (timeMatch) {
                      const timeStr = timeMatch[1];
                      const descStr = timeMatch[2] || '';
                      return (
                        <View
                          key={`prog-li-${i}`}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'flex-start',
                            marginBottom: 8,
                          }}
                        >
                          <Text
                            style={{
                              minWidth: 60,
                              color: '#FB6B36',
                              fontWeight: 'bold',
                            }}
                          >
                            {timeStr}
                          </Text>
                          <Text
                            style={{
                              flex: 1,
                              color: '#374151',
                              lineHeight: 20,
                            }}
                          >
                            {descStr.trim()}
                          </Text>
                        </View>
                      );
                    }

                    // bullet
                    const cleanText = ln
                      .replace(/^•\s*/, '')
                      .replace(/^\u2022\s*/, '')
                      .replace(/^-+\s*/, '')
                      .trim();

                    return (
                      <View
                        key={`prog-bul-${i}`}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'flex-start',
                          marginBottom: 6,
                        }}
                      >
                        <Text
                          style={{
                            marginRight: 8,
                            color: '#374151',
                            fontWeight: 'bold',
                          }}
                        >
                          •
                        </Text>
                        <Text
                          style={{
                            color: '#374151',
                            flex: 1,
                            lineHeight: 20,
                          }}
                        >
                          {cleanText}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              ) : (
                <Text
                  style={{
                    color: '#374151',
                    lineHeight: 22,
                  }}
                >
                  {restLines.join('\n')}
                </Text>
              )
            ) : null}
          </View>
        );
      }

      // ---------- BLOCK: "รอบทริป (Trip Session)" ----------
      if (p.match(/รอบทริป\s*\(Trip Session\)/)) {
        const parts = p.split(/รอบทริป\s*\(Trip Session\)\s*[:：\-]?/);
        const restRaw = parts[1] ? parts[1].trim() : '';

        const restLines = restRaw
          .split(/\n+/)
          .map((l) => l.trim())
          .filter(Boolean);

        const allBulletOrTimeline =
          restLines.length > 1 &&
          restLines.every(
            (l) =>
              l.startsWith('•') ||
              l.startsWith('-') ||
              /^\u2022/.test(l) ||
              /^\d{1,2}:\d{2}/.test(l)
          );

        return (
          <View key={`tripsession-${idx}`} style={{ marginBottom: 16 }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: 'bold',
                marginBottom: 8,
                color: '#0f172a',
              }}
            >
              {t('tripSession') || 'Trip Session'}
            </Text>

            {restLines.length > 0 ? (
              allBulletOrTimeline ? (
                <View>
                  {restLines.map((ln, i) => {
                    // timeline-like?
                    const timeMatch = ln.match(/^(\d{1,2}:\d{2})\s*(.*)$/);
                    if (timeMatch) {
                      const timeStr = timeMatch[1];
                      const descStr = timeMatch[2] || '';
                      return (
                        <View
                          key={`session-li-${i}`}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'flex-start',
                            marginBottom: 8,
                          }}
                        >
                          <Text
                            style={{
                              minWidth: 60,
                              color: '#FB6B36',
                              fontWeight: 'bold',
                            }}
                          >
                            {timeStr}
                          </Text>
                          <Text
                            style={{
                              flex: 1,
                              color: '#374151',
                              lineHeight: 20,
                            }}
                          >
                            {descStr.trim()}
                          </Text>
                        </View>
                      );
                    }

                    // bullet row
                    const cleanText = ln
                      .replace(/^•\s*/, '')
                      .replace(/^\u2022\s*/, '')
                      .replace(/^-+\s*/, '')
                      .trim();

                    return (
                      <View
                        key={`session-bul-${i}`}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'flex-start',
                          marginBottom: 6,
                        }}
                      >
                        <Text
                          style={{
                            marginRight: 8,
                            color: '#374151',
                            fontWeight: 'bold',
                          }}
                        >
                          •
                        </Text>
                        <Text
                          style={{
                            color: '#374151',
                            flex: 1,
                            lineHeight: 20,
                          }}
                        >
                          {cleanText}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              ) : (
                <Text
                  style={{
                    color: '#374151',
                    lineHeight: 22,
                  }}
                >
                  {restLines.join('\n')}
                </Text>
              )
            ) : null}
          </View>
        );
      }

      // ---------- BLOCK: "สิ่งที่ควรนำมา" ----------
      if (p.includes('สิ่งที่ควรนำมา')) {
        const parts = p.split(/สิ่งที่ควรนำมา\s*[:：\-]?/);
        const restRaw = parts[1] ? parts[1].trim() : '';

        const restLines = restRaw
          .split(/\n+/)
          .map((l) => l.trim())
          .filter(Boolean);

        const allBullet =
          restLines.length > 1 &&
          restLines.every(
            (l) =>
              l.startsWith('•') ||
              l.startsWith('-') ||
              /^\u2022/.test(l) ||
              /^\d{1,2}:\d{2}/.test(l)
          );

        return (
          <View key={`bring-${idx}`} style={{ marginBottom: 16 }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: 'bold',
                marginBottom: 8,
                color: '#0f172a',
              }}
            >
              {t('whatToBring') || 'What to bring'}
            </Text>

            {restLines.length > 0 ? (
              allBullet ? (
                <View>
                  {restLines.map((ln, i) => {
                    const cleanText = ln
                      .replace(/^•\s*/, '')
                      .replace(/^\u2022\s*/, '')
                      .replace(/^-+\s*/, '')
                      .trim();

                    return (
                      <View
                        key={`bring-li-${i}`}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'flex-start',
                          marginBottom: 6,
                        }}
                      >
                        <Text
                          style={{
                            marginRight: 8,
                            color: '#374151',
                            fontWeight: 'bold',
                          }}
                        >
                          •
                        </Text>
                        <Text
                          style={{
                            color: '#374151',
                            flex: 1,
                            lineHeight: 20,
                          }}
                        >
                          {cleanText}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              ) : (
                <Text
                  style={{
                    color: '#374151',
                    lineHeight: 22,
                  }}
                >
                  {restLines.join('\n')}
                </Text>
              )
            ) : null}
          </View>
        );
      }

      // ---------- BLOCK: "เงื่อนไขผู้เข้าร่วม (Requirements)" ----------
      if (p.match(/เงื่อนไขผู้เข้าร่วม\s*\(Requirements\)/)) {
        const parts = p.split(/เงื่อนไขผู้เข้าร่วม\s*\(Requirements\)\s*[:：\-]?/);
        const restRaw = parts[1] ? parts[1].trim() : '';

        const restLines = restRaw
          .split(/\n+/)
          .map((l) => l.trim())
          .filter(Boolean);

        const allBulletOrTimeline =
          restLines.length > 1 &&
          restLines.every(
            (l) =>
              l.startsWith('•') ||
              l.startsWith('-') ||
              /^\u2022/.test(l) ||
              /^\d{1,2}:\d{2}/.test(l)
          );

        return (
          <View key={`req-${idx}`} style={{ marginBottom: 16 }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: 'bold',
                marginBottom: 8,
                color: '#0f172a',
              }}
            >
              {t('requirements') || 'Requirements'}
            </Text>

            {restLines.length > 0 ? (
              allBulletOrTimeline ? (
                <View>
                  {restLines.map((ln, i) => {
                    const timeMatch = ln.match(/^(\d{1,2}:\d{2})\s*(.*)$/);
                    if (timeMatch) {
                      const timeStr = timeMatch[1];
                      const descStr = timeMatch[2] || '';
                      return (
                        <View
                          key={`req-li-${i}`}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'flex-start',
                            marginBottom: 8,
                          }}
                        >
                          <Text
                            style={{
                              minWidth: 60,
                              color: '#FB6B36',
                              fontWeight: 'bold',
                            }}
                          >
                            {timeStr}
                          </Text>
                          <Text
                            style={{
                              flex: 1,
                              color: '#374151',
                              lineHeight: 20,
                            }}
                          >
                            {descStr.trim()}
                          </Text>
                        </View>
                      );
                    }

                    const cleanText = ln
                      .replace(/^•\s*/, '')
                      .replace(/^\u2022\s*/, '')
                      .replace(/^-+\s*/, '')
                      .trim();

                    return (
                      <View
                        key={`req-bul-${i}`}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'flex-start',
                          marginBottom: 6,
                        }}
                      >
                        <Text
                          style={{
                            marginRight: 8,
                            color: '#374151',
                            fontWeight: 'bold',
                          }}
                        >
                          •
                        </Text>
                        <Text
                          style={{
                            color: '#374151',
                            flex: 1,
                            lineHeight: 20,
                          }}
                        >
                          {cleanText}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              ) : (
                <Text
                  style={{
                    color: '#374151',
                    lineHeight: 22,
                  }}
                >
                  {restLines.join('\n')}
                </Text>
              )
            ) : null}
          </View>
        );
      }

      // ---------- BLOCK: "ไม่รวมในแพ็คเกจ (Not Included)" ----------
      if (p.match(/ไม่รวมในแพ็คเกจ\s*\(Not Included\)/)) {
        const parts = p.split(/ไม่รวมในแพ็คเกจ\s*\(Not Included\)\s*[:：\-]?/);
        const restRaw = parts[1] ? parts[1].trim() : '';

        const restLines = restRaw
          .split(/\n+/)
          .map((l) => l.trim())
          .filter(Boolean);

        const allBulletOrTimeline =
          restLines.length > 1 &&
          restLines.every(
            (l) =>
              l.startsWith('•') ||
              l.startsWith('-') ||
              /^\u2022/.test(l) ||
              /^\d{1,2}:\d{2}/.test(l)
          );

        return (
          <View key={`notinc-${idx}`} style={{ marginBottom: 16 }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: 'bold',
                marginBottom: 8,
                color: '#0f172a',
              }}
            >
              {t('notIncluded') || 'Not included'}
            </Text>

            {restLines.length > 0 ? (
              allBulletOrTimeline ? (
                <View>
                  {restLines.map((ln, i) => {
                    const timeMatch = ln.match(/^(\d{1,2}:\d{2})\s*(.*)$/);
                    if (timeMatch) {
                      const timeStr = timeMatch[1];
                      const descStr = timeMatch[2] || '';
                      return (
                        <View
                          key={`notinc-li-${i}`}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'flex-start',
                            marginBottom: 8,
                          }}
                        >
                          <Text
                            style={{
                              minWidth: 60,
                              color: '#FB6B36',
                              fontWeight: 'bold',
                            }}
                          >
                            {timeStr}
                          </Text>
                          <Text
                            style={{
                              flex: 1,
                              color: '#374151',
                              lineHeight: 20,
                            }}
                          >
                            {descStr.trim()}
                          </Text>
                        </View>
                      );
                    }

                    const cleanText = ln
                      .replace(/^•\s*/, '')
                      .replace(/^\u2022\s*/, '')
                      .replace(/^-+\s*/, '')
                      .trim();

                    return (
                      <View
                        key={`notinc-bul-${i}`}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'flex-start',
                          marginBottom: 6,
                        }}
                      >
                        <Text
                          style={{
                            marginRight: 8,
                            color: '#374151',
                            fontWeight: 'bold',
                          }}
                        >
                          •
                        </Text>
                        <Text
                          style={{
                            color: '#374151',
                            flex: 1,
                            lineHeight: 20,
                          }}
                        >
                          {cleanText}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              ) : (
                <Text
                  style={{
                    color: '#374151',
                    lineHeight: 22,
                  }}
                >
                  {restLines.join('\n')}
                </Text>
              )
            ) : null}
          </View>
        );
      }

      // ---------- BLOCK: "นโยบายการยกเลิก (Cancellation Policy)" ----------
      if (p.match(/นโยบายการยกเลิก(?:\s*\(Cancellation Policy\))?/)) {
        const parts = p.split(/นโยบายการยกเลิก(?:\s*\(Cancellation Policy\))?\s*[:：\-]?/);
        const restRaw = parts[1] ? parts[1].trim() : '';

        const restLines = restRaw
          .split(/\n+/)
          .map((l) => l.trim())
          .filter(Boolean);

        const allBulletOrTimeline =
          restLines.length > 1 &&
          restLines.every(
            (l) =>
              l.startsWith('•') ||
              l.startsWith('-') ||
              /^\u2022/.test(l) ||
              /^\d{1,2}:\d{2}/.test(l)
          );

        return (
          <View key={`cancel-${idx}`} style={{ marginBottom: 16 }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: 'bold',
                marginBottom: 8,
                color: '#0f172a',
              }}
            >
              {t('cancellationPolicy') || 'Cancellation Policy'}
            </Text>

            {restLines.length > 0 ? (
              allBulletOrTimeline ? (
                <View>
                  {restLines.map((ln, i) => {
                    const timeMatch = ln.match(/^(\d{1,2}:\d{2})\s*(.*)$/);
                    if (timeMatch) {
                      const timeStr = timeMatch[1];
                      const descStr = timeMatch[2] || '';
                      return (
                        <View
                          key={`cancel-li-${i}`}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'flex-start',
                            marginBottom: 8,
                          }}
                        >
                          <Text
                            style={{
                              minWidth: 60,
                              color: '#FB6B36',
                              fontWeight: 'bold',
                            }}
                          >
                            {timeStr}
                          </Text>
                          <Text
                            style={{
                              flex: 1,
                              color: '#374151',
                              lineHeight: 20,
                            }}
                          >
                            {descStr.trim()}
                          </Text>
                        </View>
                      );
                    }

                    const cleanText = ln
                      .replace(/^•\s*/, '')
                      .replace(/^\u2022\s*/, '')
                      .replace(/^-+\s*/, '')
                      .trim();

                    return (
                      <View
                        key={`cancel-bul-${i}`}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'flex-start',
                          marginBottom: 6,
                        }}
                      >
                        <Text
                          style={{
                            marginRight: 8,
                            color: '#374151',
                            fontWeight: 'bold',
                          }}
                        >
                          •
                        </Text>
                        <Text
                          style={{
                            color: '#374151',
                            flex: 1,
                            lineHeight: 20,
                          }}
                        >
                          {cleanText}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              ) : (
                <Text
                  style={{
                    color: '#374151',
                    lineHeight: 22,
                  }}
                >
                  {restLines.join('\n')}
                </Text>
              )
            ) : null}
          </View>
        );
      }

      // ---------- FALLBACK (generic paragraphs / lists) ----------
      const lines = p
        .split(/\n+/)
        .map((l) => l.trim())
        .filter(Boolean);

      const isList =
        lines.length > 1 &&
        lines.every(
          (l) =>
            l.startsWith('•') ||
            l.startsWith('-') ||
            /^\u2022/.test(l) ||
            /^\d{1,2}:\d{2}/.test(l)
        );

      if (isList) {
        return (
          <View key={`para-${idx}`} style={{ marginBottom: 10 }}>
            {lines.map((ln, i) => {
              const timeMatch = ln.match(/^(\d{1,2}:\d{2})\s*(.*)$/);
              if (timeMatch) {
                const timeStr = timeMatch[1];
                const descStr = timeMatch[2] || '';
                return (
                  <View
                    key={`li-${i}`}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'flex-start',
                      marginBottom: 8,
                    }}
                  >
                    <Text
                      style={{
                        minWidth: 60,
                        color: '#FB6B36',
                        fontWeight: 'bold',
                      }}
                    >
                      {timeStr}
                    </Text>
                    <Text
                      style={{
                        flex: 1,
                        color: '#374151',
                        lineHeight: 20,
                      }}
                    >
                      {descStr.trim()}
                    </Text>
                  </View>
                );
              }

              const cleanText = ln
                .replace(/^•\s*/, '')
                .replace(/^\u2022\s*/, '')
                .replace(/^-+\s*/, '')
                .trim();

              return (
                <View
                  key={`li-bul-${i}`}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                    marginBottom: 6,
                  }}
                >
                  <Text
                    style={{
                      marginRight: 8,
                      color: '#374151',
                      fontWeight: 'bold',
                    }}
                  >
                    •
                  </Text>
                  <Text
                    style={{
                      color: '#374151',
                      flex: 1,
                      lineHeight: 20,
                    }}
                  >
                    {cleanText}
                  </Text>
                </View>
              );
            })}
          </View>
        );
      }

      if (p.length < 60 && /[ก-๙A-Za-z]/.test(p)) {
        return (
          <Text
            key={`h-${idx}`}
            style={{
              fontSize: 18,
              fontWeight: 'bold',
              marginBottom: 8,
              color: '#0f172a',
            }}
          >
            {p}
          </Text>
        );
      }

      return (
        <Text
          key={`p-${idx}`}
          style={{
            color: '#374151',
            lineHeight: 22,
            marginBottom: 10,
          }}
        >
          {p}
        </Text>
      );
    });
  };

  // ----------------------- UI -----------------------
  // compute header height to offset content when header is overlay
  const headerHeight = (insets.top || 0) + 64; // 64 = backButton(40) + vertical padding(12*2)

  return (
  // allow content to extend to the top (remove top safe area)
  <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={["left", "right"]}>
      {/* Header with Back Button */}
      <View style={[styles.topHeaderOverlay, { paddingTop: (insets.top || 0) + 12 }] }>
        <TouchableOpacity 
          style={[styles.backButton, { backgroundColor: 'rgba(0,0,0,0.4)' }]}
          onPress={() => navigation.goBack()}
        >
          <AntDesign name="left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={[styles.topHeaderTitle, { color: '#FFFFFF' }]}>{t('tourDetails') || 'Tour Details'}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        // reduce top padding so main image moves up under the overlay header
        contentContainerStyle={{ padding: 16, paddingTop: 0, paddingBottom: 120 }}
      >
        {/* main image */}
        {firstImage ? (
          <Image
            source={{ uri: firstImage }}
            style={{
              // full-bleed image that fits different screen sizes
              width: screenWidth,
              height: Math.round(screenHeight * 0.38),
              borderRadius: 0,
              alignSelf: 'center',
              // extend to screen edges (compensate for ScrollView padding)
              marginLeft: -16,
              marginRight: -16,
              // pull image up under the overlay header (device-aware)
              marginTop: -(insets.top ? insets.top + 8 : 24),
            }}
            resizeMode="cover"
          />
        ) : null}

        {/* title and meta */}
        <View
          style={{
            marginTop: -15,
            // cancel ScrollView horizontal padding so this card spans the full screen
            marginLeft: -16,
            marginRight: -16,
            paddingTop: 30,
            paddingHorizontal: 20,
            paddingBottom: 16,
            borderRadius: 20,
            overflow: 'hidden',
            backgroundColor: '#fff',
            // subtle shadow so rounded card stands out over the image
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.06,
            shadowRadius: 6,
            elevation: 3,
          }}
        >
          <Text
            style={{
              fontSize: 22,
              fontWeight: '700',
              color: '#0f172a',
            }}
          >
            {title}
          </Text>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: 8,
            }}
          >
            <AntDesign name="star" size={16} color="#FFCC00" />
            <Text
              style={{ marginLeft: 6, marginRight: 8, fontWeight: '700' }}
            >
              {getString(tour.tourstar) || '5'}
            </Text>

            <Text
              style={{
                color: '#FB6B36',
                fontWeight: '700',
                marginRight: 10,
              }}
            >
              {country || t('countryThailand') || 'THAILAND'}
            </Text>

            <Text style={{ marginLeft: 6, color: '#64748b' }}>
              {(getString(tour.booked) &&
                `${getString(tour.booked)}+ ${
                  t('booked') || 'Booked'
                }`) ||
                t('booked') ||
                'Booked'}
            </Text>
          </View>

          {adultPriceFormatted ? (
            <Text
              style={{
                marginTop: 10,
                color: '#10B981',
                fontWeight: '700',
                fontSize: 18,
              }}
            >
              {`${currencySymbol || ''}${adultPriceFormatted}`}
            </Text>
          ) : null}

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginTop: 16,
            }}
          >
            <View style={{ alignItems: 'center', width: '30%' }}>
              <Text style={{ color: '#6b7280', textTransform: 'lowercase' }}>
                {t('duration') || 'duration'}
              </Text>
              <Text
                style={{
                  fontWeight: '700',
                  marginTop: 6,
                  textAlign: 'center',
                }}
              >
                {duration || t('oneDay') || 'oneDay'}
              </Text>
            </View>

            <View style={{ alignItems: 'center', width: '30%' }}>
              <Text style={{ color: '#6b7280', textTransform: 'lowercase' }}>
                {t('companyName') || 'companyName'}
              </Text>
              <Text
                style={{
                  fontWeight: '700',
                  marginTop: 6,
                  textAlign: 'center',
                }}
              >
                {company || ''}
              </Text>
            </View>

            <View style={{ alignItems: 'center', width: '30%' }}>
              <Text style={{ color: '#6b7280', textTransform: 'lowercase' }}>
                {t('ages') || 'ages'}
              </Text>
              <Text
                style={{
                  fontWeight: '700',
                  marginTop: 6,
                  textAlign: 'center',
                }}
              >
                {ages || t('agesRange') || 'agesRange'}
              </Text>
            </View>
          </View>
        </View>

        {/* Horizontal Tab Navigation */}
        <View style={{ marginTop: 20, marginBottom: 12 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 4 }}>
            {[
              { id: 0, label: t('overview') || 'ภาพรวม' },
              { id: 1, label: t('reviews') || 'รีวิว' },
              { id: 2, label: t('notes') || 'หมายเหตุ' },
              { id: 3, label: t('nearby') || 'ใกล้เคียง' },
            ].map((tab) => (
              <TouchableOpacity
                key={tab.id}
                onPress={() => setSelectedTab(tab.id)}
                style={{
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  marginRight: 12,
                  borderRadius: 20,
                  backgroundColor: selectedTab === tab.id ? '#FD501E' : '#f5f5f5',
                }}
              >
                <Text style={{ color: selectedTab === tab.id ? '#fff' : '#666', fontWeight: selectedTab === tab.id ? '700' : '400', fontSize: 14 }}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Tab Content */}
        {selectedTab === 0 && (
          <View>
            {/* Horizontal Category Sections */}
            {/* ที่เที่ยวน่าสนใจ */}
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 16, fontWeight: '700', marginBottom: 12, color: '#0f172a' }}>
                {t('interestingPlaces') || 'ที่เที่ยวน่าสนใจ'}
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 16 }}>
                {interestingLoading ? (
                  <View style={{ width: 160, height: 120, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="small" color="#FD501E" />
                  </View>
                ) : (interestingPlaces && interestingPlaces.length > 0 ? (
                  interestingPlaces.map((item, idx) => {
                    const title =
                      item.md_tour_name_thai ||
                      item.md_tour_name_eng ||
                      item.NameThai ||
                      item.NameEng ||
                      item.name ||
                      '';

                    let img = item.Picture || item.PictureUrl || item.tourimage || item.image || null;
                    // Some endpoints return md_tour_picname (filename) — construct full URL like HomeScreen does
                    if (!img && item.md_tour_picname) {
                      img = `https://tour.thetrago.com/manageadmin/uploads/tour/index/${item.md_tour_picname}`;
                    }
                    // fallback to md_tour_pic or md_tour_picname_webp if present
                    if (!img && item.md_tour_pic) img = item.md_tour_pic;
                    if (!img && item.md_tour_picname_webp) img = `https://tour.thetrago.com/manageadmin/uploads/tour/index/${item.md_tour_picname_webp}`;

                    const priceVal = (() => {
                      const p = item.Price || item.price || item.AdultPrice || item.adultprice || item.adult || null;
                      const n = extractPriceValue(p);
                      return n;
                    })();

                    const priceText = priceVal !== null && priceVal !== undefined ? (Number(priceVal).toLocaleString(selectedLanguage === 'th' ? 'th-TH' : 'en-US')) : null;

                    const tourIdItem = item.TourID || item.tourid || item.tourId || item.md_tour_id || item.Id || idx;

                    return (
                      <TouchableOpacity
                        key={`place-${tourIdItem}-${idx}`}
                        style={{ width: 160, marginRight: 12, borderRadius: 12, overflow: 'hidden', backgroundColor: '#fff', borderWidth: 1, borderColor: '#f0f0f0' }}
                        activeOpacity={0.85}
                        onPress={() => {
                          try { /* navigate to detail of selected suggestion */
                            navigation && navigation.navigate
                              ? navigation.navigate('TourDetailNew', { tourId: tourIdItem, item })
                              : null;
                          } catch (e) {}
                        }}
                      >
                        {img ? (
                          <Image source={{ uri: img }} style={{ width: 160, height: 120 }} resizeMode="cover" />
                        ) : (
                          <View style={{ width: 160, height: 120, backgroundColor: '#eaeaea', justifyContent: 'center', alignItems: 'center' }}>
                            <AntDesign name="picture" size={28} color="#cfcfcf" />
                          </View>
                        )}

                        <View style={{ padding: 8 }}>
                          <Text style={{ fontSize: 12, fontWeight: '600', color: '#111' }} numberOfLines={2}>{title}</Text>
                          {priceText ? (
                            <Text style={{ fontSize: 12, color: '#4b5563', marginTop: 6 }}>{currencySymbol || '฿'}{priceText}</Text>
                          ) : (
                            <Text style={{ fontSize: 12, color: '#9ca3af', marginTop: 6 }}>{t('viewDetails') || 'View details'}</Text>
                          )}
                        </View>
                      </TouchableOpacity>
                    );
                  })
                ) : (
                  // fallback placeholders
                  [1, 2, 3].map((item, idx) => (
                    <View key={`place-ph-${idx}`} style={{ width: 160, marginRight: 12, borderRadius: 12, overflow: 'hidden', backgroundColor: '#f9f9f9' }}>
                      <View style={{ width: 160, height: 120, backgroundColor: '#e0e0e0' }} />
                      <View style={{ padding: 8 }}>
                        <Text style={{ fontSize: 12, fontWeight: '600', color: '#333' }} numberOfLines={2}>
                          {t('samplePlaceName') || 'ชื่อสถานที่ท่องเที่ยว'}
                        </Text>
                        <Text style={{ fontSize: 10, color: '#666', marginTop: 4 }}>฿500</Text>
                      </View>
                    </View>
                  ))
                ))}
              </ScrollView>
            </View>

            {/* บัตรเข้าชมสถานที่ท่องเที่ยว */}
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 16, fontWeight: '700', marginBottom: 12, color: '#0f172a' }}>
                {t('entranceTickets') || 'บัตรเข้าชมสถานที่ท่องเที่ยว'}
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 16 }}>
                {[1, 2, 3].map((item, idx) => (
                  <View key={`ticket-${idx}`} style={{ width: 160, marginRight: 12, borderRadius: 12, overflow: 'hidden', backgroundColor: '#f9f9f9' }}>
                    <View style={{ width: 160, height: 120, backgroundColor: '#e0e0e0' }} />
                    <View style={{ padding: 8 }}>
                      <Text style={{ fontSize: 12, fontWeight: '600', color: '#333' }} numberOfLines={2}>
                        {t('sampleTicketName') || 'ชื่อบัตรเข้าชม'}
                      </Text>
                      <Text style={{ fontSize: 10, color: '#666', marginTop: 4 }}>฿300</Text>
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>

            {/* กิจกรรมยอดนิยม */}
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 16, fontWeight: '700', marginBottom: 12, color: '#0f172a' }}>
                {t('popularActivities') || 'กิจกรรมยอดนิยม'}
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 16 }}>
                {[1, 2, 3].map((item, idx) => (
                  <View key={`activity-${idx}`} style={{ width: 160, marginRight: 12, borderRadius: 12, overflow: 'hidden', backgroundColor: '#f9f9f9' }}>
                    <View style={{ width: 160, height: 120, backgroundColor: '#e0e0e0' }} />
                    <View style={{ padding: 8 }}>
                      <Text style={{ fontSize: 12, fontWeight: '600', color: '#333' }} numberOfLines={2}>
                        {t('sampleActivityName') || 'ชื่อกิจกรรม'}
                      </Text>
                      <Text style={{ fontSize: 10, color: '#666', marginTop: 4 }}>฿1,200</Text>
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>

            {/* ตั๋วสุดคุ้ม */}
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 16, fontWeight: '700', marginBottom: 12, color: '#0f172a' }}>
                {t('bestValueTickets') || 'ตั๋วสุดคุ้ม'}
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 16 }}>
                {[1, 2].map((item, idx) => (
                  <View key={`value-${idx}`} style={{ width: 200, marginRight: 12, borderRadius: 12, overflow: 'hidden', backgroundColor: '#f9f9f9' }}>
                    <View style={{ width: 200, height: 140, backgroundColor: '#e0e0e0' }} />
                    <View style={{ padding: 8 }}>
                      <Text style={{ fontSize: 12, fontWeight: '600', color: '#333' }} numberOfLines={2}>
                        {t('sampleValueTicket') || 'ชื่อแพ็คเกจ'}
                      </Text>
                      <Text style={{ fontSize: 10, color: '#666', marginTop: 4 }}>฿1,500</Text>
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>

        {/* Itinerary / Detail */}
        <View style={{ marginTop: 20 }}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: '700',
              marginBottom: 8,
            }}
          >
            {t('itinerary') || 'ITINERARY'}
          </Text>

          {detailText ? (
            <View>{renderDetail()}</View>
          ) : (
            <Text style={{ color: '#6b7280' }}>
              {t('noItineraryAvailable') || 'No itinerary available'}
            </Text>
          )}

          <View style={{ marginTop: 8 }}>
            {detailFetchError ? (
              <View style={{ marginBottom: 8 }}>
                <Text
                  style={{
                    color: '#dc2626',
                    marginBottom: 6,
                  }}
                >
                  {`Error loading detail: ${detailFetchError}`}
                </Text>
                <TouchableOpacity
                  onPress={retryFetchDetail}
                  style={{
                    alignSelf: 'flex-start',
                    paddingVertical: 6,
                  }}
                >
                  <Text
                    style={{
                      color: '#1d4ed8',
                      fontWeight: '700',
                    }}
                  >
                    {t('retry') || 'Retry'}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </View>
        </View>

        {/* Includes */}
        <View style={{ marginTop: 20 }}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: '700',
              marginBottom: 8,
            }}
          >
            {t('tourIncluded') || 'Tour Included:'}
          </Text>

          {includes && includes.length ? (
            <View>
              {includes.map((inc, idx) => {
                const item = stripHtml(inc);
                return (
                  <View
                    key={`inc-${idx}`}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'flex-start',
                      marginBottom: 8,
                    }}
                  >
                    <Text
                      style={{
                        color: '#10B981',
                        marginRight: 10,
                        fontSize: 14,
                      }}
                    >
                      ✓
                    </Text>
                    <Text
                      style={{
                        color: '#374151',
                        flex: 1,
                        lineHeight: 20,
                      }}
                    >
                      {item}
                    </Text>
                  </View>
                );
              })}
            </View>
          ) : (
            <Text style={{ color: '#6b7280' }}>
              {t('noIncludes') ||
                'No extra include name available'}
            </Text>
          )}
        </View>
          </View>
        )}

        {selectedTab === 1 && (
          <View style={{ padding: 16, alignItems: 'center' }}>
            <Text style={{ color: '#999', fontSize: 14 }}>
              {t('noReviewsYet') || 'ยังไม่มีรีวิว'}
            </Text>
          </View>
        )}

        {selectedTab === 2 && (
          <View style={{ padding: 16 }}>
            <Text style={{ color: '#374151', lineHeight: 22 }}>
              {t('importantNotes') || 'หมายเหตุสำคัญเกี่ยวกับการเดินทาง'}
            </Text>
          </View>
        )}

        {selectedTab === 3 && (
          <View style={{ padding: 16, alignItems: 'center' }}>
            <Text style={{ color: '#999', fontSize: 14 }}>
              {t('noNearbyPlaces') || 'ไม่มีสถานที่ใกล้เคียง'}
            </Text>
          </View>
        )}

        {/* Reserve box (updated UI) */}
        <View
          style={{
            marginTop: 24,
            borderRadius: 12,
            padding: 16,
            borderWidth: 1,
            borderColor: 'rgba(0,0,0,0.04)',
            backgroundColor: '#fff',
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ fontSize: 16, fontWeight: '700' }}>{t('passengers') || 'Passengers'}</Text>
            <AntDesign name="user" size={22} color="#FB6B36" />
          </View>

          {/* passenger controls (improved) */}
          <View style={{ marginBottom: 12 }}>
            {['adult', 'child', 'infant'].map((k) => {
              const value = bookingPassengers[k] || 0;
              const isMinusDisabled = value <= (k === 'adult' ? 1 : 0);
              const isPlusDisabled = value >= MAX_PASSENGERS;

              return (
                <View
                  key={k}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 10,
                  }}
                >
                  <Text style={{ color: '#374151', flex: 1, textTransform: 'capitalize', fontSize: 15 }}>
                    {k === 'adult' ? (t('adults') || 'Adults') : k === 'child' ? (t('children') || 'Children') : (t('infants') || 'Infants')}
                  </Text>

                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: '#f8fafc',
                        borderRadius: 24,
                        paddingVertical: 4,
                        paddingHorizontal: 6,
                      }}
                    >
                      <TouchableOpacity
                        onPress={() => changePassenger(k, -1)}
                        onLongPress={() => startRepeat(k, -1)}
                        onPressOut={() => stopRepeat(k)}
                        delayLongPress={300}
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 18,
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: isMinusDisabled ? '#FFFFFF' : '#FD501E',
                          marginHorizontal: 6,
                          elevation: 0,
                        }}
                      >
                        <AntDesign
                          name="minus"
                          size={18}
                          color={isMinusDisabled ? '#d1d5db' : '#FFFFFF'}
                        />
                      </TouchableOpacity>

                      <View style={{ minWidth: 44, alignItems: 'center' }}>
                        <Text style={{ fontWeight: '700', fontSize: 16 }}>{value}</Text>
                      </View>

                      <TouchableOpacity
                        onPress={() => changePassenger(k, 1)}
                        onLongPress={() => startRepeat(k, 1)}
                        onPressOut={() => stopRepeat(k)}
                        delayLongPress={300}
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 18,
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: isPlusDisabled ? '#FFFFFF' : '#FD501E',
                          marginHorizontal: 6,
                        }}
                      >
                        <AntDesign
                          name="plus"
                          size={18}
                          color={isPlusDisabled ? '#d1d5db' : '#FFFFFF'}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>

          <View style={{ marginBottom: 12 }}>
            <Text style={{ color: '#374151', marginBottom: 6, textAlign: 'center' }}>
              {t('selectDepartureDate') || 'Select departure date'}
            </Text>

            <TouchableOpacity
              onPress={() => setShowDateModal(true)}
              style={{
                width: '100%',                 // ✅ กว้างเต็มการ์ด
                backgroundColor: '#fff',
                paddingVertical: 10,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: 'rgba(0,0,0,0.03)',
                alignItems: 'center',          // ข้อความอยู่กลาง
                justifyContent: 'center',
              }}
            >
              <Text>{formatBookingDate(bookingDate)}</Text>
            </TouchableOpacity>
          </View>

          {/* options */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <TouchableOpacity onPress={() => setBookingOption('special')} style={{ flexDirection: 'row', alignItems: 'center', marginRight: 16 }}>
              <View style={{ width: 16, height: 16, borderRadius: 8, borderWidth: 1, borderColor: '#ccc', alignItems: 'center', justifyContent: 'center', marginRight: 8 }}>
                {bookingOption === 'special' ? <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#FB6B36' }} /> : null}
              </View>
              <Text style={{ color: bookingOption === 'special' ? '#FB6B36' : '#374151', fontWeight: bookingOption === 'special' ? '700' : '400' }}>
                {t('specialDiscountDates') || 'Special discount dates'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setBookingOption('normal')} style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ width: 16, height: 16, borderRadius: 8, borderWidth: 1, borderColor: '#ccc', alignItems: 'center', justifyContent: 'center', marginRight: 8 }}>
                {bookingOption === 'normal' ? <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#FB6B36' }} /> : null}
              </View>
              <Text style={{ color: bookingOption === 'normal' ? '#FB6B36' : '#374151', fontWeight: bookingOption === 'normal' ? '700' : '400' }}>
                {t('normalBookingDates') || 'Normal booking dates'}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={{ backgroundColor: '#FD501E', paddingVertical: 14, borderRadius: 12 }}
            onPress={() => navigation.navigate('TourContact', { 
              tour, 
              tourId, 
              tourtype: tour?.tourtypeID || tour?.tourtype || tour?.TourType || tour?.type || '',
              price: adultPriceFormatted, 
              passengers: bookingPassengers, 
              date: bookingDate ? bookingDate.toISOString() : null, 
              option: bookingOption 
            })}
          >
            <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '700', fontSize: 16 }}>{t('bookNow') || 'Book now'}</Text>
          </TouchableOpacity>
        </View>

        {/* Gallery thumbnails */}
        {gallery && gallery.length ? (
          <View style={{ marginTop: 20 }}>
            <Text
              style={{
                fontWeight: '700',
                marginBottom: 8,
              }}
            >
              {t('gallery') || 'Gallery'}
            </Text>

            <FlatList
              data={gallery}
              horizontal
              keyExtractor={(g, i) => `${i}`}
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  onPress={() => {
                    setModalIndex(index);
                    setModalVisible(true);
                  }}
                  style={{ marginRight: 12 }}
                >
                  <Image
                    source={{ uri: item }}
                    style={{
                      width: 140,
                      height: 90,
                      borderRadius: 8,
                    }}
                  />
                </TouchableOpacity>
              )}
            />
          </View>

        ) : null}
      </ScrollView>

      {/* modal date picker for bookingDate */}
      <DateTimePickerModal
        isVisible={showDateModal}
        mode="date"
        date={bookingDate}
        onConfirm={(d) => {
          setBookingDate(d);
          setShowDateModal(false);
        }}
        onCancel={() => setShowDateModal(false)}
        locale={selectedLanguage === 'th' ? 'th-TH' : 'en-US'}

        modalProps={{
          backdropOpacity: 0.4,
          style: {
            margin: 0,
            justifyContent: 'center',
            alignItems: 'center',
          },
        }}

        pickerContainerStyleIOS={{
          width: pickerWidth,
          borderRadius: 16,
          alignSelf: 'center',
          overflow: 'hidden',
        }}
      />

      {/* Fullscreen image viewer modal */}
      <Modal
        visible={modalVisible}
        transparent={false}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <StatusBar barStyle="light-content" hidden={false} />
        <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }}>
          <View style={{ flex: 1 }}>
            <FlatList
              ref={fullListRef}
              data={gallery}
              horizontal
              pagingEnabled
              initialScrollIndex={modalIndex}
              getItemLayout={(data, index) => ({
                length: screenWidth,
                offset: screenWidth * index,
                index,
              })}
              keyExtractor={(g, i) => `full-${i}`}
              renderItem={({ item }) => (
                <View
                  style={{
                    width: screenWidth,
                    height: screenHeight,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: '#000',
                  }}
                >
                  <Image
                    source={{ uri: item }}
                    style={{
                      width: screenWidth,
                      height: screenHeight,
                      resizeMode: 'contain',
                    }}
                  />
                </View>
              )}
            />

            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={{
                position: 'absolute',
                top: 16,
                right: 16,
                backgroundColor: 'rgba(0,0,0,0.5)',
                padding: 8,
                borderRadius: 20,
              }}
            >
              <AntDesign name="close" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

export default TourDetailScreen;
