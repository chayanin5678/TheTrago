import React, { useEffect, useState } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { FontAwesome, Entypo } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import ipAddress from "../ipconfig";

const ProfileScreen = ({ navigation }) => {

  const [Firstname, setFirstname] = useState('');
  const [Lastname, setLastname] = useState('');
  const [tel, setTel] = useState('');
  const [email, setEmail] = useState(''); 
  const [country, setCountry] = useState('');
  const [countrycode, setCountrycode] = useState('');
  const [birthdate, setBirthdateate] = useState('');

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

 
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Profile Progress */}
      <View style={styles.progressCard}>
        <Text style={styles.title}>Complete Your Profile</Text>
        <View style={styles.progressBarBackground}>
          <View style={styles.progressBarFill}></View>
        </View>
        <Text style={styles.infoText}>
          Get the best out of booking by adding the remaining details!
        </Text>
        <View style={styles.verificationList}>
          <Text style={styles.verified}><FontAwesome name="check-circle" size={16} color="green" /> Verified Email</Text>
          <Text style={styles.verified}><FontAwesome name="check-circle" size={16} color="green" /> Verified Profile</Text>
          <Text style={styles.unverified}><FontAwesome name="times-circle" size={16} color="orangered" /> Verified ID Card/Passport</Text>
          <Text style={styles.unverified}><FontAwesome name="times-circle" size={16} color="orangered" /> Verified Bank Account</Text>
        </View>
      </View>

      {/* Personal Information Form */}
      <View style={styles.formCard}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        <TextInput style={styles.input} placeholder="First Name" value = {Firstname} />
        <TextInput style={styles.input} placeholder="Last Name" value =  {Lastname} />
        <TextInput style={styles.input} placeholder="Country Code" value="(+66) Thailand" />
        
                  <TouchableOpacity
                    style={styles.button}
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
        <TextInput style={styles.input} placeholder="Phone" value= {tel} />
        <TextInput style={[styles.input, styles.disabled]} placeholder="Email" value={email} editable={false} />
        <TextInput style={styles.input} placeholder="Country" value= {country} />
        <TextInput style={styles.input} placeholder="Date of Birth*" value={birthdate} />
        <TouchableOpacity style={styles.saveButton}>
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
  });
  
export default ProfileScreen;