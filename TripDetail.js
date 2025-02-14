import React, { useRef, useState, useEffect } from 'react';
import ipAddress from './ipconfig';
import Icon from 'react-native-vector-icons/Ionicons';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, Modal, FlatList, ImageBackground } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { MaterialIcons } from '@expo/vector-icons';
import LogoTheTrago from './(component)/Logo';
import Step from './(component)/Step';
import BackNextButton from './(component)/BackNextButton';
import moment from 'moment';

const TripDetail = ({ navigation, route }) => {
  const {timeTableDepartId, departDateTimeTable, startingPointId, startingPointName, endPointId, endPointName, timeTablecCmpanyId, timeTablecPierStartId, timeTablecPierEndId, adults, children}=route.params;
 
  const [tripType, setTripType] = useState("One Way Trip");
  const [totalAdult, setTotalAdult] = useState("0.00"); 
  const [totalChild, setTotalChild] = useState("0.00"); 
  const [subtotal, setSubtotal] = useState("0.00");
  const [discount, setDiscount] = useState("0.00");

  const [hour, setHour] = useState("HH");
  const [minutes, setMinutes] = useState("MM");

    const [timetableDepart, settimetableDepart] = useState([]); 
    const [pickup, setPickup] = useState(false);
    const [dropoff, setDropoff] = useState(false);
    const [selectedTranSportPickup, setSelectedTranSportPickup] = useState('');
    const [selectedPickup, setSelectedPickup] = useState('');
    const [TranSportPickup, setTranSportPickup] = useState([]);
    const [selectedTranSportDropoff, setSelectedTranSportDropoff] = useState('');
    const [selectedDropoff, setSelectedDropoff] = useState('');
    const [TranSportDropoff, setTranSportDropoff] = useState([]);
    const [pickupArea, setPickupArea] = useState([]);
    const [DropoffArea, setDropoffArea] = useState([]);
    const [airPortPickup, setAirPortPickup] = useState('');
    const [airPortDropoff, setAirPortDropoff] = useState('');
    const [isHourModalVisible, setisHourModalVisible] = useState(false);
    const [isMinuteModalVisible, setisMinuteModalVisible] = useState(false);


 console.log(timeTablecCmpanyId);
 console.log(timeTablecPierStartId);
 console.log(timeTablecPierEndId);
 console.log(departDateTimeTable);
 console.log(adults);



  function formatNumber(value) {
    return parseFloat(value).toFixed(2);
  }

 
  const toggleHourtModal = () => {
    setisHourModalVisible(!isHourModalVisible);
  };

  const handleHourSelect = (value) => {
    setHour(value);
    toggleHourtModal();
  };

  const renderHourOption = ({ item }) => (
    <TouchableOpacity
      style={styles.modalOption}
      onPress={() => handleHourSelect(item)}
    >
      <Text style={styles.modalOptionText}>{item}</Text>
    </TouchableOpacity>
  );

  const HourOption = ['HH', ...Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'))];

  const toggleMinuteModal = () => {
    setisMinuteModalVisible(!isMinuteModalVisible);
  };

  const handleMinuteSelect = (value) => {
    setMinutes(value);
    toggleMinuteModal();
  };

  const renderMinuteOption = ({ item }) => (
    <TouchableOpacity
      style={styles.modalOption}
      onPress={() => handleMinuteSelect(item)}
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
    const discountedPrice = price * 0.9; // ลด 10%
    return discountedPrice.toFixed(2); // ปัดเศษทศนิยม 2 ตำแหน่ง
  };

  function formatNumberWithComma(value) {
    if (!value) return "0.00";
    const formattedValue = Number(value).toLocaleString("en-US", { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  
    console.log("Formatted Value:", formattedValue); // 🛠 Debugging
    return formattedValue;
  }
  
  
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
    if (timetableDepart.length > 0) {
      const adultPrice = timetableDepart[0].md_timetable_saleadult * adults;
      const childPrice = timetableDepart[0].md_timetable_salechild * children;
  
      setTotalAdult(formatNumberWithComma(adultPrice));
      setTotalChild(formatNumberWithComma(childPrice));
      setSubtotal(formatNumberWithComma(calculateDiscountedPrice(adultPrice+ childPrice))); 
      setDiscount(formatNumberWithComma((adultPrice+childPrice)-(calculateDiscountedPrice(adultPrice+ childPrice))));
    }
  }, [timetableDepart, adults, children]);

  useEffect(() => {
    fetch(`http://${ipAddress}:5000/pickup/${timeTablecCmpanyId}/${timeTablecPierStartId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        if (data && Array.isArray(data.data)) {
          setTranSportPickup(data.data);
        } else {
          console.error('Data is not an array', data);
          setTranSportPickup([]);
        }
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }, [timeTablecCmpanyId, timeTablecPierStartId]);

  useEffect(() => {
    fetch(`http://${ipAddress}:5000/pickup/${timeTablecCmpanyId}/${timeTablecPierStartId}/${selectedTranSportPickup}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        if (data && Array.isArray(data.data)) {
          setPickupArea(data.data);
        } else {
          console.error('Data is not an array', data);
          setPickupArea([]);
        }
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }, [timeTablecCmpanyId, timeTablecPierStartId, selectedTranSportPickup]);

  useEffect(() => {
    fetch(`http://${ipAddress}:5000/dropoff/${timeTablecCmpanyId}/${timeTablecPierEndId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        if (data && Array.isArray(data.data)) {
          setTranSportDropoff(data.data);
        } else {
          console.error('Data is not an array', data);
          setTranSportDropoff([]);
        }
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }, [timeTablecCmpanyId, timeTablecPierStartId]);

  useEffect(() => {
    fetch(`http://${ipAddress}:5000/dropoff/${timeTablecCmpanyId}/${timeTablecPierEndId}/${selectedTranSportDropoff}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        if (data && Array.isArray(data.data)) {
          setDropoffArea(data.data);
        } else {
          console.error('Data is not an array', data);
          setDropoffArea([]);
        }
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }, [timeTablecCmpanyId, timeTablecPierEndId, selectedTranSportDropoff]);



  return (
    <ScrollView contentContainerStyle={styles.container}>
       <ImageBackground 
                source={{ uri: 'https://www.thetrago.com/assets/images/bg/Aliments.png' }}
                style={styles.background}>
        <LogoTheTrago/>
        <Step logoUri={1}/>
      <Text style={styles.title}>Shuttle Transfer</Text>


      
       {timetableDepart.map((item, index) => (
        <View key={index} style={styles.cardContainer}>
          <ImageBackground 
                    source={{ uri: 'https://www.thetrago.com/assets/images/bg/ticketmap.webp' }}
                    style={styles.background}>
        <View style={styles.headerRow}>
        <Image source={require('./assets/image.png')}
        style = {styles.ImageLogo}/>
        <View style={styles.coltitle}>
        <Text style={styles.titlehead}>{item.md_company_nameeng}</Text>
        <Text style={styles.timetable}>{formatTimeToHoursAndMinutes(item.md_timetable_time)}</Text>
        </View>
        <View style={styles.tagContainer}>
          <Text style={styles.tag}>{item.md_seat_nameeng}</Text>
          <Text style={styles.tag}>{tripType}</Text>
        </View>
      </View>

      {/* Trip Details */}
      <View style={styles.tripInfo}>
        <View style={styles.col}>
        <Text style={styles.time}>{formatTime(item.md_timetable_departuretime)}</Text>
        <Text style={styles.date}>{formatDate(departDateTimeTable)}</Text>
        </View>
        <View style={styles.col}>
        <View style={styles.circle}/>
        <Image source={require('./assets/Line 14.png')}
        style = {styles.line}
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
        <Image source={require('./assets/boat.png')}
        style={styles.boat}/>
         <Image source={require('./assets/Line 14.png')}
          style = {styles.line}/>
        </View>
        <View style={styles.col}>
        <Text style={styles.ship}>{formatTimeToHoursAndMinutes(item.md_timetable_time)}</Text>
        <Text style={styles.orangetext}>{item.md_boattype_nameeng}</Text>
        </View>
      </View>
      <View style={styles.tripInfo}>
        <View style={styles.col}>
        <Text style={styles.time}>{formatTime(item.md_timetable_arrivaltime)}</Text>
        <Text style={styles.date}>{formatDate(departDateTimeTable)}</Text>
        </View>
        <View style={styles.col}>
        <Image source={require('./assets/location_on.png')}/>
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
                    <View style={styles.inputBoxArrive}>
                    <TouchableOpacity style={styles.button} onPress={toggleHourtModal}>
                  <Text style={styles.ArriveText}>{hour}</Text>
                  <Icon name="chevron-down" size={20} color="#FD501E" style={styles.dropdownIcon} />
                </TouchableOpacity>
          
                {/* Adult Modal */}
                <Modal
                  visible={isHourModalVisible}
                  transparent={true}
                  animationType="fade"
                  onRequestClose={toggleHourtModal}
                >
                  <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                      <FlatList
                        data={HourOption}
                        renderItem={renderHourOption}
                        keyExtractor={(item) => item.toString()}
                      />
                    </View>
                  </View>
                </Modal>
                <TouchableOpacity style={styles.button} onPress={toggleMinuteModal}>
                <Text style={styles.ArriveText}>{minutes} </Text>
                <Icon name="chevron-down" size={20} color="#FD501E" style={styles.dropdownIcon} />
              </TouchableOpacity>
          
              {/* Child Modal */}
              <Modal
                visible={isMinuteModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={toggleMinuteModal}
              >
                <View style={styles.modalOverlay}>
                  <View style={styles.modalContent}>
                    <FlatList
                      data={minuteOption}
                      renderItem={renderMinuteOption}
                      keyExtractor={(item) => item.toString()}
                    />
                  </View>
                </View>
              </Modal>
                    </View>
                  </View>
            </>

      )}

      {/* Pickup Section */}
      {Array.isArray(TranSportPickup) && TranSportPickup.length > 0 ? (
      <View style={styles.section}>
        <TouchableOpacity onPress={() => setPickup(!pickup)} style={styles.checkboxContainer}>
          <MaterialIcons name={pickup ? "check-box" : "check-box-outline-blank"} size={24} color="#FD501E" />
          <Text style={styles.label}>I need a pick up</Text>
        </TouchableOpacity>

        {pickup && (
          <View>
            <Text style={styles.inputLabel}>Transport type</Text>
            <View style={styles.pickerContainer}>
            <Picker selectedValue={selectedTranSportPickup}
             onValueChange={(itemValue) => setSelectedTranSportPickup(itemValue)}
             >
            <Picker.Item label="Select Transport Type" value="0"
            style={styles.pickup} />
             {TranSportPickup.map((item, index) => (
            <Picker.Item key={index} label={item.md_cartype_nameeng} value={item.md_pickup_cartypeid} />
        ))}
      </Picker>
            </View>

            <Text style={styles.inputLabel}>Pick up area</Text>
            <View style={styles.pickerContainer}>
  <Picker
    selectedValue={selectedPickup}
    onValueChange={(itemValue) => {
      setSelectedPickup(itemValue);

      // ค้นหาข้อมูลของ Pickup ที่ถูกเลือก
      const selectedItem = pickupArea.find((item) => item.md_pickup_id === itemValue);
      
      // ถ้าพบค่าให้เซ็ตค่า airPort
      if (selectedItem) {
        setAirPortPickup(selectedItem.md_transfer_airport);
      }
    }}
  >
    <Picker.Item label="Please Select" value="0" style={styles.pickup} key="default" />
    {pickupArea.map((item) => (
      <Picker.Item
        key={item.md_pickup_id}
        label={item.md_transfer_nameeng}
        value={item.md_pickup_id}
      />
    ))}
  </Picker>
  
</View>
{airPortPickup === 1 && (

  <>
  <Text style={styles.inputLabel}>Filght Number</Text>
  <TextInput style={styles.input} />
  <Text style={styles.inputLabel}>Arrive Time</Text>
  <View style={styles.inputRow}>
          <View style={styles.inputBoxArrive}>
          <TouchableOpacity style={styles.button} onPress={toggleHourtModal}>
        <Text style={styles.ArriveText}>{hour}</Text>
        <Icon name="chevron-down" size={20} color="#FD501E" style={styles.dropdownIcon} />
      </TouchableOpacity>

      {/* Adult Modal */}
      <Modal
        visible={isHourModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={toggleHourtModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <FlatList
              data={HourOption}
              renderItem={renderHourOption}
              keyExtractor={(item) => item.toString()}
            />
          </View>
        </View>
      </Modal>
      <TouchableOpacity style={styles.button} onPress={toggleMinuteModal}>
      <Text style={styles.ArriveText}>{minutes} </Text>
      <Icon name="chevron-down" size={20} color="#FD501E" style={styles.dropdownIcon} />
    </TouchableOpacity>

    {/* Child Modal */}
    <Modal
      visible={isMinuteModalVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={toggleMinuteModal}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <FlatList
            data={minuteOption}
            renderItem={renderMinuteOption}
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
            <TextInput style={styles.input} placeholder="Input Hotel / Pick up point" />
          </View>
        )}
      </View>
      ) : (
        <Text></Text>
      )}

  

      {/* Dropoff Section */}
      {Array.isArray(TranSportDropoff) && TranSportDropoff.length > 0 ? (
      <View style={styles.section}>
        <TouchableOpacity onPress={() => setDropoff(!dropoff)} style={styles.checkboxContainer}>
          <MaterialIcons name={dropoff ? "check-box" : "check-box-outline-blank"} size={24} color="#FD501E" />
          <Text style={styles.label}>I need a drop off</Text>
        </TouchableOpacity>

        {dropoff && (
          <View>
            <Text style={styles.inputLabel}>Transport type</Text>
            <View style={styles.pickerContainer}>
            <Picker selectedValue={selectedTranSportDropoff}
             onValueChange={(itemValue) => setSelectedTranSportDropoff(itemValue)}
             >
            <Picker.Item label="Select Transport Type" value="0"
            style={styles.pickup} />
             {TranSportDropoff.map((item, index) => (
            <Picker.Item key={index}  label={item.md_cartype_nameeng} value={item.md_dropoff_cartypeid} />
        ))}
      </Picker>
            </View>

            <Text style={styles.inputLabel}>Drop off area</Text>
            <View style={styles.pickerContainer}>
  <Picker
    selectedValue={selectedDropoff}
    onValueChange={(itemValue) => {
      setSelectedDropoff(itemValue);

      // ค้นหาข้อมูลของ Pickup ที่ถูกเลือก
      const selectedItem = DropoffArea.find((item) => item.md_dropoff_id === itemValue);
      
      // ถ้าพบค่าให้เซ็ตค่า airPort
      if (selectedItem) {
        setAirPortDropoff(selectedItem.md_transfer_airport);
      }
    }}
  >
    <Picker.Item label="Please Select" value="0" style={styles.pickup} />

    {DropoffArea.map((item, index) => (
  <Picker.Item 
    key={index}
    label={item.md_transfer_nameeng}
    value={item.md_dropoff_id}
  />
))}

 
  </Picker>
  
</View>
{airPortDropoff === 1 && (

  <>
  <Text style={styles.inputLabel}>Filght Number</Text>
  <TextInput style={styles.input} />
  <Text style={styles.inputLabel}>Arrive Time</Text>
  <View style={styles.inputRow}>
          <View style={styles.inputBoxArrive}>
          <TouchableOpacity style={styles.button} onPress={toggleHourtModal}>
        <Text style={styles.ArriveText}>{hour}</Text>
        <Icon name="chevron-down" size={20} color="#FD501E" style={styles.dropdownIcon} />
      </TouchableOpacity>

      {/* Adult Modal */}
      <Modal
        visible={isHourModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={toggleHourtModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <FlatList
              data={HourOption}
              renderItem={renderHourOption}
              keyExtractor={(item) => item.toString()}
            />
          </View>
        </View>
      </Modal>
      <TouchableOpacity style={styles.button} onPress={toggleMinuteModal}>
      <Text style={styles.ArriveText}>{minutes} </Text>
      <Icon name="chevron-down" size={20} color="#FD501E" style={styles.dropdownIcon} />
    </TouchableOpacity>

    {/* Child Modal */}
    <Modal
      visible={isMinuteModalVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={toggleMinuteModal}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <FlatList
            data={minuteOption}
            renderItem={renderMinuteOption}
            keyExtractor={(item) => item.toString()}
          />
        </View>
      </View>
    </Modal>
          </View>
        </View>
  </>
      
   )}

           

            <Text style={styles.inputLabel}>Hotel / Drop off point</Text>
            <TextInput style={styles.input} placeholder="Input Hotel / Drop off point" />
          </View>
        )}
      </View>
      ) : (
        <Text></Text>
      )}

  
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
                </ImageBackground>
    </View>
    ))}
       
    
      {timetableDepart.map((item) => (
      <View key={item.md_timetable_id} style={styles.promo }>
        
        <Text style={styles.TextInput}>
          Booking Summary
        </Text>

        <View style={styles.divider} />
        <Text style={styles.margin}>
          Depart
        </Text>
        <View style={styles.rowpromo}>
        <Text>
          Adult x {adults}
        </Text>
        <Text>฿ {totalAdult} </Text>
        </View>
        {children !== 0 && (
        <View style={styles.rowpromo}>
        <Text>
          Child x {children}
        </Text>
        <Text>฿ {totalChild} </Text>
        </View>
        )}
        <View style={styles.rowpromo}>
        <Text>
          Discount 
        </Text>
        <Text style={styles.redText}>
  -฿ {discount}
</Text>

        </View>
        <View style={styles.rowpromo}>
        <Text>
          Subtotal 
        </Text>
        <Text>฿ {subtotal} </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.rowpromo}>
        <Text style={styles.totaltext}>Total</Text>
        <Text style={styles.totaltext}>฿ {subtotal}</Text>
        </View>
      </View>
      
      ))}
     <BackNextButton navigation={navigation} Navi="CustomerInfo" params={{
      timeTableDepartId:timeTableDepartId , 
      departDateTimeTable:departDateTimeTable,
      adults:adults,
      children:children,
      totalAdult:totalAdult,
      totalChild:totalChild}} />  
    </ImageBackground>
    </ScrollView>

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
        inputBoxArrive: {
          flexDirection: 'row',
          backgroundColor: '#FFF',
          padding: 5,
          borderRadius: 10,
          borderWidth:1,
          borderColor:'#D1D1D1', 
         
          flex: 1,
         justifyContent:  'space-between',
        },
        rowdepart:{
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
        redText:{
          color:'red'
        },
        margin:{
          marginTop:5,
          marginBottom:5,
          fontSize:16
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
        ArriveText: {
          fontSize: 16,
          color: '#333',
          marginRight: 65,
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
           marginLeft:-3,
           marginRight:-3,
           shadowColor: '#000',
           shadowOpacity: 0.1,
           shadowRadius: 8,
           shadowOffset: { width: 0, height: 4 },
           elevation: 4,
          },
          promo: {
            backgroundColor: 'white',
            borderRadius: 20,
            width:'100%',
           padding: 16, 
           margin: 16,
           marginLeft:-3,
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

       
        
  ImageLogo: {
    marginRight: 10
  },

  tagContainer: { 
    flexDirection: 'row',
     marginTop: 5 
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
    marginLeft: 3, },
  tripInfo: { 
    alignItems: 'flex-start',
     marginBottom: 0, 
     justifyContent:'center',
     flexDirection:'row' 
    },
  date: { 
    fontSize: 12, 
    color: '#666'
   },
  section: { 
    marginBottom: 20 
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
    backgroundColor:'white' 
  },
  input: { 
    borderWidth: 1, 
    borderColor: '#ddd', 
    padding: 10, 
    borderRadius: 15, 
    marginTop: 5 
  },
  timetable: {
    fontSize:12,
  },
  col: {
    flexDirection:'column',
    margin:10,
    width:100,
    alignItems:'center'
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
  line : {
    alignItems: 'center',
    margin:10,
    marginTop:30,
    marginBottom:0
  },
  orangetext: {
    color:'#FD501E'
  },
  titlehead:{
    fontSize:16,
    fontWeight:'bold',
    flexWrap:'wrap',
    width:100
  },
  TextInput:{
    fontSize:18,
    fontWeight:'bold'
    ,margin:5
  },
  totaltext:{
    fontSize:18,
    fontWeight:'bold'
  },
  rowpromo:{
    flexDirection:'row',
    justifyContent:'space-between',
  },
  pricetotal:{
    fontSize:16,
  },

  pricperson:{
    fontSize:25
  },
  background: {
    width:'100%',
  },
  divider: {
    height: 2, // ความหนาของเส้น
    width: '100%', // ทำให้ยาวเต็มจอ
    backgroundColor: '#CCCCCC', // สีของเส้น
    marginVertical: 10, // ระยะห่างระหว่าง element
  },
});
      
      export default TripDetail;
