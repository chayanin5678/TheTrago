import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkLoginStatus = async () => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      const loginStatus = !!token;
      console.log('AuthContext: Token check result:', token ? 'Token found' : 'No token', 'Login status:', loginStatus);
      setIsLoggedIn(loginStatus);
      setIsLoading(false);
      return loginStatus;
    } catch (error) {
      console.warn('AuthContext: Error checking login status:', error);
      setIsLoggedIn(false);
      setIsLoading(false);
      return false;
    }
  };

  const login = async (token) => {
    try {
      await SecureStore.setItemAsync('userToken', token);
      console.log('AuthContext: User logged in, token saved');
      setIsLoggedIn(true);
      setIsLoading(false);
    } catch (error) {
      console.warn('AuthContext: Error during login:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await SecureStore.deleteItemAsync('userToken');
      console.log('AuthContext: User logged out, token removed');
      setIsLoggedIn(false);
      setIsLoading(false);
    } catch (error) {
      console.warn('AuthContext: Error during logout:', error);
      throw error;
    }
  };

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const value = {
    isLoggedIn,
    isLoading,
    login,
    logout,
    checkLoginStatus,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
