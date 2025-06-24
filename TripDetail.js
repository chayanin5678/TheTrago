import React, { useRef, useState, useEffect } from 'react';
import ipAddress from './ipconfig';
import Icon from 'react-native-vector-icons/Ionicons';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, Modal, FlatList, ImageBackground, TouchableWithoutFeedback, Alert, ActivityIndicator, SafeAreaView } from 'react-native';
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
const TripDetail = ({ navigation, route }) => {

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
    return moment(dateString).format("ddd, DD MMM YYYY");
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
      totaladultDepart: parseFloat(item.totalDepart.saleadult.replace(/,/g, "")).toFixed(2) * customerData.adult, //รวมราคาจำนวนผู้ใหญ่
      totalchildDepart: parseFloat(item.totalDepart.salechild.replace(/,/g, "")).toFixed(2) * customerData.child, //รวมราคาจำนวนเด็ก
      totalinfantDepart: parseFloat(item.totalDepart.saleinfant.replace(/,/g, "")).toFixed(2) * customerData.infant, //รวมราคาจำนวนเด็ก
      discountDepart: parseFloat(item.totalDepart.discount.replace(/,/g, "")).toFixed(2), //ส่วนลด
      subtotalDepart: parseFloat(item.totalDepart.showtotal.replace(/,/g, "")).toFixed(2), //ราคารวม
      pickupPriceDepart: parseFloat(item.totalDepart.pricepickupdepart.replace(/,/g, "")).toFixed(2), //ราคารวมรับ
      dropoffPriceDepart: parseFloat(item.totalDepart.pricedropoffdepart.replace(/,/g, "")).toFixed(2), //ราคารวมส่ง
      total: parseFloat(item.total.replace(/,/g, "")).toFixed(2), //ราคารวมทั้งหมด

    });

    if (customerData.roud === 2) {
      updateCustomerData({
        totaladultReturn: parseFloat(item.totalReturn.saleadult.replace(/,/g, "")).toFixed(2) * customerData.adult, //รวมราคาจำนวนผู้ใหญ่
        totalchildReturn: parseFloat(item.totalReturn.salechild.replace(/,/g, "")).toFixed(2) * customerData.child, //รวมราคาจำนวนเด็ก
        totalinfantReturn: parseFloat(item.totalReturn.saleinfant).toFixed(2) * customerData.infant, //รวมราคาจำนวนเด็ก
        discountReturn: parseFloat(item.totalReturn.discount.replace(/,/g, "")).toFixed(2), //ส่วนลด
        subtotalReturn: parseFloat(item.totalReturn.showtotal.replace(/,/g, "")).toFixed(2), //ราคารวม
        pickupPriceReturn: parseFloat(item.totalReturn.pricepickupdepart.replace(/,/g, "")).toFixed(2), //ราคารวมรับ
        dropoffPriceReturn: parseFloat(item.totalReturn.pricedropoffdepart.replace(/,/g, "")).toFixed(2), //ราคารวมส่ง
      });
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors); // Update the errors state

      // Show an alert if there are missing fields or invalid email
      if (newErrors.email) {
        Alert.alert('Invalid Email', 'Please enter a valid email address.', [
          { text: 'OK', onPress: () => console.log('OK Pressed') }
        ]);
      } else {
        Alert.alert('Incomplete Information', 'Please fill in all required fields.', [
          { text: 'OK', onPress: () => console.log('OK Pressed') }
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
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={{ position: 'relative', alignItems: 'center', paddingTop: 6, marginTop: 0, marginBottom: 0, backgroundColor: '#fff' }}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ position: 'absolute', left: 16, top: 6, backgroundColor: '#FFF3ED', borderRadius: 20, padding: 6, zIndex: 2 }}
        >
          <AntDesign name="arrowleft" size={26} color="#FD501E" />
        </TouchableOpacity>
        <LogoTheTrago style={{ marginBottom: 0, marginTop: 0 }} />
        <Step logoUri={1} style={{ marginTop: 0, marginBottom: 0 }} />
      </View>
      <Text style={[styles.title, { marginLeft: 30, marginTop: 5, marginBottom: 10 }]}>Shuttle Transfer</Text>
      <ScrollView contentContainerStyle={styles.container}>
        <ImageBackground
          source={{ uri: 'https://www.thetrago.com/assets/images/bg/Aliments.png' }}
          style={styles.background}
        >
          {loading && (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color="#FD501E" />
            </View>
          )}
          {!loading && timetableDepart && timetableReturn && (
            <>
              {
                timetableDepart.map((item) => (

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
                            {item.md_company_nameeng}
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
                        <Text style={[styles.tag, { backgroundColor: '#fff', color: '#FD501E', fontWeight: 'bold', fontSize: 13 }]}>{item.md_seat_nameeng}</Text>
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
                        <Text style={styles.location}>{item.startingpoint_name}</Text>
                        <Text style={styles.ship}>{item.startpier_name}</Text>
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
                        <Text style={styles.orangetext}>{item.md_boattype_nameeng}</Text>
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
                        <Text style={styles.location}>{item.endpoint_name}</Text>
                        <Text style={styles.ship}>{item.endpier_name}</Text>
                      </View>
                    </View>

                    {item.md_location_airport === 1 && (
                      <>
                        <Text style={styles.inputLabel}>Filght Number</Text>
                        <TextInput style={styles.input} />
                        <Text style={styles.inputLabel}>Arrive Time</Text>
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
                          <Text style={styles.label}>I need a pick up</Text>
                        </TouchableOpacity>

                        {pickupDepart && (
                          <View>
                            <Text style={styles.inputLabel}>Transport type</Text>
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
                                    data={[{ md_cartype_nameeng: 'Select Transport Type', md_pickup_cartypeid: '0' }, ...TranSportDepartPickup]}
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



                            <Text style={styles.inputLabel}>Pick up area</Text>
                            <TouchableOpacity onPress={toggleModalPickupDepart} style={styles.buttonSelect}>
                              <Text style={styles.buttonText}>{selectedPickupDepartName}</Text>
                              <Icon name="chevron-down" size={18} color="#FD501E" style={styles.icon} />
                            </TouchableOpacity>

                            <Modal visible={isModalDepartPickupVisible} transparent animationType="fade" onRequestClose={toggleModalPickupDepart}>
                              <View style={styles.modalOverlay}>
                                <View style={styles.modalContentPre}>
                                  <FlatList
                                    data={[{ md_pickup_id: "0", md_transfer_nameeng: "Please Select" }, ...pickupAreaDepart]}
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
                                <Text style={styles.inputLabel}>Filght Number</Text>
                                <TextInput style={styles.input} />
                                <Text style={styles.inputLabel}>Arrive Time</Text>
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



                            <Text style={styles.inputLabel}>Hotel / Pick up point</Text>
                            <TextInput
                              placeholder="Input Hotel / Pick up point"
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
                          <Text style={styles.label}>I need a drop off</Text>
                        </TouchableOpacity>

                        {dropoffDepart && (
                          <View>
                            <Text style={styles.inputLabel}>Transport type</Text>
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


                            <Text style={styles.inputLabel}>Drop off area</Text>
                            <TouchableOpacity onPress={toggleModalDropoffDepart} style={styles.buttonSelect}>
                              <Text style={styles.buttonText}>{selectedDropoffDepartName}</Text>
                              <Icon name="chevron-down" size={18} color="#FD501E" style={styles.icon} />
                            </TouchableOpacity>

                            <Modal visible={isModalDepartDropoffVisible} transparent animationType="fade" onRequestClose={toggleModalDropoffDepart}>
                              <View style={styles.modalOverlay}>
                                <View style={styles.modalContentPre}>
                                  <FlatList
                                    data={[{ md_dropoff_id: "0", md_transfer_nameeng: "Please Select" }, ...DropoffAreaDepart]}
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


                            <Text style={styles.inputLabel}>Hotel / Drop off point</Text>
                            <TextInput
                              placeholder="Input Hotel / Drop off point"
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
                              {item.md_company_nameeng}
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
                          <Text style={[styles.tag, { backgroundColor: '#fff', color: '#FD501E', fontWeight: 'bold', fontSize: 13 }]}>{item.md_seat_nameeng}</Text>
                          <Text style={[styles.tag, { backgroundColor: '#fff', color: '#FD501E', fontWeight: 'bold', fontSize: 13 }]}>{tripType}</Text>
                        </View>
                      </View>

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
                          <Text style={styles.location}>{item.startingpoint_name}</Text>
                          <Text style={styles.ship}>{item.startpier_name}</Text>
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
                          <Text style={styles.orangetext}>{item.md_boattype_nameeng}</Text>
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
                          <Text style={styles.location}>{item.endpoint_name}</Text>
                          <Text style={styles.ship}>{item.endpier_name}</Text>
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
                              <TouchableOpacity onPress={toggleModalPickupReturn} style={styles.buttonSelect}>
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

                <View key={index} style={styles.promo}>

                  <Text style={styles.TextInput}>
                    Booking Summary
                  </Text>

                  <View style={styles.divider} />
                  <Text style={styles.margin}>
                    Depart
                  </Text>
                  <View style={styles.rowpromo}>
                    <View style={styles.rowpromo}>
                      <Text>
                        Adult x {customerData.adult}



                      </Text>
                      {/* Tooltip icon */}
                      <TouchableOpacity onPress={toggleTooltipadultDepart}>
                        <Icon name="information-circle-outline" size={20} color="red" />
                      </TouchableOpacity>
                    </View>
                    <Text>{customerData.symbol} {formatNumberWithComma(parseFloat(item.totalDepart.saleadult.replace(/,/g, "")).toFixed(2) * customerData.adult)} </Text>
                    {/* Modal (tooltip) */}
                    <Modal
                      visible={modaladultVisibleDepart}
                      transparent={true}
                      animationType="fade"
                      onRequestClose={closeModaladultDepart}
                    >
                      <TouchableWithoutFeedback onPress={closeModaladultDepart}>
                        <View style={styles.modalOverlay}>
                          {/* This area will close the modal when tapped */}
                          <TouchableWithoutFeedback>
                            <View style={styles.tooltip}>
                              <Text style={styles.tooltipText}>{customerData.adult} Adult THB {formatNumberWithComma(parseFloat(item.totalDepart.saleadult.replace(/,/g, "")).toFixed(2))}/persons</Text>
                            </View>
                          </TouchableWithoutFeedback>
                        </View>
                      </TouchableWithoutFeedback>
                    </Modal>


                  </View>
                  {customerData.child !== 0 && (
                    <View style={styles.rowpromo}>
                      <View style={styles.rowpromo}>
                        <Text>
                          Child x {customerData.child}
                        </Text>
                        <TouchableOpacity onPress={toggleTooltipchildDepart}>
                          <Icon name="information-circle-outline" size={20} color="red" />
                        </TouchableOpacity>
                      </View>
                      {parseFloat(item.totalDepart.salechild.replace(/,/g, "")) !== 0 ? (
                        <Text>
                          {customerData.symbol} {formatNumberWithComma(parseFloat(item.totalDepart.salechild.replace(/,/g, "")) * customerData.child)}
                        </Text>
                      ) : (
                        <Text>
                          Free
                        </Text>
                      )}

                      {/* Modal (tooltip) */}
                      <Modal
                        visible={modalchildVisibleDepart}
                        transparent={true}
                        animationType="fade"
                        onRequestClose={closeModalchildDepart} // Close modal when pressing the back button
                      >
                        <TouchableWithoutFeedback onPress={closeModalchildDepart}>
                          <View style={styles.modalOverlay}>
                            {/* This area will close the modal when tapped */}
                            <TouchableWithoutFeedback>
                              <View style={styles.tooltip}>
                                <Text style={styles.tooltipText}>{customerData.children} Child THB {formatNumberWithComma(parseFloat(item.totalDepart.salechild.replace(/,/g, "")).toFixed(2))}/persons</Text>
                              </View>
                            </TouchableWithoutFeedback>
                          </View>
                        </TouchableWithoutFeedback>
                      </Modal>
                    </View>
                  )}
                  {customerData.infant !== 0 && (
                    <View style={styles.rowpromo}>
                      <View style={styles.rowpromo}>
                        <Text>
                          infant x {customerData.infant}
                        </Text>
                        <TouchableOpacity onPress={toggleTooltipinfantDepart}>
                          <Icon name="information-circle-outline" size={20} color="red" />
                        </TouchableOpacity>
                      </View>
                      {parseFloat(item.totalDepart.saleinfant.replace(/,/g, "")) !== 0 ? (
                        <Text>
                          {customerData.symbol} {formatNumberWithComma(parseFloat(item.totalDepart.saleinfant.replace(/,/g, "")) * customerData.infant)}
                        </Text>
                      ) : (
                        <Text>
                          Free
                        </Text>
                      )}

                      {/* Modal (tooltip) */}
                      <Modal
                        visible={modalInfantVisibleDepart}
                        transparent={true}
                        animationType="fade"
                        onRequestClose={closeModalindantDepart} // Close modal when pressing the back button
                      >
                        <TouchableWithoutFeedback onPress={closeModalindantDepart}>
                          <View style={styles.modalOverlay}>
                            {/* This area will close the modal when tapped */}
                            <TouchableWithoutFeedback>
                              <View style={styles.tooltip}>
                                <Text style={styles.tooltipText}>{customerData.infant} Infant THB {formatNumberWithComma(parseFloat(item.totalDepart.saleinfant.replace(/,/g, "")))}/persons</Text>
                              </View>
                            </TouchableWithoutFeedback>
                          </View>
                        </TouchableWithoutFeedback>
                      </Modal>
                    </View>
                  )}
                  {pickupDepart && (
                    <View style={styles.rowpromo}>
                      <Text>
                        Pick up
                      </Text>
                      {parseFloat(item.totalDepart.pricepickupdepart.replace(/,/g, "")) != 0 ? (
                        <Text style={{ color: 'green' }}>+ {customerData.symbol} {formatNumberWithComma(parseFloat(item.totalDepart.pricepickupdepart.replace(/,/g, "")))} </Text>
                      ) : (
                        <Text>Free</Text>
                      )}
                    </View>
                  )}
                  {dropoffDepart && (
                    <View style={styles.rowpromo}>
                      <Text>
                        Drop off
                      </Text>
                      {parseFloat(item.totalDepart.pricedropoffdepart.replace(/,/g, "")) != 0 ? (
                        <Text style={{ color: 'green' }}>+ {customerData.symbol} {formatNumberWithComma(parseFloat(item.totalDepart.pricedropoffdepart.replace(/,/g, "")))} </Text>
                      ) : (
                        <Text>Free</Text>
                      )}
                    </View>
                  )}
                  {item.totalDepart.save != 0 && (
                    <View style={styles.rowpromo}>
                      <Text>
                        Discount
                      </Text>
                      <Text style={styles.redText}>
                        - {customerData.symbol} {formatNumberWithComma(parseFloat(item.totalDepart.discount.replace(/,/g, "")).toFixed(2))} </Text>

                    </View>
                  )}
                  <View style={styles.rowpromo}>
                    <Text>
                      Subtotal
                    </Text>
                    <Text style={{ fontWeight: 'bold' }}>  {customerData.symbol} {formatNumberWithComma(parseFloat(item.totalDepart.showtotal.replace(/,/g, "")).toFixed(2))} </Text>
                  </View>
                  <View style={styles.divider} />

                  {customerData.roud === 2 && (
                    <>
                      <Text style={styles.margin}>
                        Return
                      </Text>
                      <View style={styles.rowpromo}>
                        <View style={styles.rowpromo}>
                          <Text>
                            Adult x {customerData.adult}



                          </Text>
                          {/* Tooltip icon */}
                          <TouchableOpacity onPress={toggleTooltipadultReturn}>
                            <Icon name="information-circle-outline" size={20} color="red" />
                          </TouchableOpacity>
                        </View>
                        <Text>{customerData.symbol}  {formatNumberWithComma(parseFloat(item.totalReturn.saleadult.replace(/,/g, "")).toFixed(2) * customerData.adult)} </Text>
                        {/* Modal (tooltip) */}
                        <Modal
                          visible={modaladultVisibleReturn}
                          transparent={true}
                          animationType="fade"
                          onRequestClose={closeModaladultReturn} // Close modal when pressing the back button
                        >
                          <TouchableWithoutFeedback onPress={closeModaladultReturn}>
                            <View style={styles.modalOverlay}>
                              {/* This area will close the modal when tapped */}
                              <TouchableWithoutFeedback>
                                <View style={styles.tooltip}>
                                  <Text style={styles.tooltipText}>{customerData.adults} Adult THB {formatNumberWithComma(parseFloat(item.totalReturn.saleadult.replace(/,/g, "")).toFixed(2))}/persons</Text>
                                </View>
                              </TouchableWithoutFeedback>
                            </View>
                          </TouchableWithoutFeedback>
                        </Modal>


                      </View>
                      {customerData.child !== 0 && (
                        <View style={styles.rowpromo}>
                          <View style={styles.rowpromo}>
                            <Text>
                              Child x {customerData.child}
                            </Text>
                            <TouchableOpacity onPress={toggleTooltipchildReturn}>
                              <Icon name="information-circle-outline" size={20} color="red" />
                            </TouchableOpacity>
                          </View>
                          {parseFloat(item.totalReturn.salechild.replace(/,/g, "")).toFixed(2) !== 0 ? (
                            <Text>{customerData.symbol} {formatNumberWithComma(parseFloat(item.totalReturn.salechild.replace(/,/g, "")).toFixed(2) * customerData.child)} </Text>
                          ) : (
                            <Text>Free</Text>
                          )}
                          {/* Modal (tooltip) */}
                          <Modal
                            visible={modalchildVisibleReturn}
                            transparent={true}
                            animationType="fade"
                            onRequestClose={closeModalchildReturn} // Close modal when pressing the back button
                          >
                            <TouchableWithoutFeedback onPress={closeModalchildReturn}>
                              <View style={styles.modalOverlay}>
                                {/* This area will close the modal when tapped */}
                                <TouchableWithoutFeedback>
                                  <View style={styles.tooltip}>
                                    <Text style={styles.tooltipText}>{customerData.child} Child THB {formatNumberWithComma(parseFloat(item.totalReturn.salechild.replace(/,/g, "")).toFixed(2))}/persons</Text>
                                  </View>
                                </TouchableWithoutFeedback>
                              </View>
                            </TouchableWithoutFeedback>
                          </Modal>
                        </View>
                      )}
                      {customerData.infant !== 0 && (
                        <View style={styles.rowpromo}>
                          <View style={styles.rowpromo}>
                            <Text>
                              infant x {customerData.infant}
                            </Text>
                            <TouchableOpacity onPress={toggleTooltipinfantReturn}>
                              <Icon name="information-circle-outline" size={20} color="red" />
                            </TouchableOpacity>
                          </View>
                          {parseFloat(item.totalReturn.saleinfant) !== 0 ? (
                            <Text>{customerData.symbol} {formatNumberWithComma(parseFloat(item.totalReturn.saleinfant).toFixed(2) * customerData.infant)} </Text>
                          ) : (
                            <Text>Free</Text>
                          )}
                          {/* Modal (tooltip) */}
                          <Modal
                            visible={modalInfantVisibleReturn}
                            transparent={true}
                            animationType="fade"
                            onRequestClose={closeModalinfantReturn} // Close modal when pressing the back button
                          >
                            <TouchableWithoutFeedback onPress={closeModalinfantReturn}>
                              <View style={styles.modalOverlay}>
                                {/* This area will close the modal when tapped */}
                                <TouchableWithoutFeedback>
                                  <View style={styles.tooltip}>
                                    <Text style={styles.tooltipText}>{customerData.infant} Infant THB {formatNumberWithComma(parseFloat(item.totalReturn.saleinfant).toFixed(2))}/persons</Text>
                                  </View>
                                </TouchableWithoutFeedback>
                              </View>
                            </TouchableWithoutFeedback>
                          </Modal>
                        </View>
                      )}
                      {pickupReturn && (
                        <View style={styles.rowpromo}>
                          <Text>
                            Pick up
                          </Text>
                          {parseFloat(item.totalReturn.pricepickupdepart.replace(/,/g, "")) != 0 ? (
                            <Text style={{ color: 'green' }}>+ {customerData.symbol} {formatNumberWithComma(parseFloat(item.totalReturn.pricepickupdepart.replace(/,/g, "")).toFixed(2))} </Text>
                          ) : (
                            <Text>Free</Text>
                          )}
                        </View>
                      )}
                      {dropoffReturn && (
                        <View style={styles.rowpromo}>
                          <Text>
                            Drop off
                          </Text>
                          {parseFloat(item.totalReturn.pricedropoffdepart.replace(/,/g, "")) != 0 ? (
                            <Text style={{ color: 'green' }}>+ {customerData.symbol} {formatNumberWithComma(parseFloat(item.totalReturn.pricedropoffdepart.replace(/,/g, "")).toFixed(2))} </Text>
                          ) : (
                            <Text>Free</Text>
                          )}
                        </View>
                      )}
                      {item.totalReturn.save != 0 && (
                        <View style={styles.rowpromo}>
                          <Text>
                            Discount
                          </Text>
                          <Text style={styles.redText}>
                            - {customerData.symbol} {formatNumberWithComma(parseFloat(item.totalReturn.discount.replace(/,/g, "")).toFixed(2))} </Text>

                        </View>
                      )}
                      <View style={styles.rowpromo}>
                        <Text>
                          Subtotal
                        </Text>
                        <Text style={{ fontWeight: 'bold' }}>{customerData.symbol} {formatNumberWithComma(parseFloat(item.totalReturn.showtotal.replace(/,/g, "")).toFixed(2))} </Text>
                      </View>
                      <View style={styles.divider} />
                    </>
                  )}

                  <View style={styles.rowpromo}>
                    <Text style={styles.totaltext}>Total</Text>
                    <Text style={styles.totaltext}>{customerData.symbol} {formatNumberWithComma(parseFloat(item.total.replace(/,/g, "")).toFixed(2))}</Text>
                  </View>
                </View>

              ))}
            </>)}
          {Array.isArray(priceDepart) &&
            priceDepart
              .filter(item => item.totalDepart) // ป้องกัน undefined
              .map((item, index) => (
                <View key={index} style={styles.rowButton}>
                  <TouchableOpacity
                    style={[styles.ActionButton, { width: '100%' }]}
                    onPress={() => handleNext(item)}
                  >
                    <Text style={styles.searchButtonText}>Next</Text>
                  </TouchableOpacity>
                </View>
              ))}

        </ImageBackground>
      </ScrollView>
    </SafeAreaView>

  );
};


const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    padding: 20,
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
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'left', // Ensure left alignment
    color: '#002348',
    marginBottom: 20,
    marginTop: 20,
    marginLeft: 0, // Optional: ensure no margin if not needed
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
    fontSize: 12,
    color: '#666',
    marginTop: 10,
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
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',  // ให้ Modal อยู่ด้านล่าง
    alignItems: 'center',

  },
  modalContent: {
    backgroundColor: '#FFF',
    width: '80%',   // กำหนดให้ Modal กว้าง 80% ของจอ
    height: '40%',  // จำกัดขนาดความสูง
    borderRadius: 10,
    padding: 15,
    elevation: 5,

  },
  modalOption: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  modalOptionText: {
    fontSize: 18,
    color: '#333',
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

    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: 36,
    padding: 32,
    marginHorizontal: 12,
    marginTop: 28,
    marginBottom: 36,
    shadowColor: '#FD501E', // orange shadow
    shadowOpacity: 0.13,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 7,
    borderWidth: 2,
    borderColor: 'rgba(253,80,30,0.15)', // light orange border
    // overflow: 'hidden', // สำหรับ blur/gradient
  },
  promo: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: '100%',
    padding: 16,
    margin: 16,
    marginLeft: -3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
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
    borderWidth: 1,
    borderColor: "#ced4da",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    backgroundColor: "#fff",
    marginBottom: 15,
    paddingVertical: 10,
    margin: 10,
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
    backgroundColor: '#EAEAEA',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    width: '45%',
    marginBottom: 20,
    justifyContent: 'flex-end',
  },
  BackButtonText: {
    color: '#666666',
    fontWeight: 'bold',
    fontSize: 16,

  },
  ActionButton: {
    backgroundColor: '#FD501E',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    width: '45%',
    marginBottom: 20,
    justifyContent: 'flex-end',
  },
  searchButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,

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
    backgroundColor: '#FFF',
    width: '80%',   // กำหนดให้ Modal กว้าง 80% ของจอ
    borderRadius: 10,
    padding: 15,
    elevation: 5,

  },
  icon: {
    marginLeft: 10,
  },
  buttonSelect: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 8,
    width: '93%',
    justifyContent: 'space-between',
    margin: 10,

  },
  optionItem: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',

  },
  optionText: {
    fontSize: 16,
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
