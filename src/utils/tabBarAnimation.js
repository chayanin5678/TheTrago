import { Animated, Platform } from 'react-native';

const TAB_BAR_HEIGHT = Platform.OS === 'ios' ? 80 : 65;

/**
 * Hook for hiding/showing tab bar on scroll (Facebook style)
 * Usage in any screen with ScrollView:
 * 
 * import { useTabBarAnimation } from '../utils/tabBarAnimation';
 * 
 * const { handleScroll, scrollEventThrottle } = useTabBarAnimation();
 * 
 * <ScrollView 
 *   onScroll={handleScroll}
 *   scrollEventThrottle={scrollEventThrottle}
 * >
 *   ... your content
 * </ScrollView>
 */
export const useTabBarAnimation = () => {
  const lastScrollY = React.useRef(0);
  const tabBarTranslateY = React.useRef(null);

  React.useEffect(() => {
    // Get translateY from navigationRef
    const checkTabBarRef = () => {
      const { navigationRef } = require('../../config/navigationRef');
      if (navigationRef.current?.tabBarTranslateY) {
        tabBarTranslateY.current = navigationRef.current.tabBarTranslateY;
      }
    };
    
    checkTabBarRef();
    const interval = setInterval(checkTabBarRef, 100);
    
    return () => clearInterval(interval);
  }, []);

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: new Animated.Value(0) } } }],
    {
      useNativeDriver: true,
      listener: (event) => {
        const currentScrollY = event.nativeEvent.contentOffset.y;
        const diff = currentScrollY - lastScrollY.current;

        if (!tabBarTranslateY.current) return;

        // Scroll down - hide tab bar
        if (diff > 5 && currentScrollY > 50) {
          Animated.spring(tabBarTranslateY.current, {
            toValue: TAB_BAR_HEIGHT,
            useNativeDriver: true,
            tension: 100,
            friction: 10,
          }).start();
        }
        // Scroll up - show tab bar
        else if (diff < -5) {
          Animated.spring(tabBarTranslateY.current, {
            toValue: 0,
            useNativeDriver: true,
            tension: 100,
            friction: 10,
          }).start();
        }

        lastScrollY.current = currentScrollY;
      },
    }
  );

  return {
    handleScroll,
    scrollEventThrottle: 16,
  };
};

// Alternative: Manual scroll handler if you don't want to use Animated.event
export const createTabBarScrollHandler = () => {
  const lastScrollY = { current: 0 };
  let tabBarTranslateY = null;

  // Get reference once
  const getTabBarRef = () => {
    if (!tabBarTranslateY) {
      const { navigationRef } = require('../../config/navigationRef');
      if (navigationRef.current?.tabBarTranslateY) {
        tabBarTranslateY = navigationRef.current.tabBarTranslateY;
      }
    }
    return tabBarTranslateY;
  };

  return (event) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;
    const diff = currentScrollY - lastScrollY.current;
    const translateY = getTabBarRef();

    if (!translateY) return;

    // Scroll down - hide tab bar
    if (diff > 5 && currentScrollY > 50) {
      Animated.spring(translateY, {
        toValue: TAB_BAR_HEIGHT,
        useNativeDriver: true,
        tension: 100,
        friction: 10,
      }).start();
    }
    // Scroll up - show tab bar
    else if (diff < -5) {
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 10,
      }).start();
    }

    lastScrollY.current = currentScrollY;
  };
};
