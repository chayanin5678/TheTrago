import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert } from "react-native";
import * as SecureStore from "expo-secure-store";
import axios from "axios";

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const res = await axios.post("http://localhost:5000/login", { email, password });
      await SecureStore.setItemAsync("token", res.data.token); // 🔐 เก็บ Token อย่างปลอดภัย
      Alert.alert("Login Successful");
      navigation.navigate("Account");
    } catch (err) {
      Alert.alert("Login Failed", err.response?.data?.message || "Error occurred");
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>Email:</Text>
      <TextInput value={email} onChangeText={setEmail} style={{ borderWidth: 1, padding: 10, marginBottom: 10 }} />
      
      <Text>Password:</Text>
      <TextInput value={password} onChangeText={setPassword} secureTextEntry style={{ borderWidth: 1, padding: 10, marginBottom: 10 }} />
      
      <Button title="Login" onPress={handleLogin} />

        {/* ปุ่ม Sign Up ที่จะนำไปหน้า Register */}
        <Button 
        title="Sign Up"
        onPress={() => navigation.navigate("Register")} 
      />
    </View>
  );
};

export default LoginScreen;
