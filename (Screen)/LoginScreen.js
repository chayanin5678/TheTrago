import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { FontAwesome } from '@expo/vector-icons';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign In</Text>
      <Text style={styles.subtitle}>
        Don't have an account? <Text style={styles.link}>Create account</Text>
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />

      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Password"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Icon name={showPassword ? 'eye' : 'eye-off'} size={20} color="#777" />
        </TouchableOpacity>
      </View>

      <View style={styles.row}>
        <View style={styles.checkboxContainer}>
          <Icon name="checkbox-outline" size={20} color="#FD501E" />
          <Text style={styles.rememberText}> Remember me</Text>
        </View>
        <Text style={styles.forgotText}>Forgot your password</Text>
      </View>

      <TouchableOpacity style={styles.signInButton}>
        <Text style={styles.signInText}>Sign In</Text>
      </TouchableOpacity>

      <View style={styles.dividerContainer}>
        <View style={styles.divider} />
        <Text style={styles.orText}>Or sign in with</Text>
        <View style={styles.divider} />
      </View>

      <TouchableOpacity style={styles.socialButton}>
        <FontAwesome name="google" size={20} color="#EA4335" />
        <Text style={styles.socialText}> Sign in with Google</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.socialButton}>
        <FontAwesome name="facebook" size={20} color="#3b5998" />
        <Text style={styles.socialText}> Sign in with Facebook</Text>
      </TouchableOpacity>

      <Text style={styles.policyText}>
        By continuing, you agree to The Tragos' <Text style={styles.link}>Terms of Use</Text> and <Text style={styles.link}>Privacy Policy</Text>.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    color: '#555',
    marginBottom: 20,
  },
  link: {
    color: '#5A31D1',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  passwordContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
  },
  row: {
    marginVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rememberText: {
    fontSize: 14,
    color: '#333',
  },
  forgotText: {
    color: '#5A31D1',
    fontSize: 14,
  },
  signInButton: {
    backgroundColor: '#FD501E',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
  },
  signInText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 14,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#ccc',
  },
  orText: {
    marginHorizontal: 10,
    color: '#777',
  },
  socialButton: {
    backgroundColor: '#fdf0ec',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  socialText: {
    marginLeft: 8,
    fontSize: 16,
  },
  policyText: {
    marginTop: 20,
    color: '#777',
    fontSize: 12,
    textAlign: 'center',
  },
});
