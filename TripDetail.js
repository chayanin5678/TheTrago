import React, { useRef, useState, useEffect } from 'react';
import ipAddress from './ipconfig';
import Icon from 'react-native-vector-icons/Ionicons';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, Modal, FlatList, ImageBackground, TouchableWithoutFeedback, Alert, ActivityIndicator, SafeAreaView, Dimensions, StatusBar, Platform, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Picker } from '@react-native-picker/picker';
import { MaterialIcons } from '@expo/vector-icons';
import { AntDesign } from '@expo/vector-icons';
import LogoTheTrago from './(component)/Logo';
import Step from './(component)/Step';
import BackNextButton from './(component)/BackNextButton';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import moment from 'moment';
import { useCustomer } from './(Screen)/CustomerContext';
import axios from 'axios';
import headStyles from './(CSS)/StartingPointScreenStyles';
import { useLanguage } from './(Screen)/LanguageContext';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const TripDetail = ({ navigation, route }) => {
  const { t, selectedLanguage } = useLanguage();

  // Animation States - เหมือนหน้า SearchFerry
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const shimmerAnim = useRef(new Animated.Value(-300)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  // Floating particles animation
  const floatingAnims = useRef(
    [...Array(6)].map(() => ({
      x: new Animated.Value(Math.random() * screenWidth - screenWidth / 2),
      y: new Animated.Value(Math.random() * screenHeight * 0.8),
      opacity: new Animated.Value(0.1),
      scale: new Animated.Value(1),
    }))
  ).current;

  const [tripType, setTripType] = useState("One Way Trip");
  const [pickupPriceDepart, setpickupPriceDepart] = useState();
  const [pickupPriceReturn, setpickupPriceReturn] = useState();
  const [dropoffPriceDepart, setDropoffPriceDepart] = useState();
  const [dropoffPriceReturn, setDropoffPriceReturn] = useState();
  const [totalAdultDepart, setTotalAdultDepart] = useState("0.00");
  const [totalAdultReturn, setTotalAdultReturn] = useState("0.00");
  const [totalChildDepart, setTotalChildDepart] = useState("0.00");
  const [totalChildReturn, setTotalChildReturn] = useState("0.00");
  const [totalInfantDepart, setTotalInfantDepart] = useState("0.00");
  const [totalInfantReturn, setTotalInfantReturn] = useState("0.00");
  const [subtotalDepart, setSubtotalDepart] = useState("0.00");
  const [subtotalReturn, setSubtotalReturn] = useState("0.00");
  const [total, setTotal] = useState("0.00");
  const [discountDepart, setDiscountDepart] = useState("0.00");
  const [discountReturn, setDiscountReturn] = useState("0.00");
  const [saleadultDepart, setSaleadultDepart] = useState();
  const [saleadultReturn, setSaleadultReturn] = useState();
  const [salechildDepart, setSalechildDepart] = useState();
  const [salechildReturn, setSalechildReturn] = useState();
  const [saleinfantDepart, setSaleinfantDepart] = useState();
  const [saleinfantReturn, setSaleinfantReturn] = useState();
  const [adultPriceDepart, setAdultPriceDepart] = useState();
  const [adultPriceReturn, setAdultPriceReturn] = useState();
  const [childPriceDepart, setChildPriceDepart] = useState();
  const [childPriceReturn, setChildPriceReturn] = useState();
  const [infantPriceDepart, setinfantPriceDepart] = useState();
  const [infantPriceReturn, setinfantPriceReturn] = useState();
  const [pickuphourDepart, setPickuphourDepart] = useState("HH");
  const [dropoffhourDepart, setDropoffhourDepart] = useState("HH");
  const [pickupminutesDepart, setpickupMinutesDepart] = useState("MM");
  const [dropoffminutesDepart, setDropoffminutesDepart] = useState("MM");
  const [pickuphourReturn, setPickupHourReturn] = useState("HH");
  const [dropoffhourReturn, setDropoffhourReturn] = useState("HH");
  const [pickupminutesreturn, setpickupMinutesReturn] = useState("MM");
  const [dropoffminutesReturn, setDropoffminutesReturn] = useState("MM");
  const [loading, setLoading] = useState(true);
  const [timetableDepart, settimetableDepart] = useState([]);
  const [timetableReturn, settimetableReturn] = useState([]);
  const [pickupDepart, setpickupDepart] = useState(false);
  const [pickupReturn, setpickupReturn] = useState(false);
  const [dropoffDepart, setDropoffDepart] = useState(false);
  const [dropoffReturn, setDropoffReturn] = useState(false);
  const [priceDepart, setPriceDepart] = useState([]);
  const [priceReturn, setPriceReturn] = useState([]);
  const [error, setError] = useState(null);

  const [TranSportDepartPickup, setTranSportDepartPickup] = useState([]);
  const [TranSportReturnPickup, setTranSportReturnPickup] = useState([]);


  const [TranSportDropoffDepart, setTranSportDropoffDepart] = useState([]);
  const [TranSportDropoffReturn, setTranSportDropoffReturn] = useState([]);
  const [pickupAreaDepart, setPickupAreaDepart] = useState([]);
  const [pickupAreaReturn, setPickupAreaReturn] = useState([]);
  const [DropoffAreaDepart, setDropoffAreaDepart] = useState([]);
  const [DropoffAreaReturn, setDropoffAreaReturn] = useState([]);
  const [airPortPickupDepart, setAirPortPickupDepart] = useState('');
  const [airPortPickupReturn, setAirPortPickupReturn] = useState('');
  const [airPortDropoffDepart, setAirPortDropoffDepart] = useState('');
  const [airPortDropoffReturn, setAirPortDropoffReturn] = useState('');
  const [ispickupHourModalVisibleDepart, setispickupHourModalVisibleDepart] = useState(false);
  const [isdropoffHourModalVisibleDepart, setisdropoffHourModalVisibleDepart] = useState(false);
  const [ispickupMinuteModalVisibleDepart, setispickupMinuteModalVisibleDepart] = useState(false);
  const [isdropoffMinuteModalVisibleDepart, setisdropoffMinuteModalVisibleDepart] = useState(false);


  const [ispickupHourModalVisibleReturn, setispickupHourModalVisibleReturn] = useState(false);
  const [isdropoffHourModalVisibleReturn, setisdropoffHourModalVisibleReturn] = useState(false);
  const [ispickupMinuteModalVisibleReturn, setispickupMinuteModalVisibleReturn] = useState(false);
  const [isdropoffMinuteModalVisibleReturn, setisdropoffMinuteModalVisibleReturn] = useState(false);
  const { customerData, updateCustomerData } = useCustomer();
  const [modaladultVisibleDepart, setModalAdultVisibleDepart] = useState(false);
  const [modaladultVisibleReturn, setModalAdultVisibleReturn] = useState(false);
  const [modalchildVisibleDepart, setModalChildVisibleDepart] = useState(false);
  const [modalchildVisibleReturn, setModalChildVisibleReturn] = useState(false);
  const [modalInfantVisibleDepart, setModalInfantVisibleDepart] = useState(false);
  const [modalInfantVisibleReturn, setModalInfantVisibleReturn] = useState(false);
  const [HotelpickupDepart, setHotelpickupDepart] = useState('');
  const [HoteldropoffDepart, setHoteldropoffDepart] = useState('');
  const [HotelpickupReturn, setHotelpickupReturn] = useState('');
  const [HoteldropoffReturn, setHoteldropoffReturn] = useState('');
  const [errors, setErrors] = useState({});




  // console.log(timeTablecCmpanyId);
  // console.log(timeTablecPierStartId);
  // console.log(timeTablecPierEndId);
  // console.log(departDateTimeTable);
  // console.log(adults);
  const [selectedTranSportPickupDepart, setSelectedTranSportPickupDepart] = useState('0');
  const [selectedPickupDepart, setSelectedPickupDepart] = useState("");
  const [selectedTranSportDropoffDepart, setSelectedTranSportDropoffDepart] = useState('0');
  const [selectedDropoffDepart, setSelectedDropoffDepart] = useState("");
  const [selectedTranSportPickupReturn, setSelectedTranSportPickupReturn] = useState('0');
  const [selectedPickupReturn, setSelectedPickupReturn] = useState("");
  const [selectedTranSportDropoffReturn, setSelectedTranSportDropoffReturn] = useState('0');
  const [selectedDropoffReturn, setSelectedDropoffReturn] = useState("");
  const [selectedTransportPickupDepartName, setSelectedTransportPickupDepartName] = useState("Select Transport Type");
  const [selectedPickupDepartName, setSelectedPickupDepartName] = useState("Please Select");
  const [selectedTransportDropoffDepartName, setSelectedTransportDropoffDepartName] = useState("Select Transport Type");
  const [selectedDropoffDepartName, setSelectedDropoffDepartName] = useState("Please Select");
  const [selectedTransportPickupReturnName, setSelectedTransportPickupReturnName] = useState("Select Transport Type");
  const [selectedPickupReturnName, setSelectedPickupReturnName] = useState("Please Select");
  const [selectedTransportDropoffReturnName, setSelectedTransportDropoffReturnName] = useState("Select Transport Type");
  const [selectedDropoffReturnName, setSelectedDropoffReturnName] = useState("Please Select");
  const [isModalTransportDepartPickupVisible, setModalTransportDepartPickupVisible] = useState(false);
  const [isModalDepartPickupVisible, setModalDepartPickupVisible] = useState(false);
  const [isModalTransportDepartDropoffVisible, setModalTransportDepartDropoffVisible] = useState(false);
  const [isModalDepartDropoffVisible, setModalDepartDropoffVisible] = useState(false);
  const [isModalTransportReturnPickupVisible, setModalTransportReturnPickupVisible] = useState(false);
  const [isModalReturnPickupVisible, setModalReturnPickupVisible] = useState(false);
  const [isModalTransportReturnDropoffVisible, setModalTransportReturnDropoffVisible] = useState(false);
  const [isModalReturnDropoffVisible, setModalReturnDropoffVisible] = useState(false);
  const toggleModalTransportPickupDepart = () => setModalTransportDepartPickupVisible(!isModalTransportDepartPickupVisible);
  const toggleModalPickupDepart = () => setModalDepartPickupVisible(!isModalDepartPickupVisible);
  const toggleModalTransportDropoffDepart = () => setModalTransportDepartDropoffVisible(!isModalTransportDepartDropoffVisible);
  const toggleModalDropoffDepart = () => setModalDepartDropoffVisible(!isModalDepartDropoffVisible);
  const toggleModalTransportPickupReturn = () => setModalTransportReturnPickupVisible(!isModalTransportReturnPickupVisible);
  const toggleModalPickupReturn = () => setModalReturnPickupVisible(!isModalReturnPickupVisible);
  const toggleModalTransportDropoffReturn = () => setModalTransportReturnDropoffVisible(!isModalTransportReturnDropoffVisible);
  const toggleModalDropoffReturn = () => setModalReturnDropoffVisible(!isModalReturnDropoffVisible);
    console.log('pickupselect', selectedPickupDepart);

  const handleSelectedTranSportPickupDepart = (item) => {
    setSelectedTranSportPickupDepart(item.md_pickup_cartypeid); // เก็บ id
    setSelectedTransportPickupDepartName(item.md_cartype_nameeng); // เก็บชื่อ
    setErrors((prev) => ({ ...prev, selectedTransportPickupDepartName: false })); // Clear the error state
    setSelectedPickupDepart("");
    setSelectedPickupDepartName("Please Select");
    setpickupPriceDepart(0);
    setAirPortPickupDepart('');
    toggleModalTransportPickupDepart();
  };

  const handleSelectPickupDepart = (item) => {
    setSelectedPickupDepart(item.md_pickup_id);
    setSelectedPickupDepartName(item.md_transfer_nameeng);
    setErrors((prev) => ({ ...prev, selectedTransportPickupDepartName: false })); // Clear the error state
    if (item.md_pickup_id === "0") {
      setpickupPriceDepart(0);
      setAirPortPickupDepart('');
      updateCustomerData({ pickupDepartId: "" });
    } else {
      setAirPortPickupDepart(item.md_transfer_airport);
      setpickupPriceDepart(item.md_pickup_price);
      updateCustomerData({ pickupDepartId: item.md_pickup_id });
    }
    toggleModalPickupDepart();
  };


  const handleSelectedTranSportDropoffDepart = (item) => {
    setSelectedTranSportDropoffDepart(item.md_dropoff_cartypeid); // เก็บ id
    setSelectedTransportDropoffDepartName(item.md_cartype_nameeng); // เก็บชื่อ
    setErrors((prev) => ({ ...prev, selectedTransportDropoffDepartName: false })); // Clear the error state
    setSelectedDropoffDepart("");
    setSelectedDropoffDepartName("Please Select");
    setDropoffPriceDepart(0);
    setAirPortDropoffDepart('');
    toggleModalTransportDropoffDepart();
  };

  const handleSelectDropoffDepart = (item) => {
    setSelectedDropoffDepart(item.md_dropoff_id);
    setSelectedDropoffDepartName(item.md_transfer_nameeng);
    setErrors((prev) => ({ ...prev, selectedDropoffDepartName: false })); // Clear the error state
    if (item.md_dropoff_id === "0") {
      setDropoffPriceDepart(0);
      setAirPortDropoffDepart('');
      updateCustomerData({ dropoffDepartId: "" });
    } else {
      setAirPortDropoffDepart(item.md_transfer_airport);
      setDropoffPriceDepart(item.md_dropoff_price);
      updateCustomerData({ dropoffDepartId: item.md_dropoff_id });
    }
    toggleModalDropoffDepart();
  };

  const handleSelectedTranSportPickupReturn = (item) => {
    setSelectedTranSportPickupReturn(item.md_pickup_cartypeid); // เก็บ id
    setSelectedTransportPickupReturnName(item.md_cartype_nameeng); // เก็บชื่อ
    setErrors((prev) => ({ ...prev, selectedTransportPickupReturnName: false })); // Clear the error state
    setSelectedPickupReturn("");
    setSelectedPickupReturnName("Please Select");
    setpickupPriceReturn(0);
    setAirPortPickupReturn('');
    toggleModalTransportPickupReturn();
  };

  const handleSelectPickupReturn = (item) => {
    setSelectedPickupReturn(item.md_pickup_id);
    setSelectedPickupReturnName(item.md_transfer_nameeng);
    setErrors((prev) => ({ ...prev, selectedPickupReturnName: false })); // Clear the error state
    if (item.md_pickup_id === "0") {
      setpickupPriceReturn(0);
      setAirPortPickupReturn('');
      updateCustomerData({ pickupReturnId: "" });
    } else {
      setAirPortPickupReturn(item.md_transfer_airport);
      setpickupPriceReturn(item.md_pickup_price);
      updateCustomerData({ pickupReturnId: item.md_pickup_id });
    }
    toggleModalPickupReturn();
  };

  const handleSelectedTranSportDropoffReturn = (item) => {
    setSelectedTranSportDropoffReturn(item.md_dropoff_cartypeid); // เก็บ id
    setSelectedTransportDropoffReturnName(item.md_cartype_nameeng); // เก็บชื่อ
    setErrors((prev) => ({ ...prev, selectedTransportDropoffReturnName: false })); // Clear the error state
    setSelectedDropoffReturn("");
    setSelectedDropoffReturnName("Please Select");
    setDropoffPriceReturn(0);
    setAirPortDropoffReturn('');
    toggleModalTransportDropoffReturn();
  };

  const handleSelectDropoffReturn = (item) => {
    setSelectedDropoffReturn(item.md_dropoff_id);
    setSelectedDropoffReturnName(item.md_transfer_nameeng);
    setErrors((prev) => ({ ...prev, selectedDropoffReturnName: false })); // Clear the error state
    if (item.md_dropoff_id === "0") {
      setDropoffPriceReturn(0);
      setAirPortDropoffReturn('');
      updateCustomerData({ dropoffReturnId: "" });
    } else {
      setAirPortDropoffReturn(item.md_transfer_airport);
      setDropoffPriceReturn(item.md_dropoff_price);
      updateCustomerData({ dropoffReturnId: item.md_dropoff_id });
    }
    toggleModalDropoffReturn();
  };





  const toggleTooltipadultDepart = () => {
    setModalAdultVisibleDepart(!modaladultVisibleDepart);
  };
  const toggleTooltipadultReturn = () => {
    setModalAdultVisibleReturn(!modaladultVisibleReturn);
  };

  // Close modal when clicking outside of it
  const closeModaladultDepart = () => {
    setModalAdultVisibleDepart(false);
  };

  const closeModaladultReturn = () => {
    setModalAdultVisibleReturn(false);
  };


  const toggleTooltipchildDepart = () => {
    setModalChildVisibleDepart(!modalchildVisibleDepart);
  };

  const toggleTooltipchildReturn = () => {
    setModalChildVisibleReturn(!modalchildVisibleReturn);
  };

  // Close modal when clicking outside of it
  const closeModalchildDepart = () => {
    setModalChildVisibleDepart(false);
  };

  const closeModalchildReturn = () => {
    setModalChildVisibleReturn(false);
  };

  const toggleTooltipinfantDepart = () => {
    setModalInfantVisibleDepart(!modalInfantVisibleDepart);
  };

  const toggleTooltipinfantReturn = () => {
    setModalInfantVisibleReturn(!modalInfantVisibleReturn);
  };

  const closeModalindantDepart = () => {
    setModalInfantVisibleDepart(false);
  };

  const closeModalinfantReturn = () => {
    setModalInfantVisibleReturn(false);
  };

  // function formatNumber(value) {
  //   return parseFloat(value).toFixed(2);
  // }


  const pickuptoggleHourtModalDepart = () => {
    setispickupHourModalVisibleDepart(!ispickupHourModalVisibleDepart);
  };

  const dropofftoggleHourtModalDepart = () => {
    setisdropoffHourModalVisibleDepart(!isdropoffHourModalVisibleDepart);
  };

  const pickuptoggleHourtModalReturn = () => {
    setispickupHourModalVisibleReturn(!ispickupHourModalVisibleReturn);
  };

  const dropofftoggleHourtModalReturn = () => {
    setisdropoffHourModalVisibleReturn(!isdropoffHourModalVisibleReturn);
  };

  const pickuphandleHourSelectDepart = (value) => {
    setPickuphourDepart(value);
    pickuptoggleHourtModalDepart();
  };

  const dropoffhandleHourSelectDepart = (value) => {
    setDropoffhourDepart(value);
    dropofftoggleHourtModalDepart();
  };

  const pickuphandleHourSelectReturn = (value) => {
    setPickupHourReturn(value);
    pickuptoggleHourtModalReturn();
  };

  const dropoffhandleHourSelectReturn = (value) => {
    setDropoffhourReturn(value);
    dropofftoggleHourtModalReturn();
  };


  const pickuprenderHourOptionDepart = ({ item }) => (
    <TouchableOpacity
      style={styles.modalOption}
      onPress={() => pickuphandleHourSelectDepart(item)}
      key={item.toString()} // Add unique key here
    >
      <Text style={styles.modalOptionText}>{item}</Text>
    </TouchableOpacity>
  );
  const dropoffrenderHourOptionDepart = ({ item }) => (
    <TouchableOpacity
      style={styles.modalOption}
      onPress={() => dropoffhandleHourSelectDepart(item)}
      key={item.toString()} // Add unique key here
    >
      <Text style={styles.modalOptionText}>{item}</Text>
    </TouchableOpacity>
  );
  const pickuprenderHourOptionReturn = ({ item }) => (
    <TouchableOpacity
      style={styles.modalOption}
      onPress={() => pickuphandleHourSelectReturn(item)}
      key={item.toString()} // Add unique key here
    >
      <Text style={styles.modalOptionText}>{item}</Text>
    </TouchableOpacity>
  );

  const dropoffrenderHourOptionReturn = ({ item }) => (
    <TouchableOpacity
      style={styles.modalOption}
      onPress={() => dropoffhandleHourSelectReturn(item)}
      key={item.toString()} // Add unique key here
    >
      <Text style={styles.modalOptionText}>{item}</Text>
    </TouchableOpacity>
  );

  const HourOption = ['HH', ...Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'))];

  const pickuptoggleMinuteModalDepart = () => {
    setispickupMinuteModalVisibleDepart(!ispickupMinuteModalVisibleDepart);
  };

  const dropofftoggleMinuteModalDepart = () => {
    setisdropoffMinuteModalVisibleDepart(!isdropoffMinuteModalVisibleDepart);
  };

  const pickuptoggleMinuteModalReturn = () => {
    setispickupMinuteModalVisibleReturn(!ispickupMinuteModalVisibleReturn);
  };

  const dropofftoggleMinuteModalReturn = () => {
    setisdropoffMinuteModalVisibleReturn(!isdropoffMinuteModalVisibleReturn);
  };

  const pickuphandleMinuteSelectDepart = (value) => {
    setpickupMinutesDepart(value);
    pickuptoggleMinuteModalDepart();
  };

  const dropoffhandleMinuteSelectDepart = (value) => {
    setDropoffminutesDepart(value);
    dropofftoggleMinuteModalDepart();
  };

  const pickuphandleMinuteSelectReturn = (value) => {
    setpickupMinutesReturn(value);
    pickuptoggleMinuteModalReturn();
  };

  const dropoffhandleMinuteSelectReturn = (value) => {
    setDropoffminutesReturn(value);
    dropofftoggleMinuteModalReturn();
  };

  const pickuprenderMinuteOptionDepart = ({ item }) => (
    <TouchableOpacity
      style={styles.modalOption}
      onPress={() => pickuphandleMinuteSelectDepart(item)}
      key={item.toString()} // Add unique key here
    >
      <Text style={styles.modalOptionText}>{item}</Text>
    </TouchableOpacity>
  );


  const dropoffrenderMinuteOptionDepart = ({ item }) => (
    <TouchableOpacity
      style={styles.modalOption}
      onPress={() => dropoffhandleMinuteSelectDepart(item)}
      key={item.toString()} // Add unique key here
    >
      <Text style={styles.modalOptionText}>{item}</Text>
    </TouchableOpacity>
  );

  const pickuprenderMinuteOptionReturn = ({ item }) => (
    <TouchableOpacity
      style={styles.modalOption}
      onPress={() => pickuphandleMinuteSelectReturn(item)}
      key={item.toString()} // Add unique key here
    >
      <Text style={styles.modalOptionText}>{item}</Text>
    </TouchableOpacity>
  );

  const dropoffrenderMinuteOptionReturn = ({ item }) => (
    <TouchableOpacity
      style={styles.modalOption}
      onPress={() => dropoffhandleMinuteSelectReturn(item)}
      key={item.toString()} // Add unique key here
    >
      <Text style={styles.modalOptionText}>{item}</Text>
    </TouchableOpacity>
  );


  const minuteOption = ['MM', ...Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'))];

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
    const date = new Date(dateString);
    console.log('🗓️ TripDetail formatDate called:', {
      dateString,
      selectedLanguage,
      parsedDate: date.toISOString()
    });
    
    if (selectedLanguage === 'th') {
      // วันในสัปดาห์ภาษาไทย
      const dayNames = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];
      // เดือนภาษาไทย
      const monthNames = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 
                         'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
      
      const dayName = dayNames[date.getDay()];
      const day = date.getDate().toString().padStart(2, '0');
      const monthName = monthNames[date.getMonth()];
      const year = date.getFullYear() + 543; // แปลงเป็น พ.ศ.
      
      const result = `${dayName} ${day} ${monthName} ${year}`;
      console.log('🗓️ TripDetail formatDate Thai result:', result);
      return result;
    } else {
      // แสดงวันที่ภาษาอังกฤษ
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const dayName = dayNames[date.getDay()];
      
      const result = `${dayName}, ${date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })}`;
      console.log('🗓️ TripDetail formatDate English result:', result);
      return result;
    }
  };


  const calculateDiscountedPrice = (price) => {
    if (!price || isNaN(price)) return "N/A"; // ตรวจสอบว่าราคาถูกต้องไหม
    const discountRate = parseFloat(customerData.discount / 100); // 5% = 5/100
    const discountedPrice = price * (1 - discountRate); // ลด 5%
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

  useEffect(() => {
    fetch(`${ipAddress}/timetable/${customerData.timeTableDepartId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        if (data && Array.isArray(data.data)) {
          settimetableDepart(data.data);
          updateCustomerData({
            international: data.data[0].md_timetable_international
          });
        } else {
          console.error('Data is not an array', data);
          settimetableDepart([]);
        }
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      }).finally(() => {
        setLoading(false);
      });
  }, []);

  const fetchTimetableReturn = () => {
    fetch(`${ipAddress}/timetable/${customerData.timeTableReturnId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        if (data && Array.isArray(data.data)) {
          settimetableReturn(data.data);
        } else {
          console.error('Data is not an array', data);
          settimetableReturn([]);
        }
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      }).finally(() => {
        setLoading(false);  // ตั้งค่า loading เป็น false หลังจากทำงานเสร็จ
      });
  };

  useEffect(() => {

    if (customerData.roud === 2) {
      fetchTimetableReturn();
      fetchPickupData();
      fetchPickupDataReturn();
      fetchDropoffData();
      fetchDropoffDataReturn();

    }
    if (!pickupDepart) {
      setpickupPriceDepart(0);
      setSelectedPickupDepart("");
       
    }

      if (!pickupReturn) {
      setpickupPriceReturn(0);
      setSelectedPickupReturn("");
      }


    if (pickupDepart && customerData.pickupDepartId !== "") {
      setSelectedPickupDepart(customerData.pickupDepartId);
    
    

    }

    if (pickupReturn && customerData.pickupReturnId !== "") {
      setSelectedPickupReturn(customerData.pickupReturnId);

    }


    if (!dropoffDepart) {
      setDropoffPriceDepart(0);
      setSelectedDropoffDepart("");
    }

    if (!dropoffReturn) {
      setDropoffPriceReturn(0);
      setSelectedDropoffReturn("");
       

    }

    if (dropoffDepart && customerData.dropoffDepartId !== "") {
      setSelectedDropoffDepart(customerData.dropoffDepartId);

    }

    if (dropoffReturn && customerData.dropoffReturnId !== "") {
      setSelectedDropoffReturn(customerData.dropoffReturnId);

    }



  }, [pickupDepart, pickupReturn, selectedPickupReturn, selectedDropoffDepart, selectedDropoffReturn, selectedPickupDepart, dropoffDepart, dropoffReturn, customerData.roud, customerData.companyDepartId, customerData.companyReturnId, customerData.pierStartReturntId, customerData.pierEndDepartId, customerData.pierEndReturntId, selectedTranSportDropoffReturn, selectedTranSportPickupReturn, customerData.timeTableReturnId]);


  useEffect(() => {
    fetchPriceferry();


  }, [selectedPickupDepart, selectedDropoffDepart, selectedPickupReturn, selectedDropoffReturn, customerData]);

  const fetchPriceferry = async () => {
    try {
      // console.log({
      //   currency: customerData.currency,
      //   roundtrip: customerData.roud,
      //   departtrip: customerData.timeTableDepartId,
      //   returntrip: customerData.timeTableReturnId,
      //   adult: customerData.adult,
      //   child: customerData.child,
      //   infant: customerData.infant,
      //   departdate: customerData.departdate,
      //   returndate: customerData.returndate,
      //   pickupdepart1: selectedPickupDepart,
      //   dropoffdepart1: selectedDropoffDepart,
      //   pickupdepart2: selectedPickupReturn,
      //   dropoffdepart2: selectedDropoffReturn,
      // });

      const response = await axios.post(
        'https://thetrago.com/api/V1/ferry/Getprice',
        {
          currency: customerData.currency,
          roundtrip: customerData.roud,
          departtrip: customerData.timeTableDepartId,
          returntrip: customerData.timeTableReturnId,
          adult: customerData.adult,
          child: customerData.child,
          infant: customerData.infant,
          departdate: customerData.departdate,
          returndate: customerData.returndate,
          pickupdepart1: selectedPickupDepart === "0" ? "" : selectedPickupDepart,
          pickupdepart2: selectedPickupReturn === "0" ? "" : selectedPickupReturn,
          dropoffdepart1: selectedDropoffDepart === "0" ? "" : selectedDropoffDepart,
          dropoffdepart2: selectedDropoffReturn === "0" ? "" : selectedDropoffReturn,
          paymentfee: 0


        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.status === 'success') {

        setPriceDepart(Array.isArray(response.data.data)
          ? response.data.data
          : [response.data.data]); // บังคับให้เป็น array

        setPriceReturn(Array.isArray(response.data.data.totalReturn)
          ? response.data.data.totalReturn
          : [response.data.data.totalReturn]); // บังคับให้เป็น array

      } else {
        setError('ไม่สามารถโหลดข้อมูลได้');
      }
    } catch (err) {
      console.error("❌ API Error:", err.response?.data || err.message);
      setPriceDepart([]);
      setPriceReturn([]);
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ API');
    } finally {
      setLoading(false);
    }
  };



  useEffect(() => {
    if (timetableDepart.length > 0) {
      setSaleadultDepart(timetableDepart[0].md_timetable_saleadult * customerData.exchaneRate);
      setSalechildDepart(timetableDepart[0].md_timetable_salechild * customerData.exchaneRate);
      setSaleinfantDepart(timetableDepart[0].md_timetable_saleinfant * customerData.exchaneRate);
      setAdultPriceDepart((timetableDepart[0].md_timetable_saleadult * customerData.exchaneRate) * customerData.adult);
      setChildPriceDepart((timetableDepart[0].md_timetable_salechild * customerData.exchaneRate) * customerData.child);
      setinfantPriceDepart((timetableDepart[0].md_timetable_saleinfant * customerData.exchaneRate) * customerData.infant);
      setTotalAdultDepart(formatNumberWithComma(adultPriceDepart));
      setTotalChildDepart(formatNumberWithComma(childPriceDepart));
      setTotalInfantDepart(formatNumberWithComma(infantPriceDepart));
      setSubtotalDepart((parseFloat(dropoffPriceDepart)) + (parseFloat(pickupPriceDepart)) + parseFloat((calculateDiscountedPrice(adultPriceDepart + childPriceDepart + infantPriceDepart))));
      setDiscountDepart(formatNumberWithComma((adultPriceDepart + childPriceDepart + infantPriceDepart) - (calculateDiscountedPrice(adultPriceDepart + childPriceDepart + infantPriceDepart))));
      setTotal(parseFloat(subtotalDepart));

    }
    if (customerData.roud === 2 && timetableReturn.length > 0) {
      {
        setSaleadultReturn(timetableReturn[0].md_timetable_saleadult);
        setSalechildReturn(timetableReturn[0].md_timetable_salechild);
        setSaleinfantReturn(timetableReturn[0].md_timetable_saleinfant);
        setAdultPriceReturn(timetableReturn[0].md_timetable_saleadult * customerData.adult);
        setChildPriceReturn(timetableReturn[0].md_timetable_salechild * customerData.child);
        setinfantPriceReturn(timetableReturn[0].md_timetable_saleinfant * customerData.infant);
    
        setTotalAdultReturn(formatNumberWithComma(adultPriceReturn));
        setTotalChildReturn(formatNumberWithComma(childPriceReturn));
        setTotalInfantReturn(formatNumberWithComma(infantPriceReturn));
        setSubtotalReturn((parseFloat(dropoffPriceReturn)) + (parseFloat(pickupPriceReturn)) + parseFloat((calculateDiscountedPrice(adultPriceReturn + childPriceReturn + infantPriceReturn))));
        setDiscountReturn(formatNumberWithComma((adultPriceReturn + childPriceReturn + infantPriceReturn) - (calculateDiscountedPrice(adultPriceReturn + childPriceDepart + infantPriceReturn))));
        setTotal(parseFloat(subtotalDepart) + parseFloat(subtotalReturn));
      }
    }


  }, [customerData.roud, timetableReturn, timetableDepart, customerData.adult, customerData.child, adultPriceDepart, adultPriceReturn, childPriceDepart, childPriceReturn, infantPriceDepart, infantPriceReturn, pickupPriceDepart, pickupPriceReturn, dropoffPriceDepart, dropoffPriceReturn, subtotalDepart, subtotalReturn]);

  // Premium Animation Initialization - เหมือนหน้า SearchFerry
  useEffect(() => {
    // Premium entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        delay: 300,
        easing: Easing.bezier(0.175, 0.885, 0.32, 1.275),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1200,
        delay: 500,
        easing: Easing.bezier(0.68, -0.55, 0.265, 1.55),
        useNativeDriver: true,
      }),
    ]).start();

    // Floating particles animation
    floatingAnims.forEach((anim, index) => {
      const animateParticle = () => {
        Animated.loop(
          Animated.parallel([
            Animated.sequence([
              Animated.timing(anim.y, {
                toValue: -50,
                duration: 4000 + index * 400,
                easing: Easing.inOut(Easing.sin),
                useNativeDriver: true,
              }),
              Animated.timing(anim.y, {
                toValue: screenHeight * 0.8,
                duration: 0,
                useNativeDriver: true,
              }),
            ]),
            Animated.sequence([
              Animated.timing(anim.opacity, {
                toValue: 0.3,
                duration: 2000,
                useNativeDriver: true,
              }),
              Animated.timing(anim.opacity, {
                toValue: 0.1,
                duration: 2000,
                useNativeDriver: true,
              }),
            ]),
            Animated.loop(
              Animated.sequence([
                Animated.timing(anim.scale, {
                  toValue: 1.2,
                  duration: 2500,
                  easing: Easing.inOut(Easing.sin),
                  useNativeDriver: true,
                }),
                Animated.timing(anim.scale, {
                  toValue: 0.8,
                  duration: 2500,
                  easing: Easing.inOut(Easing.sin),
                  useNativeDriver: true,
                }),
              ])
            ),
          ])
        ).start();
      };
      
      setTimeout(() => animateParticle(), index * 500);
    });

    // Continuous pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Shimmer animation for loading skeleton
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: screenWidth + 100,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  useEffect(() => {
    fetch(`${ipAddress}/pickup/${customerData.companyDepartId}/${customerData.pierStartDepartId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        if (data && Array.isArray(data.data)) {
          setTranSportDepartPickup(data.data);
        } else {
          console.error('Data is not an array', data);
          setTranSportDepartPickup([]);
        }
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }, [customerData.companyDepartId, customerData.pierStartDepartId]);

  const fetchPickupData = async () => {
    try {
      const response = await fetch(`${ipAddress}/pickup/${customerData.companyReturnId}/${customerData.pierStartReturntId}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      if (data && Array.isArray(data.data)) {
        setTranSportReturnPickup(data.data);
      } else {
        console.error('Data is not an array', data);
        setTranSportReturnPickup([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  useEffect(() => {
    fetch(`${ipAddress}/pickup/${customerData.companyDepartId}/${customerData.pierStartDepartId}/${selectedTranSportPickupDepart}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        if (data && Array.isArray(data.data)) {
          setPickupAreaDepart(data.data);
        } else {
          console.error('Data is not an array', data);
          setPickupAreaDepart([]);
        }
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }, [customerData.companyDepartId, customerData.pierStartDepartId, selectedTranSportPickupDepart]);

  const fetchPickupDataReturn = async () => {
    try {
      const response = await fetch(
        `${ipAddress}/pickup/${customerData.companyReturnId}/${customerData.pierStartReturntId}/${selectedTranSportPickupReturn}`
      );
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      if (data && Array.isArray(data.data)) {
        setPickupAreaReturn(data.data);
      } else {
        console.error('Data is not an array', data);
        setPickupAreaReturn([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };


  useEffect(() => {
    fetch(`${ipAddress}/dropoff/${customerData.companyDepartId}/${customerData.pierEndDepartId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        if (data && Array.isArray(data.data)) {
          setTranSportDropoffDepart(data.data);
        } else {
          console.error('Data is not an array', data);
          setTranSportDropoffDepart([]);
        }
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }, [customerData.companyDepartId, customerData.pierStartDepartId]);


  const fetchDropoffData = async () => {
    try {
      const response = await fetch(
        `${ipAddress}/dropoff/${customerData.companyReturnId}/${customerData.pierEndReturntId}`
      );
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      if (data && Array.isArray(data.data)) {
        setTranSportDropoffReturn(data.data);
      } else {
        console.error('Data is not an array', data);
        setTranSportDropoffReturn([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };


  useEffect(() => {
    fetch(`${ipAddress}/dropoff/${customerData.companyDepartId}/${customerData.pierEndDepartId}/${selectedTranSportDropoffDepart}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        if (data && Array.isArray(data.data)) {
          setDropoffAreaDepart(data.data);
        } else {
          console.error('Data is not an array', data);
          setDropoffAreaDepart([]);
        }
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }, [customerData.companyDepartId, customerData.pierEndDepartId, selectedTranSportDropoffDepart]);

  // Force re-render when language changes
  useEffect(() => {
    if (selectedLanguage) {
      console.log('🌐 TripDetail Language changed, forcing date format update:', selectedLanguage);
      // This will trigger re-render of components that display dates
    }
  }, [selectedLanguage]);

  const fetchDropoffDataReturn = async () => {
    try {
      const response = await fetch(`${ipAddress}/dropoff/${customerData.companyReturnId}/${customerData.pierEndReturntId}/${selectedTranSportDropoffReturn}`);

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();

      if (data && Array.isArray(data.data)) {
        setDropoffAreaReturn(data.data);
      } else {
        console.error('Data is not an array', data);
        setDropoffAreaReturn([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };


  const handleNext = (item) => {
    let newErrors = {};
    if (pickupDepart) {
      if (!HotelpickupDepart) newErrors.HotelpickupDepart = true;
      if (selectedTransportPickupDepartName === "Select Transport Type") newErrors.selectedTransportPickupDepartName = true;
    }
    if (dropoffDepart) {
      if (!HoteldropoffDepart) newErrors.HoteldropoffDepart = true;
    }
    if (pickupReturn) {
      if (!HotelpickupReturn) newErrors.HotelpickupReturn = true;
    }
    if (dropoffReturn) {
      if (!HoteldropoffReturn) newErrors.HoteldropoffReturn = true;
    }

    updateCustomerData({
      totaladultDepart: parseFloat(item.totalDepart.priceadult).toFixed(2) * customerData.adult, //รวมราคาจำนวนผู้ใหญ่
      totalchildDepart: parseFloat(item.totalDepart.pricechild).toFixed(2) * customerData.child, //รวมราคาจำนวนเด็ก
      totalinfantDepart: parseFloat(item.totalDepart.priceinfant).toFixed(2) * customerData.infant, //รวมราคาจำนวนเด็ก
      discountDepart: parseFloat(item.totalDepart.discount).toFixed(2), //ส่วนลด
      subtotalDepart: parseFloat(item.totalDepart.showtotal).toFixed(2), //ราคารวม
      pickupPriceDepart: parseFloat(item.totalDepart.pricepickupdepart).toFixed(2), //ราคารวมรับ
      dropoffPriceDepart: parseFloat(item.totalDepart.pricedropoffdepart).toFixed(2), //ราคารวมส่ง
      total: parseFloat(item.total).toFixed(2), //ราคารวมทั้งหมด

    });

    if (customerData.roud === 2) {
      updateCustomerData({
        totaladultReturn: parseFloat(item.totalReturn.priceadult).toFixed(2) * customerData.adult, //รวมราคาจำนวนผู้ใหญ่
        totalchildReturn: parseFloat(item.totalReturn.pricechild).toFixed(2) * customerData.child, //รวมราคาจำนวนเด็ก
        totalinfantReturn: parseFloat(item.totalReturn.priceinfant).toFixed(2) * customerData.infant, //รวมราคาจำนวนเด็ก
        discountReturn: parseFloat(item.totalReturn.discount).toFixed(2), //ส่วนลด
        subtotalReturn: parseFloat(item.totalReturn.showtotal).toFixed(2), //ราคารวม
        pickupPriceReturn: parseFloat(item.totalReturn.pricepickupdepart).toFixed(2), //ราคารวมรับ
        dropoffPriceReturn: parseFloat(item.totalReturn.pricedropoffdepart).toFixed(2), //ราคารวมส่ง
      });
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors); // Update the errors state

      // Show an alert if there are missing fields or invalid email
      if (newErrors.email) {
        Alert.alert(t('invalidEmail') || 'Invalid Email', t('pleaseEnterValidEmail') || 'Please enter a valid email address.', [
          { text: t('ok') || 'OK', onPress: () => console.log('OK Pressed') }
        ]);
      } else {
        Alert.alert(t('incompleteInformation') || 'Incomplete Information', t('pleaseFillAllRequiredFields') || 'Please fill in all required fields.', [
          { text: t('ok') || 'OK', onPress: () => console.log('OK Pressed') }
        ]);
      }

      return;
    }




    // หากไม่มีข้อผิดพลาด ให้ไปหน้าถัดไป
    navigation.navigate('CustomerInfo', {
      timeTableDepartId: customerData.timeTableDepartId,
      departDateTimeTable: customerData.departdate,
      totalAdult: adultPriceDepart,
      totalChild: childPriceDepart
    });
  };




  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" backgroundColor="#FD501E" />
      {/* Premium Gradient Background */}
      <LinearGradient
        colors={['#001233', '#002A5C', '#FD501E']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1.2 }}
        style={{ flex: 1 }}
      >
        {/* Floating Particles Background - เหมือนหน้า SearchFerry */}
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 0,
          pointerEvents: 'none',
        }}>
          {floatingAnims.map((anim, index) => (
            <Animated.View
              key={index}
              style={[
                {
                  position: 'absolute',
                  width: 8,
                  height: 8,
                  backgroundColor: '#FD501E',
                  borderRadius: 4,
                },
                {
                  transform: [
                    { translateX: anim.x },
                    { translateY: anim.y },
                    { scale: anim.scale },
                  ],
                  opacity: anim.opacity,
                },
              ]}
            />
          ))}
        </View>

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
          </View>
        </LinearGradient>

        {/* Enhanced Title Section */}
        <View style={{
          marginTop: hp('1%'),
          marginHorizontal: wp('6%'),
          marginBottom: hp('2%'),
          paddingHorizontal: wp('4%'),
          paddingVertical: hp('1.5%'),
          backgroundColor: 'rgba(255,255,255,0.1)',
          borderRadius: wp('4%'),
          backdropFilter: 'blur(10px)',
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.2)',
          position: 'relative',
        }}>
          {/* Floating decorative elements */}
          <Animated.View 
            style={[
              {
                position: 'absolute',
                top: -10,
                right: 20,
                zIndex: 1,
              },
              { 
                transform: [{
                  rotate: pulseAnim.interpolate({
                    inputRange: [1, 1.05],
                    outputRange: ['0deg', '180deg'],
                  })
                }]
              }
            ]}
          >
            <MaterialIcons name="directions-boat" size={20} color="rgba(255,255,255,0.3)" />
          </Animated.View>

          <Animated.View 
            style={[
              {
                position: 'absolute',
                bottom: -5,
                left: 30,
                zIndex: 1,
              },
              { 
                transform: [{
                  rotate: pulseAnim.interpolate({
                    inputRange: [1, 1.05],
                    outputRange: ['0deg', '-90deg'],
                  })
                }]
              }
            ]}
          >
            <MaterialIcons name="waves" size={16} color="rgba(255,255,255,0.2)" />
          </Animated.View>

          <Text style={{
            color: '#FFFFFF',
            fontSize: wp('7%'),
            fontWeight: '800',
            letterSpacing: -0.5,
            textAlign: 'center',
            lineHeight: wp('8%'),
            textShadowColor: 'rgba(0,0,0,0.3)',
            textShadowRadius: 4,
            textShadowOffset: { width: 1, height: 1 },
          }}>
            {t('shuttleTransfer') || 'Shuttle Transfer'}
          </Text>
          <Text style={{
            color: 'rgba(255,255,255,0.8)',
            fontSize: wp('3.5%'),
            fontWeight: '500',
            textAlign: 'center',
            marginTop: hp('0.5%'),
            letterSpacing: 0.3,
            textShadowColor: 'rgba(0,0,0,0.2)',
            textShadowRadius: 2,
          }}>
            {t('completeYourTripDetails') || 'Complete your trip details'}
          </Text>
        </View>

        {/* Main Content with Animations */}
        <Animated.View
          style={[
            { flex: 1 },
            {
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { scale: scaleAnim },
              ],
            },
          ]}
        >
          <ScrollView 
            contentContainerStyle={[
              styles.container,
              {
                backgroundColor: 'transparent',
                paddingHorizontal: 24,
                paddingTop: 8,
                paddingBottom: hp('12%'),
                flexGrow: 1,
              }
            ]}
            showsVerticalScrollIndicator={false}
            style={{ flex: 1 }}
            contentInsetAdjustmentBehavior="automatic"
          >
          {/* Step Component */}
          <View style={{
            alignItems: 'center',
            marginTop: hp('1%'),
            marginBottom: hp('2%'),
          }}>
            <Step logoUri={1} />
          </View>

          {loading && (
            <Animated.View style={[
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              }
            ]}>
              {/* Enhanced Ultra Premium Loading Skeleton */}
              <View style={{ paddingHorizontal: wp('2%') }}>
                {/* Enhanced Booking Section Skeleton */}
                <View style={{
                  width: '100%',
                  marginTop: hp('2%'),
                  marginBottom: hp('2%'),
                  backgroundColor: 'rgba(255,255,255,0.95)',
                  borderRadius: wp('6%'),
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
                        backgroundColor: '#e0e0e0',
                        marginRight: wp('3%')
                      }} />
                      <View style={{ flex: 1 }}>
                        <View style={{
                          width: '60%',
                          height: hp('1.5%'),
                          backgroundColor: '#e5e5e5',
                          borderRadius: hp('0.75%'),
                          marginBottom: hp('0.5%')
                        }} />
                        <View style={{
                          width: '40%',
                          height: hp('1.2%'),
                          backgroundColor: '#e0e0e0',
                          borderRadius: hp('0.6%')
                        }} />
                      </View>
                    </View>
                    <View style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginBottom: hp('1%')
                    }}>
                      <View style={{
                        width: wp('8%'),
                        height: wp('8%'),
                        borderRadius: wp('4%'),
                        backgroundColor: '#e0e0e0',
                        marginRight: wp('3%')
                      }} />
                      <View style={{ flex: 1 }}>
                        <View style={{
                          width: '70%',
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

                  {/* Passenger Selection Skeleton */}
                  <View style={{
                    width: '100%',
                    height: hp('7%'),
                    borderRadius: wp('3%'),
                    backgroundColor: '#f0f0f0',
                    overflow: 'hidden',
                    marginBottom: hp('1.5%'),
                  }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', padding: wp('3%') }}>
                      <View style={{
                        width: wp('6%'),
                        height: wp('6%'),
                        borderRadius: wp('3%'),
                        backgroundColor: '#e0e0e0',
                        marginRight: wp('3%')
                      }} />
                      <View style={{
                        width: '65%',
                        height: hp('2%'),
                        backgroundColor: '#e5e5e5',
                        borderRadius: hp('1%')
                      }} />
                    </View>
                    <Animated.View style={{ width: wp('40%'), height: '100%', position: 'absolute', transform: [{ translateX: shimmerAnim }] }}>
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
                    marginBottom: hp('2%'),
                  }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', padding: wp('3%') }}>
                      <View style={{
                        width: wp('6%'),
                        height: wp('6%'),
                        borderRadius: wp('3%'),
                        backgroundColor: '#e0e0e0',
                        marginRight: wp('3%')
                      }} />
                      <View style={{
                        width: '70%',
                        height: hp('2%'),
                        backgroundColor: '#e5e5e5',
                        borderRadius: hp('1%')
                      }} />
                    </View>
                    <Animated.View style={{ width: wp('40%'), height: '100%', position: 'absolute', transform: [{ translateX: shimmerAnim }] }}>
                      <LinearGradient colors={['#f0f0f000', '#d0d0d0aa', '#f0f0f000']} start={[0, 0]} end={[1, 0]} style={{ width: '100%', height: '100%' }} />
                    </Animated.View>
                  </View>
                </View>

                {/* Enhanced Ferry Cards Skeleton */}
                {Array(2).fill(0).map((_, idx) => (
                  <View key={idx} style={{
                    marginTop: hp('2%'),
                    minHeight: hp('25%'),
                    backgroundColor: 'rgba(255,255,255,0.95)',
                    borderRadius: wp('6%'),
                    overflow: 'hidden',
                    width: '100%',
                    borderWidth: wp('0.2%'),
                    borderColor: 'rgba(0,35,72,0.05)',
                    shadowColor: '#001233',
                    shadowOpacity: 0.08,
                    shadowRadius: wp('3%'),
                    elevation: 8,
                    position: 'relative',
                  }}>
                    {/* Card Header Skeleton */}
                    <View style={{
                      height: hp('8%'),
                      backgroundColor: '#FD501E',
                      borderTopLeftRadius: wp('6%'),
                      borderTopRightRadius: wp('6%'),
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingHorizontal: wp('4%'),
                      justifyContent: 'space-between',
                    }}>
                      <View style={{
                        width: '60%',
                        height: hp('2.5%'),
                        backgroundColor: 'rgba(255,255,255,0.3)',
                        borderRadius: hp('1.25%')
                      }} />
                      <View style={{ flexDirection: 'row', gap: wp('1.5%') }}>
                        <View style={{
                          width: wp('12%'),
                          height: hp('2.5%'),
                          backgroundColor: 'rgba(255,255,255,0.3)',
                          borderRadius: hp('1.25%')
                        }} />
                        <View style={{
                          width: wp('15%'),
                          height: hp('2.5%'),
                          backgroundColor: 'rgba(255,255,255,0.3)',
                          borderRadius: hp('1.25%')
                        }} />
                      </View>
                      <Animated.View style={{ width: wp('60%'), height: '100%', position: 'absolute', transform: [{ translateX: shimmerAnim }] }}>
                        <LinearGradient colors={['#f0f0f000', '#d5d5d5aa', '#f0f0f000']} start={[0, 0]} end={[1, 0]} style={{ width: '100%', height: '100%' }} />
                      </Animated.View>
                    </View>

                    {/* Card Body Skeleton */}
                    <View style={{ padding: wp('4%') }}>
                      {/* Trip Info Skeleton */}
                      <View style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: hp('2%')
                      }}>
                        <View style={{ alignItems: 'center' }}>
                          <View style={{
                            width: wp('15%'),
                            height: hp('3%'),
                            backgroundColor: '#e0e0e0',
                            borderRadius: hp('1.5%'),
                            marginBottom: hp('0.5%')
                          }} />
                          <View style={{
                            width: wp('12%'),
                            height: hp('1.5%'),
                            backgroundColor: '#e5e5e5',
                            borderRadius: hp('0.75%')
                          }} />
                        </View>
                        
                        {/* Line Skeleton */}
                        <View style={{
                          width: wp('20%'),
                          height: hp('0.3%'),
                          backgroundColor: '#e0e0e0',
                          borderRadius: hp('0.15%')
                        }} />
                        
                        <View style={{ alignItems: 'center' }}>
                          <View style={{
                            width: wp('15%'),
                            height: hp('3%'),
                            backgroundColor: '#e0e0e0',
                            borderRadius: hp('1.5%'),
                            marginBottom: hp('0.5%')
                          }} />
                          <View style={{
                            width: wp('12%'),
                            height: hp('1.5%'),
                            backgroundColor: '#e5e5e5',
                            borderRadius: hp('0.75%')
                          }} />
                        </View>
                      </View>

                      {/* Price Skeleton */}
                      <View style={{ alignItems: 'center', marginBottom: hp('2%') }}>
                        <View style={{
                          width: wp('25%'),
                          height: hp('3%'),
                          backgroundColor: '#e0e0e0',
                          borderRadius: hp('1.5%'),
                          marginBottom: hp('0.5%')
                        }} />
                        <View style={{
                          width: wp('20%'),
                          height: hp('1.5%'),
                          backgroundColor: '#e5e5e5',
                          borderRadius: hp('0.75%')
                        }} />
                      </View>

                      {/* Action Button Skeleton */}
                      <View style={{
                        width: '100%',
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
                ))}

                {/* Enhanced Central Loading Animation */}
                <View style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginVertical: hp('5%'),
                  paddingVertical: hp('4%'),
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
                  marginHorizontal: wp('4%')
                }}>
                  {/* Animated Loading Icon */}
                  <Animated.View style={{
                    transform: [
                      { scale: pulseAnim },
                      {
                        rotate: pulseAnim.interpolate({
                          inputRange: [1, 1.05],
                          outputRange: ['0deg', '10deg'],
                        })
                      }
                    ]
                  }}>
                    <MaterialIcons name="directions-boat" size={60} color="#FD501E" />
                  </Animated.View>
                  
                  <Text style={{
                    marginTop: 24,
                    color: '#1E293B',
                    fontWeight: '800',
                    fontSize: 18,
                    letterSpacing: -0.3,
                    textAlign: 'center'
                  }}>
                    {t('loadingTripDetails') || 'Loading Trip Details...'}
                  </Text>
                  <Text style={{
                    marginTop: 8,
                    color: '#64748B',
                    fontWeight: '500',
                    fontSize: 14,
                    textAlign: 'center',
                    lineHeight: 20,
                  }}>
                    {t('preparingBestOptions') || 'Preparing the best options for your journey'}
                  </Text>
                </View>
              </View>
            </Animated.View>
          )}
          {!loading && timetableDepart && timetableReturn && (
            <Animated.View style={[
              {
                opacity: fadeAnim,
                transform: [
                  { translateY: slideAnim },
                  { scale: scaleAnim },
                ],
              },
            ]}>
              {
                timetableDepart.map((item) => (

                  <View key={item.md_timetable_id} style={[
                    styles.cardContainer,
                    {
                      marginTop: 24,
                      backgroundColor: 'rgba(255,255,255,0.98)',
                      borderWidth: 1,
                      borderColor: 'rgba(253,80,30,0.10)',
                      borderRadius: 24,
                      padding: 0,
                      overflow: 'visible',
                      position: 'relative',
                    },
                  ]}>
                    {/* หัวตั๋ว */}
                    <View style={{
                      backgroundColor: '#FD501E',
                      borderTopLeftRadius: 24,
                      borderTopRightRadius: 24,
                      paddingVertical: 20,
                      paddingHorizontal: 22,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      position: 'relative',
                    }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Image
                          source={{ uri: `https://thetrago.com/Api/uploads/company/${item.md_company_picname}` }}
                          style={{ width: wp('10.6%'), height: hp('5%'), borderRadius: 12, backgroundColor: '#fff', borderWidth: 1, borderColor: '#eee', marginRight: 10 }}
                          resizeMode="cover"
                        />
                        <View style={styles.coltitle}>
                          <Text
                            style={{
                              color: '#fff',
                              fontWeight: 'bold',
                              fontSize: 18,
                              maxWidth: wp('20%'),
                              overflow: 'hidden',
                              flexWrap: 'wrap', // ให้ขึ้นบรรทัดใหม่ถ้ายาว
                            }}
                          >
                            {selectedLanguage === 'th' ? item.md_company_namethai : item.md_company_nameeng}
                          </Text>
                          <Text
                            style={{
                              color: '#fff',
                              fontSize: 12,
                              maxWidth: wp('30%'),
                              overflow: 'hidden',
                              flexWrap: 'wrap', // ให้ขึ้นบรรทัดใหม่ถ้ายาว
                            }}
                          >{formatTimeToHoursAndMinutes(item.md_timetable_time)}</Text>
                        </View>
                      </View>
                      <View style={{ flexDirection: 'row', gap: 6 }}>
                        <Text style={[styles.tag, { backgroundColor: '#fff', color: '#FD501E', fontWeight: 'bold', fontSize: 13 }]}>{selectedLanguage === 'th' ? item.md_seat_namethai : item.md_seat_nameeng}</Text>
                        <Text style={[styles.tag, { backgroundColor: '#fff', color: '#FD501E', fontWeight: 'bold', fontSize: 13 }]}>{tripType}</Text>
                      </View>
                    </View>
                    {/* <ImageBackground
                      source={{ uri: 'https://www.thetrago.com/assets/images/bg/ticketmap.webp' }}
                      style={styles.background}> */}
                    {/* Trip Details */}
                    <View style={styles.tripInfo}>
                      <View style={styles.col}>
                        <Text style={styles.time}>{formatTime(item.md_timetable_departuretime)}</Text>
                        <Text style={styles.date}>{formatDate(customerData.departdate)}</Text>
                      </View>
                      <View style={styles.col}>
                        <View style={[styles.circle, { backgroundColor: '#FD501E', width: 25, height: 25 }]} />
                        <Image source={require('./assets/Line 14.png')}
                          style={styles.line}
                        />
                      </View>
                      <View style={styles.col}>
                        <Text style={styles.location}>{selectedLanguage === 'th' ? item.startingpoint_namethai : item.startingpoint_nameeng}</Text>
                        <Text style={styles.ship}>{selectedLanguage === 'th' ? item.startpier_namethai : item.startpier_nameeng}</Text>
                      </View>
                    </View>

                    <View style={styles.tripInfo}>
                      <View style={styles.col} />
                      <View style={styles.col}>
                        <View style={styles.orangeCircleIcon}>
                          <Icon name="boat" size={24} color="#fff" />
                        </View>

                        <Image source={require('./assets/Line 14.png')}
                          style={styles.line} />
                      </View>
                      <View style={styles.col}>
                        <Text style={styles.ship}>{formatTimeToHoursAndMinutes(item.md_timetable_time)}</Text>
                        <Text style={styles.orangetext}>{selectedLanguage === 'th' ? item.md_boattype_namethai : item.md_boattype_nameeng}</Text>
                      </View>
                    </View>
                    <View style={styles.tripInfo}>
                      <View style={styles.col}>
                        <Text style={styles.time}>{formatTime(item.md_timetable_arrivaltime)}</Text>
                        <Text style={styles.date}>{formatDate(customerData.departdate)}</Text>
                      </View>
                      <View style={styles.col}>
                        <View style={[styles.orangeCircleIcon, { backgroundColor: '#FFF3ED' }]}>
                          <MaterialIcons name="location-on" size={wp('6%')} color="#FD501E" />
                        </View>
                      </View>
                      <View style={styles.col}>
                        <Text style={styles.location}>{selectedLanguage === 'th' ? item.endpoint_namethai : item.endpoint_nameeng}</Text>
                        <Text style={styles.ship}>{selectedLanguage === 'th' ? item.endpier_namethai : item.endpier_nameeng}</Text>
                      </View>
                    </View>

                    {item.md_location_airport === 1 && (
                      <>
                        <Text style={styles.inputLabel}>{t('flightNumber') || 'Flight Number'}</Text>
                        <TextInput style={styles.input} />
                        <Text style={styles.inputLabel}>{t('arriveTime') || 'Arrive Time'}</Text>
                        <View style={styles.inputRow}>
                          <View style={styles.buttonSelect}>
                            <TouchableOpacity style={styles.button} onPress={pickuptoggleHourtModalDepart}>
                              <Text style={styles.ArriveText}>{pickuphourDepart}</Text>
                              <Icon name="chevron-down" size={20} color="#FD501E" style={styles.dropdownIcon} />
                            </TouchableOpacity>

                            {/* Adult Modal */}
                            <Modal
                              visible={ispickupHourModalVisibleDepart}
                              transparent={true}
                              animationType="fade"
                              onRequestClose={pickuptoggleHourtModalDepart}
                            >
                              <View style={styles.modalOverlay}>
                                <View style={styles.modalContent}>
                                  <FlatList
                                    data={HourOption}
                                    renderItem={pickuprenderHourOptionDepart}
                                    keyExtractor={(item, index) => index.toString()}  // Use index as key
                                  />
                                </View>
                              </View>
                            </Modal>
                            <TouchableOpacity style={styles.button} onPress={pickuptoggleMinuteModalDepart}>
                              <Text style={styles.ArriveText}>{pickupminutesDepart} </Text>
                              <Icon name="chevron-down" size={20} color="#FD501E" style={styles.dropdownIcon} />
                            </TouchableOpacity>

                            {/* Child Modal */}
                            <Modal
                              visible={ispickupMinuteModalVisibleDepart}
                              transparent={true}
                              animationType="fade"
                              onRequestClose={pickuptoggleMinuteModalDepart}
                            >
                              <View style={styles.modalOverlay}>
                                <View style={styles.modalContent}>
                                  <FlatList
                                    data={minuteOption}
                                    renderItem={pickuprenderMinuteOptionDepart}
                                    keyExtractor={(item, index) => index.toString()}  // Use index as key
                                  />
                                </View>
                              </View>
                            </Modal>
                          </View>
                        </View>
                      </>

                    )}

                    {/* Pickup Section */}
                    {Array.isArray(TranSportDepartPickup) && TranSportDepartPickup.length > 0 ? (
                      <View style={styles.section}>
                        <TouchableOpacity onPress={() => setpickupDepart(!pickupDepart)} style={styles.checkboxContainer}>
                          <MaterialIcons name={pickupDepart ? "check-box" : "check-box-outline-blank"} size={24} color="#FD501E" />
                          <Text style={styles.label}>{t('iNeedAPickUp') || 'I need a pick up'}</Text>
                        </TouchableOpacity>

                        {pickupDepart && (
                          <View>
                            <Text style={styles.inputLabel}>{t('transportType') || 'Transport type'}</Text>
                            {/* Button ที่คลิกเพื่อเปิด Modal */}


                            <TouchableOpacity
                              style={[styles.buttonSelect, errors.selectedTransportPickupDepartName && styles.errorInput]}
                              onPress={toggleModalTransportPickupDepart}
                            >
                              <Text style={styles.buttonText}>{selectedTransportPickupDepartName}</Text>
                              <Icon name="chevron-down" size={18} color="#FD501E" style={styles.icon} />
                            </TouchableOpacity>


                            {/* Modal for title selection */}
                            <Modal visible={isModalTransportDepartPickupVisible} transparent animationType="fade" onRequestClose={toggleModalTransportPickupDepart}>
                              <View style={styles.modalOverlay}>
                                <View style={styles.modalContentPre}>
                                  <FlatList
                                    data={[{ md_cartype_nameeng: t('selectTransportType') || 'Select Transport Type', md_pickup_cartypeid: '0' }, ...TranSportDepartPickup]}
                                    renderItem={({ item }) => (
                                      <TouchableOpacity style={styles.optionItem} onPress={() => handleSelectedTranSportPickupDepart(item)}>
                                        <Text style={styles.optionText}>{item.md_cartype_nameeng}</Text>
                                      </TouchableOpacity>
                                    )}

                                    keyExtractor={(item, index) => index.toString()}
                                    initialNumToRender={5}
                                    maxToRenderPerBatch={5}
                                    windowSize={5}
                                    pagingEnabled
                                  />
                                </View>
                              </View>
                            </Modal>



                            <Text style={styles.inputLabel}>{t('pickUpArea') || 'Pick up area'}</Text>
                            <TouchableOpacity onPress={toggleModalPickupDepart} style={[styles.buttonSelect, errors.selectedTransportPickupDepartName && styles.errorInput]}>
                              <Text style={styles.buttonText}>{selectedPickupDepartName}</Text>
                              <Icon name="chevron-down" size={18} color="#FD501E" style={styles.icon} />
                            </TouchableOpacity>

                            <Modal visible={isModalDepartPickupVisible} transparent animationType="fade" onRequestClose={toggleModalPickupDepart}>
                              <View style={styles.modalOverlay}>
                                <View style={styles.modalContentPre}>
                                  <FlatList
                                    data={[{ md_pickup_id: "0", md_transfer_nameeng: t('pleaseSelect') || "Please Select" }, ...pickupAreaDepart]}
                                    renderItem={({ item }) => (
                                      <TouchableOpacity style={styles.optionItem} onPress={() => handleSelectPickupDepart(item)}>
                                        <Text style={styles.optionText}>{item.md_transfer_nameeng}</Text>
                                      </TouchableOpacity>
                                    )}
                                    keyExtractor={(item, index) => index.toString()}
                                  />
                                </View>
                              </View>
                            </Modal>
                            {airPortPickupDepart === 1 && (

                              <>
                                <Text style={styles.inputLabel}>{t('flightNumber') || 'Flight Number'}</Text>
                                <TextInput style={styles.input} />
                                <Text style={styles.inputLabel}>{t('arriveTime') || 'Arrive Time'}</Text>
                                <View style={styles.inputRow}>
                                  <View style={styles.buttonSelect}>
                                    <TouchableOpacity style={styles.button} onPress={pickuptoggleHourtModalDepart}>
                                      <Text style={styles.ArriveText}>{pickuphourDepart}</Text>
                                      <Icon name="chevron-down" size={20} color="#FD501E" style={styles.dropdownIcon} />
                                    </TouchableOpacity>

                                    {/* Adult Modal */}
                                    <Modal
                                      visible={ispickupHourModalVisibleDepart}
                                      transparent={true}
                                      animationType="fade"
                                      onRequestClose={pickuptoggleHourtModalDepart}
                                    >
                                      <View style={styles.modalOverlay}>
                                        <View style={styles.modalContent}>
                                          <FlatList
                                            data={HourOption}
                                            renderItem={pickuprenderHourOptionDepart}
                                            keyExtractor={(item) => item.toString()}
                                          />
                                        </View>
                                      </View>
                                    </Modal>
                                    <TouchableOpacity style={styles.button} onPress={pickuptoggleMinuteModalDepart}>
                                      <Text style={styles.ArriveText}>{pickupminutesDepart} </Text>
                                      <Icon name="chevron-down" size={20} color="#FD501E" style={styles.dropdownIcon} />
                                    </TouchableOpacity>

                                    {/* Child Modal */}
                                    <Modal
                                      visible={ispickupMinuteModalVisibleDepart}
                                      transparent={true}
                                      animationType="fade"
                                      onRequestClose={pickuptoggleMinuteModalDepart}
                                    >
                                      <View style={styles.modalOverlay}>
                                        <View style={styles.modalContent}>
                                          <FlatList
                                            data={minuteOption}
                                            renderItem={pickuprenderMinuteOptionDepart}
                                            keyExtractor={(item) => item.toString()}
                                          />
                                        </View>
                                      </View>
                                    </Modal>
                                  </View>
                                </View>
                              </>

                            )}



                            <Text style={styles.inputLabel}>{t('hotelPickUpPoint') || 'Hotel / Pick up point'}</Text>
                            <TextInput
                              placeholder={t('inputHotelPickUpPoint') || "Input Hotel / Pick up point"}
                              value={HotelpickupDepart}
                              onChangeText={(text) => {
                                setHotelpickupDepart(text);
                                setErrors((prev) => ({ ...prev, HotelpickupDepart: false }));
                              }}
                              style={[styles.input, errors.HotelpickupDepart && styles.errorInput]} // ใช้สีแดงเมื่อมีข้อผิดพลาด
                            />
                          </View>
                        )}
                      </View>
                    ) : (
                      <Text></Text>
                    )}



                    {/* Dropoff Section */}
                    {Array.isArray(TranSportDropoffDepart) && TranSportDropoffDepart.length > 0 ? (
                      <View style={styles.section}>
                        <TouchableOpacity onPress={() => setDropoffDepart(!dropoffDepart)} style={styles.checkboxContainer}>
                          <MaterialIcons name={dropoffDepart ? "check-box" : "check-box-outline-blank"} size={24} color="#FD501E" />
                          <Text style={styles.label}>{t('iNeedADropOff') || 'I need a drop off'}</Text>
                        </TouchableOpacity>

                        {dropoffDepart && (
                          <View>
                            <Text style={styles.inputLabel}>{t('transportType') || 'Transport type'}</Text>
                            <TouchableOpacity
                              style={[styles.buttonSelect, errors.selectedTransportDropoffDepartName && styles.errorInput]}
                              onPress={toggleModalTransportDropoffDepart}
                            >
                              <Text style={styles.buttonText}>{selectedTransportDropoffDepartName}</Text>
                              <Icon name="chevron-down" size={18} color="#FD501E" style={styles.icon} />
                            </TouchableOpacity>


                            {/* Modal for title selection */}
                            <Modal visible={isModalTransportDepartDropoffVisible} transparent animationType="fade" onRequestClose={toggleModalTransportDropoffDepart}>
                              <View style={styles.modalOverlay}>
                                <View style={styles.modalContentPre}>
                                  <FlatList
                                    data={[{ md_cartype_nameeng: 'Select Transport Type', md_pickup_cartypeid: '0' }, ...TranSportDropoffDepart]}
                                    renderItem={({ item }) => (
                                      <TouchableOpacity style={styles.optionItem} onPress={() => handleSelectedTranSportDropoffDepart(item)}>
                                        <Text style={styles.optionText}>{item.md_cartype_nameeng}</Text>
                                      </TouchableOpacity>
                                    )}

                                    keyExtractor={(item, index) => index.toString()}
                                    initialNumToRender={5}
                                    maxToRenderPerBatch={5}
                                    windowSize={5}
                                    pagingEnabled
                                  />
                                </View>
                              </View>
                            </Modal>


                            <Text style={styles.inputLabel}>{t('dropOffArea') || 'Drop off area'}</Text>
                            <TouchableOpacity onPress={toggleModalDropoffDepart} style={styles.buttonSelect}>
                              <Text style={styles.buttonText}>{selectedDropoffDepartName}</Text>
                              <Icon name="chevron-down" size={18} color="#FD501E" style={styles.icon} />
                            </TouchableOpacity>

                            <Modal visible={isModalDepartDropoffVisible} transparent animationType="fade" onRequestClose={toggleModalDropoffDepart}>
                              <View style={styles.modalOverlay}>
                                <View style={styles.modalContentPre}>
                                  <FlatList
                                    data={[{ md_dropoff_id: "0", md_transfer_nameeng: t('pleaseSelect') || "Please Select" }, ...DropoffAreaDepart]}
                                    renderItem={({ item }) => (
                                      <TouchableOpacity style={styles.optionItem} onPress={() => handleSelectDropoffDepart(item)}>
                                        <Text style={styles.optionText}>{item.md_transfer_nameeng}</Text>
                                      </TouchableOpacity>
                                    )}
                                    keyExtractor={(item, index) => index.toString()}
                                  />
                                </View>
                              </View>
                            </Modal>
                            {airPortDropoffDepart === 1 && (
                              <>
                                <Text style={styles.inputLabel}>Filght Number</Text>
                                <TextInput style={styles.input} />
                                <Text style={styles.inputLabel}>Arrive Time</Text>
                                <View style={styles.inputRow}>
                                  <View style={styles.buttonSelect}>
                                    <TouchableOpacity style={styles.button} onPress={dropofftoggleHourtModalDepart}>
                                      <Text style={styles.ArriveText}>{dropoffhourDepart}</Text>
                                      <Icon name="chevron-down" size={20} color="#FD501E" style={styles.dropdownIcon} />
                                    </TouchableOpacity>

                                    {/* Hour Modal */}
                                    <Modal
                                      visible={isdropoffHourModalVisibleDepart}
                                      transparent={true}
                                      animationType="fade"
                                      onRequestClose={dropofftoggleHourtModalDepart}
                                    >
                                      <View style={styles.modalOverlay}>
                                        <View style={styles.modalContent}>
                                          <FlatList
                                            data={HourOption}
                                            renderItem={dropoffrenderHourOptionDepart}
                                            keyExtractor={(item) => item.toString()}  // Use item as key
                                          />
                                        </View>
                                      </View>
                                    </Modal>
                                    <TouchableOpacity style={styles.button} onPress={dropofftoggleMinuteModalDepart}>
                                      <Text style={styles.ArriveText}>{dropoffminutesDepart} </Text>
                                      <Icon name="chevron-down" size={20} color="#FD501E" style={styles.dropdownIcon} />
                                    </TouchableOpacity>

                                    {/* Minute Modal */}
                                    <Modal
                                      visible={isdropoffMinuteModalVisibleDepart}
                                      transparent={true}
                                      animationType="fade"
                                      onRequestClose={dropofftoggleMinuteModalDepart}
                                    >
                                      <View style={styles.modalOverlay}>
                                        <View style={styles.modalContent}>
                                          <FlatList
                                            data={minuteOption}
                                            renderItem={dropoffrenderMinuteOptionDepart}
                                            keyExtractor={(item) => item.toString()}  // Use item as key
                                          />
                                        </View>
                                      </View>
                                    </Modal>
                                  </View>
                                </View>
                              </>
                            )}


                            <Text style={styles.inputLabel}>{t('hotelDropOffPoint') || 'Hotel / Drop off point'}</Text>
                            <TextInput
                              placeholder={t('inputHotelDropOffPoint') || "Input Hotel / Drop off point"}
                              value={HoteldropoffDepart}
                              onChangeText={(text) => {
                                setHoteldropoffDepart(text);
                                setErrors((prev) => ({ ...prev, HoteldropoffDepart: false }));
                              }}
                              style={[styles.input, errors.HoteldropoffDepart && styles.errorInput]} // ใช้สีแดงเมื่อมีข้อผิดพลาด
                            />
                          </View>
                        )}
                      </View>
                    ) : (
                      <Text></Text>
                    )}


                    {/* <View style={styles.TicketRow}>
                      <View style={styles.circleContainerLeft}>
                        <View style={styles.circleLeft1}></View>
                        <View style={styles.circleLeft2}></View>
                      </View>
                      <View style={styles.dashedLineTicket} />
                      <View style={styles.circleContainerRight}>
                        <View style={styles.circleRight1}></View>
                        <View style={styles.circleRight2}></View>
                      </View>
                    </View> */}
                    {/* </ImageBackground> */}
                  </View>
                ))
              }

              {customerData.roud === 2 && (
                <>
                  {timetableReturn.map((item) => (
                    <View key={item.md_timetable_id} style={[
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
                        paddingVertical: 20,
                        paddingHorizontal: 22,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        position: 'relative',
                      }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Image
                            source={{ uri: `https://thetrago.com/Api/uploads/company/${item.md_company_picname}` }}
                            style={{ width: wp('10.6%'), height: hp('5%'), borderRadius: 12, backgroundColor: '#fff', borderWidth: 1, borderColor: '#eee', marginRight: 10 }}
                            resizeMode="cover"
                          />
                          <View style={styles.coltitle}>
                            <Text
                              style={{
                                color: '#fff',
                                fontWeight: 'bold',
                                fontSize: 18,
                                maxWidth: wp('20%'),
                                overflow: 'hidden',
                                flexWrap: 'wrap', // ให้ขึ้นบรรทัดใหม่ถ้ายาว
                              }}
                            >
                              {selectedLanguage === 'th' ? item.md_company_namethai : item.md_company_nameeng}
                            </Text>
                            <Text
                              style={{
                                color: '#fff',
                                fontSize: 12,
                                maxWidth: wp('30%'),
                                overflow: 'hidden',
                                flexWrap: 'wrap', // ให้ขึ้นบรรทัดใหม่ถ้ายาว
                              }}
                            >{formatTimeToHoursAndMinutes(item.md_timetable_time)}</Text>
                          </View>
                        </View>
                        <View style={{ flexDirection: 'row', gap: 6 }}>
                          <Text style={[styles.tag, { backgroundColor: '#fff', color: '#FD501E', fontWeight: 'bold', fontSize: 13 }]}>{selectedLanguage === 'th' ? item.md_seat_namethai : item.md_seat_nameeng}</Text>
                          <Text style={[styles.tag, { backgroundColor: '#fff', color: '#FD501E', fontWeight: 'bold', fontSize: 13 }]}>{tripType}</Text>
                        </View>
                      </View>

                      {/* Trip Details */}
                      <View style={styles.tripInfo}>
                        <View style={styles.col}>
                          <Text style={styles.time}>{formatTime(item.md_timetable_departuretime)}</Text>
                          <Text style={styles.date}>{formatDate(customerData.returndate)}</Text>
                        </View>
                        <View style={styles.col}>
                          <View style={[styles.circle, { backgroundColor: '#FD501E', width: 25, height: 25 }]} />
                          <Image source={require('./assets/Line 14.png')}
                            style={styles.line}
                          />
                        </View>
                        <View style={styles.col}>
                          <Text style={styles.location}>{selectedLanguage === 'th' ? item.startingpoint_namethai : item.startingpoint_nameeng}</Text>
                          <Text style={styles.ship}>{selectedLanguage === 'th' ? item.startpier_namethai : item.startpier_nameeng}</Text>
                        </View>
                      </View>

                      <View style={styles.tripInfo}>
                        <View style={styles.col} />
                        <View style={styles.col}>
                          <View style={styles.orangeCircleIcon}>
                            <Icon name="boat" size={24} color="#fff" />
                          </View>

                          <Image source={require('./assets/Line 14.png')}
                            style={styles.line} />
                        </View>
                        <View style={styles.col}>
                          <Text style={styles.ship}>{formatTimeToHoursAndMinutes(item.md_timetable_time)}</Text>
                          <Text style={styles.orangetext}>{selectedLanguage === 'th' ? item.md_boattype_namethai : item.md_boattype_nameeng}</Text>
                        </View>
                      </View>
                      <View style={styles.tripInfo}>
                        <View style={styles.col}>
                          <Text style={styles.time}>{formatTime(item.md_timetable_arrivaltime)}</Text>
                          <Text style={styles.date}>{formatDate(customerData.returndate)}</Text>
                        </View>
                        <View style={styles.col}>
                          <View style={[styles.orangeCircleIcon, { backgroundColor: '#FFF3ED' }]}>
                            <MaterialIcons name="location-on" size={wp('6%')} color="#FD501E" />
                          </View>
                        </View>
                        <View style={styles.col}>
                          <Text style={styles.location}>{selectedLanguage === 'th' ? item.endpoint_namethai : item.endpoint_nameeng}</Text>
                          <Text style={styles.ship}>{selectedLanguage === 'th' ? item.endpier_namethai : item.endpier_nameeng}</Text>
                        </View>
                      </View>


                      {item.md_location_airport === 1 && (
                        <>
                          <Text style={styles.inputLabel}>Filght Number</Text>
                          <TextInput style={styles.input} />
                          <Text style={styles.inputLabel}>Arrive Time</Text>
                          <View style={styles.inputRow}>
                            <View style={styles.buttonSelect}>
                              <TouchableOpacity style={styles.button} onPress={pickuptoggleHourtModalReturn}>
                                <Text style={styles.ArriveText}>{pickuphourReturn}</Text>
                                <Icon name="chevron-down" size={20} color="#FD501E" style={styles.dropdownIcon} />
                              </TouchableOpacity>

                              {/* Adult Modal */}
                              <Modal
                                visible={ispickupHourModalVisibleReturn}
                                transparent={true}
                                animationType="fade"
                                onRequestClose={pickuptoggleHourtModalReturn}
                              >
                                <View style={styles.modalOverlay}>
                                  <View style={styles.modalContent}>
                                    <FlatList
                                      data={HourOption}
                                      renderItem={pickuprenderHourOptionReturn}
                                      keyExtractor={(item, index) => index.toString()}  // Use index as key
                                    />
                                  </View>
                                </View>
                              </Modal>
                              <TouchableOpacity style={styles.button} onPress={pickuptoggleMinuteModalReturn}>
                                <Text style={styles.ArriveText}>{pickupminutesreturn} </Text>
                                <Icon name="chevron-down" size={20} color="#FD501E" style={styles.dropdownIcon} />
                              </TouchableOpacity>

                              {/* Child Modal */}
                              <Modal
                                visible={ispickupMinuteModalVisibleReturn}
                                transparent={true}
                                animationType="fade"
                                onRequestClose={pickuptoggleMinuteModalReturn}
                              >
                                <View style={styles.modalOverlay}>
                                  <View style={styles.modalContent}>
                                    <FlatList
                                      data={minuteOption}
                                      renderItem={pickuprenderMinuteOptionReturn}
                                      keyExtractor={(item, index) => index.toString()}  // Use index as key
                                    />
                                  </View>
                                </View>
                              </Modal>
                            </View>
                          </View>
                        </>

                      )}

                      {/* Pickup Section */}
                      {Array.isArray(TranSportReturnPickup) && TranSportReturnPickup.length > 0 ? (
                        <View style={styles.section}>
                          <TouchableOpacity onPress={() => setpickupReturn(!pickupReturn)} style={styles.checkboxContainer}>
                            <MaterialIcons name={pickupReturn ? "check-box" : "check-box-outline-blank"} size={24} color="#FD501E" />
                            <Text style={styles.label}>I need a pick up</Text>
                          </TouchableOpacity>

                          {pickupReturn && (
                            <View>
                              <Text style={styles.inputLabel}>Transport type</Text>
                              {/* Button ที่คลิกเพื่อเปิด Modal */}

                              <TouchableOpacity
                                style={[styles.buttonSelect, errors.selectedTranSportPickupReturn && styles.errorInput]}
                                onPress={toggleModalTransportPickupReturn}
                              >
                                <Text style={styles.buttonText}>{selectedTransportPickupReturnName}</Text>
                                <Icon name="chevron-down" size={18} color="#FD501E" style={styles.icon} />
                              </TouchableOpacity>


                              {/* Modal for title selection */}
                              <Modal visible={isModalTransportReturnPickupVisible} transparent animationType="fade" onRequestClose={toggleModalTransportPickupReturn}>
                                <View style={styles.modalOverlay}>
                                  <View style={styles.modalContentPre}>
                                    <FlatList
                                      data={[{ md_cartype_nameeng: 'Select Transport Type', md_pickup_cartypeid: '0' }, ...TranSportReturnPickup]}
                                      renderItem={({ item }) => (
                                        <TouchableOpacity style={styles.optionItem} onPress={() => handleSelectedTranSportPickupReturn(item)}>
                                          <Text style={styles.optionText}>{item.md_cartype_nameeng}</Text>
                                        </TouchableOpacity>
                                      )}

                                      keyExtractor={(item, index) => index.toString()}
                                      initialNumToRender={5}
                                      maxToRenderPerBatch={5}
                                      windowSize={5}
                                      pagingEnabled
                                    />
                                  </View>
                                </View>
                              </Modal>

                              <Text style={styles.inputLabel}>Pick up area</Text>
                              <TouchableOpacity onPress={toggleModalPickupReturn}     style={[styles.buttonSelect, errors.selectedTransportPickupDepartName && styles.errorInput]}>
                                <Text style={styles.buttonText}>{selectedPickupReturnName}</Text>
                                <Icon name="chevron-down" size={18} color="#FD501E" style={styles.icon} />
                              </TouchableOpacity>

                              <Modal visible={isModalReturnPickupVisible} transparent animationType="fade" onRequestClose={toggleModalPickupReturn}>
                                <View style={styles.modalOverlay}>
                                  <View style={styles.modalContentPre}>
                                    <FlatList
                                      data={[{ md_pickup_id: "0", md_transfer_nameeng: "Please Select" }, ...pickupAreaReturn]}
                                      renderItem={({ item }) => (
                                        <TouchableOpacity style={styles.optionItem} onPress={() => handleSelectPickupReturn(item)}>
                                          <Text style={styles.optionText}>{item.md_transfer_nameeng}</Text>
                                        </TouchableOpacity>
                                      )}
                                      keyExtractor={(item, index) => index.toString()}
                                    />
                                  </View>
                                </View>
                              </Modal>
                              {airPortPickupReturn === 1 && (

                                <>
                                  <Text style={styles.inputLabel}>Filght Number</Text>
                                  <TextInput style={styles.input} />
                                  <Text style={styles.inputLabel}>Arrive Time</Text>
                                  <View style={styles.inputRow}>
                                    <View style={styles.buttonSelect}>
                                      <TouchableOpacity style={styles.button} onPress={pickuptoggleHourtModalReturn}>
                                        <Text style={styles.ArriveText}>{pickuphourReturn}</Text>
                                        <Icon name="chevron-down" size={20} color="#FD501E" style={styles.dropdownIcon} />
                                      </TouchableOpacity>

                                      {/* Adult Modal */}
                                      <Modal
                                        visible={ispickupHourModalVisibleReturn}
                                        transparent={true}
                                        animationType="fade"
                                        onRequestClose={pickuptoggleHourtModalReturn}
                                      >
                                        <View style={styles.modalOverlay}>
                                          <View style={styles.modalContent}>
                                            <FlatList
                                              data={HourOption}
                                              renderItem={pickuprenderHourOptionReturn}
                                              keyExtractor={(item) => item.toString()}
                                            />
                                          </View>
                                        </View>
                                      </Modal>
                                      <TouchableOpacity style={styles.button} onPress={pickuptoggleMinuteModalReturn}>
                                        <Text style={styles.ArriveText}>{pickupminutesreturn} </Text>
                                        <Icon name="chevron-down" size={20} color="#FD501E" style={styles.dropdownIcon} />
                                      </TouchableOpacity>

                                      {/* Child Modal */}
                                      <Modal
                                        visible={ispickupMinuteModalVisibleReturn}
                                        transparent={true}
                                        animationType="fade"
                                        onRequestClose={pickuptoggleMinuteModalReturn}
                                      >
                                        <View style={styles.modalOverlay}>
                                          <View style={styles.modalContent}>
                                            <FlatList
                                              data={minuteOption}
                                              renderItem={pickuprenderMinuteOptionReturn}
                                              keyExtractor={(item) => item.toString()}
                                            />
                                          </View>
                                        </View>
                                      </Modal>
                                    </View>
                                  </View>
                                </>

                              )}



                              <Text style={styles.inputLabel}>Hotel / Pick up point</Text>
                              <TextInput
                                placeholder="Input Hotel / Pick up point"
                                value={HotelpickupReturn}
                                onChangeText={(text) => {
                                  setHotelpickupReturn(text);
                                  setErrors((prev) => ({ ...prev, HotelpickupReturn: false }));
                                }}
                                style={[styles.input, errors.HotelpickupReturn && styles.errorInput]} // ใช้สีแดงเมื่อมีข้อผิดพลาด
                              />
                            </View>
                          )}
                        </View>
                      ) : (
                        <Text></Text>
                      )}



                      {/* Dropoff Section */}
                      {Array.isArray(TranSportDropoffReturn) && TranSportDropoffReturn.length > 0 ? (
                        <View style={styles.section}>
                          <TouchableOpacity onPress={() => setDropoffReturn(!dropoffReturn)} style={styles.checkboxContainer}>
                            <MaterialIcons name={dropoffReturn ? "check-box" : "check-box-outline-blank"} size={24} color="#FD501E" />
                            <Text style={styles.label}>I need a drop off</Text>
                          </TouchableOpacity>

                          {dropoffReturn && (
                            <View>
                              <Text style={styles.inputLabel}>Transport type</Text>
                              <TouchableOpacity
                                style={[styles.buttonSelect, errors.selectedTransportDropoffReturn && styles.errorInput]}
                                onPress={toggleModalTransportDropoffReturn}
                              >
                                <Text style={styles.buttonText}>{selectedTransportDropoffReturnName}</Text>
                                <Icon name="chevron-down" size={18} color="#FD501E" style={styles.icon} />
                              </TouchableOpacity>


                              {/* Modal for title selection */}
                              <Modal visible={isModalTransportReturnDropoffVisible} transparent animationType="fade" onRequestClose={toggleModalTransportDropoffReturn}>
                                <View style={styles.modalOverlay}>
                                  <View style={styles.modalContentPre}>
                                    <FlatList
                                      data={[{ md_cartype_nameeng: 'Select Transport Type', md_pickup_cartypeid: '0' }, ...TranSportDropoffReturn]}
                                      renderItem={({ item }) => (
                                        <TouchableOpacity style={styles.optionItem} onPress={() => handleSelectedTranSportDropoffReturn(item)}>
                                          <Text style={styles.optionText}>{item.md_cartype_nameeng}</Text>
                                        </TouchableOpacity>
                                      )}

                                      keyExtractor={(item, index) => index.toString()}
                                      initialNumToRender={5}
                                      maxToRenderPerBatch={5}
                                      windowSize={5}
                                      pagingEnabled
                                    />
                                  </View>
                                </View>
                              </Modal>

                              <Text style={styles.inputLabel}>Drop off area</Text>
                              <TouchableOpacity onPress={toggleModalDropoffReturn} style={styles.buttonSelect}>
                                <Text style={styles.buttonText}>{selectedDropoffReturnName}</Text>
                                <Icon name="chevron-down" size={18} color="#FD501E" style={styles.icon} />
                              </TouchableOpacity>

                              <Modal visible={isModalReturnDropoffVisible} transparent animationType="fade" onRequestClose={toggleModalDropoffReturn}>
                                <View style={styles.modalOverlay}>
                                  <View style={styles.modalContentPre}>
                                    <FlatList
                                      data={[{ md_dropoff_id: "0", md_transfer_nameeng: "Please Select" }, ...DropoffAreaReturn]}
                                      renderItem={({ item }) => (
                                        <TouchableOpacity style={styles.optionItem} onPress={() => handleSelectDropoffReturn(item)}>
                                          <Text style={styles.optionText}>{item.md_transfer_nameeng}</Text>
                                        </TouchableOpacity>
                                      )}
                                      keyExtractor={(item, index) => index.toString()}
                                    />
                                  </View>
                                </View>
                              </Modal>
                              {airPortDropoffReturn === 1 && (
                                <>
                                  <Text style={styles.inputLabel}>Filght Number</Text>
                                  <TextInput style={styles.input} />
                                  <Text style={styles.inputLabel}>Arrive Time</Text>
                                  <View style={styles.inputRow}>
                                    <View style={styles.buttonSelect}>
                                      <TouchableOpacity style={styles.button} onPress={dropofftoggleHourtModalReturn}>
                                        <Text style={styles.ArriveText}>{dropoffhourReturn}</Text>
                                        <Icon name="chevron-down" size={20} color="#FD501E" style={styles.dropdownIcon} />
                                      </TouchableOpacity>

                                      {/* Hour Modal */}
                                      <Modal
                                        visible={isdropoffHourModalVisibleReturn}
                                        transparent={true}
                                        animationType="fade"
                                        onRequestClose={dropofftoggleHourtModalReturn}
                                      >
                                        <View style={styles.modalOverlay}>
                                          <View style={styles.modalContent}>
                                            <FlatList
                                              data={HourOption}
                                              renderItem={dropoffrenderHourOptionReturn}
                                              keyExtractor={(item) => item.toString()}  // Use item as key
                                            />
                                          </View>
                                        </View>
                                      </Modal>
                                      <TouchableOpacity style={styles.button} onPress={dropofftoggleMinuteModalReturn}>
                                        <Text style={styles.ArriveText}>{dropoffminutesReturn} </Text>
                                        <Icon name="chevron-down" size={20} color="#FD501E" style={styles.dropdownIcon} />
                                      </TouchableOpacity>

                                      {/* Minute Modal */}
                                      <Modal
                                        visible={isdropoffMinuteModalVisibleReturn}
                                        transparent={true}
                                        animationType="fade"
                                        onRequestClose={dropofftoggleMinuteModalReturn}
                                      >
                                        <View style={styles.modalOverlay}>
                                          <View style={styles.modalContent}>
                                            <FlatList
                                              data={minuteOption}
                                              renderItem={dropoffrenderMinuteOptionReturn}
                                              keyExtractor={(item) => item.toString()}  // Use item as key
                                            />
                                          </View>
                                        </View>
                                      </Modal>
                                    </View>
                                  </View>
                                </>
                              )}





                              <Text style={styles.inputLabel}>Hotel / Drop off point</Text>
                              <TextInput
                                placeholder="Input Hotel / Drop off point"
                                value={HoteldropoffReturn}
                                onChangeText={(text) => {
                                  setHoteldropoffReturn(text);
                                  setErrors((prev) => ({ ...prev, HoteldropoffReturn: false }));
                                }}
                                style={[styles.input, errors.HoteldropoffReturn && styles.errorInput]} // ใช้สีแดงเมื่อมีข้อผิดพลาด
                              />
                            </View>
                          )}
                        </View>
                      ) : (
                        <Text></Text>
                      )}


                      {/* <View style={styles.TicketRow}>
                        <View style={styles.circleContainerLeft}>
                          <View style={styles.circleLeft1}></View>
                          <View style={styles.circleLeft2}></View>
                        </View>
                        <View style={styles.dashedLineTicket} />
                        <View style={styles.circleContainerRight}>
                          <View style={styles.circleRight1}></View>
                          <View style={styles.circleRight2}></View>
                        </View>
                      </View> */}

                    </View>
                  ))}
                </>
              )}




              {Array.isArray(priceDepart) && priceDepart.map((item, index) => (
                <View key={index} style={[styles.promo, {
                  marginTop: 20,
                  backgroundColor: 'rgba(255,255,255,0.98)',
                  borderWidth: 1,
                  borderColor: 'rgba(253,80,30,0.10)',
                  borderRadius: 24,
                  padding: wp('4%'),
                  maxWidth: wp('100%'),
                  alignSelf: 'center',
                  overflow: 'visible',
                  position: 'relative',
                  shadowColor: '#001233',
                  shadowOpacity: 0.15,
                  shadowRadius: wp('4%'),
                  shadowOffset: { width: 0, height: hp('0.5%') },
                  backdropFilter: 'blur(20px)',
                }]}>
                  <Text style={{
                    color: '#1E293B',
                    fontSize: wp('5%'),
                    fontWeight: '800',
                    marginBottom: hp('2%'),
                    textAlign: 'left'
                  }}>{t('bookingSummary') || 'Booking Summary'}</Text>

                  <View style={styles.divider} />
                  
                  {timetableDepart.map((tripItem, tripIndex) => (
                    <View key={tripIndex}>
                      <Text style={{ fontWeight: '800', fontSize: wp('4.5%'), color: '#1E293B', marginBottom: hp('1%') }}>{t('depart') || 'Depart'}</Text>

                      <Text style={{ marginTop: 5, color: '#FD501E' }}>
                        {selectedLanguage === 'th' ? tripItem.startingpoint_namethai : tripItem.startingpoint_nameeng} <AntDesign name="arrowright" size={14} color="#FD501E" /> {selectedLanguage === 'th' ? tripItem.endpoint_namethai : tripItem.endpoint_nameeng}
                      </Text>
                      
                      <View style={styles.rowpromo}>
                        <Text style={{ color: '#6B7280', fontSize: wp('3.5%'), fontWeight: '500' }}>{t('company') || 'Company'}</Text>
                        <Text style={{ color: '#6B7280', fontSize: wp('3.5%'), fontWeight: '500' }}>{selectedLanguage === 'th' ? tripItem.md_company_namethai : tripItem.md_company_nameeng}</Text>
                      </View>
                      
                      <View style={styles.rowpromo}>
                        <Text style={{ color: '#6B7280', fontSize: wp('3.5%'), fontWeight: '500' }}>{t('seat') || 'Seat'}</Text>
                        <Text style={{ color: '#6B7280', fontSize: wp('3.5%'), fontWeight: '500' }}>{selectedLanguage === 'th' ? tripItem.md_seat_namethai : tripItem.md_seat_nameeng}</Text>
                      </View>
                      
                      <View style={styles.rowpromo}>
                        <Text style={{ color: '#6B7280', fontSize: wp('3.5%'), fontWeight: '500' }}>{t('boat') || 'Boat'}</Text>
                        <Text style={{ color: '#6B7280', fontSize: wp('3.5%'), fontWeight: '500' }}>{selectedLanguage === 'th' ? tripItem.md_boattype_namethai : tripItem.md_boattype_nameeng}</Text>
                      </View>
                      
                      <View style={styles.rowpromo}>
                        <Text style={{ color: '#6B7280', fontSize: wp('3.5%'), fontWeight: '500' }}>{t('departureDate') || 'Departure Date'}</Text>
                        <Text style={{ color: '#6B7280', fontSize: wp('3.5%'), fontWeight: '500' }}>{formatDate(customerData.departdate)}</Text>
                      </View>
                      
                      <View style={styles.rowpromo}>
                        <Text style={{ color: '#6B7280', fontSize: wp('3.5%'), fontWeight: '500' }}>{t('departureTime') || 'Departure Time'}</Text>
                        <Text style={{ color: '#6B7280', fontSize: wp('3.5%'), fontWeight: '500' }}>
                          {formatTime(tripItem.md_timetable_departuretime)} - {formatTime(tripItem.md_timetable_arrivaltime)} | {formatTimeToHoursAndMinutes(tripItem.md_timetable_time)}
                        </Text>
                      </View>

                      <View style={[styles.rowpromo, { marginTop: hp('1%') }]}>
                        <Text style={{ fontSize: wp('3.8%'), fontWeight: '600', color: '#374151' }}>{t('adult') || 'Adult'} x {customerData.adult}</Text>
                        <Text style={{ fontSize: wp('3.8%'), fontWeight: '600', color: '#374151' }}>{customerData.symbol} {formatNumberWithComma(parseFloat(item.totalDepart.priceadult).toFixed(2))}</Text>
                      </View>
                      
                      {customerData.child !== 0 && (
                        <View style={styles.rowpromo}>
                          <Text style={{ fontSize: wp('3.8%'), fontWeight: '600', color: '#374151' }}>{t('child') || 'Child'} x {customerData.child}</Text>
                          <Text style={{ fontSize: wp('3.8%'), fontWeight: '600', color: '#374151' }}>{customerData.symbol} {formatNumberWithComma(parseFloat(item.totalDepart.pricechild).toFixed(2))}</Text>
                        </View>
                      )}
                      
                      {customerData.infant !== 0 && (
                        <View style={styles.rowpromo}>
                          <Text style={{ fontSize: wp('3.8%'), fontWeight: '600', color: '#374151' }}>{t('infant') || 'Infant'} x {customerData.infant}</Text>
                          <Text style={{ fontSize: wp('3.8%'), fontWeight: '600', color: '#374151' }}>{customerData.symbol} {formatNumberWithComma(parseFloat(item.totalDepart.priceinfant).toFixed(2))}</Text>
                        </View>
                      )}
                      
                      {pickupDepart && (
                        <View style={styles.rowpromo}>
                          <Text>{t('pickUp') || 'Pick up'}</Text>
                          <Text style={{ color: 'green' }}>+ {customerData.symbol} {formatNumberWithComma(parseFloat(item.totalDepart.pricepickupdepart).toFixed(2))}</Text>
                        </View>
                      )}
                      
                      {dropoffDepart && (
                        <View style={styles.rowpromo}>
                          <Text>{t('dropOff') || 'Drop off'}</Text>
                          <Text style={{ color: 'green' }}>+ {customerData.symbol} {formatNumberWithComma(parseFloat(item.totalDepart.pricedropoffdepart).toFixed(2))}</Text>
                        </View>
                      )}
                      
                      {item.totalDepart.save != 0 && (
                        <View style={styles.rowpromo}>
                          <Text>{t('discount') || 'Discount'}</Text>
                          <Text style={styles.redText}>- {customerData.symbol} {formatNumberWithComma(parseFloat(item.totalDepart.discount).toFixed(2))}</Text>
                        </View>
                      )}
                      
                      <View style={styles.rowpromo}>
                        <Text>{t('ticketFare') || 'Ticket fare'}</Text>
                        <Text style={{ fontWeight: 'bold' }}>{customerData.symbol} {formatNumberWithComma(parseFloat(item.totalDepart.showtotal).toFixed(2))}</Text>
                      </View>

                      <View style={styles.divider} />
                    </View>
                  ))}

                  {customerData.roud === 2 && (
                    <>
                      {timetableReturn.map((tripItem, tripIndex) => (
                        <View key={tripIndex}>
                          <Text style={{ fontWeight: '800', fontSize: wp('4.5%'), color: '#1E293B', marginBottom: hp('1%') }}>{t('return') || 'Return'}</Text>
                          
                          <Text style={{ marginTop: 5, color: '#FD501E' }}>
                            {selectedLanguage === 'th' ? tripItem.startingpoint_namethai : tripItem.startingpoint_nameeng} <AntDesign name="arrowright" size={14} color="#FD501E" /> {selectedLanguage === 'th' ? tripItem.endpoint_namethai : tripItem.endpoint_nameeng}
                          </Text>
                          
                          <View style={styles.rowpromo}>
                            <Text style={{ color: '#6B7280', fontSize: wp('3.5%'), fontWeight: '500' }}>Company</Text>
                            <Text style={{ color: '#6B7280', fontSize: wp('3.5%'), fontWeight: '500' }}>{selectedLanguage === 'th' ? tripItem.md_company_namethai : tripItem.md_company_nameeng}</Text>
                          </View>
                          
                          <View style={styles.rowpromo}>
                            <Text style={{ color: '#6B7280', fontSize: wp('3.5%'), fontWeight: '500' }}>Seat</Text>
                            <Text style={{ color: '#6B7280', fontSize: wp('3.5%'), fontWeight: '500' }}>{selectedLanguage === 'th' ? tripItem.md_seat_namethai : tripItem.md_seat_nameeng}</Text>
                          </View>
                          
                          <View style={styles.rowpromo}>
                            <Text style={{ color: '#6B7280', fontSize: wp('3.5%'), fontWeight: '500' }}>Boat</Text>
                            <Text style={{ color: '#6B7280', fontSize: wp('3.5%'), fontWeight: '500' }}>{selectedLanguage === 'th' ? tripItem.md_boattype_namethai : tripItem.md_boattype_nameeng}</Text>
                          </View>
                          
                          <View style={styles.rowpromo}>
                            <Text style={{ color: '#6B7280', fontSize: wp('3.5%'), fontWeight: '500' }}>{t('returnDate') || 'Return Date'}</Text>
                            <Text style={{ color: '#6B7280', fontSize: wp('3.5%'), fontWeight: '500' }}>{formatDate(customerData.returndate)}</Text>
                          </View>
                          
                          <View style={styles.rowpromo}>
                            <Text style={{ color: '#6B7280', fontSize: wp('3.5%'), fontWeight: '500' }}>Departure Time</Text>
                            <Text style={{ color: '#6B7280', fontSize: wp('3.5%'), fontWeight: '500' }}>
                              {formatTime(tripItem.md_timetable_departuretime)} - {formatTime(tripItem.md_timetable_arrivaltime)} | {formatTimeToHoursAndMinutes(tripItem.md_timetable_time)}
                            </Text>
                          </View>

                          <View style={[styles.rowpromo, { marginTop: hp('1%') }]}>
                            <Text style={{ fontSize: wp('3.8%'), fontWeight: '600', color: '#374151' }}>Adult x {customerData.adult}</Text>
                            <Text style={{ fontSize: wp('3.8%'), fontWeight: '600', color: '#374151' }}>{customerData.symbol} {formatNumberWithComma(parseFloat(item.totalReturn.priceadult).toFixed(2))}</Text>
                          </View>
                          
                          {customerData.child !== 0 && (
                            <View style={styles.rowpromo}>
                              <Text style={{ fontSize: wp('3.8%'), fontWeight: '600', color: '#374151' }}>Child x {customerData.child}</Text>
                              <Text style={{ fontSize: wp('3.8%'), fontWeight: '600', color: '#374151' }}>{customerData.symbol} {formatNumberWithComma(parseFloat(item.totalReturn.pricechild).toFixed(2))}</Text>
                            </View>
                          )}
                          
                          {customerData.infant !== 0 && (
                            <View style={styles.rowpromo}>
                              <Text style={{ fontSize: wp('3.8%'), fontWeight: '600', color: '#374151' }}>Infant x {customerData.infant}</Text>
                              <Text style={{ fontSize: wp('3.8%'), fontWeight: '600', color: '#374151' }}>{customerData.symbol} {formatNumberWithComma(parseFloat(item.totalReturn.priceinfant).toFixed(2))}</Text>
                            </View>
                          )}
                          
                          {pickupReturn && (
                            <View style={styles.rowpromo}>
                              <Text>Pick up</Text>
                              <Text style={{ color: 'green' }}>+ {customerData.symbol} {formatNumberWithComma(parseFloat(item.totalReturn.pricepickupdepart).toFixed(2))}</Text>
                            </View>
                          )}
                          
                          {dropoffReturn && (
                            <View style={styles.rowpromo}>
                              <Text>Drop off</Text>
                              <Text style={{ color: 'green' }}>+ {customerData.symbol} {formatNumberWithComma(parseFloat(item.totalReturn.pricedropoffdepart).toFixed(2))}</Text>
                            </View>
                          )}
                          
                          {item.totalReturn.save != 0 && (
                            <View style={styles.rowpromo}>
                              <Text>Discount</Text>
                              <Text style={styles.redText}>- {customerData.symbol} {formatNumberWithComma(parseFloat(item.totalReturn.discount).toFixed(2))}</Text>
                            </View>
                          )}
                          
                          <View style={styles.rowpromo}>
                            <Text>Ticket fare</Text>
                            <Text style={{ fontWeight: 'bold' }}>{customerData.symbol} {formatNumberWithComma(parseFloat(item.totalReturn.showtotal).toFixed(2))}</Text>
                          </View>
                          
                          <View style={styles.divider} />
                        </View>
                      ))}
                    </>
                  )}

                  <View style={styles.rowpromo}>
                    <Text>{t('subtotal') || 'Subtotal'}</Text>
                    <Text>{customerData.symbol} {formatNumberWithComma(parseFloat(item.total).toFixed(2))}</Text>
                  </View>
                  <View style={styles.divider} />
                  <View style={styles.rowpromo}>
                    <Text style={{ color: '#FD501E', fontWeight: 'bold' }}>{t('total') || 'Total'}</Text>
                    <Text style={{ color: '#FD501E', fontWeight: 'bold' }}>{customerData.symbol} {formatNumberWithComma(parseFloat(item.total).toFixed(2))}</Text>
                  </View>
                </View>
              ))}
            </Animated.View>
          )}
          {Array.isArray(priceDepart) &&
            priceDepart
              .filter(item => item.totalDepart) // ป้องกัน undefined
              .map((item, index) => (
                <View key={index} style={styles.rowButton}>
                  <TouchableOpacity
                    style={[styles.ActionButton, { width: '100%' }]}
                    onPress={() => handleNext(item)}
                  >
                    <Text style={styles.searchButtonText}>{t('next') || 'Next'}</Text>
                  </TouchableOpacity>
                </View>
              ))}

        </ScrollView>
        </Animated.View>
      </LinearGradient>
    </SafeAreaView>

  );
};


const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingHorizontal: wp('2%'),
    paddingTop: hp('1%'),
    paddingBottom: hp('3%'),
  },
  logoContainer: {
    marginTop: 20,
    width: '100%',
    justifyContent: 'space-between',
    marginBottom: 20,
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
    backgroundColor: '#FFF',
    borderRadius: 30,
  },
  title: {
    fontSize: wp('6%'),
    fontWeight: '800',
    textAlign: 'center',
    color: '#FFFFFF',
    marginBottom: hp('2%'),
    marginTop: hp('2%'),
    letterSpacing: -0.5,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowRadius: 4,
    textShadowOffset: { width: 1, height: 1 },
  },


  bookingSection: {
    backgroundColor: '#F6F6F6',
    borderRadius: 30,
    padding: '6%',
    margin: '1.5%',
    width: '100%',
    marginBottom: 0,
    paddingBottom: 0,
    shadowColor: '#F6F6F6',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
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
    justifyContent: 'flex-start', // จัดตำแหน่งให้เนื้อหาภายในอยู่ตรงกลาง
  },
  inputBoxDrop: {
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
    justifyContent: 'space-between',
  },
  rowdepart: {
    flexDirection: 'row',
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
    fontSize: wp('3.5%'),
    color: '#64748B',
    marginTop: hp('1%'),
    marginBottom: hp('0.5%'),
    marginLeft: wp('3%'),
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  inputText: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
  },


  PxploreButton: {
    backgroundColor: '#FD501E',
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 10,
    width: '100%',
  },
  redText: {
    color: 'red'
  },
  margin: {
    marginTop: 5,
    marginBottom: 5,
    fontSize: 16
  },


  Detail: {
    color: '#666666',
    marginTop: 5,
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
  dropdownIcon: {
    color: '#FD501E', // Orange color for the icon
  },

  buttonText: {
    fontSize: 16,
    color: '#333',
    flexWrap: 'wrap',
    maxWidth: '80%',
  },
  dropdownIcon: {
    marginLeft: 40,

  },
  ArriveText: {
    fontSize: 16,
    color: '#333',
    //marginRight: wp('10%'),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 18, 51, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp('5%'),
    backdropFilter: 'blur(15px)',
  },
  modalContent: {
    backgroundColor: 'rgba(255,255,255,0.98)',
    width: '90%',
    maxWidth: wp('85%'),
    borderRadius: wp('6%'),
    padding: wp('5%'),
    maxHeight: hp('70%'),
    position: 'relative',
    overflow: 'hidden',
    // Unified cross-platform shadow
    shadowColor: '#FD501E',
    shadowOffset: { width: 0, height: hp('1%') },
    shadowOpacity: 0.2,
    shadowRadius: wp('4%'),
    elevation: 15,
    borderWidth: wp('0.2%'),
    borderColor: 'rgba(253, 80, 30, 0.12)',
  },
  modalOption: {
    paddingVertical: hp('1.8%'),
    paddingHorizontal: wp('4%'),
    borderBottomWidth: wp('0.1%'),
    borderBottomColor: 'rgba(148, 163, 184, 0.2)',
    marginHorizontal: wp('1%'),
    borderRadius: wp('2%'),
    marginVertical: hp('0.3%'),
    backgroundColor: 'rgba(255,255,255,0.6)',
    backdropFilter: 'blur(10px)',
    transition: 'all 0.2s ease-in-out',
  },
  modalOptionText: {
    fontSize: wp('4.2%'),
    color: '#1E293B',
    fontWeight: '600',
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  button: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
    // padding:  wp('1%'),
    width: '50%',
    marginRight: wp('1%'),

  },
  cardContainer: {
    backgroundColor: 'rgba(255,255,255,0.98)',
    borderRadius: wp('6%'),
    marginHorizontal: wp('4%'),
    marginTop: hp('2%'),
    marginBottom: hp('2%'),
    minHeight: hp('35%'),
    maxWidth: wp('92%'),
    alignSelf: 'center',
    overflow: 'visible',
    position: 'relative',
    // Unified cross-platform shadow
    shadowColor: '#FD501E',
    shadowOffset: { width: 0, height: hp('0.8%') },
    shadowOpacity: 0.15,
    shadowRadius: wp('3%'),
    elevation: 8,
    borderWidth: wp('0.2%'),
    borderColor: 'rgba(253, 80, 30, 0.08)',
  },
  promo: {
    backgroundColor: 'rgba(255,255,255,0.98)',
    borderRadius: wp('4%'),
    width: '100%',
    padding: wp('4%'),
    marginVertical: hp('1%'),
    marginHorizontal: wp('1%'),
    // Unified cross-platform shadow
    shadowColor: '#FD501E',
    shadowOffset: { width: 0, height: hp('0.5%') },
    shadowOpacity: 0.1,
    shadowRadius: wp('2%'),
    borderWidth: wp('0.1%'),
    borderColor: 'rgba(253, 80, 30, 0.06)',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp('1%'),
  },
  shipName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flexWrap: 'wrap',
    maxWidth: '100',
  },
  tagContainer: {
    flexDirection: 'row',

  },

  location: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#002348',
    flexWrap: 'wrap',
    maxWidth: 150,
  },

  time: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#002348',
    marginTop: 4,

  },



  TicketRow: {
    flexDirection: 'row',
    //justifyContent: 'space-between',
    alignItems: 'center',
  },


  dashedLineTicket: {
    width: '100%',
    height: 1,  // ความหนาของเส้น
    borderWidth: 2,  // ความหนาของเส้น
    borderColor: '#EAEAEA',  // สีของเส้นประ
    borderStyle: 'dashed',  // ทำให้เส้นเป็นประ
    marginVertical: 10,  // ระยะห่างระหว่าง element
  },
  circleContainerLeft: {
    position: 'relative', // ทำให้สามารถจัดตำแหน่งภายใน container ได้
    width: 40,
    height: 40,
    justifyContent: 'flex-start',// จัดตำแหน่งไอคอนให้อยู่ตรงกลาง
    alignItems: 'flex-start',  // จัดตำแหน่งไอคอนให้อยู่ตรงกลาง
    marginBottom: 10,  // ระยะห่างจากด้านล่าง
    marginLeft: -40,
    marginRight: 1,
  },
  circleLeft1: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 40,
    height: 40,
    backgroundColor: '#EAEAEA',
    borderRadius: 40, // ให้เป็นวงกลม
  },
  circleLeft2: {
    position: 'absolute',
    top: 0,
    left: -3,
    width: 40,
    height: 40,
    backgroundColor: 'white',
    borderRadius: 30, // ให้เป็นวงกลม
  },
  circleContainerRight: {
    position: 'relative', // ทำให้สามารถจัดตำแหน่งภายใน container ได้
    width: 40,
    height: 40,
    marginLeft: -3,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    marginBottom: 10,
    marginRight: -40,

  },
  circleRight1: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 40,
    height: 40,
    backgroundColor: '#EAEAEA',
    borderRadius: 40, // ให้เป็นวงกลม
  },
  circleRight2: {
    position: 'absolute',
    top: 0,
    left: 3,
    width: 40,
    height: 40,
    backgroundColor: 'white',
    borderRadius: 30, // ให้เป็นวงกลม
  },



  ImageLogo: {
    marginRight: 10
  },

  tagContainer: {
    flexDirection: 'row',
    marginTop: 5
  },
  tag: {
    backgroundColor: 'rgba(253, 80, 30, 0.1)',
    opacity: 50,
    color: '#FD501E',
    fontSize: 12,
    fontWeight: 'bold',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 30,
    marginLeft: 1,
    paddingRight: wp('2%'),
  },
  tripInfo: {
    alignItems: 'flex-start',
    marginBottom: 0,
    justifyContent: 'center',
    flexDirection: 'row',
    marginLeft: wp('5%'),
    marginRight: wp('5%'),
  },
  date: {
    fontSize: 12,
    color: '#666'
  },
  section: {
    marginBottom: 0,
    padding: 20,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  label: {
    fontSize: 16,
    marginLeft: 10
  },

  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 15,
    marginTop: 5,
    backgroundColor: 'white'
  },
  input: {
    borderWidth: wp('0.2%'),
    borderColor: 'rgba(148, 163, 184, 0.3)',
    borderRadius: wp('3%'),
    padding: wp('3.5%'),
    fontSize: wp('4%'),
    backgroundColor: 'rgba(255,255,255,0.95)',
    marginBottom: hp('1.5%'),
    marginHorizontal: wp('2.5%'),
    paddingVertical: hp('1.5%'),
    color: '#1E293B',
    fontWeight: '500',
    letterSpacing: 0.3,
    // Unified cross-platform shadow
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: hp('0.2%') },
    shadowOpacity: 0.06,
    shadowRadius: wp('1.5%'),
    elevation: 3,
  },
  timetable: {
    fontSize: 12,
  },
  col: {
    flexDirection: 'column',
    margin: wp('1%'),
    width: 110,
    // alignItems: 'center',
    padding: wp('3%'),
    alignItems: 'center',

  },
  ship: {
    fontSize: 12,
    color: '#666'
  },
  circle: {
    top: 20,
    left: 0,
    width: 15,
    height: 15,
    backgroundColor: '#EAEAEA',
    borderRadius: 40,
  },
  line: {
    alignItems: 'center',
    margin: 5,
    marginTop: 30,
    marginBottom: 0
  },
  orangetext: {
    color: '#FD501E'
  },
  titlehead: {
    fontSize: 16,
    fontWeight: 'bold',
    flexWrap: 'wrap',
    width: 100
  },
  TextInput: {
    fontSize: 18,
    fontWeight: 'bold'
    , margin: 5
  },
  totaltext: {
    fontSize: 18,
    color: '#FD501E',
  },
  rowpromo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pricetotal: {
    fontSize: 16,
  },

  pricperson: {
    fontSize: 25
  },
  background: {
    width: '100%',
  },
  divider: {
    height: 1, // ความหนาของเส้น
    width: '100%', // ทำให้ยาวเต็มจอ
    backgroundColor: '#CCCCCC', // สีของเส้น
    marginVertical: 10, // ระยะห่างระหว่าง element
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  tooltip: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    width: 200,
    alignItems: 'center',
  },
  tooltipText: {
    fontSize: 14,
    color: 'black',
  },
  rowButton: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row'
  },
  BackButton: {
    backgroundColor: 'rgba(148, 163, 184, 0.15)',
    paddingVertical: hp('2%'),
    borderRadius: wp('3%'),
    alignItems: 'center',
    marginTop: hp('1%'),
    width: '45%',
    marginBottom: hp('2%'),
    justifyContent: 'center',
    borderWidth: wp('0.1%'),
    borderColor: 'rgba(148, 163, 184, 0.2)',
    // Unified cross-platform shadow
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: hp('0.2%') },
    shadowOpacity: 0.08,
    shadowRadius: wp('1.5%'),
    elevation: 3,
  },
  BackButtonText: {
    color: '#64748B',
    fontWeight: '700',
    fontSize: wp('4%'),
    letterSpacing: 0.3,
  },
  ActionButton: {
    backgroundColor: '#FD501E',
    paddingVertical: hp('2%'),
    borderRadius: wp('3%'),
    alignItems: 'center',
    marginTop: hp('1%'),
    width: '45%',
    marginBottom: hp('4%'),
    justifyContent: 'center',
    borderWidth: wp('0.1%'),
    borderColor: 'rgba(255, 255, 255, 0.2)',
    // Unified cross-platform shadow
    shadowColor: '#FD501E',
    shadowOffset: { width: 0, height: hp('0.4%') },
    shadowOpacity: 0.25,
    shadowRadius: wp('2%'),
    elevation: 8,
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: wp('4%'),
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowRadius: 2,
  },
  errorInput: {
    borderColor: 'red', // เปลี่ยนกรอบเป็นสีแดงเมื่อมีข้อผิดพลาด
  },
  loaderContainer: {
    flex: 1, // ทำให้ View ครอบคลุมพื้นที่ทั้งหมด
    justifyContent: 'center', // จัดตำแหน่งแนวตั้งให้อยู่ตรงกลาง
    alignItems: 'center', // จัดตำแหน่งแนวนอนให้อยู่ตรงกลาง
  },
  modalContentPre: {
    backgroundColor: 'rgba(255,255,255,0.98)',
    width: '85%',
    borderRadius: wp('5%'),
    padding: wp('4%'),
    position: 'relative',
    overflow: 'hidden',
    borderWidth: wp('0.1%'),
    borderColor: 'rgba(253, 80, 30, 0.1)',
    // Unified cross-platform shadow
    shadowColor: '#FD501E',
    shadowOffset: { width: 0, height: hp('1%') },
    shadowOpacity: 0.15,
    shadowRadius: wp('4%'),
    elevation: 12,
  },
  icon: {
    marginLeft: 10,
  },
  buttonSelect: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingVertical: hp('1.5%'),
    paddingHorizontal: wp('4%'),
    borderWidth: wp('0.2%'),
    borderColor: 'rgba(148, 163, 184, 0.3)',
    borderRadius: wp('3%'),
    width: '95%',
    justifyContent: 'space-between',
    marginHorizontal: wp('2.5%'),
    marginVertical: hp('0.5%'),
    // Unified cross-platform shadow
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: hp('0.2%') },
    shadowOpacity: 0.06,
    shadowRadius: wp('1.5%'),
    elevation: 3,
  },
  optionItem: {
    paddingVertical: hp('1.5%'),
    paddingHorizontal: wp('4%'),
    borderBottomWidth: wp('0.1%'),
    borderBottomColor: 'rgba(148, 163, 184, 0.15)',
    marginHorizontal: wp('1%'),
    borderRadius: wp('2%'),
    marginVertical: hp('0.2%'),
    backgroundColor: 'rgba(255,255,255,0.7)',
    // Unified cross-platform shadow
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: hp('0.1%') },
    shadowOpacity: 0.04,
    shadowRadius: wp('0.8%'),
    elevation: 2,
  },
  optionText: {
    fontSize: wp('4%'),
    color: '#334155',
    fontWeight: '500',
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  orangeCircleIcon: {
    backgroundColor: '#FD501E',
    borderRadius: 50,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default TripDetail;
