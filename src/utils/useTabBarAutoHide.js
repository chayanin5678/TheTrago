import React from 'react';

/**
 * Tab Bar Auto-Hide Hook
 * Use this in any screen with ScrollView/FlatList to enable Facebook-style tab bar hiding
 * 
 * Example usage:
 * 
 * import { useTabBarAutoHide } from '../utils/useTabBarAutoHide';
 * 
 * const MyScreen = () => {
 *   const scrollProps = useTabBarAutoHide();
 *   
 *   return (
 *     <ScrollView {...scrollProps}>
 *       // Your content
 *     </ScrollView>
 *   );
 * };
 */

export const useTabBarAutoHide = () => {
  const handleScroll = React.useCallback((event) => {
    if (global.handleTabBarScroll && event?.nativeEvent?.contentOffset) {
      const scrollY = event.nativeEvent.contentOffset.y;
      global.handleTabBarScroll(scrollY);
    }
  }, []);

  return React.useMemo(() => ({
    onScroll: handleScroll,
    scrollEventThrottle: 16,
  }), [handleScroll]);
};

// For use with FlatList/SectionList
export const getTabBarAutoHideProps = () => ({
  onScroll: (event) => {
    if (global.handleTabBarScroll && event?.nativeEvent?.contentOffset) {
      const scrollY = event.nativeEvent.contentOffset.y;
      global.handleTabBarScroll(scrollY);
    }
  },
  scrollEventThrottle: 16,
});
