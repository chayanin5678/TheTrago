import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StatusBar, TouchableOpacity, Image, ScrollView, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguage } from './LanguageContext';
import { styles } from '../../styles/CSS/CarRentalScreenStyles';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';

const CarRentalScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const searchAnim = useRef(new Animated.Value(0)).current; // 0 -> 1
  const restAnim = useRef(new Animated.Value(0)).current; // 0 -> 1
  const scrollY = useRef(new Animated.Value(0)).current; // scroll-driven header animation
  const { t } = useLanguage();
  const [bannerIndex, setBannerIndex] = useState(0);
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;
  const contentPadding = 16; // keep in sync with styles.scroll paddingHorizontal
  // no fullBannerWidth needed; slides will use screenWidth and we offset banner container with negative margin
  const remoteBanner = 'https://thetrago.com/assets/images/bg/taxi-top.png';
  // Only use remote banner URL for the hero image; do not include local fallbacks.
  const bannerUrls = [remoteBanner];
  const wrapperPadding = 8;
  // Make banner flush with the top of the screen but nudge it down slightly
  // to look like it has some room under the status bar.
  const bannerOffsetTop = -Math.max(insets.top, 0) + 45; // lower the banner by 20px
  const leftOffset = contentPadding + (insets.left || 0);
  const rightOffset = contentPadding + (insets.right || 0);
  const [containerWidth, setContainerWidth] = useState(screenWidth);
  const bleedExtra = Math.max(4, Math.round(screenWidth * 0.01)); // small extra bleed to avoid hairline gaps across different screen sizes
  const [bannerImgW, setBannerImgW] = useState(null);
  const [bannerImgH, setBannerImgH] = useState(null);
  // Calculate banner height based on image aspect ratio, with a max cap to avoid it being too tall
  const computedImgHeight = (bannerImgW && bannerImgH) ? Math.round((containerWidth * bannerImgH) / bannerImgW) : 200;
  const maxBannerHeight = Math.round(screenHeight * 0.5); // cap banner height to 50% of screen height (slightly taller)
  const bannerHeight = Math.min(Math.max(170, computedImgHeight + wrapperPadding * 2), maxBannerHeight);
  const scrollRef = useRef(null);
  const headerHeight = (insets.top || 0) + 64;
  const [searchCardLayout, setSearchCardLayout] = useState({ y: 0, height: 0 });
  const [titleLayout, setTitleLayout] = useState({ y: 0, height: 0 });

  useEffect(() => {
    // Staggered entrance animation for the search card and the rest
    Animated.stagger(80, [
      Animated.timing(searchAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(restAnim, { toValue: 1, duration: 450, useNativeDriver: true }),
    ]).start();
  }, [searchAnim, restAnim]);

  useEffect(() => {
    let mounted = true;
    if (bannerUrls && bannerUrls.length > 0) {
      const item = bannerUrls[0];
      if (typeof item === 'string' && item.startsWith('http')) {
        Image.getSize(item, (w, h) => { if (mounted) { setBannerImgW(w); setBannerImgH(h); } }, () => {});
      } else {
        const resolved = Image.resolveAssetSource(item);
        if (resolved && mounted) { setBannerImgW(resolved.width); setBannerImgH(resolved.height); }
      }
    }
    return () => { mounted = false; };
  }, [bannerUrls]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      {/* Header overlay: animated background and title on scroll */}
      <Animated.View style={[styles.headerContainer, {
        minHeight: headerHeight,
        paddingTop: (insets.top || 0) + 12,
        backgroundColor: scrollY.interpolate({ inputRange: [0, 120], outputRange: ['transparent', '#ffffff'], extrapolate: 'clamp' }),
        borderBottomWidth: 1,
        borderBottomColor: scrollY.interpolate({ inputRange: [0, 120], outputRange: ['transparent', 'rgba(0,0,0,0.06)'], extrapolate: 'clamp' }),
      }]}
      >
        {/* Back button inside header left */}
        <View style={{ width: 48, alignItems: 'flex-start' }}>
          {/* Use TouchableOpacity to allow nav back */}
          <TouchableOpacity onPress={() => { if (navigation && navigation.canGoBack && navigation.canGoBack()) navigation.goBack(); else navigation.navigate('Home'); }} style={[styles.backButton, { width: 40, height: 40, backgroundColor: '#fff' }]}>
            <MaterialIcons name="arrow-back" size={20} color="#264a63" />
          </TouchableOpacity>
        </View>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Animated.Text style={[styles.topHeaderTitle, { color: scrollY.interpolate({ inputRange: [0, 120], outputRange: ['transparent', '#0f172a'], extrapolate: 'clamp' }) }]} numberOfLines={1}>
            {t('carRentalSearchTitle') || 'ค้นหารถเช่า'}
          </Animated.Text>
        </View>
        <View style={{ width: 48 }} />
      </Animated.View>

      {/* Back button moved to header overlay for persistent visibility */}
      {/* Header removed as per requirement */}

      {/* Content */}
      <Animated.ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 20), paddingTop: 0 }}
        scrollEventThrottle={16}
        onScroll={Animated.event([
          { nativeEvent: { contentOffset: { y: scrollY } } }
        ], { useNativeDriver: false })}
      >
        {/* Background banner - Tours-like (moved inside vertical ScrollView so it scrolls with content) */}
        <View onLayout={(e) => { setContainerWidth(e.nativeEvent.layout.width); if (__DEV__) { console.log('banner layout', { containerWidth: e.nativeEvent.layout.width, screenWidth, leftOffset, rightOffset, bannerHeight }); } }} style={[styles.bannerSection, { position: 'relative', marginTop: bannerOffsetTop, left: -leftOffset - bleedExtra, width: screenWidth + leftOffset + rightOffset + bleedExtra * 2, height: bannerHeight }]}> 
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
            {bannerUrls.map((item, index) => (
              <View key={index} style={{ width: screenWidth, height: bannerHeight, position: 'relative' }}>
                <Image
                  source={typeof item === 'string' ? { uri: item } : item}
                  style={[styles.bannerImage, { position: 'absolute', left: -leftOffset - bleedExtra, width: screenWidth + leftOffset + rightOffset + bleedExtra * 2, height: bannerHeight }]}
                  onLoad={() => { if (__DEV__) console.log('banner image loaded, offsets', { screenWidth, leftOffset, rightOffset, width: screenWidth + leftOffset + rightOffset + bleedExtra }); }}
                  resizeMode="cover"
                />
              </View>
            ))}
          </ScrollView>
          <LinearGradient
            colors={[ 'transparent', 'transparent', '#FFFFFF' ]}
            style={styles.bannerGradient}
          />
        </View>
        <Animated.View
          onLayout={(e) => setSearchCardLayout({ y: e.nativeEvent.layout.y, height: e.nativeEvent.layout.height })}
          style={[styles.searchCard, {
          opacity: searchAnim,
          transform: [
            { translateY: searchAnim.interpolate({ inputRange: [0, 1], outputRange: [-10, 0] }) }
          ],
          zIndex: 50,
        }]}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            {/* remove button from search card - replaced by header button */}
            <Text
              style={[styles.formTitle, { flex: 1, textAlign: 'center' }]}
              onLayout={(e) => setTitleLayout({ y: e.nativeEvent.layout.y, height: e.nativeEvent.layout.height })}
            >
              {t('carRentalSearchTitle') || 'ค้นหารถเช่า'}
            </Text>
            <View style={{ width: 40 }} />
          </View>

          <View style={styles.formRow}>
            <MaterialCommunityIcons name="map-marker" size={22} color="#264a63" style={styles.icon} />
            <Text style={styles.formText}>{t('ท่าอากาศยานนานาชาติเชียงใหม่, เชียงใหม่') || 'ท่าอากาศยานนานาชาติเชียงใหม่ เชียงใหม่'}</Text>
          </View>

          <View style={styles.formRow}>
            <MaterialCommunityIcons name="calendar" size={22} color="#264a63" style={styles.icon} />
            <Text style={styles.formText}>21 พ.ย. 10:00 น. - 24 พ.ย. 10:00 น. 3 วัน</Text>
          </View>

          <View style={styles.formRow}>
            <MaterialCommunityIcons name="account" size={22} color="#264a63" style={styles.icon} />
            <Text style={styles.formText}>อายุผู้ขับรถ 30~60</Text>
          </View>

          <TouchableOpacity style={styles.searchButton} onPress={() => { /* Search action */ }}>
            <Text style={styles.searchButtonText}>{t('ค้นหา') || 'ค้นหา'}</Text>
          </TouchableOpacity>

          <View style={styles.smallNoteRow}>
            <MaterialCommunityIcons name="shield-check" size={22} color="#06b6d4" style={styles.smallNoteIcon} />
            <Text style={styles.smallNoteText}>{t('travelBookingGuarantee') || 'รับประกันการจองการเดินทาง'}</Text>
          </View>
        </Animated.View>

        <Animated.View style={[styles.promoCard, {
          opacity: restAnim,
          transform: [{ translateY: restAnim.interpolate({ inputRange: [0, 1], outputRange: [-8, 0] }) }]
        }]}>
          <Text style={styles.promoTitle}>{t('promoCode') || 'รหัสโปรโมชั่น'}</Text>
          <View style={styles.promoBanner}>
            <Text style={styles.promoLabel}>{t('promoMaxDiscount') || 'รับส่วนลดสูงสุด 8%'}</Text>
            <TouchableOpacity style={styles.promoBtn}><Text style={styles.promoBtnText}>{t('claim') || 'รับ'}</Text></TouchableOpacity>
          </View>
        </Animated.View>

        <Animated.View style={[styles.brandsCard, {
          opacity: restAnim,
          transform: [{ translateY: restAnim.interpolate({ inputRange: [0, 1], outputRange: [-8, 0] }) }]
        }]}>
          <Text style={styles.sectionTitle}>{t('popularBrands') || 'บริการจากแบรนด์ดัง'}</Text>
          <View style={styles.brandGrid}>
            {new Array(8).fill(0).map((_, i) => (
              <View key={i} style={styles.brandCell}>
                  <Image source={require('../../../assets/logoicon.png')} style={styles.brandIcon} />
              </View>
            ))}
          </View>

          <Text style={styles.brandDesc}>{t('brandsCoverageDesc') || 'เดินทางได้ทั่วโลกกว่า 190 ประเทศ ด้วยซัพพลายเออร์ที่เชื่อถือได้กว่า 1,000 ราย'}</Text>
        </Animated.View>

        <Animated.View style={[styles.sectionCard, {
          opacity: restAnim,
          transform: [{ translateY: restAnim.interpolate({ inputRange: [0, 1], outputRange: [-8, 0] }) }]
        }]}>
          <Text style={styles.sectionTitle}>{t('ทำไมถึงควรจองกับ Trip.com?') || 'ทำไมถึงควรจองกับ Trip.com?'}</Text>

          <View style={styles.reasonRow}>
            <MaterialIcons name="local-offer" size={26} color="#f59e0b" style={styles.reasonIcon} />
            <View style={styles.reasonTextWrap}><Text style={styles.reasonTitle}>{t('discountAfterFlightHotelBooking') || 'ส่วนลดผู้จองตั๋วเครื่องบิน/โรงแรม'}</Text>
              <Text style={styles.reasonDesc}>{t('ปลดล็อกราคาพิเศษสำหรับเช่ารถ หลังจากจองเที่ยวบินหรือโรงแรม') || 'ปลดล็อกราคาพิเศษสำหรับเช่ารถ หลังจากจองเที่ยวบินหรือโรงแรม'}</Text>
            </View>
          </View>

          <View style={styles.reasonRow}>
            <MaterialIcons name="schedule" size={26} color="#06b6d4" style={styles.reasonIcon} />
            <View style={styles.reasonTextWrap}><Text style={styles.reasonTitle}>{t('flexibleRentalPolicy') || 'บริการเช่าแบบยืดหยุ่น'}</Text>
              <Text style={styles.reasonDesc}>{t('นโยบายการยกเลิกยืดหยุ่น วางแผนการเดินทางได้ง่ายดาย') || 'นโยบายการยกเลิกยืดหยุ่น วางแผนการเดินทางได้ง่ายดาย'}</Text>
            </View>
          </View>

          <View style={styles.reasonRow}>
            <MaterialCommunityIcons name="shield-check" size={26} color="#06b6d4" style={styles.reasonIcon} />
            <View style={styles.reasonTextWrap}><Text style={styles.reasonTitle}>{t('travelBookingGuarantee') || 'รับประกันการจองการเดินทาง'}</Text>
              <Text style={styles.reasonDesc}>{t('หากเที่ยวบิน รถไฟ หรือรถบัสของคุณล่าช้าหรือถูกยกเลิก') || 'หากเที่ยวบิน รถไฟ หรือรถบัสของคุณล่าช้าหรือถูกยกเลิก'}</Text>
            </View>
          </View>

          <View style={styles.reasonRow}>
            <MaterialCommunityIcons name="lightning-bolt" size={26} color="#06b6d4" style={styles.reasonIcon} />
            <View style={styles.reasonTextWrap}><Text style={styles.reasonTitle}>{t('fastCustomerService') || 'ฝ่ายบริการลูกค้ารวดเร็วทันใจ'}</Text>
              <Text style={styles.reasonDesc}>{t('ติดต่อฝ่ายบริการลูกค้ารวดเร็วทันใจภายใน 30 วินาที') || 'ติดต่อฝ่ายบริการลูกค้ารวดเร็วทันใจภายใน 30 วินาที'}</Text>
            </View>
          </View>
        </Animated.View>

      </Animated.ScrollView>
    </View>
  );
};

export default CarRentalScreen;
