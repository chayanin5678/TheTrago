import React, { useState } from 'react';
import { View, TextInput, Text, Platform, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { designTokens, platformStyles, responsive } from '../(CSS)/PlatformStyles';

const PlatformTextInput = ({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  multiline = false,
  numberOfLines = 1,
  editable = true,
  style = {},
  inputStyle = {},
  leftIcon,
  rightIcon,
  onRightIconPress,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isSecureVisible, setIsSecureVisible] = useState(!secureTextEntry);

  const containerStyle = [
    {
      marginBottom: responsive.spacing(16),
    },
    style,
  ];

  const inputContainerStyle = [
    platformStyles.inputField,
    {
      flexDirection: 'row',
      alignItems: multiline ? 'flex-start' : 'center',
      borderColor: error 
        ? designTokens.colors.error 
        : isFocused 
          ? designTokens.colors.primary 
          : 'rgba(253, 80, 30, 0.08)',
      borderWidth: isFocused || error ? 2 : 1,
      backgroundColor: editable ? designTokens.colors.surface : 'rgba(0,0,0,0.05)',
    },
    multiline && {
      paddingVertical: Platform.OS === 'ios' ? 12 : 8,
      minHeight: numberOfLines * 20 + (Platform.OS === 'ios' ? 24 : 16),
    },
  ];

  const textInputStyle = [
    {
      flex: 1,
      fontSize: responsive.fontSize(designTokens.typography.body1.fontSize),
      color: designTokens.colors.onSurface,
      paddingVertical: Platform.OS === 'ios' ? 0 : 4,
      textAlignVertical: multiline ? 'top' : 'center',
    },
    inputStyle,
  ];

  const labelStyle = {
    fontSize: responsive.fontSize(14),
    color: designTokens.colors.onBackground,
    marginBottom: responsive.spacing(8),
    fontWeight: Platform.OS === 'ios' ? '600' : 'bold',
  };

  const errorStyle = {
    fontSize: responsive.fontSize(12),
    color: designTokens.colors.error,
    marginTop: responsive.spacing(4),
    marginLeft: responsive.spacing(4),
  };

  const handleToggleSecure = () => {
    setIsSecureVisible(!isSecureVisible);
  };

  return (
    <View style={containerStyle}>
      {label && <Text style={labelStyle}>{label}</Text>}
      
      <View style={inputContainerStyle}>
        {leftIcon && (
          <View style={{ marginRight: responsive.spacing(8) }}>
            {typeof leftIcon === 'string' ? (
              <Ionicons 
                name={leftIcon} 
                size={responsive.fontSize(20)} 
                color={designTokens.colors.primary} 
              />
            ) : (
              leftIcon
            )}
          </View>
        )}
        
        <TextInput
          style={textInputStyle}
          placeholder={placeholder}
          placeholderTextColor={Platform.OS === 'ios' ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.5)'}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry && !isSecureVisible}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          multiline={multiline}
          numberOfLines={numberOfLines}
          editable={editable}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          selectionColor={designTokens.colors.primary}
          {...props}
        />
        
        {secureTextEntry && (
          <TouchableOpacity 
            onPress={handleToggleSecure}
            style={{ marginLeft: responsive.spacing(8) }}
          >
            <Ionicons 
              name={isSecureVisible ? 'eye-off' : 'eye'} 
              size={responsive.fontSize(20)} 
              color={designTokens.colors.primary} 
            />
          </TouchableOpacity>
        )}
        
        {rightIcon && !secureTextEntry && (
          <TouchableOpacity 
            onPress={onRightIconPress}
            style={{ marginLeft: responsive.spacing(8) }}
          >
            {typeof rightIcon === 'string' ? (
              <Ionicons 
                name={rightIcon} 
                size={responsive.fontSize(20)} 
                color={designTokens.colors.primary} 
              />
            ) : (
              rightIcon
            )}
          </TouchableOpacity>
        )}
      </View>
      
      {error && <Text style={errorStyle}>{error}</Text>}
    </View>
  );
};

export default PlatformTextInput;
