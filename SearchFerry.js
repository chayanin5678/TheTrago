import React, { useRef, useState, useEffect, use } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import ipAddress from './ipconfig';
import Icon from 'react-native-vector-icons/Ionicons';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, Modal, FlatList, ImageBackground, Animated, ActivityIndicator } from 'react-native';
import DateTimePicker from "@react-native-community/datetimepicker";
import LogoTheTrago from './(component)/Logo';
import { useCustomer } from './(Screen)/CustomerContext';
import moment from 'moment';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { CalendarList } from 'react-native-calendars';
import styles from './(CSS)/HomeScreenStyles';
import { Ionicons } from '@expo/vector-icons'; // ใช้ไอคอนจาก expo
const itemsPerPage = 5;


const SearchFerry = ({ navigation, route }) => {
  const { customerData, updateCustomerData } = useCustomer();
  // const [detaDepart, setDetaDepart] = useState(new Date(customerData.departdate)); // แปลงวันที่จาก input
  // const [detaReturn, setDetaReturn] = useState(new Date(customerData.returndate)); // แปลงวันที่จาก input
  const [detaDepart, setDetaDepart] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  });

  const [detaReturn, setDetaReturn] = useState(() => {
    const returnDay = new Date(detaDepart);
    returnDay.setDate(returnDay.getDate() + 1);
    return returnDay;
  });

  const [startingPoint, setStartingPoint] = useState({ id: '0', name: 'Starting Point' });
  const [endPoint, setEndPoint] = useState({ id: '0', name: 'Destination' });
  const [searchQuery, setSearchQuery] = useState('');
  const [tripType, setTripType] = useState("One Way Trip");
  const [tripTypeSearch, setTripTypeSearch] = useState("One Way Trip");
  const [tripTypeSearchResult, settripTypeSearchResult] = useState("Depart Trip");
  const [adults, setAdults] = useState(1);
  const [isAdultModalVisible, setAdultModalVisible] = useState(false);
  const [children, setChildren] = useState(0);
  const [isChildModalVisible, setChildModalVisible] = useState(false);
  const [infant, setinfant] = useState(0);
  const [isinfantodalVisible, setinfantModalVisible] = useState(false);
  const [timetableDepart, setTimetableDepart] = useState([]);
  const [timetableReturn, settimetableReturn] = useState([]);
  const [currentPageDepart, setcurrentPageDepart] = useState(1);
  const [currentPageReturn, setcurrentPageReturn] = useState(1);

  const [selectedPickup, setSelectedPickup] = useState(null);
  //  const animatedHeight = useRef(new Animated.Value(0)).current;

  const [isonewaystatus, setIsonewaystatus] = useState(false);
  const [isroudstatus, setIsroudstatus] = useState(false);

  const [departureDate, setDepartureDate] = useState(detaDepart);
  const [returnDate, setReturnDate] = useState(detaReturn);
  const [showDepartPicker, setShowDepartPicker] = useState(false);
  const [showReturnPicker, setShowReturnPicker] = useState(false);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [calendarStartDate, setCalendarStartDate] = useState(new Date().toISOString().split('T')[0]); // string
  const [calendarEndDate, setCalendarEndDate] = useState(new Date().toISOString().split('T')[0]); // string
  const [selectedCompaniesDepart, setSelectedCompaniesDepart] = useState([]);
  const [selectedCompaniesReturn, setSelectedCompaniesReturn] = useState([]);
  const [isFilterModalVisibleDepart, setIsFilterModalVisibleDepart] = useState(false);
  const [isFilterModalVisibleReturn, setIsFilterModalVisibleReturn] = useState(false);
  const [availableCompaniesDepart, setAvailableCompaniesDepart] = useState([]);
  const [allSelectedDepart, setAllSelectedDepart] = useState(true);
  const [availableCompaniesReturn, setAvailableCompaniesReturn] = useState([]);
  const [allSelectedReturn, setAllSelectedReturn] = useState(true);
  const [contentHeights, setContentHeights] = useState({}); // เก็บความสูงของแต่ละ item
  const animatedHeights = useRef({}).current;



  const [calendarMarkedDates, setCalendarMarkedDates] = useState({});
  const day = calendarStartDate?.substring(8, 10) || "";
  console.log("day", day);
  const month = calendarStartDate?.substring(5, 7) || "";
  console.log("month", month);
  const year = calendarStartDate?.substring(0, 4) || "";
  console.log("year", year);
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





  const getAnimatedHeight = (id) => {
    if (!animatedHeights[id]) {
      animatedHeights[id] = new Animated.Value(0);
    }
    return animatedHeights[id];
  };

  // เมื่อกด toggle details
  const toggleDetails = (id) => {
    const animatedHeight = getAnimatedHeight(id);
    if (selectedPickup === id) {
      Animated.timing(animatedHeight, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start(() => setSelectedPickup(null));
    } else {
      setSelectedPickup(id);
      const targetHeight = contentHeights[id] || 0;
      console.log('Animating to height:', targetHeight);
      Animated.timing(animatedHeight, {
        toValue: targetHeight,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  };




  const formatDateInput = (date) => {
    if (!date) return ""; // ตรวจสอบว่ามีค่า date หรือไม่
    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const calculateDiscountedPrice = (price) => {
    if (!price || isNaN(price)) return "N/A"; // ตรวจสอบว่าราคาถูกต้องไหม
    const discountedPrice = price * 0.9; // ลด 10%
    return discountedPrice.toFixed(2); // ปัดเศษทศนิยม 2 ตำแหน่ง
  };

  function formatNumberWithComma(value) {
    if (!value) return "0.00";
    const formattedValue = Number(value).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });


    return formattedValue;
  }
  const removeHtmlTags = (html) => {
    if (!html) return ""; // ตรวจสอบว่ามีค่าหรือไม่

    return html
      .replace(/<ul>/g, "") // ลบ <ul>
      .replace(/<\/ul>/g, "") // ลบ </ul>
      .replace(/<\/li>/g, "") // ลบ </li>
      .replace(/<li>/g, "\n• ") // แทนที่ <li> ด้วยขึ้นบรรทัดใหม่ + จุด
      .replace(/<br\s*\/?>/g, "\n\n") // แทนที่ <br> ด้วยขึ้นบรรทัดใหม่ 2 ครั้ง
      .replace(/<\/p>/g, "\n\n") // แทนที่ </p> ด้วยย่อหน้าใหม่
      .replace(/<p>/g, "") // ลบ <p>
      .replace(/&nbsp;/g, " "); // แทนที่ &nbsp; ด้วยช่องว่าง
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

  const toggleAdultModal = () => {
    setAdultModalVisible(!isAdultModalVisible);
  };

  const handleAdultSelect = (value) => {
    setAdults(value);
    toggleAdultModal(); // Close the modal after selection
  };

  const renderAdultOption = ({ item }) => (
    <TouchableOpacity
      style={styles.modalOption}
      onPress={() => handleAdultSelect(item)}
    >
      <Text style={styles.modalOptionText}>{item}</Text>
    </TouchableOpacity>
  );

  const adultOptions = Array.from({ length: 10 }, (_, i) => i + 1); // Generates numbers from 1 to 10

  const toggleChildModal = () => {
    setChildModalVisible(!isChildModalVisible);
  };

  const handleChildSelect = (value) => {
    setChildren(value);
    toggleChildModal(); // Close the modal after selection
  };

  const renderChildOption = ({ item }) => (
    <TouchableOpacity
      style={styles.modalOption}
      onPress={() => handleChildSelect(item)}
    >
      <Text style={styles.modalOptionText}>{item}</Text>
    </TouchableOpacity>
  );

  const childOptions = Array.from({ length: 11 }, (_, i) => i);

  const toggleInfantModal = () => {
    setinfantModalVisible(!isinfantodalVisible);
  };

  const handleInfantSelect = (value) => {
    setinfant(value);
    toggleInfantModal(); // Close the modal after selection
  };

  const renderInfantOption = ({ item }) => (
    <TouchableOpacity
      style={styles.modalOption}
      onPress={() => handleInfantSelect(item)}
    >
      <Text style={styles.modalOptionText}>{item}</Text>
    </TouchableOpacity>
  );

  const infantOptions = Array.from({ length: 11 }, (_, i) => i);

  function formatTime(time) {
    // แยกเวลาเป็นชั่วโมง นาที และวินาที
    const [hours, minutes, seconds] = time.split(':');

    // แปลงชั่วโมงจาก 24 ชั่วโมงเป็น 12 ชั่วโมง
    const hour = (parseInt(hours) % 12) || 12;

    // ตรวจสอบ AM หรือ PM
    const period = parseInt(hours) >= 12 ? 'PM' : 'AM';

    // คืนค่าผลลัพธ์ในรูปแบบ 12 ชั่วโมง
    return `${hour}:${minutes} ${period}`;
  }

  function formatTimeToHoursAndMinutes(time) {
    let [hours, minutes] = time.split(':');

    // กำจัด 0 ด้านหน้า
    hours = parseInt(hours, 10);
    minutes = parseInt(minutes, 10);

    return `${hours} h ${minutes} min`;
  }

  const formatDate = (dateString) => {
    return moment(dateString).format("ddd, DD MMM YYYY");
  };
  useEffect(() => {
    handleSearchStart();
    handleSearchEnd();
    setDetaDepart(departureDate);
    setDetaReturn(returnDate);
    setTripTypeSearch(tripType);
  }, [startingPoint, endPoint, departureDate, returnDate, tripType, adults, children]);

  useFocusEffect(
    React.useCallback(() => {
      setIsonewaystatus(false);  // Reset the one-way status
      setIsroudstatus(false);    // Reset the round trip status
    }, [])
  );


  const handleSearchStart = () => {


    fetch(`${ipAddress}/search/${startingPoint.id}/${endPoint.id}/${calendarStartDate}`)
      .then((response) => {
        if (!response.ok) {
          // Logging response status for more details
          console.error(`HTTP error! status: ${response.status}`);
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        if (data && Array.isArray(data.data)) {
          setTimetableDepart(data.data);
          const uniqueCompanies = [
            ...new Set(data.data.map(item => item.md_company_nameeng))
          ];

          setSelectedCompaniesDepart(uniqueCompanies);
          setAvailableCompaniesDepart(uniqueCompanies);
          setAllSelectedDepart(true);
        } else {
          console.error('Data is not in expected format', data);
          setTimetableDepart([]);
          setSelectedCompaniesDepart([]);
          setAvailableCompaniesDepart([]);
        }
      })
      .catch((error) => {
        console.error('Error fetching data:', error.message);
        setSelectedCompaniesDepart([]);
        setAvailableCompaniesDepart([]);
      })
      .finally(() => {
        setLoading(false); // Ensure loading is turned off after request is complete
      });

  };

  const handleSearchEnd = () => {
    fetch(`${ipAddress}/search/${endPoint.id}/${startingPoint.id}/${calendarEndDate}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        if (data && Array.isArray(data.data)) {
          settimetableReturn(data.data);
          const uniqueCompanies = [
            ...new Set(data.data.map(item => item.md_company_nameeng))
          ];

          setSelectedCompaniesReturn(uniqueCompanies);
          setAvailableCompaniesReturn(uniqueCompanies);
          setAllSelectedReturn(true);
        } else {
          console.error('Data is not an array', data);
          settimetableReturn([]);
          setSelectedCompaniesReturn([]);
          setAvailableCompaniesReturn([]);
        }
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      }).finally(() => {
        setLoading(false);  // ตั้งค่า loading เป็น false หลังจากทำงานเสร็จ
      });
  };



  // ฟังก์ชันในการเปลี่ยนหน้า
  const goToNextPageDepart = () => {
    if (currentPageDepart * itemsPerPage < filteredDepartData.length) {
      setcurrentPageDepart(currentPageDepart + 1);
    }
  };

  const goToPreviousPageDepart = () => {
    if (currentPageDepart > 1) {
      setcurrentPageDepart(currentPageDepart - 1);
    }
  };


  // ฟังก์ชันในการเปลี่ยนหน้า
  const goToNextPageReturn = () => {
    if (currentPageReturn * itemsPerPage < filteredReturnData.length) {
      setcurrentPageReturn(currentPageReturn + 1);
    }
  };

  const goToPreviousPageReturn = () => {
    if (currentPageReturn > 1) {
      setcurrentPageReturn(currentPageReturn - 1);
    }
  };

  const toggleCompanyDepart = (companyName) => {
    const updated = selectedCompaniesDepart.includes(companyName)
      ? selectedCompaniesDepart.filter(name => name !== companyName)
      : [...selectedCompaniesDepart, companyName];

    setSelectedCompaniesDepart(updated);
    setAllSelectedDepart(updated.length === availableCompaniesDepart.length);
  };

  const toggleCompanyReturn = (companyName) => {
    const updated = selectedCompaniesReturn.includes(companyName)
      ? selectedCompaniesReturn.filter(name => name !== companyName)
      : [...selectedCompaniesReturn, companyName];

    setSelectedCompaniesReturn(updated);
    setAllSelectedReturn(updated.length === availableCompaniesReturn.length);
  };


  const toggleSelectAllDepart = () => {
    if (allSelectedDepart) {
      setSelectedCompaniesDepart([]);
    } else {
      setSelectedCompaniesDepart(availableCompaniesDepart);
    }
    setAllSelectedDepart(!allSelectedDepart);
  };


  const toggleSelectAllReturn = () => {
    if (allSelectedReturn) {
      setSelectedCompaniesReturn([]);
    } else {
      setSelectedCompaniesReturn(availableCompaniesReturn);
    }
    setAllSelectedReturn(!allSelectedReturn);
  };

  const filteredDepartData = timetableDepart.filter(item =>
    selectedCompaniesDepart.includes(item.md_company_nameeng)
  );

  const filteredReturnData = timetableReturn.filter(item =>
    selectedCompaniesReturn.includes(item.md_company_nameeng)
  );

  // ต้องอยู่หลังจาก filter
  const pagedDataDepart = filteredDepartData.slice(
    (currentPageDepart - 1) * itemsPerPage,
    currentPageDepart * itemsPerPage
  );

  const pagedDataReturn = filteredReturnData.slice(
    (currentPageReturn - 1) * itemsPerPage,
    currentPageReturn * itemsPerPage
  );




  return (
    <ScrollView contentContainerStyle={styles.containerSearch}>
      <View style={[
        styles.cardContainerDes,
        {
          width: '115%',
          //height: '25%',
          borderRadius: 40,
          marginTop: -30,
          marginLeft: -30,
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


          <LogoTheTrago />
          <View style={[styles.row, { alignSelf: 'center', width: '85%', justifyContent: 'space-between', alignItems: 'center' }]}>
            <Text style={[styles.titleSearch, { color: '#FFF', shadowOffset: 2, shadowRadius: 6, shadowOpacity: 1, shadowColor: 'black' }]}>Search ferry</Text>

            <TouchableOpacity
              style={{
                backgroundColor: '#FD501E',
                paddingVertical: 10,
                paddingHorizontal: 20,
                borderRadius: 10,
                alignSelf: 'center',
                marginVertical: 10,
              }}
              onPress={() => tripTypeSearchResult === 'Depart Trip' ? setIsFilterModalVisibleDepart(true) : setIsFilterModalVisibleReturn(true)}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>Show filters</Text>
            </TouchableOpacity>
          </View>

          <Modal visible={tripTypeSearchResult === 'Depart Trip' ? isFilterModalVisibleDepart : isFilterModalVisibleReturn} animationType="slide" transparent={true}>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <View style={{ backgroundColor: 'white', width: '90%', borderRadius: 15, padding: 20 }}>
                <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 10 }}>Ferry Operator</Text>

                {/* ✅ ปุ่ม Select All / Clear All */}

                <TouchableOpacity
                  onPress={tripTypeSearchResult === 'Depart Trip' ? toggleSelectAllDepart : toggleSelectAllReturn}
                  style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}
                >

                  <Icon
                    name={tripTypeSearchResult === 'Depart Trip' ? allSelectedDepart ? 'checkbox' : 'square-outline' : allSelectedReturn ? 'checkbox' : 'square-outline'}
                    size={20}
                    color="#FD501E"
                    style={{ marginRight: 8 }}
                  />
                  <Text>Select all</Text>
                </TouchableOpacity>

                {/* ✅ List บริษัท */}
                {tripTypeSearchResult === 'Depart Trip'
                  ? availableCompaniesDepart.map((company) => (
                    <TouchableOpacity
                      key={company}
                      onPress={() => toggleCompanyDepart(company)}
                      style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}
                    >
                      <Icon
                        name={selectedCompaniesDepart.includes(company) ? 'checkbox' : 'square-outline'}
                        size={20}
                        color="#FD501E"
                        style={{ marginRight: 8 }}
                      />
                      <Text>{company}</Text>
                    </TouchableOpacity>
                  ))
                  : availableCompaniesReturn.map((company) => (
                    <TouchableOpacity
                      key={company}
                      onPress={() => toggleCompanyReturn(company)}
                      style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}
                    >
                      <Icon
                        name={selectedCompaniesReturn.includes(company) ? 'checkbox' : 'square-outline'}
                        size={20}
                        color="#FD501E"
                        style={{ marginRight: 8 }}
                      />
                      <Text>{company}</Text>
                    </TouchableOpacity>
                  ))
                }



                {/* ✅ ปุ่มปิด */}
                <TouchableOpacity
                  onPress={() => tripTypeSearchResult === 'Depart Trip' ? setIsFilterModalVisibleDepart(false) : setIsFilterModalVisibleReturn(false)}
                  style={{
                    marginTop: 20,
                    backgroundColor: '#FD501E',
                    padding: 12,
                    borderRadius: 8,
                    alignItems: 'center'
                  }}
                >
                  <Text style={{ color: 'white', fontWeight: 'bold' }}>Apply Filters</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>




        </ImageBackground>
      </View>





      {/* <View style={styles.searcContain}>
          <TextInput
            style={styles.searchBox}
            placeholder="Search Here..."
            placeholderTextColor="#999"
            backgroundColor="white"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <Image source={require('./assets/BTN1.png')} />
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
          <View style={styles.inputBoxDrop}>
            <TouchableOpacity style={styles.button} onPress={toggleAdultModal}>
              <Text style={styles.buttonText}>{adults} Adult</Text>
              <Icon name="chevron-down" size={20} color="#FD501E" style={styles.dropdownIcon} />
            </TouchableOpacity>
            {/* Adult Modal */}
            <Modal
              visible={isAdultModalVisible}
              transparent={true}
              animationType="fade"
              onRequestClose={toggleAdultModal}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <FlatList
                    data={adultOptions}
                    renderItem={renderAdultOption}
                    keyExtractor={(item) => item.toString()}
                  />
                </View>
              </View>
            </Modal>
            <TouchableOpacity style={styles.button} onPress={toggleChildModal}>
              <Text style={styles.buttonText}>{children} Child</Text>
              <Icon name="chevron-down" size={20} color="#FD501E" style={styles.dropdownIcon} />
            </TouchableOpacity>

            {/* Child Modal */}
            <Modal
              visible={isChildModalVisible}
              transparent={true}
              animationType="fade"
              onRequestClose={toggleChildModal}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <FlatList
                    data={childOptions}
                    renderItem={renderChildOption}
                    keyExtractor={(item) => item.toString()}
                  />
                </View>
              </View>
            </Modal>
            <TouchableOpacity style={styles.button} onPress={toggleInfantModal}>
              <Text style={styles.buttonText}>{infant} Infant</Text>
              <Icon name="chevron-down" size={20} color="#FD501E" style={styles.dropdownIcon} />
            </TouchableOpacity>
            {/* Adult Modal */}
            <Modal
              visible={isinfantodalVisible}
              transparent={true}
              animationType="fade"
              onRequestClose={toggleInfantModal}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <FlatList
                    data={infantOptions}
                    renderItem={renderInfantOption}
                    keyExtractor={(item) => item.toString()}
                  />
                </View>
              </View>
            </Modal>
          </View>
        </View>


        <View style={styles.inputRow}>
          <TouchableOpacity
            onPress={() => navigation.navigate('StartingPointScreen', { setStartingPoint })}
            style={styles.inputBoxSearch}
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
            onPress={() => navigation.navigate('EndPointScreen', { setEndPoint, startingPointId: startingPoint.id, })}
            style={styles.inputBoxSearch}
          >
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

          <View style={styles.inputBoxSearch}>
            <TouchableOpacity
              onPress={() => {
                setShowModal(true);  // Show the date picker

              }}
              style={[
                styles.rowdepart,
                { width: tripType === "One Way Trip" ? wp('100%') : 'auto' } // Apply 100% width conditionally
              ]}
            >


              <Image
                source={require('./assets/solar_calendar-bold.png')}
                style={styles.logoDate}
                resizeMode="contain"
              />
              <View style={styles.inputBoxCol}>
                <Text style={styles.inputLabel}>Departure date</Text>
                <Text style={styles.inputText}>{calendarStartDate ? formatDateInput(calendarStartDate.toString()) : "Select Date"}</Text>
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
                    <Text style={styles.inputText}>{calendarEndDate ? formatDateInput(calendarEndDate.toString()) : "No Date Available"}</Text>
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
                    <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{formatDateInput(calendarStartDate) || '-'}</Text>
                  </View>
                  {tripType === 'Return Trip' && (
                    <View style={{ backgroundColor: '#f2f2f2', padding: 10, borderRadius: 10, flex: 1 }}>
                      <Text style={{ fontSize: 12, color: '#555' }}>Return date</Text>
                      <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{formatDateInput(calendarEndDate) || '-'}</Text>
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
                  <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>OK</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>


        </View>
      </View>



      {/* <TouchableOpacity
          style={[styles.searchButton]} // Use an array if you want to combine styles
          onPress={() => {
           

           
          }}>
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity> */}

      {/* แสดงรายการแต่ละหน้า */}
      {loading && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#FD501E" />
        </View>
      )}
      {!loading && pagedDataDepart && pagedDataReturn && (
        <>
          {tripTypeSearch === 'One Way Trip' && (
            <>
              {pagedDataDepart.map((item, index) => (
                <View key={index} style={[styles.cardContainer, { marginTop: 20 }]} >
                  <TouchableOpacity
                    onPress={() => {
                      toggleDetails(item.md_timetable_id);
                    }}
                  >
                    <ImageBackground
                      source={{ uri: 'https://www.thetrago.com/assets/images/bg/ticketmap.webp' }}
                      style={[styles.background, { resizeMode: 'cotain' }]}>
                      <View style={styles.headerRow}>
                        <View style={styles.inputBoxCol}>
                          <Image
                            source={{ uri: `https://thetrago.com/Api/uploads/company/${item.md_company_picname}` }}
                            style={{ width: wp('10.6%'), height: hp('5%') }}
                            resizeMode="cover"
                          />

                          <Text style={styles.shipName}>{item.md_company_nameeng}</Text>
                        </View>
                        <View style={styles.tagContainer}>
                          <Text style={styles.tag}>{item.md_seat_nameeng}</Text>
                          <Text style={styles.tag}>{tripTypeSearch}</Text>
                        </View>
                      </View>

                      <View style={styles.detailsRow}>
                        <View style={styles.locationContainer}>
                          <Text style={styles.location}>{item.start_location_name}</Text>
                          <Text style={styles.subtext}>{item.name_pierstart}</Text>
                          <Text style={styles.time}>{formatTime(item.md_timetable_departuretime)}</Text>
                          <Text style={styles.subtext}>{formatDate(calendarStartDate)}</Text>
                        </View>

                        <View style={styles.middleContainer}>
                          <Text style={styles.duration}>{item.md_boattype_nameeng}</Text>
                          <View style={styles.iconLineContainer}>
                            <View style={styles.dashedLine} />
                            <View style={styles.shipIcon}>
                              <Image source={require('./assets/boat.png')} style={styles.ImageBoat} />
                            </View>
                            <View style={styles.dashedLine} />
                          </View>
                          <Text style={styles.duration}>{formatTimeToHoursAndMinutes(item.md_timetable_time)}</Text>
                        </View>

                        <View style={styles.locationContainer}>
                          <Text style={styles.location}>{item.end_location_name}</Text>
                          <Text style={styles.subtext}>{item.name_pierend}</Text>
                          <Text style={styles.time}>{formatTime(item.md_timetable_arrivaltime)}</Text>
                          <Text style={styles.subtext}>{formatDate(calendarStartDate)}</Text>
                        </View>
                      </View>

                      <View style={styles.TicketRow}>
                        <View style={styles.circleContainerLeft}>
                          <View style={styles.circleLeft1}></View>
                          <View style={styles.circleLeft2}></View>
                        </View>
                        <View style={styles.dashedLineTicket} />
                        <View style={styles.circleContainerRight}>
                          <View style={styles.circleRight1}></View>
                          <View style={styles.circleRight2}></View>
                        </View>
                      </View>

                      <View style={styles.footerRow}>
                        <Text style={styles.price}>THB <Text style={styles.pricebig}>{formatNumberWithComma(calculateDiscountedPrice(item.md_timetable_saleadult))} </Text>/ person <Text style={styles.discount}>10% Off</Text></Text>
                        <TouchableOpacity style={styles.bookNowButton}
                          onPress={() => {

                            updateCustomerData({
                              roud: 1,
                              day: day,
                              month: month,
                              year: year,
                              departdate: calendarStartDate,
                              timeTableDepartId: item.md_timetable_id,
                              startingPointId: startingPoint.id,
                              startingpoint_name: startingPoint.name,
                              endPointId: endPoint.id,
                              endpoint_name: endPoint.name,
                              companyDepartId: item.md_timetable_companyid,
                              pierStartDepartId: item.md_timetable_pierstart,
                              pierEndDepartId: item.md_timetable_pierend,
                              netDepart: item.md_timetable_netadult,
                              adult: adults,
                              child: children,
                              infant: infant,
                              timetableReturn: item.md_timetable_id,
                              piccompanyDepart: item.md_company_picname,
                              pictimetableDepart: item.md_timetabledetail_picname1,

                            });

                            navigation.navigate('TripDetail');
                          }} >
                          <Text style={styles.bookNowText}>Book Now</Text>

                        </TouchableOpacity>
                      </View>
                      {item.md_timetable_remarkeng && console.log("รูป timetable:", item.md_timetabledetail_picname1) && (
                        <View style={styles.remarkContainer}>
                          <Text style={styles.remarkText}>
                            <Text style={styles.remarkLabel}>Remark: </Text>
                            {item.md_timetable_remarkeng}
                          </Text>
                        </View>
                      )}
                      <View
                        style={{ position: 'absolute', opacity: 0, left: 0, top: 0, right: 0, zIndex: -1 }}
                        onLayout={(e) => {
                          const h = e.nativeEvent.layout.height;
                          if (contentHeights[item.md_timetable_id] !== h) {
                            setContentHeights(prev => ({ ...prev, [item.md_timetable_id]: h }));
                            console.log('Measured hidden height:', h);
                          }
                        }}
                      >
                        <Text>{removeHtmlTags(item.md_timetabledetail_detaileng1 || "")}</Text>
                        <Image
                          source={{ uri: `https://www.thetrago.com/Api/uploads/timetabledetail/${item.md_timetabledetail_picname1}` }}
                          style={{ width: '100%', height: 150, resizeMode: 'cover', marginTop: 10, borderRadius: 20 }}
                        />
                      </View>

                      {/* Animated detail */}
                      <Animated.View
                        style={{
                          maxHeight: selectedPickup === item.md_timetable_id ? getAnimatedHeight(item.md_timetable_id) : 0,
                          overflow: 'hidden',
                        }}
                      >
                        <Text style={{ color: '#666666' }}>{removeHtmlTags(item.md_timetabledetail_detaileng1 || "")}</Text>
                        <Image
                          source={{ uri: `https://www.thetrago.com/Api/uploads/timetabledetail/${item.md_timetabledetail_picname1}` }}
                          style={{ width: '100%', height: 150, resizeMode: 'cover', marginTop: 10, borderRadius: 20 }}
                        />
                      </Animated.View>



                    </ImageBackground>
                  </TouchableOpacity>
                </View>
              ))}
            </>)}


          {tripTypeSearch === 'Return Trip' && (
            <>
              <View style={styles.tripTypeContainer}>
                <TouchableOpacity
                  style={[
                    styles.tripTypeOneWayButton,
                    tripTypeSearchResult === "Depart Trip" && styles.activeButton,
                  ]}
                  onPress={() => settripTypeSearchResult("Depart Trip")}
                >
                  <Text
                    style={[
                      styles.tripTypeText,
                      tripTypeSearchResult === "Depart Trip" && styles.activeText,
                    ]}
                  >
                    Depart Trip
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.tripTypeRoundButton,
                    tripTypeSearchResult === "Return Trip" && styles.activeButton,
                  ]}
                  onPress={() => settripTypeSearchResult("Return Trip")}
                >
                  <Text
                    style={[
                      styles.tripTypeText,
                      tripTypeSearchResult === "Return Trip" && styles.activeText,
                    ]}
                  >
                    Return Trip
                  </Text>
                </TouchableOpacity>
              </View>
              {tripTypeSearchResult === 'Depart Trip' && (<>
                {pagedDataDepart.map((item, index) => (
                  <View key={index} style={styles.cardContainer} >
                    <TouchableOpacity
                      onPress={() => {
                        toggleDetails(item.md_timetable_id);
                      }}
                    >
                      <ImageBackground
                        source={{ uri: 'https://www.thetrago.com/assets/images/bg/ticketmap.webp' }}
                        style={styles.background}>
                        <View style={styles.headerRow}>
                          <View style={styles.inputBoxCol}>
                            <Image
                              source={{ uri: `https://thetrago.com/Api/uploads/company/${item.md_company_picname}` }}
                              style={{ width: wp('10.6%'), height: hp('5%') }}
                              resizeMode="cover"
                            />
                            <Text style={styles.shipName}>{item.md_company_nameeng}</Text>
                          </View>
                          <View style={styles.tagContainer}>
                            <Text style={styles.tag}>{item.md_seat_nameeng}</Text>
                            <Text style={styles.tag}>{tripTypeSearchResult}</Text>
                          </View>
                        </View>

                        <View style={styles.detailsRow}>
                          <View style={styles.locationContainer}>
                            <Text style={styles.location}>{item.start_location_name}</Text>
                            <Text style={styles.subtext}>{item.name_pierstart}</Text>
                            <Text style={styles.time}>{formatTime(item.md_timetable_departuretime)}</Text>
                            <Text style={styles.subtext}>{formatDate(calendarStartDate)}</Text>
                          </View>

                          <View style={styles.middleContainer}>
                            <Text style={styles.duration}>{item.md_boattype_nameeng}</Text>
                            <View style={styles.iconLineContainer}>
                              <View style={styles.dashedLine} />
                              <View style={styles.shipIcon}>
                                <Image source={require('./assets/boat.png')} style={styles.ImageBoat} />
                              </View>
                              <View style={styles.dashedLine} />
                            </View>
                            <Text style={styles.duration}>{formatTimeToHoursAndMinutes(item.md_timetable_time)}</Text>
                          </View>

                          <View style={styles.locationContainer}>
                            <Text style={styles.location}>{item.end_location_name}</Text>
                            <Text style={styles.subtext}>{item.name_pierend}</Text>
                            <Text style={styles.time}>{formatTime(item.md_timetable_arrivaltime)}</Text>
                            <Text style={styles.subtext}>{formatDate(calendarStartDate)}</Text>
                          </View>
                        </View>

                        <View style={styles.TicketRow}>
                          <View style={styles.circleContainerLeft}>
                            <View style={styles.circleLeft1}></View>
                            <View style={styles.circleLeft2}></View>
                          </View>
                          <View style={styles.dashedLineTicket} />
                          <View style={styles.circleContainerRight}>
                            <View style={styles.circleRight1}></View>
                            <View style={styles.circleRight2}></View>
                          </View>
                        </View>

                        <View style={styles.footerRow}>
                          <Text style={styles.price}>THB <Text style={styles.pricebig}>{formatNumberWithComma(calculateDiscountedPrice(item.md_timetable_saleadult))} </Text>/ person <Text style={styles.discount}>10% Off</Text></Text>
                          <TouchableOpacity
                            style={styles.bookNowButton}
                            onPress={() => {
                              // Update customer data
                              setIsonewaystatus(true);
                              updateCustomerData({
                                roud: 2,
                                day: day,
                                month: month,
                                year: year,
                                departdate: calendarStartDate,
                                returnDate: calendarEndDate,
                                timeTableDepartId: item.md_timetable_id,
                                startingPointId: startingPoint.id,
                                startingpoint_name: startingPoint.name,
                                endPointId: endPoint.id,
                                endpoint_name: endPoint.name,
                                companyDepartId: item.md_timetable_companyid,
                                pierStartDepartId: item.md_timetable_pierstart,
                                pierEndDepartId: item.md_timetable_pierend,
                                netDepart: item.md_timetable_netadult,
                                adult: adults,
                                child: children,
                                infant: infant,
                                piccompanyDepart: item.md_company_picname,
                                pictimetableDepart: item.md_timetabledetail_picname1,

                              });


                              // Check if round trip status is true before navigating
                              if (isroudstatus) {
                                navigation.navigate('TripDetail');
                              } else {
                                settripTypeSearchResult("Return Trip");
                              }
                            }}
                          >
                            <Text style={styles.bookNowText}>Book Now</Text>

                          </TouchableOpacity>
                        </View>
                        {item.md_timetable_remarkeng && (
                          <View style={styles.remarkContainer}>
                            <Text style={styles.remarkText}>
                              <Text style={styles.remarkLabel}>Remark: </Text>
                              {item.md_timetable_remarkeng}
                            </Text>
                          </View>
                        )}

                        <View
                          style={{ position: 'absolute', opacity: 0, left: 0, top: 0, right: 0, zIndex: -1 }}
                          onLayout={(e) => {
                            const h = e.nativeEvent.layout.height;
                            if (contentHeights[item.md_timetable_id] !== h) {
                              setContentHeights(prev => ({ ...prev, [item.md_timetable_id]: h }));
                              console.log('Measured hidden height:', h);
                            }
                          }}
                        >
                          <Text>{removeHtmlTags(item.md_timetabledetail_detaileng1 || "")}</Text>
                          <Image
                            source={{ uri: `https://www.thetrago.com/Api/uploads/timetabledetail/${item.md_timetabledetail_picname1}` }}
                            style={{ width: '100%', height: 150, resizeMode: 'cover', marginTop: 10, borderRadius: 20 }}
                          />
                        </View>

                        {/* Animated detail */}
                        <Animated.View
                          style={{
                            maxHeight: selectedPickup === item.md_timetable_id ? getAnimatedHeight(item.md_timetable_id) : 0,
                            overflow: 'hidden',
                          }}
                        >
                          <Text style={{ color: '#666666' }}>{removeHtmlTags(item.md_timetabledetail_detaileng1 || "")}</Text>
                          <Image
                            source={{ uri: `https://www.thetrago.com/Api/uploads/timetabledetail/${item.md_timetabledetail_picname1}` }}
                            style={{ width: '100%', height: 150, resizeMode: 'cover', marginTop: 10, borderRadius: 20 }}
                          />
                        </Animated.View>




                      </ImageBackground>
                    </TouchableOpacity>
                  </View>

                ))}
              </>)}
              {tripTypeSearchResult === 'Return Trip' && (<>
                {pagedDataReturn.map((item, index) => (
                  <View key={index} style={styles.cardContainer} >
                    <TouchableOpacity
                      onPress={() => {
                        toggleDetails(item.md_timetable_id);
                      }}
                    >
                      <ImageBackground
                        source={{ uri: 'https://www.thetrago.com/assets/images/bg/ticketmap.webp' }}
                        style={[styles.background, { width: '100%', resizeMode: 'cover' }]}  >
                      <View style={styles.headerRow}>
                        <View style={styles.inputBoxCol}>
                          <Image
                            source={{ uri: `https://thetrago.com/Api/uploads/company/${item.md_company_picname}` }}
                            style={{ width: wp('10.6%'), height: hp('5%') }}
                            resizeMode="cover"
                          />
                          <Text style={styles.shipName}>{item.md_company_nameeng}</Text>
                        </View>
                        <View style={styles.tagContainer}>
                          <Text style={styles.tag}>{item.md_seat_nameeng}</Text>
                          <Text style={styles.tag}>{tripTypeSearchResult}</Text>
                        </View>
                      </View>

                      <View style={styles.detailsRow}>
                        <View style={styles.locationContainer}>
                          <Text style={styles.location}>{item.start_location_name}</Text>
                          <Text style={styles.subtext}>{item.name_pierstart}</Text>
                          <Text style={styles.time}>{formatTime(item.md_timetable_departuretime)}</Text>
                          <Text style={styles.subtext}>{formatDate(calendarEndDate)}</Text>
                        </View>

                        <View style={styles.middleContainer}>
                          <Text style={styles.duration}>{item.md_boattype_nameeng}</Text>
                          <View style={styles.iconLineContainer}>
                            <View style={styles.dashedLine} />
                            <View style={styles.shipIcon}>
                              <Image source={require('./assets/boat.png')} style={styles.ImageBoat} />
                            </View>
                            <View style={styles.dashedLine} />
                          </View>
                          <Text style={styles.duration}>{formatTimeToHoursAndMinutes(item.md_timetable_time)}</Text>
                        </View>

                        <View style={styles.locationContainer}>
                          <Text style={styles.location}>{item.end_location_name}</Text>
                          <Text style={styles.subtext}>{item.name_pierend}</Text>
                          <Text style={styles.time}>{formatTime(item.md_timetable_arrivaltime)}</Text>
                          <Text style={styles.subtext}>{formatDate(calendarEndDate)}</Text>
                        </View>
                      </View>

                      <View style={styles.TicketRow}>
                        <View style={styles.circleContainerLeft}>
                          <View style={styles.circleLeft1}></View>
                          <View style={styles.circleLeft2}></View>
                        </View>
                        <View style={styles.dashedLineTicket} />
                        <View style={styles.circleContainerRight}>
                          <View style={styles.circleRight1}></View>
                          <View style={styles.circleRight2}></View>
                        </View>
                      </View>

                      <View style={styles.footerRow}>
                        <Text style={styles.price}>THB <Text style={styles.pricebig}>{formatNumberWithComma(calculateDiscountedPrice(item.md_timetable_saleadult))} </Text>/ person <Text style={styles.discount}>10% Off</Text></Text>
                        <TouchableOpacity
                          style={styles.bookNowButton}
                          onPress={() => {
                            setIsroudstatus(true);
                            updateCustomerData({
                              returndate: calendarEndDate,
                              timeTableReturnId: item.md_timetable_id,
                              companyReturnId: item.md_timetable_companyid,
                              pierStartReturntId: item.md_timetable_pierstart,
                              pierEndReturntId: item.md_timetable_pierend,
                              piccompanyReturn: item.md_company_picname,
                              pictimetableReturn: item.md_timetabledetail_picname1,
                            });

                            // Check if round trip status is true before navigating
                            if (isonewaystatus) {
                              navigation.navigate('TripDetail');
                            } else {
                              settripTypeSearchResult("Depart Trip");
                            }
                          }}
                        >
                          <Text style={styles.bookNowText}>Book Now</Text>

                        </TouchableOpacity>
                      </View>
                      {item.md_timetable_remarkeng && (
                        <View style={styles.remarkContainer}>
                          <Text style={styles.remarkText}>
                            <Text style={styles.remarkLabel}>Remark: </Text>
                            {item.md_timetable_remarkeng}
                          </Text>
                        </View>
                      )}

                      <View
                        style={{ position: 'absolute', opacity: 0, left: 0, top: 0, right: 0, zIndex: -1 }}
                        onLayout={(e) => {
                          const h = e.nativeEvent.layout.height;
                          if (contentHeights[item.md_timetable_id] !== h) {
                            setContentHeights(prev => ({ ...prev, [item.md_timetable_id]: h }));
                            console.log('Measured hidden height:', h);
                          }
                        }}
                      >
                        <Text>{removeHtmlTags(item.md_timetabledetail_detaileng1 || "")}</Text>
                        <Image
                          source={{ uri: `https://www.thetrago.com/Api/uploads/timetabledetail/${item.md_timetabledetail_picname1}` }}
                          style={{ width: '100%', height: 150, resizeMode: 'cover', marginTop: 10, borderRadius: 20 }}
                        />
                      </View>

                      {/* Animated detail */}
                      <Animated.View
                        style={{
                          maxHeight: selectedPickup === item.md_timetable_id ? getAnimatedHeight(item.md_timetable_id) : 0,
                          overflow: 'hidden',
                        }}
                      >
                        <Text style={{ color: '#666666' }}>{removeHtmlTags(item.md_timetabledetail_detaileng1 || "")}</Text>
                        <Image
                          source={{ uri: `https://www.thetrago.com/Api/uploads/timetabledetail/${item.md_timetabledetail_picname1}` }}
                          style={{ width: '100%', height: 150, resizeMode: 'cover', marginTop: 10, borderRadius: 20 }}
                        />
                      </Animated.View>




                    </ImageBackground>
                  </TouchableOpacity>
                  </View>


                ))}

            </>)}
        </>)}
    </>
  )
}

