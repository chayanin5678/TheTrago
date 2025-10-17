import React, { createContext, useContext, useRef } from 'react';
import { Animated, Platform } from 'react-native';

const TabBarContext = createContext(null);

export const TabBarProvider = ({ children, translateY }) => {
  const lastScrollY = useRef(0);
  const TAB_BAR_HEIGHT = Platform.OS === 'ios' ? 80 : 65;

  const handleScroll = (event) => {
    if (!translateY) return;

    const currentScrollY = event.nativeEvent.contentOffset.y;
    const diff = currentScrollY - lastScrollY.current;

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

  return (
    <TabBarContext.Provider value={{ handleScroll }}>
      {children}
    </TabBarContext.Provider>
  );
};

export const useTabBarScroll = () => {
  const context = useContext(TabBarContext);
  
  if (!context) {
    // Return dummy function if not in context
    return {
      onScroll: () => {},
      scrollEventThrottle: 16,
    };
  }

  return {
    onScroll: context.handleScroll,
    scrollEventThrottle: 16,
  };
};
