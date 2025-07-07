import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Dimensions, StatusBar } from 'react-native';

/**
 * Custom hook for cross-platform safe area handling
 * Ensures consistent top spacing across iOS and Android
 */
export const useCrossPlatformSafeArea = () => {
  const insets = useSafeAreaInsets();
  
  // Get device screen dimensions
  const { height: screenHeight } = Dimensions.get('window');
  
  // Calculate status bar height for Android
  // On Android, if StatusBar.currentHeight is available, use it
  const statusBarHeight = StatusBar.currentHeight || 0;
  
  // Ensure minimum top spacing for consistent look
  const minTopSpacing = 24; // Minimum spacing in dp for visual consistency
  
  // For Android devices with low safe area, use calculated value
  let adjustedTop = insets.top;
  
  // If the safe area top is very small (common on Android), 
  // use a calculated value based on status bar height
  if (insets.top < minTopSpacing && statusBarHeight > 0) {
    adjustedTop = statusBarHeight + 8; // Status bar + small padding
  } else if (insets.top < minTopSpacing) {
    adjustedTop = minTopSpacing; // Fallback minimum
  }
  
  return {
    top: adjustedTop,
    bottom: insets.bottom,
    left: insets.left,
    right: insets.right,
    statusBarHeight,
    originalTop: insets.top, // Keep original for debugging
  };
};

export default useCrossPlatformSafeArea;
