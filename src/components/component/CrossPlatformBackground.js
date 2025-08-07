import React from 'react';
import { View, StyleSheet, Dimensions, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const CrossPlatformBackground = ({ 
  colors = [
    '#FD501E', 
    '#FF6B35', 
    '#FF8956', 
    '#FFA072',
    '#FFB088'  // Added softer end color
  ],
  children,
  style = {}
}) => {
  const insets = useSafeAreaInsets();
  const screenData = Dimensions.get('screen');
  const windowData = Dimensions.get('window');
  
  // Calculate proper dimensions for each platform
  const getBackgroundDimensions = () => {
    const statusBarHeight = StatusBar.currentHeight || 24;
    return {
      height: screenData.height,
      width: screenData.width,
      top: -statusBarHeight,
    };
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
          locations={[0, 0.25, 0.5, 0.75, 1]} // More gradual transitions for iOS-like smoothness
        />
        
        {/* Platform-specific color correction for consistency */}
        <View style={[
          StyleSheet.absoluteFillObject,
          {
            backgroundColor: 'rgba(0, 0, 0, 0.005)', // Consistent minimal darkening
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
