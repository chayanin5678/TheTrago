import React, { useRef, useState, useEffect } from 'react';
import ipAddress from './../ipconfig';

import { View, Text, useWindowDimensions, ScrollView, TouchableOpacity, Image, TextInput, Modal, FlatList, ImageBackground, TouchableWithoutFeedback, Alert, ActivityIndicator } from 'react-native';

import LogoTheTrago from './../(component)/Logo';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

import { useCustomer } from './../(Screen)/CustomerContext';
import { Ionicons } from '@expo/vector-icons'; // ใช้ไอคอนจาก expo
import styles from './../(CSS)/HomeScreenStyles';

const PopularDestination  = ({ navigation, route }) => {
  const { customerData, updateCustomerData } = useCustomer();
  const { width: screenWidth } = useWindowDimensions();
  const [popdestination, setPopdestination] = useState([]);

    const formatDecimal = (number) => {
  return Number(number).toFixed(1);
};

  useEffect(() => {

    const fecthpoppulardestination= async (countrieid) => {
      try {
        const response = await fetch(`${ipAddress}/popdestination`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ md_location_countriesid: countrieid }),
        });

        const json = await response.json();


        if (response.ok) {
          setPopdestination(json.data);
          console.log('poppularAttraction:', json.data);
          return json.data;
        } else {
          console.warn('Not found or error:', json.message);
          setPopdestination([]);
          return null;
        }
      } catch (error) {
        console.error('Error fetching country:', error);
        return null;
      }
    };
    fecthpoppulardestination(customerData.countrycode);
  }, [customerData.countrycode]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* <ImageBackground
                source={{ uri: 'https://www.thetrago.com/assets/images/bg/Aliments.png' }}
                style={styles.background}> */}
      <LogoTheTrago />
      <View style={[styles.row, { alignSelf: '', width: '85%', marginLeft: '7%' }]}>
        <Text style={[styles.titleSearch, { fontWeight: 'bold', fontSize: wp('6%') }]}> {customerData.country}</Text>
      </View>
      <Text style={[styles.titleSearch, { color: '#', fontSize: wp('4%'), marginLeft: '8%', flexWrap: 'wrap', maxWidth: '90%', marginTop: 15, marginBottom: 30 }]}>
        Discover detailed information about your ferry destination, including routes, schedules, and ticket booking options. Simply click the links below or select your desired destination from the menu to get started on your journey.
      </Text>

      <View style={[styles.carouselContainerTop, { alignSelf: 'center' }]}>


        {popdestination.map((item, index) => (
          <View key={index} style={[styles.itemContainer,]}>
            <TouchableOpacity onPress={() => {updateCustomerData({ startingPointId: item.md_location_id,startingpoint_name: item.md_location_nameeng }); navigation.navigate('LocationDetail'); }}>
            <Image
              source={{ uri: `https://thetrago.com/Api/uploads/location/index/${item.md_location_picname}` }}
              style={[styles.bannerImage, { width: screenWidth * 0.9, height: hp('30%') }]}
              resizeMode="cover"
            />
            <View
              style={{ position: 'absolute', left: 50, top: 20, borderRadius: 10, flexDirection: 'row', alignSelf: 'center', backgroundColor: '#FFF', padding:5, paddingRight:10, paddingLeft:10 }}

            >
              <Ionicons name="star" size={wp(' 4%')} color="rgb(255, 211, 14)" /><Text style={{ padding: 2, fontWeight: 'bold', fontSize: wp('3%') }}>{formatDecimal(item.md_location_star)}</Text>
            </View>

            <Text style={styles.locationName}>{item.md_location_nameeng}</Text>
            <Text style={[styles.locationName, { color: '#c5c5c7' }]}>{item.timetable_count} route</Text>
            </TouchableOpacity>
          </View>
        ))}


      </View>

      {/* </ImageBackground> */}

    </ScrollView>
  )
}


export default PopularDestination ;
