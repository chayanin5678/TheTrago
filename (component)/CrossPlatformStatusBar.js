import React from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { DesignTokens, SafeAreaUtils } from '../(CSS)/CrossPlatformStyles';
import useCrossPlatformSafeArea from './useCrossPlatformSafeArea';

const CrossPlatformStatusBar = ({
  barStyle = 'light-content',
  backgroundColor = 'rgba(253, 80, 30, 0.9)',
  translucent = true,
  children,
  showGradient = false,
  additionalTopPadding = 0, // Allow custom additional padding
}) => {
  const safeArea = useCrossPlatformSafeArea();
  
  // Use utility function for consistent spacing
  const topSpacing = SafeAreaUtils.getConsistentTopSpacing(
    { top: safeArea.originalTop }, 
    safeArea.statusBarHeight
  ) + additionalTopPadding;

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle={barStyle}
        backgroundColor={backgroundColor}
        translucent={translucent}
      />
      
      {/* Conditional gradient background */}
      {showGradient && (
        <LinearGradient
          colors={['#FD501E', '#FF6B35', '#FF8956', '#FFA072']}
          style={StyleSheet.absoluteFillObject}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      )}
      
      {/* Status bar background overlay for extra coverage */}
      <View style={[
        styles.statusBarOverlay,
        {
          height: topSpacing,
          backgroundColor: backgroundColor,
        }
      ]} />
      
      {/* Safe area container with calculated top padding */}
      <View style={[
        styles.contentContainer,
        {
          paddingTop: topSpacing,
        }
      ]}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent', // Let child handle background
  },
  statusBarOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});

export default CrossPlatformStatusBar;
