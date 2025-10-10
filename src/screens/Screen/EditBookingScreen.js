import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  SafeAreaView,
  TextInput,
  Alert,
  Platform,
  ActivityIndicator,
  Image,
  Modal,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLanguage } from './LanguageContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import ipAddress from '../../config/ipconfig';

const EditBookingScreen = () => {
  const { selectedLanguage } = useLanguage();
  const navigation = useNavigation();
  const route = useRoute();
  const { booking } = route.params || {};

  // States
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Booking details states
  const [company, setCompany] = useState('');
  const [companyImage, setCompanyImage] = useState('');
  const [startPoint, setStartPoint] = useState('');
  const [startPointId, setStartPointId] = useState('');
  const [destination, setDestination] = useState('');
  const [destinationId, setDestinationId] = useState('');
  const [seatType, setSeatType] = useState('');
  const [departureDate, setDepartureDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedTime, setSelectedTime] = useState('');
  const [availableTimes, setAvailableTimes] = useState([]);
  const [adultCount, setAdultCount] = useState(1);
  const [childCount, setChildCount] = useState(0);
  const [infantCount, setInfantCount] = useState(0);

  useEffect(() => {
    if (booking) {
      loadBookingData();
    }
  }, [booking]);

  // Load available times after location IDs are set
  useEffect(() => {
    if (startPointId && destinationId && departureDate) {
      loadAvailableTimes();
    }
  }, [startPointId, destinationId, departureDate]);

  const loadBookingData = () => {
    // Debug: log booking object to find correct field names
    console.log('=== BOOKING DATA ===');
    console.log('All booking fields:', Object.keys(booking));
    console.log('Full booking data:', JSON.stringify(booking, null, 2));
    console.log('==================');
    
    // Load existing booking data
    setCompany(selectedLanguage === 'th' 
      ? booking.md_company_namethai || booking.md_company_nameeng
      : booking.md_company_nameeng || booking.md_company_namethai
    );
    setCompanyImage(booking.md_company_picname || '');
    
    setStartPoint(selectedLanguage === 'th'
      ? booking.start_locationthai || booking.start_locationeng
      : booking.start_locationeng || booking.start_locationthai
    );
    setStartPointId(booking.md_timetable_startid || '');
    
    setDestination(selectedLanguage === 'th'
      ? booking.end_locationthai || booking.end_locationeng
      : booking.end_locationeng || booking.end_locationthai
    );
    setDestinationId(booking.md_timetable_endid || '');
    
    setSeatType(selectedLanguage === 'th'
      ? booking.md_seat_namethai || booking.md_seat_nameeng
      : booking.md_seat_nameeng || booking.md_seat_namethai
    );
    
    if (booking.md_booking_departdate) {
      setDepartureDate(new Date(booking.md_booking_departdate));
    }
    
    if (booking.md_timetable_departuretime && booking.md_timetable_arrivaltime) {
      const timeString = `${booking.md_timetable_departuretime} → ${booking.md_timetable_arrivaltime}${booking.md_timetable_time ? ` (${booking.md_timetable_time})` : ''}`;
      setSelectedTime(timeString);
    }
    
    setAdultCount(booking.md_booking_adult || 1);
    setChildCount(booking.md_booking_child || 0);
    setInfantCount(booking.md_booking_infant || 0);
  };

  const loadAvailableTimes = async () => {
    try {
      setIsLoading(true);
      
      // Check if we have location IDs
      if (!startPointId || !destinationId) {
        console.log('Missing location IDs:', {
          startPointId,
          destinationId,
          startPoint,
          destination
        });
        
        // Set empty times if IDs are missing
        setAvailableTimes([]);
        Alert.alert(
          selectedLanguage === 'th' ? 'แจ้งเตือน' : 'Notice',
          selectedLanguage === 'th' 
            ? 'ไม่สามารถโหลดเวลาเดินเรือได้ เนื่องจากข้อมูลไม่สมบูรณ์'
            : 'Cannot load ferry times due to incomplete data',
          [{ text: selectedLanguage === 'th' ? 'ตกลง' : 'OK' }]
        );
        setIsLoading(false);
        return;
      }
      
      // Format date for API (YYYY-MM-DD)
      const formattedDate = departureDate.toISOString().split('T')[0];
      
      console.log('Loading times with:', {
        locationstart: startPointId,
        locationend: destinationId,
        departdate: formattedDate
      });
      
      const response = await fetch('https://thetrago.com/api/V1/ferry/Getroute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lang: selectedLanguage === 'th' ? 'TH' : 'EN',
          currency: 'THB',
          roundtrip: 1,
          locationstart: startPointId,
          locationend: destinationId,
          adult: adultCount,
          child: childCount,
          infant: infantCount,
          departdate: formattedDate,
          returndate: ''
        }),
      });

      const text = await response.text();
      console.log('Response status:', response.status);
      console.log('Response preview:', text.substring(0, 200));
      
      const data = JSON.parse(text);
      
      if (data.data && data.data.departtrip && data.data.departtrip.length > 0) {
        // Format times from API response: departure → arrival (duration)
        const times = data.data.departtrip.map(trip => {
          const departTime = trip.md_timetable_departuretime || '';
          const arrivalTime = trip.md_timetable_arrivaltime || '';
          const duration = trip.md_timetable_time || '';
          
          return `${departTime} → ${arrivalTime} (${duration})`;
        });
        
        console.log('Available times loaded:', times);
        setAvailableTimes(times);
      } else {
        // Fallback to empty array if no times available
        setAvailableTimes([]);
      }
    } catch (error) {
      console.error('Error loading available times:', error);
      Alert.alert(
        selectedLanguage === 'th' ? 'ข้อผิดพลาด' : 'Error',
        selectedLanguage === 'th' 
          ? 'ไม่สามารถโหลดเวลาเดินเรือได้'
          : 'Failed to load ferry times',
        [{ text: selectedLanguage === 'th' ? 'ตกลง' : 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      // Android: close modal after selection
      setShowDatePicker(false);
      if (event.type === 'set' && selectedDate) {
        setDepartureDate(selectedDate);
        // Reset selected time when date changes
        setSelectedTime('');
      }
    } else {
      // iOS: keep modal open, only update date
      if (selectedDate) {
        setDepartureDate(selectedDate);
      }
    }
  };

  const handleDateConfirm = () => {
    setShowDatePicker(false);
    // Reset selected time when date changes
    setSelectedTime('');
    // Reload available times when date changes
    loadAvailableTimes();
  };

  const handleDateCancel = () => {
    setShowDatePicker(false);
  };

  const formatDate = (date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleUpdateBooking = async () => {
    // Validation
    if (adultCount === 0 && childCount === 0) {
      Alert.alert(
        selectedLanguage === 'th' ? 'ข้อมูลไม่ครบ' : 'Incomplete Data',
        selectedLanguage === 'th' 
          ? 'กรุณาระบุจำนวนผู้โดยสารอย่างน้อย 1 คน' 
          : 'Please specify at least 1 passenger'
      );
      return;
    }

    Alert.alert(
      selectedLanguage === 'th' ? 'ยืนยันการแก้ไข' : 'Confirm Update',
      selectedLanguage === 'th' 
        ? 'ต้องการบันทึกการแก้ไขหรือไม่?' 
        : 'Do you want to save changes?',
      [
        {
          text: selectedLanguage === 'th' ? 'ยกเลิก' : 'Cancel',
          style: 'cancel'
        },
        {
          text: selectedLanguage === 'th' ? 'บันทึก' : 'Save',
          onPress: () => saveChanges()
        }
      ]
    );
  };

  const saveChanges = async () => {
    setIsSaving(true);
    try {
      // API call to update booking
      const response = await fetch(`${ipAddress}/update-booking`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          booking_code: booking.md_booking_code,
          departure_date: departureDate.toISOString(),
          selected_time: selectedTime,
          adult_count: adultCount,
          child_count: childCount,
          infant_count: infantCount,
        }),
      });

      const data = await response.json();

      if (response.ok && data.status === 'success') {
        Alert.alert(
          selectedLanguage === 'th' ? 'สำเร็จ' : 'Success',
          selectedLanguage === 'th' 
            ? 'แก้ไขการจองสำเร็จ' 
            : 'Booking updated successfully',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack()
            }
          ]
        );
      } else {
        throw new Error(data.message || 'Update failed');
      }
    } catch (error) {
      console.error('Error updating booking:', error);
      Alert.alert(
        selectedLanguage === 'th' ? 'เกิดข้อผิดพลาด' : 'Error',
        selectedLanguage === 'th' 
          ? 'ไม่สามารถแก้ไขการจองได้ กรุณาลองใหม่อีกครั้ง' 
          : 'Unable to update booking. Please try again.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    Alert.alert(
      selectedLanguage === 'th' ? 'ยกเลิกการแก้ไข' : 'Cancel Editing',
      selectedLanguage === 'th' 
        ? 'การแก้ไขจะไม่ถูกบันทึก ต้องการออกหรือไม่?' 
        : 'Changes will not be saved. Do you want to exit?',
      [
        {
          text: selectedLanguage === 'th' ? 'ยกเลิก' : 'Cancel',
          style: 'cancel'
        },
        {
          text: selectedLanguage === 'th' ? 'ออก' : 'Exit',
          onPress: () => navigation.goBack(),
          style: 'destructive'
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBack}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {selectedLanguage === 'th' ? 'แก้ไขการจอง' : 'Edit Booking'}
        </Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Company */}
        <View style={styles.section}>
          <Text style={styles.label}>
            {selectedLanguage === 'th' ? 'บริษัท' : 'Company'}
          </Text>
          <View style={styles.companyContainer}>
            {companyImage ? (
              <Image 
                source={{ uri: `https://thetrago.com/Api/uploads/company/${companyImage}` }}
                style={styles.companyLogo}
                resizeMode="contain"
              />
            ) : (
              <MaterialCommunityIcons name="ferry" size={24} color="#FD501E" />
            )}
            <Text style={styles.companyName}>{company}</Text>
          </View>
        </View>

        {/* Starting Point */}
        <View style={styles.section}>
          <Text style={styles.label}>
            {selectedLanguage === 'th' ? 'จุดเริ่มต้น' : 'Starting Point'}
          </Text>
          <View style={styles.inputContainer}>
            <Text style={styles.inputText}>{startPoint}</Text>
          </View>
        </View>

        {/* Destination */}
        <View style={styles.section}>
          <Text style={styles.label}>
            {selectedLanguage === 'th' ? 'ปลายทาง' : 'Destination'}
          </Text>
          <View style={styles.inputContainer}>
            <Text style={styles.inputText}>{destination}</Text>
          </View>
        </View>

        {/* Seat Type */}
        <View style={styles.section}>
          <Text style={styles.label}>
            {selectedLanguage === 'th' ? 'ประเภทที่นั่ง' : 'Seat'}
          </Text>
          <View style={styles.inputContainer}>
            <Text style={styles.inputText}>{seatType}</Text>
          </View>
        </View>

        {/* Departure Date */}
        <View style={styles.section}>
          <Text style={styles.label}>
            {selectedLanguage === 'th' ? 'วันที่เดินทาง' : 'Departure Time'}
          </Text>
          <TouchableOpacity 
            style={styles.dateInputContainer}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.inputText}>{formatDate(departureDate)}</Text>
            <MaterialCommunityIcons name="calendar" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Date Picker Modal */}
        <Modal
          visible={showDatePicker}
          transparent={true}
          animationType="fade"
          onRequestClose={handleDateCancel}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContentCenter}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {selectedLanguage === 'th' ? 'เลือกวันที่' : 'Select Date'}
                </Text>
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={handleDateCancel}
                >
                  <MaterialCommunityIcons name="close" size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.calendarContainer}>
                {Platform.OS === 'ios' ? (
                  <DateTimePicker
                    value={departureDate}
                    mode="date"
                    display="inline"
                    onChange={handleDateChange}
                    minimumDate={new Date()}
                    locale={selectedLanguage === 'th' ? 'th' : 'en'}
                    themeVariant="light"
                    accentColor="#FD501E"
                    style={{ width: '100%' }}
                  />
                ) : (
                  <View style={styles.androidCalendarWrapper}>
                    <Text style={styles.selectedDateDisplay}>
                      {departureDate.toLocaleDateString(selectedLanguage === 'th' ? 'th-TH' : 'en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </Text>
                    <TouchableOpacity
                      style={styles.changeAndroidDateButton}
                      onPress={() => {
                        setShowDatePicker(false);
                        setTimeout(() => {
                          setShowDatePicker(true);
                        }, 100);
                      }}
                    >
                      <Text style={styles.changeAndroidDateText}>
                        {selectedLanguage === 'th' ? 'เปลี่ยนวันที่' : 'Change Date'}
                      </Text>
                    </TouchableOpacity>
                    <DateTimePicker
                      value={departureDate}
                      mode="date"
                      display="default"
                      onChange={handleDateChange}
                      minimumDate={new Date()}
                      locale={selectedLanguage === 'th' ? 'th' : 'en'}
                    />
                  </View>
                )}
              </View>
              
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={styles.modalConfirmButton}
                  onPress={handleDateConfirm}
                >
                  <Text style={styles.modalConfirmText}>
                    {selectedLanguage === 'th' ? 'ยืนยัน' : 'Confirm'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Time Selection */}
        <View style={styles.section}>
          <Text style={styles.label}>
            {selectedLanguage === 'th' ? 'เวลา' : 'Time'}
          </Text>
          <TouchableOpacity
            style={styles.inputContainer}
            onPress={() => setShowTimePicker(true)}
          >
            <Text style={selectedTime ? styles.inputText : styles.placeholderText}>
              {selectedTime || (selectedLanguage === 'th' ? 'เลือกเวลา' : 'Select Time')}
            </Text>
            <MaterialCommunityIcons name="clock-outline" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Time Picker Modal */}
        <Modal
          visible={showTimePicker}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowTimePicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContentCenter}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {selectedLanguage === 'th' ? 'เลือกเวลา' : 'Select Time'}
                </Text>
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={() => setShowTimePicker(false)}
                >
                  <MaterialCommunityIcons name="close" size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.timeListContainer}>
                {isLoading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#FD501E" />
                    <Text style={styles.loadingText}>
                      {selectedLanguage === 'th' ? 'กำลังโหลด...' : 'Loading...'}
                    </Text>
                  </View>
                ) : availableTimes.length > 0 ? (
                  availableTimes.map((time, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.timeItem,
                        selectedTime === time && styles.timeItemSelected
                      ]}
                      onPress={() => {
                        setSelectedTime(time);
                        setShowTimePicker(false);
                      }}
                    >
                      <MaterialCommunityIcons 
                        name="clock-outline" 
                        size={20} 
                        color={selectedTime === time ? '#FD501E' : '#6B7280'} 
                      />
                      <Text style={[
                        styles.timeItemText,
                        selectedTime === time && styles.timeItemTextSelected
                      ]}>
                        {time}
                      </Text>
                      {selectedTime === time && (
                        <MaterialCommunityIcons name="check-circle" size={20} color="#FD501E" />
                      )}
                    </TouchableOpacity>
                  ))
                ) : (
                  <View style={styles.emptyStateContainer}>
                    <MaterialCommunityIcons name="clock-alert-outline" size={48} color="#9CA3AF" />
                    <Text style={styles.emptyStateText}>
                      {selectedLanguage === 'th' 
                        ? 'ไม่มีเวลาที่เลือกได้'
                        : 'No times available'}
                    </Text>
                  </View>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Adult Count */}
        <View style={styles.section}>
          <Text style={styles.label}>
            {selectedLanguage === 'th' ? 'ผู้ใหญ่' : 'Adult'}
          </Text>
          <View style={styles.inputContainer}>
            <Text style={styles.inputText}>{adultCount}</Text>
          </View>
        </View>

        {/* Child Count */}
        <View style={styles.section}>
          <Text style={styles.label}>
            {selectedLanguage === 'th' ? 'เด็ก' : 'Child'}
          </Text>
          <View style={styles.inputContainer}>
            <Text style={styles.inputText}>{childCount}</Text>
          </View>
        </View>

        {/* Infant Count */}
        <View style={styles.section}>
          <Text style={styles.label}>
            {selectedLanguage === 'th' ? 'ทารก' : 'Infant'}
          </Text>
          <View style={styles.inputContainer}>
            <Text style={styles.inputText}>{infantCount}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {/* Back Button */}
          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={handleBack}
            disabled={isSaving}
          >
            <Text style={styles.secondaryButtonText}>
              {selectedLanguage === 'th' ? 'ยกเลิก' : 'Back'}
            </Text>
          </TouchableOpacity>

          {/* Update Button */}
          <TouchableOpacity 
            style={[styles.primaryButton, isSaving && styles.disabledButton]}
            onPress={handleUpdateBooking}
            disabled={isSaving}
          >
            <LinearGradient
              colors={isSaving ? ['#9CA3AF', '#6B7280'] : ['#FD501E', '#FF6B35']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.buttonGradient}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryButtonText}>
                  {selectedLanguage === 'th' ? 'อัพเดท' : 'Update'}
                </Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  companyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  companyLogo: {
    width: 32,
    height: 32,
    marginRight: 12,
  },
  companyName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  inputText: {
    fontSize: 16,
    color: '#1F2937',
    flex: 1,
  },
  placeholderText: {
    fontSize: 16,
    color: '#9CA3AF',
    flex: 1,
  },
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  pickerContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    overflow: 'hidden',
    minHeight: 52,
    justifyContent: 'center',
  },
  picker: {
    height: 52,
    color: '#1F2937',
    backgroundColor: '#FFFFFF',
  },
  pickerItem: {
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: '#FFFFFF',
  },
  pickerPlaceholder: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  counterButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  counterInput: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  secondaryButton: {
    flex: 1,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6B7280',
  },
  primaryButton: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#FD501E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContentCenter: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: '100%',
    maxWidth: 500,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    flex: 1,
    textAlign: 'center',
  },
  closeButton: {
    position: 'absolute',
    right: 20,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarContainer: {
    padding: 20,
    alignItems: 'center',
    minHeight: Platform.OS === 'ios' ? 350 : 'auto',
    width: '100%',
  },
  androidCalendarWrapper: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 20,
  },
  selectedDateDisplay: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  changeAndroidDateButton: {
    backgroundColor: '#FD501E',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 10,
  },
  changeAndroidDateText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalButtons: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  timeListContainer: {
    maxHeight: 500,
    minHeight: 300,
  },
  timeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    gap: 12,
  },
  timeItemSelected: {
    backgroundColor: '#FFF7ED',
  },
  timeItemText: {
    fontSize: 16,
    color: '#1F2937',
    flex: 1,
  },
  timeItemTextSelected: {
    color: '#FD501E',
    fontWeight: '600',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  emptyStateContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  modalConfirmButton: {
    width: '100%',
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FD501E',
    borderRadius: 12,
  },
  modalConfirmText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default EditBookingScreen;
