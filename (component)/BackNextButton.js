import React from 'react';

import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';


export default function BackNextButton({navigation, Navi, params}) {
  return (
  <View style={styles.rowButton}>
        <TouchableOpacity 
          style={[styles.BackButton]} // Use an array if you want to combine styles
          onPress={() => {
            navigation.goBack();
          }}>
          <Text style={styles.BackButtonText}>Go Back</Text>
        </TouchableOpacity>
         <TouchableOpacity 
          style={[styles.ActionButton]} // Use an array if you want to combine styles
          onPress={() => {
            navigation.navigate(Navi,params)
          }}>
          <Text style={styles.searchButtonText}>Next Step</Text>
        </TouchableOpacity>
        </View>
  )
}

const styles = StyleSheet.create({
    rowButton: {
        width:'100%',
        alignItems :'center',
        justifyContent:'space-between',
        flexDirection:'row'
      },
      BackButton: {
        backgroundColor: '#EAEAEA',
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 10,
        width: '45%',
        marginBottom:20,
        justifyContent:'flex-end',
      },
      BackButtonText: {
        color: '#666666',
        fontWeight: 'bold',
        fontSize: 16,
      
      },
      ActionButton: {
        backgroundColor: '#FD501E',
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 10,
        width: '45%',
        marginBottom:20,
        justifyContent:'flex-end',
      },
      searchButtonText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 16,
      
      },
    
})