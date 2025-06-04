import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image, Animated, Easing, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import ipAddress from './../ipconfig';

export default function Banner() {
  const { width: screenWidth } = useWindowDimensions();
  const scrollViewRef = useRef(null);
  const [promotion, setPromotion] = useState([]);
  const [dotIndex, setDotIndex] = useState(0);
  const [loadedIndexes, setLoadedIndexes] = useState([]);
  const scrollX = useRef(0);
  const shimmerAnim = useRef(new Animated.Value(-screenWidth)).current;
  const cloneFactor = 3;

  const ITEM_WIDTH = screenWidth;
  const AUTO_SCROLL_INTERVAL = 3000;
  const [isLoadingTitle, setIsLoadingTitle] = useState(true);
  const [loadedCount, setLoadedCount] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoadingTitle(false), 2000); // จำลองโหลด
    return () => clearTimeout(timer);
  }, []);


  useEffect(() => {
    fetch(`${ipAddress}/promotion`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.data)) {
          const cloned = Array(cloneFactor).fill(data.data).flat();
          setPromotion(cloned);

          setTimeout(() => {
            const startX = data.data.length * ITEM_WIDTH;
            scrollViewRef.current?.scrollTo({ x: startX, animated: false });
            scrollX.current = startX;
          }, 100);
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: screenWidth,
        duration: 1600,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      })
    ).start();
  }, []);

  useEffect(() => {
    if (!promotion.length) return;

    const originalLength = promotion.length / cloneFactor;
    const middleStart = originalLength * ITEM_WIDTH;

    const interval = setInterval(() => {
      scrollX.current += ITEM_WIDTH;
      scrollViewRef.current?.scrollTo({ x: scrollX.current, animated: true });

      if (scrollX.current >= (promotion.length - originalLength) * ITEM_WIDTH) {
        setTimeout(() => {
          scrollX.current = middleStart;
          scrollViewRef.current?.scrollTo({ x: middleStart, animated: false });
        }, 500);
      }
    }, AUTO_SCROLL_INTERVAL);

    return () => clearInterval(interval);
  }, [promotion]);

  const handleScroll = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    scrollX.current = offsetX;
  };

  const handleMomentumScrollEnd = () => {
    const originalLength = promotion.length / cloneFactor;
    const currentDot = Math.floor((scrollX.current / ITEM_WIDTH) % originalLength);
    setDotIndex(currentDot);
  };

  return (
    <View style={styles.carouselContainer}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={true}
        scrollEventThrottle={16}
        onScroll={handleScroll}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        style={{ width: screenWidth }}
      >
        {promotion.map((item, index) => (
          <View
            key={index}
            style={{
              width: screenWidth * 0.9,
              height: hp('16%'),
              borderRadius: 20,
              marginHorizontal: wp('5%'),
              overflow: 'hidden',
              position: 'relative',
              backgroundColor: '#eee',
            }}
          >
            {isLoadingTitle && (
              <Animated.View style={[StyleSheet.absoluteFillObject, { zIndex: 1 }]}>
                <Animated.View
                  style={{
                    width: 150,
                    height: '100%',
                    transform: [{ translateX: shimmerAnim }],
                  }}
                >
                  <LinearGradient
                    colors={['#eeeeee00', '#ddddddaa', '#eeeeee00']}
                    start={[0, 0]}
                    end={[1, 0]}
                    style={{ width: '100%', height: '100%' }}
                  />
                </Animated.View>
              </Animated.View>
            )}

            <Image
              source={{ uri: `https://www.thetrago.com/Api/uploads/promotion/index/${item.md_promotion_picname}` }}
              style={{
                width: '100%',
                height: '100%',
                borderRadius: 20,
                position: 'absolute',
                top: 0,
                left: 0,
                opacity: isLoadingTitle ? 0 : 1,
              }}
              resizeMode="cover"
              onLoadEnd={() => {
                const totalRealItems = promotion.length / cloneFactor;

                setLoadedCount(prev => {
                  const next = prev + 1;
                  if (next >= totalRealItems && isLoadingTitle) {
                    setIsLoadingTitle(false);
                  }
                  return next;
                });
              }}


            />
          </View>
        ))}

      </ScrollView>

      <View style={styles.indicatorContainer}>
        {promotion.length === 0 || isLoadingTitle ? (
          // 🔸 Skeleton Loading สำหรับ Dot Indicator
          Array(3).fill(null).map((_, i) => (
            <View
              key={`skeleton-dot-${i}`}
              style={{
                width: 7,
                height: 7,
                borderRadius: 4,
                backgroundColor: '#ddd',
                marginHorizontal: 4,
              }}
            />
          ))
        ) : (
          // 🔸 Indicator จริงเมื่อโหลดเสร็จ
          [...Array(promotion.length / cloneFactor)].map((_, i) => (
            <View
              key={`dot-${i}`}
              style={[
                styles.indicator,
                i === dotIndex && styles.activeIndicator,
                isLoadingTitle && { opacity: 0 },
              ]}
            />

          ))
        )}
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  carouselContainer: {
    marginTop: 0,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  bannerImage: {
    height: hp('16%'),
    borderRadius: 20,
    resizeMode: 'cover',
    alignSelf: 'center',
    marginHorizontal: wp('5%'),
  },
  shimmerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: hp('16%'),
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#eee',
  },
  gradient: {
    width: 150,
    height: '100%',
  },
  indicatorContainer: {
    flexDirection: 'row',
    marginTop: 10,
    alignSelf: 'center',
  },
  indicator: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#ccc',
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: '#FD501E',
    width: 8,
    height: 8,
  },
});