import React, { useRef, useState, useEffect, use } from 'react';

import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ImageBackground, FlatList, ActivityIndicator, Modal, Animated, TouchableWithoutFeedback, TextInput } from 'react-native';

import DateTimePicker from "@react-native-community/datetimepicker";
import Banner from './(component)/Banner';
import LogoTheTrago from './(component)/Logo';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useCustomer } from './(Screen)/CustomerContext';
import { CalendarList } from 'react-native-calendars';
import styles from './(CSS)/HomeScreenStyles';
import * as SecureStore from 'expo-secure-store';
import { LinearGradient } from 'expo-linear-gradient';
import ipAddress from './ipconfig';

import { Ionicons } from '@expo/vector-icons'; // ใช้ไอคอนจาก expo


const data = [
  { id: '1', title: 'Ferry', icon: 'boat', navigate: 'SearchFerry' },
  { id: '2', title: 'Flights', icon: 'airplane', navigate: '' },
  { id: '3', title: 'Trains', icon: 'train', navigate: '' },
  { id: '4', title: 'Cars', icon: 'car', navigate: '' },
  { id: '5', title: 'Hotel', icon: 'bed', navigate: '' },
  { id: '6', title: 'Tours', icon: 'map', navigate: '' },
  { id: '7', title: 'Attraction', icon: 'star', navigate: '' },
  { id: '8', title: 'Ticket', icon: 'ticket', navigate: '' },
];


