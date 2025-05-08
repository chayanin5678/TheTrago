import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image, Dimensions, useWindowDimensions } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const banners = [
  { uri: 'https://www.thetrago.com/Api/uploads/promotion/index/1737967469015-807603818.webp' },
  { uri: 'https://www.thetrago.com/Api/uploads/promotion/index/1737967457330-985688254.webp' },
  { uri: 'https://www.thetrago.com/Api/uploads/promotion/index/1737967440410-123061413.webp' }
];

export default function Banner() {
  const { width: screenWidth } = useWindowDimensions(); // ✅ ใช้ useWindowDimensions() แทน Dimensions.get()
  const [currentBanner, setCurrentBanner] = useState(0);
  const scrollViewRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      let nextIndex = (currentBanner + 1) % banners.length;
      setCurrentBanner(nextIndex);
      scrollViewRef.current?.scrollTo({ x: nextIndex * screenWidth, animated: true });
    }, 5000);

    return () => clearInterval(interval);
  }, [currentBanner, screenWidth]);

  return (
    <View style={styles.carouselContainer}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
          setCurrentBanner(index);
        }}
        style={{ width: screenWidth }}
      >
        {banners.map((banner, index) => (
          <Image key={index} source={banner} style={[styles.bannerImage, { width: screenWidth * 0.9 }]} />
        ))}
      </ScrollView>

      {/* Indicator */}
      <View style={styles.indicatorContainer}>
        {banners.map((_, index) => (
          <View key={index} style={[styles.indicator, currentBanner === index && styles.activeIndicator]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  carouselContainer: {
    marginTop: -5,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  bannerImage: {
    height: hp('16%'), // ปรับให้สูงขึ้นเล็กน้อย
    borderRadius: 20,
    resizeMode: 'cover',
    alignSelf: 'center',
    marginHorizontal: wp('5%'), // ให้มีขอบซ้ายขวาเล็กน้อย
  },
  indicatorContainer: {
    flexDirection: 'row',
    position: 'relative',
    marginTop: 10,
    alignSelf: 'center',
  },
  indicator: {
    width: 7,
    height: 7,
    borderRadius: 5,
    backgroundColor: '#ccc',
    marginHorizontal: 5,
  },
  activeIndicator: {
    backgroundColor: '#FD501E',
    width: 8,
    height: 8,
  },
});
