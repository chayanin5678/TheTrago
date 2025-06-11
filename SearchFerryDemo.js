import React, { useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, Modal } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Calendar } from 'react-native-calendars';

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    weekday: 'short', day: '2-digit', month: 'short', year: 'numeric',
  });
};
function formatNumberWithComma(value) {
  if (!value) return '0.00';
  const formattedValue = Number(value).toLocaleString('en-US', {
    minimumFractionDigits: 2, maximumFractionDigits: 2
  });
  return formattedValue;
}

const FlightDetail = () => {
  const [showModal, setShowModal] = useState(false);
  const [calendarStartDate, setCalendarStartDate] = useState('2024-06-15');

  // Mock flight data
  const flight = {
    airlineLogo: 'https://upload.wikimedia.org/wikipedia/commons/e/e8/Emirates_logo.svg',
    airline: 'Emirates',
    price: 1700,
    fromCode: 'LDN',
    toCode: 'JTR',
    from: 'London',
    to: 'Santorini',
    departTime: '9.00',
    arriveTime: '12:00',
    date: calendarStartDate,
    duration: '3h 10 Min',
    amenities: [
      { icon: 'ios-briefcase', label: 'Cabin bag x1', value: '$50 up to 5 kg' },
      { icon: 'ios-briefcase', label: 'Baggage x1', value: '$100 up to 20 kg' },
      { icon: 'ios-checkmark-circle', label: 'Cancellation', value: 'Refundable' },
      { icon: 'ios-sync', label: 'Reschedule', value: 'Available' },
      { icon: 'ios-calendar', label: 'Date change', value: 'Fee starting $45' },
    ],
    gate: 'A12',
    flightNumber: 'EK109',
    class: 'Business',
    isDirect: true,
    isNonStop: true,
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, backgroundColor: '#F3F4F8' }}>
      {/* Header */}
      <View style={{ backgroundColor: 'linear-gradient(180deg, #7B61FF 0%, #A084FF 100%)', borderBottomLeftRadius: 40, borderBottomRightRadius: 40, paddingBottom: 36, paddingTop: 60, paddingHorizontal: 24, shadowColor: '#7B61FF', shadowOpacity: 0.22, shadowRadius: 24, elevation: 10 }}>
        <TouchableOpacity onPress={() => {}} style={{ position: 'absolute', left: 18, top: 60, zIndex: 2 }}>
          <Icon name="arrow-back" size={30} color="#fff" />
        </TouchableOpacity>
        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 28, textAlign: 'center', marginBottom: 6, letterSpacing: 0.7, textShadowColor: '#6A4FFF', textShadowOffset: {width: 0, height: 2}, textShadowRadius: 8 }}>Flight Details</Text>
      </View>
      {/* Flight Card */}
      <View style={{ backgroundColor: '#fff', borderRadius: 28, marginHorizontal: 18, marginTop: -44, marginBottom: 24, padding: 26, shadowColor: '#7B61FF', shadowOpacity: 0.16, shadowRadius: 20, shadowOffset: { width: 0, height: 10 }, elevation: 7 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 18 }}>
          <Image source={{ uri: flight.airlineLogo }} style={{ width: 52, height: 52, borderRadius: 16, marginRight: 16, backgroundColor: '#eee' }} />
          <Text style={{ fontWeight: 'bold', fontSize: 20, color: '#333', flex: 1 }}>{flight.airline}</Text>
          <Text style={{ color: '#7B61FF', fontWeight: 'bold', fontSize: 20 }}>${formatNumberWithComma(flight.price)},00</Text>
          <Text style={{ color: '#BDBDBD', fontSize: 15, marginLeft: 3 }}>/pax</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <View style={{ alignItems: 'center', flex: 1 }}>
            <Text style={{ color: '#7B61FF', fontWeight: 'bold', fontSize: 26 }}>{flight.fromCode}</Text>
            <Text style={{ color: '#333', fontSize: 15 }}>{flight.from}</Text>
            <Text style={{ color: '#333', fontSize: 22, fontWeight: 'bold', marginTop: 2 }}>{flight.departTime}</Text>
          </View>
          <View style={{ alignItems: 'center', flex: 1 }}>
            <View style={{ backgroundColor: '#F3EFFF', borderRadius: 50, padding: 10, marginBottom: 2, borderWidth: 2, borderColor: '#A084FF' }}>
              <Icon name="airplane" size={36} color="#7B61FF" />
            </View>
            <Text style={{ color: '#7B61FF', fontWeight: 'bold', fontSize: 15 }}>{flight.isDirect ? 'Direct' : ''}</Text>
          </View>
          <View style={{ alignItems: 'center', flex: 1 }}>
            <Text style={{ color: '#7B61FF', fontWeight: 'bold', fontSize: 26 }}>{flight.toCode}</Text>
            <Text style={{ color: '#333', fontSize: 15 }}>{flight.to}</Text>
            <Text style={{ color: '#333', fontSize: 22, fontWeight: 'bold', marginTop: 2 }}>{flight.arriveTime}</Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
          <Icon name="calendar-outline" size={20} color="#7B61FF" style={{ marginRight: 8 }} />
          <Text style={{ color: '#7B61FF', fontSize: 16 }}>{formatDate(flight.date)}</Text>
          <Icon name="time-outline" size={20} color="#7B61FF" style={{ marginLeft: 16, marginRight: 6 }} />
          <Text style={{ color: '#7B61FF', fontSize: 16 }}>{flight.duration}</Text>
        </View>
      </View>
      {/* Flight Amenities */}
      <View style={{ backgroundColor: '#fff', borderRadius: 28, marginHorizontal: 18, marginBottom: 28, padding: 26, shadowColor: '#7B61FF', shadowOpacity: 0.12, shadowRadius: 14, elevation: 4 }}>
        <Text style={{ fontWeight: 'bold', color: '#7B61FF', fontSize: 21, marginBottom: 18, letterSpacing: 0.2 }}>Flight Amenities</Text>
        <View style={{ backgroundColor: '#F6F6F6', borderRadius: 18, padding: 20, marginBottom: 18, borderWidth: 1, borderColor: '#F3EFFF', shadowColor: '#A084FF', shadowOpacity: 0.06, shadowRadius: 6, elevation: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <Icon name="airplane" size={24} color="#7B61FF" style={{ marginRight: 12 }} />
            <Text style={{ fontWeight: 'bold', fontSize: 18, color: '#333', flex: 1 }}>Original</Text>
            <Text style={{ color: '#7B61FF', fontWeight: 'bold', fontSize: 18 }}>${formatNumberWithComma(flight.price)},00</Text>
            <Text style={{ color: '#BDBDBD', fontSize: 15, marginLeft: 3 }}>/pax</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#7B61FF', fontWeight: 'bold', fontSize: 17 }}>9.00 am</Text>
              <Text style={{ color: '#333', fontSize: 15 }}>London City Airport (LCY)</Text>
            </View>
            <View style={{ alignItems: 'center', flex: 0.5 }}>
              <Icon name="swap-vertical" size={24} color="#BDBDBD" style={{ marginBottom: 2 }} />
              <Text style={{ color: '#BDBDBD', fontSize: 15 }}>{flight.isNonStop ? 'Non - stop' : ''}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#7B61FF', fontWeight: 'bold', fontSize: 17 }}>12:00 pm</Text>
              <Text style={{ color: '#333', fontSize: 15 }}>Naxos Island National Airport (JNX)</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 14 }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: '#BDBDBD', fontSize: 15 }}>Gate</Text>
              <Text style={{ color: '#7B61FF', fontWeight: 'bold', fontSize: 17 }}>{flight.gate}</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: '#BDBDBD', fontSize: 15 }}>Flight Number</Text>
              <Text style={{ color: '#7B61FF', fontWeight: 'bold', fontSize: 17 }}>{flight.flightNumber}</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: '#BDBDBD', fontSize: 15 }}>Class</Text>
              <Text style={{ color: '#7B61FF', fontWeight: 'bold', fontSize: 17 }}>{flight.class}</Text>
            </View>
          </View>
        </View>
        {/* Amenities List */}
        {flight.amenities.map((item, idx) => (
          <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <Icon name={item.icon} size={22} color="#7B61FF" style={{ marginRight: 14 }} />
            <Text style={{ color: '#333', fontSize: 17, flex: 1 }}>{item.label}</Text>
            <Text style={{ color: '#7B61FF', fontWeight: 'bold', fontSize: 17 }}>{item.value}</Text>
          </View>
        ))}
      </View>
      {/* Date Modal */}
      <Modal visible={showModal} transparent animationType="slide" onRequestClose={() => setShowModal(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.2)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 24, padding: 36, width: '90%' }}>
            <Text style={{ fontWeight: 'bold', fontSize: 24, marginBottom: 24, color: '#7B61FF', textAlign: 'center' }}>Select Date</Text>
            <Text style={{ color: '#7B61FF', marginBottom: 16, fontSize: 18, textAlign: 'center' }}>Departure Date</Text>
            <Calendar
              current={calendarStartDate}
              minDate={new Date().toISOString().split('T')[0]}
              onDayPress={day => {
                setCalendarStartDate(day.dateString);
              }}
              markedDates={{
                [calendarStartDate]: { selected: true, selectedColor: '#7B61FF' }
              }}
            />
            <TouchableOpacity onPress={() => setShowModal(false)} style={{ backgroundColor: '#7B61FF', borderRadius: 16, padding: 18, alignItems: 'center', marginTop: 28 }}>
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default FlightDetail;
