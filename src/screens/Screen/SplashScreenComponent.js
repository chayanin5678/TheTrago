import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';

export default function SplashScreenComponent() {
  const [fontLoaded, setFontLoaded] = useState(false);

  useEffect(() => {
    // Prevent the splash screen from auto-hiding
    SplashScreen.preventAutoHideAsync();

    // Load custom fonts
    // const loadFonts = async () => {
    //   await Font.loadAsync({
    //     'Lilita One': require('../../../assets/fonts/LilitaOne-Regular.ttf'),
    //   });
    //   setFontLoaded(true);
    // };

    // loadFonts();

    // Hide splash screen after fonts are loaded or after a timeout
    setTimeout(() => {
      SplashScreen.hideAsync();
    }, 3000); // Wait 3 seconds for splash screen before hiding

  }, []);

  if (!fontLoaded) {
    return null; // Don't render anything until the fonts are loaded
  }

  return (
    <View style={styles.container}>
      <Image source={require('../../../assets/logo.png')} style={styles.logo} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Lilita One',
    color: '#FD501E',
  },
});
