import React, { useRef, useState, useEffect, use } from 'react';
import ipAddress from './ipconfig';
import Icon from 'react-native-vector-icons/Ionicons';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, Modal, FlatList, ImageBackground, Animated } from 'react-native';
import DateTimePicker from "@react-native-community/datetimepicker";
import LogoTheTrago from './(component)/Logo';
import { useCustomer } from './(Screen)/CustomerContext';
import moment from 'moment';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const itemsPerPage = 5;


const SearchFerry = ({ navigation, route }) => {
  const { customerData, updateCustomerData } = useCustomer();
  const [detaDepart, setDetaDepart] = useState(new Date(customerData.departdate)); // แปลงวันที่จาก input
  const [detaReturn, setDetaReturn] = useState(new Date(customerData.returndate)); // แปลงวันที่จาก input
  const formattedDateDepart = detaDepart.toISOString().split('T')[0];
  const formattedDateReturn = detaReturn.toISOString().split('T')[0];
  const [startingPoint, setStartingPoint] = useState({ id: customerData.startingPointId, name: customerData.startingpoint_name });
  const [endPoint, setEndPoint] = useState({ id: customerData.endPointId, name: customerData.endpoint_name });
  const [searchQuery, setSearchQuery] = useState('');
  const [tripType, setTripType] = useState(customerData.tripTypeinput);
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
  const animatedHeight = useRef(new Animated.Value(0)).current;
  const contentHeights = useRef({}).current;
  const [isonewaystatus, setIsonewaystatus] = useState(false);
  const [isroudstatus, setIsroudstatus] = useState(false);
  
  const [departureDate, setDepartureDate] = useState(detaDepart);
  const [returnDate, setReturnDate] = useState(detaReturn);
  const [showDepartPicker, setShowDepartPicker] = useState(false);
  const [showReturnPicker, setShowReturnPicker] = useState(false);
  const day = formattedDateDepart.substring(8, 10);
  console.log(day);
  const month = formattedDateDepart.substring(5, 7);
  console.log(month);
  const year = formattedDateDepart.substring(0, 4);
  console.log(year);




  const toggleDetails = (id) => {
    if (selectedPickup === id) {
      Animated.timing(animatedHeight, {
        toValue: 0,
        duration: 500,
        useNativeDriver: false,
      }).start(() => setSelectedPickup(null));
    } else {
      setSelectedPickup(id);
      Animated.timing(animatedHeight, {
        toValue: contentHeights[id] || 470,
        duration: 500,
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
    setIsonewaystatus(false);
    setIsroudstatus(false);
  }, [startingPoint, endPoint, departureDate, returnDate, tripType,adults,children]);



  const handleSearchStart = () => {


    fetch(`${ipAddress}/search/${startingPoint.id}/${endPoint.id}/${formattedDateDepart}`)
      .then((response) => {
        if (!response.ok) {

          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        if (data && Array.isArray(data.data)) {
          setTimetableDepart(data.data);
        } else {
          console.error('Data is not an array', data);
          setTimetableDepart([]);
        }
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  };

  const handleSearchEnd = () => {
    fetch(`${ipAddress}/search/${endPoint.id}/${startingPoint.id}/${formattedDateReturn}`)
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
      });
  };

  const pagedDataDepart = timetableDepart.slice(
    (currentPageDepart - 1) * itemsPerPage,
    currentPageDepart * itemsPerPage
  );

  // ฟังก์ชันในการเปลี่ยนหน้า
  const goToNextPageDepart = () => {
    if (currentPageDepart * itemsPerPage < timetableDepart.length) {
      setcurrentPageDepart(currentPageDepart + 1);
    }
  };

  const goToPreviousPageDepart = () => {
    if (currentPageDepart > 1) {
      setcurrentPageDepart(currentPageDepart - 1);
    }
  };

  const pagedDataReturn = timetableReturn.slice(
    (currentPageReturn - 1) * itemsPerPage,
    currentPageReturn * itemsPerPage
  );

  // ฟังก์ชันในการเปลี่ยนหน้า
  const goToNextPageReturn = () => {
    if (currentPageReturn * itemsPerPage < timetableReturn.length) {
      setcurrentPageReturn(currentPageReturn + 1);
    }
  };

  const goToPreviousPageReturn = () => {
    if (currentPageReturn > 1) {
      setcurrentPageReturn(currentPageReturn - 1);
    }
  };




  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ImageBackground
        source={{ uri: 'https://www.thetrago.com/assets/images/bg/Aliments.png' }}
        style={styles.background}>
        <LogoTheTrago />

        <Text style={styles.title}>Search ferry</Text>

        {/* Search Box */}
        <View style={styles.searcContain}>
          <TextInput
            style={styles.searchBox}
            placeholder="Search Here..."
            placeholderTextColor="#999"
            backgroundColor="white"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <Image source={require('./assets/BTN1.png')} />
        </View>
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
              onPress={() => navigation.navigate('EndPointScreen', { setEndPoint, startingPointId: startingPoint.id, })}
              style={styles.inputBox}
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

            <View style={styles.inputBox}>
              <TouchableOpacity
                onPress={() => {
                  setShowDepartPicker(true);  // Show the date picker

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
                  <Text style={styles.inputText}>{departureDate ? formatDateInput(departureDate.toString()) : "Select Date"}</Text>
                </View>
              </TouchableOpacity>

              {tripType === "Return Trip" && (
                <>
                  <Image
                    source={require('./assets/Line 2.png')}
                    style={styles.logoLine}
                    resizeMode="contain"
                  />
                  <TouchableOpacity onPress={() => setShowReturnPicker(true)} disabled={!departureDate}
                    style={styles.rowdepart}>

                    <Image
                      source={require('./assets/solar_calendar-yellow.png')}
                      style={styles.logoDate}
                      resizeMode="contain"
                    />
                    <View style={styles.inputBoxCol}>
                      <Text style={styles.inputLabel}>Return date</Text>
                      <Text style={styles.inputText}>{returnDate ? formatDateInput(returnDate.toString()) : "No Date Available"}</Text>
                    </View>
                  </TouchableOpacity>
                </>
              )}
            </View>

            {showDepartPicker && (
              <DateTimePicker
                value={departureDate || new Date()} // ถ้ายังไม่มีการเลือกวันที่ให้ใช้วันที่ปัจจุบัน
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowDepartPicker(false);
                  if (selectedDate) {
                    setDepartureDate(selectedDate);  // อัพเดทค่า departDate เมื่อผู้ใช้เลือกวันที่
                    if (returnDate <= selectedDate) {
                      const newReturnDate = new Date(selectedDate);  // Create a new Date object based on the departDate
                      newReturnDate.setDate(newReturnDate.getDate() + 1);  // Increment by 1 day for return date
                      setReturnDate(newReturnDate);
                    }
                  }
                }}
                minimumDate={new Date()}  // เลือกวันที่เดินทางได้ตั้งแต่วันนี้
                maximumDate={null}
              />
            )}

            {showReturnPicker && (
              <DateTimePicker
                value={returnDate}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowReturnPicker(false);
                  if (selectedDate) setReturnDate(selectedDate);
                }}
                minimumDate={new Date(new Date(departureDate).setDate(departureDate.getDate() + 1))}  // วันที่กลับต้องไม่สามารถน้อยกว่าวันเดินทาง
                maximumDate={null}
              />
            )}

          </View>
        </View>



        {/* <TouchableOpacity
          style={[styles.searchButton]} // Use an array if you want to combine styles
          onPress={() => {
           

           
          }}>
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity> */}

        {/* แสดงรายการแต่ละหน้า */}

        {tripTypeSearch === 'One Way Trip' && (
          <>
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
                          style={{ width: wp('10.6%'), height: hp('5%')}}
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
                        <Text style={styles.subtext}>{formatDate(formattedDateDepart)}</Text>
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
                        <Text style={styles.subtext}>{formatDate(formattedDateDepart)}</Text>
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
                            departdate: formattedDateDepart,
                            timeTableDepartId: item.md_timetable_id,
                            startingPointId: startingPoint.id,
                            startingpoint_name:startingPoint.name,
                            endPointId: endPoint.id,
                            endpoint_name: endPoint.name,
                            companyDepartId: item.md_timetable_companyid,
                            pierStartDepartId: item.md_timetable_pierstart,
                            pierEndDepartId: item.md_timetable_pierend,
                            adult:adults,
                            child:children,
                            infant:infant,
                            timetableReturn:item.md_timetable_id,
                            piccompanyDepart:item.md_company_picname,
                            pictimetableDepart:item.md_timetabledetail_picname1,

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

                    <Animated.View style={{ height: selectedPickup === item.md_timetable_id ? animatedHeight : 0, overflow: 'hidden' }}>
                      <Text style={{ color: '#666666' }}> {removeHtmlTags(item.md_timetabledetail_detaileng1 || "")} </Text>
                      <Image source={{ uri: `https://www.thetrago.com/Api/uploads/timetabledetail/${item.md_timetabledetail_picname1}` }}
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
                          style={{ width: wp('10.6%'), height: hp('5%')}}
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
                          <Text style={styles.subtext}>{formatDate(formattedDateDepart)}</Text>
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
                          <Text style={styles.subtext}>{formatDate(formattedDateDepart)}</Text>
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
                          departdate: formattedDateDepart,
                          returnDate: formattedDateReturn,
                          timeTableDepartId: item.md_timetable_id,
                          startingPointId: startingPoint.id,
                          startingpoint_name: startingPoint.name,
                          endPointId: endPoint.id,
                          endpoint_name: endPoint.name,
                          companyDepartId: item.md_timetable_companyid,
                          pierStartDepartId: item.md_timetable_pierstart,
                          pierEndDepartId: item.md_timetable_pierend,
                          adult:adults,
                          child:children,
                          infant:infant,
                          piccompanyDepart:item.md_company_picname,
                          pictimetableDepart:item.md_timetabledetail_picname1,

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
  
                      <Animated.View style={{ height: selectedPickup === item.md_timetable_id ? animatedHeight : 0, overflow: 'hidden' }}>
                        <Text style={{ color: '#666666' }}> {removeHtmlTags(item.md_timetabledetail_detaileng1 || "")} </Text>
                        <Image source={{ uri: `https://www.thetrago.com/Api/uploads/timetabledetail/${item.md_timetabledetail_picname1}` }}
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
                     style={styles.background}>
                     <View style={styles.headerRow}>
                       <View style={styles.inputBoxCol}>
                       <Image
                          source={{ uri: `https://thetrago.com/Api/uploads/company/${item.md_company_picname}` }}
                          style={{ width: wp('10.6%'), height: hp('5%')}}
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
                         <Text style={styles.subtext}>{formatDate(formattedDateReturn)}</Text>
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
                         <Text style={styles.subtext}>{formatDate(formattedDateReturn)}</Text>
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
                          returndate: formattedDateReturn,
                          timeTableReturnId: item.md_timetable_id,
                          companyReturnId: item.md_timetable_companyid,
                          pierStartReturntId: item.md_timetable_pierstart,
                          pierEndReturntId: item.md_timetable_pierend,
                          piccompanyReturn:item.md_company_picname,
                          pictimetableReturn:item.md_timetabledetail_picname1,
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
 
                     <Animated.View style={{ height: selectedPickup === item.md_timetable_id ? animatedHeight : 0, overflow: 'hidden' }}>
                       <Text style={{ color: '#666666' }}> {removeHtmlTags(item.md_timetabledetail_detaileng1 || "")} </Text>
                       <Image source={{ uri: `https://www.thetrago.com/Api/uploads/timetabledetail/${item.md_timetabledetail_picname1}` }}
                        style={{ width: '100%', height: 150, resizeMode: 'cover', marginTop: 10, borderRadius: 20 }}
                      />
                     </Animated.View>
 
 
 
                   </ImageBackground>
                 </TouchableOpacity>
               </View>

            
              ))}

            </>)}
          </>)}

        {/* ปุ่มสำหรับการเปลี่ยนหน้า */}
        {tripTypeSearchResult === 'Depart Trip' && (<>
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
              disabled={currentPageDepart * itemsPerPage >= timetableDepart.length}
              style={styles.button}
            >
              <Icon
                name="chevron-forward"
                size={20}
                color={
                  currentPageDepart * itemsPerPage >= timetableDepart.length
                    ? '#ccc'
                    : 'black'
                }
              />
            </TouchableOpacity>
          </View>
        </>)}

        {tripTypeSearchResult === 'Return Trip' && (<>
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
              disabled={currentPageReturn * itemsPerPage >= timetableReturn.length}
              style={styles.button}
            >
              <Icon
                name="chevron-forward"
                size={20}
                color={
                  currentPageReturn * itemsPerPage >= timetableReturn.length
                    ? '#ccc'
                    : 'black'
                }
              />
            </TouchableOpacity>
          </View>
        </>)}
        <View style={styles.rowButton}>
          <TouchableOpacity
            style={[styles.BackButton]} // Use an array if you want to combine styles
            onPress={() => {
              navigation.goBack();
            }}>
            <Text style={styles.BackButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </ScrollView>
  );
};


