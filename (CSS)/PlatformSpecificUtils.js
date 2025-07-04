import { Platform, StatusBar, Dimensions } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

// Android-specific utilities
export const AndroidUtils = {
  // Get status bar height for Android
  getStatusBarHeight: () => {
    return Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 0;
  },

  // Get navigation bar height for Android
  getNavigationBarHeight: () => {
    const { height, width } = Dimensions.get('window');
    const screenHeight = Dimensions.get('screen').height;
    
    if (Platform.OS === 'android') {
      // Calculate navigation bar height
      const hasNavigationBar = screenHeight !== height;
      return hasNavigationBar ? screenHeight - height : 0;
    }
    return 0;
  },

  // Calculate safe area insets for Android
  getSafeAreaInsets: () => {
    const statusBarHeight = AndroidUtils.getStatusBarHeight();
    const navigationBarHeight = AndroidUtils.getNavigationBarHeight();
    
    return {
      top: statusBarHeight,
      bottom: navigationBarHeight,
      left: 0,
      right: 0,
    };
  },

  // Adjust container padding for Android
  getContainerPadding: () => {
    return {
      paddingTop: Platform.OS === 'android' ? AndroidUtils.getStatusBarHeight() : 0,
      paddingBottom: Platform.OS === 'android' ? 0 : 0,
    };
  },

  // Get Android-specific shadow
  getAndroidShadow: (elevation = 4) => {
    if (Platform.OS === 'android') {
      return {
        elevation,
        shadowColor: '#000',
      };
    }
    return {};
  },

  // Get platform-specific text scaling
  getTextScale: () => {
    return Platform.OS === 'android' ? 0.95 : 1;
  },

  // Get platform-specific component spacing
  getComponentSpacing: () => {
    return Platform.OS === 'android' ? 0.9 : 1;
  },
};

// iOS-specific utilities
export const IOSUtils = {
  // Get iOS safe area insets (when not using SafeAreaView)
  getSafeAreaInsets: () => {
    // These are approximate values, better to use SafeAreaView
    return {
      top: 47, // For devices with notch
      bottom: 34, // For devices with home indicator
      left: 0,
      right: 0,
    };
  },

  // Get iOS-specific shadow
  getIOSShadow: (radius = 4, opacity = 0.15) => {
    if (Platform.OS === 'ios') {
      return {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: radius / 2 },
        shadowOpacity: opacity,
        shadowRadius: radius,
      };
    }
    return {};
  },

  // Get iOS haptic feedback style
  getHapticStyle: () => {
    return Platform.OS === 'ios' ? 'light' : 'medium';
  },
};

// Cross-platform utilities
export const CrossPlatformUtils = {
  // Get unified shadow for both platforms
  getUnifiedShadow: (elevation = 4, opacity = 0.15) => {
    return Platform.select({
      ios: IOSUtils.getIOSShadow(elevation, opacity),
      android: AndroidUtils.getAndroidShadow(elevation),
    });
  },

  // Get platform-appropriate spacing
  getAdaptiveSpacing: (baseSpacing) => {
    const scale = Platform.OS === 'android' ? 
      AndroidUtils.getComponentSpacing() : 
      1;
    return baseSpacing * scale;
  },

  // Get platform-appropriate font size
  getAdaptiveFontSize: (baseFontSize) => {
    const scale = Platform.OS === 'android' ? 
      AndroidUtils.getTextScale() : 
      1;
    return baseFontSize * scale;
  },

  // Get platform-appropriate border radius
  getAdaptiveBorderRadius: (baseRadius) => {
    return Platform.OS === 'android' ? baseRadius * 0.9 : baseRadius;
  },

  // Get platform-appropriate button height
  getAdaptiveButtonHeight: (baseHeight) => {
    return Platform.OS === 'android' ? baseHeight + 4 : baseHeight;
  },

  // Get platform-appropriate input height
  getAdaptiveInputHeight: (baseHeight) => {
    return Platform.OS === 'android' ? baseHeight + 2 : baseHeight;
  },

  // Get platform-appropriate tab bar height
  getAdaptiveTabBarHeight: () => {
    return Platform.select({
      ios: hp('10%'),
      android: hp('8%'),
    });
  },

  // Get platform-appropriate status bar configuration
  getStatusBarConfig: (style = 'light') => {
    return {
      barStyle: style === 'light' ? 'light-content' : 'dark-content',
      backgroundColor: Platform.select({
        ios: 'transparent',
        android: style === 'light' ? '#FD501E' : '#FFFFFF',
      }),
      translucent: Platform.OS === 'android',
    };
  },

  // Get platform-appropriate keyboard behavior
  getKeyboardBehavior: () => {
    return Platform.select({
      ios: 'padding',
      android: 'height',
    });
  },

  // Get platform-appropriate picker mode
  getPickerMode: () => {
    return Platform.select({
      ios: 'spinner',
      android: 'dropdown',
    });
  },

  // Get platform-appropriate modal presentation
  getModalPresentation: () => {
    return Platform.select({
      ios: 'pageSheet',
      android: 'overFullScreen',
    });
  },

  // Get platform-appropriate animation duration
  getAnimationDuration: () => {
    return Platform.select({
      ios: 300,
      android: 250,
    });
  },

  // Check if device has notch/cutout
  hasNotch: () => {
    const { height, width } = Dimensions.get('window');
    const screenHeight = Dimensions.get('screen').height;
    
    if (Platform.OS === 'ios') {
      // iPhone X and newer have notch
      return height >= 812;
    } else {
      // Android devices with cutout typically have screen height > window height
      return screenHeight > height + AndroidUtils.getStatusBarHeight() + 10;
    }
  },

  // Get device category
  getDeviceCategory: () => {
    const { width } = Dimensions.get('window');
    if (width < 380) return 'small';
    if (width > 768) return 'large';
    return 'medium';
  },

  // Get platform-appropriate loading indicator size
  getLoadingIndicatorSize: () => {
    return Platform.select({
      ios: 'large',
      android: 'large',
    });
  },
};

export default {
  AndroidUtils,
  IOSUtils,
  CrossPlatformUtils,
};
