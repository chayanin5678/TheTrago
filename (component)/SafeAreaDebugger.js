import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import useCrossPlatformSafeArea from './useCrossPlatformSafeArea';
import { DesignTokens } from '../(CSS)/CrossPlatformStyles';

/**
 * Debug component to visualize safe area values
 * Use this component temporarily to check safe area calculations
 */
const SafeAreaDebugger = ({ visible = false }) => {
  const safeArea = useCrossPlatformSafeArea();

  if (!visible) return null;

  return (
    <View style={styles.debugContainer}>
      <Text style={styles.debugTitle}>Safe Area Debug Info</Text>
      <Text style={styles.debugText}>Original Top: {safeArea.originalTop}px</Text>
      <Text style={styles.debugText}>Calculated Top: {safeArea.top}px</Text>
      <Text style={styles.debugText}>Status Bar Height: {safeArea.statusBarHeight}px</Text>
      <Text style={styles.debugText}>Bottom: {safeArea.bottom}px</Text>
      <Text style={styles.debugText}>Left: {safeArea.left}px</Text>
      <Text style={styles.debugText}>Right: {safeArea.right}px</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  debugContainer: {
    position: 'absolute',
    top: 100,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 10,
    borderRadius: 8,
    zIndex: 9999,
    minWidth: 200,
  },
  debugTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  debugText: {
    color: '#fff',
    fontSize: 12,
    marginBottom: 4,
  },
});

export default SafeAreaDebugger;
