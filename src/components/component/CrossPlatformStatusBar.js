import React from 'react';
import { StatusBar, StyleSheet, View, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { DesignTokens, SafeAreaUtils } from '../../styles/CSS/CrossPlatformStyles';
import useCrossPlatformSafeArea from './useCrossPlatformSafeArea';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const CrossPlatformStatusBar = ({
  barStyle = 'light-content',
  backgroundColor = 'rgba(253, 80, 30, 0.9)',
  translucent = true,
  children,
  showGradient = false,
  additionalTopPadding = 0, // Allow custom additional padding
}) => {
  const safeArea = useCrossPlatformSafeArea();
  const insets = useSafeAreaInsets();
  
  // Android 15 Edge-to-Edge Support
  const isAndroid15Plus = Platform.OS === 'android' && Platform.Version >= 31;
  
  // Use Android 15 insets for proper edge-to-edge support
  const topSpacing = isAndroid15Plus 
    ? insets.top + additionalTopPadding
    : SafeAreaUtils.getConsistentTopSpacing(
        { top: safeArea.originalTop }, 
        safeArea.statusBarHeight
      ) + additionalTopPadding;

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle={barStyle}
        backgroundColor={isAndroid15Plus ? 'transparent' : backgroundColor}
        translucent={true} // Always true for Android 15 edge-to-edge
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
