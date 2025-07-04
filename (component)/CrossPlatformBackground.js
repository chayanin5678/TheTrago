import React from 'react';
import { View, StyleSheet, Platform, Dimensions, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const CrossPlatformBackground = ({ 
  colors = ['#FD501E', '#FF6B35', '#FF8956', '#FFA072'],
  children,
  style = {}
}) => {
  const insets = useSafeAreaInsets();
  const screenData = Dimensions.get('screen');
  const windowData = Dimensions.get('window');
  
  // Calculate proper dimensions for each platform
  const getBackgroundDimensions = () => {
    if (Platform.OS === 'android') {
      const statusBarHeight = StatusBar.currentHeight || 24;
      return {
        height: screenData.height,
        width: screenData.width,
        top: -statusBarHeight,
      };
    } else {
      // iOS: Cover the entire screen including safe areas
      return {
        height: screenData.height || windowData.height + 100,
        width: screenData.width || windowData.width,
        top: -Math.max(insets.top, 50),
      };
    }
  };

  const backgroundDimensions = getBackgroundDimensions();

  return (
    <View style={[styles.container, style]}>
      {/* Background Gradient Layer */}
      <View style={[styles.backgroundContainer, {
        top: backgroundDimensions.top,
        height: backgroundDimensions.height,
        width: backgroundDimensions.width,
      }]}>
        <LinearGradient
          colors={colors}
          style={StyleSheet.absoluteFillObject}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          locations={[0, 0.3, 0.6, 1]} // Same for both platforms
        />
        
        {/* Platform-specific color correction for consistency */}
        <View style={[
          StyleSheet.absoluteFillObject,
          {
            backgroundColor: Platform.select({
              ios: 'rgba(0, 0, 0, 0.01)', // Very subtle darkening for iOS
              android: 'rgba(255, 255, 255, 0.02)', // Very subtle lightening for Android
            }),
          }
        ]} />
      </View>
      
      {/* Content */}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FD501E', // Consistent fallback color
  },
  backgroundContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: -1,
    overflow: 'hidden',
  },
});

export default CrossPlatformBackground;
