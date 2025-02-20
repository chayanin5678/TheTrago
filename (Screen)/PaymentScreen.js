import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, Alert, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import ipAddress from "../ipconfig";
import LogoHeader from "./../(component)/Logo";
import Step from "../(component)/Step";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Entypo from '@expo/vector-icons/Entypo';
import { MaterialIcons } from '@expo/vector-icons';
import AntDesign from '@expo/vector-icons/AntDesign';

const PaymentScreen =({ navigation, route }) => {
  const {timeTableDepartId, departDateTimeTable,adults, totalAdult, totalChild,children,selectedTitle,Firstname,Lastname,selectedTele,mobileNumber,email} = route.params;
  const [Discount, setDiscount] = useState('');
  const [subtotal, setSubtotal] = useState('');
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setcardName] = useState("");
  const [expirationDate, setExpirationDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [selectedOption, setSelectedOption] = useState(null);
  const [pickup, setPickup] = useState(false);
  const [errors, setErrors] = useState({}); // New state for errors
  const month = expirationDate.substring(0, 2);
  const year = expirationDate.substring(3, 7);
   const [timetableDepart, settimetableDepart] = useState([]);
   const [totalPayment, settotalPayment] = useState('');
   
  console.log(year);
  console.log(selectedTitle);
  console.log(Firstname);
  console.log(Lastname);
  console.log(selectedTele);
  console.log(mobileNumber);
  console.log(email);
  const handleChange = (text) => {
    // กำจัดสิ่งที่ไม่ใช่ตัวเลข
    let formattedText = text.replace(/\D/g, "");

    // แทรกเครื่องหมาย / หลังจากกรอกเดือน 2 ตัวแรก
    if (formattedText.length > 2) {
      formattedText = formattedText.slice(0, 2) + "/" + formattedText.slice(2, 6);
    }

    // ตั้งค่า expirationDate ใหม่
    setExpirationDate(formattedText);
  };

  function formatDate(dateString) {
    const date = new Date(Date.parse(dateString)); // Parses "14 Feb 2025" correctly
    return date.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
  }

  function formatTime(timeString) {
    if (!timeString) return ""; // Handle empty input
    return timeString.slice(0, 5); // Extracts "HH:mm"
  }

  function formatTimeToHoursAndMinutes(time) {
    let [hours, minutes] = time.split(':');
    
    // กำจัด 0 ด้านหน้า
    hours = parseInt(hours, 10); 
    minutes = parseInt(minutes, 10);
    
    return `${hours} h ${minutes} min`;
  }

  function formatNumber(value) {
    return parseFloat(value).toFixed(2);
  }

  useEffect(() => {
    setDiscount(formatNumber(calculateDiscountedPrice(parseFloat(totalAdult)+ parseFloat(totalChild))));  
    setSubtotal(formatNumber((parseFloat(totalAdult)+ parseFloat(totalChild))-(Discount)));    
    settotalPayment(formatNumber(parseFloat(subtotal) + parseFloat(calculatePaymentFee(subtotal)))); 
    console.log(subtotal); 
    }, [Discount,subtotal]);
 

  const calculateDiscountedPrice = (price) => {
        
    const discountedPrice = price * 0.10; // ลด 10%
    return discountedPrice.toFixed(2); // ปัดเศษทศนิยม 2 ตำแหน่ง
  };

  const calculatePaymentFee = (price) => {

    const PaymentFee = price * 0.04; // ลด 10%
    return PaymentFee.toFixed(2); // ปัดเศษทศนิยม 2 ตำแหน่ง
  };
 

     
   
  const handlePayment = async () => {
    let newErrors = {};
    if (!cardName) newErrors.cardName = true;
    if (!cardNumber) newErrors.cardNumber = true;
    if (!expirationDate) newErrors.expirationDate = true;
    if (!cvv) newErrors.cvv = true;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      Alert.alert('Please fill in all fields');
      return;
    }

    try {

      const tokenResponse = await fetch(`http://${ipAddress}:5000/create-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          card: {
            name: cardName,
            number: cardNumber,
            expiration_month: month,
            expiration_year: year,
            security_code: cvv,
          },
        }),
      });

      // ตรวจสอบว่า tokenResponse เป็น JSON และแปลงข้อมูลที่ได้รับ
      const tokenData = await tokenResponse.json();  // ใช้ json() แปลงเป็น JSON
      if (!tokenData.success) throw new Error(tokenData.error); // ถ้าไม่สำเร็จให้แสดงข้อผิดพลาด

      // ใช้ Token เพื่อชำระเงิน
      const response = await fetch(`http://${ipAddress}:5000/charge`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: totalPayment, // 100 บาท
          token: tokenData.token,  // tokenData.token ที่ได้รับจาก Backend
        }),
      });

      const result = await response.json();
      if (result.success) {
        Alert.alert("✅ Payment Successful", `Transaction ID: ${result.charge.id}`);
      } else {
        Alert.alert("❌ Payment Failed", result.error);
      }
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  const handleSelection = (option) => {
    setSelectedOption(option);

  };

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


  return (
       <ScrollView contentContainerStyle={styles.container}>
      <LogoHeader />
      <Step logoUri={3} />
      <Text style={styles.header}>Payment</Text>
      <View style={styles.card}>
        <View style={styles.row}>
          <FontAwesome name="credit-card" size={24} color="black" marginRight='10' />
          <Text style={styles.header}>Payment Options</Text>
        </View>

        {/* Radio Button 1 */}
        <View style={styles.radioContian}>
          <TouchableOpacity
            style={styles.optionContainer}
            onPress={() => handleSelection("Option 1")}
          >
            <View
              style={[
                styles.radioButton,
                selectedOption === "Option 1" && styles.selectedRadio,
              ]}
            />
            <View style={styles.logodown}>
              <Text style={styles.labelHead}>Credit and Debit Card</Text>
            </View>
            <Entypo name="chevron-small-down" size={24} color="black" />
          </TouchableOpacity>
          {selectedOption === "Option 1" && (
            <>
              <View style={styles.payment}>
                <Text style={styles.label}>Card Holder Name </Text>
                <TextInput
                  value={cardName}
                  onChangeText={(text) => {
                    setcardName(text);
                    setErrors((prev) => ({ ...prev, cardName: false }));
                  }}
                  placeholder="Cardholder name"
                  style={[styles.input, errors.cardName && styles.errorInput]}
                />
                <Text style={styles.label}>Card Number </Text>
                <TextInput
                  value={cardNumber}
                  onChangeText={(text) => {
                    setCardNumber(text);
                    setErrors((prev) => ({ ...prev, cardNumber: false }));
                  }}
                  placeholder="●●●● ●●●● ●●●● ●●●●"
                  keyboardType="number-pad"
                  style={[styles.input, errors.cardNumber && styles.errorInput]}
                />
                <View style={styles.row}>
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Expiry Date</Text>
                    <TextInput
                      value={expirationDate}
                      onChangeText={(text) => {
                        handleChange(text);
                        setErrors((prev) => ({ ...prev, expirationDate: false }));
                      }}
                      keyboardType="number-pad"
                      placeholder="MM/YY"
                      maxLength={7}  // จำกัดให้กรอกได้สูงสุด 5 ตัวอักษร (เช่น 12/34)
                      style={[styles.input, errors.expirationDate && styles.errorInput]}
                    />

                  </View>


                  <View style={styles.inputContainer}>

                    <Text style={styles.label}>CVV</Text>
                    <TextInput
                      value={cvv}
                      onChangeText={(text) => {
                        setCvv(text);
                        setErrors((prev) => ({ ...prev, cvv: false }));
                      }}
                      keyboardType="number-pad"
                      placeholder="●●●"
                      secureTextEntry
                      style={[styles.input, errors.cvv && styles.errorInput]}
                    />
                  </View>
                </View>
              </View>
            </>
          )}

        </View>
        {/* Radio Button 2 */}
        <View style={styles.radioContian}>
        <TouchableOpacity
          style={styles.optionContainer}
          onPress={() => handleSelection("Option 2")}
        >
          <View
            style={[
              styles.radioButton,
              selectedOption === "Option 2" && styles.selectedRadio,
            ]}
          />
          <View style={styles.logodown}>
          <Text style={styles.labelHead}>PromptPay</Text>
                  </View>
          <Entypo name="chevron-small-down" size={24} color="black" />
   
          
        </TouchableOpacity>
        </View>
        {/* Radio Button 3 */}
        <View style={styles.radioContian}>
        <TouchableOpacity
          style={styles.optionContainer}
          onPress={() => handleSelection("Option 3")}
        >
          <View
            style={[
              styles.radioButton,
              selectedOption === "Option 3" && styles.selectedRadio,
            ]}
          />
          <View style={styles.logodown}>
          <Text style={styles.labelHead}>eWallet</Text>
          </View>
          <Entypo name="chevron-small-down" size={24} color="black" />
        </TouchableOpacity>
      </View>
      <View style={styles.row}>
      <View style={styles.checkboxContainer}>
      <TouchableOpacity onPress={() => setPickup(!pickup)}>
          <MaterialIcons name={pickup ? "check-box" : "check-box-outline-blank"} size={24} color="#FD501E"  style={{ marginRight: 8,marginTop:-5 }} />
        </TouchableOpacity>
        </View>
        <View style={styles.textContainer}>
        <Text style={styles.label}>I understand and agree with th <Text style={styles.textcolor}>Terms of Services</Text> and <Text style={styles.textcolor}>Policy</Text></Text>
        </View>
      </View>
      </View>
      {timetableDepart.map((item, index) => (
      <View key={index} style={styles.card}>
      <Text style={styles.title}>Booking Summary</Text>
        <View style={styles.divider} />
        <Text>Depart</Text>
        <Text>{item.startingpoint_name} <AntDesign name="arrowright" size={14} color="black" /> {item.endpoint_name}</Text>
        <Text>Company : {item.md_company_nameeng}</Text>
        <Text>Seat : {item.md_seat_nameeng}</Text>
        <Text>Boat : {item.md_boattype_nameeng}</Text>
        <Text>Departure Data : {formatDate(departDateTimeTable)}</Text>
        <Text>Departure Time : {formatTime(item.md_timetable_departuretime)} - {formatTime(item.md_timetable_arrivaltime)} | {formatTimeToHoursAndMinutes(item.md_timetable_time)}</Text>
        <View style={styles.row}>
        <Text>Adult x {adults}</Text>
        <Text>฿ {totalAdult}</Text>
        </View>
        {parseFloat(totalChild) !== 0 && (
  <View style={styles.row}>
    <Text>Child x {children}</Text>
    <Text>฿ {totalChild}</Text>
  </View>
)}
        <View style={styles.row}>
        <Text>Discount</Text>
        <Text style={styles.redText}>- ฿  {Discount}</Text>
        </View>
        <View style={styles.row}>
        <Text>Ticket fare</Text>
        <Text>฿ {subtotal}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.row}>
        <Text>Subtotal </Text>
        <Text>฿ {subtotal}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.row}>
        <Text>Payment Fee </Text>
        <Text style={styles.greenText}>+ ฿ {calculatePaymentFee(subtotal)}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.row}>
        <Text>total </Text>
        <Text> ฿ {totalPayment}</Text>
        </View>
      </View>
     ))}




       <TouchableOpacity 
                style={[styles.buttonContainer]} // Use an array if you want to combine styles
                onPress={() => {
                  if(!pickup){
                    Alert.alert('Please check');
                  } else if (selectedOption == "Option 1"){
                  handlePayment();
                  }else{
                    Alert.alert('Please Select option');
                  }
                }}>
                <Text style={styles.BackButtonText}>Payment</Text>
              </TouchableOpacity>
      
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
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'left',
    color: '#002348',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  
  },
  labelHead: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight:'bold'
  },
  input: {
    borderWidth: 1,
    borderColor: "#ced4da",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    backgroundColor: "#fff",
    marginBottom: 15,
  },
  row: {
    flexDirection: "row",
    justifyContent:'space-between'
  },
  inputContainer: {
    width: "48%",
    marginRight: 10,
  },
  buttonContainer: {
    backgroundColor: '#FD501E',
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 10,
        width: '100%',
        marginBottom:20,
        justifyContent:'center',
  },
  card: {
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
  optionContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#FD501E",
    marginRight: 10,
  },
  selectedRadio: {
    borderWidth: 5,
  },
  optionText: {
    fontSize: 16,
  },
  payment: {
    marginLeft: 30,
  },
  logodown: {
    justifyContent: 'space-between',
    width: '85%'
  },
  radioContian:{
    backgroundColor: '#F6F6F6',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    paddingBottom: 10,
    shadowColor: '#F6F6F6',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    marginBottom:10,
    borderWidth:1,
    borderColor: "#d0d5d8"
  },
  checkboxContainer: { 
    flexDirection: 'col', 
    alignItems: 'center' ,
    width:'10%',
    marginTop:5
  },
  textContainer:{
    flexDirection: 'col', 
    alignItems: 'center' ,
    width:'90%'
  },
  textcolor:{
    color:'#FD501E'
  },
  divider: {
    height: 2, // ความหนาของเส้น
    width: '100%', // ทำให้ยาวเต็มจอ
    backgroundColor: '#CCCCCC', // สีของเส้น
    marginVertical: 10, // ระยะห่างระหว่าง element
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'left',
    color: '#002348',
    marginBottom: 20,
  },
  qrCodeContainer: {
    marginTop: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chargeInfo: {
    marginTop: 20,
    textAlign: 'center',
  },
  redText:{
    color:'red'
  },
  greenText:{
    color:'green'
  },
  BackButtonText:{
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  errorInput: {
    borderColor: 'red',
  },
});

export default PaymentScreen;
