import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, Platform } from 'react-native';
import { designTokens, platformStyles, responsive, getDeviceCategory } from '../(CSS)/PlatformStyles';
import { LinearGradient } from 'expo-linear-gradient';

const PlatformButton = ({ 
  title, 
  onPress, 
  disabled = false, 
  loading = false, 
  variant = 'primary', 
  size = 'medium',
  style = {},
  textStyle = {},
  gradient = false,
  ...props 
}) => {
  const deviceCategory = getDeviceCategory();

  // Define button variants
  const variants = {
    primary: {
      backgroundColor: designTokens.colors.primary,
      textColor: designTokens.colors.onPrimary,
    },
    secondary: {
      backgroundColor: 'transparent',
      textColor: designTokens.colors.primary,
      borderWidth: 2,
      borderColor: designTokens.colors.primary,
    },
    outlined: {
      backgroundColor: 'transparent',
      textColor: designTokens.colors.secondary,
      borderWidth: 1,
      borderColor: designTokens.colors.secondary,
    },
    text: {
      backgroundColor: 'transparent',
      textColor: designTokens.colors.primary,
    },
  };

  // Define button sizes
  const sizes = {
    small: {
      paddingVertical: responsive.spacing(Platform.OS === 'ios' ? 8 : 10),
      paddingHorizontal: responsive.spacing(16),
      fontSize: responsive.fontSize(14),
      minHeight: Platform.OS === 'ios' ? 36 : 40,
    },
    medium: {
      paddingVertical: responsive.spacing(Platform.OS === 'ios' ? 12 : 14),
      paddingHorizontal: responsive.spacing(24),
      fontSize: responsive.fontSize(16),
      minHeight: Platform.OS === 'ios' ? 44 : 48,
    },
    large: {
      paddingVertical: responsive.spacing(Platform.OS === 'ios' ? 16 : 18),
      paddingHorizontal: responsive.spacing(32),
      fontSize: responsive.fontSize(18),
      minHeight: Platform.OS === 'ios' ? 52 : 56,
    },
  };

  const currentVariant = variants[variant] || variants.primary;
  const currentSize = sizes[size] || sizes.medium;

  const buttonStyle = [
    {
      borderRadius: designTokens.borderRadius.medium,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      ...currentVariant,
      ...currentSize,
      opacity: disabled ? 0.6 : 1,
    },
    !disabled && platformStyles.shadow,
    style,
  ];

  const textStyles = [
    {
      color: currentVariant.textColor,
      fontSize: currentSize.fontSize,
      fontWeight: Platform.OS === 'ios' ? '600' : 'bold',
      textAlign: 'center',
    },
    textStyle,
  ];

  const handlePress = () => {
    if (!disabled && !loading && onPress) {
      // Add haptic feedback on iOS
      if (Platform.OS === 'ios') {
        // Haptic feedback could be added here if expo-haptics is installed
      }
      onPress();
    }
  };

  const ButtonContent = () => (
    <>
      {loading && (
        <ActivityIndicator
          size="small"
          color={currentVariant.textColor}
          style={{ marginRight: loading ? 8 : 0 }}
        />
      )}
      <Text style={textStyles}>
        {loading ? 'Loading...' : title}
      </Text>
    </>
  );

  if (gradient && variant === 'primary') {
    return (
      <TouchableOpacity
        onPress={handlePress}
        disabled={disabled || loading}
        activeOpacity={Platform.OS === 'ios' ? 0.7 : 0.8}
        {...props}
      >
        <LinearGradient
          colors={[designTokens.colors.primary, '#FF6B35']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={buttonStyle}
        >
          <ButtonContent />
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={Platform.OS === 'ios' ? 0.7 : 0.8}
      {...props}
    >
      <ButtonContent />
    </TouchableOpacity>
  );
};

export default PlatformButton;
