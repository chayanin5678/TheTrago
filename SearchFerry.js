import React, { useRef, useState, useEffect } from 'react';
import ipAddress from './ipconfig';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/Ionicons';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, Modal, FlatList } from 'react-native';
import DateTimePickerModal from "react-native-modal-datetime-picker";

const itemsPerPage = 5;

const SearchFerry = ({ navigation, route }) => {
  
  const { startingPointId, endPointId, startingPointName, endPointName,departureDateInput, returnDateInput} = route.params;
  const [startingPoint, setStartingPoint] = useState({ id: startingPointId, name: startingPointName });
  const [endPoint, setEndPoint] = useState({ id: endPointId, name: endPointName });
  const [isDepartureDatePickerVisible, setDepartureDatePickerVisible] = useState(false);
  const [isReturnDatePickerVisible, setReturnDatePickerVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState(''); 
  const [tripType, setTripType] = useState("One Way Trip");
  const [tripTypeSearch, setTripTypeSearch] = useState("One Way Trip");
  const [tripTypeSearchResult, settripTypeSearchResult] = useState("One Way Trip");
  const [adults, setAdults] = useState(1);
  const [isAdultModalVisible, setAdultModalVisible] = useState(false);
  const [children, setChildren] = useState(0);
  const [isChildModalVisible, setChildModalVisible] = useState(false);
  const [timetableDepart, setTimetableDepart] = useState([]);
  const [timetableReturn, settimetableReturn] = useState([]);
  const [currentPageDepart, setcurrentPageDepart] = useState(1);
  const [currentPageReturn, setcurrentPageReturn] = useState(1);
 console.log(startingPoint.id);
 console.log(endPoint.id);
  


  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const formattedDepartureDate = tomorrow.toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' });
  const [departureDate, setDepartureDate] = useState(departureDateInput);

  const initialReturnDate = new Date(tomorrow);
  initialReturnDate.setDate(initialReturnDate.getDate() + 1);
  const formattedReturnDate = initialReturnDate.toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' });
  const [returnDate, setReturnDate] = useState(returnDateInput);

  const showDepartureDatePicker = () => setDepartureDatePickerVisible(true);
  const showReturnDatePicker = () => setReturnDatePickerVisible(true);

  const hideDepartureDatePicker = () => setDepartureDatePickerVisible(false);
  const hideReturnDatePicker = () => setReturnDatePickerVisible(false);

  const handleDepartureDateConfirm = (date) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    setDepartureDate(date.toLocaleDateString('en-GB', options));
    hideDepartureDatePicker();
  };

  const handleReturnDateConfirm = (date) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    setReturnDate(date.toLocaleDateString('en-GB', options));
    hideReturnDatePicker();
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
    if (!dateString) return 'Invalid Date';
  
    // แปลงรูปแบบ "1 Feb 2025" → "2025-02-01"
    const parsedDate = Date.parse(dateString);
    
    // ตรวจสอบว่า dateString ใช้ได้ไหม
    if (isNaN(parsedDate)) {
      // ลองแปลงเอง
      const parts = dateString.split(" ");
      if (parts.length === 3) {
        const day = parts[0].padStart(2, "0"); // เติม 0 ถ้าจำเป็น
        const month = {
          Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06",
          Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12"
        }[parts[1]]; // แปลงชื่อเดือน
        const year = parts[2];
  
        if (month) {
          dateString = `${year}-${day}-${month}`;
        }
      }
    }
  
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) return 'Invalid Date';
  
    return new Intl.DateTimeFormat('en-US', { weekday: 'short', day: 'numeric', month: 'short' }).format(date);
  };

  const handleSearchStart = () => {
    fetch(`http://${ipAddress}:5000/search/${startingPoint.id}/${endPoint.id}`)
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
    fetch(`http://${ipAddress}:5000/search/${endPoint.id}/${startingPoint.id}`)
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
      <View style={styles.logoContainer}>
        <Image
          source={require('./assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
       
      </View>

      <Text className='h-[180px]' style={styles.title}>Search ferry</Text>

      {/* Search Box */}
      <View style={styles.searcContain}>
      <TextInput
        style={styles.searchBox}
        placeholder="Search Here..."
        placeholderTextColor="#999"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <Image source={require('./assets/BTN1.png')}/>
      </View>
<View style={styles.bookingSection}>
          <View style={styles.tripTypeContainer}>
                  <TouchableOpacity
                    style={[
                      styles.tripTypeOneWayButton,
                      tripType === "One Way Trip" && styles.activeButton,
                    ]}
                    onPress={() => setTripType("One Way Trip")}
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
                      tripType === "Round Trip" && styles.activeButton,
                    ]}
                    onPress={() => setTripType("Round Trip")}
                  >
                    <Text
                      style={[
                        styles.tripTypeText,
                        tripType === "Round Trip" && styles.activeText,
                      
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
          </View>
        </View>
                
        
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
            onPress={() => navigation.navigate('EndPointScreen', { setEndPoint ,startingPointId: startingPoint.id,})}
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
            {tripType === 'Round Trip' && (
  <>
    <Image
      source={require('./assets/Line 2.png')}
      style={styles.logoLine}
      resizeMode="contain"
    />
    <TouchableOpacity onPress={showReturnDatePicker} style={styles.rowdepart}>
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
  </>
)}
          </View>
        </View>
      </View>

      {/* Date Pickers for Departure and Return Date */}
      <DateTimePickerModal
        isVisible={isDepartureDatePickerVisible}
        mode="date"
        date={tomorrow}
        minimumDate={tomorrow}
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
  style={[styles.searchButton]} // Use an array if you want to combine styles
  onPress={() => {
    setTripTypeSearch(tripType); // Call the function within onPress, not in style
    handleSearchStart();
    handleSearchEnd();
  }}>
  <Text style={styles.searchButtonText}>Search</Text>
</TouchableOpacity>

      {/* แสดงรายการแต่ละหน้า */}

      {tripTypeSearch === 'One Way Trip' && (
        <>
      {pagedDataDepart.map((item, index) => (
        <View key={index} style={styles.cardContainer}>
          <View style={styles.headerRow}>
            <View style={styles.inputBoxCol}>
              <Image source={require('./assets/Ship.png')} />
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
              <Text style={styles.subtext}>{formatDate(departureDate)}</Text>
            </View>

            <View style={styles.middleContainer}>
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
              <Text style={styles.subtext}>{formatDate(departureDate)}</Text>
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
            <Text style={styles.price}>THB {item.md_timetable_priceadult} / person</Text>
            <TouchableOpacity style={styles.bookNowButton}
            onPress={()=>{
              navigation.navigate('TripDetail',{
               timeTableDepartId:item.md_timetable_id,
               departDateTimeTable: departureDate,
               startingPointId: startingPointId,
               startingPointName:startingPointName,
               endPointId:endPointId,
               endPointName:endPointName
              }
              
            ); 
            }} >
              <Text style={styles.bookNowText}>Book Now</Text>
             
            </TouchableOpacity>
          </View>
        </View>
      ))}
      </>)}
      
      {tripTypeSearch === 'Round Trip' && (
        <>
        <View style={styles.tripTypeContainer}>
                  <TouchableOpacity
                    style={[
                      styles.tripTypeOneWayButton,
                      tripTypeSearchResult === "One Way Trip" && styles.activeButton,
                    ]}
                    onPress={() => settripTypeSearchResult("One Way Trip")}
                  >
                    <Text
                      style={[
                        styles.tripTypeText,
                        tripTypeSearchResult === "One Way Trip" && styles.activeText,
                      ]}
                    >
                      One Way Trip
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.tripTypeRoundButton,
                      tripTypeSearchResult === "Round Trip" && styles.activeButton,
                    ]}
                    onPress={() => settripTypeSearchResult("Round Trip")}
                  >
                    <Text
                      style={[
                        styles.tripTypeText,
                        tripTypeSearchResult === "Round Trip" && styles.activeText,
                      ]}
                    >
                      Round Trip
                    </Text>
                  </TouchableOpacity>
                </View>
      {tripTypeSearchResult ==='One Way Trip' && (<>
      {pagedDataDepart.map((item, index) => (
        <View key={index} style={styles.cardContainer}>
          <View style={styles.headerRow}>
            <View style={styles.inputBoxCol}>
              <Image source={require('./assets/Ship.png')} />
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
            </View>

            <View style={styles.middleContainer}>
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
            <Text style={styles.price}>THB {item.md_timetable_priceadult} / person</Text>
            <TouchableOpacity style={styles.bookNowButton}>
              <Text style={styles.bookNowText}>Book Now</Text>
            
            </TouchableOpacity>
          </View>
        </View>
      ))}
      </>)}
        {tripTypeSearchResult === 'Round Trip' && (<>
          {pagedDataReturn.map((item, index) => (
        <View key={index} style={styles.cardContainer}>
          <View style={styles.headerRow}>
            <View style={styles.inputBoxCol}>
              <Image source={require('./assets/Ship.png')} />
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
            </View>

            <View style={styles.middleContainer}>
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
            <Text style={styles.price}>THB {item.md_timetable_priceadult} / person</Text>
            <TouchableOpacity style={styles.bookNowButton}>
              <Text style={styles.bookNowText}>Book Now</Text>
              
            </TouchableOpacity>
          </View>
        </View>
      ))}
        
        </>)}
      </>)}

      {/* ปุ่มสำหรับการเปลี่ยนหน้า */}
      {tripTypeSearchResult === 'One Way Trip' && (<>
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

       {tripTypeSearchResult === 'Round Trip' && (<>
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
            marginRight:20,
           
            color: '#333',
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
        contenRow:{
          flexDirection: 'row',
          justifyContent:'space-between',
          margin:5,
          
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
         justifyContent:  'space-between',
        },
        rowdepart:{
          flexDirection: 'row',
        },
        rowDrop:{
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
          fontSize: 16,
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
          marginBottom:20,
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
          borderBottomRightRadius:0,
          borderTopRightRadius:0,
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
          height:50,
          alignItems: 'center',

        },
        tripTypeRoundButton: {
          flexDirection: 'row',
          backgroundColor: '#FFF',
          padding: 10,
          borderRadius: 15,
          borderBottomLeftRadius:0,
          borderTopLeftRadius:0,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
          elevation: 2,
          marginHorizontal: 5,
          flex: 1,
          justifyContent: 'center', 
          marginLeft:0,
          marginRight: 5,
          width: '100%',
          height:50,
          alignItems: 'center',

        },
        activeButton: {
          backgroundColor: "#FD501E",
        
        },
        tripTypeText: {
          fontSize: 16,
          color: "#333",
          fontWeight:'bold'
        },
        activeText: {
          color: "#FFF",
        },
        dropdownIcon: {
          color: '#FD501E', // Orange color for the icon
          marginLeft: 60, 
        },
    
        buttonText: {
          fontSize: 16,
          color: '#333',
          fontWeight: 'bold',
        },
        dropdownIcon: {
          marginLeft: 40,

        },
        buttonText: {
          fontSize: 16,
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
      
           padding: 16,
           margin: 16,
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
            maxWidth:'100',
          },
          tagContainer: {
            flexDirection: 'row',
          
          },
          tag: {
            backgroundColor: 'rgba(253, 80, 30, 0.1)',
            opacity:50,
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
            maxWidth: 150,
          },
          subtext: {
            fontSize: 12,
            color: '#999',
            flexWrap: 'wrap',
            maxWidth: 150,

          },
          time: {
            fontSize: 14,
            fontWeight: 'bold',
            color: '#333',
            marginTop: 4,
          },
          middleContainer: {
            alignItems: 'center',
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
            marginLeft:-10,
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
            fontSize: 16,
            fontWeight: 'bold',
            color: '#333',
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
            marginRight: 8,
          },
          pointsText: {
            color: '#fff',
            fontSize: 12,
          },
          
          iconText: {
            fontSize: 20,  // ขนาดของไอคอน
            color: 'white',  // สีของไอคอน
          },
          dashedLineTicket:{
            width: '100%',
            height: 1,  // ความหนาของเส้น
            borderWidth: 2,  // ความหนาของเส้น
            borderColor: '#EAEAEA',  // สีของเส้นประ
            borderStyle: 'dashed',  // ทำให้เส้นเป็นประ
            marginVertical: 10,  // ระยะห่างระหว่างเส้นประกับเนื้อหาภายใน
          },
          circleContainerLeft: {
            position: 'relative', // ทำให้สามารถจัดตำแหน่งภายใน container ได้
            width: 40,
            height: 40,
            justifyContent: 'flex-start',// จัดตำแหน่งไอคอนให้อยู่ตรงกลาง
            alignItems: 'flex-start',  // จัดตำแหน่งไอคอนให้อยู่ตรงกลาง
            marginBottom: 10,  // ระยะห่างจากด้านล่าง
            marginLeft: -40,
            marginRight:1,
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
            left:-3,
            width: 40,
            height: 40,
            backgroundColor: 'white',
            borderRadius: 30, // ให้เป็นวงกลม
          },
          circleContainerRight: {
            position: 'relative', // ทำให้สามารถจัดตำแหน่งภายใน container ได้
            width: 40,
            height: 40,
            marginLeft:-3,
            justifyContent:'flex-end',  
            alignItems: 'flex-end', 
            marginBottom: 10, 
            marginRight:-40,

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
            left:3,
            width: 40,
            height: 40,
            backgroundColor: 'white',
            borderRadius: 30, // ให้เป็นวงกลม
          },
          ImageBoat:{
            width:20,
            height:20,
            marginRight:20,
        
          },
          searcContain:{
            flexDirection:'row',
            marginRight:35,
          },
          pagination: {
            flexDirection: 'row', // เรียงปุ่มในแนวนอน
            width:'100%',
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
            marginBottom:20,
            justifyContent:'flex-end',
          },
          BackButtonText: {
            color: '#666666',
            fontWeight: 'bold',
            fontSize: 16,
          
          },
          rowButton: {
            width:'100%',
            alignItems :'center',
            justifyContent:'space-between',
            flexDirection:'row'
          },
      });
      
      export default SearchFerry;
