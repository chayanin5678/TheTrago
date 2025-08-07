import React, { useRef, useState, useEffect, useContext } from 'react';
import { View, StyleSheet, ScrollView, Image, useWindowDimensions } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import ipAddress from '../../config/ipconfig';
import { PromotionContext } from '../../contexts/PromotionProvider';

export default function BackgroundBanner() {
  const { width: screenWidth } = useWindowDimensions();
  const scrollViewRef = useRef(null);
  const [promotion, setPromotion] = useState([]);
  const [dotIndex, setDotIndex] = useState(0);
  const scrollX = useRef(0);
  const cloneFactor = 3;
  const ITEM_WIDTH = screenWidth;
  const AUTO_SCROLL_INTERVAL = 4000;
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
    <View style={styles.backgroundContainer}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={true}
        scrollEventThrottle={16}
        onScroll={handleScroll}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        style={styles.scrollView}
        contentContainerStyle={{ alignItems: 'center' }}
      >
        {promotion.map((item, index) => (
          <View
            key={index}
            style={styles.bannerItem}
          >
            <Image
              source={{ uri: `https://www.thetrago.com/Api/uploads/promotion/index/${item.md_promotion_picname}` }}
              style={styles.bannerImage}
              resizeMode="cover"
            />
            {/* Gradient overlay for better text readability */}
            <View style={styles.gradientOverlay} />
          </View>
        ))}
      </ScrollView>
      
      {/* Indicators */}
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
  backgroundContainer: {
    flex: 1,
    width: '100%',
  },
  scrollView: {
    width: '100%',
    height: '100%',
  },
  bannerItem: {
    width: wp('95%'),
    height: '100%',
    marginHorizontal: wp('2.5%'),
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.1)', // เบาๆ เพื่อให้เห็นรูปชัด
  },
  indicatorContainer: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.6)',
    marginHorizontal: 3,
  },
  activeIndicator: {
    backgroundColor: '#FFFFFF',
    width: 10,
    height: 10,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
});