const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'flex-start', // Align content to the left
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
    width: wp('5%'),
    height: hp('5%'),
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
    marginLeft: 0, // Optional: ensure no margin if not needed
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
  searchBox: {
    width: '90%',
    height: 40,
    borderColor: '#CCC',
    borderWidth: 1,
    borderRadius: 30,
    paddingHorizontal: 10,
    marginBottom: 20,
    marginRight: 20,

    color: '#333',
  },
  bookingSection: {
    backgroundColor: '#F6F6F6',
    borderRadius: 30,
    padding: '3%',
    width: '100%',

    marginBottom: 0,
    paddingBottom: 0,
    shadowColor: '#F6F6F6',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  contenRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: 5,

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
  rowDrop: {
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
    fontSize: wp('3%'),
    color: '#666',
  },
  inputText: {
    fontSize: wp('3.5%'),
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
    marginBottom: 20,
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
    marginLeft: 10,
  },

  buttonText: {
    fontSize: wp('3.5%'),
    color: '#333',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 20,
    width: 200,
    maxHeight: 300,
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,

  },
  cardContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: '4%',
    margin: '1.5%',
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
    marginBottom: 16,
  },
  shipName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flexWrap: 'wrap',
    maxWidth: wp('30%'),
  },
  tagContainer: {
    flexDirection: 'row',

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
    marginLeft: 8,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  locationContainer: {
    alignItems: 'center',
  },
  location: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    flexWrap: 'wrap',
    maxWidth: 100,
  },
  subtext: {
    fontSize: 12,
    color: '#999',
    flexWrap: 'wrap',
    maxWidth: 100,

  },
  time: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 4,
  },
  middleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 100,
  },
  iconLineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  circle: {
    width: 8,
    height: 8,
    backgroundColor: '#FF6B6B',
    borderRadius: 4,
  },
  dashedLine: {
    flex: 1,
    height: 1,
    borderWidth: 1,
    borderColor: '#CCC',
    borderStyle: 'dashed',
    marginRight: 10,
    marginLeft: -10,
  },
  shipIcon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  shipText: {
    fontSize: 16,
  },
  duration: {
    fontSize: 12,
    color: '#555',
    marginRight: 15
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  TicketRow: {
    flexDirection: 'row',
    //justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: wp('3%'),
    fontWeight: 'bold',
    color: '#333',
  },
  pricebig: {
    fontSize: wp('4%'),
    fontWeight: 'bold',
    color: '#333',
  },
  discount: {
    color: '#FD501E',
  },
  bookNowButton: {
    backgroundColor: '#FD501E',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 20,
  },
  bookNowText: {
    color: '#fff',
    fontWeight: 'bold',

  },
  pointsText: {
    color: '#fff',
    fontSize: 12,
  },

  iconText: {
    fontSize: 20,  // ขนาดของไอคอน
    color: 'white',  // สีของไอคอน
  },
  dashedLineTicket: {
    width: '92.5%',
    height: 1,  // ความหนาของเส้น
    borderWidth: 2,  // ความหนาของเส้น
    borderColor: '#EAEAEA',  // สีของเส้นประ
    borderStyle: 'dashed',  // ทำให้เส้นเป็นประ
    marginVertical: 10,  // ระยะห่างระหว่างเส้นประกับเนื้อหาภายใน
    marginLeft: 10,
    marginRight: 10,
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
    left: wp('1%'),
    width: 40,
    height: 40,
    backgroundColor: '#EAEAEA',
    borderRadius: 40, // ให้เป็นวงกลม
  },
  circleLeft2: {
    position: 'absolute',
    top: 0,
    left: wp('-0.1%'),
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
    left: wp('-0.1%'),
    width: 40,
    height: 40,
    backgroundColor: '#EAEAEA',
    borderRadius: 40, // ให้เป็นวงกลม
  },
  circleRight2: {
    position: 'absolute',
    top: 0,
    left: wp('1%'),
    width: 40,
    height: 40,
    backgroundColor: 'white',
    borderRadius: 30, // ให้เป็นวงกลม
  },
  ImageBoat: {
    width: 20,
    height: 20,
    marginRight: 20,

  },
  searcContain: {
    flexDirection: 'row',
    marginRight: 35,
  },
  pagination: {
    flexDirection: 'row', // เรียงปุ่มในแนวนอน
    width: '100%',
    alignItems: 'center', // จัดตำแหน่งแนวตั้งให้ตรงกลาง
    paddingVertical: 10, // เพิ่มระยะห่างด้านบนและด้านล่าง

    justifyContent: 'center',

  },
  paginationText: {
    fontSize: 16, // ขนาดตัวอักษร
    color: '#FD501E', // สีข้อความ (อาจเป็นสีน้ำเงินเพื่อให้ดูโดดเด่น)
    marginHorizontal: 10, // ระยะห่างด้านข้างระหว่างปุ่มและตัวเลข
  },
  disabledText: {
    color: '#ccc', // สีข้อความเมื่อปุ่มถูก disable
  },
  BackButton: {
    backgroundColor: '#EAEAEA',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    width: '100%',
    marginBottom: 20,
    justifyContent: 'flex-end',
  },
  BackButtonText: {
    color: '#666666',
    fontWeight: 'bold',
    fontSize: 16,

  },
  rowButton: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row'
  },
  background: {
    width: '100%'
  },
  remarkContainer: {
    backgroundColor: '#E0F7FA',  // สีฟ้าอ่อน
    padding: 10,
    borderRadius: 8,
    marginVertical: 10,
    borderLeftWidth: 5,
    borderLeftColor: '#00ACC1', // ขีดข้างสีเข้มกว่า
  },
  remarkText: {
    fontSize: 14,
    color: '#004D40',
  },
  remarkLabel: {
    fontWeight: 'bold',
    color: '#004D40',
  },
});

export default SearchFerry;
