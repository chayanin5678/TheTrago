import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { View, Text, StyleSheet, TouchableOpacity, Animated, ScrollView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Font from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';
import Entypo from '@expo/vector-icons/Entypo';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import AntDesign from '@expo/vector-icons/AntDesign';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import * as SplashScreen from 'expo-splash-screen';
import * as SecureStore from 'expo-secure-store';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { navigationRef } from './src/config/navigationRef';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { LanguageProvider, useLanguage } from './src/screens/Screen/LanguageContext';
import NotificationService from './src/services/NotificationService';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import หน้าต่างๆ
import StartingPointScreen from './src/screens/StartingPointScreen';
import EndPointScreen from './src/screens/EndPointScreen';
import SearchFerry from './src/screens/SearchFerry';
import ToursScreen from './src/screens/ToursScreen';
import HomeScreen from './src/screens/HomeScreen';
import TripDetail from './src/screens/TripDetail';
import TourDetailScreen from './src/screens/TourDetailScreen';
import SearchResultsScreen from './src/screens/SearchResultsScreen';
import CustomerInfo from './src/screens/Screen/CustomerInfo';
import PaymentScreen from './src/screens/Screen/PaymentScreen';
import PaymentTourScreen from './src/screens/Screen/PaymentTourScreen';
import ResultScreen from './src/screens/Screen/ResultScreen';
import TourContactScreen from './src/screens/Screen/TourContactScreen';
import { CustomerProvider } from './src/screens/Screen/CustomerContext';
import LinkingConfiguration from './src/screens/Screen/linking';
import PromptPayScreen from './src/screens/Screen/PromptPayQR';
//import SplashScreenComponent from './src/screens/Screen/SplashScreenComponent';
import LoginScreen from './src/screens/Screen/LoginScreen';
import ForgotPasswordScreen from './src/screens/Screen/ForgotPasswordScreen';
import OTPVerificationScreen from './src/screens/Screen/OTPVerificationScreen';
import RegisterScreen from './src/screens/Screen/RegisterScreen';
import AccountScreen from './src/screens/Screen/AccountScreen';
import Dashboard from './src/screens/Screen/Dashboard';
import ProfileScreen from './src/screens/Screen/ProfileScreen';
import IDCardCameraScreen from './src/screens/Screen/IDCardCameraScreen';
import BankVerificationScreen from './src/screens/Screen/BankVerificationScreen';
import OCRResultScreen from './src/screens/Screen/OCRResultScreen';
import SplashScreenComponent from './src/components/component/SplashScreenComponent';
import PopularDestination from './src/screens/Screen/populardestination';
import LocationDetail from './src/screens/Screen/LocationDetail';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AddCardScreen from './src/screens/Screen/AddCardScreen';
import ipAddress from './src/config/ipconfig';
import { PromotionProvider } from './src/contexts/PromotionProvider';
import TermsScreen from './src/screens/Screen/TermsScreen';
import PrivacyPolicyScreen from './src/screens/Screen/PrivacyPolicyScreen';
import ContactScreen from './src/screens/Screen/ContactScreen';
import FAQScreen from './src/screens/Screen/FAQScreen';
import BookingScreen from './src/screens/Screen/BookingScreen';
import EditBookingScreen from './src/screens/Screen/EditBookingScreen';
import DeleteProfileScreen from './src/screens/Screen/DeleteProfileScreen';
import AffiliateScreen from './src/screens/Screen/AffiliateScreen';
import TheTragoWebViewScreen from './src/screens/Screen/TheTragoWebViewScreen';
import EarningsScreen from './src/screens/Screen/EarningsScreen';
import BookingAffiliateScreen from './src/screens/Screen/BookingAffiliateScreen';
import OperatorDetailScreen from './src/screens/Screen/OperatorDetailScreen';
import AllOperatorsScreen from './src/screens/Screen/AllOperatorsScreen';


const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Settings Screen
const SettingsScreen = () => {
  const { t } = useLanguage();
  
  return (
    <View style={styles.screen}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#333' }}>{t('settingsScreen')}</Text>
    </View>
  );
};

// AppNavigator (ใช้ Stack Navigator)
const AppNavigator = () => (
  <Stack.Navigator initialRouteName="HomeScreen">
    <Stack.Screen name="HomeScreen" component={HomeScreen} options={{ headerShown: false }} />
    <Stack.Screen name="StartingPointScreen" component={StartingPointScreen} options={{ headerShown: false }} />
    <Stack.Screen name="EndPointScreen" component={EndPointScreen} options={{ headerShown: false }} />
    <Stack.Screen name="SearchFerry" component={SearchFerry} options={{ headerShown: false }} />
  <Stack.Screen name="ToursScreen" component={ToursScreen} options={{ headerShown: false }} />
  <Stack.Screen name="SearchResults" component={SearchResultsScreen} options={{ headerShown: false }} />
    <Stack.Screen name="TripDetail" component={TripDetail} options={{ headerShown: false }} />
      <Stack.Screen name="TourDetailNew" component={TourDetailScreen} options={{ headerShown: false }} />
    <Stack.Screen name="TourContact" component={TourContactScreen} options={{ headerShown: false }} />
    <Stack.Screen name="CustomerInfo" component={CustomerInfo} options={{ headerShown: false }} />
    <Stack.Screen name="PaymentScreen" component={PaymentScreen} options={{ headerShown: false }} />
  <Stack.Screen name="PaymentTour" component={PaymentTourScreen} options={{ headerShown: false }} />
    <Stack.Screen name="AddCardScreen" component={AddCardScreen} options={{ headerShown: false }} />
    <Stack.Screen name="ResultScreen" component={ResultScreen} options={{ headerShown: false }} />
    <Stack.Screen name="PromptPayScreen" component={PromptPayScreen} options={{ headerShown: false }} />
    <Stack.Screen name="PopularDestination" component={PopularDestination} options={{ headerShown: false }} />
    <Stack.Screen name="LocationDetail" component={LocationDetail} options={{ headerShown: false }} />
    <Stack.Screen name="IDCardCameraScreen" component={IDCardCameraScreen} options={{ headerShown: false }} />
    <Stack.Screen name="BankVerificationScreen" component={BankVerificationScreen} options={{ headerShown: false }} />
    <Stack.Screen name="TermsScreen" component={TermsScreen} options={{ headerShown: false }} />
    <Stack.Screen name="OperatorDetail" component={OperatorDetailScreen} options={{ headerShown: false }} />
    <Stack.Screen name="AllOperators" component={AllOperatorsScreen} options={{ headerShown: false }} />
  </Stack.Navigator>
);


// BookingNavigator (ใช้ Stack Navigator)
const BookingNavigator = () => (
  <Stack.Navigator initialRouteName="BookingScreenMain">
    <Stack.Screen name="BookingScreenMain" component={BookingScreen} options={{ headerShown: false }} />
    <Stack.Screen name="EditBookingScreen" component={EditBookingScreen} options={{ headerShown: false }} />
    <Stack.Screen name="SearchFerry" component={SearchFerry} options={{ headerShown: false }} />
    <Stack.Screen name="StartingPointScreen" component={StartingPointScreen} options={{ headerShown: false }} />
    <Stack.Screen name="EndPointScreen" component={EndPointScreen} options={{ headerShown: false }} />
    <Stack.Screen name="TripDetail" component={TripDetail} options={{ headerShown: false }} />
    <Stack.Screen name="CustomerInfo" component={CustomerInfo} options={{ headerShown: false }} />
    <Stack.Screen name="PaymentScreen" component={PaymentScreen} options={{ headerShown: false }} />
  <Stack.Screen name="PaymentTour" component={PaymentTourScreen} options={{ headerShown: false }} />
    <Stack.Screen name="AddCardScreen" component={AddCardScreen} options={{ headerShown: false }} />
    <Stack.Screen name="ResultScreen" component={ResultScreen} options={{ headerShown: false }} />
    <Stack.Screen name="PromptPayScreen" component={PromptPayScreen} options={{ headerShown: false }} />
  </Stack.Navigator>
);


// Smart Account Tab Component - ใช้ AuthContext เพื่อจัดการ login state
const AccountTabNavigator = () => {
  const { isLoggedIn, isLoading } = useAuth();
  const { t } = useLanguage();
  
  if (isLoading) {
    console.log('AccountTabNavigator is loading...');
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' }}>
        <Text style={{ fontSize: 16, color: '#6B7280' }}>{t('loading')}</Text>
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
          <Stack.Screen name="ForgotPasswordScreen" component={ForgotPasswordScreen} />
          <Stack.Screen name="OTPVerificationScreen" component={OTPVerificationScreen} />
          <Stack.Screen name="RegisterScreen" component={RegisterScreen} />
          <Stack.Screen name="TermsScreen" component={TermsScreen} />
          <Stack.Screen name="PrivacyPolicyScreen" component={PrivacyPolicyScreen} />
          <Stack.Screen name="ContactScreen" component={ContactScreen} />
          <Stack.Screen name="FAQScreen" component={FAQScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="AccountScreen" component={AccountScreen} />
          <Stack.Screen name="Dashboard" component={Dashboard} />
          <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
          <Stack.Screen name="IDCardCameraScreen" component={IDCardCameraScreen} />
          <Stack.Screen name="BankVerificationScreen" component={BankVerificationScreen} />
          <Stack.Screen name="OCRResultScreen" component={OCRResultScreen} />
          <Stack.Screen name="TermsScreen" component={TermsScreen} />
          <Stack.Screen name="PrivacyPolicyScreen" component={PrivacyPolicyScreen} />
          <Stack.Screen name="ContactScreen" component={ContactScreen} />
          <Stack.Screen name="FAQScreen" component={FAQScreen} />
          <Stack.Screen name="DeleteProfile" component={DeleteProfileScreen} />
          <Stack.Screen name="EarningsScreen" component={EarningsScreen} />
          <Stack.Screen name="AffiliateScreen" component={AffiliateScreen} />
          <Stack.Screen name="BookingAffiliateScreen" component={BookingAffiliateScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};


const CustomTabBar = ({ state, descriptors, navigation }) => {
  const [activeAnim] = useState(new Animated.Value(0));
  const [isVisible, setIsVisible] = useState(true);
  const translateY = React.useRef(new Animated.Value(0)).current;
  const lastScrollY = React.useRef(0);

  React.useEffect(() => {
    Animated.spring(activeAnim, {
      toValue: state.index,
      useNativeDriver: false,
      tension: 100,
      friction: 8,
    }).start();
  }, [state.index]);

  // Setup global visibility control
  React.useEffect(() => {
    const TAB_BAR_HEIGHT = Platform.OS === 'ios' ? 80 : 65;
    
    // Set up global function to control visibility
    global.setTabBarVisible = (visible) => {
      setIsVisible(visible);
      Animated.spring(translateY, {
        toValue: visible ? 0 : TAB_BAR_HEIGHT,
        useNativeDriver: true,
        tension: 100,
        friction: 10,
      }).start();
    };
    
    // Initialize global state
    global.isTabBarVisible = isVisible;

    // Store translateY globally
    global.tabBarTranslateY = translateY;
    
    // Global scroll handler
    global.handleTabBarScroll = (scrollY) => {
      if (!global.isTabBarVisible) return; // Don't handle scroll if manually hidden
      
      const diff = scrollY - lastScrollY.current;

      // Scroll down - hide tab bar
      if (diff > 5 && scrollY > 50) {
        Animated.spring(translateY, {
          toValue: TAB_BAR_HEIGHT,
          useNativeDriver: true,
          tension: 100,
          friction: 10,
        }).start();
      }
      // Scroll up - show tab bar
      else if (diff < -5) {
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 10,
        }).start();
      }

      lastScrollY.current = scrollY;
    };

    return () => {
      global.tabBarTranslateY = null;
      global.handleTabBarScroll = null;
      global.setTabBarVisible = null;
      global.isTabBarVisible = true;
    };
  }, [translateY]);
  
  // Update global state when visibility changes
  React.useEffect(() => {
    global.isTabBarVisible = isVisible;
  }, [isVisible]);

  return (
    <Animated.View style={{
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: Platform.OS === 'ios' ? 80 : 65,
      backgroundColor: '#FFFFFF',
      borderTopWidth: 1,
      borderTopColor: '#E5E5E5',
      paddingBottom: Platform.OS === 'ios' ? 20 : 5,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: -1,
      },
      shadowOpacity: 0.05,
      shadowRadius: 3,
      elevation: 8,
      transform: [{ translateY }],
    }}>
      <View style={{
        flexDirection: 'row',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingHorizontal: 0,
      }}>
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
          // Simple and clean like Facebook - Orange for active
          let iconColor = isFocused ? '#FF6B35' : '#65676B';
          let textColor = isFocused ? '#FF6B35' : '#65676B';
          
          switch (route.name) {
            case 'Home':
              iconName = isFocused ? 'home' : 'home-outline';
              break;
            case 'Booking':
              iconName = isFocused ? 'calendar' : 'calendar-outline';
              break;
            case 'Login':
              iconName = isFocused ? 'person' : 'person-outline';
              break;
            case 'Web':
              iconName = isFocused ? 'globe' : 'globe-outline';
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
              activeOpacity={0.6}
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                position: 'relative',
              }}
            >
              {/* Top indicator bar - Simple Facebook style */}
              {isFocused && (
                <View style={{
                  position: 'absolute',
                  top: -1,
                  left: 0,
                  right: 0,
                  height: 3,
                  backgroundColor: '#FF6B35',
                }} />
              )}
              
              {/* Simple icon and text - Facebook style */}
              <View style={{
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Icon
                  name={iconName}
                  size={26}
                  color={iconColor}
                />
                
                <Text style={{
                  fontSize: 10,
                  fontWeight: '400',
                  color: textColor,
                  textAlign: 'center',
                  marginTop: 4,
                }}>
                  {label}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </Animated.View>
  );
};
const MainNavigator = () => {
  const { isLoggedIn } = useAuth();
  const { t, selectedLanguage } = useLanguage();
  
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
        sceneContainerStyle: {
          paddingBottom: Platform.OS === 'ios' ? 80 : 65,
        },
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={AppNavigator} 
        options={{ 
          title: t('home'),
          tabBarBadge: null,
        }} 
      />
      <Tab.Screen 
        name="Booking" 
        component={BookingNavigator} 
        options={{ 
          title: selectedLanguage === 'th' ? 'ตั๋ว' : 'Booking',
        }} 
      />
        {/* <Tab.Screen 
    name="Web"                                  // ✅ แท็บใหม่
    component={TheTragoWebViewScreen}           // ✅ ใช้หน้าจอ WebView
    options={{ title: t('web') || 'Web' }}      // ✅ ปรับชื่อจากภาษาที่เลือกได้
  /> */}
      <Tab.Screen 
        name="Login" 
        component={AccountTabNavigator} 
        options={{ 
          title: isLoggedIn ? t('account') : t('login'),
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

        // ตั้งค่า notification system
        setupNotifications();

        // Load fonts with better error handling
        try {
          await Font.loadAsync({
            // Vector icon fonts (ensure icons render correctly)
            ...Ionicons.font,
            ...MaterialIcons.font,
            ...Entypo.font,
            ...FontAwesome.font,
            ...AntDesign.font,
            ...FontAwesome5.font,
            // Custom app fonts
            'Domestos Sans Normal': require('./assets/fonts/Domestos SansNormal.ttf'),
            'Lilita One': require('./assets/fonts/LilitaOne-Regular.ttf'),
          });
          // Debug: confirm icon font keys are available
          try {
            console.log('Icon fonts loaded: Ionicons=', !!Ionicons.font, 'MaterialIcons=', !!MaterialIcons.font, 'Entypo=', !!Entypo.font, 'FontAwesome=', !!FontAwesome.font, 'AntDesign keys sample=', Object.keys(AntDesign.font || {}).slice(0,5));
          } catch (e) {
            console.warn('Icon font logging failed', e);
          }
          console.log('Fonts loaded successfully');
        } catch (fontError) {
          console.warn('Font loading failed:', fontError);
          // Continue without custom fonts
        }
        
        setFontLoaded(true);

        // Hide native splash screen after fonts are loaded
        setTimeout(() => {
          SplashScreen.hideAsync();
        }, 1000);

        // Load promotion data with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        try {
          const response = await fetch(`${ipAddress}/promotion`, {
            signal: controller.signal,
            timeout: 10000
          });
          clearTimeout(timeoutId);
          
          if (response.ok) {
            const data = await response.json();
            if (Array.isArray(data.data)) {
              setPromotionData(data.data);
            }
          } else {
            console.warn('Promotion API response not ok:', response.status);
          }
        } catch (networkError) {
          clearTimeout(timeoutId);
          console.warn('Error loading promotion data:', networkError.message);
          // Continue without promotion data
        }

      } catch (error) {
        console.warn('Error during app initialization:', error);
        setFontLoaded(true); // Fallback to continue app loading
      }
    };

    initializeApp();
  }, []);

  // ตั้งค่าระบบ notification
  const setupNotifications = async () => {
    try {
      // ขอสิทธิ์และลงทะเบียน push token (เก็บไว้ local อย่างเดียว)
      const token = await NotificationService.registerForPushNotificationsAsync();
      
      if (token) {
        console.log('✅ Push notification token registered:', token);
        // หมายเหตุ: token จะถูกเก็บไว้ใน AsyncStorage อัตโนมัติ
        // ไม่บันทึกไปยัง backend ตามที่ร้องขอ
      }

      // ตั้งค่า notification listeners
      NotificationService.setupNotificationListeners(
        // เมื่อได้รับ notification ขณะเปิดแอป
        (notification) => {
          console.log('📩 Received notification:', notification);
          const { type, booking_code } = notification.request.content.data || {};
          
          // สามารถทำอะไรต่อได้ เช่น refresh data, แสดง alert
        },
        // เมื่อผู้ใช้กด notification
        (response) => {
          console.log('👆 Notification tapped:', response);
          const { type, booking_code } = response.notification.request.content.data || {};
          
          if (type === 'booking_update' && booking_code) {
            // Navigate to booking detail
            if (navigationRef.isReady()) {
              navigationRef.navigate('Booking', {
                screen: 'EditBookingScreen',
                params: { bookingCode: booking_code }
              });
            }
          }
        }
      );
    } catch (error) {
      console.error('❌ Error setting up notifications:', error);
    }
  };

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
    <SafeAreaProvider>
      <LanguageProvider>
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
      </LanguageProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  customButtonContainer: {
    top: -10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  customButton: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
    backgroundColor: '#FD501E',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FD501E',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  tabBarContainer: {
    paddingBottom: 110, // Increased padding for floating tab bar to prevent overlap
  },
  premiumContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
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