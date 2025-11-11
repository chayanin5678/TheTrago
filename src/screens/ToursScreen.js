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
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AntDesign, MaterialIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar } from 'react-native-calendars';
import moment from 'moment';
import { useTabBarAutoHide } from '../utils/useTabBarAutoHide';
import { useLanguage } from './Screen/LanguageContext';
import { useCustomer } from './Screen/CustomerContext';
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

  // >>> Selected category tab
  const [selectedTab, setSelectedTab] = useState('กรุงเทพฯ');

  // >>> Scroll animation for search box
  const scrollY = useRef(new Animated.Value(0)).current;

  // Animated wrappers for touchables
  const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

  const [departureDate, setDepartureDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  });
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
  const { updateCustomerData } = useCustomer();

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
        if (scrollRef.current && arr.length > 0) {
          scrollRef.current.scrollTo({ x: next * screenWidth, animated: true });
        }
        return next;
      });
    }, 4000);
    return () => clearInterval(id);
  }, [bannerUrls.length]);

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
  const categoryTabs = ['กรุงเทพฯ', 'จีน', 'เชียงใหม่', 'เชียงใส', 'ญี่ปุ่น', 'ฮองกง'];
  
  const categoryIcons = [
    { icon: '🎫', label: 'ตั๋วที่เที่ยว', iconName: 'airplane' },
    { icon: '🗺️', label: 'ทัวร์', iconName: 'map' },
    { icon: '🚢', label: 'กิจกรรมล่องเรือ', iconName: 'boat' },
    { icon: '🏖️', label: 'กิจกรรมกลางแจ้ง', iconName: 'sunny' },
    { icon: '💆', label: 'สุขภาพและสปา', iconName: 'fitness' },
    { icon: '⛰️', label: 'ประสบการณ์ทางวัฒนธรรม', iconName: 'navigate' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      {/* Back button - fixed position */}
      <Animated.View style={[
        styles.fixedBackButton,
        {
          opacity: scrollY.interpolate({
            inputRange: [0, 50],
            outputRange: [1, 0],
            extrapolate: 'clamp',
          }),
        }
      ]}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => navigation && navigation.goBack && navigation.goBack()}
          style={styles.backButtonCircle}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </Animated.View>

      {/* Restored Animated search container (fixed interpolate types) */}
      <Animated.View
        style={[
          styles.animatedSearchContainer,
          {
            backgroundColor: scrollY.interpolate({
              inputRange: [0, 150],
              outputRange: ['#FFFFFF', '#FFFFFF'],
              extrapolate: 'clamp',
            }),
            paddingTop: scrollY.interpolate({
              inputRange: [0, 100],
              outputRange: [0, Platform.OS === 'android' ? 20 : 40],
              extrapolate: 'clamp',
            }),
            transform: [
              {
                translateY: scrollY.interpolate({
                  inputRange: [0, 150],
                  outputRange: [0, -140],
                  extrapolate: 'clamp',
                }),
              },
            ],
            width: scrollY.interpolate({
                inputRange: [0, 150],
                // Start wider (90% of screen) so it extends more to the left, expand to full width minus small margin
                outputRange: [screenWidth * 0.8, screenWidth ],
                extrapolate: 'clamp',
              }),
           borderRadius: scrollY.interpolate({
                inputRange: [0, 150],
                outputRange: [10, 0],
                extrapolate: 'clamp',
              }),
        }
      ]}>
        <View style={styles.searchBoxContainer}>
          <Animated.View
            style={{
              opacity: scrollY.interpolate({
                inputRange: [100, 150],
                outputRange: [0, 1],
                extrapolate: 'clamp',
              }),
            }}
          >
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => navigation && navigation.goBack && navigation.goBack()}
              style={styles.searchBackButton}
            >
              <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
          </Animated.View>

          <Animated.View style={[styles.searchBox, {
            left: scrollY.interpolate({
              inputRange: [0, 150],
              outputRange: [-50, 0],
              extrapolate: 'clamp',
            }),
             marginRight: scrollY.interpolate({  
             inputRange: [0, 150],
              outputRange: [-50, 0],
              extrapolate: 'clamp',
            }),
            shadowOpacity: scrollY.interpolate({
              inputRange: [0, 150],
              outputRange: [0, 0.1],  
              extrapolate: 'clamp',
            }),
            
          }]} ref={inputAreaRef}>
            <TextInput
              placeholder="กรุงเทพฯ"
              placeholderTextColor="#999"
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
                    return thai.includes(q) || eng.includes(q);
                  });
                  setSearchResults(results.slice(0, 10));
                }, 250);
              }}
              style={styles.searchInput}
            />
            {packageText ? (
              <TouchableOpacity
                onPress={() => {
                  setPackageText('');
                  setSearchResults([]);
                }}
                style={{ marginLeft: 8 }}
              >
                <Ionicons name="close-circle" size={20} color="#999" />
              </TouchableOpacity>
            ) : null}
          </Animated.View>

          <AnimatedTouchableOpacity
            style={[
              styles.searchButton, 
              { width: scrollY.interpolate({
                inputRange: [100, 150],
                outputRange: [90, 48],
                extrapolate: 'clamp'
             
              }),
               }
         ]}
            onPress={() => {
              navigation && navigation.navigate
                ? navigation.navigate('SearchResults', {
                    q: packageText,
                    departureDate: departureDate ? moment(departureDate).toISOString() : '',
                    adults,
                    children,
                    infant,
                    currency: selectedCurrency,
                  })
                : null;
            }}
          >
             <Animated.View
            style={{
              left: scrollY.interpolate({
                inputRange: [100, 150],
                outputRange: [0, 23],
                extrapolate: 'clamp',
              }),
            }}
          >
            <Ionicons name="search" size={20} color="#FFFFFF" />
            </Animated.View>
             <Animated.View
            style={{
              opacity: scrollY.interpolate({
                inputRange: [100, 150],
                outputRange: [1, 0],
                extrapolate: 'clamp',
              }),
            }}
          >
            <Text style={[styles.searchButtonText, { marginLeft: 8 }]}>ค้นหา</Text>
            </Animated.View>

        

          </AnimatedTouchableOpacity>
             
        </View>
      </Animated.View>

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
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        onScroll={(event) => {
          const offsetY = event.nativeEvent.contentOffset.y;
          scrollY.setValue(offsetY);
          
          // Handle tab bar auto-hide
          if (tabBarScrollProps.onScroll) {
            tabBarScrollProps.onScroll(event);
          }
        }}
        scrollEventThrottle={16}
      >
        {/* Background Image Section */}
        <View style={styles.bannerSection}>
          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(event) => {
              const contentOffsetX = event.nativeEvent.contentOffset.x;
              const currentIndex = Math.round(contentOffsetX / screenWidth);
              setBannerIndex(currentIndex);
            }}
            style={styles.bannerScrollView}
          >
            {(bannerUrls.length > 0 ? bannerUrls : localBanners).map((item, index) => (
              <View key={index} style={{ width: screenWidth }}>
                <Image
                  source={typeof item === 'string' ? { uri: item } : item}
                  style={styles.bannerImage}
                  resizeMode="contain"
                />
              </View>
            ))}
          </ScrollView>
          <LinearGradient
            colors={['transparent', 'transparent', 'transparent', '#FFFFFF', '#FFFFFF']}
            style={styles.bannerGradient}
          />
        </View>

        {/* Category Tabs + Icons: grouped into one content card */}
        <View style={styles.contentCard}>
        {/* Category Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabsContainer}
          contentContainerStyle={styles.tabsContent}
        >
          {categoryTabs.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tab,
                selectedTab === tab && styles.tabSelected,
              ]}
              onPress={() => setSelectedTab(tab)}
            >
              <Text
                style={[
                  styles.tabText,
                  selectedTab === tab && styles.tabTextSelected,
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

  {/* Category Icons Grid */}
  <View style={styles.categoryGrid}>
          {categoryIcons.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.categoryItem}
              onPress={() => {
                // Navigate to specific category
              }}
            >
              <View style={styles.categoryIconContainer}>
                <Ionicons name={item.iconName} size={28} color="#FD501E" />
              </View>
              <Text style={styles.categoryLabel} numberOfLines={2}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

  {/* Additional Category Rows */}
  <View style={styles.additionalCategories}>
          <TouchableOpacity style={styles.categoryRow}>
              <View style={styles.categoryRowIcon}>
              <Ionicons name="fitness" size={24} color="#FD501E" />
            </View>
            <Text style={styles.categoryRowText}>กิจกรรมกลางแจ้ง</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.categoryRow}>
            <View style={styles.categoryRowIcon}>
              <Ionicons name="medkit" size={24} color="#FF1493" />
            </View>
            <Text style={styles.categoryRowText}>สุขภาพและสปา</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.categoryRow}>
            <View style={styles.categoryRowIcon}>
              <Ionicons name="beer" size={24} color="#FFA500" />
            </View>
            <Text style={styles.categoryRowText}>ประสบการณ์ทางวัฒนธรรม</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
  </View>
  </View>

  {/* Recently Viewed Section */}
        <View style={styles.promotionsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>ดูล่าสุด</Text>
          </View>
          
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.promotionsScroll}
          >
            {promotions.slice(0, 3).map((promo, index) => (
              <TouchableOpacity
                key={promo.md_promotion_id || index}
                style={styles.promoCard}
                onPress={() => {
                  // Navigate to promotion detail
                }}
              >
                <Image
                  source={{
                    uri: `https://www.thetrago.com/Api/uploads/promotion/index/${promo.md_promotion_picname}`,
                  }}
                  style={styles.promoImage}
                  resizeMode="cover"
                />
                <View style={styles.promoInfo}>
                  <View style={styles.promoLocation}>
                    <Ionicons name="location" size={14} color="#666" />
                    <Text style={styles.promoLocationText} numberOfLines={1}>
                      {promo.md_promotion_name || 'โปรโมชั่น'}
                    </Text>
                  </View>
                  <Text style={styles.promoTitle} numberOfLines={2}>
                    {promo.md_promotion_name || 'แพ็คเกจพิเศษ'}
                  </Text>
                  <View style={styles.promoRating}>
                    <Text style={styles.ratingBadge}>❤️ 8.6</Text>
                    <Text style={styles.tripBestBadge}>🏆 Trip.Best</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Bottom info section */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>ที่เที่ยวกรุงเทพฯสำหรับคนพื้นที่</Text>
        </View>

        {/* Bottom Navigation Tabs */}
        <View style={styles.bottomTabs}>
            <TouchableOpacity style={styles.bottomTab}>
            <Ionicons name="star" size={24} color="#FD501E" />
            <Text style={styles.bottomTabText}>ตั๋วเลือกยอดนิยม</Text>
            <View style={styles.bottomTabIndicator} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.bottomTab}>
            <Ionicons name="ticket" size={24} color="#666" />
            <Text style={[styles.bottomTabText, { color: '#666' }]}>สถานที่ท่องเที่ยว</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.bottomTab}>
            <Ionicons name="planet" size={24} color="#666" />
            <Text style={[styles.bottomTabText, { color: '#666' }]}>กิจกรรม</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.bottomTab}>
            <Ionicons name="cash" size={24} color="#666" />
            <Text style={[styles.bottomTabText, { color: '#666' }]}>สิ่งอำนวยความสะดวก</Text>
          </TouchableOpacity>
        </View>

        {/* Final Promotion Card */}
        {promotions.length > 0 && (
          <View style={styles.finalPromoCard}>
            <TouchableOpacity
              onPress={() => {
                // Navigate to promotion detail
              }}
            >
              <Image
                source={{
                  uri: `https://www.thetrago.com/Api/uploads/promotion/index/${promotions[0].md_promotion_picname}`,
                }}
                style={styles.finalPromoImage}
                resizeMode="cover"
              />
              <View style={styles.heartIcon}>
                <Ionicons name="heart-outline" size={24} color="#FFF" />
              </View>
            </TouchableOpacity>
            <View style={styles.finalPromoInfo}>
              <View style={styles.promoTagContainer}>
                <Text style={styles.promoTag}>ดูล่าสุด</Text>
              </View>
              <Text style={styles.finalPromoTitle}>พระบรมมหาราชวัง</Text>
              <View style={styles.finalPromoRating}>
                <Text style={styles.finalRatingScore}>❤️ 8.6</Text>
              </View>
            </View>
          </View>
        )}
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
  // Banner section - now in ScrollView
  bannerSection: {
    width: '100%',
    height: hp('35%'),
    position: 'relative',
    overflow: 'hidden',
    marginTop: Platform.OS === 'android' ? -10 : -80,
  },

  bannerScrollView: {
    width: '100%',
    height: '100%',
  },

  bannerImage: {
    width: '100%',
    height: '100%',
  },

  bannerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 120,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },

  bannerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    marginTop: 'auto',
    marginBottom: 20,
  },

  // Scroll container
  scrollContainer: {
    paddingBottom: 80,
  },

  // Fixed back button - top left
  fixedBackButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: 16,
    zIndex: 100,
  },

  backButtonCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Animated search container - starts in middle of banner
  animatedSearchContainer: {
    position: 'absolute',
    top: hp('15%'), // อยู่ตรงกลางของรูปภาพ (banner height = 35%)

    zIndex: 99,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    shadowOpacity: 0.1,
    elevation: 3,
    alignSelf: 'center',
  },

  // Search box container
  searchBoxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,

  },

  searchBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },

  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
  // shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
   
  },

  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 0,
  },

  searchButton: {
    width: 90,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FD501E',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FD501E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    flexDirection: 'row',
        overflow: 'hidden',
  },

  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  // Tabs styles
  tabsContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },

  tabsContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },

  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    marginRight: 8,
  },

  tabSelected: {
    backgroundColor: '#FFF3ED',
  },

  tabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },

  tabTextSelected: {
    color: '#FD501E',
    fontWeight: '600',
  },

  // Category grid styles
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
  },

  // Content card to group tabs/icons into one section
  contentCard: {
    backgroundColor: '#FFFFFF',
    marginTop: -20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 12,
    paddingBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 2,
  },

  categoryItem: {
    width: '33.33%',
    alignItems: 'center',
    marginBottom: 20,
  },

  categoryIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F0F7FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },

  categoryLabel: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
    paddingHorizontal: 4,
  },

  // Additional categories
  additionalCategories: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
  },

  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },

  categoryRowIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  categoryRowText: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },

  // Promotions section
  promotionsSection: {
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },

  promotionsScroll: {
    paddingHorizontal: 16,
    gap: 12,
  },

  promoCard: {
    width: wp('70%'),
    marginRight: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },

  promoImage: {
    width: '100%',
    height: 180,
  },

  promoInfo: {
    padding: 12,
  },

  promoLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },

  promoLocationText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },

  promoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },

  promoRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  ratingBadge: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF1744',
  },

  tripBestBadge: {
    fontSize: 12,
    color: '#666',
  },

  // Info section
  infoSection: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
  },

  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },

  // Bottom tabs
  bottomTabs: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingVertical: 8,
  },

  bottomTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    position: 'relative',
  },

  bottomTabText: {
    fontSize: 11,
    color: '#FD501E',
    marginTop: 4,
    textAlign: 'center',
  },

  bottomTabIndicator: {
    position: 'absolute',
    bottom: 0,
    width: 40,
    height: 3,
    backgroundColor: '#FD501E',
    borderRadius: 2,
  },

  // Final promo card
  finalPromoCard: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },

  finalPromoImage: {
    width: '100%',
    height: 220,
  },

  heartIcon: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  finalPromoInfo: {
    padding: 16,
  },

  promoTagContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },

  promoTag: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },

  finalPromoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },

  finalPromoRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  finalRatingScore: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF1744',
  },

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
