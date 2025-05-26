import React, { useRef, useState, useEffect } from 'react';
import ipAddress from './../ipconfig';
import Icon from 'react-native-vector-icons/Ionicons';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, Modal, FlatList, ImageBackground, TouchableWithoutFeedback, Alert, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { MaterialIcons } from '@expo/vector-icons';
import LogoTheTrago from './../(component)/Logo';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import moment from 'moment';
import { useCustomer } from './../(Screen)/CustomerContext';
import { collectManifestSchemes } from 'expo-linking';

const populardestination = ({ navigation, route }) => {
  const { customerData, updateCustomerData } = useCustomer();

  return (
    <ScrollView contentContainerStyle={styles.container}>
          <ImageBackground
                source={{ uri: 'https://www.thetrago.com/assets/images/bg/Aliments.png' }}
                style={styles.background}>
                <LogoTheTrago />
                  <View style={[styles.row, { alignSelf: '', width: '85%', marginLeft: '7%' }]}>
                  <Text style={[styles.titleSearch, { fontWeight: 'bold', fontSize: wp('6%') }]}> {customerData.country}</Text>
                  </View>
                  <Text style={[styles.titleSearch, { color:'#' ,fontSize: wp('4.5%'), marginLeft: '8.5%', flexWrap:'wrap', maxWidth: '90%', marginTop: 20 }]}>
                    Discover detailed information about your ferry destination, including routes, schedules, and ticket booking options. Simply click the links below or select your desired destination from the menu to get started on your journey.
                  </Text>
                
       </ImageBackground>

    </ScrollView>
  )
}

const styles = StyleSheet.create({

});

export default populardestination;
