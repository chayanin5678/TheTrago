import React, { useRef, useState, useEffect } from 'react';

import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ImageBackground, useWindowDimensions, ActivityIndicator, Modal, Animated, TouchableWithoutFeedback, TextInput, StatusBar, SafeAreaView, Platform, Linking } from 'react-native';

import DateTimePicker from "@react-native-community/datetimepicker";
import Banner from '../components/component/Banner';
import Toptrending from '../components/component/toptrending';
import LogoTheTrago from '../components/component/Logo';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useCustomer } from './Screen/CustomerContext';
import { CalendarList } from 'react-native-calendars';
import styles from '../styles/CSS/HomeScreenStyles';
import * as SecureStore from 'expo-secure-store';
import { LinearGradient } from 'expo-linear-gradient';
import ipAddress from '../config/ipconfig';
import { Easing } from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons'; // ใช้ไอคอนจาก expo
import { BlurView } from 'expo-blur';
import CrossPlatformStatusBar from '../components/component/CrossPlatformStatusBar';
import SafeAreaDebugger from '../components/component/SafeAreaDebugger';
import { DesignTokens, CrossPlatformUtils } from '../styles/CSS/CrossPlatformStyles';
import { useLanguage } from './Screen/LanguageContext';

const HomeScreen = ({ navigation, route }) => {
  const { language, t, selectedLanguage, changeLanguage } = useLanguage();

  const placeholders = [
    [
      { text: t('the') + ' ', color: '#fff' },
      { text: t('journey') + ' ', color: 'rgb(255, 166, 0)' },
      { text: t('isEndlessBookNow'), color: '#fff' },
    ],
    [
      { text: t('planningForA') + ' ', color: '#fff' },
      { text: t('trip') + '? ', color: 'rgb(255, 166, 0)' },
    ],
    [
      { text: t('weWillOrganizeYour') + ' ', color: '#fff' },
      { text: t('bestTrip'), color: 'rgb(255, 166, 0)' },
    ],
    [
      { text: t('withThe') + ' ', color: '#fff' },
      { text: t('bestDestination'), color: 'rgb(255, 166, 0)' },
    ],
    [
      { text: t('andWithinThe') + ' ', color: '#fff' },
      { text: t('bestBudgets') + '!', color: 'rgb(255, 166, 0)' },
    ],
  ];

  const data = [
    { id: '1', title: t('ferry'), icon: 'boat', navigate: 'SearchFerry', item: 'new' },
    { id: '2', title: t('flights'), icon: 'airplane', navigate: 'SearchFerryDemo', item: '' },
    { id: '3', title: t('trains'), icon: 'train', navigate: '', item: '' },
    { id: '4', title: t('cars'), icon: 'car', navigate: '', item: '' },
    { id: '5', title: t('hotel'), icon: 'bed', navigate: '', item: '' },
    { id: '6', title: t('tours'), icon: 'map', navigate: '', item: '' },
    { id: '7', title: t('attraction'), icon: 'star', navigate: '', item: '' },
    { id: '8', title: t('ticket'), icon: 'ticket', navigate: '', item: '' },
  ];

  const [activeCountry, setActiveCountry] = useState(null);
  const [activeattraction, setActiveattraction] = useState(null);
  const [startingPoint, setStartingPoint] = useState({ id: '0', name: t('startingPoint') });
  const [endPoint, setEndPoint] = useState({ id: '0', name: t('destination') });
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

  const { customerData, updateCustomerData } = useCustomer();

  const [calendarStartDate, setCalendarStartDate] = useState(new Date().toISOString().split('T')[0]); // string
  const [calendarEndDate, setCalendarEndDate] = useState(new Date().toISOString().split('T')[0]); // string

  const [profileImage, setProfileImage] = useState(null);
  const [calendarMarkedDates, setCalendarMarkedDates] = useState({});
  const [token, setToken] = useState(null);
  const [user, setUser] = useState([]);
  const [countrie, setcountrie] = useState([]);
  const iconAnim = useRef(new Animated.Value(0)).current; // สำหรับ opacity และ scale
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const slideX = useRef(new Animated.Value(-100)).current;
  const [index, setIndex] = useState(0);
  const translateY = useRef(new Animated.Value(0)).current;
  const [searchText, setSearchText] = useState('');
  const bounceAnim2 = useRef(new Animated.Value(0)).current;
  const [poppularroute, setPoppularRoute] = useState([]);
  const [visibleRoutes, setVisibleRoutes] = useState(6);
  const [visibleTrending, setVisibleTrending] = useState(6);
  const [visibleAttraction, setvisibleAttraction] = useState(6);
  const scrollViewRef = useRef(null);
  const { width: screenWidth } = useWindowDimensions();
  const [currentBanner, setCurrentBanner] = useState(0);
  const [toptrending, setToptrending] = useState([]);
  const [attraction, setActtraction] = useState([]);
  const [poppularAttraction, setPoppularAttraction] = useState([]);
  const shimmerAnim = useRef(new Animated.Value(-300)).current;
  const [loadedIndexes, setLoadedIndexes] = useState([]);
  const [isLoadingTitle, setIsLoadingTitle] = useState(true);

  // Reduced particles count for cleaner look
  const floatingAnims = useRef([...Array(8)].map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const timer = setTimeout(() => setIsLoadingTitle(false), 1500); // จำลองโหลด
    return () => clearTimeout(timer);
  }, []);

  // Handle referral parameter from deep link
  useEffect(() => {
    const handleReferral = async () => {
      // Check route params first
      if (route?.params?.ref) {
        console.log('Referral ID from route params:', route.params.ref);
        await SecureStore.setItemAsync('referralId', route.params.ref);
        return;
      }

      // Check initial URL for deep linking
      try {
        const url = await Linking.getInitialURL();
        if (url) {
          // Manual query string parsing
          const queryString = url.split('?')[1];
          if (queryString) {
            const params = {};
            queryString.split('&').forEach(pair => {
              const [key, value] = pair.split('=');
              params[key] = decodeURIComponent(value || '');
            });
            if (params.ref) {
              console.log('Referral ID from deep link:', params.ref);
              await SecureStore.setItemAsync('referralId', params.ref);
            }
          }
        }
      } catch (error) {
        console.error('Error handling referral:', error);
      }
    };

    handleReferral();
  }, [route?.params]);

  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 300,
        duration: 1600,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      })
    ).start();
  }, []);

  // Update language-dependent state when language changes
  useEffect(() => {
    setStartingPoint({ id: '0', name: t('startingPoint') });
    setEndPoint({ id: '0', name: t('destination') });
  }, [language, t]);

  // Improved floating animation with slower, more natural movement
  useEffect(() => {
    floatingAnims.forEach((anim, index) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration: 4000 + Math.random() * 2000,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 4000 + Math.random() * 2000,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
        ])
      ).start();
    });
  }, []);

  const formatDecimal = (number) => {
    return Number(number).toFixed(1);
  };


  // Mock data for fallback
  const mockTopTrending = [
    {
      id: 1,
      title: "Beautiful Phuket",
      image: "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=800&h=600&fit=crop",
      description: "Stunning beaches and crystal clear waters",
      rating: 4.8
    },
    {
      id: 2,
      title: "Bangkok City Tour",
      image: "https://images.unsplash.com/photo-1563492065-ba4bdc0ff2e7?w=800&h=600&fit=crop",
      description: "Experience the vibrant capital city",
      rating: 4.7
    },
    {
      id: 3,
      title: "Krabi Adventures",
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
      description: "Amazing limestone cliffs and beaches",
      rating: 4.9
    }
  ];

  const mockPopularRoutes = [
    {
      id: 1,
      from: "Bangkok",
      to: "Phuket",
      price: 1500,
      duration: "1h 30m",
      image: "https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=400&h=300&fit=crop"
    },
    {
      id: 2,
      from: "Phuket",
      to: "Krabi",
      price: 800,
      duration: "45m",
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop"
    },
    {
      id: 3,
      from: "Bangkok",
      to: "Samui",
      price: 2200,
      duration: "2h 15m",
      image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop"
    },
    {
      id: 4,
      from: "Pattaya",
      to: "Bangkok",
      price: 600,
      duration: "30m",
      image: "https://images.unsplash.com/photo-1563492065-ba4bdc0ff2e7?w=400&h=300&fit=crop"
    },
    {
      id: 5,
      from: "Chiang Mai",
      to: "Bangkok",
      price: 3500,
      duration: "3h 45m",
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop"
    },
    {
      id: 6,
      from: "Hua Hin",
      to: "Phuket",
      price: 2800,
      duration: "2h 30m",
      image: "https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=400&h=300&fit=crop"
    }
  ];

  const mockAttractions = [
    {
      id: 1,
      name: "Grand Palace",
      location: "Bangkok",
      rating: 4.8,
      price: 500,
      image: "https://images.unsplash.com/photo-1563492065-ba4bdc0ff2e7?w=400&h=300&fit=crop"
    },
    {
      id: 2,
      name: "Phi Phi Islands",
      location: "Krabi",
      rating: 4.9,
      price: 1200,
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop"
    },
    {
      id: 3,
      name: "Big Buddha",
      location: "Phuket",
      rating: 4.7,
      price: 0,
      image: "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=400&h=300&fit=crop"
    }
  ];

  const fetchWithRetry = async (url, options = {}, retries = 3) => {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url, {
          ...options,
          timeout: 10000, // 10 second timeout
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
      } catch (error) {
        console.log(`Attempt ${i + 1} failed:`, error.message);
        if (i === retries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // Exponential backoff
      }
    }
  };

  useEffect(() => {
    const fetchTopTrending = async () => {
      try {
        const data = await fetchWithRetry(`${ipAddress}/toptrending`);
        if (data && Array.isArray(data.data)) {
          setToptrending(data.data);
        } else {
          console.warn('API returned invalid data format, using mock data');
          setToptrending(mockTopTrending);
        }
      } catch (error) {
        console.error('Error fetching top trending data, using mock data:', error);
        setToptrending(mockTopTrending);
      }
    };

    fetchTopTrending();
  }, []);

  function formatNumberWithComma(value) {
    if (!value) return "0.00";
    const formattedValue = Number(value).toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });


    return formattedValue;
  }

  useEffect(() => {
    const fetchAttractions = async () => {
      try {
        const data = await fetchWithRetry(`${ipAddress}/attraction`);
        if (data && Array.isArray(data.data)) {
          setActtraction(data.data);
          setActiveattraction(data.data[0].md_province_id);
        } else {
          console.warn('API returned invalid attraction data format, using mock data');
          setActtraction(mockAttractions);
          setActiveattraction(1);
        }
      } catch (error) {
        console.error('Error fetching attraction data, using mock data:', error);
        setActtraction(mockAttractions);
        setActiveattraction(1);
      }
    };

    fetchAttractions();
  }, []);

  useEffect(() => {
    if (!toptrending.length) return;

    const interval = setInterval(() => {
      const nextIndex = (currentBanner + 1) % toptrending.length;
      setCurrentBanner(nextIndex);
      const cardWidth = wp('95%'); // Card width + margins
      scrollViewRef.current?.scrollTo({
        x: nextIndex * cardWidth,
        animated: true,
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [currentBanner, toptrending.length]);


  useEffect(() => {
    const interval = setInterval(() => {
      // Animate ขึ้นไปก่อน
      Animated.timing(translateY, {
        toValue: -70,
        duration: 550,
        useNativeDriver: true,
      }).start(() => {
        // เมื่อเลื่อนขึ้นสุดแล้ว เปลี่ยนข้อความ
        setIndex((prev) => (prev + 1) % placeholders.length);

        // ดึงกลับล่างทันทีแบบไม่เห็น
        translateY.setValue(60);

        // แล้ว animate กลับมาที่ 0
        Animated.timing(translateY, {
          toValue: 0,
          duration: 550,
          useNativeDriver: true,
        }).start();
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const loadMoreRoutes = () => {
    if (visibleRoutes < poppularroute.length) {
      setVisibleRoutes(prev => prev + 6);
    }
  };

  const loadMoreTrending = () => {
    if (visibleTrending < toptrending.length) {
      setVisibleTrending(prev => prev + 6);
    }
  };


  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim2, {
          toValue: -4, // ⬆ ขึ้น
          duration: 700,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim2, {
          toValue: 4,  // ⬇ ลง
          duration: 700,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    Animated.timing(slideX, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);


  useEffect(() => {
    Animated.timing(iconAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);


  useEffect(() => {
    Animated.loop(
      Animated.timing(bounceAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.inOut(Easing.sin), // ✅ ลื่นและ smooth
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const translateX = bounceAnim.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [-10, 0, 15, 0, -10], // ⬅➡⬅
  });
  const bounceY = bounceAnim.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [-5, 0, 5, 0, -5],
  });



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


  // const handleCalendarConfirm = () => {
  //   if (tripType === 'One Way Trip' && calendarStartDate) {
  //     console.log('Selected Departure Date:', calendarStartDate);
  //     setDepartureDate(new Date(calendarStartDate));
  //     setShowModal(false);
  //   } else if (tripType === 'Return Trip' && calendarStartDate && calendarEndDate) {
  //     setDepartureDate(new Date(calendarStartDate));
  //     setReturnDate(new Date(calendarEndDate));
  //     setShowModal(false);
  //   } else {
  //     alert('กรุณาเลือกวันที่ให้ครบ');
  //   }
  // };



  // const formatDate = (date) => {
  //   if (!date) return ""; // ตรวจสอบว่ามีค่า date หรือไม่
  //   return new Date(date).toLocaleDateString("en-GB", {
  //     day: "2-digit",
  //     month: "short",
  //     year: "numeric",
  //   });
  // };





  // const swapPoints = () => {
  //   setStartingPoint((prev) => endPoint);
  //   setEndPoint((prev) => startingPoint);
  // };

  const truncateText = (text, maxLength = 20) => {
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
        // หากไม่มี token, แค่ไม่ต้องทำอะไร ไม่ต้องไปหน้า login
        console.log('No token found, staying on home screen');
      } else {
        console.log('Token found, user is logged in');
      }
      setIsLoading(false); // หยุดการโหลดหลังจากตรวจสอบเสร็จ
    };
    checkLoginStatus(); // เรียกใช้เมื่อหน้าโหลด


  }, []); // ใช้ navigation เป็น dependency เพื่อให้ useEffect ทำงานเมื่อคอมโพเนนต์โหลด

  useEffect(() => {

    const fetchData = async () => {
      console.log('fetchData called with token:', token ? 'Present' : 'Missing');
      try {
        const response = await fetch(`${ipAddress}/profile`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`, // ส่ง Token ใน Authorization header
            'Content-Type': 'application/json', // ระบุประเภทของข้อมูลที่ส่ง (ถ้าจำเป็น)
          },
        });

        if (!response.ok) {
          console.error(`Profile fetch failed (useEffect 1): ${response.status} ${response.statusText}`);
          console.error(`Request URL: ${ipAddress}/profile`);
          console.error(`Token: ${token ? 'Present' : 'Missing'}`);
          throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        if (data && Array.isArray(data.data)) {
          setUser(data.data);
          updateCustomerData({
            Firstname: data.data[0].md_member_fname,
            Lastname: data.data[0].md_member_lname,
            email: data.data[0].md_member_email,
            tel: data.data[0].md_member_phone,
            md_booking_memberid : data.data[0].md_member_id,       

          });

          if (data.data[0].md_member_phone) {
            updateCustomerData({
              tel: data.data[0].md_member_phone,
            });
          }
          if (data.data[0].md_member_code) {
            getCountryByCode(data.data[0].md_member_code);

          }
          console.log('Profile data fetched successfully');
        } else {
          console.error('Data is not an array', data);
          setUser([]);
        }
      } catch (error) {
        console.error('Error fetching profile data:', error);
      } finally {
        setIsLoading(false);  // ตั้งค่า loading เป็น false หลังจากทำงานเสร็จ
      }
    };
    
    if (token) {
      fetchData();
    } else {
      console.log('No token available, skipping profile fetch');
      setIsLoading(false);
    }

  }, [token]);




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
       
        updateCustomerData({
          selectcoountrycode: `(+${json.data[0].sys_countries_telephone}) ${json.data[0].sys_countries_nameeng}`,
          country: json.data[0].sys_countries_code,
          countrycode: json.data[0].sys_countries_telephone,
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

    const fecthpoppularattraction = async (provid) => {
      try {
        const response = await fetch(`${ipAddress}/poppularattraction`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ md_tour_provid: provid }),
        });

        const json = await response.json();


        if (response.ok) {
          setPoppularAttraction(json.data);
         
          return json.data;
        } else {
          console.warn('Not found or error:', json.message);
          setPoppularAttraction([]);
          return null;
        }
      } catch (error) {
        console.error('Error fetching country:', error);
        return null;
      }
    };
    fecthpoppularattraction(activeattraction);
  }, [activeattraction]);

  useEffect(() => {
    const fecthpoppularRoute = async (countrieid) => {
      try {
        const response = await fetch(`${ipAddress}/poppularroute`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sys_countries_id: countrieid }),
        });

        const json = await response.json();


        if (response.ok) {
   
          setPoppularRoute(json.data);
       
          return json.data;
        } else {
          console.warn('Not found or error:', json.message);
          setPoppularRoute([]);
          return null;
        }
      } catch (error) {
        console.error('Error fetching country:', error);
        return null;
      }
    };
    fecthpoppularRoute(activeCountry);
  }, [activeCountry]);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const data = await fetchWithRetry(`${ipAddress}/countriespop`);
        if (data && Array.isArray(data.data)) {
          setcountrie(data.data);
          setActiveCountry(data.data[0].sys_countries_id);
        } else {
          console.warn('API returned invalid countries data format, using mock data');
          const mockCountries = [
            { sys_countries_id: 1, sys_countries_nameeng: 'Thailand' },
            { sys_countries_id: 2, sys_countries_nameeng: 'Singapore' },
            { sys_countries_id: 3, sys_countries_nameeng: 'Malaysia' }
          ];
          setcountrie(mockCountries);
          setActiveCountry(1);
        }
      } catch (error) {
        console.error('Error fetching countries data, using mock data:', error);
        const mockCountries = [
          { sys_countries_id: 1, sys_countries_nameeng: 'Thailand' },
          { sys_countries_id: 2, sys_countries_nameeng: 'Singapore' },
          { sys_countries_id: 3, sys_countries_nameeng: 'Malaysia' }
        ];
        setcountrie(mockCountries);
        setActiveCountry(1);
      } finally {
        setIsLoadingTitle(false);
      }
    };

    fetchCountries();
  }, []);


  return (
    <CrossPlatformStatusBar
      barStyle="light-content"
      backgroundColor="rgba(253, 80, 30, 0.9)"
      translucent={true}
      showGradient={true}
    >
      <View style={premiumStyles.container}>
      
      {/* Background with Elegant Gradient */}
      <View style={premiumStyles.backgroundContainer}>
        {/* Subtle Floating Particles */}
        <View style={premiumStyles.particlesContainer}>
          {[...Array(8)].map((_, i) => (
            <Animated.View
              key={`particle-${i}`}
              style={[
                premiumStyles.particle,
                {
                  left: `${15 + (i * 12)}%`,
                  top: `${10 + (i * 8)}%`,
                  transform: [
                    {
                      translateY: floatingAnims[i % floatingAnims.length].interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 15],
                      }),
                    },
                    {
                      scale: floatingAnims[i % floatingAnims.length].interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: [0.7, 1, 0.7],
                      }),
                    },
                  ],
                  opacity: floatingAnims[i % floatingAnims.length].interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0.2, 0.4, 0.2],
                  }),
                },
              ]}
            />
          ))}
        </View>

        {/* Minimalist Decorative Elements */}
        <View style={premiumStyles.geometricShapes}>
          <Animated.View style={[premiumStyles.shape1, {
            transform: [{
              rotate: bounceAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '180deg'],
              })
            }]
          }]}>
            <MaterialIcons name="waves" size={wp('6%')} color="rgba(255,255,255,0.15)" />
          </Animated.View>
          
          <Animated.View style={[premiumStyles.shape2, {
            transform: [{
              scale: bounceAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.9, 1.1],
              })
            }]
          }]}>
            <FontAwesome5 name="anchor" size={wp('4.5%')} color="rgba(255,255,255,0.12)" />
          </Animated.View>
        </View>
      </View>

      {isLoading && (
        <View style={premiumStyles.loadingContainer}>
          <BlurView intensity={100} tint="dark" style={premiumStyles.loadingBlur}>
            <View style={premiumStyles.loadingContent}>
              <Animated.View style={[premiumStyles.loadingSpinner, {
                transform: [{ rotate: bounceAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '360deg'],
                })}]
              }]}>
                <LinearGradient
                  colors={['#FD501E', '#FF6B35']}
                  style={premiumStyles.loadingGradient}
                >
                  <MaterialIcons name="directions-boat" size={wp('10%')} color="#fff" />
                </LinearGradient>
              </Animated.View>
              <Text style={premiumStyles.loadingText}>Loading...</Text>
              <Text style={premiumStyles.loadingSubtext}>Please wait a moment</Text>
            </View>
          </BlurView>
        </View>
      )}

      <ScrollView 
        contentContainerStyle={premiumStyles.scrollContainer}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >

        {/* Refined Header Section with Better Spacing */}
        <View style={premiumStyles.headerSection}>
          <BlurView intensity={60} tint="light" style={premiumStyles.headerBlur}>
            <LinearGradient
              colors={['rgba(255,255,255,0.92)', 'rgba(255,255,255,0.88)']}
              style={premiumStyles.headerGradient}
            >
              {/* Header Content */}
              <View style={premiumStyles.headerContent}>
                {/* Empty left space for balance */}
           
                
                {/* Centered Logo */}
                <View style={premiumStyles.logoContainer}>
                  <Animated.View style={[premiumStyles.logoWrapper, {
                    transform: [{ scale: scaleAnim }]
                  }]}>
                    <LogoTheTrago />
                  </Animated.View>
                </View>

                {/* Language Toggle Text Only */}
                <View style={premiumStyles.headerActionsRight}>
                  <TouchableOpacity 
                    onPress={() => {
                      const newLanguage = selectedLanguage === 'th' ? 'en' : 'th';
                      console.log('Toggling language from', selectedLanguage, 'to', newLanguage);
                      changeLanguage(newLanguage);
                    }}
                  >
                    <Text style={{
                      color: '#FD501E',
                      fontSize: wp('4.5%'),
                      fontWeight: 'bold',
                    }}>
                      {selectedLanguage === 'th' ? 'TH' : 'EN'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Simplified Search Section */}
              <View style={premiumStyles.searchSection}>
                {isLoadingTitle ? (
                  <View style={premiumStyles.searchSkeleton}>
                    <Animated.View style={[premiumStyles.shimmerEffect, {
                      transform: [{ translateX: shimmerAnim }],
                    }]}>
                      <LinearGradient
                        colors={['#eeeeee00', '#ddddddaa', '#eeeeee00']}
                        start={[0, 0]}
                        end={[1, 0]}
                        style={premiumStyles.shimmerGradient}
                      />
                    </Animated.View>
                  </View>
                ) : (
                  <BlurView intensity={30} tint="light" style={premiumStyles.searchContainer}>
                    <LinearGradient
                      colors={['rgba(253,80,30,0.08)', 'rgba(255,107,53,0.04)']}
                      style={premiumStyles.searchGradient}
                    >
                      <View style={premiumStyles.searchIconContainer}>
                        <MaterialIcons name="search" size={wp('5.5%')} color="#FD501E" />
                      </View>

                      <View style={premiumStyles.searchInputContainer}>
                        {searchText === '' && (
                          <Animated.Text style={[premiumStyles.searchPlaceholder, {
                            transform: [{ translateY }],
                          }]}>
                            {placeholders[index].map((part, i) => (
                              <Text
                                key={`${i}-${part.text}`}
                                style={[premiumStyles.placeholderText, {
                                  color: part.color === '#fff' ? '#555' : '#FD501E',
                                  fontWeight: part.bold ? 'bold' : '500',
                                }]}
                              >
                                {part.text}
                              </Text>
                            ))}
                          </Animated.Text>
                        )}

                        <TextInput
                          value={searchText}
                          onChangeText={setSearchText}
                          style={premiumStyles.searchInput}
                          placeholder=""
                          placeholderTextColor="transparent"
                        />
                      </View>

                      <TouchableOpacity style={premiumStyles.filterButton}>
                        <MaterialIcons name="tune" size={wp('4.5%')} color="#FD501E" />
                      </TouchableOpacity>
                    </LinearGradient>
                  </BlurView>
                )}
              </View>
            </LinearGradient>
          </BlurView>
        </View>
        {/* Enhanced Services Grid with Better Balance */}
        <View style={premiumStyles.servicesSection}>
          <Animated.View style={[premiumStyles.servicesContainer, {
            opacity: iconAnim,
            transform: [{
              scale: iconAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.95, 1],
              }),
            }, {
              translateY: iconAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }),
            }],
          }]}>
            <BlurView intensity={70} tint="light" style={premiumStyles.servicesBlur}>
              <LinearGradient
                colors={['rgba(255,255,255,0.93)', 'rgba(255,250,246,0.90)']}
                style={premiumStyles.servicesGradient}
              >
                {/* Refined Section Title */}
                <View style={premiumStyles.servicesTitleContainer}>
                  <Text style={premiumStyles.servicesTitle}>{t('ourServices')}</Text>
                  <Text style={premiumStyles.servicesSubtitle}>{t('chooseYourPerfectJourney')}</Text>
                </View>

                {/* Improved Services Grid */}
                <View style={premiumStyles.servicesGrid}>
                  {(isLoadingTitle ? Array(8).fill(null) : data).map((item, index) => (
                    <View key={item?.id || `skeleton-${index}`} style={premiumStyles.serviceItemContainer}>
                      {isLoadingTitle ? (
                        <View style={premiumStyles.serviceSkeleton}>
                          <View style={premiumStyles.serviceSkeletonIcon}>
                            <Animated.View style={[premiumStyles.shimmerEffect, {
                              transform: [{ translateX: shimmerAnim }],
                            }]}>
                              <LinearGradient
                                colors={['#eeeeee00', '#ddddddaa', '#eeeeee00']}
                                start={[0, 0]}
                                end={[1, 0]}
                                style={premiumStyles.shimmerGradient}
                              />
                            </Animated.View>
                          </View>
                          <View style={premiumStyles.serviceSkeletonText}>
                            <Animated.View style={[premiumStyles.shimmerEffect, {
                              transform: [{ translateX: shimmerAnim }],
                            }]}>
                              <LinearGradient
                                colors={['#eeeeee00', '#ddddddaa', '#eeeeee00']}
                                start={[0, 0]}
                                end={[1, 0]}
                                style={premiumStyles.shimmerGradient}
                              />
                            </Animated.View>
                          </View>
                        </View>
                      ) : (
                        <TouchableOpacity
                          style={premiumStyles.serviceItem}
                          onPress={() => {
                            if (item.id === '1') {
                              updateCustomerData({
                                startingPointId: '0',
                                startingpoint_name: t('startingPoint'),
                                endPointId: '0',
                                endpoint_name: t('destination'),
                              });
                            }
                            if (item.id === '2') {
                              // Flights button - navigation disabled
                              alert('Coming soon...');
                              return;
                            }
                            if (item.navigate) {
                              navigation.navigate(item.navigate);
                            } else {
                              alert('Coming soon...');
                            }
                          }}
                        >
                          <BlurView intensity={40} style={premiumStyles.serviceItemBlur}>
                            <LinearGradient
                              colors={index % 2 === 0 
                                ? ['rgba(253,80,30,0.06)', 'rgba(255,107,53,0.03)']
                                : ['rgba(255,107,53,0.06)', 'rgba(253,80,30,0.03)']
                              }
                              style={premiumStyles.serviceItemGradient}
                            >
                              {item.item && (
                                <Animated.View style={[premiumStyles.serviceBadge, {
                                  transform: [{ translateY: bounceAnim.interpolate({
                                    inputRange: [0, 0.25, 0.5, 0.75, 1],
                                    outputRange: [-2, 0, 2, 0, -2],
                                  })}],
                                }]}>
                                  <LinearGradient
                                    colors={['#FF4444', '#FF6666']}
                                    style={premiumStyles.badgeGradient}
                                  >
                                    <Text style={premiumStyles.badgeText}>{t(item.item)}</Text>
                                  </LinearGradient>
                                </Animated.View>
                              )}
                              
                              <View style={premiumStyles.serviceIconContainer}>
                                <Ionicons name={item.icon} size={wp('6.5%')} color="#FD501E" />
                              </View>
                              
                              <Text style={premiumStyles.serviceItemText}>{item.title}</Text>
                              
                              {/* Subtle Hover Indicator */}
                              <View style={premiumStyles.hoverIndicator} />
                            </LinearGradient>
                          </BlurView>
                        </TouchableOpacity>
                      )}
                    </View>
                  ))}
                </View>
              </LinearGradient>
            </BlurView>
          </Animated.View>
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
                source={require\('../../assets/directions_boat.png')}
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
                source={require\('../../assets/mage_exchange-a.png')}
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
                source={require\('../../assets/location_on.png')}
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
                  source={require\('../../assets/solar_calendar-bold.png')}

                  style={styles.logoDate}
                  resizeMode="contain"
                />
                <View style={styles.inputBoxCol}>

                  <Text style={styles.inputLabel}>Departure date</Text>
                  <Text style={styles.inputText}>
                    {calendarStartDate ? formatDate(calendarStartDate) : t('selectDate')}
                  </Text>

                </View>
              </TouchableOpacity>
              {tripType === "Return Trip" && (
                <>

                  <Image
                    source={require\('../../assets/Line 2.png')}
                    style={styles.logoLine}
                    resizeMode="contain"
                  />
                  <TouchableOpacity onPress={() => setShowModal(true)} disabled={!departureDate}
                    style={styles.rowdepart}>

                    <Image
                      source={require\('../../assets/solar_calendar-yellow.png')}
                      style={styles.logoDate}
                      resizeMode="contain"
                    />
                    <View style={styles.inputBoxCol}>
                      <Text style={styles.inputLabel}>Return date</Text>
                      <Text style={styles.inputText}>{calendarEndDate ? formatDate(calendarEndDate.toString()) : t('selectDate')}</Text>
                    </View>
                  </TouchableOpacity>
                </>
              )}
            </View>

            <Modal visible={showModal} animationType="slide">
              <View style={{ flex: 0.65, backgroundColor: '#fff' }}>


                <View style={{ marginTop: hp('3%'), paddingHorizontal: wp('5%'), paddingBottom: hp('1.5%'), borderBottomWidth: 1, borderBottomColor: '#ddd' }}>
                  <Text style={{ fontSize: wp('5%'), fontWeight: 'bold', marginBottom: hp('1.5%') }}>{t('selectDate')}</Text>
                  <View style={{ flexDirection: 'row', gap: wp('5%') }}>
                    <View style={{ backgroundColor: '#f2f2f2', padding: wp('2.5%'), borderRadius: wp('2.5%'), flex: 1 }}>
                      <Text style={{ fontSize: wp('3%'), color: '#555' }}>Departure date</Text>
                      <Text style={{ fontSize: wp('4%'), fontWeight: 'bold' }}>{formatDate(calendarStartDate) || '-'}</Text>
                    </View>
                    {tripType === 'Return Trip' && (
                      <View style={{ backgroundColor: '#f2f2f2', padding: wp('2.5%'), borderRadius: wp('2.5%'), flex: 1 }}>
                        <Text style={{ fontSize: wp('3%'), color: '#555' }}>Return date</Text>
                        <Text style={{ fontSize: wp('4%'), fontWeight: 'bold' }}>{formatDate(calendarEndDate) || '-'}</Text>
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

                <View style={{ padding: wp('5%'), borderTopWidth: 1, borderTopColor: '#eee' }}>
                  <TouchableOpacity onPress={handleCalendarConfirm} style={{ backgroundColor: '#FD501E', paddingVertical: hp('2%'), borderRadius: wp('2.5%'), alignItems: 'center' }}>
                    <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: wp('4%') }}>ยืนยัน</Text>
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
          <Text style={styles.searchButtonText}>{t('search')}</Text>
        </TouchableOpacity>
        <Modal
          visible={isModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setIsModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalText}>{t('pleaseSelectStartEndPoints')}</Text>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setIsModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal> */}
        {/* Refined Hot Deals Section */}
        <View style={premiumStyles.hotDealsSection}>
          <Animated.View style={[premiumStyles.hotDealsContainer, {
            transform: [{ 
              translateX: bounceAnim.interpolate({
                inputRange: [0, 0.25, 0.5, 0.75, 1],
                outputRange: [-3, 0, 5, 0, -3],
              })
            }],
          }]}>
            {isLoadingTitle ? (
              <View style={premiumStyles.hotDealsSkeleton}>
                <Animated.View style={[premiumStyles.shimmerEffect, {
                  transform: [{ translateX: shimmerAnim }],
                }]}>
                  <LinearGradient
                    colors={['#eeeeee00', '#ddddddaa', '#eeeeee00']}
                    start={[0, 0]}
                    end={[1, 0]}
                    style={premiumStyles.shimmerGradient}
                  />
                </Animated.View>
              </View>
            ) : (
              <BlurView intensity={50} tint="light" style={premiumStyles.hotDealsBlur}>
                <LinearGradient
                  colors={['rgba(253,80,30,0.92)', 'rgba(255,107,53,0.88)', 'rgba(255,140,80,0.82)']}
                  style={premiumStyles.hotDealsGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <View style={premiumStyles.hotDealsContent}>
                    <MaterialIcons name="local-fire-department" size={wp('6%')} color="#fff" />
                    <View style={premiumStyles.hotDealsTextContainer}>
                      <Text style={premiumStyles.hotDealsTitle}>
                        {t('hot')} <Text style={premiumStyles.hotDealsAccent}>{t('deals')}</Text>
                      </Text>
                      <Text style={premiumStyles.hotDealsSubtitle}>{t('limitedTimeOffers')}</Text>
                    </View>
                  </View>
                  
                  {/* Minimal Floating Elements */}
                  <Animated.View style={[premiumStyles.floatingElement1, {
                    transform: [{
                      rotate: bounceAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', '180deg'],
                      })
                    }]
                  }]}>
                    <MaterialIcons name="star" size={wp('3.5%')} color="rgba(255,255,255,0.25)" />
                  </Animated.View>
                </LinearGradient>
              </BlurView>
            )}
          </Animated.View>
        </View>

        {/* Banner Section with Header-matching Style */}
        <View style={premiumStyles.bannerSection}>
          {isLoadingTitle ? (
            <View style={premiumStyles.bannerSkeleton}>
              <Animated.View style={[premiumStyles.shimmerEffect, {
                transform: [{ translateX: shimmerAnim }],
              }]}>
                <LinearGradient
                  colors={['#eeeeee00', '#ddddddaa', '#eeeeee00']}
                  start={[0, 0]}
                  end={[1, 0]}
                  style={premiumStyles.shimmerGradient}
                />
              </Animated.View>
            </View>
          ) : (
            <View style={premiumStyles.bannerContainer}>
              <BlurView intensity={60} tint="light" style={premiumStyles.bannerBlur}>
                <LinearGradient
                  colors={['rgba(255,255,255,0.92)', 'rgba(255,255,255,0.88)', 'rgba(255,250,246,0.85)']}
                  style={premiumStyles.bannerGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={premiumStyles.bannerContentWrapper}>
                    <Banner />
                  </View>
                  
                  {/* Floating Decorative Elements */}
                  <View style={premiumStyles.bannerOverlay}>
                    <Animated.View style={[premiumStyles.bannerBadge, {
                      transform: [{ translateY: bounceAnim2.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -2],
                      })}]
                    }]}>
                      <LinearGradient
                        colors={['#FFD700', '#FF8C42']}
                        style={premiumStyles.badgeGradient}
                      >
                        <MaterialIcons name="verified" size={wp('3.5%')} color="#fff" />
                        <Text style={premiumStyles.bannerBadgeText}>{t('featured')}</Text>
                      </LinearGradient>
                    </Animated.View>
                  </View>
                </LinearGradient>
              </BlurView>
            </View>
          )}
        </View>


        {/* <View style={styles.rowtrip}>
          <View style={styles.coltrip}>

            <Text style={styles.texcol}>{t('popular')}</Text>
            <Text style={styles.texcol}><Text style={styles.highlight}>{t('destination')}</Text></Text>
            <Text style={styles.Detail}>
              Discover amazing islands and stunning beaches across Thailand. Book your ferry tickets and explore the most beautiful destinations with TheTrago's convenient booking platform.
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
                <Text style={styles.cardLocation}><Image source={require\('../../assets/Iconlocation.png')} /> {item.location}</Text>
                <Text style={styles.cardDuration}><Image source={require\('../../assets/Icontime.png')} /> {item.duration}</Text>
                <Text style={styles.cardPrice}>{t('startFrom')} <Text style={styles.cardPriceColor}>{item.price}</Text></Text>
              </View>
            </View>
          ))}


        </View> */}


        {isLoadingTitle ? (
          <View
            style={{
              height: hp('4.5%'),
              width: wp('37.5%'),
              borderRadius: wp('6.25%'),
              marginTop: hp('1.5%'),
              marginBottom: hp('1.5%'),
              marginLeft: 0,
              overflow: 'hidden',
              backgroundColor: '#eee',
              alignSelf: 'flex-start',
            }}
          >
            <Animated.View
              style={{
                width: wp('25%'),
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
        ) : (
          <View style={premiumStyles.sectionTitleContainer}>
            <BlurView intensity={40} tint="light" style={premiumStyles.sectionTitleBlur}>
              <LinearGradient
                colors={['rgba(255,255,255,0.9)', 'rgba(255,250,246,0.85)']}
                style={premiumStyles.sectionTitleGradient}
              >
                <Text style={premiumStyles.sectionTitle}>
                  {t('destination')} <Text style={premiumStyles.sectionTitleAccent}>{t('popular')}</Text>
                </Text>
                <Text style={premiumStyles.sectionSubtitle}>{t('discoverAmazingPlaces')}</Text>
              </LinearGradient>
            </BlurView>
          </View>
        )}

        <View style={premiumStyles.destinationsGrid}>
          {countrie.map((item, index) => {
            const isLoaded = loadedIndexes.includes(index);

            return (
              <View
                key={item.sys_countries_id}
                style={premiumStyles.destinationCard}
              >
                <TouchableOpacity
                  style={premiumStyles.destinationTouchable}
                  onPress={() => {
                    updateCustomerData({
                      countrycode: item.sys_countries_id,
                      country: item.sys_countries_nameeng,
                    });
                    navigation.navigate('PopularDestination');
                  }}
                >
                  <BlurView intensity={20} tint="light" style={premiumStyles.destinationBlur}>
                    <LinearGradient
                      colors={['rgba(255,255,255,0.95)', 'rgba(255,250,246,0.90)']}
                      style={premiumStyles.destinationGradient}
                    >
                      <View style={premiumStyles.destinationImageContainer}>
                        {!isLoaded && (
                          <Animated.View style={premiumStyles.destinationImageSkeleton}>
                            <Animated.View
                              style={[premiumStyles.shimmerEffect, {
                                transform: [{ translateX: shimmerAnim }],
                              }]}
                            >
                              <LinearGradient
                                colors={['#eeeeee00', '#ddddddaa', '#eeeeee00']}
                                start={[0, 0]}
                                end={[1, 0]}
                                style={premiumStyles.shimmerGradient}
                              />
                            </Animated.View>
                          </Animated.View>
                        )}
                        <Image
                          source={{ uri: `https://www.thetrago.com/Api/uploads/countries/index/${item.sys_countries_picname}` }}
                          style={premiumStyles.destinationImage}
                          resizeMode="cover"
                          onLoadEnd={() => setLoadedIndexes((prev) => [...prev, index])}
                        />
                        
                        {/* Premium Overlay */}
                        <LinearGradient
                          colors={['transparent', 'rgba(0,0,0,0.4)']}
                          style={premiumStyles.destinationOverlay}
                        />
                      </View>
                      
                      <View style={premiumStyles.destinationContent}>
                        {!isLoaded ? (
                          <Animated.View style={premiumStyles.destinationTextSkeleton}>
                            <Animated.View
                              style={[premiumStyles.shimmerEffect, {
                                transform: [{ translateX: shimmerAnim }],
                              }]}
                            >
                              <LinearGradient
                                colors={['#eeeeee00', '#ddddddaa', '#eeeeee00']}
                                start={[0, 0]}
                                end={[1, 0]}
                                style={premiumStyles.shimmerGradient}
                              />
                            </Animated.View>
                          </Animated.View>
                        ) : (
                          <>
                            <Text style={premiumStyles.destinationName}>
                              {language === 'th' ? item.sys_countries_namethai : item.sys_countries_nameeng}
                            </Text>
                            <View style={premiumStyles.destinationMeta}>
                              <MaterialIcons name="place" size={wp('3.5%')} color="#FD501E" />
                              <Text style={premiumStyles.destinationMetaText}>
                                {t('exploreNow')}
                              </Text>
                            </View>
                          </>
                        )}
                      </View>
                      
                      {/* Hover Indicator */}
                      <View style={premiumStyles.destinationIndicator} />
                    </LinearGradient>
                  </BlurView>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>


        <View style={{
          paddingBottom: hp('2%'),
        }}>
       

               {isLoadingTitle ? (
          <View
            style={{
              height: hp('4.5%'),
              width: wp('37.5%'),
              borderRadius: wp('6.25%'),
              marginTop: hp('1.5%'),
              marginBottom: hp('1.5%'),
              marginLeft: 0,
              overflow: 'hidden',
              backgroundColor: '#eee',
              alignSelf: 'flex-start',
            }}
          >
            <Animated.View
              style={{
                width: wp('25%'),
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
        ) : (
          <View style={[premiumStyles.sectionTitleContainer, { marginTop: 0, marginBottom: hp('1%') }]}>
            <BlurView intensity={40} tint="light" style={premiumStyles.sectionTitleBlur}>
              <LinearGradient
                colors={['rgba(255,255,255,0.9)', 'rgba(255,250,246,0.85)']}
                style={[premiumStyles.sectionTitleGradient, { paddingVertical: wp('2.5%') }]}
              >
                <Text style={[premiumStyles.sectionTitle, { fontSize: wp('5%'), marginBottom: 0 }]}>
                  {t('route')} <Text style={premiumStyles.sectionTitleAccent}>{t('popular')}</Text>
                </Text>
                <Text style={premiumStyles.sectionSubtitle}>{t('discoverMostTraveledRoutes')}</Text>
              </LinearGradient>
            </BlurView>
          </View>

        )}

         
       

          <View style={[styles.tabContainer, { marginTop: hp('0.5%') }]}>
            <View style={styles.tabContainer}>
              {countrie.map((item) => (
                <TouchableOpacity
                  key={item.sys_countries_id}
                  style={[styles.tab, activeCountry === item.sys_countries_id && styles.activeTab]}
                  onPress={() => {
                    setActiveCountry(item.sys_countries_id);
                    setVisibleRoutes(6);
                  }}
                >
                  <Text style={[styles.tabText, activeCountry === item.sys_countries_id && styles.activeTabText]}>
                    {language === 'th' ? item.sys_countries_namethai : item.sys_countries_nameeng}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={premiumStyles.routesGrid}>
            {isLoadingTitle
              ? Array(6).fill(null).map((_, index) => (
                <View key={`route-skeleton-${index}`} style={premiumStyles.routeCard}>
                  <View style={[premiumStyles.routeImageSkeleton, { height: hp('12%') }]}>
                    <Animated.View style={[premiumStyles.shimmerEffect, {
                      transform: [{ translateX: shimmerAnim }],
                    }]}>
                      <LinearGradient
                        colors={['#eeeeee00', '#ddddddaa', '#eeeeee00']}
                        start={[0, 0]}
                        end={[1, 0]}
                        style={premiumStyles.shimmerGradient}
                      />
                    </Animated.View>
                  </View>
                  <View style={[premiumStyles.routeTextSkeleton, { flex: 1, margin: wp('2.5%') }]}>
                    <Animated.View style={[premiumStyles.shimmerEffect, {
                      transform: [{ translateX: shimmerAnim }],
                    }]}>
                      <LinearGradient
                        colors={['#eeeeee00', '#ddddddaa', '#eeeeee00']}
                        start={[0, 0]}
                        end={[1, 0]}
                        style={premiumStyles.shimmerGradient}
                      />
                    </Animated.View>
                  </View>
                </View>
              ))
              : poppularroute.slice(0, visibleRoutes).map((item, index) => (
                <View
                  key={item.md_location_id ? `route-${item.md_location_id}` : `route-index-${index}`}
                  style={[
                    premiumStyles.routeCard,
                    // Remove right margin for every 3rd card (0, 3, 6, 9...)
                    (index + 1) % 3 === 0 && { marginRight: 0 }
                  ]}
                >
                  <TouchableOpacity
                    style={premiumStyles.routeTouchable}
                    onPress={() => {
                      updateCustomerData({
                        startingPointId: item.md_timetable_startid,
                        startingpoint_name: language === 'th' ? item.start_location_namethai : item.start_location_nameeng,
                        endPointId: item.md_timetable_endid,
                        endpoint_name: language === 'th' ? item.end_location_namethai : item.end_location_nameeng,
                      });
                      navigation.navigate('SearchFerry');
                    }}
                  >
                    <BlurView intensity={20} tint="light" style={premiumStyles.routeBlur}>
                      <LinearGradient
                        colors={['rgba(255,255,255,0.95)', 'rgba(255,250,246,0.90)']}
                        style={premiumStyles.routeGradient}
                      >
                        <View style={premiumStyles.routeImageContainer}>
                          <Image
                            source={{ uri: `https://thetrago.com/Api/uploads/location/pictures/${item.md_location_picname}` }}
                            style={premiumStyles.routeImage}
                            resizeMode="cover"
                          />
                          
                          {/* Premium Image Overlay */}
                          <LinearGradient
                            colors={['transparent', 'rgba(0,0,0,0.3)']}
                            style={premiumStyles.routeImageOverlay}
                          />
                          
                          {/* Hot Route Badge */}
                          {index < 2 && (
                            <Animated.View style={[premiumStyles.hotRouteBadge, {
                              transform: [{ translateY: bounceAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0, -2],
                              })}],
                            }]}>
                              <LinearGradient
                                colors={['#FF4444', '#FF6666']}
                                style={premiumStyles.hotRouteBadgeGradient}
                              >
                                <MaterialIcons name="local-fire-department" size={wp('2.5%')} color="#fff" />
                                <Text style={premiumStyles.hotRouteBadgeText}>{t('hotRoute')}</Text>
                              </LinearGradient>
                            </Animated.View>
                          )}
                        </View>
                        
                        <View style={premiumStyles.routeContent}>
                          <View>
                            <View style={premiumStyles.routeHeader}>
                              <Text style={premiumStyles.routeFromText} numberOfLines={1} ellipsizeMode="tail">
                                {language === 'th' ? item.start_location_namethai : item.start_location_nameeng}
                              </Text>
                              <View style={premiumStyles.routeArrowContainer}>
                                <MaterialIcons name="arrow-forward" size={wp('4%')} color="#FD501E" />
                              </View>
                              <Text style={premiumStyles.routeToText} numberOfLines={1} ellipsizeMode="tail">
                                {language === 'th' ? item.end_location_namethai : item.end_location_nameeng}
                              </Text>
                            </View>
                          </View>
                          
                          <View style={premiumStyles.routeFooter}>
                            <MaterialIcons name="place" size={wp('3%')} color="#999" />
                            <Text style={premiumStyles.routePierText} numberOfLines={1} ellipsizeMode="tail">
                              {language === 'th' ? item.md_pier_namethai : item.md_pier_nameeng}
                            </Text>
                          </View>
                        </View>
                        
                        {/* Hover Indicator */}
                        <View style={premiumStyles.routeIndicator} />
                      </LinearGradient>
                    </BlurView>
                  </TouchableOpacity>
                </View>
              ))}
          </View>

          {/* Load More Button - positioned below routes grid */}
          {!isLoadingTitle && visibleRoutes < poppularroute.length && (
            <View style={{ alignItems: 'center', marginTop: hp('1.5%'), marginBottom: hp('0.5%') }}>
              <TouchableOpacity 
                onPress={loadMoreRoutes}
                style={{
                  backgroundColor: '#FD501E',
                  paddingHorizontal: wp('6%'),
                  paddingVertical: hp('1%'),
                  borderRadius: wp('6%'),
                  // elevation: 2, // ลบ elevation ตามที่ผู้ใช้ขอ
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.2,
                  shadowRadius: 2,
                }}
              >
                <Text style={{ 
                  color: 'white', 
                  fontWeight: 'bold', 
                  fontSize: wp('3.5%'),
                  textAlign: 'center'
                }}>
                  {t('loadMore')}
                </Text>
              </TouchableOpacity>
            </View>
          )}


        </View>
        {isLoadingTitle ? (
          <View
            style={{
              height: hp('4.5%'),
              width: wp('37.5%'),
              borderRadius: wp('6.25%'),
              marginTop: hp('1%'),
              marginBottom: hp('1%'),
              marginLeft: 0,
              overflow: 'hidden',
              backgroundColor: '#eee',
              alignSelf: 'flex-start',
            }}
          >
            <Animated.View
              style={{
                width: wp('25%'),
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
        ) : (
          <View style={[premiumStyles.sectionTitleContainer, { marginTop: hp('1%'), marginBottom: hp('1%') }]}>
            <BlurView intensity={40} tint="light" style={premiumStyles.sectionTitleBlur}>
              <LinearGradient
                colors={['rgba(255,255,255,0.9)', 'rgba(255,250,246,0.85)']}
                style={premiumStyles.sectionTitleGradient}
              >
                <Text style={premiumStyles.sectionTitle}>
                  {t('topTrending')} <Text style={premiumStyles.sectionTitleAccent}>{t('places')}</Text>
                </Text>
                <Text style={premiumStyles.sectionSubtitle}>{t('mostPopularDestinations')}</Text>
              </LinearGradient>
            </BlurView>
          </View>
        )}
        
        {/* Top Trending Places - Enhanced Horizontal Scroll */}
        <View style={premiumStyles.trendingCarouselContainer}>
          {isLoadingTitle ? (
            <View style={premiumStyles.trendingCarouselSkeleton}>
              <Animated.View style={[premiumStyles.shimmerEffect, {
                transform: [{ translateX: shimmerAnim }],
              }]}>
                <LinearGradient
                  colors={['#eeeeee00', '#ddddddaa', '#eeeeee00']}
                  start={[0, 0]}
                  end={[1, 0]}
                  style={premiumStyles.shimmerGradient}
                />
              </Animated.View>
            </View>
          ) : (
            <ScrollView
              ref={scrollViewRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(event) => {
                const cardWidth = wp('95%'); // Card width + margins
                const index = Math.round(event.nativeEvent.contentOffset.x / cardWidth);
                setCurrentBanner(index);
              }}
              style={premiumStyles.trendingScrollView}
              contentContainerStyle={premiumStyles.trendingScrollContent}
            >
              {toptrending.map((item, index) => (
                <TouchableOpacity
                  key={item.md_location_id || `trending-${index}`}
                  style={premiumStyles.trendingCarouselCard}
                  onPress={() => {
                    updateCustomerData({
                      startingPointId: item.md_location_id,
                      startingpoint_name: language === 'th' ? item.md_location_namethai : item.md_location_nameeng,
                      countrycode: item.md_location_countriesid,
                      country: item.sys_countries_nameeng,
                    });
                    navigation.navigate('LocationDetail');
                  }}
                >
                  <BlurView intensity={50} tint="light" style={premiumStyles.trendingCarouselBlur}>
                    <View style={premiumStyles.trendingCarouselImageContainer}>
                      <Image
                        source={{ uri: `https://thetrago.com/Api/uploads/location/pictures/${item.md_location_picname}` }}
                        style={premiumStyles.trendingCarouselImage}
                        resizeMode="cover"
                      />
                      
                      {/* Enhanced Image Overlay with gradient */}
                      <LinearGradient
                        colors={[
                          'transparent', 
                          'rgba(0,0,0,0.2)', 
                          'rgba(0,0,0,0.6)', 
                          'rgba(0,0,0,0.8)'
                        ]}
                        locations={[0, 0.3, 0.7, 1]}
                        style={premiumStyles.trendingCarouselOverlay}
                      />
                      
                      {/* Trending Badge */}
                      {index < 3 && (
                        <Animated.View style={[premiumStyles.trendingCarouselBadge, {
                          transform: [
                            { 
                              translateY: bounceAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0, -3],
                              })
                            },
                            {
                              scale: bounceAnim.interpolate({
                                inputRange: [0, 0.5, 1],
                                outputRange: [1, 1.05, 1],
                              })
                            }
                          ],
                        }]}>
                          <LinearGradient
                            colors={['#FF6B35', '#FD501E', '#E04000']}
                            style={premiumStyles.trendingCarouselBadgeGradient}
                          >
                            <MaterialIcons name="trending-up" size={wp('4%')} color="#fff" />
                            <Text style={premiumStyles.trendingCarouselBadgeText}>#{index + 1} {t('trending')}</Text>
                          </LinearGradient>
                        </Animated.View>
                      )}
                      
                      {/* Rating Badge */}
                      <View style={premiumStyles.trendingCarouselRating}>
                        <BlurView intensity={80} tint="dark" style={premiumStyles.ratingBlurContainer}>
                          <MaterialIcons name="star" size={wp('4%')} color="#FFD700" />
                          <Text style={premiumStyles.trendingCarouselRatingText}>4.8</Text>
                        </BlurView>
                      </View>
                      
                      {/* Content Overlay */}
                      <View style={premiumStyles.trendingCarouselContent}>
                        <View style={premiumStyles.trendingCarouselTextContainer}>
                          <Text style={premiumStyles.trendingCarouselCountry} numberOfLines={1}>
                            {language === 'th' ? item.sys_countries_namethai : item.sys_countries_nameeng}
                          </Text>
                          <Text style={premiumStyles.trendingCarouselLocation} numberOfLines={2}>
                            {language === 'th' ? item.md_location_namethai : item.md_location_nameeng}
                          </Text>
                          
                          <View style={premiumStyles.trendingCarouselMeta}>
                            <View style={premiumStyles.trendingCarouselMetaItem}>
                              <MaterialIcons name="place" size={wp('4%')} color="#FD501E" />
                              <Text style={premiumStyles.trendingCarouselMetaText}>{t('exploreDestination')}</Text>
                            </View>
                          </View>
                        </View>
                      </View>
                    </View>
                  </BlurView>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
          
          {/* Carousel Indicators */}
          {!isLoadingTitle && (
            <View style={premiumStyles.carouselIndicators}>
              {toptrending.map((_, index) => (
                <Animated.View
                  key={index}
                  style={[
                    premiumStyles.carouselIndicator,
                    {
                      opacity: currentBanner === index ? 1 : 0.4,
                      backgroundColor: currentBanner === index ? '#FD501E' : '#fff',
                      transform: [{
                        scale: currentBanner === index ? 1.2 : 1
                      }]
                    }
                  ]}
                />
              ))}
            </View>
          )}
        </View>
        <View style={{
          paddingBottom: hp('2.5%'),
        }}>
          <View style={premiumStyles.sectionTitleContainer}>
            <BlurView intensity={40} tint="light" style={premiumStyles.sectionTitleBlur}>
              <LinearGradient
                colors={['rgba(255,255,255,0.9)', 'rgba(255,250,246,0.85)']}
                style={premiumStyles.sectionTitleGradient}
              >
                <Text style={premiumStyles.sectionTitle}>
                  {t('attraction')} <Text style={premiumStyles.sectionTitleAccent}>{t('popular')}</Text>
                </Text>
                <Text style={premiumStyles.sectionSubtitle}>{t('exploreTheBestAttractions')}</Text>
              </LinearGradient>
            </BlurView>
          </View>
          <View style={[styles.tabContainer]}>
            <View style={styles.tabContainer}>
              {attraction.map((item) => (
                <TouchableOpacity
                  key={item.md_province_id}
                  style={[styles.tab, activeattraction === item.md_province_id && styles.activeTab]} // ทำให้ปุ่มที่เลือกมีสีพื้นหลัง
                  onPress={() => {
                    setActiveattraction(item.md_province_id);

                  }}
                // เมื่อกดปุ่ม จะทำการเปลี่ยนสถานะ
                >
                  <Text style={[styles.tabText, activeattraction === item.md_province_id && styles.activeTabText]}>
                    {language === 'th' ? item.md_province_namethai : item.md_province_nameeng}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
        
        {/* Popular Attraction - Premium Grid Layout */}
        <View style={premiumStyles.attractionsGrid}>
          {isLoadingTitle
            ? Array(6).fill(null).map((_, index) => (
              <Animated.View key={`attraction-skeleton-${index}`} style={[premiumStyles.attractionCard, {
                transform: [{
                  scale: bounceAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.98, 1],
                  })
                }],
              }]}>
                <BlurView intensity={20} tint="light" style={premiumStyles.attractionBlur}>
                  <LinearGradient
                    colors={['rgba(255,255,255,0.9)', 'rgba(245,245,245,0.8)']}
                    style={premiumStyles.attractionGradient}
                  >
                    <View style={premiumStyles.attractionImageSkeleton}>
                      <Animated.View style={[premiumStyles.shimmerEffect, {
                        transform: [{ translateX: shimmerAnim }],
                      }]}>
                        <LinearGradient
                          colors={['#eeeeee00', '#ddddddaa', '#eeeeee00']}
                          start={[0, 0]}
                          end={[1, 0]}
                          style={premiumStyles.shimmerGradient}
                        />
                      </Animated.View>
                      
                      {/* Skeleton badges */}
                      <View style={[premiumStyles.attractionRatingBadge, { backgroundColor: '#e0e0e0' }]}>
                        <View style={[premiumStyles.attractionRatingContainer, { backgroundColor: 'transparent' }]}>
                          <View style={{ width: wp('3.5%'), height: wp('3.5%'), backgroundColor: '#ccc', borderRadius: wp('1.75%') }} />
                          <View style={{ width: wp('6%'), height: wp('3%'), backgroundColor: '#ccc', borderRadius: wp('1%'), marginLeft: wp('1%') }} />
                        </View>
                      </View>
                      
                      {index < 3 && (
                        <View style={[premiumStyles.attractionPopularBadge, { backgroundColor: '#e0e0e0' }]}>
                          <View style={[premiumStyles.attractionPopularBadgeGradient, { backgroundColor: 'transparent' }]}>
                            <View style={{ width: wp('3.2%'), height: wp('3.2%'), backgroundColor: '#ccc', borderRadius: wp('1.6%') }} />
                            <View style={{ width: wp('12%'), height: wp('2.8%'), backgroundColor: '#ccc', borderRadius: wp('1%'), marginLeft: wp('1%') }} />
                          </View>
                        </View>
                      )}
                    </View>
                    
                    <View style={[premiumStyles.attractionContent]}>
                      <View style={[premiumStyles.attractionTextSkeleton, { marginBottom: wp('2%'), height: hp('2.5%') }]}>
                        <Animated.View style={[premiumStyles.shimmerEffect, {
                          transform: [{ translateX: shimmerAnim }],
                        }]}>
                          <LinearGradient
                            colors={['#eeeeee00', '#ddddddaa', '#eeeeee00']}
                            start={[0, 0]}
                            end={[1, 0]}
                            style={premiumStyles.shimmerGradient}
                          />
                        </Animated.View>
                      </View>
                      
                      <View style={[premiumStyles.attractionTextSkeleton, { marginBottom: wp('3%'), height: hp('1.8%'), width: '70%' }]}>
                        <Animated.View style={[premiumStyles.shimmerEffect, {
                          transform: [{ translateX: shimmerAnim }],
                        }]}>
                          <LinearGradient
                            colors={['#eeeeee00', '#ddddddaa', '#eeeeee00']}
                            start={[0, 0]}
                            end={[1, 0]}
                            style={premiumStyles.shimmerGradient}
                          />
                        </Animated.View>
                      </View>
                      
                      <View style={[premiumStyles.attractionTextSkeleton, { height: hp('2%'), width: '50%' }]}>
                        <Animated.View style={[premiumStyles.shimmerEffect, {
                          transform: [{ translateX: shimmerAnim }],
                        }]}>
                          <LinearGradient
                            colors={['#eeeeee00', '#ddddddaa', '#eeeeee00']}
                            start={[0, 0]}
                            end={[1, 0]}
                            style={premiumStyles.shimmerGradient}
                          />
                        </Animated.View>
                      </View>
                    </View>
                  </LinearGradient>
                </BlurView>
              </Animated.View>
            ))
            : poppularAttraction.slice(0, visibleAttraction).map((item, index) => (
              <Animated.View
                key={item.md_tour_id ? `attraction-${item.md_tour_id}` : `attraction-index-${index}`}
                style={[premiumStyles.attractionCard, {
                  transform: [{
                    scale: bounceAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.99, 1],
                    })
                  }],
                }]}
              >
                <TouchableOpacity
                  style={premiumStyles.attractionTouchable}
                  onPress={() => {
                    // Navigate to attraction detail
                    console.log('Navigate to attraction:', language === 'th' ? item.md_tour_name_thai : item.md_tour_name_eng);
                  }}
                  activeOpacity={0.95}
                >
                  <BlurView intensity={25} tint="light" style={premiumStyles.attractionBlur}>
                    <LinearGradient
                      colors={['rgba(255,255,255,0.95)', 'rgba(255,250,246,0.92)']}
                      style={premiumStyles.attractionGradient}
                    >
                      <View style={premiumStyles.attractionImageContainer}>
                        <Image
                          source={{ uri: `https://tour.thetrago.com/manageadmin/uploads/tour/index/${item.md_tour_picname}` }}
                          style={premiumStyles.attractionImage}
                          resizeMode="cover"
                        />
                        
                        {/* Premium Image Overlay */}
                        <LinearGradient
                          colors={['transparent', 'rgba(0,0,0,0.1)', 'rgba(0,0,0,0.3)']}
                          locations={[0, 0.6, 1]}
                          style={premiumStyles.attractionImageOverlay}
                        />
                        
                        {/* Rating Badge with enhanced styling */}
                        <Animated.View style={[premiumStyles.attractionRatingBadge, {
                          transform: [{
                            scale: bounceAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [1, 1.05],
                            })
                          }],
                        }]}>
                          <BlurView intensity={95} tint="dark" style={premiumStyles.attractionRatingContainer}>
                            <Ionicons name="star" size={wp('3.5%')} color="#FFD700" />
                            <Text style={premiumStyles.attractionRatingText}>
                              {formatDecimal(item.md_tour_star)}
                            </Text>
                          </BlurView>
                        </Animated.View>
                        
                        {/* Enhanced Popular Badge for top 3 */}
                        {index < 3 && (
                          <Animated.View style={[premiumStyles.attractionPopularBadge, {
                            transform: [
                              {
                                translateY: bounceAnim.interpolate({
                                  inputRange: [0, 1],
                                  outputRange: [0, -3],
                                })
                              },
                              {
                                scale: bounceAnim.interpolate({
                                  inputRange: [0, 1],
                                  outputRange: [1, 1.08],
                                })
                              }
                            ],
                          }]}>
                            <LinearGradient
                              colors={['#FF6B35', '#FD501E']}
                              style={premiumStyles.attractionPopularBadgeGradient}
                            >
                              <MaterialIcons name="local-fire-department" size={wp('3.2%')} color="#fff" />
                              <Text style={premiumStyles.attractionPopularBadgeText}>{t('popular')}</Text>
                            </LinearGradient>
                          </Animated.View>
                        )}

                        {/* New Rank Badge for top positions */}
                        {index < 3 && (
                          <View style={[premiumStyles.attractionRankBadge, { backgroundColor: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : '#CD7F32' }]}>
                            <Text style={premiumStyles.attractionRankText}>#{index + 1}</Text>
                          </View>
                        )}
                      </View>
                      
                      <View style={premiumStyles.attractionContent}>
                        <Text style={premiumStyles.attractionName} numberOfLines={2}>
                          {truncateText(language === 'th' ? item.md_tour_name_thai : item.md_tour_name_eng)}
                        </Text>
                        
                        <View style={premiumStyles.attractionMeta}>
                          <View style={premiumStyles.attractionMetaItem}>
                            <MaterialIcons name="people" size={wp('3.5%')} color="#666" />
                            <Text style={premiumStyles.attractionMetaText}>
                              {item.md_tour_count} {t('booked')}
                            </Text>
                          </View>
                        </View>
                        
                        <View style={premiumStyles.attractionPriceContainer}>
                          <Text style={premiumStyles.attractionPriceLabel}>{t('startFrom')}</Text>
                          <Text style={premiumStyles.attractionPrice}>
                            ฿{formatNumberWithComma(item.md_tour_priceadult)}
                          </Text>
                        </View>
                      </View>
                      
                      {/* Enhanced Hover Indicator */}
                      <Animated.View style={[premiumStyles.attractionIndicator, {
                        transform: [{
                          scaleX: bounceAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [1, 1.2],
                          })
                        }],
                      }]} />
                    </LinearGradient>
                  </BlurView>
                </TouchableOpacity>
              </Animated.View>
            ))}
        </View>
        
        {/* Premium Show More Button */}
        {poppularAttraction.length > visibleAttraction && (
          <View style={{ alignItems: 'center', marginTop: hp('1.5%'), marginBottom: hp('0.5%') }}>
            <TouchableOpacity 
              onPress={() => setvisibleAttraction(prev => prev + 6)}
              style={{
                backgroundColor: '#FD501E',
                paddingHorizontal: wp('6%'),
                paddingVertical: hp('1%'),
                borderRadius: wp('6%'),
                elevation: 2,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.2,
                shadowRadius: 2,
              }}
            >
              <Text style={{ 
                color: 'white', 
                fontWeight: 'bold', 
                fontSize: wp('3.5%'),
                textAlign: 'center'
              }}>
                {t('loadMore')}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
      </View>
      
      {/* Debug component - set visible={true} to see safe area values */}
      <SafeAreaDebugger visible={false} />
    </CrossPlatformStatusBar>
  );
};

export default HomeScreen;

// Ultra Premium Styles
const premiumStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent', // CrossPlatformStatusBar handles the orange background
    // Ensure consistent behavior across platforms
    paddingTop: 0, // CrossPlatformStatusBar will handle the padding
  },
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  particlesContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  particle: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  geometricShapes: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  shape1: {
    position: 'absolute',
    top: hp('15%'),
    right: wp('10%'),
  },
  shape2: {
    position: 'absolute',
    bottom: hp('25%'),
    left: wp('8%'),
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingBlur: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    alignItems: 'center',
    padding: wp('10%'),
  },
  loadingSpinner: {
    width: wp('20%'),
    height: wp('20%'),
    borderRadius: wp('10%'),
    marginBottom: hp('2.5%'),
    overflow: 'hidden',
  },
  loadingGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: wp('4.5%'),
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: hp('1%'),
  },
  loadingSubtext: {
    fontSize: wp('3.5%'),
    color: 'rgba(255,255,255,0.7)',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: hp('12.5%'),
  },
  headerSection: {
    marginTop: hp('2%'),
    marginHorizontal: wp('3%'),
    borderRadius: wp('6%'),
    overflow: 'hidden',
    // Unified shadow system for both platforms
    shadowColor: Platform.OS === 'android' ? 'transparent' : '#000',
    shadowOffset: Platform.OS === 'android' ? { width: 0, height: 0 } : { width: 0, height: 6 },
    shadowOpacity: Platform.OS === 'android' ? 0 : 0.2,
    shadowRadius: Platform.OS === 'android' ? 0 : 12,
    elevation: Platform.OS === 'android' ? 0 : 8,
    // Additional Android compatibility
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  headerBlur: {
    borderRadius: wp('6%'),
    overflow: 'hidden',
  },
  headerGradient: {
    paddingVertical: hp('2.5%'),
    paddingHorizontal: wp('4%'),
    position: 'relative',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp('1.5%'),
  },
  headerActionsLeft: {
    width: wp('12%'),
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  headerActionsRight: {
    width: wp('12%'),
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  logoWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  premiumBadge: {
    position: 'absolute',
    top: -hp('0.8%'),
    right: -wp('6%'),
    borderRadius: wp('2.5%'),
    overflow: 'hidden',
  },
  badgeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp('1.5%'),
    paddingVertical: hp('0.4%'),
    borderRadius: wp('2.5%'),
  },
  badgeText: {
    fontSize: wp('2.2%'),
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: wp('0.8%'),
  },
  notificationButton: {
    borderRadius: 18,
    overflow: 'hidden',
  },
  profileButton: {
    borderRadius: 18,
    overflow: 'hidden',
  },
  actionButtonBlur: {
    padding: 8,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF4444',
  },
  searchSection: {
    marginTop: hp('0.5%'),
  },
  searchSkeleton: {
    height: 50,
    borderRadius: 25,
    backgroundColor: '#eee',
    overflow: 'hidden',
  },
  searchContainer: {
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: '#FD501E',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  searchGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  searchIconContainer: {
    marginRight: 12,
  },
  searchInputContainer: {
    flex: 1,
    position: 'relative',
    height: 26,
    justifyContent: 'center',
  },
  searchPlaceholder: {
    position: 'absolute',
    width: '100%',
    fontSize: wp('3.5%'),
  },
  placeholderText: {
    fontWeight: '500',
  },
  searchInput: {
    height: 26,
    fontSize: wp('3.5%'),
    color: '#333',
    paddingVertical: 0,
  },
  filterButton: {
    marginLeft: 12,
    padding: 4,
  },
  headerDecorations: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  headerDecor1: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(253,80,30,0.1)',
  },
  headerDecor2: {
    position: 'absolute',
    bottom: -30,
    left: -30,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,107,53,0.08)',
  },
  shimmerEffect: {
    width: 200,
    height: '100%',
  },
  shimmerGradient: {
    width: '100%',
    height: '100%',
  },
  servicesSection: {
    marginTop: hp('1.5%'),
    marginHorizontal: wp('3%'),
  },
  servicesContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    // Unified shadow system for both platforms
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  servicesBlur: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  servicesGradient: {
    paddingVertical: hp('2.5%'),
    paddingHorizontal: wp('4%'),
  },
  servicesTitleContainer: {
    alignItems: 'center',
    marginBottom: hp('1.5%'),
  },
  servicesTitle: {
    fontSize: wp('5%'),
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: hp('0.8%'),
  },
  servicesSubtitle: {
    fontSize: wp('3.5%'),
    color: '#718096',
    fontStyle: 'italic',
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  serviceItemContainer: {
    width: '23.5%',
    marginBottom: hp('1.5%'),
  },
  serviceSkeleton: {
    alignItems: 'center',
  },
  serviceSkeletonIcon: {
    width: wp('14%'),
    height: wp('14%'),
    borderRadius: wp('7%'),
    backgroundColor: '#eee',
    overflow: 'hidden',
    marginBottom: 8,
  },
  serviceSkeletonText: {
    height: 12,
    width: 40,
    borderRadius: 6,
    backgroundColor: '#eee',
    overflow: 'hidden',
  },
  serviceItem: {
    borderRadius: 16,
    overflow: 'hidden',
    // Unified shadow system for both platforms
    shadowColor: '#FD501E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  serviceItemBlur: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  serviceItemGradient: {
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    position: 'relative',
  },
  serviceBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    borderRadius: 8,
    overflow: 'hidden',
    zIndex: 10,
  },
  serviceIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(253,80,30,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  serviceItemText: {
    fontSize: wp('2.8%'),
    fontWeight: '600',
    color: '#2d3748',
    textAlign: 'center',
  },
  hoverIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#FD501E',
    borderRadius: 1,
  },
  hotDealsSection: {
    marginTop: hp('1.5%'),
    marginHorizontal: wp('3%'),
  },
  hotDealsContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    // Unified shadow system for both platforms
    shadowColor: '#FD501E',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
    backgroundColor: 'rgba(253, 80, 30, 0.95)',
  },
  hotDealsSkeleton: {
    height: 50,
    borderRadius: 20,
    backgroundColor: '#eee',
    overflow: 'hidden',
  },
  hotDealsBlur: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  hotDealsGradient: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    position: 'relative',
  },
  hotDealsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  hotDealsTextContainer: {
    marginLeft: wp('2.5%'),
    flex: 1,
  },
  hotDealsTitle: {
    fontSize: wp('5%'),
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: wp('0.5%'),
  },
  hotDealsAccent: {
    color: 'rgba(255,255,255,0.85)',
    fontStyle: 'italic',
  },
  hotDealsSubtitle: {
    fontSize: wp('2.8%'),
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
  },
  floatingElement1: {
    position: 'absolute',
    top: 6,
    right: 50,
  },
  floatingElement2: {
    position: 'absolute',
    bottom: 8,
    left: 80,
  },
  bannerSection: {
    marginTop: hp('1.5%'),
    marginHorizontal: wp('3%'),
  },
  bannerSkeleton: {
    height: hp('20%'),
    borderRadius: wp('4.5%'),
    backgroundColor: 'rgba(253,80,30,0.1)',
    overflow: 'hidden',
  },
  bannerContainer: {
    borderRadius: wp('4.5%'),
    overflow: 'hidden',
    // Unified shadow system for both platforms
    shadowColor: '#FD501E',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  bannerBlur: {
    borderRadius: wp('4.5%'),
    overflow: 'hidden',
  },
  bannerGradient: {
    position: 'relative',
  },
  bannerContentWrapper: {
    paddingHorizontal: wp('5%'),
    paddingVertical: wp('3%'),
  },
  bannerOverlay: {
    position: 'absolute',
    top: wp('3%'),
    right: wp('3%'),
  },
  bannerBadge: {
    borderRadius: wp('3%'),
    overflow: 'hidden',
    // Unified shadow system for both platforms
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: hp('0.4%') },
    shadowOpacity: 0.25,
    shadowRadius: wp('1.5%'),
    elevation: 6,
    backgroundColor: 'rgba(255, 215, 0, 0.95)',
  },
  bannerBadgeText: {
    fontSize: wp('2.8%'),
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: wp('1.25%'),
  },
  
  // Section Title Styles
  sectionTitleContainer: {
    marginTop: hp('1.5%'),
    marginBottom: hp('1.5%'),
    marginHorizontal: wp('2.5%'),
  },
  sectionTitleBlur: {
    borderRadius: wp('4%'),
    overflow: 'hidden',
  },
  sectionTitleGradient: {
    paddingHorizontal: wp('5%'),
    paddingVertical: wp('3%'),
  },
  sectionTitle: {
    fontSize: wp('5.5%'),
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'left',
    marginBottom: hp('0.5%'),
  },
  sectionTitleAccent: {
    color: '#FD501E',
  },
  sectionSubtitle: {
    fontSize: wp('3.5%'),
    color: '#666',
    fontWeight: '500',
    textAlign: 'left',
  },
  
  // Destination Cards Styles
  destinationsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: wp('2.5%'),
    marginTop: hp('1%'),
  },
  destinationCard: {
    width: wp('30%'), // Using responsive width
    marginBottom: hp('2%'),
  },
  destinationTouchable: {
    width: '100%',
  },
  destinationBlur: {
    borderRadius: wp('3%'), // More responsive border radius
    overflow: 'hidden',
    // Unified shadow system for both platforms
    shadowColor: '#000',
    shadowOffset: { width: 0, height: hp('0.3%') },
    shadowOpacity: 0.1,
    shadowRadius: wp('1.5%'),
    elevation: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  destinationGradient: {
    position: 'relative',
  },
  destinationImageContainer: {
    width: '100%',
    height: wp('25%'), // Using width-based responsive height for better aspect ratio
    position: 'relative',
    borderTopLeftRadius: wp('3%'),
    borderTopRightRadius: wp('3%'),
    overflow: 'hidden',
  },
  destinationImageSkeleton: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#eee',
    borderTopLeftRadius: wp('3%'),
    borderTopRightRadius: wp('3%'),
    overflow: 'hidden',
  },
  destinationImage: {
    width: '100%',
    height: '100%',
  },
  destinationOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '40%',
  },
  destinationContent: {
    padding: wp('2.5%'), // More responsive padding
    paddingTop: wp('2%'),
    paddingBottom: wp('2.5%'),
    minHeight: wp('12%'), // Using width-based min height for consistency
  },
  destinationTextSkeleton: {
    height: wp('4%'), // Width-based height
    borderRadius: wp('1%'),
    backgroundColor: '#eee',
    overflow: 'hidden',
  },
  destinationName: {
    fontSize: wp('3.2%'), // Slightly smaller font for better fit
    fontWeight: 'bold',
    color: '#333',
    marginBottom: wp('1%'),
    textAlign: 'center', // Center align for better look
  },
  destinationMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // Center the explore button
    marginTop: wp('0.5%'),
  },
  destinationMetaText: {
    fontSize: wp('2.8%'), // Smaller font for better fit
    color: '#FD501E',
    fontWeight: '600',
    marginLeft: wp('1%'),
  },
  destinationIndicator: {
    position: 'absolute',
    bottom: 0,
    left: '50%',
    transform: [{ translateX: -wp('1%') }],
    width: wp('2%'),
    height: wp('0.5%'), // Width-based height for consistency
    backgroundColor: '#FD501E',
    borderTopLeftRadius: wp('1%'),
    borderTopRightRadius: wp('1%'),
  },

  // Routes Grid Styles
  routesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start', // Align cards to the left
    paddingHorizontal: wp('1%'),
    marginTop: hp('1%'),
  },
  routeCard: {
    width: '31%', // 3 columns layout
    height: hp('22%'), // Fixed height for consistent appearance
    marginBottom: hp('2%'),
    marginRight: wp('2%'), // Add margin between cards
  },
  routeTouchable: {
    width: '100%',
  },
  routeBlur: {
    height: '100%', // Take full height of parent container
    borderRadius: wp('3%'),
    overflow: 'hidden',
    // Unified shadow system for both platforms
    shadowColor: '#000',
    shadowOffset: { width: 0, height: hp('0.3%') },
    shadowOpacity: 0.1,
    shadowRadius: wp('1.5%'),
    elevation: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  routeGradient: {
    position: 'relative',
    height: '100%', // Full height
    justifyContent: 'space-between', // Distribute content evenly
  },
  routeImageContainer: {
    width: '100%',
    height: hp('12%'), // Reduced height for better proportions
    position: 'relative',
    borderTopLeftRadius: wp('3%'),
    borderTopRightRadius: wp('3%'),
    overflow: 'hidden',
  },
  routeImageSkeleton: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#eee',
    borderTopLeftRadius: wp('3%'),
    borderTopRightRadius: wp('3%'),
    overflow: 'hidden',
  },
  routeImage: {
    width: '100%',
    height: '100%',
  },
  routeImageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '40%',
  },
  hotRouteBadge: {
    position: 'absolute',
    top: wp('2%'),
    left: wp('2%'),
    borderRadius: wp('3%'),
    overflow: 'hidden',
  },
  hotRouteBadgeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp('2%'),
    paddingVertical: wp('1%'),
  },
  hotRouteBadgeText: {
    color: '#fff',
    fontSize: wp('2.5%'),
    fontWeight: 'bold',
    marginLeft: wp('1%'),
  },
  routeContent: {
    padding: wp('2.5%'),
    paddingTop: wp('2%'),
    paddingBottom: wp('2.5%'),
    flex: 1, // Take remaining space
    justifyContent: 'space-between', // Distribute content evenly
  },
  routeTextSkeleton: {
    height: wp('4%'),
    borderRadius: wp('1%'),
    backgroundColor: '#eee',
    overflow: 'hidden',
    marginTop: wp('1%'),
  },
  routeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginBottom: wp('1%'),
  },
  routeFromText: {
    fontSize: wp('3%'),
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    flex: 0,
    numberOfLines: 1, // Prevent text wrapping
  },
  routeArrowContainer: {
    marginHorizontal: wp('1%'),
  },
  routeToText: {
    fontSize: wp('3%'),
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    flex: 0,
    numberOfLines: 1, // Prevent text wrapping
  },
  routeFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 'auto', // Push to bottom
    paddingTop: wp('1%'), // Add some spacing
  },
  routePierText: {
    fontSize: wp('2.8%'),
    color: '#999',
    fontWeight: '500',
    marginLeft: wp('1%'),
    textAlign: 'center',
    numberOfLines: 1, // Prevent text wrapping
    ellipsizeMode: 'tail', // Add ellipsis if text is too long
  },
  routeIndicator: {
    position: 'absolute',
    bottom: 0,
    left: '50%',
    transform: [{ translateX: -wp('1%') }],
    width: wp('2%'),
    height: wp('0.5%'),
    backgroundColor: '#FD501E',
    borderTopLeftRadius: wp('1%'),
    borderTopRightRadius: wp('1%'),
  },

  // Enhanced Top Trending Carousel Styles
  trendingCarouselContainer: {
    marginTop: hp('1%'),
    marginBottom: hp('2%'),
  },
  trendingCarouselSkeleton: {
    width: wp('90%'),
    height: hp('35%'),
    borderRadius: wp('6%'),
    backgroundColor: '#eee',
    marginHorizontal: wp('5%'),
    overflow: 'hidden',
    alignSelf: 'center',
  },
  trendingScrollView: {
    width: '100%',
  },
  trendingScrollContent: {
    paddingHorizontal: wp('2.5%'),
  },
  trendingCarouselCard: {
    width: wp('90%'),
    height: hp('35%'),
    marginHorizontal: wp('2.5%'),
    borderRadius: wp('6%'),
    overflow: 'hidden',
    // Unified shadow system for both platforms
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: hp('1%') },
    shadowOpacity: 0.25,
    shadowRadius: wp('3%'),
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  trendingCarouselBlur: {
    flex: 1,
    borderRadius: wp('6%'),
    overflow: 'hidden',
  },
  trendingCarouselImageContainer: {
    flex: 1,
    position: 'relative',
  },
  trendingCarouselImage: {
    width: '100%',
    height: '100%',
  },
  trendingCarouselOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
  },
  trendingCarouselBadge: {
    position: 'absolute',
    top: wp('4%'),
    left: wp('4%'),
    borderRadius: wp('6%'),
    overflow: 'hidden',
  },
  trendingCarouselBadgeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp('3%'),
    paddingVertical: wp('2%'),
  },
  trendingCarouselBadgeText: {
    color: '#fff',
    fontSize: wp('3.2%'),
    fontWeight: 'bold',
    marginLeft: wp('1.5%'),
  },
  trendingCarouselRating: {
    position: 'absolute',
    top: wp('4%'),
    right: wp('4%'),
    borderRadius: wp('5%'),
    overflow: 'hidden',
  },
  ratingBlurContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp('2.5%'),
    paddingVertical: wp('1.5%'),
  },
  trendingCarouselRatingText: {
    color: '#fff',
    fontSize: wp('3.5%'),
    fontWeight: 'bold',
    marginLeft: wp('1%'),
  },
  trendingCarouselContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: wp('5%'),
    paddingTop: wp('8%'),
  },
  trendingCarouselTextContainer: {
    alignItems: 'flex-start',
  },
  trendingCarouselCountry: {
    fontSize: wp('6%'),
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: wp('1%'),
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  trendingCarouselLocation: {
    fontSize: wp('4.2%'),
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
    marginBottom: wp('3%'),
    lineHeight: wp('5%'),
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  trendingCarouselMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendingCarouselMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(253,80,30,0.9)',
    paddingHorizontal: wp('3%'),
    paddingVertical: wp('2%'),
    borderRadius: wp('5%'),
  },
  trendingCarouselMetaText: {
    fontSize: wp('3.5%'),
    color: '#fff',
    fontWeight: '600',
    marginLeft: wp('1.5%'),
  },
  
  // Carousel Indicators
  carouselIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: hp('2%'),
    marginBottom: hp('1%'),
  },
  carouselIndicator: {
    width: wp('2.5%'),
    height: wp('2.5%'),
    borderRadius: wp('1.25%'),
    backgroundColor: '#fff',
    marginHorizontal: wp('1%'),
    // Unified shadow system for both platforms
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },

  // Remove old grid styles (keep for backward compatibility but won't be used)
  trendingPlacesGrid: {
    display: 'none', // Hide grid layout
  },

  // Premium Popular Attraction Styles
  attractionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: wp('4%'),
    paddingTop: hp('1.5%'),
    paddingBottom: hp('3%'),
  },
  attractionCard: {
    width: '32%',
    marginBottom: hp('1.5%'),
    borderRadius: wp('4%'),
    overflow: 'hidden',
    // Unified shadow system for both platforms
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: hp('0.8%') },
    shadowOpacity: 0.25,
    shadowRadius: wp('3%'),
    backgroundColor: 'rgba(255,255,255,0.98)',
  },
  attractionTouchable: {
    flex: 1,
  },
  attractionBlur: {
    flex: 1,
    borderRadius: wp('4%'),
    overflow: 'hidden',
  },
  attractionGradient: {
    flex: 1,
    borderRadius: wp('4%'),
    overflow: 'hidden',
  },
  attractionImageContainer: {
    height: hp('12%'),
    position: 'relative',
  },
  attractionImage: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: wp('4%'),
    borderTopRightRadius: wp('4%'),
  },
  attractionImageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '40%',
  },
  attractionRatingBadge: {
    position: 'absolute',
    top: wp('2%'),
    right: wp('2%'),
    borderRadius: wp('3%'),
    overflow: 'hidden',
    // Unified shadow system for both platforms
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    backgroundColor: 'rgba(253, 80, 30, 0.95)',
  },
  attractionRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp('2%'),
    paddingVertical: wp('1%'),
  },
  attractionRatingText: {
    color: '#fff',
    fontSize: wp('2.8%'),
    fontWeight: 'bold',
    marginLeft: wp('0.5%'),
  },
  attractionPopularBadge: {
    position: 'absolute',
    top: wp('2%'),
    left: wp('2%'),
    borderRadius: wp('3%'),
    overflow: 'hidden',
    // Unified shadow system for both platforms
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    backgroundColor: 'rgba(255, 215, 0, 0.95)',
  },
  attractionPopularBadgeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp('2%'),
    paddingVertical: wp('1%'),
  },
  attractionPopularBadgeText: {
    color: '#fff',
    fontSize: wp('2.5%'),
    fontWeight: 'bold',
    marginLeft: wp('1%'),
  },
  attractionRankBadge: {
    position: 'absolute',
    bottom: wp('2%'),
    left: wp('2%'),
    width: wp('5%'),
    height: wp('5%'),
    borderRadius: wp('2.5%'),
    justifyContent: 'center',
    alignItems: 'center',
    // Unified shadow system for both platforms
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    backgroundColor: 'rgba(253, 80, 30, 0.95)',
  },
  attractionRankText: {
    color: '#fff',
    fontSize: wp('2.2%'),
    fontWeight: 'bold',
  },
  attractionContent: {
    padding: wp('3%'),
    paddingTop: wp('2.5%'),
    minHeight: hp('8%'),
  },
  attractionName: {
    fontSize: wp('3.5%'),
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: wp('1.5%'),
    lineHeight: wp('4.5%'),
    minHeight: wp('9%'), // 2 lines minimum
  },
  attractionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: wp('2%'),
  },
  attractionMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  attractionMetaText: {
    fontSize: wp('3%'),
    color: '#666',
    marginLeft: wp('1%'),
    fontWeight: '500',
  },
  attractionPriceContainer: {
    alignItems: 'flex-start',
  },
  attractionPriceLabel: {
    fontSize: wp('2.8%'),
    color: '#888',
    marginBottom: wp('0.5%'),
  },
  attractionPrice: {
    fontSize: wp('4.2%'),
    fontWeight: 'bold',
    color: '#FD501E',
  },
  attractionIndicator: {
    position: 'absolute',
    bottom: 0,
    left: '50%',
    transform: [{ translateX: -wp('1%') }],
    width: wp('2%'),
    height: wp('0.5%'),
    backgroundColor: '#FD501E',
    borderTopLeftRadius: wp('1%'),
    borderTopRightRadius: wp('1%'),
  },
  
  // Skeleton styles for attractions
  attractionImageSkeleton: {
    height: hp('12%'),
    backgroundColor: '#eee',
    overflow: 'hidden',
    borderTopLeftRadius: wp('4%'),
    borderTopRightRadius: wp('4%'),
  },
  attractionTextSkeleton: {
    height: hp('3%'),
    backgroundColor: '#eee',
    borderRadius: wp('1%'),
    overflow: 'hidden',
  },
  
  // Show More Button Styles
  showMoreContainer: {
    alignItems: 'center',
    marginTop: hp('2.5%'),
    marginBottom: hp('3%'),
    paddingHorizontal: wp('5%'),
  },
  showMoreButton: {
    borderRadius: wp('10%'),
    overflow: 'hidden',
    // Unified shadow system for both platforms
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: hp('0.8%') },
    shadowOpacity: 0.3,
    shadowRadius: wp('3%'),
    backgroundColor: 'rgba(253, 80, 30, 0.95)',
  },
  showMoreBlur: {
    borderRadius: wp('10%'),
    overflow: 'hidden',
  },
  showMoreGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: wp('10%'),
    paddingVertical: hp('2%'),
    borderRadius: wp('10%'),
  },
  showMoreText: {
    color: '#fff',
    fontSize: wp('4.2%'),
    fontWeight: 'bold',
    marginLeft: wp('2.5%'),
  },
  
  // Common shimmer styles
  shimmerEffect: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  shimmerGradient: {
    flex: 1,
    width: '200%',
  },
});

