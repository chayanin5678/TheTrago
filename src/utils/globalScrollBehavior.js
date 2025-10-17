import { ScrollView, FlatList, SectionList } from 'react-native';

/**
 * Global ScrollView enhancer
 * Automatically adds tab bar hide/show functionality to all ScrollView, FlatList, and SectionList
 */
const setupGlobalScrollBehavior = () => {
  // Store original render methods
  const OriginalScrollView = ScrollView.prototype.render;
  const OriginalFlatList = FlatList.prototype.render;
  const OriginalSectionList = SectionList.prototype.render;

  // Enhanced scroll handler
  const createEnhancedScrollHandler = (originalHandler) => {
    return (event) => {
      // Call global tab bar handler
      if (global.handleTabBarScroll && event?.nativeEvent?.contentOffset?.y !== undefined) {
        const scrollY = event.nativeEvent.contentOffset.y;
        global.handleTabBarScroll(scrollY);
      }

      // Call original handler if exists
      if (originalHandler) {
        originalHandler(event);
      }
    };
  };

  // Patch ScrollView
  const originalScrollViewRender = ScrollView.render;
  ScrollView.render = function (props, ref) {
    const enhancedProps = {
      ...props,
      onScroll: createEnhancedScrollHandler(props?.onScroll),
      scrollEventThrottle: props?.scrollEventThrottle || 16,
    };
    return originalScrollViewRender.call(this, enhancedProps, ref);
  };

  // Patch FlatList
  const originalFlatListRender = FlatList.render;
  FlatList.render = function (props, ref) {
    const enhancedProps = {
      ...props,
      onScroll: createEnhancedScrollHandler(props?.onScroll),
      scrollEventThrottle: props?.scrollEventThrottle || 16,
    };
    return originalFlatListRender.call(this, enhancedProps, ref);
  };

  // Patch SectionList
  const originalSectionListRender = SectionList.render;
  SectionList.render = function (props, ref) {
    const enhancedProps = {
      ...props,
      onScroll: createEnhancedScrollHandler(props?.onScroll),
      scrollEventThrottle: props?.scrollEventThrottle || 16,
    };
    return originalSectionListRender.call(this, enhancedProps, ref);
  };

  console.log('✅ Global scroll behavior enabled for tab bar');
};

export default setupGlobalScrollBehavior;
