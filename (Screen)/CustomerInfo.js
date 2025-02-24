import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, FlatList, TextInput, ImageBackground, Alert} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import LoGo from './../(component)/Logo';
import Step from './../(component)/Step';
import Textinput from '../(component)/Textinput';
import ipAddress from '../ipconfig';
import AntDesign from '@expo/vector-icons/AntDesign';
import BackNextButton from '../(component)/BackNextButton';

const titleOptions = ['Mr.', 'Mrs.', 'Ms.'];

const  CustomerInfo =({navigation, route }) => {
  const {timeTableDepartId,departDateTimeTable,adults,children,totalAdult,totalChild} = route.params;
  const [subtotal, setSubtotal] = useState('');
  const [code, setcode] = useState('');
  const [Firstname, setFirstname] = useState('');
  const [Lastname, setLastname] = useState('');
  const [selectedTitle, setSelectedTitle] = useState('Please Select');
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedTele, setSelectedTele] = useState('Please Select');
  const [isTeleModalVisible, setIsTeleModalVisible] = useState(false);
  const [telePhone, setTelePhone] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileNumber, setmobileNumber] = useState('');
  const [email, setemail] = useState('');
  const [timetableDepart, settimetableDepart] = useState([]);
  const [errors, setErrors] = useState({}); 
  function formatTime(timeString) {
    if (!timeString) return ""; // Handle empty input
    return timeString.slice(0, 5); // Extracts "HH:mm"
  }
  console.log(timeTableDepartId);
  console.log(departDateTimeTable);


  
  // ฟังก์ชันตรวจสอบข้อผิดพลาด
  const handleNext = () => {
    let newErrors = {};
    if (selectedTitle === 'Please Select') newErrors.selectedTitle = true;
  if (!Firstname) newErrors.Firstname = true;
  if (!Lastname) newErrors.Lastname = true;
  if (selectedTele === 'Please Select') newErrors.selectedTele = true;
  if (!mobileNumber) newErrors.mobileNumber = true;
  if (!email) newErrors.email = true;

  if (!email) {
    newErrors.email = true;
  } else {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(email)) {
      newErrors.email = true;
    }
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
    navigation.navigate('PaymentScreen', {
      timeTableDepartId,
      departDateTimeTable,
      adults,
      totalAdult,
      totalChild,
      children,
      selectedTitle,
      Firstname,
      Lastname,
      selectedTele,
      mobileNumber,
      email
    });
  };

  const toggleModal = () => setModalVisible(!isModalVisible);
  const toggleTeleModal = () => setIsTeleModalVisible(!isTeleModalVisible);

  

  function formatNumber(value) {
    return parseFloat(value).toFixed(2);
  }

  function formatNumberWithComma(value) {
    if (!value) return "0.00";
    const formattedValue = Number(value).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

    console.log("Formatted Value:", formattedValue); 
    return formattedValue;
  }

   
  const calculateDiscountedPrice = (price) => {
    if (!price || isNaN(price)) return "N/A"; // ตรวจสอบว่าราคาถูกต้องไหม
    const discountedPrice = price * 0.9; // ลด 10%
    return discountedPrice.toFixed(2); // ปัดเศษทศนิยม 2 ตำแหน่ง
  };
  const handleSelectTitle = (title) => {
    setSelectedTitle(title);
    setErrors((prev) => ({ ...prev, selectedTitle: false })); // Clear the error state
    toggleModal();
  };
  
  const handleSelectTele = (item) => {
    const selectedValue = `${item.sys_countries_nameeng} (+${item.sys_countries_telephone})`;
    
    setSelectedTele(selectedValue);
    setErrors((prev) => ({ ...prev, selectedTele: false })); // Clear the error state
    toggleTeleModal();
  };
  

  const filteredTelePhones = telePhone.filter((item) => {
    const searchText = `${item.sys_countries_nameeng} (+${item.sys_countries_telephone})`.toLowerCase();
    return searchText.includes(searchQuery.toLowerCase());
  });

  function formatDate(dateString) {
    const date = new Date(Date.parse(dateString)); // Parses "14 Feb 2025" correctly
    return date.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
  }

  function formatTimeToHoursAndMinutes(time) {
    let [hours, minutes] = time.split(':');
    
    // กำจัด 0 ด้านหน้า
    hours = parseInt(hours, 10); 
    minutes = parseInt(minutes, 10);
    
    return `${hours} h ${minutes} min`;
  }
   useEffect(() => {
    setSubtotal(formatNumber(calculateDiscountedPrice(parseFloat(totalAdult)+ parseFloat(totalChild)))); 
      
    }, [subtotal]);

  useEffect(() => {
    fetch(`http://${ipAddress}:5000/timetable/${timeTableDepartId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        if (data && Array.isArray(data.data)) {
          settimetableDepart(data.data);
        } else {
          console.error('Data is not an array', data);
          settimetableDepart([]); 
        }
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }, []);


  useEffect(() => {
    fetch(`http://${ipAddress}:5000/telephone`)
      .then((response) => response.json())
      .then((data) => {
        if (data && Array.isArray(data.data)) {
          setTelePhone(data.data);
        } else {
          console.error('Data is not an array', data);
          setTelePhone([]);
        }
      })
      .catch((error) => console.error('Error fetching data:', error));
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ImageBackground 
                      source={{ uri: 'https://www.thetrago.com/assets/images/bg/Aliments.png' }}
                      style={styles.background}>
      <LoGo />
      <Step logoUri={2} />
      <Text style={styles.title}>Customer Information</Text>

      <View style={styles.promo}>
        <Text style={styles.TextInput}>Passenger Details</Text>

        {/* คำนำหน้า */}
        <Text style={styles.textHead}>Title</Text>
        <TouchableOpacity 
          style={[styles.button, errors.selectedTitle && styles.errorInput]} 
          onPress={toggleModal}>
          <Text style={styles.buttonText}>{selectedTitle}</Text>
          <Icon name="chevron-down" size={18} color="#A1A1A1" style={styles.icon} />
        </TouchableOpacity>

        {/* Modal for title selection */}
        <Modal visible={isModalVisible} transparent animationType="fade" onRequestClose={toggleModal}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContentPre}>
              <FlatList
                data={titleOptions}
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.optionItem} onPress={() => handleSelectTitle(item)}>
                    <Text style={styles.optionText}>{item}</Text>
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
        {/* ชื่อจริง & นามสกุล */}
        <Text style={styles.textHead}>First Name</Text>
          <TextInput
            placeholder="First Name"
            value={Firstname}
            onChangeText={(text) => {
              setFirstname(text);
              setErrors((prev) => ({ ...prev, Firstname: false })); 
            }}
            style={[styles.input, errors.Firstname && styles.errorInput]} // ใช้สีแดงเมื่อมีข้อผิดพลาด
          />
        
        <Text style={styles.textHead}>Last Name</Text>
          <TextInput
            placeholder="Last Name"
            value={Lastname}
            onChangeText={(text) => {
              setLastname(text);
              setErrors((prev) => ({ ...prev, Lastname: false })); // Remove error when the user types
            }}
            style={[styles.input, errors.Lastname && styles.errorInput]} // ใช้สีแดงเมื่อมีข้อผิดพลาด
          />


        {/* รายละเอียดการติดต่อ */}
        <Text style={styles.TextInput}>Contact Details</Text>
        <Text style={styles.textHead}>Phone number</Text>
        <TouchableOpacity 
          style={[styles.button, errors.selectedTele && styles.errorInput]} 
          onPress={toggleTeleModal}>
          <Text style={styles.buttonText}>{selectedTele}</Text>
          <Icon name="chevron-down" size={18} color="#A1A1A1" style={styles.icon} />
        </TouchableOpacity>

        {/* Modal for selecting telephone */}
        <Modal visible={isTeleModalVisible} transparent animationType="fade" onRequestClose={toggleTeleModal}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <TextInput
                placeholder="Search country"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              <FlatList
                data={filteredTelePhones}
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.optionItem} onPress={() => handleSelectTele(item)}>
                    <Text style={styles.optionText}>{item.sys_countries_nameeng} (+{item.sys_countries_telephone})</Text>
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
        <Text style={styles.textHead}>Phone number</Text>
          <TextInput
            placeholder="Mobile Number"
            value={mobileNumber}
            onChangeText={(text) => {
              setmobileNumber(text);
              setErrors((prev) => ({ ...prev, mobileNumber: false })); // Remove error when the user types
            }}
            style={[styles.input, errors.mobileNumber && styles.errorInput]} // ใช้สีแดงเมื่อมีข้อผิดพลาด
          />
      <Text style={styles.title}>Where should we send your bokking confirmation?</Text>
      <Text style={styles.textHead}>Email</Text>
          <TextInput
            placeholder="Enter Your Email"
            value={email}
            onChangeText={(text) => {
              setemail(text);
              setErrors((prev) => ({ ...prev, email: false })); // Remove error when the user types
            }}
            style={[styles.input, errors.email && styles.errorInput]} // ใช้สีแดงเมื่อมีข้อผิดพลาด
          />
      </View>
    
      {timetableDepart.map((item, index) => (
        <View key={index} style={styles.promo}>
        <Text style={styles.title}>Booking Summary</Text>
        <View style={styles.divider} />
        <Text>Depart</Text>
        <Text>{item.startingpoint_name} <AntDesign name="arrowright" size={14} color="black" /> {item.endpoint_name}</Text>
        <Text>Company : {item.md_company_nameeng}</Text>
        <Text>Seat : {item.md_seat_nameeng}</Text>
        <Text>Boat : {item.md_boattype_nameeng}</Text>
        <Text>Departure Data : {formatDate(departDateTimeTable)}</Text>
        <Text>Departure Time : {formatTime(item.md_timetable_departuretime)} - {formatTime(item.md_timetable_arrivaltime)} | {formatTimeToHoursAndMinutes(item.md_timetable_time)}</Text>
        <View style={styles.rowpromo}>
        <Text>Adult x {adults}</Text>
        <Text>฿ {formatNumberWithComma(formatNumber(totalAdult))}</Text>
        </View>
        {parseFloat(totalChild) !== 0 && (
  <View style={styles.rowpromo}>
    <Text>Child x {children}</Text>
    <Text>฿ {formatNumberWithComma(formatNumber(totalChild))}</Text>
  </View>
)}
        <View style={styles.rowpromo}>
        <Text>Discount</Text>
        <Text style={styles.redText}>฿ {formatNumberWithComma(formatNumber((parseFloat(totalAdult)+ parseFloat(totalChild))-parseFloat(subtotal)))}</Text>
        </View>
        <View style={styles.rowpromo}>
        <Text>Ticket fare</Text>
        <Text>฿ {formatNumberWithComma(subtotal)}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.rowpromo}>
        <Text>Subtotal </Text>
        <Text>฿ {formatNumberWithComma(subtotal)}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.rowpromo}>
        <Text>total </Text>
        <Text>฿ {formatNumberWithComma(subtotal)}</Text>
        </View>
      </View>
    ))}
       <View style={styles.promo}>
  <Text style={styles.promoLabel}>Promotion Code</Text>

  <View style={styles.inputWrapper}>
    <TextInput
      style={styles.promoInput}
      placeholder="Coupon code"
      value={code}
      onChangeText={setcode}
      placeholderTextColor="#A1A1A1"
    />

    <TouchableOpacity style={styles.applyButton} >
      <Text style={styles.applyText}>Apply</Text>
    </TouchableOpacity>
  </View>