{/* ปุ่มสำหรับการเปลี่ยนหน้า */ }
{
  tripTypeSearchResult === 'Depart Trip' && filteredDepartData != null && timetableDepart.length > 0 && (<>
    <View style={styles.pagination}>
      <TouchableOpacity
        onPress={goToPreviousPageDepart}
        disabled={currentPageDepart === 1}
        style={styles.button}
      >
        <Icon
          name="chevron-back"
          size={20}
          color={currentPageDepart === 1 ? '#ccc' : 'black'}
        />
      </TouchableOpacity>
      <Text style={styles.paginationText}>{currentPageDepart}</Text>
      <TouchableOpacity
        onPress={goToNextPageDepart}
        disabled={currentPageDepart * itemsPerPage >= filteredDepartData.length}
        style={styles.button}
      >
        <Icon
          name="chevron-forward"
          size={20}
          color={
            currentPageDepart * itemsPerPage >= filteredDepartData.length
              ? '#ccc'
              : 'black'
          }
        />
      </TouchableOpacity>
    </View>
  </>)
}

{
  tripTypeSearchResult === 'Return Trip' && filteredReturnData != null && timetableReturn.length > 0 && (<>
    <View style={styles.pagination}>
      <TouchableOpacity
        onPress={goToPreviousPageReturn}
        disabled={currentPageReturn === 1}
        style={styles.button}
      >
        <Icon
          name="chevron-back"
          size={20}
          color={currentPageReturn === 1 ? '#ccc' : 'black'}
        />
      </TouchableOpacity>
      <Text style={styles.paginationText}>{currentPageReturn}</Text>
      <TouchableOpacity
        onPress={goToNextPageReturn}
        disabled={currentPageReturn * itemsPerPage >= filteredReturnData.length}
        style={styles.button}
      >
        <Icon
          name="chevron-forward"
          size={20}
          color={
            currentPageReturn * itemsPerPage >= filteredReturnData.length
              ? '#ccc'
              : 'black'
          }
        />
      </TouchableOpacity>
    </View>
  </>)
}
<View style={styles.rowButton}>
  <TouchableOpacity
    style={[styles.BackButton]} // Use an array if you want to combine styles
    onPress={() => {
      navigation.goBack();
    }}>
    <Text style={styles.BackButtonText}>Go Back</Text>
  </TouchableOpacity>
</View>

    </ScrollView >
  );
};



export default SearchFerry;