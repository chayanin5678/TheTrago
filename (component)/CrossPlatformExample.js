import React, { useState } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import PlatformStatusBar from './PlatformStatusBar';
import PlatformSafeArea from './PlatformSafeArea';
import PlatformButton from './PlatformButton';
import PlatformTextInput from './PlatformTextInput';
import { designTokens, platformStyles, responsive } from '../(CSS)/PlatformStyles';

const CrossPlatformExample = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleSubmit = async () => {
    setLoading(true);
    setErrors({});

    // Simulate API call
    setTimeout(() => {
      if (!email) {
        setErrors({ email: 'Email is required' });
      }
      if (!password) {
        setErrors(prev => ({ ...prev, password: 'Password is required' }));
      }
      
      if (email && password) {
        Alert.alert('Success', 'Form submitted successfully!');
      }
      
      setLoading(false);
    }, 2000);
  };

  return (
    <PlatformSafeArea>
      <PlatformStatusBar style="primary" />
      
      <ScrollView 
        style={platformStyles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={{
          padding: designTokens.spacing.md,
          marginTop: responsive.spacing(20),
        }}>
          
          {/* Header */}
          <Text style={{
            ...designTokens.typography.h1,
            color: designTokens.colors.secondary,
            textAlign: 'center',
            marginBottom: responsive.spacing(32),
          }}>
            Cross-Platform Demo
          </Text>
          
          {/* Description */}
          <Text style={{
            ...designTokens.typography.body1,
            color: designTokens.colors.onBackground,
            textAlign: 'center',
            marginBottom: responsive.spacing(40),
            opacity: 0.8,
          }}>
            This form demonstrates the cross-platform components
            working seamlessly on both iOS and Android.
          </Text>

          {/* Card Container */}
          <View style={[
            platformStyles.card,
            { 
              padding: designTokens.spacing.lg,
              marginBottom: responsive.spacing(24),
            }
          ]}>
            
            {/* Email Input */}
            <PlatformTextInput
              label="Email Address"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon="mail"
              error={errors.email}
            />

            {/* Password Input */}
            <PlatformTextInput
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={true}
              leftIcon="lock-closed"
              error={errors.password}
            />

            {/* Submit Button */}
            <PlatformButton
              title="Submit Form"
              onPress={handleSubmit}
              loading={loading}
              variant="primary"
              size="large"
              gradient={true}
              style={{ marginTop: responsive.spacing(16) }}
            />

            {/* Secondary Button */}
            <PlatformButton
              title="Cancel"
              onPress={() => {
                setEmail('');
                setPassword('');
                setErrors({});
              }}
              variant="secondary"
              size="medium"
              style={{ marginTop: responsive.spacing(12) }}
            />

          </View>

          {/* Feature List */}
          <View style={[
            platformStyles.card,
            { padding: designTokens.spacing.lg }
          ]}>
            <Text style={{
              ...designTokens.typography.h3,
              color: designTokens.colors.primary,
              marginBottom: responsive.spacing(16),
            }}>
              Cross-Platform Features:
            </Text>

            {[
              'Automatic platform detection',
              'Responsive sizing system', 
              'Platform-specific shadows',
              'Consistent typography',
              'Unified color system',
              'Smart safe area handling',
              'Optimized touch targets',
              'Cross-platform animations'
            ].map((feature, index) => (
              <View key={index} style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: responsive.spacing(8),
              }}>
                <View style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: designTokens.colors.primary,
                  marginRight: responsive.spacing(12),
                }} />
                <Text style={{
                  ...designTokens.typography.body2,
                  color: designTokens.colors.onSurface,
                  flex: 1,
                }}>
                  {feature}
                </Text>
              </View>
            ))}
          </View>

          {/* Button Variants Demo */}
          <View style={[
            platformStyles.card,
            { padding: designTokens.spacing.lg }
          ]}>
            <Text style={{
              ...designTokens.typography.h3,
              color: designTokens.colors.primary,
              marginBottom: responsive.spacing(16),
            }}>
              Button Variants:
            </Text>

            <PlatformButton
              title="Primary"
              onPress={() => Alert.alert('Primary Button')}
              variant="primary"
              style={{ marginBottom: responsive.spacing(8) }}
            />

            <PlatformButton
              title="Secondary"
              onPress={() => Alert.alert('Secondary Button')}
              variant="secondary"
              style={{ marginBottom: responsive.spacing(8) }}
            />

            <PlatformButton
              title="Outlined"
              onPress={() => Alert.alert('Outlined Button')}
              variant="outlined"
              style={{ marginBottom: responsive.spacing(8) }}
            />

            <PlatformButton
              title="Text Button"
              onPress={() => Alert.alert('Text Button')}
              variant="text"
            />
          </View>

        </View>
      </ScrollView>
    </PlatformSafeArea>
  );
};

export default CrossPlatformExample;
