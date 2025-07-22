import React, { useState, useEffect, useRef, useImperativeHandle } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, FlatList, TextInput, ImageBackground, Alert, SafeAreaView, StatusBar, KeyboardAvoidingView, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import LogoTheTrago from './../(component)/Logo';
import Step from './../(component)/Step';
import Textinput from '../(component)/Textinput';
import ipAddress from '../ipconfig';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useCustomer } from './CustomerContext';
import { useLanguage } from './LanguageContext';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import headStyles from './../(CSS)/StartingPointScreenStyles';
import axios from 'axios';

// ===== Inline PassengerForm component (ต้องอยู่ก่อน CustomerInfo) =====
const PassengerForm = React.forwardRef(({ type, index, telePhone, showAllErrors }, ref) => {
  const { t } = useLanguage();
  const [selectedTitle, setSelectedTitle] = React.useState(t('pleaseSelect') || 'Please Select');
  const [isModalVisible, setModalVisible] = React.useState(false);
  const [selectedNationality, setSelectedNationality] = React.useState(t('pleaseSelect') || 'Please Select');
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
      if (!selectedTitle || selectedTitle === 'Please Select' || selectedTitle === (t('pleaseSelect') || 'Please Select')) errors.selectedTitle = true;
      if (!fname || fname.trim() === '') errors.fname = true;
      if (!lname || lname.trim() === '') errors.lname = true;
      if (!selectedNationality || selectedNationality === 'Please Select' || selectedNationality === (t('pleaseSelect') || 'Please Select')) errors.nationality = true;
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
      <Text style={styles.textHead}>{t('title') || 'Title'}</Text>
      <TouchableOpacity
        style={[styles.button, (fieldErrors.selectedTitle || (showAllErrors && (selectedTitle === (t('pleaseSelect') || 'Please Select') || !selectedTitle))) && styles.errorInput]}
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
      <Text style={styles.textHead}>{t('firstName') || 'First Name'}</Text>
      <TextInput
        placeholder={t('firstName') || 'First Name'}
        value={fname}
        onChangeText={handleFnameChange}
        style={[styles.input, (fieldErrors.fname || (showAllErrors && !fname)) && styles.errorInput]}
      />


      {/* Last Name */}
      <Text style={styles.textHead}>{t('lastName') || 'Last Name'}</Text>
      <TextInput
        placeholder={t('lastName') || 'Last Name'}
        value={lname}
        onChangeText={handleLnameChange}
        style={[styles.input, (fieldErrors.lname || (showAllErrors && !lname)) && styles.errorInput]}
      />


      {/* Nationality */}
      <Text style={styles.textHead}>{t('nationality') || 'Nationality'}</Text>
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
              placeholder={t('searchCountry') || 'Search country'}
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
      <Text style={styles.textHead}>{t('passport') || 'Passport'}</Text>
      <TextInput
        placeholder={t('passportNumber') || 'Passport Number'}
        value={passport}
        onChangeText={handlePassportChange}
        style={[styles.input, (fieldErrors.passport || (showAllErrors && !passport)) && styles.errorInput]}
      />


      {/* Date of Issue */}
      <Text style={styles.textHead}>{t('dateOfIssue') || 'Date of Issue'}</Text>
      <TouchableOpacity
        style={[styles.button, (fieldErrors.dateOfIssue || (showAllErrors && !dateOfIssue)) && styles.errorInput]}
        onPress={() => setShowDatePicker(!showDatePicker)}>
        <Text style={styles.buttonText}>
          {dateOfIssue ? new Date(dateOfIssue).toLocaleDateString('en-GB') : (t('selectDate') || 'Select Date')}
        </Text>
        <Icon name="calendar" size={18} color="#FD501E" style={styles.icon} />
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={dateOfIssue ? new Date(dateOfIssue) : new Date()}
          mode="date"
          display="default"
          maximumDate={new Date()}
          onChange={(event, selectedDate) => {
            if (selectedDate) handleDateOfIssue(selectedDate.toISOString().split('T')[0]);
          }}
        />
      )}

      {/* Passport Expiry Date */}
      <Text style={styles.textHead}>{t('passportExpiryDate') || 'Passport Expiry Date'}</Text>
      <TouchableOpacity
        style={[styles.button, (fieldErrors.passportExpiry || (showAllErrors && !passportExpiry)) && styles.errorInput]}
        onPress={() => setShowPassportExpiryPicker(!showPassportExpiryPicker)}>
        <Text style={styles.buttonText}>
          {passportExpiry ? new Date(passportExpiry).toLocaleDateString('en-GB') : (t('selectDate') || 'Select Date')}
        </Text>
        <Icon name="calendar" size={18} color="#FD501E" style={styles.icon} />
      </TouchableOpacity>
      {showPassportExpiryPicker && (
        <DateTimePicker
          value={passportExpiry ? new Date(passportExpiry) : new Date()}
          mode="date"
          display="default"
          minimumDate={new Date()}
          onChange={(event, selectedDate) => {
            if (selectedDate) handlePassportExpiry(selectedDate.toISOString().split('T')[0]);
          }}
        />
      )}

      {/* Date of Birth */}
      <Text style={styles.textHead}>{t('dateOfBirth') || 'Date of Birth'}</Text>
      <TouchableOpacity
        style={[styles.button, fieldErrors.birthday && styles.errorInput]}
        onPress={() => setShowBirthdayPicker(!showBirthdayPicker)}>
        <Text style={styles.buttonText}>
          {birthday ? new Date(birthday).toLocaleDateString('en-GB') : (t('selectDate') || 'Select Date')}
        </Text>
        <Icon name="calendar" size={18} color="#FD501E" style={styles.icon} />
      </TouchableOpacity>
      {showBirthdayPicker && (
        <DateTimePicker
          value={birthday ? new Date(birthday) : new Date()}
          mode="date"
          display="default"
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
  const { t } = useLanguage();
  const { customerData, updateCustomerData } = useCustomer();
  
  const titleOptions = [t('pleaseSelect') || 'Please Select', t('mr') || 'Mr.', t('mrs') || 'Mrs.', t('ms') || 'Ms.', t('master') || 'Master'];
  
  const [code, setcode] = useState('');
  const [Firstname, setFirstname] = useState(customerData.Firstname);
  const [Lastname, setLastname] = useState(customerData.Lastname);
  const [selectedTitle, setSelectedTitle] = useState(t('pleaseSelect') || 'Please Select');
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
  const [isWhatsapp, setIsWhatsapp] = useState(''); // State for Whatsapp checkbox
  const [contactErrors, setContactErrors] = useState({ phone: false, mobile: false, email: false });
  const passengerFormRefs = useRef([]);
  const [showAllErrors, setShowAllErrors] = useState(false);
  const [PriceDepart, setPriceDepart] = useState([]);
  const [PriceReturn, setPriceReturn] = useState([]);

  function formatTime(timeString) {
    if (!timeString) return ""; // Handle empty input
    return timeString.slice(0, 5); // Extracts "HH:mm"
  }

  console.log('customerData:', customerData.Firstname);
  console.log('customerData:', customerData.Lastname);
  console.log('customerData:', customerData.email);
  console.log('customerData:', customerData.countrycode);
  console.log('customerData.international:', customerData.international);

  const fetchPrice = async () => {
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
          pickupdepart1: customerData.pickupDepartId,
          pickupdepart2: customerData.pickupReturnId,
          dropoffdepart1: customerData.dropoffDepartId,
          dropoffdepart2: customerData.dropoffReturnId,
          paymentfee: 0,



        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.status === 'success') {


        setPriceDepart([response.data.data]);



      } else {
        setPriceDepart([]);
        setPriceReturn([]);
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


  const handlepromo = async () => {
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
          pickupdepart1: customerData.pickupDepartId,
          pickupdepart2: customerData.pickupReturnId,
          dropoffdepart1: customerData.dropoffDepartId,
          dropoffdepart2: customerData.dropoffReturnId,
          paymentfee: 0,
          promotioncode: code,


        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.status === 'success') {
        if (response.data.data.totalDepart.promotionprice !== 0) {
          Alert.alert(t('codeSuccess') || 'โค้ดสำเร็จ');
        } else {
          Alert.alert(t('invalidCode') || 'โค้ดไม่ถูกต้อง');
        }

        // Set the price data correctly based on API response structure
        setPriceDepart([response.data.data]);

        updateCustomerData({
          md_booking_promoprice : response.data.data.totalDepart.promotionprice || 0,
        });

        // Set return data if exists
        if (response.data.data.totalReturn) {
          setPriceReturn([response.data.data.totalReturn]);
        }

      } else {
        Alert.alert(t('invalidCode') || 'โค้ดไม่ถูกต้อง');
        setPriceDepart([]);
        setPriceReturn([]);
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

  // ฟังก์ชันตรวจสอบข้อผิดพลาด
  const handleNext = () => {
    if (customerData.international == 0) {
      let newErrors = {};
      if (selectedTitle === 'Please Select' || selectedTitle === (t('pleaseSelect') || 'Please Select')) newErrors.selectedTitle = true;
      if (!Firstname) newErrors.Firstname = true;
      if (!Lastname) newErrors.Lastname = true;
      if (selectedTele === 'Please Select' || selectedTele === (t('pleaseSelect') || 'Please Select')) newErrors.selectedTele = true;
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
        // booking information
        md_booking_country: country,
        md_booking_countrycode: '+' + countrycode,
        md_booking_tel: mobileNumber,
        md_booking_email: email,
        md_booking_whatsapp: isWhatsapp,
        md_booking_promocode: code,
        md_booking_promoprice: PriceDepart[0].totalDepart.promotionprice
      });

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        setShowAllErrors(true);

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
      setShowAllErrors(false);
      // หากไม่มีข้อผิดพลาด ให้ไปหน้าถัดไป
      navigation.navigate('PaymentScreen');
    } else {
      // ตรวจสอบข้อมูลผู้โดยสาร (PassengerForm)
      const totalPassenger = (customerData.adult || 0) + (customerData.child || 0) + (customerData.infant || 0);
      if (!passengerFormRefs.current || passengerFormRefs.current.length !== totalPassenger) {
        Alert.alert(t('incompleteInformation') || 'Incomplete Information', t('pleaseFillAllRequiredPassengerFields') || 'Please fill in all required passenger fields.', [
          { text: t('ok') || 'OK', onPress: () => { } }
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
            if (!data[f] || data[f] === 'Please Select' || data[f] === (t('pleaseSelect') || 'Please Select')) errorObj[f] = true;
          });
          formRef.setFieldErrors?.(errorObj);
        }
      });
      if (hasPassengerError) {
        setShowAllErrors(true);
        Alert.alert(t('incompleteInformation') || 'Incomplete Information', t('pleaseFillAllRequiredPassengerFields') || 'Please fill in all required passenger fields.', [
          { text: t('ok') || 'OK', onPress: () => { } }
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
        passenger: passengerDataArr,
        // booking information
        md_booking_country: country,
        md_booking_countrycode: '+' + countrycode,
        md_booking_tel: mobileNumber,
        md_booking_email: email,
        md_booking_whatsapp: isWhatsapp,
        md_booking_promocode: code,
        md_booking_promoprice: PriceDepart[0].totalDepart.promotionprice
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
    fetchPrice();
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

        {/* Enhanced Ultra Premium Title Section */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: hp('1%'),
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
          <View style={{ flex: 1 }}>
            <Text style={[
              headStyles.headerTitle,
              {
                color: '#FFFFFF',
                fontSize: wp('7%'),
                fontWeight: '800',
                letterSpacing: -0.5,
                textAlign: 'left',
                marginLeft: 0,
                lineHeight: wp('8%'),
                textShadowColor: 'rgba(0,0,0,0.3)',
                textShadowRadius: 4,
                textShadowOffset: { width: 1, height: 1 },
              }
            ]}>
              {t('customerInformation') || 'Customer Information'}
            </Text>
            <Text style={{
              color: 'rgba(255,255,255,0.8)',
              fontSize: wp('3.5%'),
              fontWeight: '500',
              marginTop: hp('0.5%'),
              letterSpacing: 0.3,
              textShadowColor: 'rgba(0,0,0,0.2)',
              textShadowRadius: 2,
            }}>
              {t('findYourPerfectJourney') || 'Find your perfect journey'}
            </Text>
          </View>
        </View>

        <StatusBar barStyle="light-content" backgroundColor="#FD501E" translucent />

        <KeyboardAvoidingView
          behavior="padding"
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={[styles.container, { paddingBottom: hp('12%') }]}
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
              <Step logoUri={2} />
            </View>

            {/* Content Container */}
            <View style={styles.contentContainer}>
              {/* เงื่อนไขแสดงฟอร์มตาม international */}
              {Number(customerData.international) === 0 ? (
                <View style={styles.promo}>
                  <Text style={styles.TextInput}>{t('passengerDetails') || 'Passenger Details'}</Text>

                  {/* คำนำหน้า */}
                  <Text style={styles.textHead}>{t('title') || 'Title'}</Text>
                  <TouchableOpacity

                    style={[styles.button, (errors.selectedTitle || (selectedTitle === 'Please Select' || selectedTitle === (t('pleaseSelect') || 'Please Select'))) && styles.errorInput]}
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
                  <Text style={styles.textHead}>{t('firstName') || 'First Name'}</Text>
                  <TextInput
                    placeholder={t('firstName') || 'First Name'}
                    value={Firstname}
                    onChangeText={(text) => {
                      setFirstname(text);
                      setErrors((prev) => ({ ...prev, Firstname: false }));
                    }}
                    style={[styles.input, (errors.Firstname || (showAllErrors && !Firstname)) && styles.errorInput]} // ใช้สีแดงเมื่อมีข้อผิดพลาด
                  />

                  <Text style={styles.textHead}>{t('lastName') || 'Last Name'}</Text>
                  <TextInput
                    placeholder={t('lastName') || 'Last Name'}
                    value={Lastname}
                    onChangeText={(text) => {
                      setLastname(text);
                      setErrors((prev) => ({ ...prev, Lastname: false })); // Remove error when the user types
                    }}
                    style={[styles.input, (errors.Lastname || (showAllErrors && !Lastname)) && styles.errorInput]} // ใช้สีแดงเมื่อมีข้อผิดพลาด
                  />


                  {/* รายละเอียดการติดต่อ */}
                  <Text style={styles.TextInput}>{t('contactDetails') || 'Contact Details'}</Text>
                  <Text style={styles.textHead}>{t('phoneNumber') || 'Phone number'}</Text>
                  <TouchableOpacity
                    style={[styles.button, (errors.selectedTele || (selectedTele === 'Please Select' || selectedTele === (t('pleaseSelect') || 'Please Select'))) && styles.errorInput]}
                    onPress={toggleTeleModal}>
                    <Text style={styles.buttonText}>{selectedTele}</Text>
                    <Icon name="chevron-down" size={18} color="#FD501E" style={styles.icon} />
                  </TouchableOpacity>

                  {/* Modal for selecting telephone */}
                  <Modal visible={isTeleModalVisible} transparent animationType="fade" onRequestClose={toggleTeleModal}>
                    <View style={styles.modalOverlay}>
                      <View style={styles.modalContent}>
                        <TextInput
                          placeholder={t('searchCountry') || 'Search country'}
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
                    placeholder={t('mobileNumber') || 'Mobile Number'}
                    value={mobileNumber}
                    keyboardType="number-pad"
                    onChangeText={(text) => {
                      setmobileNumber(text);
                      setErrors((prev) => ({ ...prev, mobileNumber: false })); // Remove error when the user types
                    }}
                    style={[styles.input, (errors.mobileNumber || (showAllErrors && !mobileNumber)) && styles.errorInput]} // ใช้สีแดงเมื่อมีข้อผิดพลาด
                  />
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 10, marginBottom: 10 }}>
                    <TouchableOpacity
                      onPress={() => setIsWhatsapp(isWhatsapp ? "0" : "on")}
                      style={{ width: 24, height: 24, justifyContent: 'center', alignItems: 'center', marginRight: 6 }}>
                      <MaterialIcons name={isWhatsapp ? "check-box" : "check-box-outline-blank"} size={24} color="#FD501E" />
                    </TouchableOpacity>
                    <Text style={{ color: '#FD501E', fontWeight: 'bold' }}>WhatsApp</Text>
                  </View>
                  <Text style={[styles.title, { color: '#1E293B', fontSize: wp('4%'), fontWeight: '600', marginBottom: hp('1%'), textAlign: 'left' }]}>{t('whereToSendBookingConfirmation') || 'Where should we send your booking confirmation?'}</Text>
                  <Text style={styles.textHead}>{t('email') || 'Email'}</Text>
                  <TextInput
                    placeholder={t('enterYourEmail') || 'Enter Your Email'}
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
                    <Text style={styles.TextInput}>{t('contactDetails') || 'Contact Details'}</Text>
                    <Text style={styles.textHead}>{t('phoneNumber') || 'Phone number'}</Text>
                    <TouchableOpacity
                      style={[styles.button, (errors.selectedTele || (selectedTele === 'Please Select' || selectedTele === (t('pleaseSelect') || 'Please Select'))) && styles.errorInput]}
                      onPress={toggleTeleModal}>
                      <Text style={styles.buttonText}>{selectedTele}</Text>
                      <Icon name="chevron-down" size={18} color="#FD501E" style={styles.icon} />
                    </TouchableOpacity>

                    {/* Modal for selecting telephone */}
                    <Modal visible={isTeleModalVisible} transparent animationType="fade" onRequestClose={toggleTeleModal}>
                      <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                          <TextInput
                            placeholder={t('searchCountry') || 'Search country'}
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
                      placeholder={t('enterYourMobileNumber') || 'Enter your mobile number'}
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
                        onPress={() => setIsWhatsapp(isWhatsapp ? "0" : "on")}
                        style={{ width: 24, height: 24, justifyContent: 'center', alignItems: 'center', marginRight: 6 }}>
                        <MaterialIcons name={isWhatsapp ? "check-box" : "check-box-outline-blank"} size={24} color="#FD501E" />
                      </TouchableOpacity>
                      <Text style={{ color: '#FD501E', fontWeight: 'bold' }}>WhatsApp</Text>
                    </View>
                    <Text style={[styles.title, { color: '#1E293B', fontSize: wp('4%'), fontWeight: '600', marginBottom: hp('1%'), textAlign: 'left' }]}>{t('whereToSendBookingConfirmation') || 'Where should we send your booking confirmation?'}</Text>
                    <Text style={styles.textHead}>{t('email') || 'Email'}</Text>
                    <TextInput
                      placeholder={t('enterYourEmail') || 'Enter Your Email'}
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
              {Array.isArray(PriceDepart) && PriceDepart.map((all, index) => (
                <View key={index}>

                  <View style={styles.promo}>
                    <Text style={[styles.title, { color: '#1E293B', fontSize: wp('5%'), fontWeight: '800', marginBottom: hp('2%'), textAlign: 'left' }]}>{t('bookingSummary') || 'Booking Summary'}</Text>
                    <View style={styles.divider} />
                    {timetableDepart.map((item, index) => (
                      <View key={index}>
                        <Text style={{ fontWeight: '800', fontSize: wp('4.5%'), color: '#1E293B', marginBottom: hp('1%') }}>{t('depart') || 'Depart'}</Text>

                        <Text style={{ marginTop: 5, color: '#FD501E' }}>{item.startingpoint_name} <AntDesign name="arrowright" size={14} color="#FD501E" /> {item.endpoint_name}</Text>
                        <View style={styles.rowpromo}>
                          <Text style={{ color: '#6B7280', fontSize: wp('3.5%'), fontWeight: '500' }}>{t('company') || 'Company'} </Text>
                          <Text style={{ color: '#6B7280', fontSize: wp('3.5%'), fontWeight: '500' }}> {item.md_company_nameeng}</Text>
                        </View>
                        <View style={styles.rowpromo}>
                          <Text style={{ color: '#6B7280', fontSize: wp('3.5%'), fontWeight: '500' }}>{t('seat') || 'Seat'}</Text>
                          <Text style={{ color: '#6B7280', fontSize: wp('3.5%'), fontWeight: '500' }}>{item.md_seat_nameeng}</Text>
                        </View>
                        <View style={styles.rowpromo}>
                          <Text style={{ color: '#6B7280', fontSize: wp('3.5%'), fontWeight: '500' }}>{t('boat') || 'Boat'} </Text>
                          <Text style={{ color: '#6B7280', fontSize: wp('3.5%'), fontWeight: '500' }}>{item.md_boattype_nameeng}</Text>
                        </View>
                        <View style={styles.rowpromo}>
                          <Text style={{ color: '#6B7280', fontSize: wp('3.5%'), fontWeight: '500' }}>{t('departureData') || 'Departure Data'}</Text>
                          <Text style={{ color: '#6B7280', fontSize: wp('3.5%'), fontWeight: '500' }}> {formatDate(customerData.departdate)}</Text>
                        </View>
                        <View style={styles.rowpromo}>
                          <Text style={{ color: '#6B7280', fontSize: wp('3.5%'), fontWeight: '500' }}>{t('departureTime') || 'Departure Time'} : </Text>
                          <Text style={{ color: '#6B7280', fontSize: wp('3.5%'), fontWeight: '500' }}>{formatTime(item.md_timetable_departuretime)} - {formatTime(item.md_timetable_arrivaltime)} | {formatTimeToHoursAndMinutes(item.md_timetable_time)}</Text>
                        </View>




                        <View style={[styles.rowpromo, { marginTop: hp('1%') }]}>
                          <Text style={{ fontSize: wp('3.8%'), fontWeight: '600', color: '#374151' }}>{t('adult') || 'Adult'} x {customerData.adult}</Text>
                          <Text style={{ fontSize: wp('3.8%'), fontWeight: '600', color: '#374151' }}>{customerData.symbol} {formatNumberWithComma(all.totalDepart.priceadult)}</Text>
                        </View>
                        {customerData.child !== 0 && (
                          <View style={styles.rowpromo}>
                            <Text style={{ fontSize: wp('3.8%'), fontWeight: '600', color: '#374151' }}>{t('child') || 'Child'} x {customerData.child}</Text>
                            <Text style={{ fontSize: wp('3.8%'), fontWeight: '600', color: '#374151' }}>{customerData.symbol} {formatNumberWithComma(all.totalDepart.pricechild)}</Text>
                          </View>
                        )}
                        {customerData.infant !== 0 && (
                          <View style={styles.rowpromo}>
                            <Text style={{ fontSize: wp('3.8%'), fontWeight: '600', color: '#374151' }}>{t('infant') || 'infant'} x {customerData.infant}</Text>
                            <Text style={{ fontSize: wp('3.8%'), fontWeight: '600', color: '#374151' }}>{customerData.symbol} {formatNumberWithComma(all.totalDepart.priceinfant)}</Text>
                          </View>
                        )}
                        {customerData.pickupDepartId && (
                          <View style={styles.rowpromo}>
                            <Text>{t('pickUp') || 'Pick up'}</Text>
                            <Text style={{ color: 'green' }}>+ {customerData.symbol} {formatNumberWithComma(all.totalDepart.pricepickupdepart)}</Text>
                          </View>
                        )}
                        {customerData.dropoffDepartId && (
                          <View style={styles.rowpromo}>
                            <Text>{t('dropOff') || 'Drop off'}</Text>
                            <Text style={{ color: 'green' }}>+ {customerData.symbol} {formatNumberWithComma(all.totalDepart.pricedropoffdepart)}</Text>
                          </View>
                        )}
                        {all.totalDepart.save != 0 && (
                          <View style={styles.rowpromo}>
                            <Text>{t('discount') || 'Discount'}</Text>
                            <Text style={styles.redText}>- {customerData.symbol} {formatNumberWithComma(all.totalDepart.discount)}</Text>
                          </View>
                        )}
                        {all.totalDepart.promotionprice != 0 && (
                          <View style={styles.rowpromo}>
                            <Text>{t('promotionCode') || 'Promotion Code'}</Text>
                            <Text style={styles.redText}>- {customerData.symbol} {formatNumberWithComma(all.totalDepart.promotionprice)}</Text>
                          </View>
                        )}
                        <View style={styles.rowpromo}>
                          <Text>{t('ticketFare') || 'Ticket fare'}</Text>
                          <Text style={{ fontWeight: 'bold' }}>{customerData.symbol} {formatNumberWithComma(all.totalDepart.showtotal)}</Text>
                        </View>

                        <View style={styles.divider} />
                      </View>
                    ))}
                    {customerData.roud === 2 && (
                      <>
                        {timetableReturn.map((item, index) => (
                          <View key={index}>
                            <Text style={{ fontWeight: 'bold' }}>{t('return') || 'Return'}</Text>
                            <Text style={{ marginTop: 5, color: '#FD501E' }}>
                              {item.startingpoint_name} <AntDesign name="arrowright" size={14} color="#FD501E" /> {item.endpoint_name}
                            </Text>
                            <View style={styles.rowpromo}>
                              <Text style={{ color: '#666666' }}>{t('company') || 'Company'} </Text>
                              <Text style={{ color: '#666666' }}>{item.md_company_nameeng}</Text>
                            </View>
                            <View style={styles.rowpromo}>
                              <Text style={{ color: '#666666' }}>{t('seat') || 'Seat'}</Text>
                              <Text style={{ color: '#666666' }}>{item.md_seat_nameeng}</Text>
                            </View>
                            <View style={styles.rowpromo}>
                              <Text style={{ color: '#666666' }}>{t('boat') || 'Boat'} </Text>
                              <Text style={{ color: '#666666' }}>{item.md_boattype_nameeng}</Text>
                            </View>
                            <View style={styles.rowpromo}>
                              <Text style={{ color: '#666666' }}>{t('departureData') || 'Departure Data'}</Text>
                              <Text style={{ color: '#666666' }}> {formatDate(customerData.returndate)}</Text>
                            </View>
                            <View style={styles.rowpromo}>
                              <Text style={{ color: '#666666' }}>{t('departureTime') || 'Departure Time'} : </Text>
                              <Text style={{ color: '#666666' }}>
                                {formatTime(item.md_timetable_departuretime)} - {formatTime(item.md_timetable_arrivaltime)} | {formatTimeToHoursAndMinutes(item.md_timetable_time)}
                              </Text>
                            </View>
                            <View style={[styles.rowpromo, { marginTop: 5 }]}>
                              <Text>{t('adult') || 'Adult'} x {customerData.adult}</Text>
                              <Text>{customerData.symbol} {formatNumberWithComma(all.totalReturn.priceadult)}</Text>
                            </View>
                            {customerData.child !== 0 && (
                              <View style={styles.rowpromo}>
                                <Text>{t('child') || 'Child'} x {customerData.child}</Text>
                                <Text>{customerData.symbol} {formatNumberWithComma(all.totalReturn.pricechild)}</Text>
                              </View>
                            )}
                            {customerData.infant !== 0 && (
                              <View style={styles.rowpromo}>
                                <Text>{t('infant') || 'infant'} x {customerData.infant}</Text>
                                <Text>{customerData.symbol} {formatNumberWithComma(all.totalReturn.priceinfant)}</Text>
                              </View>
                            )}
                            {customerData.pickupReturnId != 0 && (
                              <View style={styles.rowpromo}>
                                <Text>{t('pickUp') || 'Pick up'}</Text>
                                <Text style={{ color: 'green' }}>+ {customerData.symbol} {formatNumberWithComma(all.totalReturn.pricepickupdepart)}</Text>
                              </View>
                            )}
                            {customerData.dropoffReturnId != 0 && (
                              <View style={styles.rowpromo}>
                                <Text>{t('dropOff') || 'Drop off'}</Text>
                                <Text style={{ color: 'green' }}>+ {customerData.symbol} {formatNumberWithComma(all.totalReturn.pricedropoffdepart)}</Text>
                              </View>
                            )}
                            {all.totalReturn.save != 0 && (
                              <View style={styles.rowpromo}>
                                <Text>{t('discount') || 'Discount'}</Text>
                                <Text style={styles.redText}>- {customerData.symbol} {formatNumberWithComma(all.totalReturn.discount)}</Text>
                              </View>
                            )}
                            {all.totalReturn.promotionprice != 0 && (
                              <View style={styles.rowpromo}>
                                <Text>{t('promotionCode') || 'Promotion Code'}</Text>
                                <Text style={styles.redText}>- {customerData.symbol} {formatNumberWithComma(all.totalReturn.promotionprice)}</Text>
                              </View>
                            )}
                            <View style={styles.rowpromo}>
                              <Text>{t('ticketFare') || 'Ticket fare'}</Text>
                              <Text style={{ fontWeight: 'bold' }}>{customerData.symbol} {formatNumberWithComma(all.totalReturn.showtotal)}</Text>
                            </View>
                            <View style={styles.divider} />
                          </View>
                        ))}
                      </>
                    )}
                    <View style={styles.rowpromo}>
                      <Text>{t('subtotal') || 'Subtotal'} </Text>
                      <Text>{customerData.symbol} {formatNumberWithComma(all.total)}</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.rowpromo}>
                      <Text style={{ color: '#FD501E' }}>{t('total') || 'total'} </Text>
                      <Text style={{ color: '#FD501E' }}>{customerData.symbol} {formatNumberWithComma(all.totalbooking)}</Text>
                    </View>
                  </View>
                </View>
              ))}


              <View style={styles.promo}>
                <Text style={styles.promoLabel}>{t('promotionCode') || 'Promotion Code'}</Text>

                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.promoInput}
                    placeholder={t('couponCode') || 'Coupon code'}
                    value={code}
                    onChangeText={setcode}
                    placeholderTextColor="#A1A1A1"
                  />

                  <TouchableOpacity style={styles.applyButton} onPress={handlepromo}>
                    <Text style={styles.applyText}>{t('apply') || 'Apply'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.rowButton}>
                <TouchableOpacity
                  style={[styles.ActionButton, { width: '100%' }]}
                  onPress={() => {
                    handleNext();
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.searchButtonText}>{t('next') || 'Next'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: wp('5%'),
    paddingBottom: hp('2%'),
  },
  contentContainer: {
    flex: 1,
    paddingTop: hp('1%'),
  },
  title: {
    fontSize: wp('4.5%'),
    fontWeight: 'bold',
    textAlign: 'left',
    color: '#FFFFFF',
    marginBottom: hp('2%'),
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowRadius: 2,
  },
  promo: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: wp('5%'),
    width: '100%',
    padding: wp('4%'),
    marginVertical: hp('1%'),
    shadowColor: '#001233',
    shadowOpacity: 0.15,
    shadowRadius: wp('4%'),
    shadowOffset: { width: 0, height: hp('0.5%') },
    borderWidth: 1,
    borderColor: 'rgba(0, 18, 51, 0.08)',
    backdropFilter: 'blur(20px)',
  },
  TextInput: {
    fontSize: wp('4.5%'),
    fontWeight: '800',
    marginBottom: hp('1%'),
    color: '#1E293B',
    letterSpacing: -0.3,
  },
  textHead: {
    fontSize: wp('4%'),
    fontWeight: '600',
    paddingVertical: hp('1%'),
    marginLeft: wp('2%'),
    color: '#374151',
    letterSpacing: 0.2,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: hp('1.5%'),
    paddingHorizontal: wp('4%'),
    ...(Platform.OS === 'android' ? {} : {
      borderWidth: 1,
      borderColor: '#E5E7EB',
    }),
    borderRadius: wp('3%'),
    justifyContent: 'space-between',
    marginHorizontal: wp('2%'),
    marginBottom: hp('1%'),
    shadowColor: '#6B7280',
    shadowOpacity: 0.1,
    shadowRadius: wp('2%'),
    shadowOffset: { width: 0, height: hp('0.3%') },
  },
  buttonText: {
    fontSize: wp('4%'),
    color: '#374151',
    fontWeight: '500',
  },
  icon: {
    marginLeft: wp('2%'),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 18, 51, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContentPre: {
    backgroundColor: 'rgba(255,255,255,0.98)',
    width: '80%',
    maxHeight: '50%',
    borderRadius: wp('4%'),
    padding: wp('4%'),
    shadowColor: '#001233',
    shadowOpacity: 0.2,
    shadowRadius: wp('5%'),
    shadowOffset: { width: 0, height: hp('1%') },
    ...(Platform.OS === 'android' ? {} : {
      borderWidth: 1,
      borderColor: 'rgba(0, 18, 51, 0.08)',
    }),
  },
  modalContent: {
    backgroundColor: 'rgba(255,255,255,0.98)',
    width: '80%',
    height: '40%',
    borderRadius: wp('4%'),
    padding: wp('4%'),
    shadowColor: '#001233',
    shadowOpacity: 0.2,
    shadowRadius: wp('5%'),
    shadowOffset: { width: 0, height: hp('1%') },
    ...(Platform.OS === 'android' ? {} : {
      borderWidth: 1,
      borderColor: 'rgba(0, 18, 51, 0.08)',
    }),
  },
  optionItem: {
    paddingVertical: hp('1.5%'),
    paddingHorizontal: wp('3%'),
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    borderRadius: wp('2%'),
    marginBottom: hp('0.5%'),
  },
  optionText: {
    fontSize: wp('4%'),
    color: '#374151',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    width: '100%',
    backgroundColor: '#E5E7EB',
    marginVertical: hp('1.5%'),
  },
  rowpromo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: hp('0.5%'),
  },
  redText: {
    color: '#EF4444',
    fontWeight: '600',
  },
  promoLabel: {
    fontSize: wp('4.5%'),
    fontWeight: '800',
    marginBottom: hp('1%'),
    color: '#1E293B',
    letterSpacing: -0.3,
  },
  inputWrapper: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: wp('3%'),
    overflow: 'hidden',
    alignItems: 'center',
    shadowColor: '#6B7280',
    shadowOpacity: 0.1,
    shadowRadius: wp('2%'),
    shadowOffset: { width: 0, height: hp('0.3%') },
  },
  promoInput: {
    flex: 1,
    paddingVertical: hp('2%'),
    paddingHorizontal: wp('4%'),
    fontSize: wp('4%'),
    backgroundColor: '#FFFFFF',
    color: '#374151',
  },
  applyButton: {
    backgroundColor: '#FD501E',
    paddingHorizontal: wp('5%'),
    justifyContent: 'center',
    alignItems: 'center',

    height: Platform.OS === 'android' ? hp('6.5%') : hp('6%'),
    borderTopRightRadius: wp('3%'),
    borderBottomRightRadius: wp('3%'),
  },
  applyText: {
    color: '#FFFFFF',
    fontSize: wp('4%'),
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  input: {
    ...(Platform.OS === 'android' ? {} : {
      borderWidth: 1,
      borderColor: '#E5E7EB',
    }),
    borderRadius: wp('3%'),
    padding: wp('3%'),
    fontSize: wp('4%'),
    backgroundColor: '#FFFFFF',
    marginBottom: hp('1%'),
    paddingVertical: hp('1.5%'),
    marginHorizontal: wp('2%'),
    color: '#374151',
    shadowColor: '#6B7280',
    shadowOpacity: 0.1,
    shadowRadius: wp('2%'),
    shadowOffset: { width: 0, height: hp('0.3%') },
    elevation: 3,
  },
  errorInput: {
    borderColor: '#EF4444',
    borderWidth: 2,
    shadowColor: '#EF4444',
    shadowOpacity: 0.2,
  },
  rowButton: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: hp('2%'),
    paddingHorizontal: wp('2%'),
  },
  BackButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: hp('2%'),
    borderRadius: wp('4%'),
    alignItems: 'center',
    marginTop: hp('1%'),
    width: '45%',
    marginBottom: hp('2%'),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    shadowColor: '#FFFFFF',
    shadowOpacity: 0.1,
    shadowRadius: wp('2%'),
    shadowOffset: { width: 0, height: hp('0.3%') },
    elevation: 4,
  },
  BackButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: wp('4%'),
    letterSpacing: 0.5,
  },
  ActionButton: {
    backgroundColor: '#FD501E',
    paddingVertical: hp('2%'),
    borderRadius: wp('4%'),
    alignItems: 'center',
    marginTop: hp('1%'),
    width: '45%',
    marginBottom: hp('4%'),
    shadowColor: '#FD501E',
    shadowOpacity: 0.4,
    shadowRadius: wp('3%'),
    shadowOffset: { width: 0, height: hp('0.5%') },
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: wp('4.5%'),
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowRadius: 1,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: wp('2%'),
    padding: wp('2%'),
    backgroundColor: '#FFFFFF',
    marginBottom: hp('1%'),
    color: '#374151',
    fontSize: wp('4%'),
  },
  disabledInput: {
    backgroundColor: '#F9FAFB',
    color: '#6B7280',
  },
});
export default CustomerInfo;
