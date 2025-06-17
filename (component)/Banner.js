import React, { useRef, useState, useEffect, useContext } from 'react';
import { View, StyleSheet, ScrollView, Image, useWindowDimensions } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import ipAddress from './../ipconfig';
import { PromotionContext } from '../PromotionProvider';

export default function Banner() {
  const { width: screenWidth } = useWindowDimensions();
  const scrollViewRef = useRef(null);
  const [promotion, setPromotion] = useState([]);
  const [dotIndex, setDotIndex] = useState(0);
  const scrollX = useRef(0);
  const cloneFactor = 3;
  const ITEM_WIDTH = screenWidth;
  const AUTO_SCROLL_INTERVAL = 3000;
  const promotionContext = useContext(PromotionContext);

  useEffect(() => {
    if (promotionContext && promotionContext.length > 0) {
      const cloned = Array(cloneFactor).fill(promotionContext).flat();
      setPromotion(cloned);
      setTimeout(() => {
        const startX = promotionContext.length * ITEM_WIDTH;
        scrollViewRef.current?.scrollTo({ x: startX, animated: false });
        scrollX.current = startX;
      }, 100);
    } else {
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
    }
  }, [promotionContext]);

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
            }}
          >
            <Image
              source={{ uri: `https://www.thetrago.com/Api/uploads/promotion/index/${item.md_promotion_picname}` }}
              style={{
                width: '100%',
                height: '100%',
                borderRadius: 20,
                position: 'absolute',
                top: 0,
                left: 0,
              }}
              resizeMode="cover"
            />
          </View>
        ))}
      </ScrollView>
      <View style={styles.indicatorContainer}>
        {[...Array(promotion.length / cloneFactor || 0)].map((_, i) => (
          <View
            key={`dot-${i}`}
            style={[
              styles.indicator,
              i === dotIndex && styles.activeIndicator,
            ]}
          />
        ))}
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