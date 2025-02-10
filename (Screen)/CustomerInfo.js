import React, { useRef, useState, useEffect  } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ImageBackground , Dimensions } from 'react-native';
import LoGo from './../(component)/Logo';
import Step from './../(component)/Step';

export default function CustomerInfo() {
  return (
     <ScrollView contentContainerStyle={styles.container}>
      <LoGo/>
      <Step logoUri={2}/>
       <Text style={styles.title}>Customer Information</Text>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        alignItems: 'flex-start', // Align content to the left
        backgroundColor: '#FFFFFF',
        padding: 20,
      },
      title: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'left', // Ensure left alignment
        color: '#002348',
        marginBottom: 20,
        marginLeft: 0, // Optional: ensure no margin if not needed
      },

})