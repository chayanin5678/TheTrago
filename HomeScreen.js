import React, { useRef, useState, useEffect, use } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ImageBackground, Dimensions, ActivityIndicator, Modal } from 'react-native';
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



const destinations = [
  { id: '1', title: 'Lorem ipsum odor', location: 'Lorem, Indonesia', duration: '5 Days', price: '$225', image: require('./assets/destination1.png') },
  { id: '2', title: 'Lorem ipsum odor', location: 'Lorem, Italy', duration: '10 Days', price: '$570', image: require('./assets/destination2.png') },
  { id: '3', title: 'Lorem ipsum odor', location: 'Lorem, France', duration: '7 Days', price: '$400', image: require('./assets/destination3.png') },
];

const HomeScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('Ferry');  // ใช้ state เพื่อจัดการเมนูที่เลือก
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

  const [isLoading, setIsLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { customerData, updateCustomerData } = useCustomer();
  const [tripType, setTripType] = useState("One Way Trip");
  const [showModal, setShowModal] = useState(false);
  const [calendarStartDate, setCalendarStartDate] = useState(new Date().toISOString().split('T')[0]); // string
  const [calendarEndDate, setCalendarEndDate] = useState(new Date().toISOString().split('T')[0]); // string

  const [calendarMarkedDates, setCalendarMarkedDates] = useState({});
  const [token, setToken] = useState(null);

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

  return (
   
    <View style={{ flex: 1 }}>
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FD501E" />
          <Text style={styles.loadingText}>Processing Payment...</Text>
        </View>
      )}
    
      <ScrollView contentContainerStyle={styles.container}>
      <LinearGradient
    colors={['#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF',  '#FD501E', '#FD501E', '#FD501E', '#FD501E']}
    style={styles.gradientBackground}
  >
          <LogoTheTrago />


          <Text style={styles.title}>

            The <Text style={[styles.highlight]}>journey</Text> is endless, Book now
          </Text>

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

          <View style={styles.bookingSection}>
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

              {/* Swap icon */}
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
          </View>



          <TouchableOpacity
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
                  returndate: calendarEndDate ,
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
          </Modal>
          <Text style={styles.titledeal}>
            <Text style={styles.highlight}>Hot</Text> Deal
          </Text>
          <Banner />
          <View style={styles.rowtrip}>
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
              
           
            </View>

        

          <ScrollView
            contentContainerStyle={styles.cardList}
            style={{ width: '100%' }}
          >
            {destinations.map((item) => (
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
          </ScrollView>

          </LinearGradient>

      </ScrollView >
   
    </View>
    
  );
};

export default HomeScreen;

