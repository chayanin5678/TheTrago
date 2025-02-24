import React, { useRef, useState, useEffect  } from 'react';
import { View, StyleSheet, ScrollView, Image, Dimensions } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
const { width } = Dimensions.get('window');

const banners = [
  { uri: 'https://www.thetrago.com/Api/uploads/promotion/index/1737967469015-807603818.webp' },
  { uri: 'https://www.thetrago.com/Api/uploads/promotion/index/1737967457330-985688254.webp' },
  { uri: 'https://www.thetrago.com/Api/uploads/promotion/index/1737967440410-123061413.webp' }
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
   
    
   </View>

  )
}

const styles = StyleSheet.create({
    carouselContainer: {
        marginTop: -5,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
      },
        bannerImage: {
          width: Dimensions.get('window').width * 0.8,
          height: hp('15%'),
          borderRadius: 40,
          justifyContent: 'center',
          marginLeft: Dimensions.get('window').width * 0.085,
          marginRight: Dimensions.get('window').width * 0.1,
          resizeMode: 'cover',
        },
        indicatorContainer: {
            flexDirection: 'row',
            position: 'relative',
            margin:10,
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
})