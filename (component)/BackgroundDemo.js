import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, SafeAreaView, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import CrossPlatformBackground from './CrossPlatformBackground';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const BackgroundDemo = () => {
  const showAlert = (title, message) => {
    Alert.alert(title, message);
  };

  return (
    <CrossPlatformBackground>
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          
          {/* Header */}
          <View style={{
            padding: wp('5%'),
            alignItems: 'center',
            marginTop: hp('2%'),
          }}>
            <Text style={{
              fontSize: wp('7%'),
              fontWeight: 'bold',
              color: 'white',
              textAlign: 'center',
              marginBottom: hp('1%'),
              textShadowColor: 'rgba(0,0,0,0.3)',
              textShadowOffset: { width: 1, height: 1 },
              textShadowRadius: 3,
            }}>
              Background Demo
            </Text>
            <Text style={{
              fontSize: wp('4%'),
              color: 'rgba(255,255,255,0.9)',
              textAlign: 'center',
            }}>
              Cross-Platform Gradient Background
            </Text>
          </View>

          {/* Platform Info Card */}
          <View style={{
            margin: wp('4%'),
            backgroundColor: 'rgba(255,255,255,0.95)',
            borderRadius: wp('4%'),
            padding: wp('5%'),
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          }}>
            <Text style={{
              fontSize: wp('5%'),
              fontWeight: 'bold',
              color: '#333',
              marginBottom: hp('2%'),
              textAlign: 'center',
            }}>
              Current Platform: REACT NATIVE
            </Text>
            
            <View style={{ marginBottom: hp('1%') }}>
              <Text style={{ fontSize: wp('3.5%'), color: '#666', fontWeight: '600' }}>
                Background Features:
              </Text>
            </View>
            
            {[
              '✅ Full screen coverage',
              '✅ Safe area aware',
              '✅ Status bar compatible',
              '✅ Consistent colors',
              '✅ Smooth gradient',
              '✅ Performance optimized'
            ].map((feature, index) => (
              <Text key={index} style={{
                fontSize: wp('3.5%'),
                color: '#444',
                marginBottom: hp('0.5%'),
                paddingLeft: wp('2%'),
              }}>
                {feature}
              </Text>
            ))}
          </View>

          {/* Gradient Comparison */}
          <View style={{
            margin: wp('4%'),
            backgroundColor: 'rgba(255,255,255,0.95)',
            borderRadius: wp('4%'),
            padding: wp('5%'),
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          }}>
            <Text style={{
              fontSize: wp('5%'),
              fontWeight: 'bold',
              color: '#333',
              marginBottom: hp('2%'),
              textAlign: 'center',
            }}>
              Gradient Colors
            </Text>
            
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginBottom: hp('2%'),
            }}>
              {['#FD501E', '#FF6B35', '#FF8956', '#FFA072'].map((color, index) => (
                <View key={index} style={{
                  width: wp('18%'),
                  height: hp('8%'),
                  backgroundColor: color,
                  borderRadius: wp('2%'),
                  justifyContent: 'center',
                  alignItems: 'center',
                  shadowColor: color,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.4,
                  shadowRadius: 4,
                  elevation: 4,
                }}>
                  <Text style={{
                    fontSize: wp('2.5%'),
                    color: 'white',
                    fontWeight: 'bold',
                    textShadowColor: 'rgba(0,0,0,0.5)',
                    textShadowOffset: { width: 1, height: 1 },
                    textShadowRadius: 2,
                  }}>
                    {color}
                  </Text>
                </View>
              ))}
            </View>
            
            <Text style={{
              fontSize: wp('3%'),
              color: '#666',
              textAlign: 'center',
              fontStyle: 'italic',
            }}>
              Same gradient colors on both iOS and Android
            </Text>
          </View>

          {/* Interactive Buttons */}
          <View style={{
            margin: wp('4%'),
            backgroundColor: 'rgba(255,255,255,0.95)',
            borderRadius: wp('4%'),
            padding: wp('5%'),
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          }}>
            <Text style={{
              fontSize: wp('5%'),
              fontWeight: 'bold',
              color: '#333',
              marginBottom: hp('2%'),
              textAlign: 'center',
            }}>
              Test Interactions
            </Text>
            
            <TouchableOpacity
              style={{
                backgroundColor: '#FD501E',
                borderRadius: wp('3%'),
                padding: wp('4%'),
                marginBottom: hp('1%'),
                shadowColor: '#FD501E',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
                elevation: 4,
              }}
              onPress={() => showAlert('Platform Info', 'Running on React Native')}
            >
              <Text style={{
                color: 'white',
                fontWeight: 'bold',
                textAlign: 'center',
                fontSize: wp('4%'),
              }}>
                Show Platform Info
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={{
                backgroundColor: 'transparent',
                borderWidth: 2,
                borderColor: '#FD501E',
                borderRadius: wp('3%'),
                padding: wp('4%'),
              }}
              onPress={() => showAlert('Background Test', 'Background is working correctly!')}
            >
              <Text style={{
                color: '#FD501E',
                fontWeight: 'bold',
                textAlign: 'center',
                fontSize: wp('4%'),
              }}>
                Test Background
              </Text>
            </TouchableOpacity>
          </View>

          {/* Technical Details */}
          <View style={{
            margin: wp('4%'),
            backgroundColor: 'rgba(0,0,0,0.1)',
            borderRadius: wp('4%'),
            padding: wp('5%'),
            marginBottom: hp('5%'),
          }}>
            <Text style={{
              fontSize: wp('5%'),
              fontWeight: 'bold',
              color: 'white',
              marginBottom: hp('2%'),
              textAlign: 'center',
            }}>
              Technical Details
            </Text>
            
            <Text style={{
              fontSize: wp('3.5%'),
              color: 'rgba(255,255,255,0.9)',
              lineHeight: wp('5%'),
              textAlign: 'center',
            }}>
              This background uses CrossPlatformBackground component that ensures 
              consistent gradient rendering across iOS and Android platforms with 
              proper safe area handling and color accuracy.
            </Text>
          </View>
          
        </ScrollView>
      </SafeAreaView>
    </CrossPlatformBackground>
  );
};

export default BackgroundDemo;
