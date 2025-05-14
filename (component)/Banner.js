import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image, Dimensions, useWindowDimensions } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import ipAddress from './../ipconfig';

const banners = [
  { uri: 'https://www.thetrago.com/Api/uploads/promotion/index/1737967469015-807603818.webp' },
  { uri: 'https://www.thetrago.com/Api/uploads/promotion/index/1737967457330-985688254.webp' },
  { uri: 'https://www.thetrago.com/Api/uploads/promotion/index/1737967440410-123061413.webp' }
];

export default function Banner() {
  const { width: screenWidth } = useWindowDimensions(); // ✅ ใช้ useWindowDimensions() แทน Dimensions.get()
  const [currentBanner, setCurrentBanner] = useState(0);
  const scrollViewRef = useRef(null);
  const [promotion, setPromotion] = useState(null);


  useEffect(() => {
    fetch(`${ipAddress}/promotion`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        if (data && Array.isArray(data.data)) {
          setPromotion(data.data);
          //   setActiveCountry(data.data[0].sys_countries_id);
        } else {
          console.error('Data is not an array', data);
          setPromotion([]);
        }
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      }).finally(() => {
        setLoading(false);  // ตั้งค่า loading เป็น false หลังจากทำงานเสร็จ
      });
  }, []);


  useEffect(() => {
    const interval = setInterval(() => {
      let nextIndex = (currentBanner + 1) % promotion.length;
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
        {promotion.map((item, index) => (
          <Image
            key={index}
            source={{ uri: `https://www.thetrago.com/Api/uploads/promotion/index/${item.md_promotion_picname}` }}
            style={[styles.bannerImage, { width: screenWidth * 0.9 }]}
          />

        ))}
      </ScrollView>

      {/* Indicator */}
      <View style={styles.indicatorContainer}>
        {promotion.map((_, index) => (
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
    backgroundColor: '#49A7FF',
    width: 8,
    height: 8,
  },
});
