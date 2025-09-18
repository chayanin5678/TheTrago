import  { useRef, useState, useEffect } from 'react';
import ipAddress from '../config/ipconfig';
import Icon from 'react-native-vector-icons/Ionicons';
import { View, Text, ScrollView, TouchableOpacity, Image, TextInput, Modal, FlatList, Alert, Dimensions, Platform, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { AntDesign } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LogoTheTrago from '../components/component/Logo';
import Step from '../components/component/Step'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useCustomer } from './Screen/CustomerContext';
import axios from 'axios';
import headStyles from '../styles/CSS/StartingPointScreenStyles';
import styles from '../styles/CSS/TripDetailStyles';
import { useLanguage } from './Screen/LanguageContext';

const isTablet = screenWidth >= 768;
const isLargeTablet = screenWidth >= 1024;
const getResponsiveSize = (phone, tablet, largeTablet) => {
  if (isLargeTablet && largeTablet) return largeTablet;
  if (isTablet && tablet) return tablet;
  return phone;
};

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const TripDetail = ({ navigation, route }) => {
  const { t, selectedLanguage } = useLanguage();
  const insets = useSafeAreaInsets();

  // Default translated labels (use these instead of hard-coded English literals)
  const defaultSelectTransportType = t('selectTransportType') || "Select Transport Type";
  const defaultPleaseSelect = t('pleaseSelect') || "Please Select";
  const defaultTransportTypeLabel = t('transportType') || 'Transport type';
  const defaultINeedADropOff = t('iNeedADropOff') || 'I need a drop off';
  const defaultDropOffArea = t('dropOffArea') || 'Drop off area';
  const defaultHotelDropOffPoint = t('hotelDropOffPoint') || 'Hotel / Drop off point';
  const defaultInputHotelDropOffPoint = t('inputHotelDropOffPoint') || 'Input Hotel / Drop off point';
  const defaultDropOff = t('dropOff') || 'Drop off';

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

  const [tripType, setTripType] = useState(t('oneWayTrip') || "One Way Trip");
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
  const [HotelpickupDepart, setHotelpickupDepart] = useState('');
  const [HoteldropoffDepart, setHoteldropoffDepart] = useState('');
  const [HotelpickupReturn, setHotelpickupReturn] = useState('');
  const [HoteldropoffReturn, setHoteldropoffReturn] = useState('');
  const [flightNoPickupDepart, setFlightNoPickupDepart] = useState('');
  const [flightNoDropoffDepart, setFlightNoDropoffDepart] = useState('');
  const [flightNoPickupReturn, setFlightNoPickupReturn] = useState('');
  const [flightNoDropoffReturn, setFlightNoDropoffReturn] = useState('');
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
  const [selectedTransportPickupDepartName, setSelectedTransportPickupDepartName] = useState(defaultSelectTransportType);
  const [selectedPickupDepartName, setSelectedPickupDepartName] = useState(defaultPleaseSelect);
  const [selectedTransportDropoffDepartName, setSelectedTransportDropoffDepartName] = useState(defaultSelectTransportType);
  const [selectedDropoffDepartName, setSelectedDropoffDepartName] = useState(defaultPleaseSelect);
  const [selectedTransportPickupReturnName, setSelectedTransportPickupReturnName] = useState(defaultSelectTransportType);
  const [selectedPickupReturnName, setSelectedPickupReturnName] = useState(defaultPleaseSelect);
  const [selectedTransportDropoffReturnName, setSelectedTransportDropoffReturnName] = useState(defaultSelectTransportType);
  const [selectedDropoffReturnName, setSelectedDropoffReturnName] = useState(defaultPleaseSelect);
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
    setSelectedTransportPickupDepartName(selectedLanguage === 'th' && item.md_cartype_namethai ? item.md_cartype_namethai : item.md_cartype_nameeng); // เก็บชื่อ
    setErrors((prev) => ({ ...prev, selectedTransportPickupDepartName: false })); // Clear the error state
    setSelectedPickupDepart("");
  setSelectedPickupDepartName(defaultPleaseSelect);
    setAirPortPickupDepart('');
    toggleModalTransportPickupDepart();
  };

  const handleSelectPickupDepart = (item) => {
    setSelectedPickupDepart(item.md_pickup_id);
  setSelectedPickupDepartName(selectedLanguage === 'th' && item.md_transfer_namethai ? item.md_transfer_namethai : item.md_transfer_nameeng);
    setErrors((prev) => ({ ...prev, selectedTransportPickupDepartName: false })); // Clear the error state
    if (item.md_pickup_id === "0") {

      setAirPortPickupDepart('');
      updateCustomerData({ pickupDepartId: "" });
    } else {
      setAirPortPickupDepart(item.md_transfer_airport);
      updateCustomerData({ pickupDepartId: item.md_pickup_id });
    }
    toggleModalPickupDepart();
  };


  const handleSelectedTranSportDropoffDepart = (item) => {
    setSelectedTranSportDropoffDepart(item.md_dropoff_cartypeid); // เก็บ id
    setSelectedTransportDropoffDepartName(selectedLanguage === 'th' && item.md_cartype_namethai ? item.md_cartype_namethai : item.md_cartype_nameeng); // เก็บชื่อ
    setErrors((prev) => ({ ...prev, selectedTransportDropoffDepartName: false })); // Clear the error state
    setSelectedDropoffDepart("");
  setSelectedDropoffDepartName(defaultPleaseSelect);
    setAirPortDropoffDepart('');
    toggleModalTransportDropoffDepart();
  };

  const handleSelectDropoffDepart = (item) => {
    setSelectedDropoffDepart(item.md_dropoff_id);
  setSelectedDropoffDepartName(selectedLanguage === 'th' && item.md_transfer_namethai ? item.md_transfer_namethai : item.md_transfer_nameeng);
    setErrors((prev) => ({ ...prev, selectedDropoffDepartName: false })); // Clear the error state
    if (item.md_dropoff_id === "0") {
      setAirPortDropoffDepart('');
      updateCustomerData({ dropoffDepartId: "" });
    } else {
      setAirPortDropoffDepart(item.md_transfer_airport);
      updateCustomerData({ dropoffDepartId: item.md_dropoff_id });
    }
    toggleModalDropoffDepart();
  };

  const handleSelectedTranSportPickupReturn = (item) => {
    setSelectedTranSportPickupReturn(item.md_pickup_cartypeid); // เก็บ id
    setSelectedTransportPickupReturnName(selectedLanguage === 'th' && item.md_cartype_namethai ? item.md_cartype_namethai : item.md_cartype_nameeng); // เก็บชื่อ
    setErrors((prev) => ({ ...prev, selectedTransportPickupReturnName: false })); // Clear the error state
    setSelectedPickupReturn("");
  setSelectedPickupReturnName(defaultPleaseSelect);
    setAirPortPickupReturn('');
    toggleModalTransportPickupReturn();
  };

  const handleSelectPickupReturn = (item) => {
    setSelectedPickupReturn(item.md_pickup_id);
  setSelectedPickupReturnName(selectedLanguage === 'th' && item.md_transfer_namethai ? item.md_transfer_namethai : item.md_transfer_nameeng);
    setErrors((prev) => ({ ...prev, selectedPickupReturnName: false })); // Clear the error state
    if (item.md_pickup_id === "0") {

      setAirPortPickupReturn('');
      updateCustomerData({ pickupReturnId: "" });
    } else {
      setAirPortPickupReturn(item.md_transfer_airport);
      updateCustomerData({ pickupReturnId: item.md_pickup_id });
    }
    toggleModalPickupReturn();
  };

  const handleSelectedTranSportDropoffReturn = (item) => {
    setSelectedTranSportDropoffReturn(item.md_dropoff_cartypeid); // เก็บ id
    setSelectedTransportDropoffReturnName(selectedLanguage === 'th' && item.md_cartype_namethai ? item.md_cartype_namethai : item.md_cartype_nameeng); // เก็บชื่อ
    setErrors((prev) => ({ ...prev, selectedTransportDropoffReturnName: false })); // Clear the error state
    setSelectedDropoffReturn("");
  setSelectedDropoffReturnName(defaultPleaseSelect);
    setAirPortDropoffReturn('');
    toggleModalTransportDropoffReturn();
  };

  const handleSelectDropoffReturn = (item) => {
    setSelectedDropoffReturn(item.md_dropoff_id);
  setSelectedDropoffReturnName(selectedLanguage === 'th' && item.md_transfer_namethai ? item.md_transfer_namethai : item.md_transfer_nameeng);
    setErrors((prev) => ({ ...prev, selectedDropoffReturnName: false })); // Clear the error state
    if (item.md_dropoff_id === "0") {
      setAirPortDropoffReturn('');
      updateCustomerData({ dropoffReturnId: "" });
    } else {
      setAirPortDropoffReturn(item.md_transfer_airport);
      updateCustomerData({ dropoffReturnId: item.md_dropoff_id });
    }
    toggleModalDropoffReturn();
  };



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
      setSelectedPickupDepart("");

    }

    if (!pickupReturn) {
      setSelectedPickupReturn("");
    }


    if (pickupDepart && customerData.pickupDepartId !== "") {
      setSelectedPickupDepart(customerData.pickupDepartId);



    }

    if (pickupReturn && customerData.pickupReturnId !== "") {
      setSelectedPickupReturn(customerData.pickupReturnId);

    }


    if (!dropoffDepart) {
      setSelectedDropoffDepart("");
    }

    if (!dropoffReturn) {
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

      } else {
        setError('ไม่สามารถโหลดข้อมูลได้');
      }
    } catch (err) {
      console.error("❌ API Error:", err.response?.data || err.message);
      setPriceDepart([]);
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ API');
    } finally {
      setLoading(false);
    }
  };

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

    // --- เดิม ---
    if (pickupDepart) {
      if (!HotelpickupDepart) newErrors.HotelpickupDepart = true;
      if (selectedTransportPickupDepartName === defaultSelectTransportType) newErrors.selectedTransportPickupDepartName = true;

      // ต้องกรอก Flight No ถ้ารับที่สนามบิน
      if (airPortPickupDepart === 1 && !String(flightNoPickupDepart || '').trim()) {
        newErrors.flightNoPickupDepart = true;
      }
    }

    // กรณีต้นทางเที่ยวไปเป็นสนามบิน (ไม่มีรถรับแต่ต้องกรอกได้)
    if (timetableDepart[0]?.md_location_airport === 1 && !String(flightNoPickupDepart || '').trim()) {
      newErrors.flightNoPickupDepart = true;
    }

    if (dropoffDepart) {
      if (!HoteldropoffDepart) newErrors.HoteldropoffDepart = true;

      // ต้องกรอก Flight No ถ้าส่งที่สนามบิน
      if (airPortDropoffDepart === 1 && !String(flightNoDropoffDepart || '').trim()) {
        newErrors.flightNoDropoffDepart = true;
      }
    }

    if (pickupReturn) {
      if (!HotelpickupReturn) newErrors.HotelpickupReturn = true;

      // ต้องกรอก Flight No ถ้ารับที่สนามบิน (เที่ยวกลับ)
      if (airPortPickupReturn === 1 && !String(flightNoPickupReturn || '').trim()) {
        newErrors.flightNoPickupReturn = true;
      }
    }

    // กรณีต้นทางเที่ยวกลับเป็นสนามบิน
    if (customerData.roud === 2 && timetableReturn[0]?.md_location_airport === 1 && !String(flightNoPickupReturn || '').trim()) {
      newErrors.flightNoPickupReturn = true;
    }

    if (dropoffReturn) {
      if (!HoteldropoffReturn) newErrors.HoteldropoffReturn = true;

      // ต้องกรอก Flight No ถ้าส่งที่สนามบิน (เที่ยวกลับ)
      if (airPortDropoffReturn === 1 && !String(flightNoDropoffReturn || '').trim()) {
        newErrors.flightNoDropoffReturn = true;
      }
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
      HotelpickupDepart: timetableDepart[0]?.md_location_airport === 1 || airPortPickupDepart === 1 ? `${flightNoPickupDepart} | ${pickuphourDepart}:${pickupminutesDepart}` : HotelpickupDepart, // ถ้าเป็นสนามบินหรือเลือกสนามบินให้กรอกโรงแรม
      HoteldropoffDepart: airPortDropoffDepart === 1 ? `${flightNoDropoffDepart} | ${dropoffhourDepart}:${dropoffminutesDepart}` : HoteldropoffDepart, // ถ้าเป็นสนามบินให้กรอกโรงแรม


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
        HotelpickupReturn: timetableReturn[0]?.md_location_airport === 1 || airPortPickupReturn === 1 ? `${flightNoPickupReturn} | ${pickuphourReturn}:${pickupminutesreturn}` : HotelpickupReturn, // ถ้าเป็นสนามบินหรือเลือกสนามบินให้กรอกโรงแรม
        HoteldropoffReturn: airPortDropoffReturn === 1 ? `${flightNoDropoffReturn} | ${dropoffhourReturn}:${dropoffminutesReturn}` : HoteldropoffReturn, // ถ้าเป็นสนามบินให้กรอกโรงแรม
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
    });
  };

  const EXTRA_TOP_GUTTER = Platform.OS === 'android' ? 0 : 50;



  return (
    <View style={{ flex: 1 }}>
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

        {/* Enhanced Premium Header - รองรับ Android 15 Edge-to-Edge */}
        <LinearGradient
          colors={["rgba(255,255,255,0.98)", "rgba(248,250,252,0.95)", "rgba(241,245,249,0.9)"]}
          style={[
            headStyles.headerBg,
            {
              width: '100%',
              marginLeft: '0%',
              paddingTop: insets.top + EXTRA_TOP_GUTTER,
              borderBottomLeftRadius: getResponsiveSize(40, 35, 30),
              borderBottomRightRadius: getResponsiveSize(40, 35, 30),
              paddingBottom: getResponsiveSize(8, 6, 5),
              shadowColor: '#001233',
              shadowOpacity: 0.15,
              shadowRadius: getResponsiveSize(25, 20, 15),
              shadowOffset: { width: 0, height: getResponsiveSize(8, 6, 4) },
              padding: getResponsiveSize(10, 8, 6),
              minHeight: getResponsiveSize(hp('12%'), hp('10%'), hp('8%')),
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
                paddingHorizontal: getResponsiveSize(0, wp('1%'), wp('3%')),
                paddingTop: 0,
                position: 'relative',
                marginTop: 0,
                height: getResponsiveSize(56, 50, 45),
                maxWidth: isTablet ? 1200 : '100%',
                alignSelf: 'center',
                width: '100%',
              },
            ]}
          >
            {/* Back Button - Left */}
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{
                position: 'absolute',
                left: getResponsiveSize(16, 20, 30),
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderRadius: getResponsiveSize(25, 22, 20),
                padding: getResponsiveSize(8, 10, 12),
                zIndex: 2,
                shadowColor: '#FD501E',
                shadowOpacity: 0.2,
                shadowRadius: getResponsiveSize(12, 10, 8),
                shadowOffset: { width: 0, height: getResponsiveSize(4, 3, 2) },
                borderWidth: 1,
                borderColor: 'rgba(253, 80, 30, 0.1)',
              }}
            >
              <AntDesign name="arrow-left" size={24} color="#FD501E" />
            </TouchableOpacity>

            {/* Logo - Center */}
            <View style={{ position: 'absolute', left: 0, right: 0, alignItems: 'center' }}>
              <LogoTheTrago />
            </View>

          </View>

        </LinearGradient>

       

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
                paddingHorizontal: 16,
                paddingTop: 8,
                paddingBottom: Platform.OS === 'android' ? (Platform.Version >= 31 ? insets.bottom + hp('12%') : hp('12%')) : hp('12%'), // Android 15 Edge-to-Edge รองรับ
                flexGrow: 1,
              }
            ]}
            showsVerticalScrollIndicator={false}
            style={[
              { flex: 1 },
              Platform.OS === 'android' && Platform.Version >= 31 && {
                paddingBottom: 0, // ใช้ contentContainerStyle แทน
              }
            ]}
            contentInsetAdjustmentBehavior="automatic"
          >

             {/* Enhanced Title Section */}
        <View style={{
          marginTop: hp('1%'),
          marginBottom: hp('2%'),
          paddingHorizontal: wp('2%'),
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
                <View style={{ paddingHorizontal: wp('1%') }}>
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
                        paddingHorizontal: wp('2%'),
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
                    borderWidth: 1,
                    borderColor: 'rgba(253, 80, 30, 0.08)',
                    marginHorizontal: wp('1%')
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
                        paddingHorizontal: 12,
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
                                maxWidth: wp('28%'),
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
                                maxWidth: wp('40%'),
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
                          <Image source={require('../../assets/Line 14.png')}
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

                          <Image source={require('../../assets/Line 14.png')}
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
                            <TextInput
                            style={[styles.inputSolid, errors.flightNoPickupDepart && styles.errorInput]}
                            value={flightNoPickupDepart}
                            onChangeText={(text) => {
                              setFlightNoPickupDepart(text);
                              setErrors(prev => ({ ...prev, flightNoPickupDepart: false }));
                            }}
                            placeholder="Flight Number"
                            autoCapitalize="characters"
                          />

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
                              <Text style={styles.inputLabel}>{defaultTransportTypeLabel}</Text>
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
                                      data={[{ md_cartype_nameeng: defaultSelectTransportType, md_cartype_namethai: defaultSelectTransportType, md_pickup_cartypeid: '0' }, ...TranSportDepartPickup]}
                                      renderItem={({ item }) => (
                                        <TouchableOpacity style={styles.optionItem} onPress={() => handleSelectedTranSportPickupDepart(item)}>
                                          <Text style={styles.optionText}>{selectedLanguage === 'th' && item.md_cartype_namethai ? item.md_cartype_namethai : item.md_cartype_nameeng}</Text>
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
                                      data={[{ md_pickup_id: "0", md_transfer_nameeng: defaultPleaseSelect, md_transfer_namethai: defaultPleaseSelect }, ...pickupAreaDepart]}
                                      renderItem={({ item }) => (
                                        <TouchableOpacity style={styles.optionItem} onPress={() => handleSelectPickupDepart(item)}>
                                          <Text style={styles.optionText}>{selectedLanguage === 'th' && item.md_transfer_namethai ? item.md_transfer_namethai : item.md_transfer_nameeng}</Text>
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
                                  <TextInput
                                    style={[styles.inputSolid, errors.flightNoPickupDepart && styles.errorInput]}
                                    value={flightNoPickupDepart}
                                    onChangeText={(text) => {
                                      setFlightNoPickupDepart(text);
                                      setErrors(prev => ({ ...prev, flightNoPickupDepart: false }));
                                    }}
                                    placeholder="Flight Number"
                                    autoCapitalize="characters"
                                  />

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
                                placeholderTextColor="rgba(55,65,81,0.45)"
                                style={[styles.inputSolid, errors.HotelpickupDepart && styles.errorInput]} // ใช้สีแดงเมื่อมีข้อผิดพลาด
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
                            <Text style={styles.label}>{defaultINeedADropOff}</Text>
                          </TouchableOpacity>

                          {dropoffDepart && (
                            <View>
                              <Text style={styles.inputLabel}>{defaultTransportTypeLabel}</Text>
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
                                      data={[{ md_cartype_nameeng: defaultSelectTransportType, md_cartype_namethai: defaultSelectTransportType, md_pickup_cartypeid: '0' }, ...TranSportDropoffDepart]}
                                      renderItem={({ item }) => (
                                        <TouchableOpacity style={styles.optionItem} onPress={() => handleSelectedTranSportDropoffDepart(item)}>
                                          <Text style={styles.optionText}>{selectedLanguage === 'th' && item.md_cartype_namethai ? item.md_cartype_namethai : item.md_cartype_nameeng}</Text>
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


                              <Text style={styles.inputLabel}>{defaultDropOffArea}</Text>
                              <TouchableOpacity onPress={toggleModalDropoffDepart} style={styles.buttonSelect}>
                                <Text style={styles.buttonText}>{selectedDropoffDepartName}</Text>
                                <Icon name="chevron-down" size={18} color="#FD501E" style={styles.icon} />
                              </TouchableOpacity>

                              <Modal visible={isModalDepartDropoffVisible} transparent animationType="fade" onRequestClose={toggleModalDropoffDepart}>
                                <View style={styles.modalOverlay}>
                                  <View style={styles.modalContentPre}>
                                    <FlatList
                                      data={[{ md_dropoff_id: "0", md_transfer_nameeng: defaultPleaseSelect, md_transfer_namethai: defaultPleaseSelect }, ...DropoffAreaDepart]}
                                      renderItem={({ item }) => (
                                        <TouchableOpacity style={styles.optionItem} onPress={() => handleSelectDropoffDepart(item)}>
                                          <Text style={styles.optionText}>{selectedLanguage === 'th' && item.md_transfer_namethai ? item.md_transfer_namethai : item.md_transfer_nameeng}</Text>
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
                                  <TextInput
                                    style={[styles.inputSolid, errors.flightNoDropoffDepart && styles.errorInput]}
                                    value={flightNoDropoffDepart}
                                    onChangeText={(text) => {
                                      setFlightNoDropoffDepart(text);
                                      setErrors(prev => ({ ...prev, flightNoDropoffDepart: false }));
                                    }}
                                    placeholder="Flight Number"
                                    autoCapitalize="characters"
                                  />

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


                              <Text style={styles.inputLabel}>{defaultHotelDropOffPoint}</Text>
                              <TextInput
                                placeholder={defaultInputHotelDropOffPoint}
                                placeholderTextColor="rgba(55,65,81,0.45)"
                                value={HoteldropoffDepart}
                                onChangeText={(text) => {
                                  setHoteldropoffDepart(text);
                                  setErrors((prev) => ({ ...prev, HoteldropoffDepart: false }));
                                }}
                                style={[styles.inputSolid, errors.HoteldropoffDepart && styles.errorInput]} // ใช้สีแดงเมื่อมีข้อผิดพลาด
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
                          paddingHorizontal: 12,
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
                                  maxWidth: wp('28%'),
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
                                  maxWidth: wp('40%'),
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
                            <Image source={require('../../assets/Line 14.png')}
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

                            <Image source={require('../../assets/Line 14.png')}
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
                              <TextInput
                              style={[styles.inputSolid, errors.flightNoPickupReturn && styles.errorInput]}
                              value={flightNoPickupReturn}
                              onChangeText={(text) => {
                                setFlightNoPickupReturn(text);
                                setErrors(prev => ({ ...prev, flightNoPickupReturn: false }));
                              }}
                              placeholder="Flight Number"
                              autoCapitalize="characters"
                            />

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
                              <Text style={styles.label}>{t('iNeedAPickUp') || 'I need a pick up'}</Text>
                            </TouchableOpacity>

                            {pickupReturn && (
                              <View>
                                <Text style={styles.inputLabel}>{defaultTransportTypeLabel}</Text>
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
                                        data={[{ md_cartype_nameeng: defaultSelectTransportType, md_cartype_namethai: defaultSelectTransportType, md_pickup_cartypeid: '0' }, ...TranSportReturnPickup]}
                                        renderItem={({ item }) => (
                                          <TouchableOpacity style={styles.optionItem} onPress={() => handleSelectedTranSportPickupReturn(item)}>
                                            <Text style={styles.optionText}>{selectedLanguage === 'th' && item.md_cartype_namethai ? item.md_cartype_namethai : item.md_cartype_nameeng}</Text>
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
                                <TouchableOpacity onPress={toggleModalPickupReturn} style={[styles.buttonSelect, errors.selectedTransportPickupDepartName && styles.errorInput]}>
                                  <Text style={styles.buttonText}>{selectedPickupReturnName}</Text>
                                  <Icon name="chevron-down" size={18} color="#FD501E" style={styles.icon} />
                                </TouchableOpacity>

                                <Modal visible={isModalReturnPickupVisible} transparent animationType="fade" onRequestClose={toggleModalPickupReturn}>
                                  <View style={styles.modalOverlay}>
                                    <View style={styles.modalContentPre}>
                                      <FlatList
                                        data={[{ md_pickup_id: "0", md_transfer_nameeng: defaultPleaseSelect, md_transfer_namethai: defaultPleaseSelect }, ...pickupAreaReturn]}
                                        renderItem={({ item }) => (
                                          <TouchableOpacity style={styles.optionItem} onPress={() => handleSelectPickupReturn(item)}>
                                            <Text style={styles.optionText}>{selectedLanguage === 'th' && item.md_transfer_namethai ? item.md_transfer_namethai : item.md_transfer_nameeng}</Text>
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
                                      <TextInput
                                      style={[styles.inputSolid, errors.flightNoPickupReturn && styles.errorInput]}
                                      value={flightNoPickupReturn}
                                      onChangeText={(text) => {
                                        setFlightNoPickupReturn(text);
                                        setErrors(prev => ({ ...prev, flightNoPickupReturn: false }));
                                      }}
                                      placeholder="Flight Number"
                                      autoCapitalize="characters"
                                    />

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



                                <Text style={styles.inputLabel}>{t('hotelPickUpPoint') || 'Hotel / Pick up point'}</Text>
                                <TextInput
                                  placeholder={t('inputHotelPickUpPoint') || 'Input Hotel / Pick up point'}
                                  value={HotelpickupReturn}
                                  onChangeText={(text) => {
                                    setHotelpickupReturn(text);
                                    setErrors((prev) => ({ ...prev, HotelpickupReturn: false }));
                                  }}
                                  placeholderTextColor="rgba(55,65,81,0.45)"
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
                              <Text style={styles.label}>{defaultINeedADropOff}</Text>
                            </TouchableOpacity>

                            {dropoffReturn && (
                              <View>
                                <Text style={styles.inputLabel}>{defaultTransportTypeLabel}</Text>
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
                                        data={[{ md_cartype_nameeng: defaultSelectTransportType, md_cartype_namethai: defaultSelectTransportType, md_pickup_cartypeid: '0' }, ...TranSportDropoffReturn]}
                                        renderItem={({ item }) => (
                                          <TouchableOpacity style={styles.optionItem} onPress={() => handleSelectedTranSportDropoffReturn(item)}>
                                            <Text style={styles.optionText}>{selectedLanguage === 'th' && item.md_cartype_namethai ? item.md_cartype_namethai : item.md_cartype_nameeng}</Text>
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

                                <Text style={styles.inputLabel}>{defaultDropOffArea}</Text>
                                <TouchableOpacity onPress={toggleModalDropoffReturn} style={styles.buttonSelect}>
                                  <Text style={styles.buttonText}>{selectedDropoffReturnName}</Text>
                                  <Icon name="chevron-down" size={18} color="#FD501E" style={styles.icon} />
                                </TouchableOpacity>

                                <Modal visible={isModalReturnDropoffVisible} transparent animationType="fade" onRequestClose={toggleModalDropoffReturn}>
                                  <View style={styles.modalOverlay}>
                                    <View style={styles.modalContentPre}>
                                      <FlatList
                                        data={[{ md_dropoff_id: "0", md_transfer_nameeng: defaultPleaseSelect, md_transfer_namethai: defaultPleaseSelect }, ...DropoffAreaReturn]}
                                        renderItem={({ item }) => (
                                          <TouchableOpacity style={styles.optionItem} onPress={() => handleSelectDropoffReturn(item)}>
                                            <Text style={styles.optionText}>{selectedLanguage === 'th' && item.md_transfer_namethai ? item.md_transfer_namethai : item.md_transfer_nameeng}</Text>
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
                                    <TextInput
                                      style={[styles.inputSolid, errors.flightNoDropoffReturn && styles.errorInput]}
                                      value={flightNoDropoffReturn}
                                      onChangeText={(text) => {
                                        setFlightNoDropoffReturn(text);
                                        setErrors(prev => ({ ...prev, flightNoDropoffReturn: false }));
                                      }}
                                      placeholder="Flight Number"
                                      autoCapitalize="characters"
                                    />

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





                                <Text style={styles.inputLabel}>{defaultHotelDropOffPoint}</Text>
                                <TextInput
                                  placeholder={defaultInputHotelDropOffPoint}
                                  placeholderTextColor="rgba(55,65,81,0.45)"
                                  value={HoteldropoffReturn}
                                  onChangeText={(text) => {
                                    setHoteldropoffReturn(text);
                                    setErrors((prev) => ({ ...prev, HoteldropoffReturn: false }));
                                  }}
                                  style={[styles.inputSolid, errors.HoteldropoffReturn && styles.errorInput]} // ใช้สีแดงเมื่อมีข้อผิดพลาด
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
                           {selectedLanguage === 'th' ? tripItem.startingpoint_namethai : tripItem.startingpoint_nameeng} <AntDesign name="arrow-right" size={14} color="#FD501E" /> {selectedLanguage === 'th' ? tripItem.endpoint_namethai : tripItem.endpoint_nameeng}
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
                            <Text>{defaultDropOff}</Text>
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
                              {selectedLanguage === 'th' ? tripItem.startingpoint_namethai : tripItem.startingpoint_nameeng} <AntDesign name="arrow-right" size={14} color="#FD501E" /> {selectedLanguage === 'th' ? tripItem.endpoint_namethai : tripItem.endpoint_nameeng}
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
                              <Text style={{ color: '#6B7280', fontSize: wp('3.5%'), fontWeight: '500' }}>{t('returnDate') || 'Return Date'}</Text>
                              <Text style={{ color: '#6B7280', fontSize: wp('3.5%'), fontWeight: '500' }}>{formatDate(customerData.returndate)}</Text>
                            </View>

                            <View style={styles.rowpromo}>
                              <Text style={{ color: '#6B7280', fontSize: wp('3.5%'), fontWeight: '500' }}>{t('departureTime') || 'Departure Time'}</Text>
                              <Text style={{ color: '#6B7280', fontSize: wp('3.5%'), fontWeight: '500' }}>
                                {formatTime(tripItem.md_timetable_departuretime)} - {formatTime(tripItem.md_timetable_arrivaltime)} | {formatTimeToHoursAndMinutes(tripItem.md_timetable_time)}
                              </Text>
                            </View>

                            <View style={[styles.rowpromo, { marginTop: hp('1%') }]}>
                              <Text style={{ fontSize: wp('3.8%'), fontWeight: '600', color: '#374151' }}>{t('adult') || 'Adult'} x {customerData.adult}</Text>
                              <Text style={{ fontSize: wp('3.8%'), fontWeight: '600', color: '#374151' }}>{customerData.symbol} {formatNumberWithComma(parseFloat(item.totalReturn.priceadult).toFixed(2))}</Text>
                            </View>

                            {customerData.child !== 0 && (
                              <View style={styles.rowpromo}>
                                <Text style={{ fontSize: wp('3.8%'), fontWeight: '600', color: '#374151' }}>{t('child') || 'Child'} x {customerData.child}</Text>
                                <Text style={{ fontSize: wp('3.8%'), fontWeight: '600', color: '#374151' }}>{customerData.symbol} {formatNumberWithComma(parseFloat(item.totalReturn.pricechild).toFixed(2))}</Text>
                              </View>
                            )}

                            {customerData.infant !== 0 && (
                              <View style={styles.rowpromo}>
                                <Text style={{ fontSize: wp('3.8%'), fontWeight: '600', color: '#374151' }}>{t('infant') || 'Infant'} x {customerData.infant}</Text>
                                <Text style={{ fontSize: wp('3.8%'), fontWeight: '600', color: '#374151' }}>{customerData.symbol} {formatNumberWithComma(parseFloat(item.totalReturn.priceinfant).toFixed(2))}</Text>
                              </View>
                            )}

                            {pickupReturn && (
                              <View style={styles.rowpromo}>
                                <Text>{t('pickUp') || 'Pick up'}</Text>
                                <Text style={{ color: 'green' }}>+ {customerData.symbol} {formatNumberWithComma(parseFloat(item.totalReturn.pricepickupdepart).toFixed(2))}</Text>
                              </View>
                            )}

                            {dropoffReturn && (
                              <View style={styles.rowpromo}>
                                <Text>{defaultDropOff}</Text>
                                <Text style={{ color: 'green' }}>+ {customerData.symbol} {formatNumberWithComma(parseFloat(item.totalReturn.pricedropoffdepart).toFixed(2))}</Text>
                              </View>
                            )}

                            {item.totalReturn.save != 0 && (
                              <View style={styles.rowpromo}>
                                <Text>{t('discount') || 'Discount'}</Text>
                                <Text style={styles.redText}>- {customerData.symbol} {formatNumberWithComma(parseFloat(item.totalReturn.discount).toFixed(2))}</Text>
                              </View>
                            )}

                            <View style={styles.rowpromo}>
                              <Text>{t('ticketFare') || 'Ticket fare'}</Text>
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
    </View>

  );
};


export default TripDetail;
