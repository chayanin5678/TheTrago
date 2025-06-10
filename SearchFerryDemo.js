import React, { useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, Modal, TextInput, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Calendar } from 'react-native-calendars';
import { Picker } from '@react-native-picker/picker';

// Utility functions from SearchFerry.js
const formatDateInput = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

function formatNumberWithComma(value) {
  if (!value) return "0.00";
  const formattedValue = Number(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  return formattedValue;
}

const removeHtmlTags = (html) => {
  if (!html) return "";
  return html
    .replace(/<ul>/g, "")
    .replace(/<\/ul>/g, "")
    .replace(/<\/li>/g, "")
    .replace(/<li>/g, "\n• ")
    .replace(/<br\s*\/?/g, "\n\n")
    .replace(/<\/p>/g, "\n\n")
    .replace(/<p>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/<strong>/g, "")
    .replace(/<\/strong>/g, "");
};

const swapPoints = (startingPoint, endPoint, setStartingPoint, setEndPoint) => {
  setStartingPoint(endPoint);
  setEndPoint(startingPoint);
};

const truncateText = (text, maxLength = 10) => {
  if (text.length > maxLength) {
    return text.slice(0, maxLength) + '...';
  }
  return text;
};

function formatTime(time) {
  const [hours, minutes, seconds] = time.split(':');
  const hour = (parseInt(hours) % 12) || 12;
  const period = parseInt(hours) >= 12 ? 'PM' : 'AM';
  return `${hour}:${minutes} ${period}`;
}

function formatTimeToHoursAndMinutes(time) {
  let [hours, minutes] = time.split(':');
  hours = parseInt(hours, 10);
  minutes = parseInt(minutes, 10);
  return `${hours} h ${minutes} min`;
}

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const SearchFerryDemo = () => {
  // State for search UI (mock, not connected to backend)
  const [tripType, setTripType] = useState('One Way Trip');
  const [startingPoint, setStartingPoint] = useState({ id: '0', name: 'Origin' });
  const [endPoint, setEndPoint] = useState({ id: '0', name: 'Destination' });
  const [showModal, setShowModal] = useState(false);
  const [calendarStartDate, setCalendarStartDate] = useState('2025-06-06');
  const [calendarEndDate, setCalendarEndDate] = useState('2025-06-07');
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [isAdultModalVisible, setAdultModalVisible] = useState(false);
  const [isChildModalVisible, setChildModalVisible] = useState(false);

  // Segmented control
  const tripTypes = [
    { label: 'One Way', value: 'One Way Trip' },
    { label: 'Round Trip', value: 'Return Trip' },
  ];

  // Passenger options only (remove class options)
  const adultOptions = Array.from({ length: 10 }, (_, i) => i + 1);
  const childOptions = Array.from({ length: 11 }, (_, i) => i);
  const infantOptions = Array.from({ length: 11 }, (_, i) => i);

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, backgroundColor: '#fff' }}>
      {/* Header Section */}
      <View style={{ backgroundColor: '#7B61FF', borderBottomLeftRadius: 32, borderBottomRightRadius: 32, paddingBottom: 24, paddingTop: 48, paddingHorizontal: 24 }}>
        {/* Logo */}
        <View style={{ alignItems: 'flex-start', marginBottom: 16 }}>
          <Image source={require('./assets/logo.png')} style={{ width: 120, height: 32, resizeMode: 'contain' }} />
        </View>
        {/* Filter/Search Bar */}
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 18, paddingHorizontal: 16, paddingVertical: 8 }}>
          <Icon name="search" size={22} color="#7B61FF" style={{ marginRight: 8 }} />
          <Text style={{ color: '#7B61FF', fontSize: 16, flex: 1 }}>Search...</Text>
          <TouchableOpacity>
            <Icon name="options-outline" size={22} color="#7B61FF" />
          </TouchableOpacity>
        </View>
      </View>
      {/* Segmented Control */}
      <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 24, marginBottom: 12, gap: 10 }}>
        {tripTypes.map((t) => (
          <TouchableOpacity
            key={t.value}
            style={{
              backgroundColor: tripType === t.value ? '#7B61FF' : '#F3EFFF',
              paddingHorizontal: 18,
              paddingVertical: 8,
              borderRadius: 16,
            }}
            onPress={() => setTripType(t.value)}
          >
            <Text style={{ color: tripType === t.value ? '#fff' : '#7B61FF', fontWeight: 'bold', fontSize: 15 }}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {/* Input Card Section (SearchFerry style) */}
      <View style={{ backgroundColor: '#fff', borderRadius: 24, marginHorizontal: 18, marginBottom: 24, padding: 18, shadowColor: '#7B61FF', shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 3 }}>
        {/* From/To Row */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          <TouchableOpacity
            style={{ flex: 1, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, marginRight: 6 }}
            onPress={() => {}}
          >
            <Image source={require('./assets/directions_boat.png')} style={{ width: 20, height: 20, marginRight: 8 }} />
            <View>
              <Text style={{ color: '#7B61FF', fontWeight: 'bold', fontSize: 13 }}>From</Text>
              <Text style={{ color: '#333', fontSize: 15 }}>{truncateText(startingPoint.name, 18)}</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => swapPoints(startingPoint, endPoint, setStartingPoint, setEndPoint)} style={{ padding: 8 }}>
            <Image source={require('./assets/mage_exchange-a.png')} style={{ width: 28, height: 28 }} />
          </TouchableOpacity>
          <TouchableOpacity
            style={{ flex: 1, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, marginLeft: 6 }}
            onPress={() => {}}
          >
            <Image source={require('./assets/location_on.png')} style={{ width: 20, height: 20, marginRight: 8 }} />
            <View>
              <Text style={{ color: '#7B61FF', fontWeight: 'bold', fontSize: 13 }}>To</Text>
              <Text style={{ color: '#333', fontSize: 15 }}>{truncateText(endPoint.name, 18)}</Text>
            </View>
          </TouchableOpacity>
        </View>
        {/* Date Row */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          <TouchableOpacity
            style={{ flex: 1, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 }}
            onPress={() => setShowModal(true)}
          >
            <Icon name="calendar-outline" size={20} color="#7B61FF" style={{ marginRight: 8 }} />
            <View>
              <Text style={{ color: '#7B61FF', fontWeight: 'bold', fontSize: 13 }}>Departure Date</Text>
              <Text style={{ color: '#333', fontSize: 15 }}>{formatDateInput(calendarStartDate)}</Text>
            </View>
          </TouchableOpacity>
          {tripType === 'Return Trip' && (
            <TouchableOpacity
              style={{ flex: 1, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, marginLeft: 8 }}
              onPress={() => setShowModal(true)}
            >
              <Icon name="calendar-outline" size={20} color="#7B61FF" style={{ marginRight: 8 }} />
              <View>
                <Text style={{ color: '#7B61FF', fontWeight: 'bold', fontSize: 13 }}>Return Date</Text>
                <Text style={{ color: '#333', fontSize: 15 }}>{formatDateInput(calendarEndDate)}</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>
        {/* --- Replace old passenger selection row and modal with premium modal --- */}
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TouchableOpacity style={{ flex: 1, borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 }} onPress={() => setAdultModalVisible(true)}>
            <Text style={{ color: '#FD501E', fontWeight: 'bold', fontSize: 13 }}>Passengers</Text>
            <Text style={{ color: '#333', fontSize: 15 }}>{adults} Adult, {children} Child, {infants} Infant</Text>
          </TouchableOpacity>
        </View>
        <Modal visible={isAdultModalVisible} transparent animationType="slide" onRequestClose={() => setAdultModalVisible(false)}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ backgroundColor: '#fff', borderRadius: 20, padding: 28, width: '88%', shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 8 }}>
              <Text style={{ fontWeight: 'bold', fontSize: 20, marginBottom: 22, color: '#FD501E', textAlign: 'center', letterSpacing: 0.5 }}>Select Passengers</Text>
              <View style={{ marginBottom: 18, gap: 18 }}>
                {/* Adults */}
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFF3ED', borderRadius: 12, paddingVertical: 10, paddingHorizontal: 16, marginBottom: 8, shadowColor: '#FD501E', shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 }}>
                  <Text style={{ color: '#FD501E', fontWeight: 'bold', fontSize: 16, minWidth: 80 }}>Adults</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity onPress={() => setAdults(Math.max(1, adults - 1))} style={{ padding: 6, borderRadius: 20, backgroundColor: adults > 1 ? '#FFE1D3' : '#FFF3ED' }}>
                      <Icon name="remove-circle" size={28} color={adults > 1 ? '#FD501E' : '#BDBDBD'} />
                    </TouchableOpacity>
                    <Text style={{ fontSize: 20, fontWeight: 'bold', marginHorizontal: 18, minWidth: 28, textAlign: 'center', color: '#333' }}>{adults}</Text>
                    <TouchableOpacity onPress={() => setAdults(Math.min(10, adults + 1))} style={{ padding: 6, borderRadius: 20, backgroundColor: adults < 10 ? '#FFE1D3' : '#FFF3ED' }}>
                      <Icon name="add-circle" size={28} color={adults < 10 ? '#FD501E' : '#BDBDBD'} />
                    </TouchableOpacity>
                  </View>
                </View>
                {/* Children */}
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFF3ED', borderRadius: 12, paddingVertical: 10, paddingHorizontal: 16, marginBottom: 8, shadowColor: '#FD501E', shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 }}>
                  <Text style={{ color: '#FD501E', fontWeight: 'bold', fontSize: 16, minWidth: 80 }}>Children</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity onPress={() => setChildren(Math.max(0, children - 1))} style={{ padding: 6, borderRadius: 20, backgroundColor: children > 0 ? '#FFE1D3' : '#FFF3ED' }}>
                      <Icon name="remove-circle" size={28} color={children > 0 ? '#FD501E' : '#BDBDBD'} />
                    </TouchableOpacity>
                    <Text style={{ fontSize: 20, fontWeight: 'bold', marginHorizontal: 18, minWidth: 28, textAlign: 'center', color: '#333' }}>{children}</Text>
                    <TouchableOpacity onPress={() => setChildren(Math.min(10, children + 1))} style={{ padding: 6, borderRadius: 20, backgroundColor: children < 10 ? '#FFE1D3' : '#FFF3ED' }}>
                      <Icon name="add-circle" size={28} color={children < 10 ? '#FD501E' : '#BDBDBD'} />
                    </TouchableOpacity>
                  </View>
                </View>
                {/* Infants */}
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFF3ED', borderRadius: 12, paddingVertical: 10, paddingHorizontal: 16, shadowColor: '#FD501E', shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 }}>
                  <Text style={{ color: '#FD501E', fontWeight: 'bold', fontSize: 16, minWidth: 80 }}>Infants</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity onPress={() => setInfants(Math.max(0, infants - 1))} style={{ padding: 6, borderRadius: 20, backgroundColor: infants > 0 ? '#FFE1D3' : '#FFF3ED' }}>
                      <Icon name="remove-circle" size={28} color={infants > 0 ? '#FD501E' : '#BDBDBD'} />
                    </TouchableOpacity>
                    <Text style={{ fontSize: 20, fontWeight: 'bold', marginHorizontal: 18, minWidth: 28, textAlign: 'center', color: '#333' }}>{infants}</Text>
                    <TouchableOpacity onPress={() => setInfants(Math.min(10, infants + 1))} style={{ padding: 6, borderRadius: 20, backgroundColor: infants < 10 ? '#FFE1D3' : '#FFF3ED' }}>
                      <Icon name="add-circle" size={28} color={infants < 10 ? '#FD501E' : '#BDBDBD'} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
              <TouchableOpacity onPress={() => setAdultModalVisible(false)} style={{ backgroundColor: '#FD501E', borderRadius: 10, padding: 14, alignItems: 'center', marginTop: 8, shadowColor: '#FD501E', shadowOpacity: 0.12, shadowRadius: 6, elevation: 2 }}>
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16, letterSpacing: 0.5 }}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        {/* --- End premium modal replacement --- */}
      </View>
      {/* Modals for date, passenger */}
      <Modal visible={showModal} transparent animationType="slide" onRequestClose={() => setShowModal(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.2)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 24, width: '90%' }}>
            <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 16 }}>Select Date</Text>
            <Text style={{ color: '#FD501E', marginBottom: 8 }}>Departure Date</Text>
            <Calendar
              current={calendarStartDate}
              minDate={new Date().toISOString().split('T')[0]}
              onDayPress={day => {
                setCalendarStartDate(day.dateString);
                if (tripType === 'Return Trip' && calendarEndDate < day.dateString) {
                  setCalendarEndDate(day.dateString);
                }
                // Do NOT close the modal here
              }}
              markedDates={{
                [calendarStartDate]: { selected: true, selectedColor: '#FD501E' }
              }}
            />
            {tripType === 'Return Trip' && (
              <>
                <Text style={{ color: '#FD501E', marginVertical: 8 }}>Return Date</Text>
                <Calendar
                  current={calendarEndDate}
                  minDate={calendarStartDate}
                  onDayPress={day => {
                    setCalendarEndDate(day.dateString);
                    // Do NOT close the modal here
                  }}
                  markedDates={{
                    [calendarEndDate]: { selected: true, selectedColor: '#FD501E' }
                  }}
                />
              </>
            )}
            <TouchableOpacity onPress={() => setShowModal(false)} style={{ backgroundColor: '#FD501E', borderRadius: 8, padding: 12, alignItems: 'center', marginTop: 16 }}>
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default SearchFerryDemo;
