import React from 'react';
import { View, Platform, StatusBar, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { platformStyles, designTokens } from '../(CSS)/PlatformStyles';

const PlatformSafeArea = ({ 
  children, 
  style = {}, 
  edges = ['top', 'bottom', 'left', 'right'],
  backgroundColor = designTokens.colors.background 
}) => {
  const { height } = Dimensions.get('window');
  
  // Calculate Android status bar height
  const androidStatusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 0;
  
  // For iOS, use SafeAreaView with edges
  if (Platform.OS === 'ios') {
    return (
      <SafeAreaView 
        style={[
          { 
            flex: 1, 
            backgroundColor 
          }, 
          style
        ]}
        edges={edges}
      >
        {children}
      </SafeAreaView>
    );
  }

  // For Android, use custom safe area handling with proper padding
  return (
    <View 
      style={[
        {
          flex: 1,
          backgroundColor,
          paddingTop: edges.includes('top') ? androidStatusBarHeight : 0,
          paddingBottom: edges.includes('bottom') ? 0 : 0, // Android handles bottom navigation
        },
        style
      ]}
    >
      {children}
    </View>
  );
};

export default PlatformSafeArea;
