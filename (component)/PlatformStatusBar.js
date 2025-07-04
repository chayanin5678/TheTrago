import React from 'react';
import { StatusBar, Platform } from 'react-native';
import { designTokens } from '../(CSS)/PlatformStyles';

const PlatformStatusBar = ({ 
  style = 'light', 
  backgroundColor = 'transparent', 
  translucent = true 
}) => {
  // Define status bar styles for different contexts
  const statusBarStyles = {
    light: {
      barStyle: 'light-content',
      backgroundColor: Platform.OS === 'android' ? designTokens.colors.primary : 'transparent',
    },
    dark: {
      barStyle: 'dark-content', 
      backgroundColor: Platform.OS === 'android' ? designTokens.colors.background : 'transparent',
    },
    primary: {
      barStyle: 'light-content',
      backgroundColor: designTokens.colors.primary,
    },
  };

  const currentStyle = statusBarStyles[style] || statusBarStyles.light;

  return (
    <StatusBar
      barStyle={currentStyle.barStyle}
      backgroundColor={backgroundColor !== 'transparent' ? backgroundColor : currentStyle.backgroundColor}
      translucent={Platform.OS === 'android' ? true : false}
      hidden={false}
      networkActivityIndicatorVisible={Platform.OS === 'ios'}
      animated={true}
    />
  );
};

export default PlatformStatusBar;
