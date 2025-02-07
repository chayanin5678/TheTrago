import React, { useRef, useState, useEffect  } from 'react';
import { View, StyleSheet, ScrollView, Image, Dimensions } from 'react-native';
const { width } = Dimensions.get('window');

const banners = [
  require('.././assets/banner1.png'), // Path ของภาพแบนเนอร์แรก
  require('.././assets/banner2.png'), // Path ของภาพแบนเนอร์ที่สอง
  require('.././assets/banner3.png'), // Path ของภาพแบนเนอร์ที่สาม
];
export default function Banner() {
      const [currentBanner, setCurrentBanner] = useState(0);
      const scrollViewRef = useRef(null);

        useEffect(() => {
          const interval = setInterval(() => {
            let nextIndex = (currentBanner + 1) % banners.length;
            setCurrentBanner(nextIndex);
            scrollViewRef.current?.scrollTo({ x: nextIndex * width, animated: true });
          }, 5000);
      
          return () => clearInterval(interval);
        }, [currentBanner]);
  return (
   <View style={styles.carouselContainer}>
         <ScrollView
           ref={scrollViewRef}
           horizontal
           pagingEnabled
           showsHorizontalScrollIndicator={false}
           onMomentumScrollEnd={(event) => {
             const index = Math.round(event.nativeEvent.contentOffset.x / width);
             setCurrentBanner(index);
           }}
         >
           {banners.map((banner, index) => (
             <Image key={index} source={banner} style={styles.bannerImage} />
           ))}
         </ScrollView>
         
         {/* Indicator */}
         <View style={styles.indicatorContainer}>
           {banners.map((_, index) => (
             <View key={index} style={[styles.indicator, currentBanner === index && styles.activeIndicator]} />
           ))}
         </View>
           {/* Indicator Dots */}
      <View style={styles.indicatorContainer}>
        {banners.map((_, index) => (
          <View key={index} style={[styles.indicator, currentBanner === index && styles.activeIndicator]} />
        ))}
      </View>
    
   </View>

  )
}

const styles = StyleSheet.create({
    carouselContainer: {
        marginTop: -20,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
      },
        bannerImage: {
          width: Dimensions.get('window').width * 0.9,
          height: 200,
          borderRadius: 10,
          marginRight:41,
          resizeMode: 'contain',
        },
        indicatorContainer: {
            flexDirection: 'row',
            position: 'absolute',
            bottom: 10,
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
            backgroundColor: '#ff8c00',
            width: 8,
            height: 8,
          },
})