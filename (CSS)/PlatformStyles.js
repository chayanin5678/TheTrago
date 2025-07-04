import { StyleSheet, Platform, Dimensions } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const { width, height } = Dimensions.get('window');

// Cross-platform design tokens
export const designTokens = {
  colors: {
    primary: '#FD501E',
    secondary: '#002348',
    background: '#FFFFFF',
    surface: 'rgba(255,255,255,0.98)',
    surfaceVariant: 'rgba(248,250,252,0.9)',
    error: '#B00020',
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    onBackground: '#002348',
    onSurface: '#002348',
    disabled: 'rgba(0,35,72,0.3)',
    shadow: Platform.OS === 'ios' ? 'rgba(253, 80, 30, 0.2)' : 'rgba(0, 0, 0, 0.2)',
  },
  spacing: {
    xs: wp('1%'),
    sm: wp('2%'), 
    md: wp('4%'),
    lg: wp('6%'),
    xl: wp('8%'),
    xxl: wp('10%'),
  },
  borderRadius: {
    small: wp('2%'),
    medium: wp('4%'),
    large: wp('6%'),
    extraLarge: wp('8%'),
  },
  typography: {
    h1: {
      fontSize: wp('6%'),
      fontWeight: 'bold',
      lineHeight: wp('8%'),
    },
    h2: {
      fontSize: wp('5%'),
      fontWeight: '600',
      lineHeight: wp('7%'),
    },
    h3: {
      fontSize: wp('4.5%'),
      fontWeight: '600',
      lineHeight: wp('6%'),
    },
    body1: {
      fontSize: wp('4%'),
      fontWeight: '400',
      lineHeight: wp('5.5%'),
    },
    body2: {
      fontSize: wp('3.5%'),
      fontWeight: '400',
      lineHeight: wp('5%'),
    },
    caption: {
      fontSize: wp('3%'),
      fontWeight: '400',
      lineHeight: wp('4%'),
    },
  },
};

// Platform-specific adjustments
export const platformStyles = {
  // Safe area handling
  safeArea: {
    flex: 1,
    backgroundColor: designTokens.colors.background,
    ...Platform.select({
      ios: {
        paddingTop: 0, // SafeAreaView handles this
      },
      android: {
        paddingTop: require('react-native').StatusBar.currentHeight || 24,
      },
    }),
  },
  
  // Container with platform-specific padding
  container: {
    flex: 1,
    backgroundColor: designTokens.colors.background,
    paddingHorizontal: designTokens.spacing.md,
    ...Platform.select({
      ios: {
        paddingTop: 0, // SafeAreaView handles this
      },
      android: {
        paddingTop: 0, // Handled by SafeArea component
      },
    }),
  },

  // Cross-platform shadow
  shadow: {
    ...Platform.select({
      ios: {
        shadowColor: designTokens.colors.shadow,
        shadowOffset: { width: 0, height: hp('0.5%') },
        shadowOpacity: 0.15,
        shadowRadius: wp('2%'),
      },
      android: {
        elevation: 4,
        shadowColor: designTokens.colors.shadow,
      },
    }),
  },

  // Enhanced shadow for premium elements
  premiumShadow: {
    ...Platform.select({
      ios: {
        shadowColor: designTokens.colors.primary,
        shadowOffset: { width: 0, height: hp('1%') },
        shadowOpacity: 0.2,
        shadowRadius: wp('4%'),
      },
      android: {
        elevation: 8,
        shadowColor: designTokens.colors.primary,
      },
    }),
  },

  // Input field styling
  inputField: {
    backgroundColor: designTokens.colors.surface,
    borderRadius: designTokens.borderRadius.medium,
    paddingHorizontal: designTokens.spacing.md,
    paddingVertical: Platform.OS === 'ios' ? hp('2%') : hp('1.5%'),
    fontSize: designTokens.typography.body1.fontSize,
    borderWidth: 1,
    borderColor: 'rgba(253, 80, 30, 0.08)',
    minHeight: Platform.OS === 'ios' ? hp('6%') : hp('7%'),
  },

  // Button styling
  button: {
    backgroundColor: designTokens.colors.primary,
    borderRadius: designTokens.borderRadius.medium,
    paddingVertical: Platform.OS === 'ios' ? hp('1.8%') : hp('2%'),
    paddingHorizontal: designTokens.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: Platform.OS === 'ios' ? hp('6%') : hp('6.5%'),
  },

  // Card styling with platform-specific shadows
  card: {
    backgroundColor: designTokens.colors.surface,
    borderRadius: designTokens.borderRadius.large,
    padding: designTokens.spacing.md,
    marginVertical: designTokens.spacing.sm,
    borderWidth: wp('0.2%'),
    borderColor: 'rgba(253, 80, 30, 0.1)',
    ...Platform.select({
      ios: {
        shadowColor: designTokens.colors.primary,
        shadowOffset: { width: 0, height: hp('0.8%') },
        shadowOpacity: 0.15,
        shadowRadius: wp('3%'),
      },
      android: {
        elevation: 6,
        shadowColor: designTokens.colors.primary,
      },
    }),
  },

  // Status bar styling
  statusBar: {
    ...Platform.select({
      ios: {
        barStyle: 'light-content',
        backgroundColor: 'transparent',
      },
      android: {
        barStyle: 'light-content',
        backgroundColor: designTokens.colors.primary,
        translucent: true,
      },
    }),
  },

  // Keyboard avoiding view
  keyboardAvoidingView: {
    flex: 1,
    behavior: Platform.OS === 'ios' ? 'padding' : 'height',
    keyboardVerticalOffset: Platform.OS === 'ios' ? hp('8%') : 0,
  },

  // Modal styling
  modal: {
    backgroundColor: designTokens.colors.surface,
    borderTopLeftRadius: designTokens.borderRadius.extraLarge,
    borderTopRightRadius: designTokens.borderRadius.extraLarge,
    paddingTop: designTokens.spacing.lg,
    paddingHorizontal: designTokens.spacing.md,
    minHeight: hp('50%'),
    ...Platform.select({
      ios: {
        paddingBottom: hp('4%'),
      },
      android: {
        paddingBottom: hp('2%'),
      },
    }),
  },

  // Tab bar styling
  tabBar: {
    backgroundColor: designTokens.colors.background,
    borderTopWidth: 0,
    paddingBottom: Platform.OS === 'ios' ? hp('3%') : hp('1%'),
    paddingTop: hp('1%'),
    height: Platform.OS === 'ios' ? hp('10%') : hp('8%'),
    ...Platform.select({
      ios: {
        shadowColor: designTokens.colors.shadow,
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 8,
      },
    }),
  },
};

