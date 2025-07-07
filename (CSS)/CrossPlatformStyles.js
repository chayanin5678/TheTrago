import { StyleSheet, Dimensions } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

// Cross-platform utility functions for consistent styling
export const CrossPlatformUtils = {
  // Get unified shadow style for both platforms
  getUnifiedShadow: (shadowColor = '#000', opacity = 0.2, radius = 4, elevation = 5) => ({
    shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: opacity,
    shadowRadius: radius,
    elevation, // Android
    // Add background for shadow to work on Android
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
  }),

  // Get adaptive spacing based on screen size
  getAdaptiveSpacing: (baseValue) => {
    const { width } = Dimensions.get('window');
    if (width > 768) return baseValue * 1.2; // Tablet
    if (width <= 480) return baseValue * 0.9; // Small phone
    return baseValue; // Default phone
  },

  // Get adaptive border radius
  getAdaptiveBorderRadius: (baseValue) => {
    const { width } = Dimensions.get('window');
    if (width > 768) return baseValue * 1.1; // Tablet
    return baseValue; // Phone
  },

  // Get safe area padding for different platforms
  getSafeAreaPadding: () => ({
    paddingTop: hp('2%'), // Unified padding
    paddingHorizontal: wp('3%'),
  }),

  // Get responsive font size
  getResponsiveFontSize: (baseSize) => {
    const { width } = Dimensions.get('window');
    if (width > 768) return baseSize * 1.1; // Tablet
    if (width <= 480) return baseSize * 0.95; // Small phone
    return baseSize; // Default phone
  },
};

// Cross-platform safe area utilities
export const SafeAreaUtils = {
  /**
   * Get consistent top spacing for both platforms
   * @param {object} insets - Safe area insets from useSafeAreaInsets
   * @param {number} statusBarHeight - Status bar height (Android)
   * @returns {number} Consistent top spacing
   */
  getConsistentTopSpacing: (insets, statusBarHeight = 0) => {
    const minSpacing = 24;
    
    // If we have good safe area insets (typically iOS), use them
    if (insets.top >= minSpacing) {
      return insets.top;
    }
    
    // For Android or devices with small safe area
    if (statusBarHeight > 0) {
      return statusBarHeight + 8; // Status bar + padding
    }
    
    return minSpacing; // Fallback
  },

  /**
   * Get status bar configuration for cross-platform consistency
   */
  getStatusBarConfig: () => ({
    barStyle: 'light-content',
    backgroundColor: 'rgba(253, 80, 30, 0.9)',
    translucent: true,
  }),
};

// Unified design tokens for consistent theming
export const DesignTokens = {
  colors: {
    primary: '#FD501E',
    primaryLight: '#FF6B35',
    primaryDark: '#E8460F',
    secondary: '#FF8956',
    accent: '#FFA072',
    background: '#FFFFFF',
    surface: 'rgba(255, 255, 255, 0.98)',
    error: '#FF3B30',
    success: '#34C759',
    warning: '#FF9500',
    text: {
      primary: '#1A1A1A',
      secondary: '#666666',
      tertiary: '#999999',
      inverse: '#FFFFFF',
    },
    shadow: 'rgba(0, 0, 0, 0.1)',
    border: 'rgba(253, 80, 30, 0.1)',
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
    sm: wp('2%'),
    md: wp('4%'),
    lg: wp('6%'),
    xl: wp('8%'),
    round: wp('50%'),
  },
  
  fontSize: {
    xs: wp('2.5%'),
    sm: wp('3%'),
    md: wp('3.5%'),
    lg: wp('4%'),
    xl: wp('5%'),
    xxl: wp('6%'),
    title: wp('7%'),
  },
  
  shadows: {
    light: CrossPlatformUtils.getUnifiedShadow('#000', 0.1, 2, 2),
    medium: CrossPlatformUtils.getUnifiedShadow('#000', 0.15, 4, 4),
    heavy: CrossPlatformUtils.getUnifiedShadow('#000', 0.2, 8, 8),
    colored: CrossPlatformUtils.getUnifiedShadow('#FD501E', 0.15, 6, 6),
  },
};

// Common component styles that work consistently across platforms
export const CommonStyles = StyleSheet.create({
  // Card component
  card: {
    backgroundColor: DesignTokens.colors.surface,
    borderRadius: DesignTokens.borderRadius.md,
    padding: DesignTokens.spacing.md,
    marginBottom: DesignTokens.spacing.md,
    ...DesignTokens.shadows.medium,
    borderWidth: 1,
    borderColor: DesignTokens.colors.border,
  },
  
  // Button component
  primaryButton: {
    backgroundColor: DesignTokens.colors.primary,
    borderRadius: DesignTokens.borderRadius.lg,
    paddingVertical: DesignTokens.spacing.md,
    paddingHorizontal: DesignTokens.spacing.lg,
    ...DesignTokens.shadows.colored,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  primaryButtonText: {
    color: DesignTokens.colors.text.inverse,
    fontSize: DesignTokens.fontSize.md,
    fontWeight: 'bold',
  },
  
  // Input component
  input: {
    backgroundColor: DesignTokens.colors.surface,
    borderRadius: DesignTokens.borderRadius.md,
    paddingVertical: DesignTokens.spacing.sm,
    paddingHorizontal: DesignTokens.spacing.md,
    fontSize: DesignTokens.fontSize.md,
    borderWidth: 1,
    borderColor: DesignTokens.colors.border,
    ...DesignTokens.shadows.light,
  },
  
  // Container styles
  safeContainer: {
    flex: 1,
    backgroundColor: DesignTokens.colors.background,
    ...CrossPlatformUtils.getSafeAreaPadding(),
  },
  
  centeredContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: DesignTokens.colors.background,
  },
  
  // Text styles
  title: {
    fontSize: DesignTokens.fontSize.title,
    fontWeight: 'bold',
    color: DesignTokens.colors.text.primary,
    marginBottom: DesignTokens.spacing.md,
  },
  
  subtitle: {
    fontSize: DesignTokens.fontSize.lg,
    fontWeight: '600',
    color: DesignTokens.colors.text.secondary,
    marginBottom: DesignTokens.spacing.sm,
  },
  
  body: {
    fontSize: DesignTokens.fontSize.md,
    color: DesignTokens.colors.text.primary,
    lineHeight: DesignTokens.fontSize.md * 1.4,
  },
  
  caption: {
    fontSize: DesignTokens.fontSize.sm,
    color: DesignTokens.colors.text.tertiary,
  },
  
  // Layout helpers
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  column: {
    flexDirection: 'column',
  },
  
  spaceBetween: {
    justifyContent: 'space-between',
  },
  
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Common animations
  fadeIn: {
    opacity: 1,
  },
  
  fadeOut: {
    opacity: 0,
  },
  
  // Responsive breakpoints
  mobileOnly: {
    ...(Dimensions.get('window').width > 768 && { display: 'none' }),
  },
  
  tabletOnly: {
    ...(Dimensions.get('window').width <= 768 && { display: 'none' }),
  },
});

export default {
  CrossPlatformUtils,
  SafeAreaUtils,
  DesignTokens,
  CommonStyles,
};
