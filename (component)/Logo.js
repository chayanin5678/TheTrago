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
<<<<<<< HEAD
        marginTop: 25,
=======
        marginTop: 0,
>>>>>>> 880b1d14123c4238ea4001e93867da943b84a705
        width: '100%',
        justifyContent: 'space-between',
        marginBottom: 20,
        flexDirection: 'row',
        marginLeft:0,

      },
      logo: {
        width: '40%',
        height: 50,
      },

})