const HomeScreen = ({ navigation }) => {
  const [activeCountry, setActiveCountry] = useState(null);

  const [startingPoint, setStartingPoint] = useState({ id: '0', name: 'Starting Point' });
  const [endPoint, setEndPoint] = useState({ id: '0', name: 'Destination' });
  const [departureDate, setDepartureDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  });

  const [returnDate, setReturnDate] = useState(() => {
    const returnDay = new Date(departureDate);
    returnDay.setDate(returnDay.getDate() + 1);
    return returnDay;
  });

  const scaleAnim = useState(new Animated.Value(1))[0];

  const [isLoading, setIsLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { customerData, updateCustomerData } = useCustomer();
  const [tripType, setTripType] = useState("One Way Trip");
  const [showModal, setShowModal] = useState(false);
  const [calendarStartDate, setCalendarStartDate] = useState(new Date().toISOString().split('T')[0]); // string
  const [calendarEndDate, setCalendarEndDate] = useState(new Date().toISOString().split('T')[0]); // string

  const [profileImage, setProfileImage] = useState(null);
  const [calendarMarkedDates, setCalendarMarkedDates] = useState({});
  const [token, setToken] = useState(null);
  const [user, setUser] = useState([]);
  const [countrie, setcountrie] = useState([]);


  // ฟังก์ชันสำหรับเลือกวัน
  const onCalendarDayPress = (day) => {
    if (!calendarStartDate || calendarEndDate) {
      setCalendarStartDate(day.dateString);
      setCalendarEndDate(null);
      setCalendarMarkedDates({
        [day.dateString]: {
          startingDay: true,
          color: '#FD501E',
          textColor: 'white',
        },
      });
    } else {
      const range = getMarkedDatesRange(calendarStartDate, day.dateString);
      setCalendarEndDate(day.dateString);
      setCalendarMarkedDates(range);
    }
  };

  const getMarkedDatesRange = (start, end) => {
    let dates = {};
    let current = new Date(start);
    const last = new Date(end);

    while (current <= last) {
      const dateStr = current.toISOString().split('T')[0];
      dates[dateStr] = {
        color: '#FD501E',
        textColor: 'white',
      };
      if (dateStr === start) dates[dateStr].startingDay = true;
      if (dateStr === end) dates[dateStr].endingDay = true;
      current.setDate(current.getDate() + 1);
    }
    return dates;
  };


  const handleCalendarConfirm = () => {
    if (tripType === 'One Way Trip' && calendarStartDate) {
      console.log('Selected Departure Date:', calendarStartDate);
      setDepartureDate(new Date(calendarStartDate));
      setShowModal(false);
    } else if (tripType === 'Return Trip' && calendarStartDate && calendarEndDate) {
      setDepartureDate(new Date(calendarStartDate));
      setReturnDate(new Date(calendarEndDate));
      setShowModal(false);
    } else {
      alert('กรุณาเลือกวันที่ให้ครบ');
    }
  };



  const formatDate = (date) => {
    if (!date) return ""; // ตรวจสอบว่ามีค่า date หรือไม่
    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };





  const swapPoints = () => {
    setStartingPoint((prev) => endPoint);
    setEndPoint((prev) => startingPoint);
  };

  const truncateText = (text, maxLength = 10) => {
    if (text.length > maxLength) {
      return text.slice(0, maxLength) + '...';
    }
    return text;
  };

  useEffect(() => {
    const checkLoginStatus = async () => {
      const storedToken = await SecureStore.getItemAsync('userToken'); // ตรวจสอบ token
      setToken(storedToken); // อัปเดตสถานะ token

      if (!storedToken) {
        // หากไม่มี token, นำทางไปที่หน้า LoginScreen
        navigation.replace('LoginScreen');
      } else {

        setIsLoading(false); // หยุดการโหลดหลังจากตรวจสอบเสร็จ
        // console.log(user); // แสดง token ใน console

      }
    };
    checkLoginStatus(); // เรียกใช้เมื่อหน้าโหลด


  }, []); // ใช้ navigation เป็น dependency เพื่อให้ useEffect ทำงานเมื่อคอมโพเนนต์โหลด

  useEffect(() => {

    const fetchData = async () => {
      try {
        const response = await fetch(`${ipAddress}/profile`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`, // ส่ง Token ใน Authorization header
            'Content-Type': 'application/json', // ระบุประเภทของข้อมูลที่ส่ง (ถ้าจำเป็น)
          },
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();

        if (data && Array.isArray(data.data)) {
          setUser(data.data);
          updateCustomerData({
            Firstname: data.data[0].md_member_fname,
            Lastname: data.data[0].md_member_lname,
            email: data.data[0].md_member_email,
          });
          console.log('name:' + customerData.Firstname);
        } else {
          console.error('Data is not an array', data);
          setUser([]);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);  // ตั้งค่า loading เป็น false หลังจากทำงานเสร็จ
      }
    };
    if (token) {
      fetchData();
    }

  }, [token]);




  useEffect(() => {

    const fetchData = async () => {
      const storedToken = await SecureStore.getItemAsync('userToken');
      try {
        const response = await fetch(`${ipAddress}/profile`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${storedToken}`, // ส่ง Token ใน Authorization header
            'Content-Type': 'application/json', // ระบุประเภทของข้อมูลที่ส่ง (ถ้าจำเป็น)
          },
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();

        if (data && Array.isArray(data.data)) {

          // setUser(data.data);
          updateCustomerData({
            Firstname: data.data[0].md_member_fname,

            Lastname: data.data[0].md_member_lname,
            email: data.data[0].md_member_email,
            tel: data.data[0].md_member_phone
          });

          if (data.data[0].md_member_phone) {
            updateCustomerData({
              tel: data.data[0].md_member_phone,
            });
          }
          if (data.data[0].md_member_code) {
            getCountryByCode(data.data[0].md_member_code);

          }
          //  console.log('name:'+customerData.Firstname);

        } else {
          console.error('Data is not an array', data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };


    fetchData();



  }, []);

  const getCountryByCode = async (code) => {
    try {
      const response = await fetch(`${ipAddress}/membercountry`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ countrycode: code }),
      });

      const json = await response.json();


      if (response.ok) {
        console.log('Country data:', json.data);
        updateCustomerData({
          selectcoountrycode: `(+${json.data[0].sys_countries_telephone}) ${json.data[0].sys_countries_nameeng}`
        });
        return json.data;
      } else {
        console.warn('Not found or error:', json.message);
        return null;
      }
    } catch (error) {
      console.error('Error fetching country:', error);
      return null;
    }
  };

  useEffect(() => {
    fetch(`${ipAddress}/countriespop`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        if (data && Array.isArray(data.data)) {
          setcountrie(data.data);
          setActiveCountry(data.data[0].sys_countries_id);
        } else {
          console.error('Data is not an array', data);
          setcountrie([]);
        }
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      }).finally(() => {
        setLoading(false);  // ตั้งค่า loading เป็น false หลังจากทำงานเสร็จ
      });
  }, []);


  return (


    <View style={{ flex: 1 }}>
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FD501E" />
          <Text style={styles.loadingText}>Processing Payment...</Text>
        </View>
      )}


      <ScrollView contentContainerStyle={styles.container}>

        <View style={[
          styles.cardContainerDes,
          {
            width: '115%',
            height: '20%',
            borderRadius: 40,
            marginTop: -30,
            paddingTop: 0,
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
            overflow: 'hidden',
            //  marginBottom : 20


          }
        ]}>
          <ImageBackground
            source={require('./assets/home-top.webp')}
            style={{ width: '100%', height: '100%' }}
            imageStyle={{
              borderRadius: 40,
              borderTopLeftRadius: 0,
              borderTopRightRadius: 0,

            }}
            resizeMode="cover" // ใช้ cover เพื่อให้ภาพเติมเต็ม
          >

            <View style={[styles.rowButton, { width: '80%', marginLeft: 15 }]}>
              <LogoTheTrago />
              {user.map((item, index) => (
                <View key={index}>



                  {profileImage && (
                    <TouchableWithoutFeedback

                    >
                      <Animated.View style={[styles.profileWrapper, { transform: [{ scale: scaleAnim }] }]}>
                        <Image
                          source={{ uri: profileImage }}
                          style={styles.profileImage}
                        />
                        <Feather name="edit" size={24} color="#FD501E" style={styles.edit} />
                      </Animated.View>
                    </TouchableWithoutFeedback>

                  )}
                  {!profileImage && (
                    <TouchableWithoutFeedback >
                      <Animated.View style={[styles.profileWrapper, { transform: [{ scale: scaleAnim }] }]}>
                        <Image
                          source={
                            profileImage // ถ้าเลือกรูปใหม่
                              ? { uri: profileImage }
                              : item.md_member_photo // ถ้ามีรูปในฐาน
                                ? { uri: `https://www.thetrago.com/${item.md_member_photo}` }
                                : require('./assets/icontrago.png') // ถ้าไม่มีอะไรเลย
                          }
                          style={styles.profileImage}
                        />

                      </Animated.View>
                    </TouchableWithoutFeedback>
                  )}

                </View>
              ))}

            </View>
            <Text style={[styles.title, { shadowRadius: 20, shadowOpacity: 1, shadowColor: '#FFFFF', color: "#FFFF", alignSelf: 'center', textAlign: 'center', maxWidth: 300, fontSize: wp('6%'), marginBottom: 5, fontWeight: 'bold' }]}>
              The journey is endless Book now
            </Text>
            <View style={[styles.searchContainer, { marginBottom: 150 }]}>
              <View style={styles.searchIconContainer}>
                <Ionicons
                  name="search"
                  size={24}
                  color="white"
                  style={[styles.searchIcon, { transform: [{ translateX: 6 }] }]}
                />

              </View>
              <TextInput
                style={styles.searchInput}
                placeholder="Find your next destination"
                placeholderTextColor="#fff"
              />
            </View>
          </ImageBackground>
        </View>


        {/* <View style={styles.tabContainer}>

        {['Ferry', 'Flight', 'Car', 'Hotel'].map(tab => (
          <View
            key={tab}
            style={[styles.tabOuter, activeTab === tab ? styles.tabActiveOuter : styles.tabInactiveOuter]}
          >
            <TouchableOpacity
              style={activeTab === tab ? styles.tabActive : styles.tabInactive}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                style={activeTab === tab ? styles.tabTextActive : styles.tabTextInactive}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </View> */}

        <ScrollView contentContainerStyle={[styles.gridContainer, { marginBottom: 0 }]}>
          <View style={styles.row}>
            {data.map((item) => (
              <View key={item.id} style={{
                justifyContent: 'center',
                alignItems: 'center',
                margin: 10,
                width: wp('14%'),             // กำหนดขนาดให้เป็น % ของหน้าจอ (เพื่อให้มี 4 คอลัมน์ในแถว)
                height: wp('14%'),
                marginBottom: 25,
              }} >
                <TouchableOpacity
                  style={styles.card}
                  onPress={() => {
                    if (item.navigate) {
                      navigation.navigate(item.navigate);
                    } else {
                      alert("Coming soon...");
                    }
                  }}
                >
                  <Ionicons name={item.icon} size={wp('7%')} color="#FD501E" />
                </TouchableOpacity>
                <Text style={styles.cardText}>{item.title}</Text>
              </View>
            ))}

          </View>
        </ScrollView>

        {/* <View style={styles.bookingSection}>
          <View style={styles.tripTypeContainer}>
            <TouchableOpacity
              style={[
                styles.tripTypeOneWayButton,
                tripType === "One Way Trip" && styles.activeButton,
              ]}
              onPress={() => {
                setTripType("One Way Trip");

              }}
            >
              <Text
                style={[
                  styles.tripTypeText,
                  tripType === "One Way Trip" && styles.activeText,

                ]}
              >
                One Way Trip
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tripTypeRoundButton,
                tripType === "Return Trip" && styles.activeButton,
              ]}
              onPress={() => {
                setTripType("Return Trip");
              }}
            >
              <Text
                style={[
                  styles.tripTypeText,
                  tripType === "Return Trip" && styles.activeText,

                ]}
              >
                Round Trip
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputRow}>
            <TouchableOpacity
              onPress={() => {
                setIsLoading(true);
                navigation.navigate('StartingPointScreen', {
                  setStartingPoint: (data) => setStartingPoint(data), // ส่งฟังก์ชันไปยังหน้าจอใหม่
                });
                setIsLoading(false);
              }}
              style={styles.inputBox}
            >
              <Image
                source={require('./assets/directions_boat.png')}
                style={styles.logoDate}
                resizeMode="contain"
              />
              <View >
                <View style={styles.inputBoxCol}>
                  <Text style={styles.inputLabel}>From</Text>
                  <Text style={styles.inputText}> {truncateText(startingPoint.name)}</Text>
                </View>
              </View>
            </TouchableOpacity>

    
            <TouchableOpacity onPress={swapPoints}>
              <Image
                source={require('./assets/mage_exchange-a.png')}
                style={styles.logoSwap}
                resizeMode="contain"
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setIsLoading(true);
                navigation.navigate('EndPointScreen', { setEndPoint, startingPointId: startingPoint.id, });
                setIsLoading(false);
              }}
              style={styles.inputBox} >
              <Image
                source={require('./assets/location_on.png')}
                style={styles.logoDate}
                resizeMode="contain"
              />
              <View style={styles.inputBoxCol}>
                <Text style={styles.inputLabel}>To</Text>
                <Text style={styles.inputText}> {truncateText(endPoint.name)}</Text>
              </View>
            </TouchableOpacity>
          </View>



          <View style={styles.inputRow}>

            <View style={styles.inputBox}>
              <TouchableOpacity onPress={() => setShowModal(true)}
                style={[
                  styles.rowdepart,
                  { width: tripType === "One Way Trip" ? wp('68.4%') : 'auto' } // Apply 100% width conditionally
                ]}>

                <Image
                  source={require('./assets/solar_calendar-bold.png')}

                  style={styles.logoDate}
                  resizeMode="contain"
                />
                <View style={styles.inputBoxCol}>

                  <Text style={styles.inputLabel}>Departure date</Text>
                  <Text style={styles.inputText}>
                    {calendarStartDate ? formatDate(calendarStartDate) : "Select Date"}
                  </Text>

                </View>
              </TouchableOpacity>
              {tripType === "Return Trip" && (
                <>

                  <Image
                    source={require('./assets/Line 2.png')}
                    style={styles.logoLine}
                    resizeMode="contain"
                  />
                  <TouchableOpacity onPress={() => setShowModal(true)} disabled={!departureDate}
                    style={styles.rowdepart}>

                    <Image
                      source={require('./assets/solar_calendar-yellow.png')}
                      style={styles.logoDate}
                      resizeMode="contain"
                    />
                    <View style={styles.inputBoxCol}>
                      <Text style={styles.inputLabel}>Return date</Text>
                      <Text style={styles.inputText}>{calendarEndDate ? formatDate(calendarEndDate.toString()) : "Select Date"}</Text>
                    </View>
                  </TouchableOpacity>
                </>
              )}
            </View>

            <Modal visible={showModal} animationType="slide">
              <View style={{ flex: 0.65, backgroundColor: '#fff' }}>


                <View style={{ marginTop: '10%', paddingHorizontal: 20, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#ddd' }}>
                  <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>Select Date</Text>
                  <View style={{ flexDirection: 'row', gap: 20 }}>
                    <View style={{ backgroundColor: '#f2f2f2', padding: 10, borderRadius: 10, flex: 1 }}>
                      <Text style={{ fontSize: 12, color: '#555' }}>Departure date</Text>
                      <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{formatDate(calendarStartDate) || '-'}</Text>
                    </View>
                    {tripType === 'Return Trip' && (
                      <View style={{ backgroundColor: '#f2f2f2', padding: 10, borderRadius: 10, flex: 1 }}>
                        <Text style={{ fontSize: 12, color: '#555' }}>Return date</Text>
                        <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{formatDate(calendarEndDate) || '-'}</Text>
                      </View>
                    )}
                  </View>
                </View>

                <CalendarList
                  onDayPress={onCalendarDayPress}
                  markedDates={calendarMarkedDates}
                  markingType={'period'}
                  pastScrollRange={0}
                  futureScrollRange={6}
                  scrollEnabled={true}
                  showScrollIndicator={true}
                  minDate={new Date().toISOString().split('T')[0]}
                />

                <View style={{ padding: 20, borderTopWidth: 1, borderTopColor: '#eee' }}>
                  <TouchableOpacity onPress={handleCalendarConfirm} style={{ backgroundColor: '#FD501E', paddingVertical: 14, borderRadius: 10, alignItems: 'center' }}>
                    <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>ยืนยัน</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>




          </View>
        </View> */}



        {/* <TouchableOpacity
          style={styles.searchButton}
          onPress={() => {


            if (startingPoint.id !== '0' && endPoint.id !== '0' && calendarStartDate) {
              setIsLoading(true);
              updateCustomerData({
                startingPointId: startingPoint.id,
                startingpoint_name: startingPoint.name,
                endPointId: endPoint.id,
                endpoint_name: endPoint.name,
                departdate: calendarStartDate,
                returndate: calendarEndDate,
                tripTypeinput: tripType,
              });
              navigation.navigate('SearchFerry');
              setIsLoading(false);
            } else {
              setIsModalVisible(true);
            }
          }}
        >
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
        <Modal
          visible={isModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setIsModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalText}>Please select starting points and destination.</Text>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setIsModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal> */}
        <LinearGradient
          colors={['#FD501E', '#FFFF' ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
            paddingVertical: 8,
            paddingHorizontal: 16,
            borderRadius: 12,
            marginTop:-50,
            marginBottom: 10,
            alignSelf: 'flex-start',
            width:'100%'
          }}
        >
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#fff' }}>
            Hot <Text style={{ color: '#FFE1D8' }}>Deal</Text>
          </Text>
        </LinearGradient>


        <Banner />
        {/* <View style={styles.rowtrip}>
          <View style={styles.coltrip}>

            <Text style={styles.texcol}>Popular</Text>
            <Text style={styles.texcol}><Text style={styles.highlight}>Destination</Text></Text>
            <Text style={styles.Detail}>
              Lorem ipsum odor amet, consectetuer adipiscing elit. Curabitur lectus sodales suspendisse hendrerit eu taciti quis.
              Metus turpis nullam mattis hac orci hendrerit eu phasellus maximus.
            </Text>

            <TouchableOpacity style={styles.PxploreButton}>
              <Text style={styles.searchButtonText}>EXPLORE MORE</Text>
            </TouchableOpacity>


          </View>



          {destinations.slice(0, 1).map((item) => (
            <View style={styles.cardContainerDes} key={item.id}>
              <Image source={item.image} style={styles.cardImage} />
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardLocation}><Image source={require('./assets/Iconlocation.png')} /> {item.location}</Text>
                <Text style={styles.cardDuration}><Image source={require('./assets/Icontime.png')} /> {item.duration}</Text>
                <Text style={styles.cardPrice}>Start From <Text style={styles.cardPriceColor}>{item.price}</Text></Text>
              </View>
            </View>
          ))}


        </View> */}


        <Text style={[styles.titledeal, { marginTop: 10 }]}>
          <Text style={styles.highlight}>Popular<Text style={{ color: '#FFA072' }}> Destination</Text></Text>
        </Text>
        <ScrollView
          contentContainerStyle={styles.cardList}
          style={{ width: '100%' }}
        >
          {countrie.map((item) => (
            <View style={styles.cardContainerDes} key={item.sys_countries_id}>
              <Image
                source={{ uri: `https://www.thetrago.com/Api/uploads/countries/index/${item.sys_countries_picname}` }}
                style={styles.cardImage}
              />

              {/* <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardLocation}><Image source={require('./assets/Iconlocation.png')} /> {item.location}</Text>
                <Text style={styles.cardDuration}><Image source={require('./assets/Icontime.png')} /> {item.duration}</Text>
                <Text style={styles.cardPrice}>Start From <Text style={styles.cardPriceColor}>{item.price}</Text></Text>
              </View> */}
              <Text style={styles.cardTitle}>{item.sys_countries_nameeng}</Text>
            </View>
          ))}
        </ScrollView>
        <Text style={[styles.titledeal, { marginTop: -20 }]}>
          <Text style={styles.highlight}>Popular<Text style={{ color: '#FFA072' }}> Route</Text></Text>
        </Text>
        <View style={styles.tabContainer}>
          <View style={styles.tabContainer}>
            {countrie.map((item) => (
              <TouchableOpacity
                key={item.sys_countries_id}
                style={[styles.tab, activeCountry === item.sys_countries_id && styles.activeTab]} // ทำให้ปุ่มที่เลือกมีสีพื้นหลัง
                onPress={() => setActiveCountry(item.sys_countries_id)} // เมื่อกดปุ่ม จะทำการเปลี่ยนสถานะ
              >
                <Text style={[styles.tabText, activeCountry === item.sys_countries_id && styles.activeTabText]}>
                  {item.sys_countries_nameeng}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>


      </ScrollView >

    </View>


  );
};

export default HomeScreen;

