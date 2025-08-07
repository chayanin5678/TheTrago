import React from 'react';
import { View, StyleSheet, Image } from 'react-native';

export default function Logo() {
  return (
          <View style={styles.logoContainer}>
          <Image
       source={require('../../../assets/logoicon.png')}
      style={styles.logo}
      resizeMode="cover"
    />     
          </View>
  )
}

const styles = StyleSheet.create({
    logoContainer: {

        marginTop: 0,

        width: '100%',
        justifyContent: 'center',
        marginBottom: 0,
        flexDirection: 'row',
        marginLeft:0,

      },
      logo: {
        width: '70%',
        height: 90,
      },

})
