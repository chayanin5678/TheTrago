import React, { useRef, useState, useEffect } from 'react';
import ipAddress from './../ipconfig';

import { View, Text, useWindowDimensions, ScrollView, TouchableOpacity, Image, TextInput, Modal, FlatList, ImageBackground, TouchableWithoutFeedback, Alert, ActivityIndicator } from 'react-native';

import LogoTheTrago from './../(component)/Logo';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

import { useCustomer } from './../(Screen)/CustomerContext';
import { Ionicons } from '@expo/vector-icons'; // ใช้ไอคอนจาก expo
import styles from './../(CSS)/HomeScreenStyles';

const LocationDetail = ({ navigation, route }) => {
    const { customerData, updateCustomerData } = useCustomer();
    const { width: screenWidth } = useWindowDimensions();
    const [popdestination, setPopdestination] = useState([]);

    const formatDecimal = (number) => {
        return Number(number).toFixed(1);
    };

    useEffect(() => {

        const fecthpoppulardestination = async (locationid) => {
            try {
                const response = await fetch(`${ipAddress}/searchdestination`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ md_location_id: locationid }),
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
        fecthpoppulardestination(customerData.startingPointId);
    }, [customerData.startingPointId]);

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {/* <ImageBackground
                source={{ uri: 'https://www.thetrago.com/assets/images/bg/Aliments.png' }}
                style={styles.background}> */}
            <LogoTheTrago />
            <View style={[styles.row, { alignSelf: '', width: '85%', marginLeft: '7%' }]}>
                <Text style={[styles.titleSearch, { fontWeight: 'bold', fontSize: wp('6%') }]}> {customerData.country} - {customerData.startingpoint_name}</Text>
            </View>

            <View style={[styles.carouselContainerTop, { alignSelf: 'center' }]}>

                {popdestination.map((item, index) => (
                    <TouchableOpacity onPress={() => {
                        updateCustomerData({ endPointId: item.md_timetable_endid, endpoint_name: item.endeng }); 
                        navigation.navigate('SearchFerry'); }}>
                    <View
                        key={index}
                        style={[
                            styles.cardContainerDes,
                            {
                                width: screenWidth * 0.9,
                                height: hp('10%'),
                                backgroundColor: 'rgb(255, 242, 236)',
                                elevation: 0,
                                justifyContent: 'center',
                                paddingHorizontal: 15,
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 0 },
                                shadowOpacity: 0,
                                shadowRadius: 0,
                                elevation: 0,
                            },
                        ]}
                    >
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center' }}>
                            <Ionicons name="location-outline" size={20} color='rgb(12, 188, 135)' style={{ marginRight: 5 }} />
                            <Text style={[styles.titleSearch, { fontSize: wp('4.5%'), color: '#000' }]}>
                                {item.starteng}
                            </Text>
                            <Ionicons name="arrow-forward" size={16} color="black" style={{ marginHorizontal: 5 }} />
                            <Text style={[styles.titleSearch, { fontSize: wp('4.5%'), color: '#000' }]}>
                                {item.endeng}
                            </Text>
                        </View>
                    </View>
                    </TouchableOpacity>

                ))}


            </View>

            {/* </ImageBackground> */}

        </ScrollView>
    )
}


export default LocationDetail;
