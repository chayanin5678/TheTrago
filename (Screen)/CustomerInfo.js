import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, FlatList, TextInput, ImageBackground, Alert, SafeAreaView,StatusBar, KeyboardAvoidingView, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import LoGo from './../(component)/Logo';
import Step from './../(component)/Step';
import Textinput from '../(component)/Textinput';
import ipAddress from '../ipconfig';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useCustomer } from './CustomerContext';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const titleOptions = ['Please Select', 'Mr.', 'Mrs.', 'Ms.'];

const CustomerInfo = ({ navigation }) => {
  const { customerData, updateCustomerData } = useCustomer();
  const [code, setcode] = useState('');
  const [Firstname, setFirstname] = useState(customerData.Firstname);
  const [Lastname, setLastname] = useState(customerData.Lastname);
  const [selectedTitle, setSelectedTitle] = useState('Please Select');
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedTele, setSelectedTele] = useState(customerData.selectcoountrycode);
  const [isTeleModalVisible, setIsTeleModalVisible] = useState(false);
  const [telePhone, setTelePhone] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileNumber, setmobileNumber] = useState(customerData.tel);
  const [email, setemail] = useState(customerData.email);
  const [timetableDepart, settimetableDepart] = useState([]);
  const [timetableReturn, settimetableReturn] = useState([]);

  const [country, setCountry] = useState('');
  const [countrycode, setCountrycode] = useState('');
  const [errors, setErrors] = useState({});
  function formatTime(timeString) {
    if (!timeString) return ""; // Handle empty input
    return timeString.slice(0, 5); // Extracts "HH:mm"
  }

  console.log('customerData:', customerData.Firstname);
  console.log('customerData:', customerData.Lastname);
  console.log('customerData:', customerData.email);



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
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    
    updateCustomerData({
      selectedTitle: selectedTitle,
      Firstname: Firstname,
      Lastname: Lastname,
      tel: mobileNumber,
      email: email,
      companyname: timetableDepart[0].md_company_nameeng,
      startingpoint_name: timetableDepart[0].startingpoint_name,
      endpoint_name: timetableDepart[0].endpoint_name,
      boatypeid: timetableDepart[0].md_timetable_boattypeid,
      country: country,
      countrycode: '+' + countrycode,
      time: timetableDepart[0].md_timetable_time,
      departtime: timetableDepart[0].md_timetable_departuretime,
    });

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
    navigation.navigate('PaymentScreen');
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
    const selectedValue =
      item.sys_countries_nameeng === 'Please Select'
        ? 'Please Select'
        : `(+${item.sys_countries_telephone}) ${item.sys_countries_nameeng}`; // แสดงแค่ชื่อประเทศ
  
    setSelectedTele(selectedValue);
    setCountry(item.sys_countries_code);
    setCountrycode(item.sys_countries_telephone); // ใช้ตอนส่งออก
    setErrors((prev) => ({ ...prev, selectedTele: false }));
    toggleTeleModal();
  };
  


  const filteredTelePhones = telePhone.filter((item) => {
    const searchText = `(+${item.sys_countries_telephone}) ${item.sys_countries_nameeng}`.toLowerCase();
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
        } else {
          console.error('Data is not an array', data);
          settimetableDepart([]);
        }
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }, []);

  const fetchTimetableReturn = async () => {
    try {
      const response = await fetch(`${ipAddress}/timetable/${customerData.timeTableReturnId}`);

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();

      if (data && Array.isArray(data.data)) {
        settimetableReturn(data.data);
      } else {
        console.error('Data is not an array', data);
        settimetableReturn([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    if (customerData.roud === 2) {
      fetchTimetableReturn();
    }
  }, [customerData.timeTableReturnId]);



  useEffect(() => {
    fetch(`${ipAddress}/telephone`)
      .then((response) => response.json())
      .then((data) => {
        if (data && Array.isArray(data.data)) {
          // เพิ่ม "Please Select" ที่ด้านบนของรายการ
          const countryList = [
            {
              sys_countries_telephone: '',
              sys_countries_nameeng: 'Please Select',
              sys_countries_code: ''
            },
            ...data.data
          ];
          setTelePhone(countryList);
        } else {
          console.error('Data is not an array', data);
          setTelePhone([]);
        }
      })
      .catch((error) => console.error('Error fetching data:', error));
  }, []);
  

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
    <StatusBar barStyle="dark-content" backgroundColor="#fff" />
    
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
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
            <Icon name="chevron-down" size={18} color="#FD501E" style={styles.icon} />
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
            <Icon name="chevron-down" size={18} color="#FD501E" style={styles.icon} />
          </TouchableOpacity>

          {/* Modal for selecting telephone */}
          <Modal visible={isTeleModalVisible} transparent animationType="fade" onRequestClose={toggleTeleModal}>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <TextInput
                  placeholder="Search country"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  style={styles.textInput}
                />
                <FlatList
                  data={filteredTelePhones}
                  renderItem={({ item }) => (
                    <TouchableOpacity style={styles.optionItem} onPress={() => handleSelectTele(item)}>
                    <Text style={[styles.optionText, item.sys_countries_nameeng === 'Please Select' ]}>
                      {item.sys_countries_nameeng === 'Please Select'
                        ? 'Please Select'
                        : `(+${item.sys_countries_telephone}) ${item.sys_countries_nameeng}`}
                    </Text>
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
        
          <TextInput
            placeholder="Mobile Number"
            value={mobileNumber}
            keyboardType="number-pad"
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
            style={[styles.input, errors.email && styles.errorInput,customerData.email && styles.disabledInput]} // ใช้สีแดงเมื่อมีข้อผิดพลาด
            editable={!customerData.email} 
          />
        </View>


        <View style={styles.promo}>
          <Text style={styles.title}>Booking Summary</Text>
          <View style={styles.divider} />
          {timetableDepart.map((item, index) => (
            <View key={index}>
             <Text style={{ fontWeight: 'bold' }}>Depart</Text>

              <Text style={{ marginTop: 5, color: '#FD501E' }}>{item.startingpoint_name} <AntDesign name="arrowright" size={14} color="#FD501E" /> {item.endpoint_name}</Text>
              <View style={styles.rowpromo}>
                <Text style={{ color: '#666666' }}>Company </Text>
                <Text style={{ color: '#666666' }}> {item.md_company_nameeng}</Text>
              </View>
              <View style={styles.rowpromo}>
                <Text style={{ color: '#666666' }}>Seat</Text>
                <Text style={{ color: '#666666' }}>{item.md_seat_nameeng}</Text>
              </View>
              <View style={styles.rowpromo}>
                <Text style={{ color: '#666666' }}>Boat </Text>
                <Text style={{ color: '#666666' }}>{item.md_boattype_nameeng}</Text>
              </View>
              <View style={styles.rowpromo}>
                <Text style={{ color: '#666666' }}>Departure Data</Text>
                <Text style={{ color: '#666666' }}> {formatDate(customerData.departdate)}</Text>
              </View>
              <View style={styles.rowpromo}>
                <Text style={{ color: '#666666' }}>Departure Time : </Text>
                <Text style={{ color: '#666666' }}>{formatTime(item.md_timetable_departuretime)} - {formatTime(item.md_timetable_arrivaltime)} | {formatTimeToHoursAndMinutes(item.md_timetable_time)}</Text>
              </View>
              <View style={[styles.rowpromo, { marginTop: 5 }]}>
                <Text>Adult x {customerData.adult}</Text>
                <Text>฿ {formatNumberWithComma(customerData.totaladultDepart)}</Text>
              </View>
              {customerData.child !== 0 && (
                <View style={styles.rowpromo}>
                  <Text>Child x {customerData.child}</Text>
                  <Text>฿ {formatNumberWithComma(customerData.totalchildDepart)}</Text>
                </View>
              )}
              {customerData.infant !== 0 && (
                <View style={styles.rowpromo}>
                  <Text>infant x {customerData.infant}</Text>
                  <Text>฿ {formatNumberWithComma(customerData.totalinfantDepart)}</Text>
                </View>
              )}
              {customerData.pickupPriceDepart != 0 && (
                <View style={styles.rowpromo}>
                  <Text>Pick up</Text>
                  <Text style={{ color: 'green' }}>+ ฿ {formatNumberWithComma(customerData.pickupPriceDepart)}</Text>
                </View>
              )}
              {customerData.dropoffPriceDepart != 0 && (
                <View style={styles.rowpromo}>
                  <Text>Drop off</Text>
                  <Text style={{ color: 'green' }}>+ ฿ {formatNumberWithComma(customerData.dropoffPriceDepart)}</Text>
                </View>
              )}
              <View style={styles.rowpromo}>
                <Text>Discount</Text>
                <Text style={styles.redText}>- ฿ {formatNumberWithComma(customerData.discountDepart)}</Text>
              </View>
              <View style={styles.rowpromo}>
                <Text>Ticket fare</Text>
                <Text style={{ fontWeight: 'bold' }}>฿ {formatNumberWithComma(customerData.subtotalDepart)}</Text>
              </View>
              <View style={styles.divider} />
            </View>
          ))}
          {customerData.roud === 2 && (
            <>
              {timetableReturn.map((item, index) => (
                <View key={index}>
                  <Text style={{ fontWeight: 'bold' }}>Return</Text>
                  <Text style={{ marginTop: 5, color: '#FD501E' }}>
                    {item.startingpoint_name} <AntDesign name="arrowright" size={14} color="#FD501E" /> {item.endpoint_name}
                  </Text>
                  <View style={styles.rowpromo}>
                    <Text style={{ color: '#666666' }}>Company </Text>
                    <Text style={{ color: '#666666' }}>{item.md_company_nameeng}</Text>
                  </View>
                  <View style={styles.rowpromo}>
                    <Text style={{ color: '#666666' }}>Seat</Text>
                    <Text style={{ color: '#666666' }}>{item.md_seat_nameeng}</Text>
                  </View>
                  <View style={styles.rowpromo}>
                    <Text style={{ color: '#666666' }}>Boat </Text>
                    <Text style={{ color: '#666666' }}>{item.md_boattype_nameeng}</Text>
                  </View>
                  <View style={styles.rowpromo}>
                    <Text style={{ color: '#666666' }}>Departure Data</Text>
                    <Text style={{ color: '#666666' }}> {formatDate(customerData.returndate)}</Text>
                  </View>
                  <View style={styles.rowpromo}>
                    <Text style={{ color: '#666666' }}>Departure Time : </Text>
                    <Text style={{ color: '#666666' }}>
                      {formatTime(item.md_timetable_departuretime)} - {formatTime(item.md_timetable_arrivaltime)} | {formatTimeToHoursAndMinutes(item.md_timetable_time)}
                    </Text>
                  </View>
                  <View style={[styles.rowpromo, { marginTop: 5 }]}>
                    <Text>Adult x {customerData.adult}</Text>
                    <Text>฿ {formatNumberWithComma(customerData.totaladultReturn)}</Text>
                  </View>
                  {customerData.child !== 0 && (
                    <View style={styles.rowpromo}>
                      <Text>Child x {customerData.child}</Text>
                      <Text>฿ {formatNumberWithComma(customerData.totalchildReturn)}</Text>
                    </View>
                  )}
                  {customerData.infant !== 0 && (
                    <View style={styles.rowpromo}>
                      <Text>infant x {customerData.infant}</Text>
                      <Text>฿ {formatNumberWithComma(customerData.totalinfantReturn)}</Text>
                    </View>
                  )}
                  {customerData.pickupPriceReturn != 0 && (
                    <View style={styles.rowpromo}>
                      <Text>Pick up</Text>
                      <Text style={{ color: 'green' }}>+ ฿ {formatNumberWithComma(customerData.pickupPriceReturn)}</Text>
                    </View>
                  )}
                  {customerData.dropoffPriceReturn != 0 && (
                    <View style={styles.rowpromo}>
                      <Text>Drop off</Text>
                      <Text style={{ color: 'green' }}>+ ฿ {formatNumberWithComma(customerData.dropoffPriceReturn)}</Text>
                    </View>
                  )}
                  <View style={styles.rowpromo}>
                    <Text>Discount</Text>
                    <Text style={styles.redText}>- ฿ {formatNumberWithComma(customerData.discountReturn)}</Text>
                  </View>
                  <View style={styles.rowpromo}>
                    <Text>Ticket fare</Text>
                    <Text style={{ fontWeight: 'bold' }}>฿ {formatNumberWithComma(customerData.subtotalReturn)}</Text>
                  </View>
                  <View style={styles.divider} />
                </View>
              ))}
            </>
          )}
          <View style={styles.rowpromo}>
            <Text>Subtotal </Text>
            <Text>฿ {formatNumberWithComma(customerData.total)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.rowpromo}>
            <Text style={{ color: '#FD501E' }}>total </Text>
            <Text style={{ color: '#FD501E' }}>฿ {formatNumberWithComma(customerData.total)}</Text>
          </View>
        </View>

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
        </KeyboardAvoidingView>
      </SafeAreaView>
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
    marginLeft: 10
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 8,
   // width: wp('78%'),
    justifyContent: 'space-between',
    margin: 10,

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
  rowpromo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  redText: {
    color: 'red'
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
    height: 50,
  },
  applyText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  background: {
    width: '100%',
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
    marginLeft: 10,
    marginRight: 10,
  },
  errorInput: {
    borderColor: 'red', // เปลี่ยนกรอบเป็นสีแดงเมื่อมีข้อผิดพลาด
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
  textInput: {
    width: '100%',       // กำหนดความกว้าง
    padding: 10,        // กำหนดช่องว่างภายใน
    borderWidth: 1,     // กำหนดความหนาของขอบ
    borderColor: '#ced4da', // กำหนดสีของขอบ
    borderRadius: 5,    // ปรับมุมขอบให้โค้ง
  },
  disabledInput: {
    backgroundColor: '#f0f0f0', // สีเทาเมื่อ email มีข้อมูล
  },

});
export default CustomerInfo;
