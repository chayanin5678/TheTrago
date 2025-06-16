import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Animated, Easing } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const passengerOptions = [
  { label: '1 Passenger', value: 1 },
  { label: '2 Passengers', value: 2 },
  { label: '3 Passengers', value: 3 },
  { label: '4 Passengers', value: 4 },
  { label: '5 Passengers', value: 5 },
];

const PassengerSelectBox = ({ selectedPassenger, setSelectedPassenger, label = 'Passenger' }) => {
  const [passengerModal, setPassengerModal] = useState(false);
  const borderAnim = useRef(new Animated.Value(0)).current;
  const chevronAnim = useRef(new Animated.Value(0)).current;
  const [modalOpacity] = useState(new Animated.Value(0));

  const openPassengerModal = () => {
    modalOpacity.setValue(0);
    Animated.parallel([
      Animated.timing(borderAnim, { toValue: 1, duration: 220, useNativeDriver: false, easing: Easing.out(Easing.ease) }),
      Animated.timing(chevronAnim, { toValue: 1, duration: 220, useNativeDriver: false, easing: Easing.out(Easing.ease) }),
      Animated.timing(modalOpacity, { toValue: 1, duration: 180, useNativeDriver: false }),
    ]).start();
    setPassengerModal(true);
  };
  const closePassengerModal = () => {
    Animated.parallel([
      Animated.timing(borderAnim, { toValue: 0, duration: 220, useNativeDriver: false, easing: Easing.out(Easing.ease) }),
      Animated.timing(chevronAnim, { toValue: 0, duration: 220, useNativeDriver: false, easing: Easing.out(Easing.ease) }),
      Animated.timing(modalOpacity, { toValue: 0, duration: 180, useNativeDriver: false }),
    ]).start(() => setPassengerModal(false));
  };
  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#BDBDBD', '#7B61FF'],
  });
  const chevronRotate = chevronAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <View style={{ marginVertical: 8 }}>
      <Animated.View
        style={{
          borderWidth: 0,
          borderRadius: 14,
          backgroundColor: '#fff',
          height: 50,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 20,
          borderBottomWidth: 2,
          borderBottomColor: borderColor,
        }}
      >
        <TouchableOpacity
          style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}
          onPress={openPassengerModal}
          activeOpacity={0.85}
        >
          <Text style={{ color: selectedPassenger ? '#333' : '#BDBDBD', fontSize: 17, flex: 1, fontWeight: '500' }} numberOfLines={1}>
            {selectedPassenger ? selectedPassenger.label : label}
          </Text>
          <Animated.View style={{ marginLeft: 8, transform: [{ rotate: chevronRotate }] }}>
            <Icon name="chevron-down" size={26} color={passengerModal ? '#7B61FF' : '#757575'} />
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>
      <Modal
        visible={passengerModal}
        transparent
        animationType="none"
        onRequestClose={closePassengerModal}
      >
        <Animated.View
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.13)', justifyContent: 'center', alignItems: 'center', opacity: modalOpacity }}
        >
          <View style={{ backgroundColor: '#fff', borderRadius: 16, width: '82%', paddingVertical: 8, borderWidth: 0, shadowColor: '#000', shadowOpacity: 0.10, shadowRadius: 12, elevation: 8 }}>
            {passengerOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={{ paddingVertical: 15, paddingHorizontal: 22, borderRadius: 10, marginHorizontal: 6, marginVertical: 2, backgroundColor: selectedPassenger.value === option.value ? '#F3EFFF' : 'transparent' }}
                activeOpacity={0.7}
                onPress={() => {
                  setSelectedPassenger(option);
                  closePassengerModal();
                }}
              >
                <Text style={{ fontSize: 17, color: selectedPassenger.value === option.value ? '#7B61FF' : '#333', fontWeight: selectedPassenger.value === option.value ? 'bold' : 'normal' }}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      </Modal>
    </View>
  );
};

export default PassengerSelectBox;
