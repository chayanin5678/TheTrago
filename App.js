import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import * as SecureStore from 'expo-secure-store';
import { navigationRef } from './navigationRef';
import { AuthProvider, useAuth } from './AuthContext';
import { designTokens, platformStyles } from './(CSS)/PlatformStyles';
import { CrossPlatformUtils } from './(CSS)/PlatformSpecificUtils';
import PlatformStatusBar from './(component)/PlatformStatusBar';
// Import หน้าต่างๆ
import StartingPointScreen from './StartingPointScreen';
import EndPointScreen from './EndPointScreen';
import SearchFerry from './SearchFerry';
import HomeScreen from './HomeScreen';
import TripDetail from './TripDetail';
import CustomerInfo from './(Screen)/CustomerInfo';
import PaymentScreen from './(Screen)/PaymentScreen';
import ResultScreen from './(Screen)/ResultScreen';
import { CustomerProvider } from './(Screen)/CustomerContext';
import LinkingConfiguration from './(Screen)/linking';
import PromptPayScreen from './(Screen)/PromptPayQR';
//import SplashScreenComponent from './(Screen)/SplashScreenComponent';
import LoginScreen from './(Screen)/LoginScreen';
import RegisterScreen from './(Screen)/RegisterScreen';
import AccountScreen from './(Screen)/AccountScreen';
import Dashboard from './(Screen)/Dashboard';
import ProfileScreen from './(Screen)/ProfileScreen';
import IDCardCameraScreen from './(Screen)/IDCardCameraScreen';
import OCRResultScreen from './(Screen)/OCRResultScreen';
import SplashScreenComponent from './(component)/SplashScreenComponent';
import PopularDestination from './(Screen)/populardestination';
import LocationDetail from './(Screen)/LocationDetail';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AddCardScreen from './(Screen)/AddCardScreen';
import ipAddress from './ipconfig';
import { PromotionProvider } from './PromotionProvider';
import TermsScreen from './(Screen)/TermsScreen';
import PrivacyPolicyScreen from './(Screen)/PrivacyPolicyScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Settings Screen
const SettingsScreen = () => (
  <View style={styles.screen}>
    <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#333' }}>Settings Screen</Text>
  </View>
);

// Booking Screen
const BookingScreen = () => (
  <View style={[styles.screen, { backgroundColor: '#F8FAFC', paddingBottom: 100 }]}>
    <View style={{
      backgroundColor: '#FFFFFF',
      borderRadius: 20,
      padding: 30,
      margin: 20,
      shadowColor: '#FD501E',
      shadowOffset: {
        width: 0,
        height: 10,
      },
      shadowOpacity: 0.1,
      shadowRadius: 20,
      elevation: 10,
      borderWidth: 1,
      borderColor: 'rgba(253, 80, 30, 0.1)',
    }}>
      <View style={{
        alignItems: 'center',
        marginBottom: 20,
      }}>
        <View style={{
          width: 60,
          height: 60,
          borderRadius: 30,
          backgroundColor: 'rgba(253, 80, 30, 0.1)',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 15,
        }}>
          <Icon name="calendar" size={30} color="#FD501E" />
        </View>
        <Text style={{ 
          fontSize: 24, 
          fontWeight: '700', 
          color: '#1F2937',
          marginBottom: 8,
          letterSpacing: 0.5,
        }}>Your Bookings</Text>
        <Text style={{ 
          fontSize: 16, 
          color: '#6B7280',
          textAlign: 'center',
          lineHeight: 24,
        }}>All your booking history and{'\n'}current reservations appear here</Text>
      </View>
      
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
      }}>
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(253, 80, 30, 0.05)',
          borderRadius: 15,
          padding: 15,
          marginRight: 10,
          borderWidth: 1,
          borderColor: 'rgba(253, 80, 30, 0.1)',
        }}>
          <Text style={{
            fontSize: 18,
            fontWeight: '700',
            color: '#FD501E',
            textAlign: 'center',
          }}>2</Text>
          <Text style={{
            fontSize: 12,
            color: '#6B7280',
            textAlign: 'center',
            marginTop: 5,
          }}>Pending</Text>
        </View>
        
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(34, 197, 94, 0.05)',
          borderRadius: 15,
          padding: 15,
          marginLeft: 10,
          borderWidth: 1,
          borderColor: 'rgba(34, 197, 94, 0.1)',
        }}>
          <Text style={{
            fontSize: 18,
            fontWeight: '700',
            color: '#22C55E',
            textAlign: 'center',
          }}>8</Text>
          <Text style={{
            fontSize: 12,
            color: '#6B7280',
            textAlign: 'center',
            marginTop: 5,
          }}>Completed</Text>
        </View>
      </View>
    </View>
  </View>
);