</View>
 <View style={styles.rowButton}>
        <TouchableOpacity 
          style={[styles.BackButton]} // Use an array if you want to combine styles
          onPress={() => {
            navigation.goBack();
          }}>
          <Text style={styles.BackButtonText}>Go Back</Text>
        </TouchableOpacity>
         <TouchableOpacity 
          style={[styles.ActionButton]} // Use an array if you want to combine styles
          onPress={() => {
         handleNext();
          }}>
          <Text style={styles.searchButtonText}>Next Step</Text>
        </TouchableOpacity>
        </View>
    </ImageBackground>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'left',
    color: '#002348',
    marginBottom: 20,
  },
  promo: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: '100%',
    padding: 16,
    marginVertical: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  TextInput: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  textHead: {
    fontSize: 16,
    paddingVertical: 10,
    marginLeft:10
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#A1A1A1',
    borderRadius: 8,
    width: '94%',
    justifyContent: 'space-between',
    margin:10,

  },
  buttonText: {
    fontSize: 16,
    color: '#333',
  },
  icon: {
    marginLeft: 10,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',  // ให้ Modal อยู่ด้านล่าง
    alignItems: 'center',
 
  },
  modalContentPre: {
    backgroundColor: '#FFF',
    width: '80%',   // กำหนดให้ Modal กว้าง 80% ของจอ
    borderRadius: 10,
    padding: 15,
    elevation: 5,
    
  },
  modalContent: {
    backgroundColor: '#FFF',
    width: '80%',   // กำหนดให้ Modal กว้าง 80% ของจอ
    height: '40%',  // จำกัดขนาดความสูง
    borderRadius: 10,
    padding: 15,
    elevation: 5,
    
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
  divider: {
    height: 1, // ความหนาของเส้น
    width: '100%', // ทำให้ยาวเต็มจอ
    backgroundColor: '#CCCCCC', // สีของเส้น
    marginVertical: 10, // ระยะห่างระหว่าง element
  },
  rowpromo:{
    flexDirection:'row',
    justifyContent:'space-between',
  },
  redText:{
    color:'red'
  },
  promoLabel: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    overflow: "hidden",
    alignItems: "center",
  },
  promoInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: "#FFF",
  },
  applyButton: {
    backgroundColor: "#FD501E",
    paddingHorizontal: 20,
    justifyContent: "center",
    alignItems: "center",
    height:50,
  },
  applyText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  background: {
    width:'100%',
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
    marginLeft:10,
    marginRight:10
  },
  errorInput: {
    borderColor: 'red', // เปลี่ยนกรอบเป็นสีแดงเมื่อมีข้อผิดพลาด
  },
  rowButton: {
    width:'100%',
    alignItems :'center',
    justifyContent:'space-between',
    flexDirection:'row'
  },
  BackButton: {
    backgroundColor: '#EAEAEA',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    width: '45%',
    marginBottom:20,
    justifyContent:'flex-end',
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
    marginBottom:20,
    justifyContent:'flex-end',
  },
  searchButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  
  },

});
export default CustomerInfo;
