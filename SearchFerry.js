import React, { useRef, useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, SafeAreaView, Modal, TextInput, Animated, Easing, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import ipAddress from './ipconfig';
import Icon from 'react-native-vector-icons/Ionicons';
import DateTimePicker from "@react-native-community/datetimepicker";
import LogoTheTrago from './(component)/Logo';
import { useCustomer } from './(Screen)/CustomerContext';
import moment from 'moment';
import { useLanguage } from './(Screen)/LanguageContext';
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
  const { language, t } = useLanguage();
  const { customerData, updateCustomerData } = useCustomer();

  // Trip type constants for consistent comparison
  const TRIP_TYPES = {
    ONE_WAY: 'One Way Trip',
    ROUND_TRIP: 'Round Trip'
  };

  const [tripType, setTripType] = useState(TRIP_TYPES.ONE_WAY);
  const [tripTypeSearch, setTripTypeSearch] = useState(TRIP_TYPES.ONE_WAY);

  // Date states
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

  // Location states
  const [startingPoint, setStartingPoint] = useState({ id: customerData.startingPointId, name: customerData.startingpoint_name, countryId: customerData.countrycode });
  const [endPoint, setEndPoint] = useState({ id: customerData.endPointId, name: customerData.endpoint_name });
  const [searchQuery, setSearchQuery] = useState('');
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

  const [showDepartModal, setShowDepartModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [calendarStartDate, setCalendarStartDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }); // string
  const [calendarEndDate, setCalendarEndDate] = useState(() => {
    const returnDay = new Date();
    returnDay.setDate(returnDay.getDate() + 2);
    return returnDay.toISOString().split('T')[0];
  }); // string
  const [calendarReady, setCalendarReady] = useState(false);
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
  // ฟังก์ชันสำหรับเลือกวันที่ไป
  const onDepartCalendarDayPress = (day) => {
    setCalendarStartDate(day.dateString);
    setDepartureDate(new Date(day.dateString));
    // เซ็ตวันที่กลับเป็นวันเดียวกันกับวันที่ไป
    setCalendarEndDate(day.dateString);
    setReturnDate(new Date(day.dateString));
    console.log('Selected Departure Date:', day.dateString);
    console.log('Auto-set Return Date:', day.dateString);
  };

  // ฟังก์ชันสำหรับเลือกวันที่กลับ
  const onReturnCalendarDayPress = (day) => {
    setCalendarEndDate(day.dateString);
    setReturnDate(new Date(day.dateString));
    console.log('Selected Return Date:', day.dateString);
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

  // ยืนยันการเลือกวันที่ไป
  const handleDepartCalendarConfirm = () => {
    if (calendarStartDate) {
      setDepartureDate(new Date(calendarStartDate));
      setShowDepartModal(false);
    } else {
      alert('กรุณาเลือกวันที่ไป');
    }
  };

  // ยืนยันการเลือกวันที่กลับ
  const handleReturnCalendarConfirm = () => {
    if (calendarEndDate) {
      setReturnDate(new Date(calendarEndDate));
      setShowReturnModal(false);
    } else {
      alert('กรุณาเลือกวันที่กลับ');
    }
  };

  useEffect(() => {
    // Sync calendar dates with departure/return dates on component mount
    if (departureDate) {
      setCalendarStartDate(departureDate.toISOString().split('T')[0]);
    }
    if (returnDate) {
      setCalendarEndDate(returnDate.toISOString().split('T')[0]);
    }
    // Mark calendar as ready after initial sync
    setTimeout(() => setCalendarReady(true), 100);
  }, []);

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
    <SafeAreaView style={{ flex: 1 }}>
      {/* Premium Gradient Background */}
      <LinearGradient
        colors={['#001233', '#002A5C', '#FD501E']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1.2 }}
        style={{ flex: 1 }}
      >
        {/* Enhanced Premium Header */}
        <LinearGradient
          colors={["rgba(255,255,255,0.98)", "rgba(248,250,252,0.95)", "rgba(241,245,249,0.9)"]}
          style={[
            headStyles.headerBg,
            {
              width: '100%',
              marginLeft: '0%',
              marginTop: Platform.OS === 'ios' ? 0 : -20,
              borderBottomLeftRadius: 40,
              borderBottomRightRadius: 40,
              paddingBottom: 8,
              shadowColor: '#001233',
              shadowOpacity: 0.15,
              shadowRadius: 25,
              shadowOffset: { width: 0, height: 8 },
              elevation: 18,
              padding: 10,
              minHeight: hp('12%'),
              borderWidth: 1,
              borderColor: 'rgba(0, 18, 51, 0.08)',
              // Ultra premium glass morphism
              backdropFilter: 'blur(30px)',
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
                marginTop: Platform.OS === 'android' ? 70 : -10,
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
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderRadius: 25,
                padding: 8,
                zIndex: 2,
                shadowColor: '#FD501E',
                shadowOpacity: 0.2,
                shadowRadius: 12,
                shadowOffset: { width: 0, height: 4 },
                elevation: 8,
                borderWidth: 1,
                borderColor: 'rgba(253, 80, 30, 0.1)',
              }}
            >
              <AntDesign name="arrowleft" size={24} color="#FD501E" />
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
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                padding: 10,
                borderRadius: 18,
                flexDirection: 'row',
                alignItems: 'center',
                zIndex: 2,
                shadowColor: '#FD501E',
                shadowOpacity: 0.2,
                shadowRadius: 12,
                shadowOffset: { width: 0, height: 4 },
                elevation: 8,
                borderWidth: 1,
                borderColor: 'rgba(253, 80, 30, 0.1)',
                minWidth: 70,
              }}
            >
              <Icon name="cash-outline" size={18} color="#FD501E" style={{ marginRight: 8 }} />
              <Text style={{ fontWeight: 'bold', color: '#FD501E', fontSize: 14, letterSpacing: 0.5 }}>{selectedCurrency}</Text>
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
        {/* Enhanced Ultra Premium Title and Filters Section */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: hp('2%'),
          marginHorizontal: wp('6%'),
          marginBottom: hp('2%'),
          paddingHorizontal: wp('2%'),
          paddingVertical: hp('1.5%'),
          backgroundColor: 'rgba(255,255,255,0.1)',
          borderRadius: wp('4%'),
          backdropFilter: 'blur(10px)',
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.2)',
        }}>
          <View style={{ flex: 1, paddingRight: wp('2%') }}>
            <Text style={{
                color: '#FFFFFF',
                fontSize: wp('5.5%'),
                fontWeight: '800',
                letterSpacing: -0.5,
                textAlign: 'left',
                marginBottom: hp('0.5%'),
                lineHeight: wp('7%'),
                textShadowColor: 'rgba(0,0,0,0.3)',
                textShadowRadius: 4,
                textShadowOffset: { width: 1, height: 1 },
              }}>
              {t('searchFerry')}
            </Text>
            <Text style={{
              color: 'rgba(255,255,255,0.8)',
              fontSize: wp('3.2%'),
              fontWeight: '500',
              lineHeight: wp('4.5%'),
              letterSpacing: 0.3,
              textShadowColor: 'rgba(0,0,0,0.2)',
              textShadowRadius: 2,
            }}>
              {t('findYourPerfectJourney')}
            </Text>
          </View>
          <TouchableOpacity
            style={{
              backgroundColor: 'rgba(255,255,255,0.25)',
              paddingVertical: hp('1.5%'),
              paddingHorizontal: wp('5%'),
              borderRadius: wp('4%'),
              shadowColor: Platform.OS === 'android' ? 'transparent' : '#FFFFFF',
              shadowOpacity: Platform.OS === 'android' ? 0 : 0.2,
              shadowRadius: Platform.OS === 'android' ? 0 : wp('3%'),
              shadowOffset: Platform.OS === 'android' ? { width: 0, height: 0 } : { width: 0, height: hp('0.5%') },
              elevation: Platform.OS === 'android' ? 0 : 8,
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.3)',
              backdropFilter: 'blur(15px)',
            }}
            onPress={() => tripTypeSearchResult === 'Depart Trip' ? setIsFilterModalVisibleDepart(true) : setIsFilterModalVisibleReturn(true)}
            activeOpacity={0.8}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icon name="options-outline" size={wp('4.5%')} color="#FFFFFF" style={{ marginRight: wp('2%') }} />
              <Text style={{
                color: '#FFFFFF',
                fontWeight: '700',
                fontSize: wp('3.8%'),
                letterSpacing: 0.5,
                textShadowColor: Platform.OS === 'android' ? 'transparent' : 'rgba(0,0,0,0.2)',
                textShadowRadius: Platform.OS === 'android' ? 0 : 2,
              }}>{ t('filters') }</Text>
            </View>
          </TouchableOpacity>
        </View>

        <Modal visible={tripTypeSearchResult === 'Depart Trip' ? isFilterModalVisibleDepart : isFilterModalVisibleReturn} animationType="slide" transparent={true}>
          <View style={{
            flex: 1,
            backgroundColor: 'rgba(0,18,51,0.7)',
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: wp('5%')
          }}>
            <View style={{
              backgroundColor: 'rgba(255,255,255,0.98)',
              width: '100%',
              maxWidth: wp('92%'),
              borderRadius: wp('6%'),
              padding: wp('6%'),
              shadowColor: Platform.OS === 'android' ? 'transparent' : '#001233',
              shadowOpacity: Platform.OS === 'android' ? 0 : 0.15,
              shadowRadius: Platform.OS === 'android' ? 0 : wp('6%'),
              shadowOffset: Platform.OS === 'android' ? { width: 0, height: 0 } : { width: 0, height: hp('1%') },
              elevation: Platform.OS === 'android' ? 0 : 20,
              borderWidth: 1,
              borderColor: 'rgba(0, 18, 51, 0.08)',
              backdropFilter: 'blur(25px)',
            }}>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: hp('3%')
              }}>
                <Text style={{
                  fontWeight: '800',
                  fontSize: wp('5.5%'),
                  color: '#1E293B',
                  letterSpacing: -0.3
                }}>
                  { t('ferryOperators') }
                </Text>
                <TouchableOpacity
                  onPress={() => tripTypeSearchResult === 'Depart Trip' ? setIsFilterModalVisibleDepart(false) : setIsFilterModalVisibleReturn(false)}
                  style={{
                    backgroundColor: 'rgba(248,250,252,0.8)',
                    padding: wp('2.5%'),
                    borderRadius: wp('4%'),
                    shadowColor: Platform.OS === 'android' ? 'transparent' : '#64748B',
                    shadowOpacity: Platform.OS === 'android' ? 0 : 0.1,
                    shadowRadius: Platform.OS === 'android' ? 0 : wp('2%'),
                    elevation: Platform.OS === 'android' ? 0 : 4,
                  }}
                  activeOpacity={0.7}
                >
                  <AntDesign name="close" size={wp('5%')} color="#64748B" />
                </TouchableOpacity>
              </View>

              {/* Enhanced Select All / Clear All Button */}
              <TouchableOpacity
                onPress={tripTypeSearchResult === 'Depart Trip' ? toggleSelectAllDepart : toggleSelectAllReturn}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: hp('2%'),
                  padding: wp('4%'),
                  backgroundColor: 'rgba(248,250,252,0.6)',
                  borderRadius: wp('4%'),
                  borderWidth: 1,
                  borderColor: 'rgba(253, 80, 30, 0.08)',
                  shadowColor: Platform.OS === 'android' ? 'transparent' : '#FD501E',
                  shadowOpacity: Platform.OS === 'android' ? 0 : 0.05,
                  shadowRadius: Platform.OS === 'android' ? 0 : wp('2%'),
                  elevation: Platform.OS === 'android' ? 0 : 2,
                }}
                activeOpacity={0.8}
              >
                <Icon
                  name={tripTypeSearchResult === 'Depart Trip' ? allSelectedDepart ? 'checkbox' : 'square-outline' : allSelectedReturn ? 'checkbox' : 'square-outline'}
                  size={wp('6%')}
                  color="#FD501E"
                  style={{ marginRight: wp('3%') }}
                />
                <Text style={{
                  fontSize: wp('4%'),
                  fontWeight: '600',
                  color: '#1E293B',
                  letterSpacing: 0.2
                }}>
                  { t('selectAllOperators') }
                </Text>
              </TouchableOpacity>

              {/* Enhanced Ultra Premium Company List */}
              <View style={{ maxHeight: hp('40%'), marginBottom: hp('2.5%') }}>
                {tripTypeSearchResult === 'Depart Trip'
                  ? availableCompaniesDepart.map((company, index) => (
                    <TouchableOpacity
                      key={company}
                      onPress={() => toggleCompanyDepart(company)}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginBottom: hp('1.5%'),
                        padding: wp('4%'),
                        backgroundColor: selectedCompaniesDepart.includes(company) ? 'rgba(253, 80, 30, 0.08)' : 'rgba(248,250,252,0.4)',
                        borderRadius: wp('4%'),
                        borderWidth: 1,
                        borderColor: selectedCompaniesDepart.includes(company) ? 'rgba(253, 80, 30, 0.15)' : 'rgba(148, 163, 184, 0.08)',
                        shadowColor: Platform.OS === 'android' ? 'transparent' : (selectedCompaniesDepart.includes(company) ? '#FD501E' : '#64748B'),
                        shadowOpacity: Platform.OS === 'android' ? 0 : (selectedCompaniesDepart.includes(company) ? 0.1 : 0.05),
                        shadowRadius: Platform.OS === 'android' ? 0 : wp('2%'),
                        shadowOffset: Platform.OS === 'android' ? { width: 0, height: 0 } : { width: 0, height: hp('0.2%') },
                        elevation: Platform.OS === 'android' ? 0 : (selectedCompaniesDepart.includes(company) ? 4 : 2),
                      }}
                      activeOpacity={0.7}
                    >
                      <Icon
                        name={selectedCompaniesDepart.includes(company) ? 'checkbox' : 'square-outline'}
                        size={wp('5.5%')}
                        color="#FD501E"
                        style={{ marginRight: wp('3.5%') }}
                      />
                      <Text style={{
                        fontSize: wp('3.8%'),
                        fontWeight: selectedCompaniesDepart.includes(company) ? '600' : '500',
                        color: selectedCompaniesDepart.includes(company) ? '#FD501E' : '#1E293B',
                        letterSpacing: 0.2,
                        flex: 1
                      }}>
                        {company}
                      </Text>
                    </TouchableOpacity>
                  ))
                  : availableCompaniesReturn.map((company, index) => (
                    <TouchableOpacity
                      key={company}
                      onPress={() => toggleCompanyReturn(company)}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginBottom: hp('1.5%'),
                        padding: wp('4%'),
                        backgroundColor: selectedCompaniesReturn.includes(company) ? 'rgba(253, 80, 30, 0.08)' : 'rgba(248,250,252,0.4)',
                        borderRadius: wp('4%'),
                        borderWidth: 1,
                        borderColor: selectedCompaniesReturn.includes(company) ? 'rgba(253, 80, 30, 0.15)' : 'rgba(148, 163, 184, 0.08)',
                        shadowColor: Platform.OS === 'android' ? 'transparent' : (selectedCompaniesReturn.includes(company) ? '#FD501E' : '#64748B'),
                        shadowOpacity: Platform.OS === 'android' ? 0 : (selectedCompaniesReturn.includes(company) ? 0.1 : 0.05),
                        shadowRadius: Platform.OS === 'android' ? 0 : wp('2%'),
                        shadowOffset: Platform.OS === 'android' ? { width: 0, height: 0 } : { width: 0, height: hp('0.2%') },
                        elevation: Platform.OS === 'android' ? 0 : (selectedCompaniesReturn.includes(company) ? 4 : 2),
                      }}
                      activeOpacity={0.7}
                    >
                      <Icon
                        name={selectedCompaniesReturn.includes(company) ? 'checkbox' : 'square-outline'}
                        size={wp('5.5%')}
                        color="#FD501E"
                        style={{ marginRight: wp('3.5%') }}
                      />
                      <Text style={{
                        fontSize: wp('3.8%'),
                        fontWeight: selectedCompaniesReturn.includes(company) ? '600' : '500',
                        color: selectedCompaniesReturn.includes(company) ? '#FD501E' : '#1E293B',
                        letterSpacing: 0.2,
                        flex: 1
                      }}>
                        {company}
                      </Text>
                    </TouchableOpacity>
                  ))
                }
              </View>

              {/* Enhanced Ultra Premium Apply Button */}
              <TouchableOpacity
                onPress={() => tripTypeSearchResult === 'Depart Trip' ? setIsFilterModalVisibleDepart(false) : setIsFilterModalVisibleReturn(false)}
                style={{
                  backgroundColor: '#FD501E',
                  padding: hp('2.2%'),
                  borderRadius: wp('5%'),
                  alignItems: 'center',
                  shadowColor: Platform.OS === 'android' ? 'transparent' : '#FD501E',
                  shadowOpacity: Platform.OS === 'android' ? 0 : 0.3,
                  shadowRadius: Platform.OS === 'android' ? 0 : wp('4%'),
                  shadowOffset: Platform.OS === 'android' ? { width: 0, height: 0 } : { width: 0, height: hp('0.8%') },
                  elevation: Platform.OS === 'android' ? 0 : 15,
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.25)',
                  // Premium gradient effect
                  background: 'linear-gradient(135deg, #FD501E 0%, #E8461A 100%)',
                }}
                activeOpacity={0.85}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <MaterialIcons name="check" size={wp('5%')} color="#FFFFFF" style={{ marginRight: wp('2%') }} />
                  <Text style={{
                    color: '#FFFFFF',
                    fontWeight: '800',
                    fontSize: wp('4.2%'),
                    letterSpacing: 0.5,
                    textShadowColor: 'rgba(0,0,0,0.2)',
                    textShadowRadius: 2,
                  }}>
                    { t('applyFilters') }
                  </Text>
                </View>
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
        <ScrollView
          contentContainerStyle={[
            styles.containerSearch,
            {
              backgroundColor: 'transparent',
              paddingHorizontal: 24,
              paddingTop: 8,
              paddingBottom: Platform.OS === 'android' ? hp('10%') : hp('8%'), // เพิ่ม padding bottom เพื่อไม่ให้ bottom bar บัง
              flexGrow: 1,
            }
          ]}
          showsVerticalScrollIndicator={false}
          style={{ flex: 1 }}
        >
          {/* Enhanced Premium Booking Section - Optimized Size */}
          <View style={[styles.bookingSection, {
            backgroundColor: 'rgba(255,255,255,0.95)',
            borderRadius: wp('4%'),
            padding: wp('4%'),
            marginBottom: hp('2%'),
            // Reduced shadows for smaller appearance
            shadowColor: '#001233',
            shadowOffset: { width: 0, height: hp('0.6%') },
            shadowOpacity: 0.08,
            shadowRadius: wp('3%'),
            elevation: 8,
            borderWidth: wp('0.2%'),
            borderColor: 'rgba(0, 18, 51, 0.06)',
            backdropFilter: 'blur(20px)',
            // Reduced margins for compact design
            marginHorizontal: wp('1%'),
          }]}>
            {/* Enhanced Premium Trip Type Selection - Compact */}
            <View style={[styles.tripTypeContainer, {
              backgroundColor: 'rgba(248,250,252,0.8)',
              borderRadius: wp('3%'),
              padding: wp('0.8%'),
              marginBottom: hp('2%'),
              shadowColor: Platform.OS === 'android' ? 'transparent' : '#001233',
              shadowOpacity: Platform.OS === 'android' ? 0 : 0.06,
              shadowRadius: Platform.OS === 'android' ? 0 : wp('2%'),
              elevation: Platform.OS === 'android' ? 0 : 4,
              borderWidth: 0.5,
              borderColor: 'rgba(0, 18, 51, 0.04)',
            }]}>
              <TouchableOpacity
                style={[
                  styles.tripTypeOneWayButton,
                  {
                    backgroundColor: tripType === "One Way Trip" ? '#FD501E' : 'transparent',
                    borderRadius: wp('2.5%'),
                    paddingVertical: hp('1.2%'),
                    paddingHorizontal: wp('4%'),
                    shadowColor: Platform.OS === 'android' ? 'transparent' : (tripType === "One Way Trip" ? '#FD501E' : 'transparent'),
                    shadowOpacity: Platform.OS === 'android' ? 0 : (tripType === "One Way Trip" ? 0.2 : 0),
                    shadowRadius: Platform.OS === 'android' ? 0 : wp('2%'),
                    shadowOffset: Platform.OS === 'android' ? { width: 0, height: 0 } : { width: 0, height: hp('0.3%') },
                    elevation: Platform.OS === 'android' ? 0 : (tripType === "One Way Trip" ? 6 : 0),
                    borderWidth: 0.5,
                    borderColor: tripType === "One Way Trip" ? 'rgba(255,255,255,0.2)' : 'transparent',
                  }
                ]}
                onPress={() => {
                  setTripType(TRIP_TYPES.ONE_WAY);
                  updateCustomerData({
                    roud: 1
                  })
                }}
              >
                <Text
                  style={[
                    styles.tripTypeText,
                    {
                      color: tripType === TRIP_TYPES.ONE_WAY ? '#FFFFFF' : '#64748B',
                      fontWeight: tripType === TRIP_TYPES.ONE_WAY ? '700' : '600',
                      fontSize: wp('3.5%'),
                      letterSpacing: 0.2,
                      textShadowColor: tripType === TRIP_TYPES.ONE_WAY ? 'rgba(0,0,0,0.1)' : 'transparent',
                      textShadowRadius: 1,
                    }
                  ]}
                >
                  {t('oneWayTrip')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.tripTypeRoundButton,
                  {
                    backgroundColor: tripType === "Return Trip" ? '#FD501E' : 'transparent',
                    borderRadius: wp('2.5%'),
                    paddingVertical: hp('1.2%'),
                    paddingHorizontal: wp('4%'),
                    shadowColor: Platform.OS === 'android' ? 'transparent' : (tripType === "Return Trip" ? '#FD501E' : 'transparent'),
                    shadowOpacity: Platform.OS === 'android' ? 0 : (tripType === "Return Trip" ? 0.2 : 0),
                    shadowRadius: Platform.OS === 'android' ? 0 : wp('2%'),
                    shadowOffset: Platform.OS === 'android' ? { width: 0, height: 0 } : { width: 0, height: hp('0.3%') },
                    elevation: Platform.OS === 'android' ? 0 : (tripType === "Return Trip" ? 6 : 0),
                    borderWidth: 0.5,
                    borderColor: tripType === "Return Trip" ? 'rgba(255,255,255,0.2)' : 'transparent',
                  }
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
                    {
                      color: tripType === "Return Trip" ? '#FFFFFF' : '#64748B',
                      fontWeight: tripType === "Return Trip" ? '700' : '600',
                      fontSize: wp('3.5%'),
                      letterSpacing: 0.2,
                      textShadowColor: tripType === "Return Trip" ? 'rgba(0,0,0,0.1)' : 'transparent',
                      textShadowRadius: 1,
                    }
                  ]}
                >
                  { t('roundTrip') }
                </Text>
              </TouchableOpacity>
            </View>

            {/* --- Enhanced Premium passenger selection row - Compact --- */}
            <View style={[styles.inputRow, { marginBottom: hp('1.5%') }]}>
              <TouchableOpacity
                style={[styles.inputBoxSearch, {
                  maxWidth: '100%',
                  flex: 1,
                  backgroundColor: 'rgba(255,255,255,0.9)',
                  borderRadius: wp('3%'),
                  padding: wp('3%'),
                  shadowColor: Platform.OS === 'android' ? 'transparent' : '#001233',
                  shadowOpacity: Platform.OS === 'android' ? 0 : 0.06,
                  shadowRadius: Platform.OS === 'android' ? 0 : wp('2%'),
                  elevation: Platform.OS === 'android' ? 0 : 4,
                  borderWidth: 0.5,
                  borderColor: 'rgba(0, 18, 51, 0.05)',
                  backdropFilter: 'blur(10px)',
                }]}
                onPress={() => setPassengerModalVisible(true)}
              >
                <View style={[headStyles.suggestionIconBox, {
                  alignSelf: 'center',
                  width: wp('8%'),
                  height: wp('8%'),
                  borderRadius: wp('8%') / 2,
                  minWidth: 28,
                  minHeight: 28,
                  backgroundColor: 'rgba(253, 80, 30, 0.1)',
                  shadowColor: Platform.OS === 'android' ? 'transparent' : '#FD501E',
                  shadowOpacity: Platform.OS === 'android' ? 0 : 0.1,
                  shadowRadius: Platform.OS === 'android' ? 0 : wp('1%'),
                  elevation: Platform.OS === 'android' ? 0 : 2,
                }]}>
                  <MaterialIcons name="groups" size={wp('5%')} color="#FD501E" />
                </View>
                <View style={[styles.inputBoxCol, { flex: 1, marginLeft: wp('2%') }]}>
                  <Text style={[styles.inputLabel, {
                    color: '#64748B',
                    fontSize: wp('3%'),
                    fontWeight: '600',
                    letterSpacing: 0.2,
                    marginBottom: 2,
                  }]}>{t('passengers')}</Text>
                  <Text
                    style={[styles.inputText, {
                      color: '#1E293B',
                      fontSize: wp('3.5%'),
                      fontWeight: '700',
                      letterSpacing: -0.1,
                      flexShrink: 1,
                    }]}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >{adults} { t('adult') }, {children} { t('child') }, {infant} { t('infant') }</Text>
                </View>
              </TouchableOpacity>
            </View>
            <Modal
              visible={isPassengerModalVisible}
              transparent
              animationType="slide"
              onRequestClose={() => setPassengerModalVisible(false)}
            >
              <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }}>
                <View style={{
                  backgroundColor: '#fff',
                  borderRadius: 32,
                  padding: 24,
                  width: '100%',
                  maxWidth: 420,
                  shadowColor: Platform.OS === 'android' ? 'transparent' : '#000',
                  shadowOpacity: Platform.OS === 'android' ? 0 : 0.25,
                  shadowRadius: Platform.OS === 'android' ? 0 : 20,
                  shadowOffset: Platform.OS === 'android' ? { width: 0, height: 0 } : { width: 0, height: 10 },
                  elevation: Platform.OS === 'android' ? 0 : 15,
                  borderWidth: 1,
                  borderColor: 'rgba(253, 80, 30, 0.1)'
                }}>
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 20
                  }}>
                    <Text style={{
                      fontWeight: '800',
                      fontSize: 22,
                      color: '#1E293B',
                      letterSpacing: -0.5
                    }}>
                      { t('selectPassengers') }
                    </Text>
                    <TouchableOpacity
                      onPress={() => setPassengerModalVisible(false)}
                      style={{
                        backgroundColor: '#F1F5F9',
                        padding: 8,
                        borderRadius: 20,
                      }}
                    >
                      <AntDesign name="close" size={20} color="#64748B" />
                    </TouchableOpacity>
                  </View>
                  <View style={{ marginBottom: 20, gap: 16 }}>
                    {/* Ultra Premium Adults Row */}
                    <View style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      backgroundColor: 'rgba(253, 80, 30, 0.05)',
                      borderRadius: 20,
                      paddingVertical: 12,
                      paddingHorizontal: 16,
                      marginBottom: 10,
                      shadowColor: Platform.OS === 'android' ? 'transparent' : '#FD501E',
                      shadowOpacity: Platform.OS === 'android' ? 0 : 0.08,
                      shadowRadius: Platform.OS === 'android' ? 0 : 8,
                      elevation: Platform.OS === 'android' ? 0 : 3,
                      borderWidth: 1,
                      borderColor: 'rgba(253, 80, 30, 0.1)'
                    }}>
                      <Text style={{
                        color: '#FD501E',
                        fontWeight: '800',
                        fontSize: 16,
                        flex: 1,
                        letterSpacing: -0.3
                      }}>
                        { t('adults') }
                      </Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', flexShrink: 0 }}>
                        <TouchableOpacity
                          onPress={() => setAdults(Math.max(1, adults - 1))}
                          style={{
                            padding: 4,
                            borderRadius: 16,
                            backgroundColor: adults > 1 ? 'rgba(253, 80, 30, 0.15)' : '#F1F5F9',
                            shadowColor: Platform.OS === 'android' ? 'transparent' : (adults > 1 ? '#FD501E' : 'transparent'),
                            shadowOpacity: Platform.OS === 'android' ? 0 : 0.2,
                            shadowRadius: Platform.OS === 'android' ? 0 : 4,
                            elevation: Platform.OS === 'android' ? 0 : (adults > 1 ? 2 : 0)
                          }}
                        >
                          <Icon name="remove-circle" size={24} color={adults > 1 ? '#FD501E' : '#94A3B8'} />
                        </TouchableOpacity>
                        <Text style={{
                          fontSize: 18,
                          fontWeight: '800',
                          marginHorizontal: 12,
                          minWidth: 24,
                          textAlign: 'center',
                          color: '#1E293B',
                          letterSpacing: -0.5
                        }}>
                          {adults}
                        </Text>
                        <TouchableOpacity
                          onPress={() => setAdults(Math.min(10, adults + 1))}
                          style={{
                            padding: 4,
                            borderRadius: 16,
                            backgroundColor: adults < 10 ? 'rgba(253, 80, 30, 0.15)' : '#F1F5F9',
                            shadowColor: Platform.OS === 'android' ? 'transparent' : (adults < 10 ? '#FD501E' : 'transparent'),
                            shadowOpacity: Platform.OS === 'android' ? 0 : 0.2,
                            shadowRadius: Platform.OS === 'android' ? 0 : 4,
                            elevation: Platform.OS === 'android' ? 0 : (adults < 10 ? 2 : 0)
                          }}
                        >
                          <Icon name="add-circle" size={24} color={adults < 10 ? '#FD501E' : '#94A3B8'} />
                        </TouchableOpacity>
                      </View>
                    </View>
                    {/* Ultra Premium Children Row */}
                    <View style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      backgroundColor: 'rgba(253, 80, 30, 0.05)',
                      borderRadius: 20,
                      paddingVertical: 12,
                      paddingHorizontal: 16,
                      marginBottom: 10,
                      shadowColor: Platform.OS === 'android' ? 'transparent' : '#FD501E',
                      shadowOpacity: Platform.OS === 'android' ? 0 : 0.08,
                      shadowRadius: Platform.OS === 'android' ? 0 : 8,
                      elevation: Platform.OS === 'android' ? 0 : 3,
                      borderWidth: 1,
                      borderColor: 'rgba(253, 80, 30, 0.1)'
                    }}>
                      <Text style={{
                        color: '#FD501E',
                        fontWeight: '800',
                        fontSize: 16,
                        flex: 1,
                        letterSpacing: -0.3
                      }}>
                        { t('children') }
                      </Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', flexShrink: 0 }}>
                        <TouchableOpacity
                          onPress={() => setChildren(Math.max(0, children - 1))}
                          style={{
                            padding: 4,
                            borderRadius: 16,
                            backgroundColor: children > 0 ? 'rgba(253, 80, 30, 0.15)' : '#F1F5F9',
                            shadowColor: Platform.OS === 'android' ? 'transparent' : (children > 0 ? '#FD501E' : 'transparent'),
                            shadowOpacity: Platform.OS === 'android' ? 0 : 0.2,
                            shadowRadius: Platform.OS === 'android' ? 0 : 4,
                            elevation: Platform.OS === 'android' ? 0 : (children > 0 ? 2 : 0)
                          }}
                        >
                          <Icon name="remove-circle" size={24} color={children > 0 ? '#FD501E' : '#94A3B8'} />
                        </TouchableOpacity>
                        <Text style={{
                          fontSize: 18,
                          fontWeight: '800',
                          marginHorizontal: 12,
                          minWidth: 24,
                          textAlign: 'center',
                          color: '#1E293B',
                          letterSpacing: -0.5
                        }}>
                          {children}
                        </Text>
                        <TouchableOpacity
                          onPress={() => setChildren(Math.min(10, children + 1))}
                          style={{
                            padding: 4,
                            borderRadius: 16,
                            backgroundColor: children < 10 ? 'rgba(253, 80, 30, 0.15)' : '#F1F5F9',
                            shadowColor: Platform.OS === 'android' ? 'transparent' : (children < 10 ? '#FD501E' : 'transparent'),
                            shadowOpacity: Platform.OS === 'android' ? 0 : 0.2,
                            shadowRadius: Platform.OS === 'android' ? 0 : 4,
                            elevation: Platform.OS === 'android' ? 0 : (children < 10 ? 2 : 0)
                          }}
                        >
                          <Icon name="add-circle" size={24} color={children < 10 ? '#FD501E' : '#94A3B8'} />
                        </TouchableOpacity>
                      </View>
                    </View>
                    {/* Ultra Premium Infants Row */}
                    <View style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      backgroundColor: 'rgba(253, 80, 30, 0.05)',
                      borderRadius: 20,
                      paddingVertical: 12,
                      paddingHorizontal: 16,
                      shadowColor: Platform.OS === 'android' ? 'transparent' : '#FD501E',
                      shadowOpacity: Platform.OS === 'android' ? 0 : 0.08,
                      shadowRadius: Platform.OS === 'android' ? 0 : 8,
                      elevation: Platform.OS === 'android' ? 0 : 3,
                      borderWidth: 1,
                      borderColor: 'rgba(253, 80, 30, 0.1)'
                    }}>
                      <Text style={{
                        color: '#FD501E',
                        fontWeight: '800',
                        fontSize: 16,
                        flex: 1,
                        letterSpacing: -0.3
                      }}>
                        { t('infants') }
                      </Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', flexShrink: 0 }}>
                        <TouchableOpacity
                          onPress={() => setInfant(Math.max(0, infant - 1))}
                          style={{
                            padding: 4,
                            borderRadius: 16,
                            backgroundColor: infant > 0 ? 'rgba(253, 80, 30, 0.15)' : '#F1F5F9',
                            shadowColor: Platform.OS === 'android' ? 'transparent' : (infant > 0 ? '#FD501E' : 'transparent'),
                            shadowOpacity: Platform.OS === 'android' ? 0 : 0.2,
                            shadowRadius: Platform.OS === 'android' ? 0 : 4,
                            elevation: Platform.OS === 'android' ? 0 : (infant > 0 ? 2 : 0)
                          }}
                        >
                          <Icon name="remove-circle" size={24} color={infant > 0 ? '#FD501E' : '#94A3B8'} />
                        </TouchableOpacity>
                        <Text style={{
                          fontSize: 18,
                          fontWeight: '800',
                          marginHorizontal: 12,
                          minWidth: 24,
                          textAlign: 'center',
                          color: '#1E293B',
                          letterSpacing: -0.5
                        }}>
                          {infant}
                        </Text>
                        <TouchableOpacity
                          onPress={() => setInfant(Math.min(10, infant + 1))}
                          style={{
                            padding: 4,
                            borderRadius: 16,
                            backgroundColor: infant < 10 ? 'rgba(253, 80, 30, 0.15)' : '#F1F5F9',
                            shadowColor: Platform.OS === 'android' ? 'transparent' : (infant < 10 ? '#FD501E' : 'transparent'),
                            shadowOpacity: Platform.OS === 'android' ? 0 : 0.2,
                            shadowRadius: Platform.OS === 'android' ? 0 : 4,
                            elevation: Platform.OS === 'android' ? 0 : (infant < 10 ? 2 : 0)
                          }}
                        >
                          <Icon name="add-circle" size={24} color={infant < 10 ? '#FD501E' : '#94A3B8'} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => setPassengerModalVisible(false)}
                    style={{
                      backgroundColor: '#FD501E',
                      borderRadius: 20,
                      padding: 16,
                      alignItems: 'center',
                      marginTop: 12,
                      shadowColor: Platform.OS === 'android' ? 'transparent' : '#FD501E',
                      shadowOpacity: Platform.OS === 'android' ? 0 : 0.3,
                      shadowRadius: Platform.OS === 'android' ? 0 : 16,
                      shadowOffset: Platform.OS === 'android' ? { width: 0, height: 0 } : { width: 0, height: 6 },
                      elevation: Platform.OS === 'android' ? 0 : 12,
                      borderWidth: 1,
                      borderColor: 'rgba(255, 255, 255, 0.2)'
                    }}
                  >
                    <Text style={{
                      color: '#fff',
                      fontWeight: 'bold',
                      fontSize: 16,
                      letterSpacing: 0.5
                    }}>
                      { t('confirmSelection') }
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>

            {/* Enhanced Premium From/To Selection Row - Compact */}
            <View style={[styles.inputRow, { marginBottom: hp('1.5%') }]}>
              <TouchableOpacity
                onPress={() => navigation.navigate('StartingPointScreen', { setStartingPoint })}
                style={[styles.inputBoxSearch, {
                  width: '42%',
                  backgroundColor: 'rgba(255,255,255,0.9)',
                  borderRadius: wp('3%'),
                  padding: wp('2.5%'),
                  shadowColor: Platform.OS === 'android' ? 'transparent' : '#001233',
                  shadowOpacity: Platform.OS === 'android' ? 0 : 0.06,
                  shadowRadius: Platform.OS === 'android' ? 0 : wp('2%'),
                  elevation: Platform.OS === 'android' ? 0 : 4,
                  borderWidth: 0.5,
                  borderColor: 'rgba(0, 18, 51, 0.05)',
                  backdropFilter: 'blur(10px)',
                }]}
              >
                <View style={[headStyles.suggestionIconBox, {
                  alignSelf: 'center',
                  width: wp('7%'),
                  height: wp('7%'),
                  borderRadius: wp('7%') / 2,
                  minWidth: 24,
                  minHeight: 24,
                  backgroundColor: 'rgba(253, 80, 30, 0.1)',
                  shadowColor: Platform.OS === 'android' ? 'transparent' : '#FD501E',
                  shadowOpacity: Platform.OS === 'android' ? 0 : 0.1,
                  shadowRadius: Platform.OS === 'android' ? 0 : wp('1%'),
                  elevation: Platform.OS === 'android' ? 0 : 2,
                }]}>
                  <MaterialIcons name="directions-boat" size={wp('4.5%')} color="#FD501E" />
                </View>
                <View style={{ flex: 1, marginLeft: wp('1.5%') }}>
                  <View style={styles.inputBoxCol}>
                    <Text style={[styles.inputLabel, {
                      color: '#64748B',
                      fontSize: wp('3%'),
                      fontWeight: '600',
                      letterSpacing: 0.2,
                      marginBottom: 2,
                    }]}>{t('from')}</Text>
                    <Text
                      style={[styles.inputText, {
                        color: '#1E293B',
                        fontSize: wp('3.2%'),
                        fontWeight: '700',
                        letterSpacing: -0.1,
                      }]}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    > {truncateText(startingPoint.name, 12)}</Text>
                  </View>
                </View>
              </TouchableOpacity>

              {/* Enhanced Premium Swap icon - Compact */}
              <TouchableOpacity onPress={swapPoints}>
                <View style={{
                  backgroundColor: '#FD501E',
                  borderRadius: wp('4%'),
                  marginHorizontal: wp('2%'),
                  marginLeft: wp('1%'),
                  marginRight: wp('1%'),
                  width: wp('8%'),
                  height: wp('8%'),
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: 28,
                  minHeight: 28,
                  shadowColor: Platform.OS === 'android' ? 'transparent' : '#FD501E',
                  shadowOpacity: Platform.OS === 'android' ? 0 : 0.25,
                  shadowRadius: Platform.OS === 'android' ? 0 : wp('2%'),
                  shadowOffset: Platform.OS === 'android' ? { width: 0, height: 0 } : { width: 0, height: hp('0.3%') },
                  elevation: Platform.OS === 'android' ? 0 : 6,
                  borderWidth: 0.5,
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                }}>
                  <MaterialIcons name="swap-horiz" size={wp('5%')} color="#FFFFFF" />
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => navigation.navigate('EndPointScreen', { setEndPoint, startingPointId: startingPoint.id, })}
                style={[styles.inputBoxSearch, {
                  width: '42%',
                  backgroundColor: 'rgba(255,255,255,0.9)',
                  borderRadius: wp('3%'),
                  padding: wp('2.5%'),
                  shadowColor: Platform.OS === 'android' ? 'transparent' : '#001233',
                  shadowOpacity: Platform.OS === 'android' ? 0 : 0.06,
                  shadowRadius: Platform.OS === 'android' ? 0 : wp('2%'),
                  elevation: Platform.OS === 'android' ? 0 : 4,
                  borderWidth: 0.5,
                  borderColor: 'rgba(0, 18, 51, 0.05)',
                  backdropFilter: 'blur(10px)',
                }]}
              >
                <View style={[headStyles.suggestionIconBox, {
                  width: wp('7%'),
                  height: wp('7%'),
                  borderRadius: wp('7%') / 2,
                  minWidth: 24,
                  minHeight: 24,
                  backgroundColor: 'rgba(253, 80, 30, 0.1)',
                  shadowColor: Platform.OS === 'android' ? 'transparent' : '#FD501E',
                  shadowOpacity: Platform.OS === 'android' ? 0 : 0.1,
                  shadowRadius: Platform.OS === 'android' ? 0 : wp('1%'),
                  elevation: Platform.OS === 'android' ? 0 : 2,
                }]}>
                  <MaterialIcons name="location-on" size={wp('4.5%')} color="#FD501E" />
                </View>
                <View style={[styles.inputBoxCol, { flex: 1, marginLeft: wp('1.5%') }]}>
                  <Text style={[styles.inputLabel, {
                    color: '#64748B',
                    fontSize: wp('3%'),
                    fontWeight: '600',
                    letterSpacing: 0.2,
                    marginBottom: 2,
                  }]}>{t('to')}</Text>
                  <Text
                    style={[styles.inputText, {
                      color: '#1E293B',
                      fontSize: wp('3.2%'),
                      fontWeight: '700',
                      letterSpacing: -0.1,
                    }]}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  > {truncateText(endPoint.name, 12)}</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Enhanced Premium Date Selection Row - Compact */}
            <View style={[styles.inputRow, { marginBottom: hp('1.5%') }]}>
              <View style={[styles.inputBoxSearch, {
                maxWidth: '100%',
                flex: 1,
                backgroundColor: 'rgba(255,255,255,0.9)',
                borderRadius: wp('3%'),
                padding: wp('3%'),
                shadowColor: Platform.OS === 'android' ? 'transparent' : '#001233',
                shadowOpacity: Platform.OS === 'android' ? 0 : 0.06,
                shadowRadius: Platform.OS === 'android' ? 0 : wp('2%'),
                elevation: Platform.OS === 'android' ? 0 : 4,
                borderWidth: 0.5,
                borderColor: 'rgba(0, 18, 51, 0.05)',
                backdropFilter: 'blur(10px)',
              }]}>
                <TouchableOpacity
                  onPress={() => {
                    setShowDepartModal(true);  // Show the departure date picker
                  }}
                  style={[
                    styles.rowdepart,
                    {
                      width: tripType === "One Way Trip" ? wp('100%') : 'auto',
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingVertical: hp('0.5%'),
                    }
                  ]}
                >
                  <View style={[headStyles.suggestionIconBox, {
                    width: wp('8%'),
                    height: wp('8%'),
                    borderRadius: wp('8%') / 2,
                    minWidth: 28,
                    minHeight: 28,
                    backgroundColor: 'rgba(253, 80, 30, 0.1)',
                    shadowColor: Platform.OS === 'android' ? 'transparent' : '#FD501E',
                    shadowOpacity: Platform.OS === 'android' ? 0 : 0.1,
                    shadowRadius: Platform.OS === 'android' ? 0 : wp('1%'),
                    elevation: Platform.OS === 'android' ? 0 : 2,
                    marginRight: wp('2%'),
                  }]}>
                    <MaterialIcons name="event" size={wp('5%')} color="#FD501E" />
                  </View>
                  <View style={[styles.inputBoxCol, { flex: 1 }]}>
                    <Text style={[styles.inputLabel, {
                      color: '#64748B',
                      fontSize: wp('3%'),
                      fontWeight: '600',
                      letterSpacing: 0.2,
                      marginBottom: 2,
                    }]}>{t('departureDate')}</Text>
                    <Text
                      style={[styles.inputText, {
                        color: '#1E293B',
                        fontSize: wp('3.5%'),
                        fontWeight: '700',
                        letterSpacing: -0.1,
                      }]}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >{calendarStartDate ? formatDateInput(calendarStartDate.toString()) : "Select Date"}</Text>
                  </View>
                </TouchableOpacity>

                {tripType === "Return Trip" && (
                  <>
                    <View style={{
                      height: 0.5,
                      backgroundColor: 'rgba(0, 18, 51, 0.08)',
                      marginVertical: hp('1%'),
                      marginHorizontal: wp('1%'),
                    }} />
                    <TouchableOpacity
                      onPress={() => setShowReturnModal(true)}
                      disabled={!departureDate}
                      style={[styles.rowdepart, {
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingVertical: hp('0.5%'),
                        opacity: !departureDate ? 0.6 : 1,
                      }]}
                    >
                      {/* Enhanced Return Date Icon - Compact */}
                      <View style={[headStyles.suggestionIconBox, {
                        backgroundColor: 'rgba(255, 214, 0, 0.12)',
                        width: wp('8%'),
                        height: wp('8%'),
                        borderRadius: wp('8%') / 2,
                        minWidth: 28,
                        minHeight: 28,
                        shadowColor: Platform.OS === 'android' ? 'transparent' : '#FFD600',
                        shadowOpacity: Platform.OS === 'android' ? 0 : 0.1,
                        shadowRadius: Platform.OS === 'android' ? 0 : wp('1%'),
                        elevation: Platform.OS === 'android' ? 0 : 2,
                        marginRight: wp('2%'),
                      }]}>
                        <MaterialIcons name="event" size={wp('5%')} color="#FFD600" />
                      </View>
                      <View style={[styles.inputBoxCol, { flex: 1 }]}>
                        <Text style={[styles.inputLabel, {
                          color: '#64748B',
                          fontSize: wp('3%'),
                          fontWeight: '600',
                          letterSpacing: 0.2,
                          marginBottom: 2,
                        }]}>{ t('returnDate') }</Text>
                        <Text
                          style={[styles.inputText, {
                            color: '#1E293B',
                            fontSize: wp('3.5%'),
                            fontWeight: '700',
                            letterSpacing: -0.1,
                          }]}
                          numberOfLines={1}
                          ellipsizeMode="tail"
                        >{calendarEndDate ? formatDateInput(calendarEndDate.toString()) : "No Date Available"}</Text>
                      </View>
                    </TouchableOpacity>
                  </>
                )}
              </View>

              {/* Enhanced Departure Date Calendar Modal */}
              <Modal
                visible={showDepartModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowDepartModal(false)}
                statusBarTranslucent
              >
                <View style={{
                  flex: 1,
                  backgroundColor: 'rgba(0,18,51,0.75)',
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingHorizontal: Platform.OS === 'android' ? 12 : 16,
                  paddingVertical: Platform.OS === 'android' ? 16 : 24,
                  paddingTop: Platform.OS === 'android' ? 40 : 30,
                }}>
                  <View style={{
                    backgroundColor: 'rgba(255,255,255,0.98)',
                    borderRadius: Platform.OS === 'android' ? 16 : 24,
                    padding: Platform.OS === 'android' ? 20 : 24,
                    width: Platform.OS === 'android' ? '98%' : '95%',
                    maxWidth: Platform.OS === 'android' ? 420 : 450,
                    maxHeight: Platform.OS === 'android' ? '90%' : '85%',
                    minHeight: Platform.OS === 'android' ? hp('70%') : hp('65%'),
                    shadowColor: Platform.OS === 'android' ? 'transparent' : '#001233',
                    shadowOpacity: Platform.OS === 'android' ? 0 : 0.25,
                    shadowRadius: Platform.OS === 'android' ? 0 : 20,
                    shadowOffset: Platform.OS === 'android' ? { width: 0, height: 0 } : { width: 0, height: 8 },
                    elevation: Platform.OS === 'android' ? 8 : 20,
                    borderWidth: 1,
                    borderColor: 'rgba(253, 80, 30, 0.08)',
                    transform: [{ scale: showDepartModal ? 1 : 0.9 }],
                    opacity: showDepartModal ? 1 : 0,
                  }}>
                    {/* Enhanced Header */}
                    <View style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: Platform.OS === 'android' ? 12 : 20,
                    }}>
                      <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        flex: 1,
                      }}>
                        <MaterialIcons name="event" size={Platform.OS === 'android' ? 20 : 24} color="#FD501E" style={{ marginRight: 8 }} />
                        <Text style={{
                          fontWeight: '800',
                          fontSize: Platform.OS === 'android' ? 16 : 18,
                          color: '#1E293B',
                          letterSpacing: -0.3,
                          flex: 1,
                        }} numberOfLines={1}>{ t('selectDepartureDate') }</Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => setShowDepartModal(false)}
                        style={{
                          backgroundColor: 'rgba(248,250,252,0.8)',
                          padding: Platform.OS === 'android' ? 6 : 8,
                          borderRadius: Platform.OS === 'android' ? 16 : 20,
                          shadowColor: Platform.OS === 'android' ? 'transparent' : '#64748B',
                          shadowOpacity: Platform.OS === 'android' ? 0 : 0.1,
                          shadowRadius: Platform.OS === 'android' ? 0 : 8,
                          elevation: Platform.OS === 'android' ? 2 : 4,
                        }}
                        activeOpacity={0.7}
                      >
                        <AntDesign name="close" size={Platform.OS === 'android' ? 16 : 20} color="#64748B" />
                      </TouchableOpacity>
                    </View>

                    {/* Enhanced Departure Date Calendar */}
                    <View style={{ flex: 1, minHeight: Platform.OS === 'android' ? hp('55%') : hp('50%') }}>
                      <ScrollView
                        style={{
                          maxHeight: Platform.OS === 'android' ? hp('55%') : hp('50%'),
                        }}
                        showsVerticalScrollIndicator={false}
                        nestedScrollEnabled={true}
                      >
                        <View style={{
                          backgroundColor: 'rgba(253, 80, 30, 0.06)',
                          borderRadius: Platform.OS === 'android' ? 12 : 16,
                          padding: Platform.OS === 'android' ? 12 : 16,
                          borderWidth: 1,
                          borderColor: 'rgba(253, 80, 30, 0.1)',
                          marginBottom: Platform.OS === 'android' ? 8 : 12,
                          minHeight: Platform.OS === 'android' ? 350 : 380,
                        }}>
                          {calendarReady ? (
                            <Calendar
                              current={calendarStartDate}
                              minDate={new Date().toISOString().split('T')[0]}
                              onDayPress={onDepartCalendarDayPress}
                              markedDates={{
                                [calendarStartDate]: {
                                  selected: true,
                                  selectedColor: '#FD501E',
                                  selectedTextColor: '#FFFFFF'
                                }
                              }}
                              theme={{
                                backgroundColor: 'transparent',
                                calendarBackground: 'transparent',
                                textSectionTitleColor: '#1E293B',
                                selectedDayBackgroundColor: '#FD501E',
                                selectedDayTextColor: '#FFFFFF',
                                todayTextColor: '#FD501E',
                                dayTextColor: '#1E293B',
                                textDisabledColor: '#94A3B8',
                                arrowColor: '#FD501E',
                                monthTextColor: '#1E293B',
                                textDayFontWeight: '600',
                                textMonthFontWeight: '700',
                                textDayHeaderFontWeight: '600',
                                textDayFontSize: Platform.OS === 'android' ? 14 : 16,
                                textMonthFontSize: Platform.OS === 'android' ? 16 : 18,
                                textDayHeaderFontSize: Platform.OS === 'android' ? 12 : 14,
                              }}
                              enableSwipeMonths={true}
                              firstDay={1}
                              hideExtraDays={false}
                              disableMonthChange={false}
                              hideDayNames={false}
                              showWeekNumbers={false}
                            />
                          ) : (
                            <View style={{
                              justifyContent: 'center',
                              alignItems: 'center',
                              minHeight: Platform.OS === 'android' ? 350 : 380,
                            }}>
                              <Text style={{
                                color: '#64748B',
                                fontSize: 16,
                                fontWeight: '500',
                              }}>Loading Calendar...</Text>
                            </View>
                          )}
                        </View>
                      </ScrollView>

                      {/* Enhanced Confirm Button - Fixed at bottom */}
                      <View style={{
                        paddingTop: Platform.OS === 'android' ? 16 : 20,
                        paddingBottom: Platform.OS === 'android' ? 8 : 12,
                      }}>
                        <TouchableOpacity
                          onPress={handleDepartCalendarConfirm}
                          style={{
                            backgroundColor: '#FD501E',
                            borderRadius: Platform.OS === 'android' ? 12 : 16,
                            padding: Platform.OS === 'android' ? 14 : 18,
                            alignItems: 'center',
                            shadowColor: Platform.OS === 'android' ? 'transparent' : '#FD501E',
                            shadowOpacity: Platform.OS === 'android' ? 0 : 0.3,
                            shadowRadius: Platform.OS === 'android' ? 0 : 12,
                            shadowOffset: Platform.OS === 'android' ? { width: 0, height: 0 } : { width: 0, height: 4 },
                            elevation: Platform.OS === 'android' ? 4 : 12,
                            borderWidth: 1,
                            borderColor: 'rgba(255, 255, 255, 0.25)',
                          }}
                          activeOpacity={0.85}
                        >
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <MaterialIcons name="check" size={Platform.OS === 'android' ? 20 : 22} color="#FFFFFF" style={{ marginRight: 8 }} />
                            <Text style={{
                              color: '#FFFFFF',
                              fontWeight: '800',
                              fontSize: Platform.OS === 'android' ? 16 : 18,
                              letterSpacing: 0.5,
                              textShadowColor: 'rgba(0,0,0,0.2)',
                              textShadowRadius: 2,
                            }}>
                              { t('confirmDepartureDate') }
                            </Text>
                          </View>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>
              </Modal>

              {/* Enhanced Return Date Calendar Modal */}
              <Modal
                visible={showReturnModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowReturnModal(false)}
                statusBarTranslucent
              >
                <View style={{
                  flex: 1,
                  backgroundColor: 'rgba(0,18,51,0.75)',
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingHorizontal: Platform.OS === 'android' ? 12 : 16,
                  paddingVertical: Platform.OS === 'android' ? 16 : 24,
                  paddingTop: Platform.OS === 'android' ? 40 : 30,
                }}>
                  <View style={{
                    backgroundColor: 'rgba(255,255,255,0.98)',
                    borderRadius: Platform.OS === 'android' ? 16 : 24,
                    padding: Platform.OS === 'android' ? 20 : 24,
                    width: Platform.OS === 'android' ? '98%' : '95%',
                    maxWidth: Platform.OS === 'android' ? 420 : 450,
                    maxHeight: Platform.OS === 'android' ? '90%' : '85%',
                    minHeight: Platform.OS === 'android' ? hp('70%') : hp('65%'),
                    shadowColor: Platform.OS === 'android' ? 'transparent' : '#001233',
                    shadowOpacity: Platform.OS === 'android' ? 0 : 0.25,
                    shadowRadius: Platform.OS === 'android' ? 0 : 20,
                    shadowOffset: Platform.OS === 'android' ? { width: 0, height: 0 } : { width: 0, height: 8 },
                    elevation: Platform.OS === 'android' ? 8 : 20,
                    borderWidth: 1,
                    borderColor: 'rgba(255, 214, 0, 0.15)',
                    transform: [{ scale: showReturnModal ? 1 : 0.9 }],
                    opacity: showReturnModal ? 1 : 0,
                  }}>
                    {/* Enhanced Header */}
                    <View style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: Platform.OS === 'android' ? 12 : 20,
                    }}>
                      <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        flex: 1,
                      }}>
                        <MaterialIcons name="event" size={Platform.OS === 'android' ? 20 : 24} color="#B8860B" style={{ marginRight: 8 }} />
                        <Text style={{
                          fontWeight: '800',
                          fontSize: Platform.OS === 'android' ? 16 : 18,
                          color: '#1E293B',
                          letterSpacing: -0.3,
                          flex: 1,
                        }} numberOfLines={1}>{ t('selectReturnDate') }</Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => setShowReturnModal(false)}
                        style={{
                          backgroundColor: 'rgba(248,250,252,0.8)',
                          padding: Platform.OS === 'android' ? 6 : 8,
                          borderRadius: Platform.OS === 'android' ? 16 : 20,
                          shadowColor: Platform.OS === 'android' ? 'transparent' : '#64748B',
                          shadowOpacity: Platform.OS === 'android' ? 0 : 0.1,
                          shadowRadius: Platform.OS === 'android' ? 0 : 8,
                          elevation: Platform.OS === 'android' ? 2 : 4,
                        }}
                        activeOpacity={0.7}
                      >
                        <AntDesign name="close" size={Platform.OS === 'android' ? 16 : 20} color="#64748B" />
                      </TouchableOpacity>
                    </View>

                    {/* Enhanced Return Date Calendar */}
                    <View style={{ flex: 1, minHeight: Platform.OS === 'android' ? hp('55%') : hp('50%') }}>
                      <ScrollView
                        style={{
                          maxHeight: Platform.OS === 'android' ? hp('55%') : hp('50%'),
                        }}
                        showsVerticalScrollIndicator={false}
                        nestedScrollEnabled={true}
                      >
                        <View style={{
                          backgroundColor: 'rgba(255, 214, 0, 0.06)',
                          borderRadius: Platform.OS === 'android' ? 12 : 16,
                          padding: Platform.OS === 'android' ? 12 : 16,
                          borderWidth: 1,
                          borderColor: 'rgba(255, 214, 0, 0.15)',
                          marginBottom: Platform.OS === 'android' ? 8 : 12,
                          minHeight: Platform.OS === 'android' ? 350 : 380,
                        }}>
                          {calendarReady ? (
                            <Calendar
                              current={calendarEndDate}
                              minDate={calendarStartDate}
                              onDayPress={onReturnCalendarDayPress}
                              markedDates={{
                                [calendarEndDate]: {
                                  selected: true,
                                  selectedColor: '#FFD600',
                                  selectedTextColor: '#1E293B'
                                }
                              }}
                              theme={{
                                backgroundColor: 'transparent',
                                calendarBackground: 'transparent',
                                textSectionTitleColor: '#1E293B',
                                selectedDayBackgroundColor: '#FFD600',
                                selectedDayTextColor: '#1E293B',
                                todayTextColor: '#FFD600',
                                dayTextColor: '#1E293B',
                                textDisabledColor: '#94A3B8',
                                arrowColor: '#FFD600',
                                monthTextColor: '#1E293B',
                                textDayFontWeight: '600',
                                textMonthFontWeight: '700',
                                textDayHeaderFontWeight: '600',
                                textDayFontSize: Platform.OS === 'android' ? 14 : 16,
                                textMonthFontSize: Platform.OS === 'android' ? 16 : 18,
                                textDayHeaderFontSize: Platform.OS === 'android' ? 12 : 14,
                              }}
                              enableSwipeMonths={true}
                              firstDay={1}
                              hideExtraDays={false}
                              disableMonthChange={false}
                              hideDayNames={false}
                              showWeekNumbers={false}
                            />
                          ) : (
                            <View style={{
                              justifyContent: 'center',
                              alignItems: 'center',
                              minHeight: Platform.OS === 'android' ? 350 : 380,
                            }}>
                              <Text style={{
                                color: '#64748B',
                                fontSize: 16,
                                fontWeight: '500',
                              }}>Loading Calendar...</Text>
                            </View>
                          )}
                        </View>
                      </ScrollView>

                      {/* Enhanced Confirm Button - Fixed at bottom */}
                      <View style={{
                        paddingTop: Platform.OS === 'android' ? 16 : 20,
                        paddingBottom: Platform.OS === 'android' ? 8 : 12,
                      }}>
                        <TouchableOpacity
                          onPress={handleReturnCalendarConfirm}
                          style={{
                            backgroundColor: '#FFD600',
                            borderRadius: Platform.OS === 'android' ? 12 : 16,
                            padding: Platform.OS === 'android' ? 14 : 18,
                            alignItems: 'center',
                            shadowColor: Platform.OS === 'android' ? 'transparent' : '#FFD600',
                            shadowOpacity: Platform.OS === 'android' ? 0 : 0.3,
                            shadowRadius: Platform.OS === 'android' ? 0 : 12,
                            shadowOffset: Platform.OS === 'android' ? { width: 0, height: 0 } : { width: 0, height: 4 },
                            elevation: Platform.OS === 'android' ? 4 : 12,
                            borderWidth: 1,
                            borderColor: 'rgba(0, 0, 0, 0.1)',
                          }}
                          activeOpacity={0.85}
                        >
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <MaterialIcons name="check" size={Platform.OS === 'android' ? 20 : 22} color="#1E293B" style={{ marginRight: 8 }} />
                            <Text style={{
                              color: '#1E293B',
                              fontWeight: '800',
                              fontSize: Platform.OS === 'android' ? 16 : 18,
                              letterSpacing: 0.5,
                            }}>
                              { t('confirmReturnDate') }
                            </Text>
                          </View>
                        </TouchableOpacity>
                      </View>
                    </View>
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

          {/* Enhanced Ultra Premium Loading Skeleton */}
          {loading && (
            <View style={{ paddingHorizontal: wp('2%') }}>
              {/* Enhanced Booking Section Skeleton */}
              <View style={{
                width: '100%',
                marginTop: hp('2%'),
                marginBottom: hp('2%'),
                backgroundColor: 'rgba(255,255,255,0.95)',
                borderRadius: wp('4%'),
                padding: wp('4%'),
                shadowColor: '#001233',
                shadowOpacity: 0.08,
                shadowRadius: wp('3%'),
                elevation: 8,
                borderWidth: wp('0.2%'),
                borderColor: 'rgba(0, 18, 51, 0.06)',
                overflow: 'hidden',
              }}>
                {/* Trip Type Buttons Skeleton */}
                <View style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginBottom: hp('2%'),
                  backgroundColor: 'rgba(248,250,252,0.8)',
                  borderRadius: wp('3%'),
                  padding: wp('0.8%'),
                }}>
                  <View style={{ width: '48%', height: hp('5%'), borderRadius: wp('2.5%'), backgroundColor: '#f0f0f0', overflow: 'hidden' }}>
                    <Animated.View style={{ width: wp('30%'), height: '100%', transform: [{ translateX: shimmerAnim }] }}>
                      <LinearGradient colors={['#f0f0f000', '#e0e0e0aa', '#f0f0f000']} start={[0, 0]} end={[1, 0]} style={{ width: '100%', height: '100%' }} />
                    </Animated.View>
                  </View>
                  <View style={{ width: '48%', height: hp('5%'), borderRadius: wp('2.5%'), backgroundColor: '#f0f0f0', overflow: 'hidden' }}>
                    <Animated.View style={{ width: wp('30%'), height: '100%', transform: [{ translateX: shimmerAnim }] }}>
                      <LinearGradient colors={['#f0f0f000', '#e0e0e0aa', '#f0f0f000']} start={[0, 0]} end={[1, 0]} style={{ width: '100%', height: '100%' }} />
                    </Animated.View>
                  </View>
                </View>

                {/* Passenger Selection Skeleton */}
                <View style={{
                  width: '100%',
                  height: hp('7%'),
                  borderRadius: wp('3%'),
                  backgroundColor: '#f0f0f0',
                  overflow: 'hidden',
                  marginBottom: hp('1.5%'),
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: wp('3%'),
                }}>
                  <View style={{
                    width: wp('8%'),
                    height: wp('8%'),
                    borderRadius: wp('4%'),
                    backgroundColor: '#e5e5e5',
                    marginRight: wp('3%')
                  }} />
                  <View style={{ flex: 1 }}>
                    <View style={{
                      width: '40%',
                      height: hp('1.5%'),
                      backgroundColor: '#e5e5e5',
                      borderRadius: hp('0.75%'),
                      marginBottom: hp('0.5%')
                    }} />
                    <View style={{
                      width: '60%',
                      height: hp('2%'),
                      backgroundColor: '#e0e0e0',
                      borderRadius: hp('1%')
                    }} />
                  </View>
                  <Animated.View style={{ width: wp('40%'), height: '100%', position: 'absolute', transform: [{ translateX: shimmerAnim }] }}>
                    <LinearGradient colors={['#f0f0f000', '#d0d0d0aa', '#f0f0f000']} start={[0, 0]} end={[1, 0]} style={{ width: '100%', height: '100%' }} />
                  </Animated.View>
                </View>

                {/* Location Selection Skeleton */}
                <View style={{
                  width: '100%',
                  height: hp('12%'),
                  borderRadius: wp('3%'),
                  backgroundColor: '#f0f0f0',
                  overflow: 'hidden',
                  marginBottom: hp('1.5%'),
                  padding: wp('3%'),
                }}>
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: hp('1%')
                  }}>
                    <View style={{
                      width: wp('8%'),
                      height: wp('8%'),
                      borderRadius: wp('4%'),
                      backgroundColor: '#e5e5e5',
                      marginRight: wp('3%')
                    }} />
                    <View style={{ flex: 1 }}>
                      <View style={{
                        width: '30%',
                        height: hp('1.5%'),
                        backgroundColor: '#e5e5e5',
                        borderRadius: hp('0.75%'),
                        marginBottom: hp('0.5%')
                      }} />
                      <View style={{
                        width: '50%',
                        height: hp('2%'),
                        backgroundColor: '#e0e0e0',
                        borderRadius: hp('1%')
                      }} />
                    </View>
                  </View>
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center'
                  }}>
                    <View style={{
                      width: wp('8%'),
                      height: wp('8%'),
                      borderRadius: wp('4%'),
                      backgroundColor: '#e5e5e5',
                      marginRight: wp('3%')
                    }} />
                    <View style={{ flex: 1 }}>
                      <View style={{
                        width: '30%',
                        height: hp('1.5%'),
                        backgroundColor: '#e5e5e5',
                        borderRadius: hp('0.75%'),
                        marginBottom: hp('0.5%')
                      }} />
                      <View style={{
                        width: '50%',
                        height: hp('2%'),
                        backgroundColor: '#e0e0e0',
                        borderRadius: hp('1%')
                      }} />
                    </View>
                  </View>
                  <Animated.View style={{ width: wp('50%'), height: '100%', position: 'absolute', transform: [{ translateX: shimmerAnim }] }}>
                    <LinearGradient colors={['#f0f0f000', '#d0d0d0aa', '#f0f0f000']} start={[0, 0]} end={[1, 0]} style={{ width: '100%', height: '100%' }} />
                  </Animated.View>
                </View>

                {/* Date Selection Skeleton */}
                <View style={{
                  width: '100%',
                  height: hp('7%'),
                  borderRadius: wp('3%'),
                  backgroundColor: '#f0f0f0',
                  overflow: 'hidden',
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: wp('3%'),
                }}>
                  <View style={{
                    width: wp('8%'),
                    height: wp('8%'),
                    borderRadius: wp('4%'),
                    backgroundColor: '#e5e5e5',
                    marginRight: wp('3%')
                  }} />
                  <View style={{ flex: 1 }}>
                    <View style={{
                      width: '40%',
                      height: hp('1.5%'),
                      backgroundColor: '#e5e5e5',
                      borderRadius: hp('0.75%'),
                      marginBottom: hp('0.5%')
                    }} />
                    <View style={{
                      width: '60%',
                      height: hp('2%'),
                      backgroundColor: '#e0e0e0',
                      borderRadius: hp('1%')
                    }} />
                  </View>
                  <Animated.View style={{ width: wp('40%'), height: '100%', position: 'absolute', transform: [{ translateX: shimmerAnim }] }}>
                    <LinearGradient colors={['#f0f0f000', '#d0d0d0aa', '#f0f0f000']} start={[0, 0]} end={[1, 0]} style={{ width: '100%', height: '100%' }} />
                  </Animated.View>
                </View>
              </View>

              {/* Enhanced Ferry Cards Skeleton */}
              {Array(3).fill(0).map((_, idx) => (
                <View key={idx} style={{
                  marginTop: hp('2%'),
                  minHeight: hp('20%'),
                  backgroundColor: 'rgba(255,255,255,0.95)',
                  borderRadius: wp('4%'),
                  overflow: 'hidden',
                  width: '100%',
                  borderWidth: wp('0.2%'),
                  borderColor: 'rgba(0,35,72,0.05)',
                  shadowColor: '#001233',
                  shadowOpacity: 0.08,
                  shadowRadius: wp('3%'),
                  elevation: 6,
                }}>
                  {/* Card Header Skeleton */}
                  <View style={{
                    backgroundColor: '#f0f0f0',
                    paddingVertical: hp('1.8%'),
                    paddingHorizontal: wp('4.5%'),
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    overflow: 'hidden',
                  }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <View style={{
                        width: wp('10.6%'),
                        height: hp('5%'),
                        borderRadius: wp('3%'),
                        backgroundColor: '#e5e5e5',
                        marginRight: wp('2.5%')
                      }} />
                      <View style={{
                        width: wp('25%'),
                        height: hp('2.5%'),
                        backgroundColor: '#e0e0e0',
                        borderRadius: hp('1.25%')
                      }} />
                    </View>
                    <View style={{ flexDirection: 'row', gap: wp('1.5%') }}>
                      <View style={{
                        width: wp('12%'),
                        height: hp('2.5%'),
                        backgroundColor: '#e0e0e0',
                        borderRadius: hp('1.25%')
                      }} />
                      <View style={{
                        width: wp('15%'),
                        height: hp('2.5%'),
                        backgroundColor: '#e0e0e0',
                        borderRadius: hp('1.25%')
                      }} />
                    </View>
                    <Animated.View style={{ width: wp('60%'), height: '100%', position: 'absolute', transform: [{ translateX: shimmerAnim }] }}>
                      <LinearGradient colors={['#f0f0f000', '#d5d5d5aa', '#f0f0f000']} start={[0, 0]} end={[1, 0]} style={{ width: '100%', height: '100%' }} />
                    </Animated.View>
                  </View>

                  {/* Card Body Skeleton */}
                  <View style={{ padding: wp('5.5%') }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: hp('2%') }}>
                      {/* From Location */}
                      <View style={{ flex: 1, alignItems: 'flex-start' }}>
                        <View style={{
                          width: wp('15%'),
                          height: hp('2%'),
                          backgroundColor: '#e5e5e5',
                          borderRadius: hp('1%'),
                          marginBottom: hp('0.5%')
                        }} />
                        <View style={{
                          width: wp('12%'),
                          height: hp('1.5%'),
                          backgroundColor: '#e0e0e0',
                          borderRadius: hp('0.75%'),
                          marginBottom: hp('0.5%')
                        }} />
                        <View style={{
                          width: wp('10%'),
                          height: hp('1.5%'),
                          backgroundColor: '#e0e0e0',
                          borderRadius: hp('0.75%')
                        }} />
                      </View>

                      {/* Middle Section */}
                      <View style={{ flex: 1, alignItems: 'center' }}>
                        <View style={{
                          width: wp('20%'),
                          height: hp('1.5%'),
                          backgroundColor: '#e5e5e5',
                          borderRadius: hp('0.75%'),
                          marginBottom: hp('1%')
                        }} />
                        <View style={{
                          width: wp('8%'),
                          height: wp('8%'),
                          borderRadius: wp('4%'),
                          backgroundColor: '#e0e0e0',
                          marginVertical: hp('0.5%')
                        }} />
                        <View style={{
                          width: wp('15%'),
                          height: hp('1.5%'),
                          backgroundColor: '#e5e5e5',
                          borderRadius: hp('0.75%')
                        }} />
                      </View>

                      {/* To Location */}
                      <View style={{ flex: 1, alignItems: 'flex-end' }}>
                        <View style={{
                          width: wp('15%'),
                          height: hp('2%'),
                          backgroundColor: '#e5e5e5',
                          borderRadius: hp('1%'),
                          marginBottom: hp('0.5%')
                        }} />
                        <View style={{
                          width: wp('12%'),
                          height: hp('1.5%'),
                          backgroundColor: '#e0e0e0',
                          borderRadius: hp('0.75%'),
                          marginBottom: hp('0.5%')
                        }} />
                        <View style={{
                          width: wp('10%'),
                          height: hp('1.5%'),
                          backgroundColor: '#e0e0e0',
                          borderRadius: hp('0.75%')
                        }} />
                      </View>
                    </View>

                    {/* Price and Book Button Skeleton */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <View>
                        <View style={{
                          width: wp('25%'),
                          height: hp('2.5%'),
                          backgroundColor: '#e5e5e5',
                          borderRadius: hp('1.25%')
                        }} />
                      </View>
                      <View style={{
                        width: wp('25%'),
                        height: hp('5%'),
                        backgroundColor: '#e0e0e0',
                        borderRadius: wp('4%')
                      }} />
                    </View>

                    {/* Shimmer Animation Overlay */}
                    <Animated.View style={{
                      width: wp('70%'),
                      height: '100%',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      transform: [{ translateX: shimmerAnim }]
                    }}>
                      <LinearGradient
                        colors={['#f5f5f500', '#e0e0e0aa', '#f5f5f500']}
                        start={[0, 0]}
                        end={[1, 0]}
                        style={{ width: '100%', height: '100%' }}
                      />
                    </Animated.View>
                  </View>
                </View>
              ))}
            </View>
          )}
          {!loading && pagedDataDepart && pagedDataDepart.length === 0 && (
            <View style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 360,
              width: '100%',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              borderRadius: 24,
              padding: 32,
              shadowColor: '#FD501E',
              shadowOpacity: 0.1,
              shadowRadius: 20,
              shadowOffset: { width: 0, height: 8 },
              elevation: 8,
              borderWidth: 1,
              borderColor: 'rgba(253, 80, 30, 0.08)',
              marginVertical: 20
            }}>
              <LottieView
                source={require('./assets/animations/ferry-animation.json')}
                autoPlay
                loop
                style={{
                  width: 240,
                  height: 240,
                }}
              />
              <Text style={{
                marginTop: 32,
                color: '#1E293B',
                fontWeight: '800',
                fontSize: 22,
                letterSpacing: -0.3,
                textAlign: 'center'
              }}>
                {t('searchingForFerries')}
              </Text>
              <Text style={{
                marginTop: 8,
                color: '#64748B',
                fontWeight: '500',
                fontSize: 16,
                letterSpacing: 0.2,
                textAlign: 'center'
              }}>
                {t('findingBestRoutes')}
              </Text>
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
                      {/* Modern Ferry Ticket Design */}
                      <View style={{
                        marginTop: 20,
                        backgroundColor: '#FFFFFF',
                        borderRadius: 20,
                        overflow: 'hidden',
                        shadowColor: '#001233',
                        shadowOpacity: 0.15,
                        shadowRadius: 20,
                        shadowOffset: { width: 0, height: 8 },
                        elevation: 15,
                        position: 'relative',
                      }}>
                        {/* Ticket Header with Company Info */}
                        <LinearGradient
                          colors={['#FD501E', '#E8461A']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={{
                            paddingHorizontal: Platform.OS === 'android' ? 18 : 20,
                            paddingVertical: Platform.OS === 'android' ? 18 : 16,
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Image
                              source={{ uri: `${item.md_timetable_companypic}` }}
                              style={{
                                width: 45,
                                height: 45,
                                borderRadius: 12,
                                backgroundColor: '#fff',
                                borderWidth: 2,
                                borderColor: 'rgba(255,255,255,0.3)',
                                marginRight: 12
                              }}
                              resizeMode="cover"
                            />
                            <View>
                              <Text style={{
                                color: '#FFFFFF',
                                fontWeight: 'bold',
                                fontSize: 16,
                                maxWidth: wp('35%'),
                                letterSpacing: -0.3,
                              }} numberOfLines={1}>
                                {item.md_timetable_companyname}
                              </Text>
                              <Text style={{
                                color: 'rgba(255,255,255,0.9)',
                                fontSize: 12,
                                fontWeight: '500',
                              }}>
                                Ferry Service
                              </Text>
                            </View>
                          </View>
                          <View style={{ alignItems: 'flex-end' }}>
                            <Text style={{
                              color: '#FFFFFF',
                              fontWeight: 'bold',
                              fontSize: 14,
                              backgroundColor: 'rgba(255,255,255,0.2)',
                              paddingHorizontal: 8,
                              paddingVertical: 4,
                              borderRadius: 8,
                              marginBottom: 4,
                            }}>
                              {item.md_timetable_seatid}
                            </Text>
                            <Text style={{
                              color: 'rgba(255,255,255,0.9)',
                              fontSize: 11,
                              fontWeight: '600',
                            }}>
                              {tripTypeSearch}
                            </Text>
                          </View>
                        </LinearGradient>

                        {/* Ticket Body */}
                        <View style={{ backgroundColor: '#FFFFFF', position: 'relative' }}>
                          {/* Decorative Perforated Border */}
                          <View style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: 1,
                            backgroundColor: '#E2E8F0',
                          }} />

                          {/* Main Journey Info */}
                          <View style={{
                            paddingHorizontal: Platform.OS === 'android' ? 22 : 20,
                            paddingVertical: Platform.OS === 'android' ? 22 : 20
                          }}>
                            <View style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              marginBottom: Platform.OS === 'android' ? 22 : 20,
                            }}>
                              {/* From Location */}
                              <View style={{ flex: 1, alignItems: 'flex-start' }}>
                                <Text style={{
                                  color: '#1E293B',
                                  fontSize: Platform.OS === 'android' ? 17 : 18,
                                  fontWeight: 'bold',
                                  marginBottom: Platform.OS === 'android' ? 6 : 4,
                                }}>
                                  {item.md_timetable_startid}
                                </Text>
                                <Text style={{
                                  color: '#64748B',
                                  fontSize: Platform.OS === 'android' ? 11 : 12,
                                  fontWeight: '500',
                                  marginBottom: Platform.OS === 'android' ? 10 : 8,
                                  lineHeight: Platform.OS === 'android' ? 16 : 14,
                                }}>
                                  {item.md_timetable_pierstart}
                                </Text>
                                <View style={{
                                  backgroundColor: '#FFF3ED',
                                  paddingHorizontal: Platform.OS === 'android' ? 14 : 12,
                                  paddingVertical: Platform.OS === 'android' ? 8 : 6,
                                  borderRadius: 12,
                                  borderWidth: 1,
                                  borderColor: '#FD501E',
                                }}>
                                  <Text style={{
                                    color: '#FD501E',
                                    fontSize: 16,
                                    fontWeight: 'bold',
                                  }}>
                                    {formatTime(item.md_timetable_departuretime)}
                                  </Text>
                                </View>
                                <Text style={{
                                  color: '#64748B',
                                  fontSize: Platform.OS === 'android' ? 10 : 11,
                                  fontWeight: '500',
                                  marginTop: Platform.OS === 'android' ? 6 : 4,
                                  lineHeight: Platform.OS === 'android' ? 14 : 12,
                                }}>
                                  {formatDate(calendarStartDate)}
                                </Text>
                              </View>

                              {/* Journey Info */}
                              <View style={{
                                flex: 1,
                                alignItems: 'center',
                                paddingHorizontal: Platform.OS === 'android' ? 12 : 10
                              }}>
                                <Text style={{
                                  color: '#64748B',
                                  fontSize: Platform.OS === 'android' ? 11 : 12,
                                  fontWeight: '600',
                                  marginBottom: Platform.OS === 'android' ? 10 : 8,
                                  textAlign: 'center',
                                }}>
                                  {item.md_timetable_boattypeid}
                                </Text>

                                {/* Journey Line with Boat Icon */}
                                <View style={{
                                  flexDirection: 'row',
                                  alignItems: 'center',
                                  marginBottom: 8,
                                }}>
                                  <View style={{
                                    width: 40,
                                    height: 2,
                                    backgroundColor: '#E2E8F0',
                                    borderRadius: 1,
                                  }} />
                                  <View style={{
                                    width: 30,
                                    height: 30,
                                    borderRadius: 15,
                                    backgroundColor: '#FFF3ED',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    marginHorizontal: 8,
                                    borderWidth: 2,
                                    borderColor: '#FD501E',
                                  }}>
                                    <Image
                                      source={require('./assets/boat.png')}
                                      style={{ width: 16, height: 16 }}
                                      resizeMode="contain"
                                    />
                                  </View>
                                  <View style={{
                                    width: 40,
                                    height: 2,
                                    backgroundColor: '#E2E8F0',
                                    borderRadius: 1,
                                  }} />
                                </View>

                                <Text style={{
                                  color: '#64748B',
                                  fontSize: 12,
                                  fontWeight: '600',
                                  marginBottom: 4,
                                }}>
                                  {item.md_timetable_time}
                                </Text>
                                <Text style={{
                                  color: '#FD501E',
                                  fontSize: 11,
                                  fontWeight: '600',
                                  backgroundColor: '#FFF3ED',
                                  paddingHorizontal: 8,
                                  paddingVertical: 2,
                                  borderRadius: 8,
                                }}>
                                  {item.md_timetable_count} booked
                                </Text>
                              </View>

                              {/* To Location */}
                              <View style={{ flex: 1, alignItems: 'flex-end' }}>
                                <Text style={{
                                  color: '#1E293B',
                                  fontSize: Platform.OS === 'android' ? 17 : 18,
                                  fontWeight: 'bold',
                                  marginBottom: Platform.OS === 'android' ? 6 : 4,
                                }}>
                                  {item.md_timetable_endid}
                                </Text>
                                <Text style={{
                                  color: '#64748B',
                                  fontSize: Platform.OS === 'android' ? 11 : 12,
                                  fontWeight: '500',
                                  marginBottom: Platform.OS === 'android' ? 10 : 8,
                                  lineHeight: Platform.OS === 'android' ? 16 : 14,
                                  textAlign: 'right',
                                }}>
                                  {item.md_timetable_pierend}
                                </Text>
                                <View style={{
                                  backgroundColor: '#F0FDF4',
                                  paddingHorizontal: Platform.OS === 'android' ? 14 : 12,
                                  paddingVertical: Platform.OS === 'android' ? 8 : 6,
                                  borderRadius: 12,
                                  borderWidth: 1,
                                  borderColor: '#16A34A',
                                }}>
                                  <Text style={{
                                    color: '#16A34A',
                                    fontSize: Platform.OS === 'android' ? 15 : 16,
                                    fontWeight: 'bold',
                                  }}>
                                    {formatTime(item.md_timetable_arrivaltime)}
                                  </Text>
                                </View>
                                <Text style={{
                                  color: '#64748B',
                                  fontSize: 11,
                                  fontWeight: '500',
                                  marginTop: 4,
                                }}>
                                  {formatDate(calendarStartDate)}
                                </Text>
                              </View>
                            </View>

                            {/* Divider */}
                            <View style={{
                              height: 1,
                              backgroundColor: '#E2E8F0',
                              marginVertical: Platform.OS === 'android' ? 18 : 16,
                            }} />

                            {/* Price and Booking Section */}
                            <View style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              paddingBottom: Platform.OS === 'android' ? 4 : 0,
                            }}>
                              <View style={{ flex: 1 }}>
                                <Text style={{
                                  color: '#64748B',
                                  fontSize: Platform.OS === 'android' ? 12 : 13,
                                  fontWeight: '500',
                                  marginBottom: Platform.OS === 'android' ? 6 : 4,
                                }}>
                                  Price per person
                                </Text>
                                <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                                  <Text style={{
                                    color: '#1E293B',
                                    fontSize: Platform.OS === 'android' ? 13 : 14,
                                    fontWeight: '600',
                                    marginRight: 4,
                                  }}>
                                    {selectedCurrency}
                                  </Text>
                                  <Text style={{
                                    color: '#1E293B',
                                    fontSize: Platform.OS === 'android' ? 22 : 24,
                                    fontWeight: 'bold',
                                  }}>
                                    {formatNumberWithComma(parseFloat((parseFloat(item.md_timetable_priceadult.replace(/,/g, "")) - parseFloat(item.md_timetable_discount_adult.replace(/,/g, ""))).toFixed(2)))}
                                  </Text>
                                </View>
                                {item.md_timetable_discount > 0 && (
                                  <View style={{
                                    backgroundColor: '#FEF3C7',
                                    paddingHorizontal: 8,
                                    paddingVertical: 2,
                                    borderRadius: 6,
                                    alignSelf: 'flex-start',
                                    marginTop: 4,
                                  }}>
                                    <Text style={{
                                      color: '#D97706',
                                      fontSize: 11,
                                      fontWeight: 'bold',
                                    }}>
                                      {item.md_timetable_discount}% OFF
                                    </Text>
                                  </View>
                                )}
                              </View>

                              <TouchableOpacity
                                style={{
                                  backgroundColor: '#FD501E',
                                  paddingHorizontal: Platform.OS === 'android' ? 20 : 24,
                                  paddingVertical: Platform.OS === 'android' ? 12 : 14,
                                  borderRadius: Platform.OS === 'android' ? 14 : 16,
                                  shadowColor: Platform.OS === 'android' ? 'transparent' : '#FD501E',
                                  shadowOpacity: Platform.OS === 'android' ? 0 : 0.3,
                                  shadowRadius: Platform.OS === 'android' ? 0 : 8,
                                  shadowOffset: Platform.OS === 'android' ? { width: 0, height: 0 } : { width: 0, height: 4 },
                                  elevation: Platform.OS === 'android' ? 6 : 8,
                                  minWidth: Platform.OS === 'android' ? 110 : 120,
                                }}
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
                                    // booking information
                                    md_booking_companyid: item.md_timetable_companyid,
                                    md_booking_boattypeid: item.md_timetable_boattypeid,
                                    md_booking_round: 1,
                                    md_booking_timetableid: item.md_timetable_id,
                                    md_booking_adult: adults,
                                    md_booking_child: children,
                                    md_booking_infant: infant,
                                    md_booking_departdate: calendarStartDate,
                                    md_booking_departtime: item.md_timetable_departuretime,
                                    md_booking_remark : item.md_timetable_remark.en || '',
                                  });
                                  navigation.navigate('TripDetail');
                                }}
                              >
                                <Text style={{
                                  color: '#FFFFFF',
                                  fontSize: Platform.OS === 'android' ? 15 : 16,
                                  fontWeight: 'bold',
                                  letterSpacing: 0.5,
                                  textAlign: 'center',
                                }}>
                                  {t('bookNow')}
                                </Text>
                              </TouchableOpacity>
                            </View>

                            {/* Remark Section */}
                            {item.md_timetable_remark.en && (
                              <View style={{
                                backgroundColor: '#F8FAFC',
                                padding: 12,
                                borderRadius: 12,
                                marginTop: 16,
                                borderLeftWidth: 4,
                                borderLeftColor: '#FD501E',
                              }}>
                                <Text style={{
                                  color: '#64748B',
                                  fontSize: 12,
                                  fontWeight: '500',
                                  lineHeight: 16,
                                }}>
                                  <Text style={{ fontWeight: 'bold', color: '#FD501E' }}>Note: </Text>
                                  {item.md_timetable_remark.en}
                                </Text>
                              </View>
                            )}
                          </View>

                          {/* Hidden measure view for animation - Updated */}
                          <View
                            style={{ position: 'absolute', opacity: 0, left: 0, top: 0, right: 0, zIndex: -1 }}
                            onLayout={(e) => {
                              const h = e.nativeEvent.layout.height;
                              if (contentHeights[item.md_timetable_id] !== h) {
                                setContentHeights(prev => ({ ...prev, [item.md_timetable_id]: h }));
                              }
                            }}
                          >
                            <View style={{ padding: 20 }}>
                              <Text style={{
                                color: '#FD501E',
                                fontWeight: 'bold',
                                fontSize: 16,
                                marginBottom: 12,
                              }}>
                                Trip Details
                              </Text>
                              <Text style={{
                                color: '#64748B',
                                fontSize: 14,
                                lineHeight: 20,
                                marginBottom: 16,
                              }}>
                                {removeHtmlTags(item.md_timetable_tripdetail[0]?.md_timetabledetail_detaileng1 || "Detailed information about this ferry trip.")}
                              </Text>
                              {item.md_timetable_tripdetail[0]?.md_timetabledetail_picname1 && (
                                <View style={{
                                  width: '100%',
                                  height: 200,
                                  backgroundColor: '#F1F5F9',
                                  borderRadius: 16,
                                  marginBottom: 10,
                                }} />
                              )}
                            </View>
                          </View>
                        </View>

                        {/* Expandable Detail Section - Updated */}
                        <Animated.View
                          style={{
                            maxHeight: selectedPickup === item.md_timetable_id ? getAnimatedHeight(item.md_timetable_id) : 0,
                            overflow: 'hidden',
                            backgroundColor: '#F8FAFC',
                            borderBottomLeftRadius: 20,
                            borderBottomRightRadius: 20,
                          }}
                        >
                          <View style={{ padding: 20 }}>
                            <Text style={{
                              color: '#FD501E',
                              fontWeight: 'bold',
                              fontSize: 16,
                              marginBottom: 12,
                            }}>
                              Trip Details
                            </Text>
                            <Text style={{
                              color: '#64748B',
                              fontSize: 14,
                              lineHeight: 20,
                              marginBottom: 16,
                            }}>
                              {removeHtmlTags(item.md_timetable_tripdetail[0]?.md_timetabledetail_detaileng1 || "Detailed information about this ferry trip.")}
                            </Text>

                            {/* Ferry Image with Error Handling */}
                            {item.md_timetable_tripdetail[0]?.md_timetabledetail_picname1 ? (
                              <View style={{
                                borderRadius: 16,
                                overflow: 'hidden',
                                backgroundColor: '#F1F5F9',
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.1,
                                shadowRadius: 4,
                                elevation: 3,
                              }}>
                                <Image
                                  source={{
                                    uri: `https://www.thetrago.com/Api/uploads/timetabledetail/${item.md_timetable_tripdetail[0].md_timetabledetail_picname1}`,
                                    cache: 'force-cache'
                                  }}
                                  style={{
                                    width: '100%',
                                    height: 200,
                                    resizeMode: 'cover'
                                  }}
                                  onError={(error) => {
                                    console.log('Image loading error:', error);
                                  }}
                                  onLoad={() => {
                                    console.log('Image loaded successfully');
                                  }}
                                />
                              </View>
                            ) : (
                              <View style={{
                                width: '100%',
                                height: 200,
                                backgroundColor: '#F1F5F9',
                                borderRadius: 16,
                                justifyContent: 'center',
                                alignItems: 'center',
                                borderWidth: 2,
                                borderColor: '#E2E8F0',
                                borderStyle: 'dashed',
                              }}>
                                <Icon name="image-outline" size={48} color="#94A3B8" />
                                <Text style={{
                                  color: '#94A3B8',
                                  fontSize: 14,
                                  fontWeight: '500',
                                  marginTop: 8,
                                }}>
                                  No image available
                                </Text>
                              </View>
                            )}

                          </View>
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
                        { t('departTrip') }
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
                        { t('returnTrip') }
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
                        {/* Modern Ferry Ticket Design - Depart Trip */}
                        <View style={{
                          marginTop: 20,
                          backgroundColor: '#FFFFFF',
                          borderRadius: 20,
                          overflow: 'hidden',
                          shadowColor: '#001233',
                          shadowOpacity: 0.15,
                          shadowRadius: 20,
                          shadowOffset: { width: 0, height: 8 },
                          elevation: 15,
                          position: 'relative',
                        }}>
                          {/* Ticket Header with Company Info */}
                          <LinearGradient
                            colors={['#FD501E', '#E8461A']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={{
                              paddingHorizontal: 20,
                              paddingVertical: 16,
                              flexDirection: 'row',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                            }}
                          >
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                              <Image
                                source={{ uri: `${item.md_timetable_companypic}` }}
                                style={{
                                  width: 45,
                                  height: 45,
                                  borderRadius: 12,
                                  backgroundColor: '#fff',
                                  borderWidth: 2,
                                  borderColor: 'rgba(255,255,255,0.3)',
                                  marginRight: 12
                                }}
                                resizeMode="cover"
                              />
                              <View>
                                <Text style={{
                                  color: '#FFFFFF',
                                  fontWeight: 'bold',
                                  fontSize: 16,
                                  maxWidth: wp('35%'),
                                  letterSpacing: -0.3,
                                }} numberOfLines={1}>
                                  {item.md_timetable_companyname}
                                </Text>
                                <Text style={{
                                  color: 'rgba(255,255,255,0.9)',
                                  fontSize: 12,
                                  fontWeight: '500',
                                }}>
                                  Ferry Service
                                </Text>
                              </View>
                            </View>
                            <View style={{ alignItems: 'flex-end' }}>
                              <Text style={{
                                color: '#FFFFFF',
                                fontWeight: 'bold',
                                fontSize: 14,
                                backgroundColor: 'rgba(255,255,255,0.2)',
                                paddingHorizontal: 8,
                                paddingVertical: 4,
                                borderRadius: 8,
                                marginBottom: 4,
                              }}>
                                {item.md_timetable_seatid}
                              </Text>
                              <Text style={{
                                color: 'rgba(255,255,255,0.9)',
                                fontSize: 11,
                                fontWeight: '600',
                              }}>
                                {tripTypeSearch}
                              </Text>
                            </View>
                          </LinearGradient>

                          {/* Ticket Body */}
                          <View style={{ backgroundColor: '#FFFFFF', position: 'relative' }}>
                            {/* Decorative Perforated Border */}
                            <View style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              height: 1,
                              backgroundColor: '#E2E8F0',
                            }} />

                            {/* Main Journey Info */}
                            <View style={{ paddingHorizontal: 20, paddingVertical: 20 }}>
                              <View style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                marginBottom: 20,
                              }}>
                                {/* From Location */}
                                <View style={{ flex: 1, alignItems: 'flex-start' }}>
                                  <Text style={{
                                    color: '#1E293B',
                                    fontSize: 18,
                                    fontWeight: 'bold',
                                    marginBottom: 4,
                                  }}>
                                    {item.md_timetable_startid}
                                  </Text>
                                  <Text style={{
                                    color: '#64748B',
                                    fontSize: 12,
                                    fontWeight: '500',
                                    marginBottom: 8,
                                  }}>
                                    {item.md_timetable_pierstart}
                                  </Text>
                                  <View style={{
                                    backgroundColor: '#FFF3ED',
                                    paddingHorizontal: 12,
                                    paddingVertical: 6,
                                    borderRadius: 12,
                                    borderWidth: 1,
                                    borderColor: '#FD501E',
                                  }}>
                                    <Text style={{
                                      color: '#FD501E',
                                      fontSize: 16,
                                      fontWeight: 'bold',
                                    }}>
                                      {formatTime(item.md_timetable_departuretime)}
                                    </Text>
                                  </View>
                                  <Text style={{
                                    color: '#64748B',
                                    fontSize: 11,
                                    fontWeight: '500',
                                    marginTop: 4,
                                  }}>
                                    {formatDate(calendarStartDate)}
                                  </Text>
                                </View>

                                {/* Journey Info */}
                                <View style={{ flex: 1, alignItems: 'center', paddingHorizontal: 10 }}>
                                  <Text style={{
                                    color: '#64748B',
                                    fontSize: 12,
                                    fontWeight: '600',
                                    marginBottom: 8,
                                  }}>
                                    {item.md_timetable_boattypeid}
                                  </Text>

                                  {/* Journey Line with Boat Icon */}
                                  <View style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    marginBottom: 8,
                                  }}>
                                    <View style={{
                                      width: 40,
                                      height: 2,
                                      backgroundColor: '#E2E8F0',
                                      borderRadius: 1,
                                    }} />
                                    <View style={{
                                      width: 30,
                                      height: 30,
                                      borderRadius: 15,
                                      backgroundColor: '#FFF3ED',
                                      justifyContent: 'center',
                                      alignItems: 'center',
                                      marginHorizontal: 8,
                                      borderWidth: 2,
                                      borderColor: '#FD501E',
                                    }}>
                                      <Image
                                        source={require('./assets/boat.png')}
                                        style={{ width: 16, height: 16 }}
                                        resizeMode="contain"
                                      />
                                    </View>
                                    <View style={{
                                      width: 40,
                                      height: 2,
                                      backgroundColor: '#E2E8F0',
                                      borderRadius: 1,
                                    }} />
                                  </View>

                                  <Text style={{
                                    color: '#64748B',
                                    fontSize: 12,
                                    fontWeight: '600',
                                    marginBottom: 4,
                                  }}>
                                    {item.md_timetable_time}
                                  </Text>
                                  <Text style={{
                                    color: '#FD501E',
                                    fontSize: 11,
                                    fontWeight: '600',
                                    backgroundColor: '#FFF3ED',
                                    paddingHorizontal: 8,
                                    paddingVertical: 2,
                                    borderRadius: 8,
                                  }}>
                                    {item.md_timetable_count} booked
                                  </Text>
                                </View>

                                {/* To Location */}
                                <View style={{ flex: 1, alignItems: 'flex-end' }}>
                                  <Text style={{
                                    color: '#1E293B',
                                    fontSize: 18,
                                    fontWeight: 'bold',
                                    marginBottom: 4,
                                  }}>
                                    {item.md_timetable_endid}
                                  </Text>
                                  <Text style={{
                                    color: '#64748B',
                                    fontSize: 12,
                                    fontWeight: '500',
                                    marginBottom: 8,
                                  }}>
                                    {item.md_timetable_pierend}
                                  </Text>
                                  <View style={{
                                    backgroundColor: '#F0FDF4',
                                    paddingHorizontal: 12,
                                    paddingVertical: 6,
                                    borderRadius: 12,
                                    borderWidth: 1,
                                    borderColor: '#16A34A',
                                  }}>
                                    <Text style={{
                                      color: '#16A34A',
                                      fontSize: 16,
                                      fontWeight: 'bold',
                                    }}>
                                      {formatTime(item.md_timetable_arrivaltime)}
                                    </Text>
                                  </View>
                                  <Text style={{
                                    color: '#64748B',
                                    fontSize: 11,
                                    fontWeight: '500',
                                    marginTop: 4,
                                  }}>
                                    {formatDate(calendarStartDate)}
                                  </Text>
                                </View>
                              </View>

                              {/* Divider */}
                              <View style={{
                                height: 1,
                                backgroundColor: '#E2E8F0',
                                marginVertical: 16,
                              }} />

                              {/* Price and Booking Section */}
                              <View style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                              }}>
                                <View style={{ flex: 1 }}>
                                  <Text style={{
                                    color: '#64748B',
                                    fontSize: 13,
                                    fontWeight: '500',
                                    marginBottom: 4,
                                  }}>
                                    Price per person
                                  </Text>
                                  <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                                    <Text style={{
                                      color: '#1E293B',
                                      fontSize: 14,
                                      fontWeight: '600',
                                      marginRight: 4,
                                    }}>
                                      {selectedCurrency}
                                    </Text>
                                    <Text style={{
                                      color: '#1E293B',
                                      fontSize: 24,
                                      fontWeight: 'bold',
                                    }}>
                                      {formatNumberWithComma(parseFloat((parseFloat(item.md_timetable_priceadult.replace(/,/g, "")) - parseFloat(item.md_timetable_discount_adult.replace(/,/g, ""))).toFixed(2)))}
                                    </Text>
                                  </View>
                                  {item.md_timetable_discount > 0 && (
                                    <View style={{
                                      backgroundColor: '#FEF3C7',
                                      paddingHorizontal: 8,
                                      paddingVertical: 2,
                                      borderRadius: 6,
                                      alignSelf: 'flex-start',
                                      marginTop: 4,
                                    }}>
                                      <Text style={{
                                        color: '#D97706',
                                        fontSize: 11,
                                        fontWeight: 'bold',
                                      }}>
                                        {item.md_timetable_discount}% OFF
                                      </Text>
                                    </View>
                                  )}
                                </View>

                                <TouchableOpacity
                                  style={{
                                    backgroundColor: '#FD501E',
                                    paddingHorizontal: 24,
                                    paddingVertical: 14,
                                    borderRadius: 16,
                                    shadowColor: '#FD501E',
                                    shadowOpacity: 0.3,
                                    shadowRadius: 8,
                                    shadowOffset: { width: 0, height: 4 },
                                    elevation: 8,
                                  }}
                                  onPress={() => {
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
                                      // booking information
                                      md_booking_companyid: item.md_timetable_companyid,
                                      md_booking_boattypeid: item.md_timetable_boattypeid,
                                      md_booking_round: 2,
                                      md_booking_timetableid: item.md_timetable_id,
                                      md_booking_adult: adults,
                                      md_booking_child: children,
                                      md_booking_infant: infant,
                                      md_booking_departdate: calendarStartDate,
                                      md_booking_departtime: item.md_timetable_departuretime,
                                      md_booking_remark : item.md_timetable_remark.en || '',

                                    });

                                    if (isroudstatus) {
                                      navigation.navigate('TripDetail');
                                    } else {
                                      settripTypeSearchResult("Return Trip");
                                    }
                                  }}
                                >
                                  <Text style={{
                                    color: '#FFFFFF',
                                    fontSize: 16,
                                    fontWeight: 'bold',
                                    letterSpacing: 0.5,
                                  }}>
                                    {t('bookNow')}
                                  </Text>
                                </TouchableOpacity>
                              </View>

                              {/* Remark Section */}
                              {item.md_timetable_remark.en && (
                                <View style={{
                                  backgroundColor: '#F8FAFC',
                                  padding: 12,
                                  borderRadius: 12,
                                  marginTop: 16,
                                  borderLeftWidth: 4,
                                  borderLeftColor: '#FD501E',
                                }}>
                                  <Text style={{
                                    color: '#64748B',
                                    fontSize: 12,
                                    fontWeight: '500',
                                    lineHeight: 16,
                                  }}>
                                    <Text style={{ fontWeight: 'bold', color: '#FD501E' }}>Note: </Text>
                                    {item.md_timetable_remark.en}
                                  </Text>
                                </View>
                              )}
                            </View>

                            {/* Hidden measure view for animation - Round Trip Depart */}
                            <View
                              style={{ position: 'absolute', opacity: 0, left: 0, top: 0, right: 0, zIndex: -1 }}
                              onLayout={(e) => {
                                const h = e.nativeEvent.layout.height;
                                if (contentHeights[item.md_timetable_id] !== h) {
                                  setContentHeights(prev => ({ ...prev, [item.md_timetable_id]: h }));
                                }
                              }}
                            >
                              <View style={{ padding: 20 }}>
                                <Text style={{
                                  color: '#FD501E',
                                  fontWeight: 'bold',
                                  fontSize: 16,
                                  marginBottom: 12,
                                }}>
                                  Trip Details
                                </Text>
                                <Text style={{
                                  color: '#64748B',
                                  fontSize: 14,
                                  lineHeight: 20,
                                  marginBottom: 16,
                                }}>
                                  {removeHtmlTags(item.md_timetable_tripdetail[0]?.md_timetabledetail_detaileng1 || "Detailed information about this ferry trip.")}
                                </Text>
                                {item.md_timetable_tripdetail[0]?.md_timetabledetail_picname1 && (
                                  <View style={{
                                    width: '100%',
                                    height: 200,
                                    backgroundColor: '#F1F5F9',
                                    borderRadius: 16,
                                    marginBottom: 10,
                                  }} />
                                )}
                              </View>
                            </View>
                          </View>

                          {/* Expandable Detail Section - Round Trip Depart */}
                          <Animated.View
                            style={{
                              maxHeight: selectedPickup === item.md_timetable_id ? getAnimatedHeight(item.md_timetable_id) : 0,
                              overflow: 'hidden',
                              backgroundColor: '#F8FAFC',
                              borderBottomLeftRadius: 20,
                              borderBottomRightRadius: 20,
                            }}
                          >
                            <View style={{ padding: 20 }}>
                              <Text style={{
                                color: '#FD501E',
                                fontWeight: 'bold',
                                fontSize: 16,
                                marginBottom: 12,
                              }}>
                                Trip Details
                              </Text>
                              <Text style={{
                                color: '#64748B',
                                fontSize: 14,
                                lineHeight: 20,
                                marginBottom: 16,
                              }}>
                                {removeHtmlTags(item.md_timetable_tripdetail[0]?.md_timetabledetail_detaileng1 || "Detailed information about this ferry trip.")}
                              </Text>

                              {/* Ferry Image with Error Handling */}
                              {item.md_timetable_tripdetail[0]?.md_timetabledetail_picname1 ? (
                                <View style={{
                                  borderRadius: 16,
                                  overflow: 'hidden',
                                  backgroundColor: '#F1F5F9',
                                  shadowColor: '#000',
                                  shadowOffset: { width: 0, height: 2 },
                                  shadowOpacity: 0.1,
                                  shadowRadius: 4,
                                  elevation: 3,
                                }}>
                                  <Image
                                    source={{
                                      uri: `https://www.thetrago.com/Api/uploads/timetabledetail/${item.md_timetable_tripdetail[0].md_timetabledetail_picname1}`,
                                      cache: 'force-cache'
                                    }}
                                    style={{
                                      width: '100%',
                                      height: 200,
                                      resizeMode: 'cover'
                                    }}
                                    onError={(error) => {
                                      console.log('Image loading error:', error);
                                    }}
                                  />
                                </View>
                              ) : (
                                <View style={{
                                  width: '100%',
                                  height: 200,
                                  backgroundColor: '#F1F5F9',
                                  borderRadius: 16,
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                  borderWidth: 2,
                                  borderColor: '#E2E8F0',
                                  borderStyle: 'dashed',
                                }}>
                                  <Icon name="image-outline" size={48} color="#94A3B8" />
                                  <Text style={{
                                    color: '#94A3B8',
                                    fontSize: 14,
                                    fontWeight: '500',
                                    marginTop: 8,
                                  }}>
                                    No image available
                                  </Text>
                                </View>
                              )}


                            </View>
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
                        {/* Modern Ferry Ticket Design - Return Trip */}
                        <View style={{
                          marginTop: 20,
                          backgroundColor: '#FFFFFF',
                          borderRadius: 20,
                          overflow: 'hidden',
                          shadowColor: '#B8860B',
                          shadowOpacity: 0.15,
                          shadowRadius: 20,
                          shadowOffset: { width: 0, height: 8 },
                          elevation: 15,
                          position: 'relative',
                          borderWidth: 2,
                          borderColor: 'rgba(255, 214, 0, 0.2)',
                        }}>
                          {/* Ticket Header with Company Info - Return Trip Style */}
                          <LinearGradient
                            colors={['#FFD600', '#B8860B']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={{
                              paddingHorizontal: Platform.OS === 'android' ? 20 : 22,
                              paddingVertical: Platform.OS === 'android' ? 18 : 16,
                              flexDirection: 'row',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              marginHorizontal: -2,
                              marginTop: -2,
                              borderTopLeftRadius: 20,
                              borderTopRightRadius: 20,
                            }}
                          >
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                              <Image
                                source={{ uri: `${item.md_timetable_companypic}` }}
                                style={{
                                  width: 45,
                                  height: 45,
                                  borderRadius: 12,
                                  backgroundColor: '#fff',
                                  borderWidth: 2,
                                  borderColor: 'rgba(255,255,255,0.3)',
                                  marginRight: 12
                                }}
                                resizeMode="cover"
                              />
                              <View>
                                <Text style={{
                                  color: '#1E293B',
                                  fontWeight: 'bold',
                                  fontSize: 16,
                                  maxWidth: wp('35%'),
                                  letterSpacing: -0.3,
                                }} numberOfLines={1}>
                                  {item.md_timetable_companyname}
                                </Text>
                                <Text style={{
                                  color: 'rgba(30, 41, 59, 0.8)',
                                  fontSize: 12,
                                  fontWeight: '500',
                                }}>
                                  Return Ferry
                                </Text>
                              </View>
                            </View>
                            <View style={{ alignItems: 'flex-end' }}>
                              <Text style={{
                                color: '#1E293B',
                                fontWeight: 'bold',
                                fontSize: 14,
                                backgroundColor: 'rgba(255,255,255,0.9)',
                                paddingHorizontal: 8,
                                paddingVertical: 4,
                                borderRadius: 8,
                                marginBottom: 4,
                              }}>
                                {item.md_timetable_seatid}
                              </Text>
                              <Text style={{
                                color: 'rgba(30, 41, 59, 0.8)',
                                fontSize: 11,
                                fontWeight: '600',
                              }}>
                                {tripTypeSearch}
                              </Text>
                            </View>
                          </LinearGradient>

                          {/* Ticket Body */}
                          <View style={{ backgroundColor: '#FFFFFF', position: 'relative' }}>
                            {/* Decorative Perforated Border */}
                            <View style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              height: 1,
                              backgroundColor: 'rgba(255, 214, 0, 0.3)',
                            }} />

                            {/* Main Journey Info */}
                            <View style={{
                              paddingHorizontal: Platform.OS === 'android' ? 22 : 20,
                              paddingVertical: Platform.OS === 'android' ? 22 : 20
                            }}>
                              <View style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                marginBottom: Platform.OS === 'android' ? 22 : 20,
                              }}>
                                {/* From Location */}
                                <View style={{ flex: 1, alignItems: 'flex-start' }}>
                                  <Text style={{
                                    color: '#1E293B',
                                    fontSize: Platform.OS === 'android' ? 17 : 18,
                                    fontWeight: 'bold',
                                    marginBottom: Platform.OS === 'android' ? 6 : 4,
                                  }}>
                                    {item.md_timetable_startid}
                                  </Text>
                                  <Text style={{
                                    color: '#64748B',
                                    fontSize: Platform.OS === 'android' ? 11 : 12,
                                    fontWeight: '500',
                                    marginBottom: Platform.OS === 'android' ? 10 : 8,
                                    lineHeight: Platform.OS === 'android' ? 16 : 14,
                                  }}>
                                    {item.md_timetable_pierstart}
                                  </Text>
                                  <View style={{
                                    backgroundColor: '#FEF3C7',
                                    paddingHorizontal: Platform.OS === 'android' ? 14 : 12,
                                    paddingVertical: Platform.OS === 'android' ? 8 : 6,
                                    borderRadius: 12,
                                    borderWidth: 1,
                                    borderColor: '#D97706',
                                  }}>
                                    <Text style={{
                                      color: '#D97706',
                                      fontSize: Platform.OS === 'android' ? 15 : 16,
                                      fontWeight: 'bold',
                                    }}>
                                      {formatTime(item.md_timetable_departuretime)}
                                    </Text>
                                  </View>
                                  <Text style={{
                                    color: '#64748B',
                                    fontSize: 11,
                                    fontWeight: '500',
                                    marginTop: 4,
                                  }}>
                                    {formatDate(calendarStartDate)}
                                  </Text>
                                </View>

                                {/* Journey Info */}
                                <View style={{ flex: 1, alignItems: 'center', paddingHorizontal: 10 }}>
                                  <Text style={{
                                    color: '#64748B',
                                    fontSize: 12,
                                    fontWeight: '600',
                                    marginBottom: 8,
                                  }}>
                                    {item.md_timetable_boattypeid}
                                  </Text>

                                  {/* Journey Line with Boat Icon */}
                                  <View style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    marginBottom: 8,
                                  }}>
                                    <View style={{
                                      width: 40,
                                      height: 2,
                                      backgroundColor: '#FDE68A',
                                      borderRadius: 1,
                                    }} />
                                    <View style={{
                                      width: 30,
                                      height: 30,
                                      borderRadius: 15,
                                      backgroundColor: '#FEF3C7',
                                      justifyContent: 'center',
                                      alignItems: 'center',
                                      marginHorizontal: 8,
                                      borderWidth: 2,
                                      borderColor: '#D97706',
                                    }}>
                                      <Image
                                        source={require('./assets/boat.png')}
                                        style={{ width: 16, height: 16 }}
                                        resizeMode="contain"
                                      />
                                    </View>
                                    <View style={{
                                      width: 40,
                                      height: 2,
                                      backgroundColor: '#FDE68A',
                                      borderRadius: 1,
                                    }} />
                                  </View>

                                  <Text style={{
                                    color: '#64748B',
                                    fontSize: 12,
                                    fontWeight: '600',
                                    marginBottom: 4,
                                  }}>
                                    {item.md_timetable_time}
                                  </Text>
                                  <Text style={{
                                    color: '#D97706',
                                    fontSize: 11,
                                    fontWeight: '600',
                                    backgroundColor: '#FEF3C7',
                                    paddingHorizontal: 8,
                                    paddingVertical: 2,
                                    borderRadius: 8,
                                  }}>
                                    {item.md_timetable_count} booked
                                  </Text>
                                </View>

                                {/* To Location */}
                                <View style={{ flex: 1, alignItems: 'flex-end' }}>
                                  <Text style={{
                                    color: '#1E293B',
                                    fontSize: 18,
                                    fontWeight: 'bold',
                                    marginBottom: 4,
                                  }}>
                                    {item.md_timetable_endid}
                                  </Text>
                                  <Text style={{
                                    color: '#64748B',
                                    fontSize: 12,
                                    fontWeight: '500',
                                    marginBottom: 8,
                                  }}>
                                    {item.md_timetable_pierend}
                                  </Text>
                                  <View style={{
                                    backgroundColor: '#F0FDF4',
                                    paddingHorizontal: 12,
                                    paddingVertical: 6,
                                    borderRadius: 12,
                                    borderWidth: 1,
                                    borderColor: '#16A34A',
                                  }}>
                                    <Text style={{
                                      color: '#16A34A',
                                      fontSize: 16,
                                      fontWeight: 'bold',
                                    }}>
                                      {formatTime(item.md_timetable_arrivaltime)}
                                    </Text>
                                  </View>
                                  <Text style={{
                                    color: '#64748B',
                                    fontSize: 11,
                                    fontWeight: '500',
                                    marginTop: 4,
                                  }}>
                                    {formatDate(calendarStartDate)}
                                  </Text>
                                </View>
                              </View>

                              {/* Divider */}
                              <View style={{
                                height: 1,
                                backgroundColor: 'rgba(255, 214, 0, 0.3)',
                                marginVertical: 16,
                              }} />

                              {/* Price and Booking Section */}
                              <View style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                              }}>
                                <View style={{ flex: 1 }}>
                                  <Text style={{
                                    color: '#64748B',
                                    fontSize: 13,
                                    fontWeight: '500',
                                    marginBottom: 4,
                                  }}>
                                    Price per person
                                  </Text>
                                  <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                                    <Text style={{
                                      color: '#1E293B',
                                      fontSize: 14,
                                      fontWeight: '600',
                                      marginRight: 4,
                                    }}>
                                      {selectedCurrency}
                                    </Text>
                                    <Text style={{
                                      color: '#1E293B',
                                      fontSize: 24,
                                      fontWeight: 'bold',
                                    }}>
                                      {formatNumberWithComma(parseFloat((parseFloat(item.md_timetable_priceadult.replace(/,/g, "")) - parseFloat(item.md_timetable_discount_adult.replace(/,/g, ""))).toFixed(2)))}
                                    </Text>
                                  </View>
                                  {item.md_timetable_discount > 0 && (
                                    <View style={{
                                      backgroundColor: '#FEF3C7',
                                      paddingHorizontal: 8,
                                      paddingVertical: 2,
                                      borderRadius: 6,
                                      alignSelf: 'flex-start',
                                      marginTop: 4,
                                    }}>
                                      <Text style={{
                                        color: '#D97706',
                                        fontSize: 11,
                                        fontWeight: 'bold',
                                      }}>
                                        {item.md_timetable_discount}% OFF
                                      </Text>
                                    </View>
                                  )}
                                </View>

                                <TouchableOpacity
                                  style={{
                                    backgroundColor: '#FFD600',
                                    paddingHorizontal: 24,
                                    paddingVertical: 14,
                                    borderRadius: 16,
                                    shadowColor: '#B8860B',
                                    shadowOpacity: 0.3,
                                    shadowRadius: 8,
                                    shadowOffset: { width: 0, height: 4 },
                                    elevation: 8,
                                    borderWidth: 1,
                                    borderColor: 'rgba(184, 134, 11, 0.2)',
                                  }}
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

                                    if (isonewaystatus) {
                                      navigation.navigate('TripDetail');
                                    } else {
                                      settripTypeSearchResult("Depart Trip");
                                    }
                                  }}
                                >
                                  <Text style={{
                                    color: '#1E293B',
                                    fontSize: 16,
                                    fontWeight: 'bold',
                                    letterSpacing: 0.5,
                                  }}>
                                    Book Now
                                  </Text>
                                </TouchableOpacity>
                              </View>

                              {/* Remark Section */}
                              {item.md_timetable_remark.en && (
                                <View style={{
                                  backgroundColor: '#FFFBEB',
                                  padding: 12,
                                  borderRadius: 12,
                                  marginTop: 16,
                                  borderLeftWidth: 4,
                                  borderLeftColor: '#D97706',
                                }}>
                                  <Text style={{
                                    color: '#92400E',
                                    fontSize: 12,
                                    fontWeight: '500',
                                    lineHeight: 16,
                                  }}>
                                    <Text style={{ fontWeight: 'bold', color: '#D97706' }}>Note: </Text>
                                    {item.md_timetable_remark.en}
                                  </Text>
                                </View>
                              )}
                            </View>

                            {/* Hidden measure view for animation - Return Trip */}
                            <View
                              style={{ position: 'absolute', opacity: 0, left: 0, top: 0, right: 0, zIndex: -1 }}
                              onLayout={(e) => {
                                const h = e.nativeEvent.layout.height;
                                if (contentHeights[item.md_timetable_id] !== h) {
                                  setContentHeights(prev => ({ ...prev, [item.md_timetable_id]: h }));
                                }
                              }}
                            >
                              <View style={{ padding: 20 }}>
                                <Text style={{
                                  color: '#D97706',
                                  fontWeight: 'bold',
                                  fontSize: 16,
                                  marginBottom: 12,
                                }}>
                                  Trip Details
                                </Text>
                                <Text style={{
                                  color: '#92400E',
                                  fontSize: 14,
                                  lineHeight: 20,
                                  marginBottom: 16,
                                }}>
                                  {removeHtmlTags(item.md_timetable_tripdetail[0]?.md_timetabledetail_detaileng1 || "Detailed information about this ferry trip.")}
                                </Text>
                                {item.md_timetable_tripdetail[0]?.md_timetabledetail_picname1 && (
                                  <View style={{
                                    width: '100%',
                                    height: 200,
                                    backgroundColor: '#FEF3C7',
                                    borderRadius: 16,
                                    marginBottom: 10,
                                  }} />
                                )}
                              </View>
                            </View>
                          </View>

                          {/* Expandable Detail Section - Return Trip */}
                          <Animated.View
                            style={{
                              maxHeight: selectedPickup === item.md_timetable_id ? getAnimatedHeight(item.md_timetable_id) : 0,
                              overflow: 'hidden',
                              backgroundColor: '#FFFBEB',
                              borderBottomLeftRadius: 20,
                              borderBottomRightRadius: 20,
                            }}
                          >
                            <View style={{ padding: 20 }}>
                              <Text style={{
                                color: '#D97706',
                                fontWeight: 'bold',
                                fontSize: 16,
                                marginBottom: 12,
                              }}>
                                Trip Details
                              </Text>
                              <Text style={{
                                color: '#92400E',
                                fontSize: 14,
                                lineHeight: 20,
                                marginBottom: 16,
                              }}>
                                {removeHtmlTags(item.md_timetable_tripdetail[0]?.md_timetabledetail_detaileng1 || "Detailed information about this ferry trip.")}
                              </Text>

                              {/* Ferry Image with Error Handling - Return Trip */}
                              {item.md_timetable_tripdetail[0]?.md_timetabledetail_picname1 ? (
                                <View style={{
                                  borderRadius: 16,
                                  overflow: 'hidden',
                                  backgroundColor: '#FEF3C7',
                                  shadowColor: '#D97706',
                                  shadowOffset: { width: 0, height: 2 },
                                  shadowOpacity: 0.1,
                                  shadowRadius: 4,
                                  elevation: 3,
                                }}>
                                  <Image
                                    source={{
                                      uri: `https://www.thetrago.com/Api/uploads/timetabledetail/${item.md_timetable_tripdetail[0].md_timetabledetail_picname1}`,
                                      cache: 'force-cache'
                                    }}
                                    style={{
                                      width: '100%',
                                      height: 200,
                                      resizeMode: 'cover'
                                    }}
                                    onError={(error) => {
                                      console.log('Return trip image loading error:', error);
                                    }}
                                  />
                                </View>
                              ) : (
                                <View style={{
                                  width: '100%',
                                  height: 200,
                                  backgroundColor: '#FEF3C7',
                                  borderRadius: 16,
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                  borderWidth: 2,
                                  borderColor: '#FDE68A',
                                  borderStyle: 'dashed',
                                }}>
                                  <Icon name="image-outline" size={48} color="#D97706" />
                                  <Text style={{
                                    color: '#D97706',
                                    fontSize: 14,
                                    fontWeight: '500',
                                    marginTop: 8,
                                  }}>
                                    No image available
                                  </Text>
                                </View>
                              )}


                            </View>
                          </Animated.View>
                        </View>
                      </TouchableOpacity>
                    ))}

                  </>)}
                </>)}
            </>
          )}
          {/* Enhanced Ultra Premium Pagination - Depart Trip */}
          {
            tripTypeSearchResult === 'Depart Trip' && filteredDepartData != null && departTrips.length > 0 && (
              <View style={{
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                marginVertical: hp('3.5%'),
                paddingHorizontal: wp('5%'),
                marginBottom: Platform.OS === 'android' ? hp('12%') : hp('10%'), // เพิ่ม margin bottom เพื่อไม่ให้ bottom bar บัง
              }}>
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(255,255,255,0.95)',
                  borderRadius: wp('8%'),
                  paddingVertical: hp('1.5%'),
                  paddingHorizontal: wp('6%'),
                  shadowColor: Platform.OS === 'android' ? 'transparent' : '#001233',
                  shadowOpacity: Platform.OS === 'android' ? 0 : 0.12,
                  shadowRadius: Platform.OS === 'android' ? 0 : wp('4%'),
                  shadowOffset: Platform.OS === 'android' ? { width: 0, height: 0 } : { width: 0, height: hp('0.5%') },
                  elevation: Platform.OS === 'android' ? 0 : 15,
                  minWidth: wp('50%'),
                  borderWidth: 1,
                  borderColor: 'rgba(253, 80, 30, 0.08)',
                  backdropFilter: 'blur(20px)',
                }}>
                  {/* Previous Button */}
                  <TouchableOpacity
                    onPress={goToPreviousPageDepart}
                    disabled={currentPageDepart === 1}
                    style={{
                      width: wp('12%'),
                      height: wp('12%'),
                      borderRadius: wp('6%'),
                      backgroundColor: currentPageDepart === 1 ? 'rgba(148, 163, 184, 0.2)' : '#FD501E',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: wp('4.5%'),
                      shadowColor: Platform.OS === 'android' ? 'transparent' : (currentPageDepart === 1 ? 'transparent' : '#FD501E'),
                      shadowOpacity: Platform.OS === 'android' ? 0 : 0.25,
                      shadowRadius: Platform.OS === 'android' ? 0 : wp('2%'),
                      shadowOffset: Platform.OS === 'android' ? { width: 0, height: 0 } : { width: 0, height: hp('0.3%') },
                      elevation: Platform.OS === 'android' ? 0 : (currentPageDepart === 1 ? 0 : 8),
                      opacity: currentPageDepart === 1 ? 0.5 : 1,
                      borderWidth: currentPageDepart === 1 ? 1 : 0,
                      borderColor: currentPageDepart === 1 ? 'rgba(148, 163, 184, 0.3)' : 'transparent',
                    }}
                    activeOpacity={currentPageDepart === 1 ? 1 : 0.8}
                  >
                    <Icon
                      name="chevron-back"
                      size={wp('6%')}
                      color={currentPageDepart === 1 ? '#94A3B8' : '#FFFFFF'}
                    />
                  </TouchableOpacity>

                  {/* Page Number Display */}
                  <View style={{
                    backgroundColor: 'rgba(253, 80, 30, 0.08)',
                    borderRadius: wp('4%'),
                    paddingHorizontal: wp('5%'),
                    paddingVertical: hp('1.2%'),
                    marginHorizontal: wp('1%'),
                    minWidth: wp('12%'),
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: 'rgba(253, 80, 30, 0.15)',
                    shadowColor: Platform.OS === 'android' ? 'transparent' : '#FD501E',
                    shadowOpacity: Platform.OS === 'android' ? 0 : 0.08,
                    shadowRadius: Platform.OS === 'android' ? 0 : wp('1%'),
                    elevation: Platform.OS === 'android' ? 0 : 2,
                  }}>
                    <Text style={{
                      fontSize: wp('5.5%'),
                      fontWeight: '800',
                      color: '#FD501E',
                      textAlign: 'center',
                      letterSpacing: -0.2,
                      textShadowColor: 'rgba(253, 80, 30, 0.1)',
                      textShadowRadius: 1,
                    }}>
                      {currentPageDepart}
                    </Text>
                  </View>

                  {/* Next Button */}
                  <TouchableOpacity
                    onPress={goToNextPageDepart}
                    disabled={currentPageDepart * itemsPerPage >= filteredDepartData.length}
                    style={{
                      width: wp('12%'),
                      height: wp('12%'),
                      borderRadius: wp('6%'),
                      backgroundColor: (currentPageDepart * itemsPerPage >= filteredDepartData.length) ? 'rgba(148, 163, 184, 0.2)' : '#FD501E',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginLeft: wp('4.5%'),
                      shadowColor: Platform.OS === 'android' ? 'transparent' : ((currentPageDepart * itemsPerPage >= filteredDepartData.length) ? 'transparent' : '#FD501E'),
                      shadowOpacity: Platform.OS === 'android' ? 0 : 0.25,
                      shadowRadius: Platform.OS === 'android' ? 0 : wp('2%'),
                      shadowOffset: Platform.OS === 'android' ? { width: 0, height: 0 } : { width: 0, height: hp('0.3%') },
                      elevation: Platform.OS === 'android' ? 0 : ((currentPageDepart * itemsPerPage >= filteredDepartData.length) ? 0 : 8),
                      opacity: (currentPageDepart * itemsPerPage >= filteredDepartData.length) ? 0.5 : 1,
                      borderWidth: (currentPageDepart * itemsPerPage >= filteredDepartData.length) ? 1 : 0,
                      borderColor: (currentPageDepart * itemsPerPage >= filteredDepartData.length) ? 'rgba(148, 163, 184, 0.3)' : 'transparent',
                    }}
                    activeOpacity={(currentPageDepart * itemsPerPage >= filteredDepartData.length) ? 1 : 0.8}
                  >
                    <Icon
                      name="chevron-forward"
                      size={wp('6%')}
                      color={(currentPageDepart * itemsPerPage >= filteredDepartData.length) ? '#94A3B8' : '#FFFFFF'}
                    />
                  </TouchableOpacity>
                </View>

                {/* Page Info */}
                <Text style={{
                  marginTop: hp('1.5%'),
                  color: 'rgba(255,255,255,0.8)',
                  fontSize: wp('3.2%'),
                  fontWeight: '600',
                  letterSpacing: 0.3,
                  textAlign: 'center',
                  textShadowColor: 'rgba(0,0,0,0.3)',
                  textShadowRadius: 2,
                }}>
                  Page {currentPageDepart} of {Math.ceil(filteredDepartData.length / itemsPerPage)}
                </Text>
              </View>
            )
          }

          {/* Enhanced Ultra Premium Pagination - Return Trip */}
          {
            tripTypeSearchResult === 'Return Trip' && filteredReturnData != null && returnTrips.length > 0 && (
              <View style={{
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                marginVertical: hp('3.5%'),
                paddingHorizontal: wp('5%'),
                marginBottom: Platform.OS === 'android' ? hp('12%') : hp('10%'), // เพิ่ม margin bottom เพื่อไม่ให้ bottom bar บัง
              }}>
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(255,255,255,0.95)',
                  borderRadius: wp('8%'),
                  paddingVertical: hp('1.5%'),
                  paddingHorizontal: wp('6%'),
                  shadowColor: Platform.OS === 'android' ? 'transparent' : '#001233',
                  shadowOpacity: Platform.OS === 'android' ? 0 : 0.12,
                  shadowRadius: Platform.OS === 'android' ? 0 : wp('4%'),
                  shadowOffset: Platform.OS === 'android' ? { width: 0, height: 0 } : { width: 0, height: hp('0.5%') },
                  elevation: Platform.OS === 'android' ? 0 : 15,
                  minWidth: wp('50%'),
                  borderWidth: 1,
                  borderColor: 'rgba(255, 214, 0, 0.12)',
                  backdropFilter: 'blur(20px)',
                }}>
                  {/* Previous Button */}
                  <TouchableOpacity
                    onPress={goToPreviousPageReturn}
                    disabled={currentPageReturn === 1}
                    style={{
                      width: wp('12%'),
                      height: wp('12%'),
                      borderRadius: wp('6%'),
                      backgroundColor: currentPageReturn === 1 ? 'rgba(148, 163, 184, 0.2)' : '#FFD600',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: wp('4.5%'),
                      shadowColor: Platform.OS === 'android' ? 'transparent' : (currentPageReturn === 1 ? 'transparent' : '#FFD600'),
                      shadowOpacity: Platform.OS === 'android' ? 0 : 0.25,
                      shadowRadius: Platform.OS === 'android' ? 0 : wp('2%'),
                      shadowOffset: Platform.OS === 'android' ? { width: 0, height: 0 } : { width: 0, height: hp('0.3%') },
                      elevation: Platform.OS === 'android' ? 0 : (currentPageReturn === 1 ? 0 : 8),
                      opacity: currentPageReturn === 1 ? 0.5 : 1,
                      borderWidth: currentPageReturn === 1 ? 1 : 0,
                      borderColor: currentPageReturn === 1 ? 'rgba(148, 163, 184, 0.3)' : 'transparent',
                    }}
                    activeOpacity={currentPageReturn === 1 ? 1 : 0.8}
                  >
                    <Icon
                      name="chevron-back"
                      size={wp('6%')}
                      color={currentPageReturn === 1 ? '#94A3B8' : '#1E293B'}
                    />
                  </TouchableOpacity>

                  {/* Page Number Display */}
                  <View style={{
                    backgroundColor: 'rgba(255, 214, 0, 0.12)',
                    borderRadius: wp('4%'),
                    paddingHorizontal: wp('5%'),
                    paddingVertical: hp('1.2%'),
                    marginHorizontal: wp('1%'),
                    minWidth: wp('12%'),
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: 'rgba(255, 214, 0, 0.2)',
                    shadowColor: Platform.OS === 'android' ? 'transparent' : '#FFD600',
                    shadowOpacity: Platform.OS === 'android' ? 0 : 0.08,
                    shadowRadius: Platform.OS === 'android' ? 0 : wp('1%'),
                    elevation: Platform.OS === 'android' ? 0 : 2,
                  }}>
                    <Text style={{
                      fontSize: wp('5.5%'),
                      fontWeight: '800',
                      color: '#B8860B',
                      textAlign: 'center',
                      letterSpacing: -0.2,
                      textShadowColor: 'rgba(255, 214, 0, 0.1)',
                      textShadowRadius: 1,
                    }}>
                      {currentPageReturn}
                    </Text>
                  </View>

                  {/* Next Button */}
                  <TouchableOpacity
                    onPress={goToNextPageReturn}
                    disabled={currentPageReturn * itemsPerPage >= filteredReturnData.length}
                    style={{
                      width: wp('12%'),
                      height: wp('12%'),
                      borderRadius: wp('6%'),
                      backgroundColor: (currentPageReturn * itemsPerPage >= filteredReturnData.length) ? 'rgba(148, 163, 184, 0.2)' : '#FFD600',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginLeft: wp('4.5%'),
                      shadowColor: Platform.OS === 'android' ? 'transparent' : ((currentPageReturn * itemsPerPage >= filteredReturnData.length) ? 'transparent' : '#FFD600'),
                      shadowOpacity: Platform.OS === 'android' ? 0 : 0.25,
                      shadowRadius: Platform.OS === 'android' ? 0 : wp('2%'),
                      shadowOffset: Platform.OS === 'android' ? { width: 0, height: 0 } : { width: 0, height: hp('0.3%') },
                      elevation: Platform.OS === 'android' ? 0 : ((currentPageReturn * itemsPerPage >= filteredReturnData.length) ? 0 : 8),
                      opacity: (currentPageReturn * itemsPerPage >= filteredReturnData.length) ? 0.5 : 1,
                      borderWidth: (currentPageReturn * itemsPerPage >= filteredReturnData.length) ? 1 : 0,
                      borderColor: (currentPageReturn * itemsPerPage >= filteredReturnData.length) ? 'rgba(148, 163, 184, 0.3)' : 'transparent',
                    }}
                    activeOpacity={(currentPageReturn * itemsPerPage >= filteredReturnData.length) ? 1 : 0.8}
                  >
                    <Icon
                      name="chevron-forward"
                      size={wp('6%')}
                      color={(currentPageReturn * itemsPerPage >= filteredReturnData.length) ? '#94A3B8' : '#1E293B'}
                    />
                  </TouchableOpacity>
                </View>

                {/* Page Info */}
                <Text style={{
                  marginTop: hp('1.5%'),
                  color: 'rgba(255,255,255,0.8)',
                  fontSize: wp('3.2%'),
                  fontWeight: '600',
                  letterSpacing: 0.3,
                  textAlign: 'center',
                  textShadowColor: 'rgba(0,0,0,0.3)',
                  textShadowRadius: 2,
                }}>
                  Page {currentPageReturn} of {Math.ceil(filteredReturnData.length / itemsPerPage)}
                </Text>
              </View>
            )
          }


        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};



export default SearchFerry;