// AppNavigator (ใช้ Stack Navigator)
const AppNavigator = () => (
  <Stack.Navigator initialRouteName="HomeScreen">
    <Stack.Screen name="HomeScreen" component={HomeScreen} options={{ headerShown: false }} />
    <Stack.Screen name="StartingPointScreen" component={StartingPointScreen} options={{ headerShown: false }} />
    <Stack.Screen name="EndPointScreen" component={EndPointScreen} options={{ headerShown: false }} />
    <Stack.Screen name="SearchFerry" component={SearchFerry} options={{ headerShown: false }} />
    <Stack.Screen name="TripDetail" component={TripDetail} options={{ headerShown: false }} />
    <Stack.Screen name="CustomerInfo" component={CustomerInfo} options={{ headerShown: false }} />
    <Stack.Screen name="PaymentScreen" component={PaymentScreen} options={{ headerShown: false }} />
    <Stack.Screen name="AddCardScreen" component={AddCardScreen} options={{ headerShown: false }} />
    <Stack.Screen name="ResultScreen" component={ResultScreen} options={{ headerShown: false }} />
    <Stack.Screen name="PromptPayScreen" component={PromptPayScreen} options={{ headerShown: false }} />
    <Stack.Screen name="PopularDestination" component={PopularDestination} options={{ headerShown: false }} />
    <Stack.Screen name="LocationDetail" component={LocationDetail} options={{ headerShown: false }} />
    <Stack.Screen name="TermsScreen" component={TermsScreen} options={{ headerShown: false }} />
  </Stack.Navigator>
);


