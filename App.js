import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/Ionicons';
import { View, Text, StyleSheet } from 'react-native';

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
    <Stack.Screen name="ResultScreen" component={ResultScreen} options={{ headerShown: false }} />
  </Stack.Navigator>
);

// MainNavigator (ใช้ Bottom Tab Navigator)
const MainNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;
        if (route.name === 'Home') {
          iconName = focused ? 'home' : 'home-outline';
        } else if (route.name === 'Settings') {
          iconName = focused ? 'settings' : 'settings-outline';
        }
        return <Icon name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#FD501E',
      tabBarInactiveTintColor: 'gray',
    })}
  >
    <Tab.Screen
      name="Home"
      options={{ headerShown: false }}
      component={AppNavigator}  // ใช้ Stack Navigator ที่รวมทุกหน้าหลัก
    />
    <Tab.Screen name="Settings" component={SettingsScreen} />
  </Tab.Navigator>
);

export default function App() {
  return (
    <NavigationContainer linking={LinkingConfiguration}>  
      <CustomerProvider>
        <MainNavigator />
      </CustomerProvider>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
