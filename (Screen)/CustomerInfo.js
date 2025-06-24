import React, { useState, useEffect, useRef,useImperativeHandle } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, FlatList, TextInput, ImageBackground, Alert, SafeAreaView, StatusBar, KeyboardAvoidingView, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import LogoTheTrago from './../(component)/Logo';
import Step from './../(component)/Step';
import Textinput from '../(component)/Textinput';
import ipAddress from '../ipconfig';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useCustomer } from './CustomerContext';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialIcons } from '@expo/vector-icons';

const titleOptions = ['Please Select', 'Mr.', 'Mrs.', 'Ms.', 'Master'];

// ===== Inline PassengerForm component (ต้องอยู่ก่อน CustomerInfo) =====
const PassengerForm = React.forwardRef(({ type, index, telePhone, showAllErrors }, ref) => {
  const [selectedTitle, setSelectedTitle] = React.useState('Please Select');
  const [isModalVisible, setModalVisible] = React.useState(false);
  const [selectedNationality, setSelectedNationality] = React.useState('Please Select');
  const [isNationalityModalVisible, setNationalityModalVisible] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [fname, setFname] = React.useState('');
  const [lname, setLname] = React.useState('');
  const [passport, setPassport] = React.useState('');
  const [dateOfIssue, setDateOfIssue] = React.useState('');
  const [showDatePicker, setShowDatePicker] = React.useState(false);
  const [passportExpiry, setPassportExpiry] = React.useState('');
  const [showPassportExpiryPicker, setShowPassportExpiryPicker] = React.useState(false);
  const [birthday, setBirthday] = React.useState('');
  const [showBirthdayPicker, setShowBirthdayPicker] = React.useState(false);
  const [fieldErrors, setFieldErrors] = React.useState({});
  const [nationalityCode, setNationalityCode] = useState('');


  useImperativeHandle(ref, () => ({
    getData: () => ({
      prefix: selectedTitle,
      fname,
      lname,
      idtype: 1,
      nationality: nationalityCode,
      passport,
      dateofissue: dateOfIssue,
      passportexpiry: passportExpiry,
      birthday,
      type: type?.toLowerCase(),
    }),
    validate: () => {
      let errors = {};
      if (!selectedTitle || selectedTitle === 'Please Select') errors.selectedTitle = true;
      if (!fname || fname.trim() === '') errors.fname = true;
      if (!lname || lname.trim() === '') errors.lname = true;
      if (!selectedNationality || selectedNationality === 'Please Select') errors.nationality = true;
      if (!passport || passport.trim() === '') errors.passport = true;
      if (!dateOfIssue) errors.dateOfIssue = true;
      if (!passportExpiry) errors.passportExpiry = true;
      if (!birthday) errors.birthday = true;
      setFieldErrors(errors);
      return errors;
    },
    setFieldErrors: (errors) => {
      setFieldErrors(errors || {});
    }
  }));


  const filteredCountries = telePhone.filter((item) =>
    item.sys_countries_nameeng.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Add error state for each field
  const handleFnameChange = (text) => {
    setFname(text);
    setFieldErrors((prev) => ({ ...prev, fname: undefined }));
  };
  const handleLnameChange = (text) => {
    setLname(text);
    setFieldErrors((prev) => ({ ...prev, lname: undefined }));
  };
  const handlePassportChange = (text) => {
    setPassport(text);
    setFieldErrors((prev) => ({ ...prev, passport: undefined }));
  };
  const handleDateOfIssue = (date) => {
    setDateOfIssue(date);
    setFieldErrors((prev) => ({ ...prev, dateOfIssue: undefined }));
  };
  const handlePassportExpiry = (date) => {
    setPassportExpiry(date);
    setFieldErrors((prev) => ({ ...prev, passportExpiry: undefined }));
  };
  const handleBirthday = (date) => {
    setBirthday(date);
    setFieldErrors((prev) => ({ ...prev, birthday: undefined }));
  };

  return (
    <View style={styles.promo}>
      <Text style={styles.TextInput}>{type.charAt(0).toUpperCase() + type.slice(1)} {index + 1}</Text>

      {/* คำนำหน้า */}
      <Text style={styles.textHead}>Title</Text>
      <TouchableOpacity
        style={[styles.button, (fieldErrors.selectedTitle || (showAllErrors && (selectedTitle === 'Please Select' || !selectedTitle))) && styles.errorInput]}
        onPress={() => setModalVisible(true)}>
        <Text style={styles.buttonText}>{selectedTitle}</Text>
        <Icon name="chevron-down" size={18} color="#FD501E" style={styles.icon} />
      </TouchableOpacity>

      {/* Modal for title selection */}
      <Modal visible={isModalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContentPre}>
            <FlatList
              data={titleOptions}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.optionItem} onPress={() => { setSelectedTitle(item); setModalVisible(false); }}>
                  <Text style={styles.optionText}>{item}</Text>
                </TouchableOpacity>
              )}
              keyExtractor={(item, idx) => idx.toString()}
            />
          </View>
        </View>
      </Modal>

      {/* First Name */}
      <Text style={styles.textHead}>First Name</Text>
      <TextInput
        placeholder="First Name"
        value={fname}
        onChangeText={handleFnameChange}
        style={[styles.input, (fieldErrors.fname || (showAllErrors && !fname)) && styles.errorInput]}
      />


      {/* Last Name */}
      <Text style={styles.textHead}>Last Name</Text>
      <TextInput
        placeholder="Last Name"
        value={lname}
        onChangeText={handleLnameChange}
        style={[styles.input, (fieldErrors.lname || (showAllErrors && !lname)) && styles.errorInput]}
      />
   

      {/* Nationality */}
      <Text style={styles.textHead}>Nationality</Text>
      <TouchableOpacity
        style={[styles.button, fieldErrors.nationality && styles.errorInput]}
        onPress={() => setNationalityModalVisible(true)}>
        <Text style={styles.buttonText}>{selectedNationality}</Text>
        <Icon name="chevron-down" size={18} color={fieldErrors.nationality ? 'red' : '#FD501E'} style={styles.icon} />
      </TouchableOpacity>
      <Modal visible={isNationalityModalVisible} transparent animationType="fade" onRequestClose={() => setNationalityModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TextInput
              placeholder="Search country"
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.textInput}
              placeholderTextColor="#888"
            />
            <FlatList
              data={telePhone.filter((item) => {
                const searchText = `(+${item.sys_countries_telephone}) ${item.sys_countries_nameeng}`.toLowerCase();
                return searchText.includes(searchQuery.toLowerCase());
              })}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.optionItem} onPress={() => {
                  if (item.sys_countries_nameeng === 'Please Select') {
                    setSelectedNationality('Please Select');
                    setNationalityCode('');
                  } else {
                    setSelectedNationality(`(+${item.sys_countries_telephone}) ${item.sys_countries_nameeng}`);
                    setNationalityCode(item.sys_countries_code);
                    setFieldErrors((prev) => ({ ...prev, nationality: undefined })); // Clear error on select
                  }
                  setNationalityModalVisible(false);
                  setSearchQuery('');
                }}>
                  <Text style={[styles.optionText, item.sys_countries_nameeng === 'Please Select']}>
                    {item.sys_countries_nameeng === 'Please Select'
                      ? 'Please Select'
                      : `(+${item.sys_countries_telephone}) ${item.sys_countries_nameeng}`}
                  </Text>
                </TouchableOpacity>
              )}
              keyExtractor={(item, idx) => idx.toString()}
              initialNumToRender={5}
              maxToRenderPerBatch={5}
              windowSize={5}
              pagingEnabled
            />
          </View>
        </View>
      </Modal>

      {/* Passport */}
      <Text style={styles.textHead}>Passport</Text>
      <TextInput
        placeholder="Passport Number"
        value={passport}
        onChangeText={handlePassportChange}
        style={[styles.input, (fieldErrors.passport || (showAllErrors && !passport)) && styles.errorInput]}
      />
     

      {/* Date of Issue */}
      <Text style={styles.textHead}>Date of Issue</Text>
      <TouchableOpacity
        style={[styles.button, (fieldErrors.dateOfIssue || (showAllErrors && !dateOfIssue)) && styles.errorInput]}
        onPress={() => setShowDatePicker(!showDatePicker)}>
        <Text style={styles.buttonText}>
          {dateOfIssue ? new Date(dateOfIssue).toLocaleDateString('en-GB') : 'Select Date'}
        </Text>
        <Icon name="calendar" size={18} color="#FD501E" style={styles.icon} />
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={dateOfIssue ? new Date(dateOfIssue) : new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          maximumDate={new Date()}
          onChange={(event, selectedDate) => {
            if (selectedDate) handleDateOfIssue(selectedDate.toISOString().split('T')[0]);
          }}
        />
      )}

      {/* Passport Expiry Date */}
      <Text style={styles.textHead}>Passport Expiry Date</Text>
      <TouchableOpacity
        style={[styles.button, (fieldErrors.passportExpiry || (showAllErrors && !passportExpiry)) && styles.errorInput]}
        onPress={() => setShowPassportExpiryPicker(!showPassportExpiryPicker)}>
        <Text style={styles.buttonText}>
          {passportExpiry ? new Date(passportExpiry).toLocaleDateString('en-GB') : 'Select Date'}
        </Text>
        <Icon name="calendar" size={18} color="#FD501E" style={styles.icon} />
      </TouchableOpacity>
      {showPassportExpiryPicker && (
        <DateTimePicker
          value={passportExpiry ? new Date(passportExpiry) : new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          minimumDate={new Date()}
          onChange={(event, selectedDate) => {
            if (selectedDate) handlePassportExpiry(selectedDate.toISOString().split('T')[0]);
          }}
        />
      )}

      {/* Date of Birth */}
      <Text style={styles.textHead}>Date of Birth</Text>
      <TouchableOpacity
        style={[styles.button, fieldErrors.birthday && styles.errorInput]}
        onPress={() => setShowBirthdayPicker(!showBirthdayPicker)}>
        <Text style={styles.buttonText}>
          {birthday ? new Date(birthday).toLocaleDateString('en-GB') : 'Select Date'}
        </Text>
        <Icon name="calendar" size={18} color="#FD501E" style={styles.icon} />
      </TouchableOpacity>
      {showBirthdayPicker && (
        <DateTimePicker
          value={birthday ? new Date(birthday) : new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          maximumDate={new Date()}
          onChange={(event, selectedDate) => {
            if (selectedDate) handleBirthday(selectedDate.toISOString().split('T')[0]);
          }}
        />
      )}
    </View>
  );
});

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
  const [country, setCountry] = useState(customerData.country); // ใช้ค่าเริ่มต้นจาก customerData
  const [countrycode, setCountrycode] = useState(customerData.countrycode); // ใช้ค่าเริ่มต้นจาก customerData
  const [errors, setErrors] = useState({});
  const [isWhatsapp, setIsWhatsapp] = useState(0); // State for Whatsapp checkbox
  // State for Contact Details errors
  const [contactErrors, setContactErrors] = useState({ phone: false, mobile: false, email: false });
  const passengerFormRefs = useRef([]);
  const [showAllErrors, setShowAllErrors] = useState(false);

  function formatTime(timeString) {
    if (!timeString) return ""; // Handle empty input
    return timeString.slice(0, 5); // Extracts "HH:mm"
  }

  console.log('customerData:', customerData.Firstname);
  console.log('customerData:', customerData.Lastname);
  console.log('customerData:', customerData.email);
  console.log('customerData:', customerData.countrycode);
  console.log('customerData.international:', customerData.international);



  // ฟังก์ชันตรวจสอบข้อผิดพลาด
  const handleNext = () => {
    if (customerData.international == 0) {
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
        setErrors(newErrors);
        setShowAllErrors(true);

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
      setShowAllErrors(false);
      // หากไม่มีข้อผิดพลาด ให้ไปหน้าถัดไป
      navigation.navigate('PaymentScreen');
    } else {
      // ตรวจสอบข้อมูลผู้โดยสาร (PassengerForm)
      const totalPassenger = (customerData.adult || 0) + (customerData.child || 0) + (customerData.infant || 0);
      if (!passengerFormRefs.current || passengerFormRefs.current.length !== totalPassenger) {
        Alert.alert('Incomplete Information', 'Please fill in all required passenger fields.', [
          { text: 'OK', onPress: () => { } }
        ]);
        return;
      }
      let passengerErrors = [];
      let hasPassengerError = false;
      passengerErrors = passengerFormRefs.current.map(ref => ref?.validate?.() || {});
      hasPassengerError = passengerErrors.some(err => Object.keys(err).length > 0);
      passengerFormRefs.current.forEach((formRef, idx) => {
        if (formRef) {
          console.log('formRef', formRef);
          const data = formRef.getData?.() || {};
          const allFields = ['prefix', 'fname', 'lname', 'nationality', 'passport', 'dateofissue', 'passportexpiry', 'birthday'];
          console.log('🧾 Form data:', passengerFormRefs.current.map(r => r?.getData?.()));
          const errorObj = {};
          allFields.forEach(f => {
            if (!data[f] || data[f] === 'Please Select') errorObj[f] = true;
          });
          formRef.setFieldErrors?.(errorObj);
        }
      });
      if (hasPassengerError) {
        setShowAllErrors(true);
        Alert.alert('Incomplete Information', 'Please fill in all required passenger fields.', [
          { text: 'OK', onPress: () => { } }
        ]);
        return;
      }
      setShowAllErrors(false);
      // ถ้าข้อมูลครบ
      const passengerDataArr = passengerFormRefs.current.map(ref => ref?.getData?.() || {});
      console.log("🧾 passengerDataArr", passengerDataArr);
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
        passenger: passengerDataArr
      });
      navigation.navigate('PaymentScreen');
    }
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
      <View style={{ position: 'relative', alignItems: 'center', paddingTop: 6, marginTop: 0, marginBottom: 0, backgroundColor: '#fff' }}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ position: 'absolute', left: 16, top: 6, backgroundColor: '#FFF3ED', borderRadius: 20, padding: 6, zIndex: 2 }}
        >
          <AntDesign name="arrowleft" size={26} color="#FD501E" />
        </TouchableOpacity>
        <LogoTheTrago style={{ marginBottom: 0, marginTop: 0 }} />
        <Step logoUri={2} style={{ marginTop: 0, marginBottom: 0 }} />

      </View>
      <Text style={[styles.title, { marginLeft: 30, marginTop: 5, marginBottom: 10 }]}>Customer Information</Text>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <ImageBackground
            source={{ uri: 'https://www.thetrago.com/assets/images/bg/Aliments.png' }}
            style={styles.background}>




            {/* เงื่อนไขแสดงฟอร์มตาม international */}
            {Number(customerData.international) === 0 ? (
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
                  style={[styles.input, (errors.Firstname || (showAllErrors && !Firstname)) && styles.errorInput]} // ใช้สีแดงเมื่อมีข้อผิดพลาด
                />

                <Text style={styles.textHead}>Last Name</Text>
                <TextInput
                  placeholder="Last Name"
                  value={Lastname}
                  onChangeText={(text) => {
                    setLastname(text);
                    setErrors((prev) => ({ ...prev, Lastname: false })); // Remove error when the user types
                  }}
                  style={[styles.input, (errors.Lastname || (showAllErrors && !Lastname)) && styles.errorInput]} // ใช้สีแดงเมื่อมีข้อผิดพลาด
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
                        placeholderTextColor="#888"
                      />
                      <FlatList
                        data={filteredTelePhones}
                        renderItem={({ item }) => (
                          <TouchableOpacity style={styles.optionItem} onPress={() => handleSelectTele(item)}>
                            <Text style={[styles.optionText, item.sys_countries_nameeng === 'Please Select']}>
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
                  style={[styles.input, (errors.mobileNumber || (showAllErrors && !mobileNumber)) && styles.errorInput]} // ใช้สีแดงเมื่อมีข้อผิดพลาด
                />
                <Text style={styles.title}>Where should we send your booking confirmation?</Text>
                <Text style={styles.textHead}>Email</Text>
                <TextInput
                  placeholder="Enter Your Email"
                  value={email}
                  onChangeText={(text) => {
                    setemail(text);
                    setErrors((prev) => ({ ...prev, email: false })); // Remove error when the user types
                  }}
                  style={[styles.input, (errors.email || (showAllErrors && !email)) && styles.errorInput, customerData.email && styles.disabledInput]} // ใช้สีแดงเมื่อมีข้อผิดพลาด
                  editable={!customerData.email}
                />
              </View>
            ) : (
              // ถ้า international ไม่ใช่ 0 ให้แสดงฟอร์มตามจำนวนผู้โดยสาร
              <>
                {/* ก่อน map ทุกครั้ง ให้ reset refs */}
                {passengerFormRefs.current = []}

                {[...Array(customerData.adult)].map((_, i) => (
                  <PassengerForm
                    ref={el => (passengerFormRefs.current[i] = el)}
                    key={`adult-${i}`}
                    type="adult"
                    index={i}
                    telePhone={telePhone}
                    showAllErrors={showAllErrors}
                  />
                ))}
                {[...Array(customerData.child)].map((_, i) => (
                  <PassengerForm
                    ref={el => (passengerFormRefs.current[customerData.adult + i] = el)}
                    key={`child-${i}`}
                    type="child"
                    index={i}
                    telePhone={telePhone}
                    showAllErrors={showAllErrors}
                  />
                ))}
                {[...Array(customerData.infant)].map((_, i) => (
                  <PassengerForm
                    ref={el => (passengerFormRefs.current[customerData.adult + customerData.child + i] = el)}
                    key={`infant-${i}`}
                    type="infant"
                    index={i}
                    telePhone={telePhone}
                    showAllErrors={showAllErrors}
                  />
                ))}

                {/* Contact Details Section (after all PassengerForms) */}
                <View style={styles.promo}>
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
                          placeholderTextColor="#888"
                        />
                        <FlatList
                          data={filteredTelePhones}
                          renderItem={({ item }) => (
                            <TouchableOpacity style={styles.optionItem} onPress={() => handleSelectTele(item)}>
                              <Text style={[styles.optionText, item.sys_countries_nameeng === 'Please Select']}>
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
                    placeholder="Enter your mobile number"
                    style={[styles.input, contactErrors.mobile && styles.errorInput]}
                    keyboardType="number-pad"
                    value={mobileNumber}
                    onChangeText={text => {
                      setmobileNumber(text);
                      setContactErrors(prev => ({ ...prev, mobile: false }));
                    }}
                  />
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 10, marginBottom: 10 }}>
                    <TouchableOpacity
                      onPress={() => setIsWhatsapp(isWhatsapp ? 0 : 1)}
                      style={{ width: 24, height: 24, justifyContent: 'center', alignItems: 'center', marginRight: 6 }}>
                      <MaterialIcons name={isWhatsapp ? "check-box" : "check-box-outline-blank"} size={24} color="#FD501E" />
                    </TouchableOpacity>
                    <Text style={{ color: '#FD501E', fontWeight: 'bold' }}>Whatsapp</Text>
                  </View>
                  <Text style={styles.title}>Where should we send your booking confirmation?</Text>
                  <Text style={styles.textHead}>Email</Text>
                  <TextInput
                    placeholder="Enter Your Email"
                    style={[styles.input, contactErrors.email && styles.errorInput]}
                    keyboardType="email-address"
                    value={email}
                    onChangeText={text => {
                      setemail(text);
                      setContactErrors(prev => ({ ...prev, email: false }));
                    }}
                  />
                </View>
              </>
            )}

            {/* Render ฟอร์มผู้โดยสารแบบ map พร้อมส่ง type, index ให้แต่ละฟอร์ม */}
            {/* {[...Array(customerData.adult)].map((_, i) => (
              <PassengerForm
                key={`adult-${i}`}
                type="adult"
                index={i}
                telePhone={telePhone}
                // ...other props if needed...
              />
            ))}
            {[...Array(customerData.child)].map((_, i) => (
              <PassengerForm
                key={`child-${i}`}
                type="child"
                index={i}
                telePhone={telePhone}
                // ...other props if needed...
              />
            ))}
            {[...Array(customerData.infant)].map((_, i) => (
              <PassengerForm
                key={`infant-${i}`}
                type="infant"
                index={i}
                telePhone={telePhone}
                // ...other props if needed...
              />
            ))} */}

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
                    <Text>{customerData.symbol} {formatNumberWithComma(customerData.totaladultDepart)}</Text>
                  </View>
                  {customerData.child !== 0 && (
                    <View style={styles.rowpromo}>
                      <Text>Child x {customerData.child}</Text>
                      <Text>{customerData.symbol} {formatNumberWithComma(customerData.totalchildDepart)}</Text>
                    </View>
                  )}
                  {customerData.infant !== 0 && (
                    <View style={styles.rowpromo}>
                      <Text>infant x {customerData.infant}</Text>
                      <Text>{customerData.symbol} {formatNumberWithComma(customerData.totalinfantDepart)}</Text>
                    </View>
                  )}
                  {customerData.pickupPriceDepart != 0 && (
                    <View style={styles.rowpromo}>
                      <Text>Pick up</Text>
                      <Text style={{ color: 'green' }}>+ {customerData.symbol} {formatNumberWithComma(customerData.pickupPriceDepart)}</Text>
                    </View>
                  )}
                  {customerData.dropoffPriceDepart != 0 && (
                    <View style={styles.rowpromo}>
                      <Text>Drop off</Text>
                      <Text style={{ color: 'green' }}>+ {customerData.symbol} {formatNumberWithComma(customerData.dropoffPriceDepart)}</Text>
                    </View>
                  )}
                  {customerData.discountDepart != 0 && (
                    <View style={styles.rowpromo}>
                      <Text>Discount</Text>
                      <Text style={styles.redText}>- {customerData.symbol} {formatNumberWithComma(customerData.discountDepart)}</Text>
                    </View>
                  )}
                  <View style={styles.rowpromo}>
                    <Text>Ticket fare</Text>
                    <Text style={{ fontWeight: 'bold' }}>{customerData.symbol} {formatNumberWithComma(customerData.subtotalDepart)}</Text>
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
                        <Text>{customerData.symbol} {formatNumberWithComma(customerData.totaladultReturn)}</Text>
                      </View>
                      {customerData.child !== 0 && (
                        <View style={styles.rowpromo}>
                          <Text>Child x {customerData.child}</Text>
                          <Text>{customerData.symbol} {formatNumberWithComma(customerData.totalchildReturn)}</Text>
                        </View>
                      )}
                      {customerData.infant !== 0 && (
                        <View style={styles.rowpromo}>
                          <Text>infant x {customerData.infant}</Text>
                          <Text>{customerData.symbol} {formatNumberWithComma(customerData.totalinfantReturn)}</Text>
                        </View>
                      )}
                      {customerData.pickupPriceReturn != 0 && (
                        <View style={styles.rowpromo}>
                          <Text>Pick up</Text>
                          <Text style={{ color: 'green' }}>+ {customerData.symbol} {formatNumberWithComma(customerData.pickupPriceReturn)}</Text>
                        </View>
                      )}
                      {customerData.dropoffPriceReturn != 0 && (
                        <View style={styles.rowpromo}>
                          <Text>Drop off</Text>
                          <Text style={{ color: 'green' }}>+ {customerData.symbol} {formatNumberWithComma(customerData.dropoffPriceReturn)}</Text>
                        </View>
                      )}
                      {customerData.discountReturn != 0 && (
                        <View style={styles.rowpromo}>
                          <Text>Discount</Text>
                          <Text style={styles.redText}>- {customerData.symbol} {formatNumberWithComma(customerData.discountReturn)}</Text>
                        </View>
                      )}
                      <View style={styles.rowpromo}>
                        <Text>Ticket fare</Text>
                        <Text style={{ fontWeight: 'bold' }}>{customerData.symbol} {formatNumberWithComma(customerData.subtotalReturn)}</Text>
                      </View>
                      <View style={styles.divider} />
                    </View>
                  ))}
                </>
              )}
              <View style={styles.rowpromo}>
                <Text>Subtotal </Text>
                <Text>{customerData.symbol} {formatNumberWithComma(customerData.total)}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.rowpromo}>
                <Text style={{ color: '#FD501E' }}>total </Text>
                <Text style={{ color: '#FD501E' }}>{customerData.symbol} {formatNumberWithComma(customerData.total)}</Text>
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
                style={[styles.ActionButton, { width: '100%' }]} // Use an array if you want to combine styles
                onPress={() => {
                  handleNext();
                }}>
                <Text style={styles.searchButtonText}>Next</Text>
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
    borderColor: 'red',

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
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 8,
    backgroundColor: '#fff',
    marginBottom: 10,
    color: '#222', // เพิ่มสีตัวอักษร
    fontSize: 16, // เพิ่มขนาดตัวอักษร
  },
  disabledInput: {
    backgroundColor: '#f0f0f0', // สีเทาเมื่อ email มีข้อมูล
  },

});
export default CustomerInfo;
