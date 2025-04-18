import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ImageBackground, Dimensions, ActivityIndicator, Modal } from 'react-native';
import DateTimePicker from "@react-native-community/datetimepicker";
import Banner from './(component)/Banner';
import LogoTheTrago from './(component)/Logo';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useCustomer } from './(Screen)/CustomerContext';
import { CalendarList } from 'react-native-calendars';


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

  // ยืนยันการเลือกวัน
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
        <ImageBackground
          source={{ uri: 'https://www.thetrago.com/assets/images/bg/Aliments.png' }}
          style={styles.background}>
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
                    { width: tripType === "One Way Trip" ? wp('73.5%') : 'auto' } // Apply 100% width conditionally
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
                <Text style={styles.searchButtonText}>EXPLORE MORE  <Image source={require('./assets/IconExplo.png')} style={styles.iconExplo} /></Text>
              </TouchableOpacity>
            </View>

            <View style={styles.coltrip}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {destinations.slice(0, 1).map((item) => (
                  <View style={styles.cardContainer} key={item.id}>
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
            </View>
          </View>

          <ScrollView
            contentContainerStyle={styles.cardList}
            style={{ width: '100%' }}
          >
            {destinations.map((item) => (
              <View style={styles.cardContainer} key={item.id}>
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

        </ImageBackground>
      </ScrollView >
    </View>
  );
};






const styles = StyleSheet.create({
  container: {
    fontFamily: 'Domestos',
    flexGrow: 1,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
  },

  logoDate: {
    width: wp('5%'),
    height: wp('5%'),
    marginRight: 10,
  },
  logoLine: {
    width: 29,
    height: 27,
    marginHorizontal: 10, // เพิ่มระยะห่างระหว่างภาพและกล่องอินพุต
  },
  logoSwap: {
    width: 15,
    height: 17,
    marginHorizontal: 15,
    marginLeft: 5,
    marginRight: 0,
    backgroundColor: '#FFF',
    borderRadius: 30,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#002348',
    marginBottom: 20,

  },
  titledeal: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'left', // ชิดซ้าย
    color: '#002348',
    marginBottom: 20,
    marginTop: 20,
    alignSelf: 'flex-start', // ยืนยันให้ข้อความอยู่ชิดซ้าย
    marginLeft: 20, // เพิ่มพื้นที่ห่างจากขอบซ้าย
  },
  highlight: {
    color: '#FD501E',

  },
  tabContainer: {
    flexDirection: 'row',
    marginLeft: 20,
    marginRight: 20,
    marginBottom: 0,
    paddingBottom: 0,
    overflow: 'visible',
  },
  bookingSection: {
    backgroundColor: '#F6F6F6',
    borderRadius: 30,
    padding: wp('3.5%'),
    width: '100%',
    marginBottom: 0,
    paddingBottom: 0,
    shadowColor: '#F6F6F6',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#FEE8E1',
    borderRadius: 25,
  },
  tabOuter: {
    flex: 1,
    alignItems: 'center',

  },
  tabActiveOuter: {
    backgroundColor: '#F6F6F6',
    shadowColor: '#F6F6F6',
    shadowOffset: { width: 0, height: -15 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    borderRadius: 25,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  tabInactiveOuter: {
    backgroundColor: 'transparent',
  },
  tabActive: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#FD501E',
    borderRadius: 25,
    width: '90%',
    margin: 5,
    height: 10,
  },
  tabInactive: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: 'rgba(253, 80, 30, 0.4)',
    borderRadius: 25,
    width: '90%',
    margin: 5,
    opacity: 40,
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  tabTextInactive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  inputBox: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    padding: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    marginHorizontal: 5,
    flex: 1,
    justifyContent: 'center', // จัดตำแหน่งให้เนื้อหาภายในอยู่ตรงกลาง
  },
  rowdepart: {
    flexDirection: 'row',
  },
  inputBoxlocation: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    padding: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    marginHorizontal: 5,
    flex: 1,
    justifyContent: 'center',
    marginRight: 0,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',  // จัดตำแหน่งให้ห่างกันอย่างเหมาะสม
    marginBottom: 15,
  },
  inputBoxCol: {
    flexDirection: 'column',
  },
  inputLabel: {
    fontSize: 12,
    color: '#666',
  },
  inputText: {
    fontSize: 14,
    color: '#333',
    fontWeight: 'bold',
  },
  searchButton: {
    backgroundColor: '#FD501E',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    width: '100%',
  },
  PxploreButton: {
    backgroundColor: '#FD501E',
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 10,
    width: '100%',
  },
  searchButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotContainer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 10,
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: '#FD501E',
  },
  dotInactive: {
    backgroundColor: '#CCC',
  },
  texcol: {
    flexDirection: 'column',
    fontSize: 30,
    fontWeight: 'bold',

  },
  rowtrip: {
    textAlign: 'left',
    marginLeft: 5,
    alignSelf: 'flex-start',
    width: 180,
    flexDirection: 'row',
    marginBottom: 20,
  },
  Detail: {
    color: '#666666',
    marginTop: 5,
  },
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    margin: 10,
    width: (Dimensions.get('window').width - 80) / 2, // ลด margin บนและล่างให้พอดีกับสองคอลัมน์
  },


  cardImage: {
    width: '100%',
    height: 150,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  cardContent: {
    padding: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#002348',
    marginBottom: 5,
  },
  cardLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  cardDuration: {
    fontSize: 12,
    color: '#999',
    marginBottom: 10,
  },
  cardPrice: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  cardPriceColor: {
    fontSize: 14,
    color: '#FD501E',
  },
  cardList: {

    justifyContent: 'space-between',
    flexWrap: 'wrap',
    flexDirection: 'row',
  },

  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconExplo: {
    height: 12,
    width: 12,
  },
  background: {
    width: '100%'
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // พื้นหลังโปร่งใส
    zIndex: 9999, // ✅ ให้ ActivityIndicator อยู่ด้านบนสุด
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // พื้นหลังโปร่งแสง
  },
  modalContainer: {
    width: '80%',
    padding: 20,
    backgroundColor: '#FFF',
    borderRadius: 10,
    alignItems: 'flex-end',
  },
  modalText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'left',
    marginBottom: 15,
    maxWidth: '100%',
    width: '100%',
  },
  modalButton: {
    backgroundColor: '#FD501E',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  modalButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  tripTypeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  tripTypeOneWayButton: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    padding: 10,
    borderRadius: 15,
    borderBottomRightRadius: 0,
    borderTopRightRadius: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    marginHorizontal: 5,
    flex: 1,
    justifyContent: 'center',
    marginRight: 0,
    width: '100%',
    height: 50,
    alignItems: 'center',

  },
  tripTypeRoundButton: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    padding: 10,
    borderRadius: 15,
    borderBottomLeftRadius: 0,
    borderTopLeftRadius: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    marginHorizontal: 5,
    flex: 1,
    justifyContent: 'center',
    marginLeft: 0,
    marginRight: 5,
    width: '100%',
    height: 50,
    alignItems: 'center',

  },
  activeButton: {
    backgroundColor: "#FD501E",

  },
  tripTypeText: {
    fontSize: 16,
    color: "#333",
    fontWeight: 'bold'
  },
  activeText: {
    color: "#FFF",
  },
})
export default HomeScreen;