// Smart Account Tab Component - ใช้ AuthContext เพื่อจัดการ login state
const AccountTabNavigator = () => {
  const { isLoggedIn, isLoading } = useAuth();
  
  if (isLoading) {
    console.log('AccountTabNavigator is loading...');
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' }}>
        <Text style={{ fontSize: 16, color: '#6B7280' }}>Loading...</Text>
      </View>
    );
  }

  console.log('Rendering AccountTabNavigator with login status:', isLoggedIn ? 'Logged in' : 'Not logged in');

  return (
    <Stack.Navigator 
      key={isLoggedIn ? 'logged-in' : 'logged-out'} // Force re-render when login status changes
      initialRouteName={isLoggedIn ? 'AccountScreen' : 'LoginScreen'}
      screenOptions={{ headerShown: false }}
    >
      {!isLoggedIn ? (
        <>
          <Stack.Screen name="LoginScreen" component={LoginScreen} />
          <Stack.Screen name="RegisterScreen" component={RegisterScreen} />
          <Stack.Screen name="TermsScreen" component={TermsScreen} />
          <Stack.Screen name="PrivacyPolicyScreen" component={PrivacyPolicyScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="AccountScreen" component={AccountScreen} />
          <Stack.Screen name="Dashboard" component={Dashboard} />
          <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
          <Stack.Screen name="IDCardCameraScreen" component={IDCardCameraScreen} />
          <Stack.Screen name="OCRResultScreen" component={OCRResultScreen} />
          <Stack.Screen name="TermsScreen" component={TermsScreen} />
          <Stack.Screen name="PrivacyPolicyScreen" component={PrivacyPolicyScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};


const CustomTabBar = ({ state, descriptors, navigation }) => {
  const [activeAnim] = useState(new Animated.Value(0));

  React.useEffect(() => {
    Animated.spring(activeAnim, {
      toValue: state.index,
      useNativeDriver: false,
      tension: 100,
      friction: 8,
    }).start();
  }, [state.index]);

  return (
    <View style={{
      position: 'absolute',
      bottom: CrossPlatformUtils.getAdaptiveSpacing(Platform.OS === 'ios' ? 25 : 20),
      left: CrossPlatformUtils.getAdaptiveSpacing(Platform.OS === 'ios' ? 20 : 16),
      right: CrossPlatformUtils.getAdaptiveSpacing(Platform.OS === 'ios' ? 20 : 16),
      height: CrossPlatformUtils.getAdaptiveSpacing(Platform.OS === 'ios' ? 70 : 65),
      borderRadius: CrossPlatformUtils.getAdaptiveBorderRadius(Platform.OS === 'ios' ? 35 : 32),
      overflow: 'visible',
    }}>
      {/* Animated Background Slider */}
      <Animated.View
        style={{
          position: 'absolute',
          top: CrossPlatformUtils.getAdaptiveSpacing(Platform.OS === 'ios' ? 15 : 12),
          left: activeAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [15, '65%'],
          }),
          width: '30%',
          height: 50,
          borderRadius: 25,
          backgroundColor: 'rgba(253, 80, 30, 0.15)',
          borderWidth: 2,
          borderColor: 'rgba(253, 80, 30, 0.3)',
        }}
      />
      
      <LinearGradient
        colors={[
          'rgba(255, 255, 255, 0.98)', 
          'rgba(248, 250, 252, 0.95)',
          'rgba(255, 255, 255, 0.98)'
        ]}
        style={{
          flexDirection: 'row',
          height: '100%',
          borderRadius: CrossPlatformUtils.getAdaptiveBorderRadius(Platform.OS === 'ios' ? 35 : 32),
          paddingHorizontal: CrossPlatformUtils.getAdaptiveSpacing(Platform.OS === 'ios' ? 10 : 8),
          paddingVertical: CrossPlatformUtils.getAdaptiveSpacing(Platform.OS === 'ios' ? 5 : 4),
          alignItems: 'center',
          justifyContent: 'space-around',
          borderWidth: Platform.OS === 'ios' ? 1.5 : 1,
          borderColor: 'rgba(253, 80, 30, 0.1)',
          ...CrossPlatformUtils.getUnifiedShadow(8, 0.3),
          shadowOffset: { width: 0, height: 15 },
          shadowOpacity: 0.25,
          shadowRadius: 25,
          elevation: 20,
        }}
      >
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label = options.tabBarLabel !== undefined 
            ? options.tabBarLabel 
            : options.title !== undefined 
            ? options.title 
            : route.name;

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          let iconName;
          switch (route.name) {
            case 'Home':
              iconName = isFocused ? 'home' : 'home-outline';
              break;
            case 'Booking':
              iconName = isFocused ? 'calendar' : 'calendar-outline';
              break;
            case 'Login':
              iconName = isFocused ? 'person-circle' : 'person-circle-outline';
              break;
            default:
              iconName = 'ellipse';
          }

          return (
            <TouchableOpacity
              key={index}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              onPress={onPress}
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 6,
              }}
            >
              <Animated.View
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  transform: [
                    { 
                      scale: isFocused ? 1.15 : 1,
                    },
                    {
                      translateY: isFocused ? -2 : 0,
                    }
                  ],
                }}
              >
                {/* Pulsing Effect for Active Icon */}
                {isFocused && (
                  <View style={{
                    position: 'absolute',
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: 'rgba(253, 80, 30, 0.08)',
                    opacity: 0.8,
                  }} />
                )}
                
                <Icon
                  name={iconName}
                  size={isFocused ? 24 : 20}
                  color={isFocused ? '#FD501E' : '#9CA3AF'}
                  style={{
                    textShadowColor: isFocused ? 'rgba(253, 80, 30, 0.5)' : 'transparent',
                    textShadowOffset: { width: 0, height: 1 },
                    textShadowRadius: 3,
                    zIndex: 2,
                  }}
                />

                {/* Badge */}
                {options.tabBarBadge && (
                  <Animated.View
                    style={{
                      position: 'absolute',
                      top: -6,
                      right: -6,
                      backgroundColor: '#FF3B30',
                      borderRadius: 10,
                      minWidth: 18,
                      height: 18,
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderWidth: 2,
                      borderColor: '#FFFFFF',
                      shadowColor: '#FF3B30',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.5,
                      shadowRadius: 4,
                      elevation: 5,
                      transform: [{ scale: isFocused ? 1.1 : 1 }],
                    }}
                  >
                    <Text style={{
                      color: '#FFFFFF',
                      fontSize: 8,
                      fontWeight: '900',
                      letterSpacing: 0.3,
                    }}>{options.tabBarBadge}</Text>
                  </Animated.View>
                )}

              </Animated.View>

              {/* Label with Animation */}
              <Animated.View
                style={{
                  marginTop: isFocused ? 6 : 4,
                  opacity: isFocused ? 1 : 0.7,
                  transform: [{ scale: isFocused ? 1 : 0.9 }],
                }}
              >
                <Text style={{
                  fontSize: isFocused ? 9 : 8,
                  fontWeight: isFocused ? '800' : '600',
                  color: isFocused ? '#FD501E' : '#9CA3AF',
                  textAlign: 'center',
                  letterSpacing: 0.2,
                  textShadowColor: isFocused ? 'rgba(253, 80, 30, 0.2)' : 'transparent',
                  textShadowOffset: { width: 0, height: 1 },
                  textShadowRadius: 1,
                }}>
                  {label}
                </Text>
              </Animated.View>
            </TouchableOpacity>
          );
        })}
      </LinearGradient>

      {/* Bottom Glow Effect */}
      <LinearGradient
        colors={['transparent', 'rgba(253, 80, 30, 0.1)', 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{
          position: 'absolute',
          bottom: -2,
          left: 0,
          right: 0,
          height: 3,
          borderRadius: 1.5,
        }}
      />
    </View>
  );
};
const MainNavigator = () => {
  const { isLoggedIn } = useAuth();
  
  return (
    <Tab.Navigator
      initialRouteName="Home"
      tabBar={props => <CustomTabBar {...props} />}
      screenListeners={({ route }) => ({
        tabPress: (e) => {
          if (route.name === 'Home') {
            e.preventDefault();
            if (navigationRef.isReady()) {
              navigationRef.navigate('Home', { screen: 'HomeScreen' });
            }
          }
        }
      })}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={AppNavigator} 
        options={{ 
          title: 'Home',
          tabBarBadge: null,
        }} 
      />
      <Tab.Screen 
        name="Login" 
        component={AccountTabNavigator} 
        options={{ 
          title: isLoggedIn ? 'Account' : 'Login',
        }} 
      />
    </Tab.Navigator>
  );
};

