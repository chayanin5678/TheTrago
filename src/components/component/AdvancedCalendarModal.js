// AdvancedCalendarModal.js
import React, { useState, useEffect  } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { CalendarList } from 'react-native-calendars';

const AdvancedCalendarModal = ({ visible, onClose, onConfirm, tripType }) => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [markedDates, setMarkedDates] = useState({});

  useEffect(() => {
    if (visible) {
      setStartDate(null);
      setEndDate(null);
      setMarkedDates({});
    }
  }, [visible]);

  const onDayPress = (day) => {
    if (!startDate || endDate) {
      setStartDate(day.dateString);
      setEndDate(null);
      setMarkedDates({
        [day.dateString]: {
          startingDay: true,
          color: '#FD501E',
          textColor: 'white',
        },
      });
    } else {
      const range = getMarkedDates(startDate, day.dateString);
      setEndDate(day.dateString);
      setMarkedDates(range);
    }
  };

  const getMarkedDates = (start, end) => {
    let dates = {};
    let current = new Date(start);
    const last = new Date(end);

    while (current <= last) {
      const dateStr = current.toISOString().split('T')[0];
      dates[dateStr] = {
        color: '#FD501E',
        textColor: 'white',
      };
      if (dateStr === start) dates[dateStr].startingDay = true;
      if (dateStr === end) dates[dateStr].endingDay = true;
      current.setDate(current.getDate() + 1);
    }
    return dates;
  };

  const handleConfirm = () => {
    if (tripType === 'One Way Trip' && startDate) {
      onConfirm({ departureDate: startDate });
      onClose();
    } else if (tripType === 'Return Trip' && startDate && endDate) {
      onConfirm({ departureDate: startDate, returnDate: endDate });
      onClose();
    } else {
      alert('กรุณาเลือกวันที่ให้ครบ');
    }
  };

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.container}>
        {/* ปุ่มกากบาท */}
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>

        {/* Header แบบ mock */}
        <View style={styles.headerSection}>
          <Text style={styles.headerTitle}>เลือกวันที่</Text>
          <View style={styles.tripDateRow}>
            <View style={styles.dateBox}>
              <Text style={styles.label}>ขาไป</Text>
              <Text style={styles.value}>{startDate || '-'}</Text>
            </View>
            {tripType === 'Return Trip' && (
              <View style={styles.dateBox}>
                <Text style={styles.label}>ขากลับ</Text>
                <Text style={styles.value}>{endDate || '-'}</Text>
              </View>
            )}
          </View>
        </View>

        {/* ปฏิทิน */}
        <CalendarList
          onDayPress={onDayPress}
          markedDates={markedDates}
          markingType={'period'}
          pastScrollRange={0}
          futureScrollRange={6}
          scrollEnabled={true}
          showScrollIndicator={true}
          minDate={new Date().toISOString().split('T')[0]} // ✅ เริ่มเลือกได้ตั้งแต่วันนี้
        />


        <View style={styles.footerButtons}>
          <TouchableOpacity onPress={handleConfirm} style={styles.confirmBtn}>
            <Text style={styles.confirmText}>ยืนยัน</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  closeBtn: {
    position: 'absolute', 
    top: 50, 
    left: 20,
    zIndex: 99,
   // backgroundColor: '#fff',
  //  borderRadius: 30,
     padding: 5, 
   //  elevation: 3
  },
  closeText: { fontSize: 24, color: '#333' },
  headerSection: {
    marginTop: 90,
    paddingHorizontal: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd'
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10
  },
  tripDateRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 20
  },
  dateBox: {
    backgroundColor: '#f2f2f2',
    padding: 10,
    borderRadius: 10,
    flex: 1
  },
  label: { fontSize: 12, color: '#555' },
  value: { fontSize: 16, fontWeight: 'bold', color: '#000' },
  footerButtons: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  confirmBtn: {
    backgroundColor: '#FD501E',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center'
  },
  confirmText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16
  }
});

export default AdvancedCalendarModal;
