import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  Alert,
  Dimensions,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AntDesign, MaterialIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar } from 'react-native-calendars';
import moment from 'moment';
import { useTabBarAutoHide } from '../utils/useTabBarAutoHide';
import { useLanguage } from './Screen/LanguageContext';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import ipAddress from '../config/ipconfig';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const ToursScreen = ({ navigation }) => {
  // ---------------- State ----------------
  const [packageText, setPackageText] = useState('');
  const [tours, setTours] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const searchDebounceRef = useRef(null);

  // >>> refs สำหรับ dropdown popup
  const inputAreaRef = useRef(null); // จะชี้ไปที่กล่อง search (pillInput)
  const [dropdownFrame, setDropdownFrame] = useState(null); // {x,y,width,height}

  const [departureDate, setDepartureDate] = useState(null);
  const [showDepartModal, setShowDepartModal] = useState(false);
  const [calendarStartDate, setCalendarStartDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });

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

  // ---------------- Banner / promo layout ----------------
  const insets = useSafeAreaInsets();
  const EXTRA_TOP_GUTTER = Platform.OS === 'android' ? 0 : 50;
  const bannerTop = insets.top + EXTRA_TOP_GUTTER - 60;

  const [promotions, setPromotions] = useState([]);
  const [bannerUrls, setBannerUrls] = useState([]);
  const [bannerImgW, setBannerImgW] = useState(null);
  const [bannerImgH, setBannerImgH] = useState(null);

  // local fallback banners
  const localBanners = [
    require('../../assets/banner1.png'),
    require('../../assets/banner2.png'),
    require('../../assets/banner3.png'),
  ];
  const bannerSource = localBanners[0];

  const wrapperWidth = screenWidth;
  const wrapperPadding = 8;
  const innerWidth = wrapperWidth - wrapperPadding * 2;

  // aspect ratio calc
  let intrinsicW = bannerImgW;
  let intrinsicH = bannerImgH;
  if (!intrinsicW || !intrinsicH) {
    const localSize =
      Image.resolveAssetSource(bannerSource) || {
        width: innerWidth,
        height: hp('30%'),
      };
    intrinsicW = localSize.width;
    intrinsicH = localSize.height;
  }
  const innerBannerHeight = Math.round((innerWidth * intrinsicH) / intrinsicW);
  const wrapperHeight = innerBannerHeight + wrapperPadding * 2;

  const [bannerIndex, setBannerIndex] = useState(0);
  const scrollRef = useRef(null);

  // hide tab bar on scroll
  const tabBarScrollProps = useTabBarAutoHide();

  // ---------------- Effects ----------------

  // load currency list
  useEffect(() => {
    setCurrencyLoading(true);
    const controller = new AbortController();
    abortControllerRef.current = controller;

    fetch(`${ipAddress}/currency`, { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => {
        if (data && data.status === 'success') {
          setCurrencyList(data.data || []);
        }
      })
      .catch(() => {})
      .finally(() => {
        setCurrencyLoading(false);
      });

    return () => {
      controller.abort();
    };
  }, []);

  // load promotions -> banner URLs
  useEffect(() => {
    let mounted = true;
    fetch('https://thetrago.com/AppApi/promotion')
      .then((res) => res.json())
      .then((data) => {
        if (!mounted) return;
        if (data && data.status === 'success' && Array.isArray(data.data)) {
          setPromotions(data.data);
          const urls = data.data.map(
            (item) =>
              `https://www.thetrago.com/Api/uploads/promotion/index/${item.md_promotion_picname}`
          );
          setBannerUrls(urls);
          setBannerIndex(0);

          if (urls.length > 0) {
            Image.getSize(
              urls[0],
              (w, h) => {
                if (mounted) {
                  setBannerImgW(w);
                  setBannerImgH(h);
                }
              },
              () => {}
            );
          }
        }
      })
      .catch(() => {})
      .finally(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  // auto-slide banner
  useEffect(() => {
    const id = setInterval(() => {
      setBannerIndex((prev) => {
        const arr = bannerUrls.length > 0 ? bannerUrls : localBanners;
        const next = (prev + 1) % arr.length;
        if (scrollRef.current) {
          scrollRef.current.scrollTo({ x: next * innerWidth, animated: true });
        }
        return next;
      });
    }, 4000);
    return () => clearInterval(id);
  }, [innerWidth, bannerUrls.length]);

  // load all tours for local search
  useEffect(() => {
    let mounted = true;
    fetch('https://thetrago.com/AppApi/toursearch')
      .then((res) => res.json())
      .then((data) => {
        if (!mounted) return;
        if (data && data.status === 'success' && Array.isArray(data.data)) {
          setTours(data.data);
        }
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  // clear dropdown when text empty
  useEffect(() => {
    if (!packageText || packageText.trim().length === 0) {
      setSearchResults([]);
    }
  }, [packageText]);

  // วัดตำแหน่ง input เพื่อวาง dropdown popup ให้ตรง
  useEffect(() => {
    if (
      searchResults.length > 0 &&
      inputAreaRef.current &&
      inputAreaRef.current.measureInWindow
    ) {
      // วัดตำแหน่งของกล่อง search (pillInput)
      inputAreaRef.current.measureInWindow((x, y, width, height) => {
        setDropdownFrame({ x, y, width, height });
      });
    }
  }, [searchResults]);

  // ---------------- Render ----------------
  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      {/* bottom half orange bg */}
      <View
        style={{
          position: 'absolute',
          top: screenHeight / 2,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: '#FF7A3A',
        }}
        pointerEvents="none"
      />

      {/* banner area */}
      <View
        style={{
          position: 'absolute',
          top: bannerTop,
          left: 0,
          width: wrapperWidth,
          height: wrapperHeight,
          overflow: 'hidden',
          zIndex: 0,
        }}
      >
        <View
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'transparent',
          }}
        />

        <View
          style={{
            padding: wrapperPadding,
            width: '100%',
            height: '100%',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              width:
                innerWidth *
                (bannerUrls.length > 0 ? bannerUrls.length : localBanners.length),
            }}
            snapToInterval={innerWidth}
            decelerationRate="fast"
            onMomentumScrollEnd={(e) => {
              const idx = Math.round(
                e.nativeEvent.contentOffset.x / innerWidth
              );
              setBannerIndex(idx);
            }}
          >
            {(bannerUrls.length > 0 ? bannerUrls : localBanners).map(
              (src, i) => (
                <Image
                  key={i}
                  source={typeof src === 'string' ? { uri: src } : src}
                  style={{
                    width: innerWidth,
                    height: innerBannerHeight,
                    borderRadius: 12,
                  }}
                  resizeMode="cover"
                />
              )
            )}
          </ScrollView>
        </View>
      </View>

      {/* back button on banner */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => navigation && navigation.goBack && navigation.goBack()}
        style={{
          position: 'absolute',
          top: bannerTop + 12,
          left: 12,
          zIndex: 6,
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: 'rgba(255,255,255,0.95)',
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 1,
          borderColor: 'rgba(0,0,0,0.06)',
        }}
      >
        <Ionicons name="arrow-back" size={22} color="#1E293B" />
      </TouchableOpacity>

      {/* banner dots */}
      <View
        style={{
          position: 'absolute',
          top: bannerTop + wrapperHeight + 8,
          left: 0,
          right: 0,
          alignItems: 'center',
          zIndex: 3,
        }}
        pointerEvents="box-none"
      >
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {(bannerUrls.length > 0 ? bannerUrls : localBanners).map((_, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => {
                if (scrollRef.current) {
                  scrollRef.current.scrollTo({
                    x: i * innerWidth,
                    animated: true,
                  });
                }
                setBannerIndex(i);
              }}
              activeOpacity={0.8}
              style={{ padding: 4 }}
            >
              <View
                style={{
                  width: bannerIndex === i ? 12 : 8,
                  height: bannerIndex === i ? 12 : 8,
                  borderRadius: 8,
                  backgroundColor:
                    bannerIndex === i
                      ? '#2563EB'
                      : 'rgba(37,99,235,0.35)',
                }}
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* =========================
          DROPDOWN PORTAL + OVERLAY
         ========================= */}
      {searchResults.length > 0 && dropdownFrame && (
        <View style={styles.dropdownPortalWrapper} pointerEvents="box-none">
          {/* ตัวคลุมโปร่งใสเต็มจอ: กดตรงนี้ = ปิด dropdown */}
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setSearchResults([])}
            style={styles.fullscreenTouchCatcher}
          />

          {/* ตัว popup dropdown ที่ลอยตามตำแหน่ง input */}
          <View
            style={[
              styles.dropdownContainerPortal,
              {
                top: dropdownFrame.y + dropdownFrame.height + 8,
                left: dropdownFrame.x,
                width: dropdownFrame.width,
              },
            ]}
          >
            {/* Header */}
            <View style={styles.dropdownHeaderRow}>
              <Ionicons
                name="location-outline"
                size={16}
                color="#FD501E"
                style={{ marginRight: 6 }}
              />
              <Text style={styles.dropdownHeaderText} numberOfLines={1}>
                {t('searchResults') || 'ผลการค้นหา'}
              </Text>
            </View>

            {/* รายการผลลัพธ์ */}
            <ScrollView
              style={styles.dropdownScroll}
              nestedScrollEnabled
              showsVerticalScrollIndicator={true}
            >
              {searchResults.map((item, index) => (
                <TouchableOpacity
                  key={item.md_tour_id}
                  activeOpacity={0.8}
                  onPress={() => {
                    const label =
                      item.md_tour_name_thai ||
                      item.md_tour_name_eng ||
                      '';
                    setPackageText(label);
                    setSearchResults([]);
                  }}
                  style={[
                    styles.resultRow,
                    index === 0 && styles.resultRowFirst,
                    index === searchResults.length - 1 &&
                      styles.resultRowLast,
                  ]}
                >
                  <View style={styles.resultLeft}>
                    <MaterialIcons
                      name="place"
                      size={18}
                      color="#FD501E"
                    />
                  </View>

                  <View style={styles.resultBody}>
                    <Text
                      style={styles.resultTitle}
                      numberOfLines={2}
                      ellipsizeMode="tail"
                    >
                      {item.md_tour_name_thai || item.md_tour_name_eng}
                    </Text>
                  </View>

                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color="#94A3B8"
                    style={styles.resultChevron}
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      )}

      {/* main scroll content */}
      <ScrollView
        {...tabBarScrollProps}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* search card */}
        <View style={[styles.card, styles.overlayCard]}>
          <View style={styles.formRow}>
            {/* Tour Package input */}
            <Text style={styles.label}>
              {t('tourPackage') || 'แพ็กเกจทัวร์'}
            </Text>

            <View style={styles.searchWrapper}>
              <View style={styles.pillInput} ref={inputAreaRef}>
                {/* icon left */}
                <View style={styles.inputIconWrap}>
                  <Ionicons name="search" size={18} color="#FD501E" />
                </View>

                {/* textinput */}
                <View style={styles.inputWrapper}>
                  <TextInput
                    placeholder={
                      t('findPlacesPlaceholder') ||
                      'Find places or your next experience'
                    }
                    placeholderTextColor="#64748B"
                    value={packageText}
                    onChangeText={(text) => {
                      setPackageText(text);

                      if (searchDebounceRef.current) {
                        clearTimeout(searchDebounceRef.current);
                      }

                      if (!text || text.trim().length === 0) {
                        setSearchResults([]);
                        return;
                      }

                      searchDebounceRef.current = setTimeout(() => {
                        const q = text.trim().toLowerCase();
                        const results = tours.filter((it) => {
                          const thai = (it.md_tour_name_thai || '')
                            .toString()
                            .toLowerCase();
                          const eng = (it.md_tour_name_eng || '')
                            .toString()
                            .toLowerCase();
                          return (
                            thai.includes(q) || eng.includes(q)
                          );
                        });
                        setSearchResults(results.slice(0, 10));
                      }, 250);
                    }}
                    style={styles.pillInputText}
                    multiline={false}
                    numberOfLines={1}
                    returnKeyType="done"
                  />
                </View>
              </View>
            </View>

            {/* Departure date */}
            <Text style={styles.label}>
              {t('departureDate') || 'วันที่ขาไป'}
            </Text>
            <TouchableOpacity
              style={[styles.pillInputTouchable, styles.inputRowTouchable]}
              activeOpacity={0.8}
              onPress={() => setShowDepartModal(true)}
            >
              <View style={styles.inputIconWrap}>
                <MaterialIcons name="event" size={20} color="#FD501E" />
              </View>
              <Text
                style={{
                  color: departureDate ? '#222' : '#9CA3AF',
                  flex: 1,
                }}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {departureDate
                  ? moment(departureDate)
                      .locale(selectedLanguage)
                      .format('DD MMM YYYY')
                  : calendarStartDate
                  ? moment(calendarStartDate)
                      .locale(selectedLanguage)
                      .format('DD MMM YYYY')
                  : t('departureDate') || 'Departure'}
              </Text>
            </TouchableOpacity>

            {/* Passenger */}
            <Text style={styles.label}>{t('passenger') || 'ผู้โดยสาร'}</Text>
            <TouchableOpacity
              style={[styles.pillInputTouchable, styles.inputRowTouchable]}
              activeOpacity={0.8}
              onPress={() => setPassengerModalVisible(true)}
            >
              <View style={styles.inputIconWrap}>
                <Ionicons
                  name="people-outline"
                  size={20}
                  color="#FD501E"
                />
              </View>
              <Text
                style={[styles.passengerText, { flex: 1 }]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {adults} {t('adult') || 'ผู้ใหญ่'}, {children}{' '}
                {t('child') || 'เด็ก'}, {infant}{' '}
                {t('infant') || 'ทารก'}
              </Text>
            </TouchableOpacity>

            {/* Search button */}
            <TouchableOpacity
              activeOpacity={0.9}
              style={styles.searchButtonWrapper}
              onPress={() => {
                navigation && navigation.navigate
                  ? navigation.navigate('SearchResults', {
                      q: packageText,
                      // pass serializable date (ISO string) to avoid non-serializable navigation params
                      departureDate: departureDate ? moment(departureDate).toISOString() : '',
                      adults,
                      children,
                      infant,
                      currency: selectedCurrency,
                    })
                  : null;
              }}
            >
              <LinearGradient
                colors={['#FD501E', '#FF7A3A']}
                style={styles.searchButtonGradient}
              >
                <Ionicons
                  name="search"
                  size={18}
                  color="#fff"
                  style={{ marginRight: 10 }}
                />
                <Text style={styles.searchText}>
                  {t('searchButton') || 'ค้นหา'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* ---- DATE MODAL ---- */}
      <Modal
        visible={showDepartModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDepartModal(false)}
        statusBarTranslucent
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,18,51,0.75)',
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: Platform.OS === 'android' ? 12 : 16,
            paddingVertical: Platform.OS === 'android' ? 16 : 24,
            paddingTop: Platform.OS === 'android' ? 40 : 30,
          }}
        >
          <View
            style={{
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
              shadowOffset:
                Platform.OS === 'android'
                  ? { width: 0, height: 0 }
                  : { width: 0, height: 8 },
              elevation: Platform.OS === 'android' ? 8 : 20,
              borderWidth: 1,
              borderColor: 'rgba(253, 80, 30, 0.08)',
            }}
          >
            {/* header */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: Platform.OS === 'android' ? 12 : 20,
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  flex: 1,
                }}
              >
                <MaterialIcons
                  name="event"
                  size={Platform.OS === 'android' ? 20 : 24}
                  color="#FD501E"
                  style={{ marginRight: 8 }}
                />
                <Text
                  style={{
                    fontWeight: '800',
                    fontSize: Platform.OS === 'android' ? 16 : 18,
                    color: '#1E293B',
                    letterSpacing: -0.3,
                    flex: 1,
                  }}
                  numberOfLines={1}
                >
                  {t('selectDepartureDate') || 'เลือกวันที่เดินทาง'}
                </Text>
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
                <AntDesign
                  name="close"
                  size={Platform.OS === 'android' ? 16 : 20}
                  color="#64748B"
                />
              </TouchableOpacity>
            </View>

            {/* calendar body */}
            <View
              style={{
                flex: 1,
                minHeight: Platform.OS === 'android' ? hp('55%') : hp('50%'),
              }}
            >
              <ScrollView
                style={{
                  maxHeight:
                    Platform.OS === 'android' ? hp('55%') : hp('50%'),
                }}
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled={true}
              >
                <View
                  style={{
                    backgroundColor: 'rgba(253, 80, 30, 0.06)',
                    borderRadius: Platform.OS === 'android' ? 12 : 16,
                    padding: Platform.OS === 'android' ? 12 : 16,
                    borderWidth: 1,
                    borderColor: 'rgba(253, 80, 30, 0.1)',
                    marginBottom: Platform.OS === 'android' ? 8 : 12,
                    minHeight: Platform.OS === 'android' ? 350 : 380,
                  }}
                >
                  <Calendar
                    current={calendarStartDate}
                    minDate={new Date().toISOString().split('T')[0]}
                    onDayPress={(day) => setCalendarStartDate(day.dateString)}
                    markedDates={{
                      [calendarStartDate]: {
                        selected: true,
                        selectedColor: '#FD501E',
                        selectedTextColor: '#FFFFFF',
                      },
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
                      textDayFontSize:
                        Platform.OS === 'android' ? 14 : 16,
                      textMonthFontSize:
                        Platform.OS === 'android' ? 16 : 18,
                      textDayHeaderFontSize:
                        Platform.OS === 'android' ? 12 : 14,
                    }}
                    enableSwipeMonths={true}
                    firstDay={1}
                  />
                </View>
              </ScrollView>

              {/* confirm date */}
              <View
                style={{
                  paddingTop: Platform.OS === 'android' ? 16 : 20,
                  paddingBottom: Platform.OS === 'android' ? 8 : 12,
                }}
              >
                <TouchableOpacity
                  onPress={() => {
                    if (calendarStartDate) {
                      setDepartureDate(new Date(calendarStartDate));
                      setShowDepartModal(false);
                    } else {
                      Alert.alert(
                        t('warning') || 'คำเตือน',
                        t('pleaseSelectDepartureDate') ||
                          'กรุณาเลือกวันที่เดินทาง'
                      );
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
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}
                  >
                    <MaterialIcons
                      name="check"
                      size={Platform.OS === 'android' ? 20 : 22}
                      color="#FFFFFF"
                      style={{ marginRight: 8 }}
                    />
                    <Text
                      style={{
                        color: '#FFFFFF',
                        fontWeight: '800',
                        fontSize:
                          Platform.OS === 'android' ? 16 : 18,
                        letterSpacing: 0.5,
                      }}
                    >
                      {t('confirmDepartureDate') || 'ยืนยัน'}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* ---- PASSENGER MODAL ---- */}
      <Modal
        visible={isPassengerModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPassengerModalVisible(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.65)',
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 20,
          }}
        >
          <View
            style={{
              backgroundColor: '#fff',
              borderRadius: 32,
              padding: 24,
              width: '100%',
              maxWidth: 420,
              borderWidth: 1,
              borderColor: 'rgba(253, 80, 30, 0.1)',
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 20,
              }}
            >
              <Text
                style={{
                  fontWeight: '800',
                  fontSize: 22,
                  color: '#1E293B',
                  letterSpacing: -0.5,
                }}
              >
                {t('selectPassengers') || 'เลือกผู้โดยสาร'}
              </Text>
              <TouchableOpacity
                onPress={() => setPassengerModalVisible(false)}
                style={{
                  backgroundColor: '#F1F5F9',
                  padding: 8,
                  borderRadius: 20,
                }}
              >
                <AntDesign
                  name="close"
                  size={20}
                  color="#64748B"
                />
              </TouchableOpacity>
            </View>

            <View style={{ marginBottom: 20 }}>
              {/* Adults */}
              <View style={styles.passengerRow}>
                <Text style={styles.passengerLabel}>
                  {t('adults') || 'ผู้ใหญ่'}
                </Text>
                <View style={styles.passengerCounter}>
                  <TouchableOpacity
                    onPress={() =>
                      setAdults(Math.max(1, adults - 1))
                    }
                    style={[
                      styles.counterBtn,
                      {
                        backgroundColor:
                          adults > 1
                            ? 'rgba(253, 80, 30, 0.15)'
                            : '#F1F5F9',
                      },
                    ]}
                  >
                    <Ionicons
                      name="remove-circle"
                      size={24}
                      color={
                        adults > 1
                          ? '#FD501E'
                          : '#94A3B8'
                      }
                    />
                  </TouchableOpacity>

                  <Text style={styles.counterValue}>
                    {adults}
                  </Text>

                  <TouchableOpacity
                    onPress={() =>
                      setAdults(Math.min(10, adults + 1))
                    }
                    style={[
                      styles.counterBtn,
                      {
                        backgroundColor:
                          adults < 10
                            ? 'rgba(253, 80, 30, 0.15)'
                            : '#F1F5F9',
                      },
                    ]}
                  >
                    <Ionicons
                      name="add-circle"
                      size={24}
                      color={
                        adults < 10
                          ? '#FD501E'
                          : '#94A3B8'
                      }
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Children */}
              <View style={styles.passengerRow}>
                <Text style={styles.passengerLabel}>
                  {t('children') || 'เด็ก'}
                </Text>
                <View style={styles.passengerCounter}>
                  <TouchableOpacity
                    onPress={() =>
                      setChildren(Math.max(0, children - 1))
                    }
                    style={[
                      styles.counterBtn,
                      {
                        backgroundColor:
                          children > 0
                            ? 'rgba(253, 80, 30, 0.15)'
                            : '#F1F5F9',
                      },
                    ]}
                  >
                    <Ionicons
                      name="remove-circle"
                      size={24}
                      color={
                        children > 0
                          ? '#FD501E'
                          : '#94A3B8'
                      }
                    />
                  </TouchableOpacity>

                  <Text style={styles.counterValue}>
                    {children}
                  </Text>

                  <TouchableOpacity
                    onPress={() =>
                      setChildren(Math.min(10, children + 1))
                    }
                    style={[
                      styles.counterBtn,
                      {
                        backgroundColor:
                          children < 10
                            ? 'rgba(253, 80, 30, 0.15)'
                            : '#F1F5F9',
                      },
                    ]}
                  >
                    <Ionicons
                      name="add-circle"
                      size={24}
                      color={
                        children < 10
                          ? '#FD501E'
                          : '#94A3B8'
                      }
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Infants */}
              <View style={styles.passengerRow}>
                <Text style={styles.passengerLabel}>
                  {t('infants') || 'ทารก'}
                </Text>
                <View style={styles.passengerCounter}>
                  <TouchableOpacity
                    onPress={() =>
                      setInfant(Math.max(0, infant - 1))
                    }
                    style={[
                      styles.counterBtn,
                      {
                        backgroundColor:
                          infant > 0
                            ? 'rgba(253, 80, 30, 0.15)'
                            : '#F1F5F9',
                      },
                    ]}
                  >
                    <Ionicons
                      name="remove-circle"
                      size={24}
                      color={
                        infant > 0
                          ? '#FD501E'
                          : '#94A3B8'
                      }
                    />
                  </TouchableOpacity>

                  <Text style={styles.counterValue}>
                    {infant}
                  </Text>

                  <TouchableOpacity
                    onPress={() =>
                      setInfant(Math.min(10, infant + 1))
                    }
                    style={[
                      styles.counterBtn,
                      {
                        backgroundColor:
                          infant < 10
                            ? 'rgba(253, 80, 30, 0.15)'
                            : '#F1F5F9',
                      },
                    ]}
                  >
                    <Ionicons
                      name="add-circle"
                      size={24}
                      color={
                        infant < 10
                          ? '#FD501E'
                          : '#94A3B8'
                      }
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => setPassengerModalVisible(false)}
              style={{
                backgroundColor: '#FD501E',
                borderRadius: 20,
                padding: 16,
                alignItems: 'center',
                marginTop: 12,
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.2)',
              }}
            >
              <Text
                style={{
                  color: '#fff',
                  fontWeight: 'bold',
                  fontSize: 16,
                  letterSpacing: 0.5,
                }}
              >
                {t('confirmSelection') || 'ยืนยัน'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ---- CURRENCY MODAL ---- */}
      <Modal
        visible={isCurrencyModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCurrencyModalVisible(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.65)',
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 20,
          }}
        >
          <View
            style={{
              backgroundColor: '#fff',
              borderRadius: 20,
              padding: 20,
              width: '100%',
              maxWidth: 420,
              borderWidth: 1,
              borderColor: 'rgba(253,80,30,0.08)',
            }}
          >
            <TouchableOpacity
              onPress={() => setCurrencyModalVisible(false)}
              style={{
                position: 'absolute',
                top: 12,
                right: 12,
                zIndex: 10,
                backgroundColor: '#FFF3ED',
                padding: 6,
                borderRadius: 20,
              }}
            >
              <AntDesign name="close" size={20} color="#FD501E" />
            </TouchableOpacity>

            <Text
              style={{
                fontSize: 18,
                fontWeight: '800',
                color: '#FD501E',
                textAlign: 'center',
                marginBottom: 12,
              }}
            >
              {t('selectCurrency') || 'เลือกสกุลเงิน'}
            </Text>

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
                    backgroundColor:
                      selectedCurrency ===
                      currency.md_currency_code
                        ? '#FFF3ED'
                        : '#F9F9F9',
                    marginBottom: 10,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      color: '#333',
                    }}
                  >
                    {currency.md_currency_symbol}{' '}
                    {currency.md_currency_name} (
                    {currency.md_currency_code})
                  </Text>
                  {selectedCurrency ===
                    currency.md_currency_code && (
                    <AntDesign
                      name="check-circle"
                      size={18}
                      color="#FD501E"
                    />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// ---------------- Styles ----------------
const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
    marginTop: 10,
    zIndex: 1,
    backgroundColor: 'transparent',
  },

  formRow: { marginTop: 6 },

  label: {
    color: '#888',
    marginBottom: 6,
    marginLeft: 4,
    fontSize: 13,
  },

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
    borderColor: 'rgba(253,80,30,0.04)',
  },

  overlayCard: {
    marginTop: hp('26%'),
  },

  searchWrapper: {
    width: '100%',
    position: 'relative',
    marginBottom: 12,
    zIndex: 100,
  },

  pillInput: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E6E6E6',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },

  pillInputTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E6E6E6',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
    backgroundColor: '#fff',
  },

  inputRowTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  inputIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#FFF7F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(253,80,30,0.06)',
  },

  // กันข้อความล้น
  inputWrapper: {
    flex: 1,
    position: 'relative',
    minWidth: 0,
  },

  pillInputText: {
    flex: 1,
    fontSize: 16,
    color: '#1E293B',
    paddingVertical: 0,
    minWidth: 0,
  },

  passengerText: {
    color: '#222',
    fontSize: 16,
    fontWeight: '400',
  },

  searchButtonWrapper: { marginTop: 6 },

  searchButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 12,
  },

  searchText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },

  /* ===== Dropdown portal styles ===== */

  dropdownPortalWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
    elevation: 999,
  },

  fullscreenTouchCatcher: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    zIndex: 1,
  },

  dropdownContainerPortal: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingTop: 8,
    paddingBottom: 8,
    paddingHorizontal: 8,

    borderWidth: 1,
    borderColor: 'rgba(15,23,42,0.05)',

    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 24,
    elevation: 12,

    maxHeight: 300,
    zIndex: 2,
  },

  dropdownHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(253,80,30,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(253,80,30,0.12)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 8,
  },

  dropdownHeaderText: {
    color: '#FD501E',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: -0.2,
  },

  dropdownScroll: {
    maxHeight: 260,
  },

  resultRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },

  resultRowFirst: {
    borderTopWidth: 0,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },

  resultRowLast: {
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },

  resultLeft: {
    width: 28,
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginRight: 8,
    paddingTop: 2,
  },

  resultBody: {
    flex: 1,
    minWidth: 0,
  },

  resultTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
    lineHeight: 20,
  },

  resultChevron: {
    marginLeft: 8,
    alignSelf: 'center',
  },

  // passenger modal rows
  passengerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(253, 80, 30, 0.05)',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(253, 80, 30, 0.1)',
    marginBottom: 16,
  },

  passengerLabel: {
    color: '#FD501E',
    fontWeight: '800',
    fontSize: 16,
    flex: 1,
    letterSpacing: -0.3,
  },

  passengerCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
  },

  counterBtn: {
    padding: 4,
    borderRadius: 16,
  },

  counterValue: {
    fontSize: 18,
    fontWeight: '800',
    marginHorizontal: 12,
    minWidth: 24,
    textAlign: 'center',
    color: '#1E293B',
    letterSpacing: -0.5,
  },
});

export default ToursScreen;
