import React, { useState, useEffect } from 'react';
import ipAddress from './ipconfig';
import Icon from 'react-native-vector-icons/Ionicons';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, Modal, FlatList } from 'react-native';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { Picker } from '@react-native-picker/picker';
import { MaterialIcons } from '@expo/vector-icons';


const PersonalInfo = ({ navigation, route }) => {
 
 

  return (
    <ScrollView contentContainerStyle={styles.container}>
         <View style={styles.logoContainer}>
                <Image
                  source={require('./assets/logo.png')}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.rowText} >
                          <View style={styles.col}>
                          <View style={styles.circleactiveblue}>
                            <Text style={styles.textactive}>1</Text>
                          </View>
                          <Text style={styles.step}>Trip Detail</Text>
                          </View>
                          <Image source={require('./assets/Line_blue.png')}
                          style={styles.linerow}/>
                           <View style={styles.col}>
                          <View style={styles.circleactive}>
                            <Text style={styles.textactive}>2</Text>
                          </View>
                          <Text style={styles.step}>Personal Information</Text>
                          </View>
                          <Image source={require('./assets/Line 9.png')}
                          style={styles.linerow}/>
                           <View style={styles.col}>
                          <View style={styles.circledissable}>
                            <Text style={styles.textdissable}>3</Text>
                          </View>
                          <Text style={styles.step}>Payment</Text>
                          </View>
                          <Image source={require('./assets/Line 9.png')}
                          style={styles.linerow}/>
                           <View style={styles.col}>
                          <View style={styles.circledissable}>
                            <Text style={styles.textdissable}>4</Text>
                          </View>
                          <Text style={styles.step}>Complete</Text>
                          </View>
             </View>
               <Text style={styles.title}>Personal Information</Text>
    </ScrollView>
  );
};


    const styles = StyleSheet.create({
        container: {
            flexGrow: 1,
            alignItems: 'flex-start', // Align content to the left
            backgroundColor: '#FFFFFF',
            padding: 20,
          },
          logoContainer: {
            marginTop: 20,
            width: '100%',
            justifyContent: 'space-between',
            marginBottom: 20,
            flexDirection: 'row',
          },
          logo: {
            width: 97,
            height: 31,
          },
          rowText: {
            width:'100%',
            flexDirection:'row',
            margin:10,
            marginBottom:20,
            justifyContent:'center',
            alignItems:'center'
        },
        col: {
            flexDirection:'column',
            margin:10,
            width:100,
            alignItems:'center'
        },
        circleactive: {
            backgroundColor:'#FD501E', 
            height:40, 
            width:40, 
            borderRadius:30,
            justifyContent:'center',
             alignItems:'center'
            },
        circleactiveblue: {
            backgroundColor:'#49A7FF', 
            height:40, 
            width:40, 
            borderRadius:30,
            justifyContent:'center',
             alignItems:'center'
        },
        textactive: {
            color:'#FFF',
            fontSize:16
        },
        step: {
            fontSize:10
        },
        linerow:{
            marginBottom:20,
            marginLeft:-20,
            marginRight:-20,
            width:30
        },
        circledissable:{
            backgroundColor:'#EAEAEA', 
            height:40, 
            width:40, 
            borderRadius:30,
            justifyContent:'center', 
            alignItems:'center'
        },
        textdissable: {
            fontSize:16,
            color:'#666666'
        },
        title: {
            fontSize: 20,
            fontWeight: 'bold',
            textAlign: 'left', // Ensure left alignment
            color: '#002348',
            marginBottom: 20,
            marginLeft: 0, // Optional: ensure no margin if not needed
          },
    
});
      
      export default PersonalInfo;
