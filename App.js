import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { navigationRef } from './navigationRef';
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
import QRCodeScannerScreen from './QRCodeScannerScreen';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AddCardScreen from './(Screen)/AddCardScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();



// Settings Screen
const SettingsScreen = () => (
  <View style={styles.screen}>
    <Text>Settings Screen</Text>
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
    <Stack.Screen name="QRCodeScannerScreen" component={QRCodeScannerScreen} options={{ headerShown: false }} />
  </Stack.Navigator>
);


// ลบ NavigationContainer ใน Loginnavigator
const Loginnavigator = () => (
  <Stack.Navigator initialRouteName="AccountScreen">
    <Stack.Screen name="LoginScreen" component={LoginScreen} options={{ headerShown: false }} />
    <Stack.Screen name="AccountScreen" component={AccountScreen} options={{ headerShown: false }} />
    <Stack.Screen name="RegisterScreen" component={RegisterScreen} options={{ headerShown: false }} />
    <Stack.Screen name="Dashboard" component={Dashboard} options={{ headerShown: false }} />
    <Stack.Screen name="ProfileScreen" component={ProfileScreen} options={{ headerShown: false }} />
    <Stack.Screen name="IDCardCameraScreen" component={IDCardCameraScreen} options={{ headerShown: false }} />
    <Stack.Screen name="OCRResultScreen" component={OCRResultScreen} options={{ headerShown: false }} />
  </Stack.Navigator>
);


const CustomPostButton = ({ children, onPress }) => (
  <TouchableOpacity
    style={styles.customButtonContainer}
    onPress={onPress}
  >
    <View style={styles.customButton}>
      <View style={{ transform: [{ translateY: 6 }] }}>
        {children}
      </View>
    </View>
  </TouchableOpacity>
);
const MainNavigator = () => {
  return (
    <Tab.Navigator
      screenListeners={({ route }) => ({
        tabPress: (e) => {
          if (route.name === 'Home') {
            e.preventDefault(); // ป้องกัน default behavior
            if (navigationRef.isReady()) {
              navigationRef.navigate('Home', { screen: 'HomeScreen' });
            }
          }
        }
      })}
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarStyle: {
          height: 70,
        },
        tabBarLabelStyle: {
          fontSize: 12,
        },
        tabBarIcon: ({ focused, size, color }) => {
          if (route.name === 'Post') {
            return (
              <MaterialCommunityIcons name="qrcode-scan" size={size || 30} color={'#fff'} />
            );
          }
          let iconName;
          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Messages':
              iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
              break;
            case 'Trips':
              iconName = focused ? 'reader' : 'reader-outline';
              break;
            case 'Login':
              iconName = focused ? 'person-circle' : 'person-circle-outline';
              break;
            default:
              iconName = 'ellipse';
          }
          return (
            <Icon
              name={iconName}
              size={size}
              color={focused ? '#FD501E' : 'gray'}
            />
          );
        },
        tabBarActiveTintColor: '#FD501E',
      })}
    >
      <Tab.Screen name="Home" component={AppNavigator} options={{ title: 'Home' }} />
      {/* <Tab.Screen name="Messages" component={SettingsScreen} options={{ title: 'Message' }} /> */}
      <Tab.Screen
        name="Post"
        component={QRCodeScannerScreen}
        options={{
          title: '',
          tabBarButton: (props) => <CustomPostButton {...props} />,
        }}
      />
      {/* <Tab.Screen name="Trips" component={SettingsScreen} options={{ title: 'Booking' }} /> */}
      <Tab.Screen name="Login" component={Loginnavigator} options={{ title: 'Login' }} />
    </Tab.Navigator>
  );
};

export default function App() {

  const [fontLoaded, setFontLoaded] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    SplashScreen.preventAutoHideAsync();
    setTimeout(() => SplashScreen.hideAsync(), 1000);
  }, []);

  useEffect(() => {
    const loadFonts = async () => {
      await Font.loadAsync({
        'Domestos Sans Normal': require('./assets/fonts/Domestos SansNormal.ttf'),
        'Lilita One': require('./assets/fonts/LilitaOne-Regular.ttf'),
      });
      setFontLoaded(true);
    };
    loadFonts();
  }, []);

  // ✅ Hook ทั้งหมดอยู่ด้านบนก่อน return
  const isReady = fontLoaded && !showSplash;
  useEffect(() => {
    // Prevent the Splash Screen from auto-hiding
    SplashScreen.preventAutoHideAsync();

    // Set a timeout to hide the splash screen after a specific time (e.g., 3 seconds)
    setTimeout(() => {
      SplashScreen.hideAsync();
    }, 3000); // 3000 ms = 3 seconds
  }, []);

  useEffect(() => {
    const loadFonts = async () => {
      await Font.loadAsync({
        'Domestos Sans Normal': require('./assets/fonts/Domestos SansNormal.ttf'),
        'Lilita One': require('./assets/fonts/LilitaOne-Regular.ttf'),
      });
      setFontLoaded(true);
    };

    loadFonts();
  }, []);

  return (
     <>
      {!isReady ? (
        <SplashScreenComponent onAnimationEnd={() => setShowSplash(false)} />
      ) : (
        <NavigationContainer linking={LinkingConfiguration} ref={navigationRef}>
          <CustomerProvider>
            <MainNavigator />
          </CustomerProvider>
        </NavigationContainer>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
  },
});