import React, { useRef, useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, SafeAreaView, Modal, TextInput, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import ipAddress from './ipconfig';
import Icon from 'react-native-vector-icons/Ionicons';
import DateTimePicker from "@react-native-community/datetimepicker";
import LogoTheTrago from './(component)/Logo';
import { useCustomer } from './(Screen)/CustomerContext';
import moment from 'moment';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { CalendarList, Calendar } from 'react-native-calendars';
import styles from './(CSS)/HomeScreenStyles';
import { Ionicons } from '@expo/vector-icons'; // ใช้ไอคอนจาก expo
import { AntDesign, MaterialIcons } from '@expo/vector-icons';
import headStyles from './(CSS)/StartingPointScreenStyles';
import LottieView from 'lottie-react-native';
import axios from 'axios';
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

  const [startingPoint, setStartingPoint] = useState({ id: customerData.startingPointId, name: customerData.startingpoint_name, countryId: customerData.countrycode });
  const [endPoint, setEndPoint] = useState({ id: customerData.endPointId, name: customerData.endpoint_name });
  const [searchQuery, setSearchQuery] = useState('');
  const [tripType, setTripType] = useState("One Way Trip");
  const [tripTypeSearch, setTripTypeSearch] = useState("One Way Trip");
  const [tripTypeSearchResult, settripTypeSearchResult] = useState("Depart Trip");
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infant, setInfant] = useState(0);
  const [isPassengerModalVisible, setPassengerModalVisible] = useState(false);
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
  const [discount, setDiscount] = useState(0);
  const shimmerAnim = useRef(new Animated.Value(-300)).current;

  const [departTrips, setDepartTrips] = useState([]);
  const [returnTrips, setReturnTrips] = useState([]);
  const [error, setError] = useState(null);
  const [selectedCurrency, setSelectedCurrency] = useState('THB');
  const [selectedSysmbol, setSelectedSysmbol] = useState('฿');
  const [isCurrencyModalVisible, setCurrencyModalVisible] = useState(false);
  const [currencyList, setCurrencyList] = useState([]);


  const [calendarMarkedDates, setCalendarMarkedDates] = useState({});
  const day = calendarStartDate?.substring(8, 10) || "";
  console.log("day", day);
  const month = calendarStartDate?.substring(5, 7) || "";
  console.log("month", month);
  const year = calendarStartDate?.substring(0, 4) || "";
  console.log("year", year);
  console.log("country", startingPoint.countryId);
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

  useEffect(() => {
    fetch(`${ipAddress}/currency`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'success') {
          setCurrencyList(data.data);
        } else {
          console.error('Unexpected response:', data);
        }
      })
      .catch((err) => {
        console.error('Fetch error:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);





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
      .replace(/<ul>/g, "")                     // ลบ <ul>
      .replace(/<\/ul>/g, "")                   // ลบ </ul>
      .replace(/<\/li>/g, "")                   // ลบ </li>
      .replace(/<li>/g, "\n• ")                 // แทนที่ <li> ด้วย bullet
      .replace(/<br\s*\/?>/g, "\n\n")           // แทนที่ <br> ด้วยเว้นบรรทัด
      .replace(/<\/p>/g, "\n\n")                // แทนที่ </p> ด้วยเว้นวรรค
      .replace(/<p>/g, "")                      // ลบ <p>
      .replace(/&nbsp;/g, " ")                  // แทน &nbsp; ด้วยช่องว่าง
      .replace(/<strong>/g, "")                 // ลบ <strong>
      .replace(/<\/strong>/g, "");              // ลบ </strong>
  };



  const swapPoints = () => {
    setStartingPoint((prev) => endPoint);
    setEndPoint((prev) => startingPoint);
  };

  const truncateText = (text, maxLength = 8) => {
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
  }, [startingPoint, endPoint, departureDate, returnDate, tripType, adults, children, calendarStartDate, calendarEndDate]);

  useEffect(() => {
    if (
      customerData?.roud !== undefined &&
      startingPoint?.id && startingPoint.id != 0 && endPoint?.id && endPoint.id != 0 &&
      calendarStartDate &&
      (customerData.roud === 0 || calendarEndDate) // ถ้าเป็น roundtrip ต้องมี return date
    ) {
      fetchFerryRoute();
    }
  }, [customerData, startingPoint, endPoint, calendarStartDate, calendarEndDate, selectedCurrency]);




  useFocusEffect(
    React.useCallback(() => {
      setIsonewaystatus(false);  // Reset the one-way status
      setIsroudstatus(false);    // Reset the round trip status
    }, [])
  );


  const handleSearchStart = () => {


    fetch(`${ipAddress}/search/${startingPoint.id}/${endPoint.id}/${calendarStartDate}/THB`)
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

  const fetchFerryRoute = async () => {
    try {
      // ตรวจสอบค่าก่อนส่ง (optional แต่ดีมาก)
      console.log({
        lang: 'en',
        currency: selectedCurrency,
        roundtrip: customerData.roud,
        locationstart: startingPoint.id,
        locationend: endPoint.id,
        adult: adults,
        child: children,
        infant: infant,
        departdate: calendarStartDate,
        returndate: calendarEndDate,
      });

      const response = await axios.post(
        'https://thetrago.com/api/V1/ferry/Getroute',
        {
          lang: 'en',
          currency: selectedCurrency,
          roundtrip: customerData.roud,
          locationstart: startingPoint.id,
          locationend: endPoint.id,
          adult: adults,
          child: children,
          infant: infant,
          departdate: calendarStartDate,
          returndate: calendarEndDate,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.status === 'success') {
        setDepartTrips(response.data.data.departtrip);
        setReturnTrips(response.data.data.returntrip);

      } else {
        setError('ไม่สามารถโหลดข้อมูลได้');
      }
    } catch (err) {
      const apiError = err.response?.data;

      const ignoredMessages = [
        'ไอดีพื้นที่ขาไปไม่ถูกต้อง',
        'ไอดีพื้นที่ขากลับไม่ถูกต้อง',
      ];

      if (ignoredMessages.includes(apiError?.message)) {
      
        return;
      }

      console.error("❌ API Error:", apiError || err.message);
      setDepartTrips([]);
      setReturnTrips([]);
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ API');
    } finally {
      setLoading(false);
    }
  };


  const handleSearchEnd = () => {
    fetch(`${ipAddress}/search/${endPoint.id}/${startingPoint.id}/${calendarEndDate}/THB`)
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

  useEffect(() => {

    const fecthdiscount = async (countrieid) => {
      try {
        const response = await fetch(`${ipAddress}/discount`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ md_discount_countries: countrieid }),
        });

        const json = await response.json();


        if (response.ok) {
          setDiscount(json.data[0].md_discount_discount);
          console.log('discount:', json.data[0].md_discount_discount);
          return json.data;
        } else {
          console.warn('Not found or error:', json.message);
          setDiscount(0);
          return null;
        }
      } catch (error) {
        console.error('Error fetching country:', error);
        return null;
      }
    };
    fecthdiscount(startingPoint.countryId);
  }, [startingPoint.countryId]);


  const calculateDiscountedPrice = (price) => {
    if (!price || isNaN(price)) return "N/A"; // ตรวจสอบว่าราคาถูกต้องไหม
    const discountRate = parseFloat(discount / 100); // 5% = 5/100
    const discountedPrice = price * (1 - discountRate); // ลด 5%
    return discountedPrice.toFixed(2); // ปัดเศษทศนิยม 2 ตำแหน่ง
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

  const filteredDepartData = departTrips.filter(item =>
    selectedCompaniesDepart.includes(item.md_timetable_companyname)
  );

  const filteredReturnData = returnTrips.filter(item =>
    selectedCompaniesReturn.includes(item.md_timetable_companyname)
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




  // --- Boat loading animation for empty pagedDataDepart ---
  const boatAnim = useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(boatAnim, {
          toValue: -24, // เพิ่มระยะขยับ
          duration: 1400, // เพิ่มระยะเวลาให้สมูทขึ้น
          useNativeDriver: true,
          easing: Easing.inOut(Easing.sin), // ใช้ easing แบบ sin ให้ลื่นไหล
        }),
        Animated.timing(boatAnim, {
          toValue: 0,
          duration: 1400,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.sin),
        }),
      ])
    ).start();
  }, [boatAnim]);



  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <LinearGradient
        colors={["#fff", "#fff"]} // Changed to white to orange for more contrast with the logo
        style={[
          headStyles.headerBg,
          {
            width: '100%',
            marginLeft: '0%',
            marginTop: -20,
            borderBottomLeftRadius: 50,
            borderBottomRightRadius: 50,
            paddingBottom: 0,
            shadowColor: '#FD501E',
            shadowOpacity: 0.18,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 6 },
            elevation: 6,
            padding: 10,
            minHeight: hp('0%'), // Adjusted to ensure enough space for the header
          },
        ]}
      >
        <View
          style={[
            headStyles.headerRow,
            {
              alignItems: 'center',
              justifyContent: 'center',
              paddingHorizontal: 0,
              paddingTop: 0,
              position: 'relative',
              marginTop: -10,
              height: 56,
            },
          ]}
        >
          {/* Back Button - Left */}
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{
              position: 'absolute',
              left: 16,
              backgroundColor: '#FFF3ED',
              borderRadius: 20,
              padding: 6,
              zIndex: 2,
            }}
          >
            <AntDesign name="arrowleft" size={26} color="#FD501E" />
          </TouchableOpacity>

          {/* Logo - Center */}
          <View style={{ position: 'absolute', left: 0, right: 0, alignItems: 'center' }}>
            <LogoTheTrago />
          </View>

          {/* Currency Button - Right */}
          <TouchableOpacity
            onPress={() => setCurrencyModalVisible(true)}
            style={{
              position: 'absolute',
              right: 16,
              backgroundColor: '#FFF3ED',
              padding: 8,
              borderRadius: 12,
              flexDirection: 'row',
              alignItems: 'center',
              zIndex: 2,
            }}
          >
            <Icon name="cash-outline" size={20} color="#FD501E" style={{ marginRight: 6 }} />
            <Text style={{ fontWeight: 'bold', color: '#FD501E' }}>{selectedCurrency}</Text>
          </TouchableOpacity>

          {/* Currency Modal */}
          <Modal visible={isCurrencyModalVisible} transparent animationType="fade">
            <View
              style={{
                flex: 1,
                backgroundColor: 'rgba(0, 0, 0, 0.35)',
                justifyContent: 'center',
                alignItems: 'center',
                paddingHorizontal: 20,
              }}
            >
              <View
                style={{
                  backgroundColor: '#fff',
                  borderRadius: 24,
                  paddingVertical: 24,
                  paddingHorizontal: 20,
                  width: '100%',
                  maxWidth: 360,
                  shadowColor: '#000',
                  shadowOpacity: 0.2,
                  shadowRadius: 16,
                  shadowOffset: { width: 0, height: 6 },
                  elevation: 10,
                  position: 'relative',
                }}
              >
                <TouchableOpacity
                  onPress={() => setCurrencyModalVisible(false)}
                  style={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    zIndex: 10,
                    backgroundColor: '#FFF3ED',
                    padding: 6,
                    borderRadius: 20,
                  }}
                >
                  <AntDesign name="close" size={20} color="#FD501E" />
                </TouchableOpacity>

                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: 'bold',
                    color: '#FD501E',
                    textAlign: 'center',
                    marginBottom: 16,
                  }}
                >
                  Select Your Currency
                </Text>

                <ScrollView style={{ maxHeight: 300 }}>
                  {currencyList.map((currency) => (
                    <TouchableOpacity
                      key={currency.md_currency_id}
                      onPress={() => {
                        setSelectedCurrency(currency.md_currency_code);
                        setSelectedSysmbol(currency.md_currency_symbol);
                        setCurrencyModalVisible(false);
                      }}
                      style={{
                        paddingVertical: 14,
                        paddingHorizontal: 10,
                        borderRadius: 12,
                        backgroundColor:
                          selectedCurrency === currency.md_currency_code ? '#FFF3ED' : '#F9F9F9',
                        marginBottom: 10,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        shadowColor:
                          selectedCurrency === currency.md_currency_code ? '#FD501E' : 'transparent',
                        shadowOpacity: 0.08,
                        shadowRadius: 6,
                        shadowOffset: { width: 0, height: 2 },
                        elevation: selectedCurrency === currency.md_currency_code ? 2 : 0,
                      }}
                    >
                      <Text style={{ fontSize: 16, color: '#333' }}>
                        {currency.md_currency_symbol} {currency.md_currency_name} (
                        {currency.md_currency_code})
                      </Text>
                      {selectedCurrency === currency.md_currency_code && (
                        <AntDesign name="checkcircle" size={18} color="#FD501E" />
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
          </Modal>
        </View>

      </LinearGradient>
      {/* Title and Show Filters in one row */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 20, marginHorizontal: 20, marginBottom: 20 }}>
        <Text style={[headStyles.headerTitle, { color: '#FD501E', fontSize: 22, fontWeight: 'bold', letterSpacing: 0.5, textAlign: 'left', marginLeft: 0 }]}>Search Ferry</Text>
        <TouchableOpacity
          style={{
            backgroundColor: '#FD501E',
            paddingVertical: 10,
            paddingHorizontal: 20,
            borderRadius: 10,
            alignSelf: 'auto',
            marginVertical: 0,
            marginRight: 0,
          }}
          onPress={() => tripTypeSearchResult === 'Depart Trip' ? setIsFilterModalVisibleDepart(true) : setIsFilterModalVisibleReturn(true)}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Show filters</Text>
        </TouchableOpacity>
      </View>
      {/* End row */}

      <Modal visible={tripTypeSearchResult === 'Depart Trip' ? isFilterModalVisibleDepart : isFilterModalVisibleReturn} animationType="slide" transparent={true}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.2)', justifyContent: 'center', alignItems: 'center' }}>
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
      <ScrollView contentContainerStyle={styles.containerSearch}>
        <View style={styles.bookingSection}>
          <View style={styles.tripTypeContainer}>
            <TouchableOpacity
              style={[
                styles.tripTypeOneWayButton,
                tripType === "One Way Trip" && styles.activeButton,
              ]}
              onPress={() => {
                setTripType("One Way Trip");
                updateCustomerData({
                  roud: 1
                })


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
                updateCustomerData({
                  roud: 2
                })
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

          {/* --- Premium passenger selection row and modal from SearchFerryDemo --- */}
          <View style={styles.inputRow}>
            <TouchableOpacity
              style={[styles.inputBoxSearch]}
              onPress={() => setPassengerModalVisible(true)}
            >
              <View style={[headStyles.suggestionIconBox, { alignSelf: 'center', width: wp('8%'), height: wp('8%'), borderRadius: wp('8%') / 2, minWidth: 28, minHeight: 28 }]}>
                <MaterialIcons name="groups" size={wp('6%')} color="#FD501E" />
              </View>
              <View style={styles.inputBoxCol}>
                <Text style={styles.inputLabel}>Passengers</Text>
                <Text style={[styles.inputText, { color: '#333', fontSize: 15 }]}>{adults} Adult, {children} Child, {infant} Infant</Text>
              </View>
            </TouchableOpacity>
          </View>
          <Modal
            visible={isPassengerModalVisible}
            transparent
            animationType="slide"
            onRequestClose={() => setPassengerModalVisible(false)}
          >
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.2)', justifyContent: 'center', alignItems: 'center' }}>
              <View style={{ backgroundColor: '#fff', borderRadius: 20, padding: 28, width: '88%', shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 8 }}>
                <Text style={{ fontWeight: 'bold', fontSize: 20, marginBottom: 22, color: '#FD501E', textAlign: 'center', letterSpacing: 0.5 }}>Select Passengers</Text>
                <View style={{ marginBottom: 18, gap: 18 }}>
                  {/* Adults Row */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFF3ED', borderRadius: 12, paddingVertical: 10, paddingHorizontal: 16, marginBottom: 8, shadowColor: '#FD501E', shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 }}>
                    <Text style={{ color: '#FD501E', fontWeight: 'bold', fontSize: 16, minWidth: 80 }}>Adults</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <TouchableOpacity onPress={() => setAdults(Math.max(1, adults - 1))} style={{ padding: 6, borderRadius: 20, backgroundColor: adults > 1 ? '#FFE1D3' : '#FFF3ED' }}>
                        <Icon name="remove-circle" size={28} color={adults > 1 ? '#FD501E' : '#BDBDBD'} />
                      </TouchableOpacity>
                      <Text style={{ fontSize: 20, fontWeight: 'bold', marginHorizontal: 18, minWidth: 28, textAlign: 'center', color: '#333' }}>{adults}</Text>
                      <TouchableOpacity onPress={() => setAdults(Math.min(10, adults + 1))} style={{ padding: 6, borderRadius: 20, backgroundColor: adults < 10 ? '#FFE1D3' : '#FFF3ED' }}>
                        <Icon name="add-circle" size={28} color={adults < 10 ? '#FD501E' : '#BDBDBD'} />
                      </TouchableOpacity>
                    </View>
                  </View>
                  {/* Children Row */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFF3ED', borderRadius: 12, paddingVertical: 10, paddingHorizontal: 16, marginBottom: 8, shadowColor: '#FD501E', shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 }}>
                    <Text style={{ color: '#FD501E', fontWeight: 'bold', fontSize: 16, minWidth: 80 }}>Children</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <TouchableOpacity onPress={() => setChildren(Math.max(0, children - 1))} style={{ padding: 6, borderRadius: 20, backgroundColor: children > 0 ? '#FFE1D3' : '#FFF3ED' }}>
                        <Icon name="remove-circle" size={28} color={children > 0 ? '#FD501E' : '#BDBDBD'} />
                      </TouchableOpacity>
                      <Text style={{ fontSize: 20, fontWeight: 'bold', marginHorizontal: 18, minWidth: 28, textAlign: 'center', color: '#333' }}>{children}</Text>
                      <TouchableOpacity onPress={() => setChildren(Math.min(10, children + 1))} style={{ padding: 6, borderRadius: 20, backgroundColor: children < 10 ? '#FFE1D3' : '#FFF3ED' }}>
                        <Icon name="add-circle" size={28} color={children < 10 ? '#FD501E' : '#BDBDBD'} />
                      </TouchableOpacity>
                    </View>
                  </View>
                  {/* Infants Row */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFF3ED', borderRadius: 12, paddingVertical: 10, paddingHorizontal: 16, shadowColor: '#FD501E', shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 }}>
                    <Text style={{ color: '#FD501E', fontWeight: 'bold', fontSize: 16, minWidth: 80 }}>Infants</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <TouchableOpacity onPress={() => setInfant(Math.max(0, infant - 1))} style={{ padding: 6, borderRadius: 20, backgroundColor: infant > 0 ? '#FFE1D3' : '#FFF3ED' }}>
                        <Icon name="remove-circle" size={28} color={infant > 0 ? '#FD501E' : '#BDBDBD'} />
                      </TouchableOpacity>
                      <Text style={{ fontSize: 20, fontWeight: 'bold', marginHorizontal: 18, minWidth: 28, textAlign: 'center', color: '#333' }}>{infant}</Text>
                      <TouchableOpacity onPress={() => setInfant(Math.min(10, infant + 1))} style={{ padding: 6, borderRadius: 20, backgroundColor: infant < 10 ? '#FFE1D3' : '#FFF3ED' }}>
                        <Icon name="add-circle" size={28} color={infant < 10 ? '#FD501E' : '#BDBDBD'} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
                <TouchableOpacity onPress={() => setPassengerModalVisible(false)} style={{ backgroundColor: '#FD501E', borderRadius: 10, padding: 14, alignItems: 'center', marginTop: 8, shadowColor: '#FD501E', shadowOpacity: 0.12, shadowRadius: 6, elevation: 2 }}>
                  <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16, letterSpacing: 0.5 }}>Confirm</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          <View style={styles.inputRow}>
            <TouchableOpacity
              onPress={() => navigation.navigate('StartingPointScreen', { setStartingPoint })}
              style={styles.inputBoxSearch}
            >
              <View style={[headStyles.suggestionIconBox, { alignSelf: 'center', width: wp('8%'), height: wp('8%'), borderRadius: wp('8%') / 2, minWidth: 28, minHeight: 28 }]}>
                <MaterialIcons name="directions-boat" size={wp('6%')} color="#FD501E" />
              </View>
              <View>
                <View style={styles.inputBoxCol}>
                  <Text style={styles.inputLabel}>From</Text>
                  <Text style={styles.inputText}> {truncateText(startingPoint.name)}</Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* Swap icon */}
            <TouchableOpacity onPress={swapPoints}>
              <View style={{
                backgroundColor: '#FFF',
                borderRadius: wp('8%'),
                marginHorizontal: wp('3%'),
                marginLeft: wp('1.5%'),
                marginRight: 0,
                width: wp('8%'),
                height: wp('8%'),
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: 28,
                minHeight: 28
              }}>
                <MaterialIcons name="swap-horiz" size={wp('6%')} color="#FD501E" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('EndPointScreen', { setEndPoint, startingPointId: startingPoint.id, })}
              style={styles.inputBoxSearch}
            >
              <View style={[headStyles.suggestionIconBox, { width: wp('8%'), height: wp('8%'), borderRadius: wp('8%') / 2, minWidth: 28, minHeight: 28 }]}>
                <MaterialIcons name="location-on" size={wp('6%')} color="#FD501E" />
              </View>
              <View style={styles.inputBoxCol}>
                <Text style={styles.inputLabel}>To</Text>
                <Text style={styles.inputText} numberOfLines={1} ellipsizeMode="tail"> {truncateText(endPoint.name)}</Text>
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


                <View style={headStyles.suggestionIconBox}>
                  <MaterialIcons name="event" size={24} color="#FD501E" />
                </View>
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
                    {/* Use a yellow icon with a light yellow background for the return date icon */}
                    <View style={[headStyles.suggestionIconBox, { backgroundColor: '#FFF9E1' }]}>
                      <MaterialIcons name="event" size={24} color="#FFD600" />
                    </View>
                    <View style={styles.inputBoxCol}>
                      <Text style={styles.inputLabel}>Return date</Text>
                      <Text style={styles.inputText}>{calendarEndDate ? formatDateInput(calendarEndDate.toString()) : "No Date Available"}</Text>
                    </View>
                  </TouchableOpacity>
                </>
              )}
            </View>

            {/* Modals for date, passenger */}
            <Modal visible={showModal} transparent animationType="slide" onRequestClose={() => setShowModal(false)}>
              <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.2)', justifyContent: 'center', alignItems: 'center' }}>
                <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 24, width: '90%' }}>
                  <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 16 }}>Select Date</Text>
                  <Text style={{ color: '#FD501E', marginBottom: 8 }}>Departure Date</Text>
                  <Calendar
                    current={calendarStartDate}
                    minDate={new Date().toISOString().split('T')[0]}
                    onDayPress={day => {
                      setCalendarStartDate(day.dateString);
                      setCalendarEndDate(day.dateString); // Reset return date when departure date changes
                      if (tripType === 'Return Trip' && calendarEndDate < day.dateString) {
                        setCalendarEndDate(day.dateString);
                      }
                      // Do NOT close the modal here
                    }}
                    markedDates={{
                      [calendarStartDate]: { selected: true, selectedColor: '#FD501E' }
                    }}
                  />
                  {tripType === 'Return Trip' && (
                    <>
                      <Text style={{ color: '#FD501E', marginVertical: 8 }}>Return Date</Text>
                      <Calendar
                        current={calendarEndDate}
                        minDate={calendarStartDate}
                        onDayPress={day => {
                          setCalendarEndDate(day.dateString);
                          // Do NOT close the modal here
                        }}
                        markedDates={{
                          [calendarEndDate]: { selected: true, selectedColor: '#FD501E' }
                        }}
                      />
                    </>
                  )}
                  <TouchableOpacity onPress={() => setShowModal(false)} style={{ backgroundColor: '#FD501E', borderRadius: 8, padding: 12, alignItems: 'center', marginTop: 16 }}>
                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>OK</Text>
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
          <>
            {/* Skeleton shimmer for booking section */}
            <View style={{ width: '100%', marginTop: 20, marginBottom: 10 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                <View style={{ width: '48%', height: 40, borderRadius: 10, backgroundColor: '#eee', overflow: 'hidden' }}>
                  <Animated.View style={{ width: 120, height: '100%', transform: [{ translateX: shimmerAnim }] }}>
                    <LinearGradient colors={['#eeeeee00', '#ddddddaa', '#eeeeee00']} start={[0, 0]} end={[1, 0]} style={{ width: '100%', height: '100%' }} />
                  </Animated.View>
                </View>
                <View style={{ width: '48%', height: 40, borderRadius: 10, backgroundColor: '#eee', overflow: 'hidden' }}>
                  <Animated.View style={{ width: 120, height: '100%', transform: [{ translateX: shimmerAnim }] }}>
                    <LinearGradient colors={['#eeeeee00', '#ddddddaa', '#eeeeee00']} start={[0, 0]} end={[1, 0]} style={{ width: '100%', height: '100%' }} />
                  </Animated.View>
                </View>
              </View>
              <View style={{ width: '100%', height: 40, borderRadius: 10, backgroundColor: '#eee', overflow: 'hidden', marginBottom: 10 }}>
                <Animated.View style={{ width: 200, height: '100%', transform: [{ translateX: shimmerAnim }] }}>
                  <LinearGradient colors={['#eeeeee00', '#ddddddaa', '#eeeeee00']} start={[0, 0]} end={[1, 0]} style={{ width: '100%', height: '100%' }} />
                </Animated.View>
              </View>
            </View>
            {/* Skeleton shimmer for ferry cards */}
            {Array(3).fill(0).map((_, idx) => (
              <View key={idx} style={[styles.cardContainer, { marginTop: 20, minHeight: 180, backgroundColor: '#eee', borderRadius: 20, overflow: 'hidden', width: '100%' }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16 }}>
                  <View style={{ width: wp('10.6%'), height: hp('5%'), borderRadius: 10, backgroundColor: '#e0e0e0', overflow: 'hidden', marginRight: 16 }}>
                    <Animated.View
                      style={{
                        width: 60,
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
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ width: '100%', height: 16, borderRadius: 8, backgroundColor: '#e0e0e0', marginBottom: 8, overflow: 'hidden' }}>
                      <Animated.View
                        style={{
                          width: 80,
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
                    </View>
                    <View style={{ width: '70%', height: 12, borderRadius: 6, backgroundColor: '#e0e0e0', marginBottom: 4, overflow: 'hidden' }}>
                      <Animated.View
                        style={{
                          width: 60,
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
                    </View>
                  </View>
                </View>
                <View style={{ width: '100%', height: 20, borderRadius: 8, backgroundColor: '#e0e0e0', marginLeft: 16, marginBottom: 8, overflow: 'hidden' }}>
                  <Animated.View
                    style={{
                      width: 120,
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
                </View>
                <View style={{ width: '60%', height: 14, borderRadius: 6, backgroundColor: '#e0e0e0', marginLeft: 16, marginBottom: 8, overflow: 'hidden' }}>
                  <Animated.View
                    style={{
                      width: 80,
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
                </View>
              </View>
            ))}
          </>
        )}
        {!loading && pagedDataDepart && pagedDataDepart.length === 0 && (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 320, width: '100%' }}>
            <LottieView
              source={require('./assets/animations/ferry-animation.json')}
              autoPlay
              loop
              style={{
                width: 200,
                height: 200,
              }}
            />
            <Text style={{ marginTop: 24, color: '#FD501E', fontWeight: 'bold', fontSize: 18, letterSpacing: 0.5 }}>Searching for ferries...</Text>
          </View>
        )}
        {!loading && pagedDataDepart && pagedDataReturn && (
          <>
            {tripTypeSearch === 'One Way Trip' && (
              <>
                {pagedDataDepart.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    activeOpacity={0.95}
                    onPress={() => {
                      toggleDetails(item.md_timetable_id);
                    }}
                    style={{ width: '100%' }}
                  >
                    <View style={[
                      styles.cardContainer,
                      {
                        marginTop: 24,
                        backgroundColor: 'rgba(255,255,255,0.97)',
                        borderWidth: 1.5,
                        borderColor: 'rgba(253,80,30,0.13)',
                        shadowColor: '#FD501E',
                        shadowOpacity: 0.13,
                        shadowRadius: 16,
                        shadowOffset: { width: 0, height: 8 },
                        elevation: 7,
                        overflow: 'visible',
                        padding: 0,
                        borderRadius: 32,
                        position: 'relative',
                      },
                    ]}>
                      {/* หัวตั๋ว */}
                      <View style={{
                        backgroundColor: '#FD501E',
                        borderTopLeftRadius: 32,
                        borderTopRightRadius: 32,
                        paddingVertical: 18,
                        paddingHorizontal: 22,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        position: 'relative',
                      }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Image
                            source={{ uri: `${item.md_timetable_companypic}` }}
                            style={{ width: wp('10.6%'), height: hp('5%'), borderRadius: 12, backgroundColor: '#fff', borderWidth: 1, borderColor: '#eee', marginRight: 10 }}
                            resizeMode="cover"
                          />
                          <Text
                            style={{
                              color: '#fff',
                              fontWeight: 'bold',
                              fontSize: 18,
                              maxWidth: wp('19%'),
                              overflow: 'hidden',
                            }}
                            numberOfLines={1}
                            ellipsizeMode="tail"
                          >
                            {item.md_timetable_companyname}
                          </Text>
                        </View>
                        <View style={{ flexDirection: 'row', gap: 6 }}>
                          <Text style={[styles.tag, { backgroundColor: '#fff', color: '#FD501E', fontWeight: 'bold', fontSize: 13 }]}>{item.md_timetable_seatid}</Text>
                          <Text style={[styles.tag, { backgroundColor: '#fff', color: '#FD501E', fontWeight: 'bold', fontSize: 13 }]}>{tripTypeSearch}</Text>
                        </View>
                      </View>
                      {/* เนื้อหาตั๋ว */}
                      <View style={{ paddingHorizontal: 22, paddingVertical: 18 }}>
                        <View style={styles.detailsRow}>
                          <View style={styles.locationContainer}>
                            <Text style={styles.location}>{item.md_timetable_startid}</Text>
                            <Text style={styles.subtext}>{item.md_timetable_pierstart}</Text>
                            <Text style={styles.time}>{formatTime(item.md_timetable_departuretime)}</Text>
                            <Text style={styles.subtext}>{formatDate(calendarStartDate)}</Text>
                          </View>
                          <View style={styles.middleContainer}>
                            <Text style={styles.duration}>{item.md_timetable_boattypeid}</Text>
                            <View style={styles.iconLineContainer}>
                              <View style={styles.dashedLine} />
                              <View style={styles.shipIcon}>
                                <Image source={require('./assets/boat.png')} style={styles.ImageBoat} />
                              </View>
                              <View style={styles.dashedLine} />
                            </View>
                            <Text style={styles.duration}>{item.md_timetable_time}</Text>
                            <Text style={[styles.duration, { color: '#FD501E' }]}>{item.md_timetable_count} booked</Text>
                          </View>
                          <View style={styles.locationContainer}>
                            <Text style={styles.location}>{item.md_timetable_endid}</Text>
                            <Text style={styles.subtext}>{item.md_timetable_pierend}</Text>
                            <Text style={styles.time}>{formatTime(item.md_timetable_arrivaltime)}</Text>
                            <Text style={styles.subtext}>{formatDate(calendarStartDate)}</Text>
                          </View>
                        </View>
                        {/* ราคาและปุ่ม */}
                        <View style={[styles.footerRow, { marginTop: 18 }]}>
                          <Text style={styles.price}>{selectedCurrency} <Text style={styles.pricebig}>{formatNumberWithComma(item.md_timetable_saleadult)} </Text>/ person
                            {item.md_timetable_discount > 0 && (
                              <Text style={styles.discount}> {item.md_timetable_discount}% Off</Text>
                            )}</Text>
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
                                pierStartDepartId: item.md_timetable_pierstartid,
                                pierEndDepartId: item.md_timetable_pierendid,
                                netDepart: item.md_timetable_netadult,
                                adult: adults,
                                child: children,
                                infant: infant,
                                timetableReturn: item.md_timetable_id,
                                piccompanyDepart: item.md_timetable_companypic,
                                pictimetableDepart: item.md_timetable_tripdetail[0].md_timetabledetail_picname1,
                                discount: item.md_timetable_discount,
                                exchaneRate: item.md_exchange_money,
                                international: item.md_timetable_international,
                                currency: selectedCurrency,
                                symbol: selectedSysmbol,
                              });
                              navigation.navigate('TripDetail');
                            }} >
                            <Text style={styles.bookNowText}>Book Now</Text>
                          </TouchableOpacity>
                        </View>
                        {item.md_timetable_remark.en && (
                          <View style={styles.remarkContainer}>
                            <Text style={styles.remarkText}>
                              <Text style={styles.remarkLabel}>Remark: </Text>
                              {item.md_timetable_remark.en}
                            </Text>
                          </View>
                        )}
                        {/* Hidden measure view for animation height calculation */}

                        <View
                          style={{ position: 'absolute', opacity: 0, left: 0, top: 0, right: 0, zIndex: -1, padding: 16 }}
                          onLayout={(e) => {
                            const h = e.nativeEvent.layout.height;
                            if (contentHeights[item.md_timetable_id] !== h) {
                              setContentHeights(prev => ({ ...prev, [item.md_timetable_id]: h }));
                            }
                          }}
                        >
                          <Text>{removeHtmlTags(item.md_timetable_tripdetail[0].md_timetabledetail_detaileng1 || "")}</Text>
                          <Image
                            source={{ uri: `https://www.thetrago.com/Api/uploads/timetabledetail/${item.md_timetable_tripdetail[0].md_timetabledetail_picname1}` }}
                            style={{ width: '100%', height: 150, resizeMode: 'cover', marginTop: 20, borderRadius: 20 }}
                          />
                        </View>

                      </View>
                      {/* Animated detail section */}

                      <Animated.View
                        style={{
                          maxHeight: selectedPickup === item.md_timetable_id ? getAnimatedHeight(item.md_timetable_id) : 0,
                          overflow: 'hidden',
                          padding: 16,
                          backgroundColor: '#fff',
                          borderBottomLeftRadius: 32,
                          borderBottomRightRadius: 32,
                        }}
                      >
                        <Text style={{ color: '#666666' }}>{removeHtmlTags(item.md_timetable_tripdetail[0].md_timetabledetail_detaileng1 || "")}</Text>
                        <Image
                          source={{ uri: `https://www.thetrago.com/Api/uploads/timetabledetail/${item.md_timetable_tripdetail[0].md_timetabledetail_picname1}` }}
                          style={{ width: '100%', height: 150, resizeMode: 'cover', marginTop: 20, borderRadius: 20 }}
                        />
                      </Animated.View>

                    </View>

                  </TouchableOpacity>

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
                    <TouchableOpacity
                      key={index}
                      activeOpacity={0.95}
                      onPress={() => {
                        toggleDetails(item.md_timetable_id);
                      }}
                      style={{ width: '100%' }}
                    >
                      <View style={[
                        styles.cardContainer,
                        {
                          marginTop: 24,
                          backgroundColor: 'rgba(255,255,255,0.97)',
                          borderWidth: 1.5,
                          borderColor: 'rgba(253,80,30,0.13)',
                          shadowColor: '#FD501E',
                          shadowOpacity: 0.13,
                          shadowRadius: 16,
                          shadowOffset: { width: 0, height: 8 },
                          elevation: 7,
                          overflow: 'visible',
                          padding: 0,
                          borderRadius: 32,
                          position: 'relative',
                        },
                      ]}>
                        {/* หัวตั๋ว */}
                        <View style={{
                          backgroundColor: '#FD501E',
                          borderTopLeftRadius: 32,
                          borderTopRightRadius: 32,
                          paddingVertical: 18,
                          paddingHorizontal: 22,
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          position: 'relative',
                        }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Image
                              source={{ uri: `${item.md_timetable_companypic}` }}
                              style={{ width: wp('10.6%'), height: hp('5%'), borderRadius: 12, backgroundColor: '#fff', borderWidth: 1, borderColor: '#eee', marginRight: 10 }}
                              resizeMode="cover"
                            />
                            <Text
                              style={{
                                color: '#fff',
                                fontWeight: 'bold',
                                fontSize: 18,
                                maxWidth: wp('19%'),
                                overflow: 'hidden',
                              }}
                              numberOfLines={1}
                              ellipsizeMode="tail"
                            >
                              {item.md_timetable_companyname}
                            </Text>
                          </View>
                          <View style={{ flexDirection: 'row', gap: 6 }}>
                            <Text style={[styles.tag, { backgroundColor: '#fff', color: '#FD501E', fontWeight: 'bold', fontSize: 13 }]}>{item.md_timetable_seatid}</Text>
                            <Text style={[styles.tag, { backgroundColor: '#fff', color: '#FD501E', fontWeight: 'bold', fontSize: 13 }]}>{tripTypeSearch}</Text>
                          </View>
                        </View>
                        {/* เนื้อหาตั๋ว */}
                        <View style={{ paddingHorizontal: 22, paddingVertical: 18 }}>
                          <View style={styles.detailsRow}>
                            <View style={styles.locationContainer}>
                              <Text style={styles.location}>{item.md_timetable_startid}</Text>
                              <Text style={styles.subtext}>{item.md_timetable_pierstart}</Text>
                              <Text style={styles.time}>{formatTime(item.md_timetable_departuretime)}</Text>
                              <Text style={styles.subtext}>{formatDate(calendarStartDate)}</Text>
                            </View>
                            <View style={styles.middleContainer}>
                              <Text style={styles.duration}>{item.md_timetable_boattypeid}</Text>
                              <View style={styles.iconLineContainer}>
                                <View style={styles.dashedLine} />
                                <View style={styles.shipIcon}>
                                  <Image source={require('./assets/boat.png')} style={styles.ImageBoat} />
                                </View>
                                <View style={styles.dashedLine} />
                              </View>
                              <Text style={styles.duration}>{item.md_timetable_time}</Text>
                              <Text style={[styles.duration, { color: '#FD501E' }]}>{item.md_timetable_count} booked</Text>
                            </View>
                            <View style={styles.locationContainer}>
                              <Text style={styles.location}>{item.md_timetable_endid}</Text>
                              <Text style={styles.subtext}>{item.md_timetable_pierend}</Text>
                              <Text style={styles.time}>{formatTime(item.md_timetable_arrivaltime)}</Text>
                              <Text style={styles.subtext}>{formatDate(calendarStartDate)}</Text>
                            </View>
                          </View>
                          {/* ราคาและปุ่ม */}
                          <View style={[styles.footerRow, { marginTop: 18 }]}>
                            <Text style={styles.price}>
                              {selectedCurrency} <Text style={styles.pricebig}>
                                {item.md_timetable_saleadult_round !== 0
                                  ? formatNumberWithComma(item.md_timetable_saleadult_round)
                                  : formatNumberWithComma(item.md_timetable_saleadult)}
                              </Text> / person
                            </Text>

                            {item.md_timetable_discount > 0 && (
                              <Text style={styles.discount}> {item.md_timetable_discount}% Off</Text>
                            )}
                            <TouchableOpacity style={styles.bookNowButton}
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
                                  pierStartDepartId: item.md_timetable_pierstartid,
                                  pierEndDepartId: item.md_timetable_pierendid,
                                  netDepart: item.md_timetable_netadult,
                                  adult: adults,
                                  child: children,
                                  infant: infant,
                                  piccompanyDepart: item.md_timetable_companypic,
                                  pictimetableDepart: item.md_timetable_tripdetail[0].md_timetabledetail_picname1,
                                  discount: item.md_timetable_discount,
                                  exchaneRate: item.md_exchange_money,
                                  international: item.md_timetable_international,
                                  currency: selectedCurrency,
                                  symbol: selectedSysmbol,
                                });


                                // Check if round trip status is true before navigating
                                if (isroudstatus) {
                                  navigation.navigate('TripDetail');
                                } else {
                                  settripTypeSearchResult("Return Trip");
                                }
                              }} >
                              <Text style={styles.bookNowText}>Book Now</Text>
                            </TouchableOpacity>
                          </View>
                          {item.md_timetable_remark.en && (
                            <View style={styles.remarkContainer}>
                              <Text style={styles.remarkText}>
                                <Text style={styles.remarkLabel}>Remark: </Text>
                                {item.md_timetable_remark.en}
                              </Text>
                            </View>
                          )}
                          {/* Hidden measure view for animation height calculation */}
                          <View
                            style={{ position: 'absolute', opacity: 0, left: 0, top: 0, right: 0, zIndex: -1, padding: 16 }}
                            onLayout={(e) => {
                              const h = e.nativeEvent.layout.height;
                              if (contentHeights[item.md_timetable_id] !== h) {
                                setContentHeights(prev => ({ ...prev, [item.md_timetable_id]: h }));
                              }
                            }}
                          >
                            <Text>{removeHtmlTags(item.md_timetable_tripdetail[0].md_timetabledetail_detaileng1 || "")}</Text>
                            <Image
                              source={{ uri: `https://www.thetrago.com/Api/uploads/timetabledetail/${item.md_timetable_tripdetail[0].md_timetabledetail_picname1}` }}
                              style={{ width: '100%', height: 150, resizeMode: 'cover', marginTop: 20, borderRadius: 20 }}
                            />
                          </View>
                        </View>
                        {/* Animated detail section */}
                        <Animated.View
                          style={{
                            maxHeight: selectedPickup === item.md_timetable_id ? getAnimatedHeight(item.md_timetable_id) : 0,
                            overflow: 'hidden',
                            padding: 16,
                            backgroundColor: '#fff',
                            borderBottomLeftRadius: 32,
                            borderBottomRightRadius: 32,
                          }}
                        >
                          <Text style={{ color: '#666666' }}>{removeHtmlTags(item.md_timetable_tripdetail[0].md_timetabledetail_detaileng1 || "")}</Text>
                          <Image
                            source={{ uri: `https://www.thetrago.com/Api/uploads/timetabledetail/${item.md_timetable_tripdetail[0].md_timetabledetail_picname1}` }}
                            style={{ width: '100%', height: 150, resizeMode: 'cover', marginTop: 20, borderRadius: 20 }}
                          />
                        </Animated.View>
                      </View>
                    </TouchableOpacity>
                  ))}

                </>)}
                {tripTypeSearchResult === 'Return Trip' && (<>
                  {pagedDataReturn.map((item, index) => (
                    <TouchableOpacity
                      key={index}
                      activeOpacity={0.95}
                      onPress={() => {
                        toggleDetails(item.md_timetable_id);
                      }}
                      style={{ width: '100%' }}
                    >
                      <View style={[
                        styles.cardContainer,
                        {
                          marginTop: 24,
                          backgroundColor: 'rgba(255,255,255,0.97)',
                          borderWidth: 1.5,
                          borderColor: 'rgba(253,80,30,0.13)',
                          shadowColor: '#FD501E',
                          shadowOpacity: 0.13,
                          shadowRadius: 16,
                          shadowOffset: { width: 0, height: 8 },
                          elevation: 7,
                          overflow: 'visible',
                          padding: 0,
                          borderRadius: 32,
                          position: 'relative',
                        },
                      ]}>
                        {/* หัวตั๋ว */}
                        <View style={{
                          backgroundColor: '#FD501E',
                          borderTopLeftRadius: 32,
                          borderTopRightRadius: 32,
                          paddingVertical: 18,
                          paddingHorizontal: 22,
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          position: 'relative',
                        }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Image
                              source={{ uri: `${item.md_timetable_companypic}` }}
                              style={{ width: wp('10.6%'), height: hp('5%'), borderRadius: 12, backgroundColor: '#fff', borderWidth: 1, borderColor: '#eee', marginRight: 10 }}
                              resizeMode="cover"
                            />
                            <Text
                              style={{
                                color: '#fff',
                                fontWeight: 'bold',
                                fontSize: 18,
                                maxWidth: wp('19%'),
                                overflow: 'hidden',
                              }}
                              numberOfLines={1}
                              ellipsizeMode="tail"
                            >
                              {item.md_timetable_companyname}
                            </Text>
                          </View>
                          <View style={{ flexDirection: 'row', gap: 6 }}>
                            <Text style={[styles.tag, { backgroundColor: '#fff', color: '#FD501E', fontWeight: 'bold', fontSize: 13 }]}>{item.md_timetable_seatid}</Text>
                            <Text style={[styles.tag, { backgroundColor: '#fff', color: '#FD501E', fontWeight: 'bold', fontSize: 13 }]}>{tripTypeSearch}</Text>
                          </View>
                        </View>
                        {/* เนื้อหาตั๋ว */}
                        <View style={{ paddingHorizontal: 22, paddingVertical: 18 }}>
                          <View style={styles.detailsRow}>
                            <View style={styles.locationContainer}>
                              <Text style={styles.location}>{item.md_timetable_startid}</Text>
                              <Text style={styles.subtext}>{item.md_timetable_pierstart}</Text>
                              <Text style={styles.time}>{formatTime(item.md_timetable_departuretime)}</Text>
                              <Text style={styles.subtext}>{formatDate(calendarStartDate)}</Text>
                            </View>
                            <View style={styles.middleContainer}>
                              <Text style={styles.duration}>{item.md_timetable_boattypeid}</Text>
                              <View style={styles.iconLineContainer}>
                                <View style={styles.dashedLine} />
                                <View style={styles.shipIcon}>
                                  <Image source={require('./assets/boat.png')} style={styles.ImageBoat} />
                                </View>
                                <View style={styles.dashedLine} />
                              </View>
                              <Text style={styles.duration}>{item.md_timetable_time}</Text>
                              <Text style={[styles.duration, { color: '#FD501E' }]}>{item.md_timetable_count} booked</Text>
                            </View>
                            <View style={styles.locationContainer}>
                              <Text style={styles.location}>{item.md_timetable_endid}</Text>
                              <Text style={styles.subtext}>{item.md_timetable_pierend}</Text>
                              <Text style={styles.time}>{formatTime(item.md_timetable_arrivaltime)}</Text>
                              <Text style={styles.subtext}>{formatDate(calendarStartDate)}</Text>
                            </View>
                          </View>
                          {/* ราคาและปุ่ม */}
                          <View style={[styles.footerRow, { marginTop: 18 }]}>
                            <Text style={styles.price}>{selectedCurrency} <Text style={styles.pricebig}>{item.md_timetable_saleadult_round !== 0 ? formatNumberWithComma(item.md_timetable_saleadult_round) : formatNumberWithComma(item.md_timetable_saleadult)} </Text>/ person
                              {item.md_timetable_discount > 0 && (
                                <Text style={styles.discount}> {item.md_timetable_discount}% Off</Text>
                              )}</Text>
                            <TouchableOpacity style={styles.bookNowButton}
                              onPress={() => {
                                setIsroudstatus(true);
                                updateCustomerData({
                                  returndate: calendarEndDate,
                                  timeTableReturnId: item.md_timetable_id,
                                  companyReturnId: item.md_timetable_companyid,
                                  pierStartReturntId: item.md_timetable_pierstartid,
                                  pierEndReturntId: item.md_timetable_pierendid,
                                  piccompanyReturn: item.md_timetable_companypic,
                                  pictimetableReturn: item.md_timetable_tripdetail[0].md_timetabledetail_picname1,
                                  discount: item.md_timetable_discount,
                                  exchaneRate: item.md_exchange_money
                                });

                                // Check if round trip status is true before navigating
                                if (isonewaystatus) {
                                  navigation.navigate('TripDetail');
                                } else {
                                  settripTypeSearchResult("Depart Trip");
                                }
                              }} >
                              <Text style={styles.bookNowText}>Book Now</Text>
                            </TouchableOpacity>
                          </View>
                          {item.md_timetable_remark.en && (
                            <View style={styles.remarkContainer}>
                              <Text style={styles.remarkText}>
                                <Text style={styles.remarkLabel}>Remark: </Text>
                                {item.md_timetable_remark.en}
                              </Text>
                            </View>
                          )}
                          {/* Hidden measure view for animation height calculation */}
                          <View
                            style={{ position: 'absolute', opacity: 0, left: 0, top: 0, right: 0, zIndex: -1, padding: 16 }}
                            onLayout={(e) => {
                              const h = e.nativeEvent.layout.height;
                              if (contentHeights[item.md_timetable_id] !== h) {
                                setContentHeights(prev => ({ ...prev, [item.md_timetable_id]: h }));
                              }
                            }}
                          >
                            <Text>{removeHtmlTags(item.md_timetable_tripdetail[0].md_timetabledetail_detaileng1 || "")}</Text>
                            <Image
                              source={{ uri: `https://www.thetrago.com/Api/uploads/timetabledetail/${item.md_timetable_tripdetail[0].md_timetabledetail_picname1}` }}
                              style={{ width: '100%', height: 150, resizeMode: 'cover', marginTop: 20, borderRadius: 20 }}
                            />
                          </View>
                        </View>
                        {/* Animated detail section */}
                        <Animated.View
                          style={{
                            maxHeight: selectedPickup === item.md_timetable_id ? getAnimatedHeight(item.md_timetable_id) : 0,
                            overflow: 'hidden',
                            padding: 16,
                            backgroundColor: '#fff',
                            borderBottomLeftRadius: 32,
                            borderBottomRightRadius: 32,
                          }}
                        >
                          <Text style={{ color: '#666666' }}>{removeHtmlTags(item.md_timetable_tripdetail[0].md_timetabledetail_detaileng1 || "")}</Text>
                          <Image
                            source={{ uri: `https://www.thetrago.com/Api/uploads/timetabledetail/${item.md_timetable_tripdetail[0].md_timetabledetail_picname1}` }}
                            style={{ width: '100%', height: 150, resizeMode: 'cover', marginTop: 20, borderRadius: 20 }}
                          />
                        </Animated.View>
                      </View>
                    </TouchableOpacity>
                  ))}


                </>)}
              </>)}
          </>
        )}
        {/* ปุ่มสำหรับการเปลี่ยนหน้า */}
        {
          tripTypeSearchResult === 'Depart Trip' && filteredDepartData != null && departTrips.length > 0 && (
            <View style={{ alignItems: 'center', justifyContent: 'center', width: '100%', marginVertical: 28 }}>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#FFF3ED',
                borderRadius: 32,
                paddingVertical: 10,
                paddingHorizontal: 24,
                shadowColor: '#FD501E',
                shadowOpacity: 0.10,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 2 },
                elevation: 3,
                minWidth: 180,
              }}>
                <TouchableOpacity
                  onPress={goToPreviousPageDepart}
                  disabled={currentPageDepart === 1}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: currentPageDepart === 1 ? '#f5c6b3' : '#FD501E',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 18,
                    shadowColor: '#FD501E',
                    shadowOpacity: 0.13,
                    shadowRadius: 6,
                    shadowOffset: { width: 0, height: 2 },
                    elevation: 2,
                    opacity: currentPageDepart === 1 ? 0.6 : 1,
                  }}
                >
                  <Icon
                    name="chevron-back"
                    size={26}
                    color={'#fff'}
                  />
                </TouchableOpacity>
                <Text style={{
                  fontSize: 22,
                  fontWeight: 'bold',
                  color: '#FD501E',
                  backgroundColor: '#fff',
                  borderRadius: 16,
                  paddingHorizontal: 22,
                  paddingVertical: 8,
                  marginHorizontal: 2,
                  minWidth: 44,
                  textAlign: 'center',
                  shadowColor: '#FD501E',
                  shadowOpacity: 0.08,
                  shadowRadius: 4,
                  elevation: 1,
                }}>{currentPageDepart}</Text>
                <TouchableOpacity
                  onPress={goToNextPageDepart}
                  disabled={currentPageDepart * itemsPerPage >= filteredDepartData.length}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: (currentPageDepart * itemsPerPage >= filteredDepartData.length) ? '#f5c6b3' : '#FD501E',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginLeft: 18,
                    shadowColor: '#FD501E',
                    shadowOpacity: 0.13,
                    shadowRadius: 6,
                    shadowOffset: { width: 0, height: 2 },
                    elevation: 2,
                    opacity: (currentPageDepart * itemsPerPage >= filteredDepartData.length) ? 0.6 : 1,
                  }}
                >
                  <Icon
                    name="chevron-forward"
                    size={26}
                    color={'#fff'}
                  />
                </TouchableOpacity>
              </View>
            </View>
          )
        }

        {/* ปุ่มสำหรับการเปลี่ยนหน้า Return Trip */}
        {
          tripTypeSearchResult === 'Return Trip' && filteredReturnData != null && returnTrips.length > 0 && (
            <View style={{ alignItems: 'center', justifyContent: 'center', width: '100%', marginVertical: 28 }}>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#FFF3ED',
                borderRadius: 32,
                paddingVertical: 10,
                paddingHorizontal: 24,
                shadowColor: '#FD501E',
                shadowOpacity: 0.10,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 2 },
                elevation: 3,
                minWidth: 180,
              }}>
                <TouchableOpacity
                  onPress={goToPreviousPageReturn}
                  disabled={currentPageReturn === 1}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: currentPageReturn === 1 ? '#f5c6b3' : '#FD501E',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 18,
                    shadowColor: '#FD501E',
                    shadowOpacity: 0.13,
                    shadowRadius: 6,
                    shadowOffset: { width: 0, height: 2 },
                    elevation: 2,
                    opacity: currentPageReturn === 1 ? 0.6 : 1,
                  }}
                >
                  <Icon
                    name="chevron-back"
                    size={26}
                    color={'#fff'}
                  />
                </TouchableOpacity>
                <Text style={{
                  fontSize: 22,
                  fontWeight: 'bold',
                  color: '#FD501E',
                  backgroundColor: '#fff',
                  borderRadius: 16,
                  paddingHorizontal: 22,
                  paddingVertical: 8,
                  marginHorizontal: 2,
                  minWidth: 44,
                  textAlign: 'center',
                  shadowColor: '#FD501E',
                  shadowOpacity: 0.08,
                  shadowRadius: 4,
                  elevation: 1,
                }}>{currentPageReturn}</Text>
                <TouchableOpacity
                  onPress={goToNextPageReturn}
                  disabled={currentPageReturn * itemsPerPage >= filteredReturnData.length}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: (currentPageReturn * itemsPerPage >= filteredReturnData.length) ? '#f5c6b3' : '#FD501E',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginLeft: 18,
                    shadowColor: '#FD501E',
                    shadowOpacity: 0.13,
                    shadowRadius: 6,
                    shadowOffset: { width: 0, height: 2 },
                    elevation: 2,
                    opacity: (currentPageReturn * itemsPerPage >= filteredReturnData.length) ? 0.6 : 1,
                  }}
                >
                  <Icon
                    name="chevron-forward"
                    size={26}
                    color={'#fff'}
                  />
                </TouchableOpacity>
              </View>
            </View>
          )
        }


      </ScrollView >
    </SafeAreaView>
  );
};



export default SearchFerry;