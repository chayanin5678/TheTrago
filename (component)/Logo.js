import React from 'react';
import { View, StyleSheet, Image } from 'react-native';

export default function Logo() {
  return (
          <View style={styles.logoContainer}>
          <Image
      source={{ uri: 'https://www.thetrago.com/assets/images/logo.png' }}
      style={styles.logo}
      resizeMode="contain"
    />     
          </View>
  )
}

const styles = StyleSheet.create({
    logoContainer: {
        marginTop: 20,
        width: '100%',
        justifyContent: 'space-between',
        marginBottom: 20,
        flexDirection: 'row',
        marginLeft:-20,
      },
      logo: {
        width: '40%',
        height: 50,
      },

})