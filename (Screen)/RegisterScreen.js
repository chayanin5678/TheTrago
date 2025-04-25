import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image ,Alert} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { FontAwesome } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';
import { GestureHandlerRefContext } from '@react-navigation/stack';
import ipAddress from "../ipconfig";
import axios from 'axios';
import moment from "moment-timezone";

const RegisterScreen = ({ navigation }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailExists, setEmailExists] = useState(false);
  const [errors, setErrors] = useState({});
 const [memberid, setMemberId] = useState(''); // State for member ID

  
  

  const checkEmail = async (email) => {
    try {
      const res = await fetch(`${ipAddress}/checkemail/${email}`);
      if (!res.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await res.json();
      
      if (data.message === 'Email exists' && data.data.length > 0) {
        setEmailExists(true); // อีเมลพบในระบบ
      } else {
        setEmailExists(false); // อีเมลไม่พบในระบบ
      }
    } catch (error) {
      console.error("Error during email check:", error);
      Alert.alert("Error", "Failed to check email");
    }
  };
  useEffect(() => {
    if (email) {
      checkEmail(email); // เรียกใช้ฟังก์ชันเมื่อ email เปลี่ยนแปลง
    }
  }, [email]);

  const validateEmail = (email) => {
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return regex.test(email);
  };

  const createMember = async (memberid) => {
    try {
      await axios.post(`${ipAddress}/member`, {
        md_member_no: memberid,//1
        md_member_user: email,//2
        md_member_pass : password,//3
        md_member_upline: 0,//4
        md_member_fname : firstName,//5
        md_member_lname : lastName,//6
        md_member_email : email,//7
        md_member_passport_status : 3,//8
        md_member_bankID : 0,//9
        md_member_bank_status :3,//10
        md_member_status : 1,//11
        md_member_affiliate_status : 0,
        md_member_logintype :0,
        md_member_credate:  moment().tz("Asia/Bangkok").format("YYYY-MM-DD HH:mm:ss"),
        md_member_update: moment().tz("Asia/Bangkok").format("YYYY-MM-DD HH:mm:ss")

      });

      console.log("✅ Booking created successfully");
    } catch (error) {
      console.error("❌ Error submitting booking:", error);
      throw new Error("❌ Failed to create booking");
    }
  };

  


  
  const handleRegister = async () => {
    let newErrors = {};

  
    // ตรวจสอบข้อมูลที่กรอกในฟอร์ม
    if (!firstName) newErrors.firstName = true;
    if (!lastName) newErrors.lastName = true;
    if (!email) newErrors.email = true;
    if (!password) newErrors.passwordContainer = true;
    if (!confirmPassword) newErrors.confirmpasswordContainer = true;
  
    // ถ้ามีข้อมูลที่ยังไม่ครบ
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      Alert.alert('Incomplete Information', 'Please fill in all required fields.');
      return;
    }
  
    // ตรวจสอบว่า password ตรงกันหรือไม่
    if (password !== confirmPassword) {
      Alert.alert("Passwords don't match!");
      return;
    }
  
    // ตรวจสอบว่าอีเมลถูกต้องหรือไม่
    if (!validateEmail(email)) {
      Alert.alert("Invalid email format!");
      return;
    }
  
    // ตรวจสอบว่าอีเมลมีในระบบหรือไม่
    if (emailExists) {
      Alert.alert("Email already exists!");
      return;
    }
  
    try {
      // ดึงข้อมูล memberid ใหม่จาก API
      const res = await fetch(`${ipAddress}/memberid`);
      const data = await res.json();
      console.log("Booking Code:", data); // แสดงผลข้อมูลที่ได้รับจาก API
  
      // ตรวจสอบว่า data.newMemberId มีอยู่หรือไม่
      if (!data.newMemberId) {
        Alert.alert("Error", "Unable to retrieve member ID.");
        return;
      }
  
      // สร้างหมายเลขสมาชิกใหม่โดยเพิ่ม 1 ให้กับหมายเลขที่ดึงมา
      let numberPart = parseInt(data.newMemberId.substring(1)) + 1;  // แปลงเป็นตัวเลขและเพิ่ม 1
  
      // สร้าง ID ใหม่โดยใช้ 'M' และหมายเลขที่เพิ่มขึ้น
      let newId = 'M' + numberPart.toString().padStart(6, '0');
      
      console.log("New ID:", newId); // แสดงผล ID ใหม่

      createMember(newId); // เรียกใช้ฟังก์ชันสร้างสมาชิกใหม่
      navigation.navigate('AccountScreen'); // นำทางไปยังหน้าล็อกอินหลังจากสร้างสมาชิกเสร็จ
      // ตอนนี้คุณสามารถใช้ `newBookingCode` และ `newId` เพื่อส่งข้อมูลไปยัง API หรือจัดการต่อได้
    } catch (error) {
      console.error('Error fetching member ID:', error);
      Alert.alert('Error', 'Failed to fetch member ID.');
    }
  };



  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>
      <View style={{ flexDirection: 'row' }}>
        <Text style={styles.subtitle}>
          Already registered?
        </Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.link}> Sign In</Text>
        </TouchableOpacity>

      </View>
       
      <TextInput
        placeholder="Frist Name"
        value={firstName}
        onChangeText={(text) => {
          setFirstName(text);
          setErrors((prev) => ({ ...prev, firstName: false }));
        }}
        keyboardType="default"
        style={[styles.input, errors.firstName && styles.errorInput]}
      />

      <TextInput
        style={[styles.input, errors.lastName && styles.errorInput]}
        placeholder="Last Name"
        value={lastName}
        onChangeText={(text) => {
          setLastName(text);
          setErrors((prev) => ({ ...prev, lastName: false }));
        }}
        keyboardType="default"
      />

      <TextInput
         style={[styles.input, errors.email && styles.errorInput]}
        placeholder="Email"
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          setErrors((prev) => ({ ...prev, email: false }));
        }}
        keyboardType="email-address"
      />

      <View style={[styles.passwordContainer, errors.passwordContainer && styles.errorInput]}>
        <TextInput
         style={styles.passwordInput}
          placeholder="Password"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            setErrors((prev) => ({ ...prev, passwordContainer: false }));
          }}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Icon name={showPassword ? 'eye' : 'eye-off'} size={20} color="#777" />
        </TouchableOpacity>
      </View>

      <View style={[styles.confirmpasswordContainer, errors.confirmpasswordContainer && styles.errorInput]}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Confirm Password"
          secureTextEntry={!showConfirmPassword}
          value={confirmPassword}
          onChangeText={(text) => {
            setConfirmPassword(text);
            setErrors((prev) => ({ ...prev, confirmpasswordContainer: false }));
          }}
        />
        <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
          <Icon name={showConfirmPassword ? 'eye' : 'eye-off'} size={20} color="#777" />
        </TouchableOpacity>
      </View>



      <TouchableOpacity style={styles.signInButton} onPress={handleRegister}>
        <Text style={styles.signInText}>Register</Text>
      </TouchableOpacity>

      <Text style={styles.policyText}>
        By continuing, you agree to The Tragos' <Text style={styles.link}>Terms of Use</Text> and <Text style={styles.link}>Privacy Policy</Text>.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    color: '#555',
    marginBottom: 20,
  },
  link: {
    color: '#5A31D1',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  passwordContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  confirmpasswordContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  row: {
    marginVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rememberText: {
    fontSize: 14,
    color: '#333',
  },
  forgotText: {
    color: '#5A31D1',
    fontSize: 14,
  },
  signInButton: {
    backgroundColor: '#FD501E',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
  },
  signInText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 14,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#ccc',
  },
  orText: {
    marginHorizontal: 10,
    color: '#777',
  },
  socialButton: {
    backgroundColor: '#fdf0ec',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  socialText: {
    marginLeft: 8,
    fontSize: 16,
  },
  policyText: {
    marginTop: 20,
    color: '#777',
    fontSize: 12,
    textAlign: 'center',
  },
  passwordInput: {
    flex: 1,

  },
  errorInput: {
    borderColor: 'red', // เปลี่ยนกรอบเป็นสีแดงเมื่อมีข้อผิดพลาด
  },
});

export default RegisterScreen;
