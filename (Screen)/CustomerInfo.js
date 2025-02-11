import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, FlatList } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import LoGo from './../(component)/Logo';
import Step from './../(component)/Step';
import Textinput from '../(component)/Textinput';
import ipAddress from '../ipconfig';
import AntDesign from '@expo/vector-icons/AntDesign';

const titleOptions = ['Mr.', 'Mrs.', 'Ms.'];

const  CustomerInfo =({ route }) => {
  const {timeTableDepartId,departDateTimeTable} = route.params;
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
  console.log(timeTableDepartId);
  console.log(departDateTimeTable);

  const toggleModal = () => setModalVisible(!isModalVisible);
  const toggleTeleModal = () => setIsTeleModalVisible(!isTeleModalVisible);

  const handleSelectTitle = (title) => {
    setSelectedTitle(title);
    toggleModal();
  };
  const handleSelectTele = (item) => {
    const selectedValue =  `${item.sys_countries_nameeng} (+${item.sys_countries_telephone})`;
    setSelectedTele(selectedValue);
    toggleTeleModal();
  };

  const filteredTelePhones = telePhone.filter((item) => {
    const searchText = `${item.sys_countries_nameeng} (+${item.sys_countries_telephone})`.toLowerCase();
    return searchText.includes(searchQuery.toLowerCase());
  });

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
      <LoGo />
      <Step logoUri={2} />
      <Text style={styles.title}>Customer Information</Text>

      <View style={styles.promo}>
        <Text style={styles.TextInput}>Passenger Details</Text>

        {/* คำนำหน้า */}
        <Text style={styles.textHead}>Title</Text>
        <TouchableOpacity style={styles.button} onPress={toggleModal}>
          <Text style={styles.buttonText}>{selectedTitle}</Text>
          <Icon name="chevron-down" size={18} color="#A1A1A1" style={styles.icon} />
        </TouchableOpacity>

        {/* Modal เลือกคำนำหน้า */}
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
        <Textinput placeholder="First Name" value={Firstname} onChangeText={setFirstname} />
        <Text style={styles.textHead}>Last Name</Text>
        <Textinput placeholder="Last Name" value={Lastname} onChangeText={setLastname} />

        {/* รายละเอียดการติดต่อ */}
        <Text style={styles.TextInput}>Contact Details</Text>
        <Text style={styles.textHead}>Phone number</Text>
        <TouchableOpacity style={[styles.button, { width: "80%" }]} onPress={toggleTeleModal}>
          <Text style={styles.buttonText}>{selectedTele}</Text>
          <Icon name="chevron-down" size={18} color="#A1A1A1" style={styles.icon} />
        </TouchableOpacity>

        {/* Modal เลือกรหัสประเทศ */}
        <Modal visible={isTeleModalVisible} transparent animationType="fade" onRequestClose={toggleTeleModal}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              {/* ช่องค้นหาเบอร์โทรศัพท์ */}
              <Textinput
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
        <Textinput 
          placeholder={"Enter your mobile number"}
         value={mobileNumber}
         onChangeText={setmobileNumber}
        />
      <Text style={styles.title}>Where should we send your bokking confirmation?</Text>
      <Text style={styles.textHead}>Email</Text>
      <Textinput
        placeholder="Enter Your Email"
        value={email}
        onChangeText={setemail}
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
        <Text>Departure Data : </Text>
        <Text>Departure Time : </Text>
        <Text>Adult x </Text>
      </View>
    ))}
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
    width: '50%',
    justifyContent: 'space-between',
    margin:10
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
    height: 2, // ความหนาของเส้น
    width: '100%', // ทำให้ยาวเต็มจอ
    backgroundColor: '#CCCCCC', // สีของเส้น
    marginVertical: 10, // ระยะห่างระหว่าง element
  },
});
export default CustomerInfo;
