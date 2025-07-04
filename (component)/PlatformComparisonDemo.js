import React from 'react';
import { View, Text, ScrollView, Platform, Alert } from 'react-native';
import PlatformStatusBar from './PlatformStatusBar';
import PlatformSafeArea from './PlatformSafeArea';
import PlatformButton from './PlatformButton';
import PlatformTextInput from './PlatformTextInput';
import { designTokens } from '../(CSS)/PlatformStyles';
import { CrossPlatformUtils } from '../(CSS)/PlatformSpecificUtils';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const PlatformComparisonDemo = () => {
  const currentPlatform = Platform.OS;
  const deviceCategory = CrossPlatformUtils.getDeviceCategory();
  const hasNotch = CrossPlatformUtils.hasNotch();

  return (
    <PlatformSafeArea>
      <PlatformStatusBar style="primary" />
      
      <ScrollView style={{ flex: 1, backgroundColor: designTokens.colors.background }}>
        
        {/* Platform Info Header */}
        <View style={{
          backgroundColor: designTokens.colors.primary,
          padding: wp('5%'),
          marginBottom: hp('2%'),
        }}>
          <Text style={{
            fontSize: wp('6%'),
            fontWeight: 'bold',
            color: 'white',
            textAlign: 'center',
            marginBottom: hp('1%'),
          }}>
            Platform Demo
          </Text>
          <Text style={{
            fontSize: wp('4%'),
            color: 'rgba(255,255,255,0.9)',
            textAlign: 'center',
          }}>
            Running on {currentPlatform.toUpperCase()}
          </Text>
        </View>

        <View style={{ paddingHorizontal: wp('4%') }}>
          
          {/* Device Information */}
          <View style={{
            backgroundColor: 'white',
            borderRadius: CrossPlatformUtils.getAdaptiveBorderRadius(wp('4%')),
            padding: wp('4%'),
            marginBottom: hp('2%'),
            ...CrossPlatformUtils.getUnifiedShadow(4),
          }}>
            <Text style={{
              fontSize: wp('5%'),
              fontWeight: 'bold',
              color: designTokens.colors.secondary,
              marginBottom: hp('1%'),
            }}>
              Device Information
            </Text>
            
            <InfoRow label="Platform" value={currentPlatform.toUpperCase()} />
            <InfoRow label="Device Category" value={deviceCategory} />
            <InfoRow label="Has Notch/Cutout" value={hasNotch ? 'Yes' : 'No'} />
            <InfoRow label="Status Bar Height" value={`${Platform.OS === 'android' ? require('react-native').StatusBar.currentHeight : 44}px`} />
            <InfoRow label="Tab Bar Height" value={`${CrossPlatformUtils.getAdaptiveTabBarHeight()}px`} />
          </View>

          {/* Platform-Specific Adaptations */}
          <View style={{
            backgroundColor: 'white',
            borderRadius: CrossPlatformUtils.getAdaptiveBorderRadius(wp('4%')),
            padding: wp('4%'),
            marginBottom: hp('2%'),
            ...CrossPlatformUtils.getUnifiedShadow(4),
          }}>
            <Text style={{
              fontSize: wp('5%'),
              fontWeight: 'bold',
              color: designTokens.colors.secondary,
              marginBottom: hp('1%'),
            }}>
              Platform Adaptations
            </Text>
            
            <InfoRow 
              label="Font Scaling" 
              value={`${Platform.OS === 'android' ? '95%' : '100%'}`} 
            />
            <InfoRow 
              label="Shadow Type" 
              value={Platform.OS === 'ios' ? 'Native Shadow' : 'Material Elevation'} 
            />
            <InfoRow 
              label="Border Radius" 
              value={Platform.OS === 'android' ? '90% of iOS' : '100%'} 
            />
            <InfoRow 
              label="Button Height" 
              value={Platform.OS === 'android' ? '+4px' : 'Base'} 
            />
            <InfoRow 
              label="Animation Duration" 
              value={`${CrossPlatformUtils.getAnimationDuration()}ms`} 
            />
          </View>

          {/* Visual Comparison */}
          <View style={{
            backgroundColor: 'white',
            borderRadius: CrossPlatformUtils.getAdaptiveBorderRadius(wp('4%')),
            padding: wp('4%'),
            marginBottom: hp('2%'),
            ...CrossPlatformUtils.getUnifiedShadow(4),
          }}>
            <Text style={{
              fontSize: wp('5%'),
              fontWeight: 'bold',
              color: designTokens.colors.secondary,
              marginBottom: hp('2%'),
            }}>
              Visual Comparison
            </Text>
            
            {/* Buttons */}
            <Text style={{
              fontSize: wp('4%'),
              fontWeight: '600',
              color: designTokens.colors.secondary,
              marginBottom: hp('1%'),
            }}>
              Buttons ({currentPlatform})
            </Text>
            
            <PlatformButton
              title="Primary Button"
              onPress={() => Alert.alert('Button Pressed', `Platform: ${currentPlatform}`)}
              variant="primary"
              style={{ marginBottom: hp('1%') }}
            />
            
            <PlatformButton
              title="Secondary Button"
              onPress={() => Alert.alert('Button Pressed', `Platform: ${currentPlatform}`)}
              variant="secondary"
              style={{ marginBottom: hp('2%') }}
            />

            {/* Text Input */}
            <Text style={{
              fontSize: wp('4%'),
              fontWeight: '600',
              color: designTokens.colors.secondary,
              marginBottom: hp('1%'),
            }}>
              Text Input ({currentPlatform})
            </Text>
            
            <PlatformTextInput
              placeholder="Type something..."
              leftIcon="search"
            />
          </View>

          {/* Typography Scaling */}
          <View style={{
            backgroundColor: 'white',
            borderRadius: CrossPlatformUtils.getAdaptiveBorderRadius(wp('4%')),
            padding: wp('4%'),
            marginBottom: hp('2%'),
            ...CrossPlatformUtils.getUnifiedShadow(4),
          }}>
            <Text style={{
              fontSize: wp('5%'),
              fontWeight: 'bold',
              color: designTokens.colors.secondary,
              marginBottom: hp('2%'),
            }}>
              Typography Scaling
            </Text>
            
            <Text style={{
              fontSize: CrossPlatformUtils.getAdaptiveFontSize(wp('6%')),
              fontWeight: 'bold',
              marginBottom: hp('1%'),
            }}>
              Large Title (Adaptive)
            </Text>
            
            <Text style={{
              fontSize: CrossPlatformUtils.getAdaptiveFontSize(wp('4%')),
              marginBottom: hp('1%'),
            }}>
              Body Text (Adaptive)
            </Text>
            
            <Text style={{
              fontSize: CrossPlatformUtils.getAdaptiveFontSize(wp('3%')),
              color: 'gray',
            }}>
              Caption Text (Adaptive)
            </Text>
          </View>

          {/* Current Values */}
          <View style={{
            backgroundColor: currentPlatform === 'ios' ? '#007AFF' : '#4CAF50',
            borderRadius: CrossPlatformUtils.getAdaptiveBorderRadius(wp('4%')),
            padding: wp('4%'),
            marginBottom: hp('4%'),
            ...CrossPlatformUtils.getUnifiedShadow(4),
          }}>
            <Text style={{
              fontSize: wp('5%'),
              fontWeight: 'bold',
              color: 'white',
              marginBottom: hp('2%'),
              textAlign: 'center',
            }}>
              Current Platform Values
            </Text>
            
            <InfoRow 
              label="Tab Bar Height" 
              value={`${CrossPlatformUtils.getAdaptiveTabBarHeight()}`}
              lightText={true}
            />
            <InfoRow 
              label="Button Height" 
              value={`${CrossPlatformUtils.getAdaptiveButtonHeight(44)}px`}
              lightText={true}
            />
            <InfoRow 
              label="Input Height" 
              value={`${CrossPlatformUtils.getAdaptiveInputHeight(40)}px`}
              lightText={true}
            />
            <InfoRow 
              label="Border Radius" 
              value={`${CrossPlatformUtils.getAdaptiveBorderRadius(16)}px`}
              lightText={true}
            />
            <InfoRow 
              label="Font Scale" 
              value={`${CrossPlatformUtils.getAdaptiveFontSize(16)}px`}
              lightText={true}
            />
          </View>
        </View>
      </ScrollView>
    </PlatformSafeArea>
  );
};

const InfoRow = ({ label, value, lightText = false }) => (
  <View style={{
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: hp('0.5%'),
    borderBottomWidth: 0.5,
    borderBottomColor: lightText ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.1)',
  }}>
    <Text style={{
      fontSize: wp('3.5%'),
      color: lightText ? 'rgba(255,255,255,0.9)' : 'gray',
      fontWeight: '500',
    }}>
      {label}:
    </Text>
    <Text style={{
      fontSize: wp('3.5%'),
      color: lightText ? 'white' : designTokens.colors.secondary,
      fontWeight: 'bold',
    }}>
      {value}
    </Text>
  </View>
);

export default PlatformComparisonDemo;
