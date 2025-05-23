import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image, Dimensions, useWindowDimensions } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

import ipAddress from './../ipconfig';


export default function toptrending() {
    const { width: screenWidth } = useWindowDimensions(); // ✅ ใช้ useWindowDimensions() แทน Dimensions.get()
    const [currentBanner, setCurrentBanner] = useState(0);
    const scrollViewRef = useRef(null);

    const [toptrending, setToptrending] = useState([]);


    useEffect(() => {
        fetch(`${ipAddress}/toptrending`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then((data) => {
                if (data && Array.isArray(data.data)) {
                    setToptrending(data.data);
                    //   setActiveCountry(data.data[0].sys_countries_id);
                } else {
                    console.error('Data is not an array', data);
                    setToptrending([]);
                }
            })
            .catch((error) => {
                console.error('Error fetching data:', error);
            }).finally(() => {
                setLoading(false);  // ตั้งค่า loading เป็น false หลังจากทำงานเสร็จ
            });
    }, []);


    useEffect(() => {
        if (!toptrending.length) return;

        const interval = setInterval(() => {
            const nextIndex = (currentBanner + 1) % toptrending.length;
            setCurrentBanner(nextIndex);
            scrollViewRef.current?.scrollTo({
                x: nextIndex * screenWidth,
                animated: true,
            });
        }, 3000);

        return () => clearInterval(interval);
    }, [currentBanner, screenWidth, toptrending.length]);


    return (
        <View style={styles.carouselContainer}>
            <ScrollView
                ref={scrollViewRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={(event) => {
                    const index = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
                    setCurrentBanner(index);
                }}
                style={{ width: screenWidth }}
            >

                {toptrending.map((item, index) => (
                    <Image
                        key={index}
                        source={{ uri: `https://thetrago.com/Api/uploads/location/pictures/${item.md_location_picname}` }}
                        style={[styles.bannerImage, { width: screenWidth * 0.9 }]}
                    />

                ))}
            </ScrollView>

        </View>
    );
}

const styles = StyleSheet.create({
    carouselContainer: {
        marginTop: -5,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    bannerImage: {
        height: hp('16%'), // ปรับให้สูงขึ้นเล็กน้อย
        borderRadius: 20,
        resizeMode: 'cover',
        alignSelf: 'center',
        marginHorizontal: wp('5%'), // ให้มีขอบซ้ายขวาเล็กน้อย

    },
    indicatorContainer: {
        flexDirection: 'row',
        position: 'relative',
        marginTop: 10,
        alignSelf: 'center',
    },
    indicator: {
        width: 7,
        height: 7,
        borderRadius: 5,
        backgroundColor: '#ccc',
        marginHorizontal: 5,
    },
    activeIndicator: {

        backgroundColor: '#FD501E',

        width: 8,
        height: 8,
    },
});