// Responsive breakpoints
export const breakpoints = {
  small: width < 380,
  medium: width >= 380 && width < 768,
  large: width >= 768,
};

// Responsive utility functions
export const responsive = {
  // Font scaling for different screen sizes
  fontSize: (size) => {
    if (breakpoints.small) return size * 0.9;
    if (breakpoints.large) return size * 1.1;
    return size;
  },
  
  // Spacing scaling
  spacing: (size) => {
    if (breakpoints.small) return size * 0.8;
    if (breakpoints.large) return size * 1.2;
    return size;
  },
  
  // Component sizing
  componentSize: (size) => {
    if (breakpoints.small) return size * 0.9;
    if (breakpoints.large) return size * 1.1;
    return size;
  },
};

// Device-specific adjustments
export const deviceAdjustments = {
  // Small devices (iPhone SE, small Android phones)
  small: {
    padding: designTokens.spacing.sm,
    fontSize: wp('3.5%'),
    buttonHeight: hp('5.5%'),
  },
  
  // Medium devices (most phones)
  medium: {
    padding: designTokens.spacing.md,
    fontSize: wp('4%'),
    buttonHeight: hp('6%'),
  },
  
  // Large devices (tablets, large phones)
  large: {
    padding: designTokens.spacing.lg,
    fontSize: wp('3.5%'),
    buttonHeight: hp('5%'),
  },
};

// Get current device category
export const getDeviceCategory = () => {
  if (breakpoints.small) return 'small';
  if (breakpoints.large) return 'large';
  return 'medium';
};

// Cross-platform utilities
export const crossPlatformUtils = {
  // Generate platform-specific styles
  platformStyle: (iosStyle, androidStyle) => {
    return Platform.select({
      ios: iosStyle,
      android: androidStyle,
    });
  },
  
  // Safe area insets (use with react-native-safe-area-context for better results)
  safeAreaInsets: {
    top: Platform.OS === 'ios' ? 0 : hp('2%'),
    bottom: Platform.OS === 'ios' ? 0 : hp('1%'),
  },
  
  // Haptic feedback (requires expo-haptics)
  hapticFeedback: Platform.OS === 'ios' ? 'light' : 'medium',
  
  // Picker display mode
  pickerMode: Platform.OS === 'ios' ? 'spinner' : 'dropdown',
};

export default {
  designTokens,
  platformStyles,
  breakpoints,
  responsive,
  deviceAdjustments,
  getDeviceCategory,
  crossPlatformUtils,
};
