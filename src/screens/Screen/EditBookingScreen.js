import React, { useState, useEffect, useRef } from 'react';
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
  Animated,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLanguage } from './LanguageContext';
import { useCustomer } from './CustomerContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTabBarAutoHide } from '../../utils/useTabBarAutoHide';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ipAddress from '../../config/ipconfig';
import NotificationService from '../../services/NotificationService';

const EditBookingScreen = () => {
  const { selectedLanguage } = useLanguage();
  const { customerData } = useCustomer();
  const navigation = useNavigation();
  const route = useRoute();
  const { booking } = route.params || {};
  const tabBarScrollProps = useTabBarAutoHide();

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
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [selectedTime, setSelectedTime] = useState('');
  const [availableTimes, setAvailableTimes] = useState([]);
  const [note, setNote] = useState('');
  const [adultCount, setAdultCount] = useState(1);
  const [childCount, setChildCount] = useState(0);
  const [infantCount, setInfantCount] = useState(0);
  
  // User info states
  const [userName, setUserName] = useState('');
  const [userImage, setUserImage] = useState('');
  
  // Edit history states
  const [editHistory, setEditHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  
  // Notification states
  const [hasNewUpdate, setHasNewUpdate] = useState(false);
  const [lastCheckTimestamp, setLastCheckTimestamp] = useState(null);
  const pollingInterval = useRef(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (booking) {
      loadBookingData();
      loadEditHistory();
      
      // ปิดระบบ polling อัตโนมัติ (ไม่ตรวจสอบทุก 10 วินาที)
      // หากต้องการเปิดใช้งาน ให้ uncomment บรรทัดด้านล่าง
      // startPollingForUpdates();
    }

    // Cleanup เมื่อออกจากหน้า
    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
    };
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
    
    // Load user info
    setUserName(booking.md_member_name || booking.md_booking_name || 'User');
    setUserImage(booking.md_member_image || booking.md_member_picname || '');
  };

  const loadEditHistory = async (silent = false) => {
    try {
      if (!silent) {
        setIsLoadingHistory(true);
      }
      
      const bookingCode = booking?.md_booking_code;
      if (!bookingCode) {
        console.log('No booking code available');
        return;
      }

      console.log('=== LOADING EDIT HISTORY ===');
      console.log('Booking Code:', bookingCode);
      console.log('API URL:', `https://thetrago.com/AppApi/booking-edit-history/${bookingCode}`);

      const response = await fetch(`https://thetrago.com/AppApi/booking-edit-history/${bookingCode}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Response Status:', response.status);
      const responseText = await response.text();
      console.log('Response Text:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
        console.log('Parsed Data:', data);
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        return;
      }

      if (response.ok && data.status === 'success' && data.data) {
        // ตรวจสอบว่ามีการอัปเดตใหม่หรือไม่
        checkForNewUpdates(data.data);
        
        setEditHistory(data.data);
        console.log('✅ Edit history loaded:', data.data.length, 'items');
      } else {
        console.log('❌ Failed to load history:', data.message);
      }
    } catch (error) {
      console.error('❌ Error loading edit history:', error);
    } finally {
      if (!silent) {
        setIsLoadingHistory(false);
      }
      console.log('=== EDIT HISTORY LOADING END ===');
    }
  };

  // ตรวจสอบการอัปเดตใหม่จาก admin
  const checkForNewUpdates = (newHistory) => {
    if (!newHistory || newHistory.length === 0) return;

    // ดึง admin response ล่าสุด (approve/reject)
    const latestAdminResponse = newHistory.find(
      item => item.action === 'approve' || item.action === 'reject'
    );

    if (!latestAdminResponse) return;

    // ถ้ายังไม่เคยเช็คเลย ให้บันทึก timestamp ล่าสุด
    if (!lastCheckTimestamp) {
      setLastCheckTimestamp(latestAdminResponse.created_at);
      return;
    }

    // ตรวจสอบว่ามีการตอบกลับใหม่หรือไม่
    const latestTimestamp = new Date(latestAdminResponse.created_at).getTime();
    const lastChecked = new Date(lastCheckTimestamp).getTime();

    if (latestTimestamp > lastChecked) {
      // มีการอัปเดตใหม่!
      setHasNewUpdate(true);
      setLastCheckTimestamp(latestAdminResponse.created_at);
      
      // เริ่ม animation กระพริบ
      startPulseAnimation();

      // แสดง notification
      const isApproved = latestAdminResponse.action === 'approve';
      showUpdateNotification(isApproved, latestAdminResponse.note);
    }
  };

  // เริ่มระบบ polling เพื่อตรวจสอบการอัปเดต
  const startPollingForUpdates = () => {
    // เช็คทันทีครั้งแรก
    loadEditHistory(true);

    // ตั้ง interval ให้เช็คทุก 10 วินาที
    pollingInterval.current = setInterval(() => {
      loadEditHistory(true); // silent mode ไม่แสดง loading
    }, 10000); // 10 seconds
  };

  // Animation กระพริบสำหรับแจ้งเตือน
  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  // แสดงการแจ้งเตือนเมื่อ admin ตอบกลับ
  const showUpdateNotification = (isApproved, adminNote) => {
    const title = isApproved
      ? (selectedLanguage === 'th' ? 'คำขอได้รับการอนุมัติ' : 'Request Approved')
      : (selectedLanguage === 'th' ? 'คำขอถูกปฏิเสธ' : 'Request Rejected');

    const message = adminNote || (isApproved
      ? (selectedLanguage === 'th' ? 'Admin อนุมัติคำขอแก้ไขการจองของคุณแล้ว' : 'Admin has approved your booking change request')
      : (selectedLanguage === 'th' ? 'Admin ปฏิเสธคำขอแก้ไขการจองของคุณ' : 'Admin has rejected your booking change request')
    );

    Alert.alert(
      title,
      message,
      [
        {
          text: selectedLanguage === 'th' ? 'ดูรายละเอียด' : 'View Details',
          onPress: () => {
            setHasNewUpdate(false);
            // Scroll to chat section หรือทำอะไรที่ต้องการ
          },
        },
      ],
      { cancelable: false }
    );

    // ส่ง local notification ถ้า app อยู่ใน background
    NotificationService.scheduleLocalNotification(
      title,
      message,
      {
        type: 'booking_update',
        booking_code: booking?.md_booking_code,
        action: isApproved ? 'approved' : 'rejected',
      }
    );
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
    // Validation - ตรวจสอบวันที่
    if (!departureDate) {
      Alert.alert(
        selectedLanguage === 'th' ? 'ข้อมูลไม่ครบ' : 'Incomplete Data',
        selectedLanguage === 'th' 
          ? 'กรุณาเลือกวันที่เดินทาง' 
          : 'Please select departure date',
        [{ text: selectedLanguage === 'th' ? 'ตกลง' : 'OK' }]
      );
      return;
    }

    // Validation - ตรวจสอบเวลา
    if (!selectedTime || selectedTime.trim() === '') {
      Alert.alert(
        selectedLanguage === 'th' ? 'ข้อมูลไม่ครบ' : 'Incomplete Data',
        selectedLanguage === 'th' 
          ? 'กรุณาเลือกเวลาเดินทาง' 
          : 'Please select departure time',
        [{ text: selectedLanguage === 'th' ? 'ตกลง' : 'OK' }]
      );
      return;
    }

    // Validation - ตรวจสอบจำนวนผู้โดยสาร
    if (adultCount === 0 && childCount === 0) {
      Alert.alert(
        selectedLanguage === 'th' ? 'ข้อมูลไม่ครบ' : 'Incomplete Data',
        selectedLanguage === 'th' 
          ? 'กรุณาระบุจำนวนผู้โดยสารอย่างน้อย 1 คน' 
          : 'Please specify at least 1 passenger',
        [{ text: selectedLanguage === 'th' ? 'ตกลง' : 'OK' }]
      );
      return;
    }

    // Show note modal
    setShowNoteModal(true);
  };

  const handleConfirmUpdate = async () => {
    setShowNoteModal(false);
    
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
      // Validate booking data
      if (!booking || !booking.md_booking_code) {
        throw new Error('Booking information is missing');
      }

      if (!departureDate) {
        throw new Error('Departure date is missing');
      }

      if (!selectedTime || selectedTime.trim() === '') {
        throw new Error('Departure time is missing');
      }

      // Prepare before_data (original booking data)
      const originalDate = booking.md_booking_departdate;
      const originalTime = booking.md_timetable_departuretime;
      
      const beforeData = {
        departdate: originalDate,
        departtime: originalTime,
      };

      // Prepare after_data (updated booking data)
      const newDate = departureDate.toISOString().split('T')[0];
      const newTime = selectedTime.split(' → ')[0].trim(); // Extract only departure time
      
      const afterData = {
        departdate: newDate,
        departtime: newTime,
      };

      // Prepare changes_payload (JSON diff format ที่ API ใหม่รองรับ)
      const changesPayload = {};
      if (originalDate !== newDate) {
        changesPayload.md_booking_departdate = {
          from: originalDate,
          to: newDate
        };
      }
      if (originalTime !== newTime) {
        changesPayload.md_booking_departtime = {
          from: originalTime,
          to: newTime
        };
      }

      // Get member ID from CustomerContext (primary source) or booking data (fallback)
      let memberId = customerData?.md_booking_memberid || booking.md_booking_memberid || booking.md_member_id;
      
      // Last resort: try AsyncStorage
      if (!memberId) {
        try {
          const storedMemberId = await AsyncStorage.getItem('userId');
          if (storedMemberId) {
            memberId = storedMemberId;
          }
        } catch (error) {
          console.log('Could not get member ID from storage:', error);
        }
      }

      console.log('=== SAVE CHANGES ===');
      console.log('Customer Data Member ID:', customerData?.md_booking_memberid);
      console.log('Booking Member ID:', booking.md_booking_memberid);
      console.log('Selected Member ID:', memberId);
      console.log('Before Data:', beforeData);
      console.log('After Data:', afterData);
      console.log('Changes Payload:', changesPayload);
      console.log('Booking Code:', booking.md_booking_code);
      console.log('Edit Note:', note);
      console.log('API Endpoint:', `${ipAddress}/AppApi/update-booking`);
      console.log('===================');

      // Request body รองรับทั้ง format เก่าและใหม่
      const requestBody = {
        booking_code: booking.md_booking_code,
        member_id: memberId || null,
        action: 'request',
        edit_note: note || 'ขอเปลี่ยนแปลงข้อมูลการจอง', // ใช้ edit_note แทน note
        note: note || 'ขอเปลี่ยนแปลงข้อมูลการจอง', // เก็บ note ไว้เพื่อ backward compatibility
        before_data: JSON.stringify(beforeData),
        after_data: JSON.stringify(afterData),
        changes_payload: JSON.stringify(changesPayload), // เพิ่ม changes_payload
        actor_id: memberId || null,
      };

      console.log('Request Body:', JSON.stringify(requestBody, null, 2));

      // API call to update booking (ใช้ endpoint ใหม่)
      const apiUrl = `${ipAddress}/update-booking`;
      console.log('Calling API:', apiUrl);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('Response Status:', response.status);
      console.log('Response OK:', response.ok);
      
      const responseText = await response.text();
      console.log('Response Text:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
        console.log('Parsed Response:', JSON.stringify(data, null, 2));
      } catch (parseError) {
        console.error('❌ JSON Parse Error:', parseError);
        console.log('Raw Response:', responseText);
        throw new Error('Invalid JSON response from server: ' + responseText.substring(0, 100));
      }

      // Check for success
      if (data.status === 'success') {
        console.log('✅ Update successful');
        
        // Reload edit history to show the new request
        await loadEditHistory();
        
        Alert.alert(
          selectedLanguage === 'th' ? 'สำเร็จ' : 'Success',
          selectedLanguage === 'th' 
            ? 'ส่งคำขอแก้ไขการจองสำเร็จ\nรอ Admin อนุมัติ' 
            : 'Booking update request sent successfully.\nWaiting for admin approval.',
          [
            {
              text: 'OK',
              onPress: () => {
                // Clear note
                setNote('');
                // Don't go back, stay to see the updated history
              }
            }
          ]
        );
      } else {
        // Handle error from API
        const errorMessage = data.message || data.error || 'Unknown error occurred';
        console.log('❌ Update failed:', errorMessage);
        console.log('Full error response:', JSON.stringify(data, null, 2));
        
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('❌ ERROR in saveChanges:', error);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      
      // Show user-friendly error message
      let errorMessage = selectedLanguage === 'th' 
        ? 'ไม่สามารถส่งคำขอแก้ไขได้ กรุณาลองใหม่อีกครั้ง' 
        : 'Unable to send update request. Please try again.';

      // Add specific error details if available
      if (error.message) {
        errorMessage += '\n\n' + (selectedLanguage === 'th' ? 'รายละเอียด: ' : 'Details: ') + error.message;
      }
      
      Alert.alert(
        selectedLanguage === 'th' ? 'เกิดข้อผิดพลาด' : 'Error',
        errorMessage,
        [{ text: 'OK' }]
      );
    } finally {
      setIsSaving(false);
      console.log('=== SAVE CHANGES END ===');
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
    <View style={[styles.container, { paddingTop: 40 }]}>
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
        {hasNewUpdate ? (
          <Animated.View style={[styles.notificationBadge, { transform: [{ scale: pulseAnim }] }]}>
            <MaterialCommunityIcons name="bell-ring" size={20} color="#FFFFFF" />
            <View style={styles.badgeDot} />
          </Animated.View>
        ) : (
          <View style={styles.backButton} />
        )}
      </View>

      <ScrollView 
        {...tabBarScrollProps}
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

        {/* Chat-style Log Section */}
        <View style={styles.debugSection}>
          <Text style={styles.debugTitle}>ประวัติคำขอและหมายเหตุ</Text>
          
          <ScrollView style={styles.chatContainer} showsVerticalScrollIndicator={false}>
            {isLoadingHistory ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FD501E" />
                <Text style={styles.loadingText}>
                  {selectedLanguage === 'th' ? 'กำลังโหลดประวัติ...' : 'Loading history...'}
                </Text>
              </View>
            ) : editHistory.length > 0 ? (
              editHistory.map((item, index) => {
                const isRequest = item.action === 'request';
                const isApprove = item.action === 'approve';
                const isReject = item.action === 'reject';
                
                // Parse before_data and after_data
                let beforeData = null;
                let afterData = null;
                try {
                  if (item.before_data) beforeData = JSON.parse(item.before_data);
                  if (item.after_data) afterData = JSON.parse(item.after_data);
                } catch (e) {
                  console.error('Error parsing data:', e);
                }

                return (
                  <View key={item.id || index}>
                    {isRequest ? (
                      // User Request (Right side)
                      <View style={styles.chatMessageRight}>
                        <View style={styles.chatBubbleRight}>
                          <View style={styles.chatHeader}>
                            <View style={styles.chatIconSmall}>
                              {userImage ? (
                                <Image 
                                  source={{ uri: `https://thetrago.com/Api/uploads/member/${userImage}` }}
                                  style={styles.chatIconImage}
                                  resizeMode="cover"
                                />
                              ) : (
                                <MaterialCommunityIcons name="account-circle" size={20} color="#6B7280" />
                              )}
                            </View>
                            <Text style={styles.chatUsername}>{userName}</Text>
                            <View style={styles.chatBadgeRequest}>
                              <Text style={styles.chatBadgeText}>request</Text>
                            </View>
                          </View>
                          <Text style={styles.chatTextRight}>{item.note || 'ขอเปลี่ยนวันและเวลา'}</Text>
                          {beforeData && afterData ? (
                            <View style={styles.chatDataBox}>
                              <View style={styles.dataCompareRow}>
                                <View style={styles.dataColumn}>
                                  <Text style={styles.dataColumnTitle}>{'เดิม (Before)'}</Text>
                                  <View style={styles.dataItem}>
                                    <MaterialCommunityIcons name="calendar" size={14} color="#6B7280" />
                                    <Text style={styles.dataItemText}>{beforeData.departdate}</Text>
                                  </View>
                                  <View style={styles.dataItem}>
                                    <MaterialCommunityIcons name="clock-outline" size={14} color="#6B7280" />
                                    <Text style={styles.dataItemText}>{beforeData.departtime}</Text>
                                  </View>
                                </View>
                                <View style={styles.dataColumn}>
                                  <Text style={styles.dataColumnTitle}>{'ใหม่ (After)'}</Text>
                                  <View style={styles.dataItem}>
                                    <MaterialCommunityIcons name="calendar" size={14} color="#6B7280" />
                                    <Text style={styles.dataItemText}>{afterData.departdate}</Text>
                                  </View>
                                  <View style={styles.dataItem}>
                                    <MaterialCommunityIcons name="clock-outline" size={14} color="#6B7280" />
                                    <Text style={styles.dataItemText}>{afterData.departtime}</Text>
                                  </View>
                                </View>
                              </View>
                            </View>
                          ) : null}
                          <Text style={styles.chatTimeRight}>{item.created_at}</Text>
                        </View>
                      </View>
                    ) : (
                      // Admin Response (Left side)
                      <View style={styles.chatMessageLeft}>
                        <View style={styles.chatBubbleLeft}>
                          <View style={styles.chatHeader}>
                            <View style={styles.chatIconSmall}>
                              <MaterialCommunityIcons name="shield-account" size={20} color="#3B82F6" />
                            </View>
                            <Text style={styles.chatUsername}>Admin</Text>
                            <View style={isApprove ? styles.chatBadgeApprove : styles.chatBadgeReject}>
                              <Text style={styles.chatBadgeText}>{item.action}</Text>
                            </View>
                          </View>
                          <Text style={styles.chatText}>
                            {isApprove 
                              ? (selectedLanguage === 'th' ? 'อนุมัติแล้ว' : 'Approved')
                              : (selectedLanguage === 'th' ? 'ปฏิเสธ' : 'Rejected')}
                          </Text>
                          {item.note ? <Text style={styles.chatText}>{item.note}</Text> : null}
                          {beforeData && afterData ? (
                            <View style={styles.chatDataBox}>
                              <View style={styles.dataCompareRow}>
                                <View style={styles.dataColumn}>
                                  <Text style={styles.dataColumnTitle}>{'เดิม (Before)'}</Text>
                                  <View style={styles.dataItem}>
                                    <MaterialCommunityIcons name="calendar" size={14} color="#6B7280" />
                                    <Text style={styles.dataItemText}>{beforeData.departdate}</Text>
                                  </View>
                                  <View style={styles.dataItem}>
                                    <MaterialCommunityIcons name="clock-outline" size={14} color="#6B7280" />
                                    <Text style={styles.dataItemText}>{beforeData.departtime}</Text>
                                  </View>
                                </View>
                                <View style={styles.dataColumn}>
                                  <Text style={styles.dataColumnTitle}>{'ใหม่ (After)'}</Text>
                                  <View style={styles.dataItem}>
                                    <MaterialCommunityIcons name="calendar" size={14} color="#6B7280" />
                                    <Text style={styles.dataItemText}>{afterData.departdate}</Text>
                                  </View>
                                  <View style={styles.dataItem}>
                                    <MaterialCommunityIcons name="clock-outline" size={14} color="#6B7280" />
                                    <Text style={styles.dataItemText}>{afterData.departtime}</Text>
                                  </View>
                                </View>
                              </View>
                            </View>
                          ) : null}
                          <Text style={styles.chatTime}>{item.updated_at || item.created_at}</Text>
                        </View>
                      </View>
                    )}
                  </View>
                );
              })
            ) : (
              <View style={styles.emptyStateContainer}>
                <MaterialCommunityIcons name="message-text-outline" size={48} color="#9CA3AF" />
                <Text style={styles.emptyStateText}>
                  {selectedLanguage === 'th' ? 'ยังไม่มีประวัติการแก้ไข' : 'No edit history'}
                </Text>
              </View>
            )}

            {/* Current Request - Will be sent (Right) */}
            {(selectedTime && selectedTime !== `${booking?.md_timetable_departuretime} → ${booking?.md_timetable_arrivaltime}${booking?.md_timetable_time ? ` (${booking?.md_timetable_time})` : ''}`) && (
              <View style={styles.chatMessageRight}>
                <View style={styles.chatBubbleRight}>
                  <View style={styles.chatHeader}>
                    <View style={styles.chatIconSmall}>
                      {userImage ? (
                        <Image 
                          source={{ uri: `https://thetrago.com/Api/uploads/member/${userImage}` }}
                          style={styles.chatIconImage}
                          resizeMode="cover"
                        />
                      ) : (
                        <MaterialCommunityIcons name="account-circle" size={20} color="#6B7280" />
                      )}
                    </View>
                    <Text style={styles.chatUsername}>{userName}</Text>
                    <View style={styles.chatBadgePending}>
                      <Text style={styles.chatBadgeText}>pending</Text>
                    </View>
                  </View>
                  <Text style={styles.chatTextRight}>{note || 'ขอเปลี่ยนวันและเวลา'}</Text>
                  <View style={styles.chatDataBox}>
                    <Text style={styles.chatDataLabel}>Before:</Text>
                    <Text style={styles.chatDataText}>
                      {`{"departdate":"${booking?.md_booking_departdate}","departtime":"${booking?.md_timetable_departuretime}"}`}
                    </Text>
                    <Text style={styles.chatDataLabel}>After:</Text>
                    <Text style={styles.chatDataText}>
                      {`{"departdate":"${departureDate.toISOString().split('T')[0]}","departtime":"${selectedTime ? selectedTime.split(' → ')[0] : '-'}"}`}
                    </Text>
                  </View>
                  <Text style={styles.chatTimeRight}>รอส่ง...</Text>
                </View>
              </View>
            )}
          </ScrollView>
        </View>

        {/* Note Modal */}
        <Modal
          visible={showNoteModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowNoteModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContentCenter}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {selectedLanguage === 'th' ? 'หมายเหตุ' : 'Note'}
                </Text>
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={() => setShowNoteModal(false)}
                >
                  <MaterialCommunityIcons name="close" size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.noteInputContainer}>
                <TextInput
                  style={styles.noteInput}
                  placeholder={selectedLanguage === 'th' ? 'กรอกหมายเหตุ (ถ้ามี)' : 'Enter note (optional)'}
                  placeholderTextColor="#9CA3AF"
                  multiline
                  numberOfLines={4}
                  value={note}
                  onChangeText={setNote}
                  textAlignVertical="top"
                />
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={styles.modalConfirmButton}
                  onPress={handleConfirmUpdate}
                >
                  <Text style={styles.modalConfirmText}>
                    {selectedLanguage === 'th' ? 'ยืนยัน' : 'Confirm'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

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
    </View>
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
  notificationBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FD501E',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FD501E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  badgeDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
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
    width: '100%',
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
  debugSection: {
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  debugTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  chatContainer: {
    padding: 16,
    maxHeight: 400,
  },
  chatMessageLeft: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 16,
  },
  chatMessageRight: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 16,
  },
  chatBubbleLeft: {
    backgroundColor: '#DBEAFE',
    borderRadius: 12,
    borderTopLeftRadius: 4,
    padding: 12,
    maxWidth: '75%',
  },
  chatBubbleRight: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    borderTopRightRadius: 4,
    padding: 12,
    maxWidth: '85%',
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  chatIconSmall: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  chatIconImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  chatUsername: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
    marginRight: 8,
    flex: 1,
  },
  chatUsernameLeft: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 8,
  },
  chatBadgeRequest: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  chatBadgeApprove: {
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  chatBadgePending: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  chatBadgeReject: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  chatBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  chatText: {
    fontSize: 14,
    color: '#1F2937',
    marginBottom: 8,
    lineHeight: 20,
  },
  chatTextRight: {
    fontSize: 14,
    color: '#1F2937',
    marginBottom: 8,
    lineHeight: 20,
  },
  chatDataBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 10,
    marginTop: 4,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  dataCompareRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  dataColumn: {
    flex: 1,
    minWidth: 0,
  },
  dataColumnTitle: {
    fontSize: 9,
    fontWeight: '700',
    color: '#6B7280',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  dataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 4,
  },
  dataItemText: {
    fontSize: 11,
    color: '#1F2937',
    fontWeight: '500',
    flex: 1,
    flexWrap: 'wrap',
  },
  dataArrow: {
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  chatDataLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
  },
  chatDataText: {
    fontSize: 11,
    color: '#374151',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginBottom: 8,
  },
  chatTime: {
    fontSize: 11,
    color: '#9CA3AF',
    textAlign: 'left',
  },
  chatTimeRight: {
    fontSize: 11,
    color: '#9CA3AF',
    textAlign: 'right',
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
  noteInputContainer: {
    padding: 20,
  },
  noteInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
    fontSize: 16,
    color: '#1F2937',
    minHeight: 120,
  },
});

export default EditBookingScreen;
