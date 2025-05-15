import React, { useEffect, useState } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Modal, FlatList, Platform, KeyboardAvoidingView, SafeAreaView, StatusBar } from 'react-native';
import { Entypo } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import ipAddress from "../ipconfig";
import Icon from 'react-native-vector-icons/FontAwesome';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useCustomer } from './CustomerContext.js';


const ProfileScreen = ({ navigation }) => {
  const { customerData, updateCustomerData } = useCustomer();
  const [Firstname, setFirstname] = useState('');
  const [Lastname, setLastname] = useState('');
  const [tel, setTel] = useState('');
  const [email, setEmail] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [searchQueryCountry, setSearchQueryCountry] = useState('');
  const [isCountryModalVisible, setIsCountryModalVisible] = useState(false);
  const [isTeleModalVisible, setIsTeleModalVisible] = useState(false);
  const [telePhone, setTelePhone] = useState([]);
  const [countrycode, setCountrycode] = useState('');
  const [errors, setErrors] = useState({});

  const [selectedTele, setSelectedTele] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [countryId, setCountryId] = useState('');
  const [birthdate, setBirthdate] = useState(null);
  const [showPicker, setShowPicker] = useState(false);
  const [countryName, setCountryName] = useState('');




  const formatDate = (dateString) => {
    if (!dateString || isNaN(new Date(dateString))) {
      return 'Select your birthday'; // หรือ 'N/A', หรือไม่ต้องแสดงเลย
    }

    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date);
  };



  const handleConfirm = (event, selectedDate) => {
    setShowPicker(false);
    if (selectedDate) {
      const formatted = selectedDate.toISOString().split('T')[0]; // YYYY-MM-DD
      setBirthdate(formatted);
    }
  };


  useEffect(() => {

    const fetchData = async () => {
      const storedToken = await SecureStore.getItemAsync('userToken');
      try {
        const response = await fetch(`${ipAddress}/profile`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${storedToken}`, // ส่ง Token ใน Authorization header
            'Content-Type': 'application/json', // ระบุประเภทของข้อมูลที่ส่ง (ถ้าจำเป็น)
          },
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();

        if (data && Array.isArray(data.data)) {
          setFirstname(data.data[0].md_member_fname);
          setLastname(data.data[0].md_member_lname);
          setTel(data.data[0].md_member_phone);
          setEmail(data.data[0].md_member_email);
          if (data.data[0].md_member_code) {
            getCountryByCode(data.data[0].md_member_code);
<<<<<<< HEAD
            setCountrycode(data.data[0].md_member_code);
=======
>>>>>>> 880b1d14123c4238ea4001e93867da943b84a705
          } else {
            setSelectedTele('Please Select');
          }
          if (data.data[0].md_member_nationality) {
            getCountryByid(data.data[0].md_member_nationality);
<<<<<<< HEAD
            setCountryId(data.data[0].md_member_nationality);
=======
>>>>>>> 880b1d14123c4238ea4001e93867da943b84a705
          } else {
            setSelectedCountry('Please Select');
          }
          if (data.data[0].md_member_birthday) {
            setBirthdate(data.data[0].md_member_birthday);
          } else {
            setBirthdate('Select your birthday');
          }

          updateCustomerData ({
            Firstname : data.data[0].md_member_fname,
            Lastname : data.data[0].md_member_lname,
            tel : data.data[0].md_member_phone,
            email : data.data[0].md_member_email,
            birthdate : data.data[0].md_member_birthday,
            country : data.data[0].md_member_nationality ,
            selectcoountrycode : data.data[0].md_member_code
          });

        } else {
          console.error('Data is not an array', data);
          setUser([]);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);  // ตั้งค่า loading เป็น false หลังจากทำงานเสร็จ
      }
    };

    fetchData();


  }, []);

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
        console.log('Country data:', json.data);
        setSelectedTele(`(+${json.data[0].sys_countries_telephone}) ${json.data[0].sys_countries_nameeng}`);
<<<<<<< HEAD
        setCountrycode(json.data[0].sys_countries_telephone);
=======
>>>>>>> 880b1d14123c4238ea4001e93867da943b84a705
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

  const getCountryByid = async (id) => {
    try {
      const response = await fetch(`${ipAddress}/membercountryname`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ countryid: id }),
      });

      const json = await response.json();

      if (response.ok) {
        console.log('Country data:', json.data);
        setSelectedCountry(`${json.data[0].sys_countries_nameeng}`);
<<<<<<< HEAD
        setCountryId(json.data[0].sys_countries_id);
=======
>>>>>>> 880b1d14123c4238ea4001e93867da943b84a705
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



  const toggleTeleModal = () => setIsTeleModalVisible(!isTeleModalVisible);
  const toggleCountryModal = () => setIsCountryModalVisible(!isCountryModalVisible);

  const handleSelectTele = (item) => {
    const selectedValue =
      item.sys_countries_nameeng === 'Please Select'
        ? 'Please Select'
        : `(+${item.sys_countries_telephone}) ${item.sys_countries_nameeng}`; // แสดงแค่ชื่อประเทศ

    setSelectedTele(selectedValue);
    setCountryName(item.sys_countries_nameeng);
    let country_code = item.sys_countries_telephone;
    setCountrycode(country_code); // ใช้ตอนส่งออก
    setErrors((prev) => ({ ...prev, selectedTele: false }));
    toggleTeleModal();
  };

  const handleSelectCountry = (item) => {
    const selectedValue =
      item.sys_countries_nameeng === 'Please Select'
        ? 'Please Select'
        : `${item.sys_countries_nameeng}`; // แสดงแค่ชื่อประเทศ

    setSelectedCountry(selectedValue);
    let country_id = item.sys_countries_id;
    setCountryId(country_id);
    //  setCountryName(item.sys_countries_nameeng); // ใช้ตอนส่งออก
    setErrors((prev) => ({ ...prev, selectedCountry: false }));
    toggleCountryModal();
  };



  const filteredTelePhones = telePhone.filter((item) => {
    const searchText = `(+${item.sys_countries_telephone}) ${item.sys_countries_nameeng}`.toLowerCase();
    return searchText.includes(searchQuery.toLowerCase());
  });


  const filteredCountry = telePhone.filter((item) => {
    const searchText = `${item.sys_countries_nameeng}`.toLowerCase();
    return searchText.includes(searchQueryCountry.toLowerCase());
  });

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

  const handleSave = async () => {
    try {
      const token = await SecureStore.getItemAsync('userToken');

      if (!token) {
        alert("User token not found");
        return;
      }

      const response = await fetch(`${ipAddress}/update-profile`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fname: Firstname,
          lname: Lastname,
          phone: tel,
          code: countrycode,
          birthday: birthdate,
          nationality: countryId,
        }),
      });

      const json = await response.json();

      if (json.status === 'success') {
        alert("✅ Profile updated successfully");

        // รวมอัปเดตไว้ใน object เดียว
        updateCustomerData({
          Firstname: Firstname,
          Lastname: Lastname,
          tel: tel,
          selectcoountrycode: `(+${countrycode}) ${countryName}` || 'Please Select',
          birthdate: birthdate,
          country: countryName || 'Please Select',
        });

      } else {
        alert("❌ Update failed: " + json.message);
      }

    } catch (error) {
      console.error("handleSave error:", error);
      alert("⚠️ Error occurred while updating profile");
    }
  };



  const isEmailVerified = !!customerData.email;

  const isProfileVerified =
    customerData.Firstname &&
    customerData.Lastname &&
    customerData.tel &&
    customerData.email &&
    customerData.birthdate &&
    customerData.country &&
    customerData.selectcoountrycode;

  // สมมุติยังไม่เชื่อม ID และ Bank Status
  const isIdVerified = false;
  const isBankVerified = false;

  const verifiedCount = [
    isEmailVerified,
    isProfileVerified,
    isIdVerified,
    isBankVerified
  ].filter(Boolean).length;

  const progressPercent = (verifiedCount / 4) * 100;


  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.container}>
          {/* Profile Progress */}
          <View style={styles.progressCard}>
            <Text style={styles.title}>Complete Your Profile</Text>
            <View style={styles.progressBarBackground}>
              <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
            </View>

            <Text style={styles.infoText}>
              Get the best out of booking by adding the remaining details!
            </Text>
            <View style={styles.verificationList}>
              <Text style={isEmailVerified ? styles.verified : styles.unverified}>
                <Icon name={isEmailVerified ? "check-circle" : "times-circle"} size={16} color={isEmailVerified ? "green" : "orangered"} /> Verified Email
              </Text>

              <Text style={isProfileVerified ? styles.verified : styles.unverified}>
                <Icon name={isProfileVerified ? "check-circle" : "times-circle"} size={16} color={isProfileVerified ? "green" : "orangered"} /> Verified Profile
              </Text>

              <TouchableOpacity onPress={() => navigation.navigate('IDCardCameraScreen')}>
                <Text style={isIdVerified ? styles.verified : styles.unverified}>
                  <Icon name={isIdVerified ? "check-circle" : "times-circle"} size={16} color={isIdVerified ? "green" : "orangered"} />
                  Verified ID Card/Passport
                </Text>
              </TouchableOpacity>

              <Text style={isBankVerified ? styles.verified : styles.unverified}>
                <Icon name={isBankVerified ? "check-circle" : "times-circle"} size={16} color={isBankVerified ? "green" : "orangered"} /> Verified Bank Account
              </Text>
            </View>

          </View>

          {/* Personal Information Form */}
          <View style={styles.formCard}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            <TextInput style={styles.input} placeholder="First Name" value={Firstname} />
            <TextInput style={styles.input} placeholder="Last Name" value={Lastname} />
            <TouchableOpacity
              style={[styles.button, errors.selectedTele && styles.errorInput]}
              onPress={toggleTeleModal}>
              <Text style={{ color: 'black' }}>{selectedTele}</Text>
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
              style={styles.input}
              placeholder="Phone"
              value={tel}
              onChangeText={setTel}
              keyboardType="numeric"
            />

            <TextInput style={[styles.input, styles.disabled]} placeholder="Email" value={email} editable={false} />
            <TouchableOpacity
              style={[styles.button, errors.selectedTele && styles.errorInput]}
              onPress={toggleCountryModal}>
              <Text style={{ color: 'black' }}>{selectedCountry}</Text>
              <Icon name="chevron-down" size={18} color="#FD501E" style={styles.icon} />
            </TouchableOpacity>

            {/* Modal for selecting telephone */}
            <Modal visible={isCountryModalVisible} transparent animationType="fade" onRequestClose={toggleCountryModal}>
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <TextInput
                    placeholder="Search country"
                    value={searchQueryCountry}
                    onChangeText={setSearchQueryCountry}
                    style={styles.textInput}
                  />
                  <FlatList
                    data={filteredCountry}
                    renderItem={({ item }) => (
                      <TouchableOpacity style={styles.optionItem} onPress={() => handleSelectCountry(item)}>
                        <Text style={[styles.optionText, item.sys_countries_nameeng === 'Please Select']}>
                          {item.sys_countries_nameeng === 'Please Select'
                            ? 'Please Select'
                            : `${item.sys_countries_nameeng}`}
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
            <TouchableOpacity
              style={{
                borderWidth: 1,
                borderColor: '#ccc',
                padding: 12,
                borderRadius: 8,

              }}
              onPress={() => setShowPicker(true)}
            >
              <Text>
                {birthdate ? formatDate(birthdate) : 'Select your birthday'}
              </Text>
            </TouchableOpacity>

            {showPicker && (
              <DateTimePicker
                value={birthdate ? new Date(birthdate) : new Date(2000, 0, 1)}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleConfirm}
                maximumDate={new Date()} // ห้ามเลือกวันอนาคต
                style={{ width: '100%', alignItems: 'center' }} // กำหนดขนาดของ DateTimePicker
              />
            )}
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
          </View>

          {/* Change Password */}
          <View style={styles.formCard}>
            <Text style={styles.sectionTitle}>Change Password</Text>
            <View style={styles.passwordField}>
              <TextInput style={styles.inputFlex} placeholder="Current Password" secureTextEntry />
              <Entypo name="eye-with-line" size={20} color="#aaa" />
            </View>
            <View style={styles.passwordField}>
              <TextInput style={styles.inputFlex} placeholder="New Password" secureTextEntry />
              <Entypo name="eye-with-line" size={20} color="#aaa" />
            </View>
            <View style={styles.passwordField}>
              <TextInput style={styles.inputFlex} placeholder="Confirm Password" secureTextEntry />
              <Entypo name="eye-with-line" size={20} color="#aaa" />
            </View>
            <TouchableOpacity style={styles.saveButton}>
              <Text style={styles.buttonText}>Change Password</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
  },
  progressCard: {
    backgroundColor: '#fff7f1',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 8,
  },
  progressBarBackground: {
    height: 10,
    backgroundColor: '#ddd',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    width: '50%',
    height: '100%',
    backgroundColor: 'mediumseagreen',
  },
  infoText: {
    fontSize: 12,
    color: '#666',
    marginVertical: 8,
  },
  verificationList: {
    gap: 6,
  },
  verified: {
    fontSize: 14,
    color: 'green',
  },
  unverified: {
    fontSize: 14,
    color: 'orangered',
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  sectionTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  disabled: {
    backgroundColor: '#eee',
  },
  saveButton: {
    backgroundColor: '#ff6b1c',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  passwordField: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 12,
  },
  inputFlex: {
    flex: 1,
    paddingVertical: 10,
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
    width: '100%',
    justifyContent: 'space-between',
    marginBottom: 10,

  },
  errorInput: {
    borderColor: 'red', // เปลี่ยนกรอบเป็นสีแดงเมื่อมีข้อผิดพลาด
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
    fontclor: '#333',
  },
  textInput: {
    width: '100%',       // กำหนดความกว้าง
    padding: 10,        // กำหนดช่องว่างภายใน
    borderWidth: 1,     // กำหนดความหนาของขอบ
    borderColor: '#ced4da', // กำหนดสีของขอบ
    borderRadius: 5,    // ปรับมุมขอบให้โค้ง
  },

});

export default ProfileScreen;