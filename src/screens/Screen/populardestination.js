import React, { useRef, useState, useEffect } from 'react';

import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, useWindowDimensions, Animated } from 'react-native';


import LogoTheTrago from './../../components/component/Logo';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useCustomer } from './CustomerContext';
import { useLanguage } from './LanguageContext';

import styles from '../../styles/CSS/HomeScreenStyles';

import { LinearGradient } from 'expo-linear-gradient';
import ipAddress from '../../config/ipconfig';
import { Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // ใช้ไอคอนจาก expo



const PopularDestination = ({ navigation, route }) => {
  const { customerData, updateCustomerData } = useCustomer();
  const { language, t, selectedLanguage } = useLanguage();
  const { width: screenWidth } = useWindowDimensions();
  const [popdestination, setPopdestination] = useState([]);
  const [loadedIndexes, setLoadedIndexes] = useState([]);


  const formatDecimal = (number) => {
    return Number(number).toFixed(1);
  };

  const shimmerAnim = useRef(new Animated.Value(-200)).current;

useEffect(() => {
  Animated.loop(
    Animated.timing(shimmerAnim, {
      toValue: 200,
      duration: 1500,
      easing: Easing.linear,
      useNativeDriver: true,
    })
  ).start();
}, []);


  useEffect(() => {

    const fecthpoppulardestination = async (countrieid) => {
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

  const isLoading = popdestination.length === 0;

  return (
    <ScrollView 
      contentContainerStyle={[styles.container, { paddingBottom: hp('10%') }]}
      showsVerticalScrollIndicator={false}
      bounces={true}
    >
      <LogoTheTrago />
      <View style={[styles.row, { alignSelf: '', width: '85%', marginLeft: '7%' }]}>
        <Text style={[styles.titleSearch, { fontWeight: 'bold', fontSize: wp('6%') }]}> {customerData.country}</Text>
      </View>
      <Text style={[styles.titleSearch, { color: '#', fontSize: wp('4%'), marginLeft: '8%', flexWrap: 'wrap', maxWidth: '90%', marginTop: 15, marginBottom: 30 }]}>
        {t('discoverDestinationInfo') || 'Discover detailed information about your ferry destination, including routes, schedules, and ticket booking options. Simply click the links below or select your desired destination from the menu to get started on your journey.'}
      </Text>
      <View style={[styles.carouselContainerTop, { alignSelf: 'center' }]}>
        {isLoading ? (
          // Skeleton Loader
          Array(3)
            .fill(0)
            .map((_, idx) => (
              <View key={idx} style={[styles.itemContainer, { minHeight: hp('30%'), marginBottom: 20 }]}>
                <View style={{ width: screenWidth * 0.9, height: hp('30%'), borderRadius: 12, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.98)', position: 'relative' }}>
                  <Animated.View
                    style={{
                      ...StyleSheet.absoluteFillObject,
                      zIndex: 1,
                    }}
                  >
                    <Animated.View
                      style={{
                        width: 150,
                        height: '100%',
                        transform: [{ translateX: shimmerAnim }],
                      }}
                    >
                      <LinearGradient
                        colors={['#eeeeee00', '#ddddddaa', '#eeeeee00']}
                        start={[0, 0]}
                        end={[1, 0]}
                        style={{ width: '100%', height: '100%' }}
                      />
                    </Animated.View>
                  </Animated.View>
                </View>
                <View style={{ width: 140, height: 14, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.98)', marginTop: 16 }} />
                <View style={{ width: 100, height: 10, borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.98)', marginTop: 8 }} />
              </View>
            ))
        ) : (
          popdestination.map((item, index) => {
            const isLoaded = loadedIndexes.includes(index);

            return (
              <View key={index} style={styles.itemContainer}>
                <TouchableOpacity
                  onPress={() => {
                    const startingPointName = selectedLanguage === 'th' ? (item.md_location_namethai || item.md_location_nameeng) : item.md_location_nameeng;
                    updateCustomerData({
                      startingPointId: item.md_location_id,
                      startingpoint_name: startingPointName,
                    });
                    navigation.navigate('LocationDetail');
                  }}
                >
                  <View style={{ width: screenWidth * 0.9, height: hp('30%'), borderRadius: 12, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.98)', position: 'relative' }}>
                    {!isLoaded && (
                      <Animated.View
                        style={{
                          ...StyleSheet.absoluteFillObject,
                          zIndex: 1,
                        }}
                      >
                        <Animated.View
                          style={{
                            width: 150,
                            height: '100%',
                            transform: [{ translateX: shimmerAnim }],
                          }}
                        >
                          <LinearGradient
                            colors={['#eeeeee00', '#ddddddaa', '#eeeeee00']}
                            start={[0, 0]}
                            end={[1, 0]}
                            style={{ width: '100%', height: '100%' }}
                          />
                        </Animated.View>
                      </Animated.View>
                    )}
                    <Image
                      source={{ uri: `https://thetrago.com/Api/uploads/location/index/${item.md_location_picname}` }}
                      style={{
                        width: '100%',
                        height: '100%',
                        position: 'absolute',
                        opacity: isLoaded ? 1 : 0,
                      }}
                      resizeMode="cover"
                      onLoadEnd={() => setLoadedIndexes((prev) => [...prev, index])}
                    />
                  </View>

                  {isLoaded ? (
                    <>
                      <View
                        style={{
                          position: 'absolute',
                          left: 50,
                          top: 20,
                          borderRadius: 10,
                          flexDirection: 'row',
                          alignSelf: 'center',
                          backgroundColor: '#FFF',
                          padding: 5,
                          paddingRight: 10,
                          paddingLeft: 10,
                        }}
                      >
                        <Ionicons name="star" size={wp('4%')} color="rgb(255, 211, 14)" />
                        <Text style={{ padding: 2, fontWeight: 'bold', fontSize: wp('3%') }}>
                          {formatDecimal(item.md_location_star)}
                        </Text>
                      </View>

                      <Text style={styles.locationName}>
                        {selectedLanguage === 'th' ? (item.md_location_namethai || item.md_location_nameeng) : item.md_location_nameeng}
                      </Text>
                      <Text style={[styles.locationName, { color: '#c5c5c7' }]}>
                        {item.timetable_count} {t('route') || 'route'}
                      </Text>
                    </>
                  ) : (
                    <>
                      <View style={{ width: 140, height: 14, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.98)', marginTop: 6 }} />
                      <View style={{ width: 100, height: 10, borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.98)', marginTop: 4 }} />
                    </>
                  )}
                </TouchableOpacity>
              </View>
            );
          })
        )}
      </View>

      {/* </ImageBackground> */}

    </ScrollView>
  )
}


export default PopularDestination;
