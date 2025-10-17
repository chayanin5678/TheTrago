import React from 'react';
import { ScrollView as RNScrollView } from 'react-native';

/**
 * Enhanced ScrollView that automatically hides/shows tab bar on scroll
 * Drop-in replacement for React Native's ScrollView
 */
const ScrollViewWithTabBar = React.forwardRef((props, ref) => {
  const { onScroll, ...restProps } = props;

  const handleScroll = (event) => {
    // Call global tab bar handler if available
    if (global.handleTabBarScroll) {
      const scrollY = event.nativeEvent.contentOffset.y;
      global.handleTabBarScroll(scrollY);
    }

    // Call original onScroll if provided
    if (onScroll) {
      onScroll(event);
    }
  };

  return (
    <RNScrollView
      ref={ref}
      {...restProps}
      onScroll={handleScroll}
      scrollEventThrottle={restProps.scrollEventThrottle || 16}
    />
  );
});

ScrollViewWithTabBar.displayName = 'ScrollViewWithTabBar';

export default ScrollViewWithTabBar;
