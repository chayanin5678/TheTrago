import React, { useRef, useState, useEffect  } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/Ionicons';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, FlatList, Dimensions, SectionList } from 'react-native';


import DateTimePickerModal from "react-native-modal-datetime-picker";




const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();
const banners = [
  require('./assets/banner1.png'), // Path ของภาพแบนเนอร์แรก
  require('./assets/banner2.png'), // Path ของภาพแบนเนอร์ที่สอง
  require('./assets/banner3.png'), // Path ของภาพแบนเนอร์ที่สาม
];

const destinations = [
  { id: '1', title: 'Lorem ipsum odor', location: 'Lorem, Indonesia', duration: '5 Days', price: '$225', image: require('./assets/destination1.png') },
  { id: '2', title: 'Lorem ipsum odor', location: 'Lorem, Italy', duration: '10 Days', price: '$570', image: require('./assets/destination2.png') },
  { id: '3', title: 'Lorem ipsum odor', location: 'Lorem, France', duration: '7 Days', price: '$400', image: require('./assets/destination3.png') },
];

const HomeScreen = ({navigation }) => {
  const [activeTab, setActiveTab] = useState('Ferry');  // ใช้ state เพื่อจัดการเมนูที่เลือก
  const flatListRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [startingPoint, setStartingPoint] = useState({ id: '0' ,name: 'Starting Point'});
  const [endPoint, setEndPoint] = useState({ id: '0' ,name: 'End Point'});
 
  const [isDepartureDatePickerVisible, setDepartureDatePickerVisible] = useState(false);
  const [isReturnDatePickerVisible, setReturnDatePickerVisible] = useState(false);
  const tomorrow = new Date();
   tomorrow.setDate(tomorrow.getDate() + 1); // Set the date to tomorrow
const formattedDepartureDate = tomorrow.toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' }); // Format the date
const [departureDate, setDepartureDate] = useState(formattedDepartureDate); 


const initialReturnDate = new Date(tomorrow); // Clone the departure date
initialReturnDate.setDate(initialReturnDate.getDate() + 1); // Add one day
const formattedReturnDate = initialReturnDate.toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' });

const [returnDate, setReturnDate] = useState(formattedReturnDate);


  // Show the date picker
  const showDepartureDatePicker = () => setDepartureDatePickerVisible(true);
  const showReturnDatePicker = () => setReturnDatePickerVisible(true);

  // Hide the date picker
  const hideDepartureDatePicker = () => setDepartureDatePickerVisible(false);
  const hideReturnDatePicker = () => setReturnDatePickerVisible(false);

  // Handle the date selection
  const handleDepartureDateConfirm = (date) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' }; // รูปแบบวันที่ที่ต้องการ
    setDepartureDate(date.toLocaleDateString('en-GB', options)); // 'en-GB' เพื่อให้แสดงเดือนในรูปแบบสั้น เช่น Jan, Feb
    hideDepartureDatePicker();
  };
  
  const handleReturnDateConfirm = (date) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' }; // รูปแบบวันที่ที่ต้องการ
    setReturnDate(date.toLocaleDateString('en-GB', options)); // 'en-GB' เพื่อให้แสดงเดือนในรูปแบบสั้น เช่น Jan, Feb
    hideReturnDatePicker();
  };
  

  
  useEffect(() => {
  const interval = setInterval(() => {
    const nextIndex = (currentIndex + 1) % banners.length;
    setCurrentIndex(nextIndex);
    
    // คำนวณ offset โดยใช้ดัชนี (index) คูณกับความกว้างของหน้าจอ
    const offset = nextIndex * Dimensions.get('window').width;
    
    flatListRef.current?.scrollTo({ x: offset, animated: true }); // ใช้ scrollTo แทน scrollToIndex
  }, 3000);

  return () => clearInterval(interval); // ล้าง interval เมื่อ component ถูกทำลาย
}, [currentIndex]);

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
    <ScrollView  contentContainerStyle={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={require('./assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
       
      </View>

      <Text style={styles.title}>
        The <Text style={styles.highlight}>journey</Text> is endless, Book now
      </Text>

      <View style={styles.tabContainer}>
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
      </View>

      <View style={styles.bookingSection}>
        <View style={styles.inputRow}>
        <TouchableOpacity
              onPress={() => navigation.navigate('StartingPointScreen', { setStartingPoint })}
              style={styles.inputBox} >         
              <Image
              source={require('./assets/directions_boat.png')}
              style={styles.logoDate}
              resizeMode="contain"
              />
          <View >  
            <View style={styles.inputBoxCol}>
              <Text style={styles.inputLabel}>From</Text>
              <Text style = {styles.inputText}> {truncateText(startingPoint.name)}</Text>
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
              onPress={() => navigation.navigate('EndPointScreen', { setEndPoint ,startingPointId: startingPoint.id,})}
              style={styles.inputBox} >     
            <Image
              source={require('./assets/location_on.png')}
              style={styles.logoDate}
              resizeMode="contain"
            />
            <View style={styles.inputBoxCol}>
              <Text style={styles.inputLabel}>To</Text>
              <Text style = {styles.inputText}> {truncateText(endPoint.name)}</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.inputRow}>
       
          <View style={styles.inputBox}>
          <TouchableOpacity onPress={showDepartureDatePicker}
          style={styles.rowdepart}>
            <Image
              source={require('./assets/solar_calendar-bold.png')}
              style={styles.logoDate}
              resizeMode="contain"
            />
            <View style={styles.inputBoxCol}>
              <Text style={styles.inputLabel}>Departure date</Text>
              <Text style={styles.inputText}>{departureDate}</Text>
            </View>
            </TouchableOpacity>

            <Image
              source={require('./assets/Line 2.png')}
              style={styles.logoLine}
              resizeMode="contain"
            />
             <TouchableOpacity onPress={showReturnDatePicker}
          style={styles.rowdepart}>
            <Image
              source={require('./assets/solar_calendar-yellow.png')}
              style={styles.logoDate}
              resizeMode="contain"
            />
            <View style={styles.inputBoxCol}>
              <Text style={styles.inputLabel}>Return date</Text>
              <Text style={styles.inputText}>{returnDate}</Text>
            </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Date Pickers for Departure and Return Date */}
      <DateTimePickerModal
    isVisible={isDepartureDatePickerVisible}
    mode="date"
    date={tomorrow} // Set the initial date to tomorrow
    minimumDate={tomorrow} // Prevent selecting a date before tomorrow
    onConfirm={handleDepartureDateConfirm}
    onCancel={hideDepartureDatePicker}
    customStyles={{
      datePicker: {
        backgroundColor: '#FD501E',
      },
      dateInput: {
        backgroundColor: '#FD501E',
        borderColor: '#FD501E',
        borderWidth: 1,
      },
      dateText: {
        color: 'white',
      },
      header: {
        backgroundColor: '#FD501E',
        color: 'white',
      },
      cancelButton: {
        backgroundColor: 'transparent',
        color: 'white',
      },
      confirmButton: {
        backgroundColor: 'transparent',
        color: 'white',
      },
    }}
  />
      <DateTimePickerModal
        isVisible={isReturnDatePickerVisible}
        mode="date"
        date={initialReturnDate}
        minimumDate={initialReturnDate}
        onConfirm={handleReturnDateConfirm}
        onCancel={hideReturnDatePicker}
      />

<TouchableOpacity 
  style={styles.searchButton}
  onPress={() => {
    if (startingPoint.id !== '0' && endPoint.id !== '0') {
      navigation.navigate('SearchFerry',{
        startingPointId: startingPoint.id,
        endPointId: endPoint.id,
        startingPointName: startingPoint.name,
        endPointName: endPoint.name,
        departureDateInput: departureDate,
        returnDateInput: returnDate

      });
    } else {
      alert('Please select both starting and end points.');
    }
  }}
>
  <Text style={styles.searchButtonText}>Search</Text>
</TouchableOpacity>
      <Text style={styles.titledeal}>
        <Text style={styles.highlight}>Hot</Text> Deal
      </Text>
      <View style={styles.carouselContainer}>
  <ScrollView
    ref={flatListRef}
    horizontal
    pagingEnabled
    showsHorizontalScrollIndicator={false}
    onScroll={(event) => {
      const slideIndex = Math.round(
        event.nativeEvent.contentOffset.x / Dimensions.get('window').width
      );
      setCurrentIndex(slideIndex);
    }}
  >
    {banners.map((banner, index) => (
      <Image key={index} source={banner} style={styles.bannerImage} />
    ))}
  </ScrollView>
  <View style={styles.dotContainer}>
    {banners.map((_, index) => (
      <View
        key={index}
        style={[styles.dot, currentIndex === index ? styles.dotActive : styles.dotInactive]}
      />
    ))}
  </View>
</View>

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


    </ScrollView >
  );
};






const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  logoContainer: {
    marginTop: 20,
    width: '100%',
    justifyContent: 'space-between',
    marginBottom: 30,
    flexDirection: 'row',
  },
  logo: {
    width: 97,
    height: 31,
  },
  logoDate: {
    width: 29,
    height: 27,
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
   backgroundColor:'#FFF',
   borderRadius:30,
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
    padding: 20,
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
    borderBottomLeftRadius:0,
    borderBottomRightRadius:0,
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
    margin:5,
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
  rowdepart:{
    flexDirection: 'row',
  },
  inputBoxlocation:{
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
  carouselContainer: {
    marginTop: -20,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  bannerImage: {
    width: Dimensions.get('window').width * 0.9,
    height: 200,
    borderRadius: 10,
  
    marginRight:41,
    resizeMode: 'contain',
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
  texcol:{
    flexDirection: 'column',
    fontSize: 30,
    fontWeight: 'bold',
    
  },
  rowtrip: {
    textAlign: 'left',
    marginLeft:5,
    alignSelf: 'flex-start',
    width:180,
    flexDirection:'row',
    marginBottom: 20,
  },
  Detail:{
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
  iconExplo:{
     height: 12,
     width:12,
  },
})
export default HomeScreen;

   