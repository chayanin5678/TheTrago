import React, { useState, useEffect } from "react";
import { View, Text, Button, Alert } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import LoginScreen from "./LoginScreen";
import RegisterScreen from "./RegisterScreen";

// หน้า Home
const Account = ({ navigation }) => {
  const [userData, setUserData] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkLoginStatus = async () => {
      const token = await SecureStore.getItemAsync("userToken");

      if (!token) {
        setIsLoggedIn(false);
        return;
      }

      try {
        const response = await axios.get("http://your-api-url/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUserData(response.data);
        setIsLoggedIn(true);
      } catch (error) {
        Alert.alert("Error", "Failed to fetch user data");
        setIsLoggedIn(false);
      }
    };

    checkLoginStatus();
  }, []);

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync("userToken");
    setIsLoggedIn(false);
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      {isLoggedIn ? (
        <>
          <Text>Welcome to the Home Screen!</Text>
          <Text>You are logged in as {userData?.email}</Text>
          <Button title="Logout" onPress={handleLogout} />
        </>
      ) : (
        <>
          <Text>Loading...</Text>
          <Button title="Go to Login" onPress={() => navigation.navigate("Login")} />
          <Button title="Go to Register" onPress={() => navigation.navigate("Register")} />
        </>
      )}
    </View>
  );
};


const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Account">
        <Stack.Screen name="Account" component={Account} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
