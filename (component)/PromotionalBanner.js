import React, { useRef, useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, Dimensions, Animated, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useLanguage } from '../(Screen)/LanguageContext';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import ipAddress from '../ipconfig';

const { width: screenWidth } = Dimensions.get('window');

const PromotionalBanner = ({ onPress, style, promotionContext }) => {
  const { selectedLanguage, t } = useLanguage();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const shimmerAnim = useRef(new Animated.Value(-200)).current;
  const [promotion, setPromotion] = useState([]);
  const [currentPromotionIndex, setCurrentPromotionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (promotionContext && promotionContext.length > 0) {
      setPromotion(promotionContext);
      setIsLoading(false);
      console.log('Promotion data from context:', promotionContext);
    } else {
      fetch(`${ipAddress}/promotion`)
        .then((res) => res.json())
        .then((data) => {
          console.log('Promotion API response:', data);
          if (Array.isArray(data.data)) {
            setPromotion(data.data);
            console.log('Promotion data set:', data.data);
          }
          setIsLoading(false);
        })
        .catch((error) => {
          console.error('Promotion fetch error:', error);
          setIsLoading(false);
        });
    }
  }, [promotionContext]);

  useEffect(() => {
    // Shimmer animation
    const shimmerAnimation = Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: screenWidth + 200,
        duration: 2000,
        useNativeDriver: true,
      })
    );
    shimmerAnimation.start();

    return () => shimmerAnimation.stop();
  }, []);

  // Get current promotion data
  const currentPromotion = promotion.length > 0 ? promotion[currentPromotionIndex] : null;

  // Auto-rotate promotions if there are multiple
  useEffect(() => {
    if (promotion.length > 1) {
      const interval = setInterval(() => {
        setCurrentPromotionIndex((prevIndex) => 
          (prevIndex + 1) % promotion.length
        );
      }, 5000); // Change promotion every 5 seconds

      return () => clearInterval(interval);
    }
  }, [promotion.length]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={[styles.container, style, { transform: [{ scale: scaleAnim }] }]}>
      <LinearGradient
        colors={['#1E40AF', '#3B82F6', '#60A5FA']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientContainer}
      >
        {/* Background decorative elements */}
        <View style={styles.decorativeElements}>
          <MaterialIcons name="anchor" size={40} color="rgba(255,255,255,0.1)" style={styles.anchorIcon} />
          <MaterialIcons name="waves" size={35} color="rgba(255,255,255,0.15)" style={styles.wavesIcon} />
          <View style={styles.circleDecor1} />
          <View style={styles.circleDecor2} />
        </View>

        {/* Shimmer effect */}
        <Animated.View
          style={[
            styles.shimmer,
            {
              transform: [{ translateX: shimmerAnim }],
            },
          ]}
        />

        {/* Main content */}
        <TouchableOpacity 
          activeOpacity={0.9}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={() => onPress && onPress(currentPromotion)}
          style={styles.contentTouchable}
        >
          <View style={styles.contentContainer}>
            {/* Left side - Text content */}
            <View style={styles.textContainer}>
              {/* Badge */}
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {isLoading ? (selectedLanguage === 'th' ? 'กำลังโหลด...' : 'Loading...') : 
                   (currentPromotion?.badge || (selectedLanguage === 'th' ? '✈ เที่ยวสุดพิเศษ' : '✈ Special Trip'))}
                </Text>
              </View>

              {/* Main title */}
              <Text style={styles.mainTitle}>
                {isLoading ? (selectedLanguage === 'th' ? 'กำลังโหลดโปรโมชั่น...' : 'Loading Promotions...') :
                 (currentPromotion?.title || (selectedLanguage === 'th' ? 'จองตั๋วเรือหรู\nและโรงแรมพิเศษ' : 'Book Luxury Ferry\n& Special Hotels'))}
              </Text>

              {/* Discount info */}
              <View style={styles.discountContainer}>
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>
                    {currentPromotion?.discount || '฿2,500'}
                  </Text>
                </View>
                <Text style={styles.discountDescription}>
                  {currentPromotion?.discountDescription || (selectedLanguage === 'th' ? 'ลดทันที' : 'Instant Discount')}
                </Text>
              </View>

              {/* Sub title */}
              <Text style={styles.subTitle}>
                {currentPromotion?.subtitle || (selectedLanguage === 'th' ? 'สำหรับการเดินทางครั้งแรก' : 'For your first journey')}
              </Text>
            </View>

            {/* Right side - Visual elements */}
            <View style={styles.visualContainer}>
              {/* Destination image placeholder */}
              <View style={styles.destinationImageContainer}>
                <Image
                  source={currentPromotion?.image ? { uri: currentPromotion.image } : require('../assets/destination1.png')}
                  style={styles.destinationImage}
                  resizeMode="cover"
                />
                {/* Overlay with gradient */}
                <LinearGradient
                  colors={['transparent', 'rgba(30,64,175,0.3)']}
                  style={styles.imageOverlay}
                />
              </View>

              {/* Action button */}
              <View style={styles.actionButton}>
                <LinearGradient
                  colors={['#FD501E', '#FF6B35']}
                  style={styles.buttonGradient}
                >
                  <Text style={styles.buttonText}>
                    {currentPromotion?.buttonText || (selectedLanguage === 'th' ? 'จองเลย' : 'Book Now')}
                  </Text>
                  <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
                </LinearGradient>
              </View>
            </View>
          </View>
        </TouchableOpacity>

          {/* Bottom info bar */}
          <View style={styles.bottomBar}>
            <View style={styles.infoItem}>
              <Ionicons name="location-outline" size={14} color="rgba(255,255,255,0.8)" />
              <Text style={styles.infoText}>
                {currentPromotion?.route || (selectedLanguage === 'th' ? 'กรุงเทพฯ - หาดใหญ่' : 'Bangkok - Hat Yai')}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="calendar-outline" size={14} color="rgba(255,255,255,0.8)" />
              <Text style={styles.infoText}>
                {currentPromotion?.date || (selectedLanguage === 'th' ? 'ส. 2 ส.ค.' : 'Sat 2 Aug')}
              </Text>
            </View>
            <View style={styles.validityBadge}>
              <Text style={styles.validityText}>
                {currentPromotion?.validity || (selectedLanguage === 'th' ? 'หมดอายุ 31 ส.ค.' : 'Valid until 31 Aug')}
              </Text>
            </View>
          </View>

          {/* Promotion indicator dots - show if multiple promotions */}
          {promotion.length > 1 && (
            <View style={styles.promotionIndicator}>
              {promotion.map((_, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.indicatorDot,
                    index === currentPromotionIndex && styles.activeDot
                  ]}
                  onPress={() => setCurrentPromotionIndex(index)}
                />
              ))}
            </View>
          )}
        </LinearGradient>
      </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    ...Platform.select({
      ios: {
        overflow: 'hidden',
      },
      android: {
        // Android handles overflow differently
      },
    }),
  },
  touchable: {
    width: '100%',
    height: '100%',
    borderRadius: 0,
    overflow: 'hidden',
  },
  gradientContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 0,
    overflow: 'hidden',
    position: 'relative',
    ...Platform.select({
      ios: {
        // iOS specific optimizations
        shouldRasterizeIOS: true,
        rasterizationScale: 2,
      },
      android: {
        // Android optimizations
      },
    }),
  },
  decorativeElements: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 1,
  },
  anchorIcon: {
    position: 'absolute',
    top: '15%',
    right: '10%',
    transform: [{ rotate: '15deg' }],
  },
  wavesIcon: {
    position: 'absolute',
    bottom: '20%',
    left: '8%',
    transform: [{ rotate: '-10deg' }],
  },
  circleDecor1: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.08)',
    top: -20,
    right: -20,
  },
  circleDecor2: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.06)',
    bottom: -10,
    left: -10,
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.1)',
    width: 200,
    transform: [{ skewX: '-20deg' }],
    zIndex: 2,
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'row',
    padding: wp('6%'),
    paddingTop: wp('8%'),
    zIndex: 3,
  },
  textContainer: {
    flex: 1.2,
    justifyContent: 'space-between',
    paddingRight: wp('4%'),
  },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('0.6%'),
    borderRadius: wp('4%'),
    alignSelf: 'flex-start',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  badgeText: {
    fontSize: wp('3.2%'),
    fontWeight: '600',
    color: '#1E40AF',
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
      },
    }),
  },
  mainTitle: {
    fontSize: wp('5.5%'),
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: wp('7%'),
    marginVertical: hp('1%'),
    ...Platform.select({
      ios: {
        fontFamily: 'System',
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowRadius: 2,
        textShadowOffset: { width: 1, height: 1 },
      },
      android: {
        fontFamily: 'Roboto',
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowRadius: 3,
        textShadowOffset: { width: 1, height: 1 },
        elevation: 2,
      },
    }),
  },
  discountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: hp('1%'),
  },
  discountBadge: {
    backgroundColor: '#FD501E',
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('0.6%'),
    borderRadius: wp('3%'),
    marginRight: wp('3%'),
    ...Platform.select({
      ios: {
        shadowColor: '#FD501E',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  discountText: {
    fontSize: wp('4.5%'),
    fontWeight: '800',
    color: '#FFFFFF',
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
      },
    }),
  },
  discountDescription: {
    fontSize: wp('3.5%'),
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
      },
    }),
  },
  subTitle: {
    fontSize: wp('3.2%'),
    fontWeight: '500',
    color: 'rgba(255,255,255,0.8)',
    lineHeight: wp('4%'),
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
      },
    }),
  },
  visualContainer: {
    flex: 0.8,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: wp('2%'),
  },
  destinationImageContainer: {
    width: wp('28%'),
    height: wp('28%'),
    borderRadius: wp('4%'),
    overflow: 'hidden',
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  destinationImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  actionButton: {
    borderRadius: wp('5%'),
    overflow: 'hidden',
    marginTop: hp('1%'),
    ...Platform.select({
      ios: {
        shadowColor: '#FD501E',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp('5%'),
    paddingVertical: hp('1.2%'),
  },
  buttonText: {
    fontSize: wp('3.5%'),
    fontWeight: '700',
    color: '#FFFFFF',
    marginRight: wp('1.5%'),
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
      },
    }),
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: wp('6%'),
    paddingVertical: hp('1.2%'),
    zIndex: 3,
    ...Platform.select({
      ios: {
        backdropFilter: 'blur(10px)',
      },
      android: {
        // Android doesn't support backdrop-filter
      },
    }),
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: wp('2.8%'),
    fontWeight: '500',
    color: 'rgba(255,255,255,0.8)',
    marginLeft: wp('1.5%'),
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
      },
    }),
  },
  validityBadge: {
    backgroundColor: 'rgba(253,80,30,0.9)',
    paddingHorizontal: wp('3%'),
    paddingVertical: hp('0.5%'),
    borderRadius: wp('3%'),
    ...Platform.select({
      ios: {
        shadowColor: '#FD501E',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  validityText: {
    fontSize: wp('2.5%'),
    fontWeight: '600',
    color: '#FFFFFF',
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
      },
    }),
  },
  promotionIndicator: {
    position: 'absolute',
    bottom: hp('8%'),
    right: wp('6%'),
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 4,
  },
  indicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.4)',
    marginHorizontal: 3,
  },
  activeDot: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    width: 12,
    height: 8,
    borderRadius: 4,
  },
  contentTouchable: {
    flex: 1,
  },
});

export default PromotionalBanner;