export default function App() {
  const [fontLoaded, setFontLoaded] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [promotionData, setPromotionData] = useState([]);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Prevent the splash screen from auto-hiding
        await SplashScreen.preventAutoHideAsync();

        // Load fonts
        await Font.loadAsync({
          'Domestos Sans Normal': require('./assets/fonts/Domestos SansNormal.ttf'),
          'Lilita One': require('./assets/fonts/LilitaOne-Regular.ttf'),
        });
        
        setFontLoaded(true);

        // Hide native splash screen after fonts are loaded
        setTimeout(() => {
          SplashScreen.hideAsync();
        }, 1000);

        // Load promotion data
        fetch(`${ipAddress}/promotion`)
          .then((res) => res.json())
          .then((data) => {
            if (Array.isArray(data.data)) {
              setPromotionData(data.data);
            }
          })
          .catch((error) => {
            console.warn('Error loading promotion data:', error);
          });

      } catch (error) {
        console.warn('Error during app initialization:', error);
        setFontLoaded(true); // Fallback to continue app loading
      }
    };

    initializeApp();
  }, []);

  // App is ready when fonts are loaded and splash animation is complete
  const isReady = fontLoaded && !showSplash;

  const handleSplashEnd = () => {
    console.log('Splash screen animation ended');
    // Add small delay to ensure navigation is ready
    setTimeout(() => {
      setShowSplash(false);
    }, 200);
  };

  return (
    <AuthProvider>
      <PromotionProvider>
        {!isReady ? (
          <SplashScreenComponent onAnimationEnd={handleSplashEnd} />
        ) : (
          <NavigationContainer linking={LinkingConfiguration} ref={navigationRef}>
            <CustomerProvider>
              <MainNavigator />
            </CustomerProvider>
          </NavigationContainer>
        )}
      </PromotionProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: designTokens.colors.background,
  },
  customButtonContainer: {
    top: CrossPlatformUtils.getAdaptiveSpacing(Platform.OS === 'ios' ? -10 : -8),
    justifyContent: 'center',
    alignItems: 'center',
  },
  customButton: {
    width: CrossPlatformUtils.getAdaptiveSpacing(Platform.OS === 'ios' ? 65 : 60),
    height: CrossPlatformUtils.getAdaptiveSpacing(Platform.OS === 'ios' ? 65 : 60),
    borderRadius: CrossPlatformUtils.getAdaptiveBorderRadius(Platform.OS === 'ios' ? 32.5 : 30),
    backgroundColor: designTokens.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    ...CrossPlatformUtils.getUnifiedShadow(8, 0.3),
  },
  tabBarContainer: {
    paddingBottom: CrossPlatformUtils.getAdaptiveSpacing(Platform.OS === 'ios' ? 110 : 100),
  },
  premiumContainer: {
    backgroundColor: designTokens.colors.background,
    borderRadius: CrossPlatformUtils.getAdaptiveBorderRadius(Platform.OS === 'ios' ? 25 : 20),
    padding: 25,
    margin: 20,
    shadowColor: '#FD501E',
    shadowOffset: {
      width: 0,
      height: 15,
    },
    shadowOpacity: 0.15,
    shadowRadius: 25,
    elevation: 15,
    borderWidth: 1,
    borderColor: 'rgba(253, 80, 30, 0.08)',
  },
  premiumText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    letterSpacing: 0.5,
  },
  premiumSubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    lineHeight: 20,
  },
});