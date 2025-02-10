import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet } from 'react-native';

const CustomModalPicker = () => {
  const [selectedValue, setSelectedValue] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const options = [
    { label: "ตัวเลือกที่ 1", value: "option1" },
    { label: "ตัวเลือกที่ 2", value: "option2" },
    { label: "ตัวเลือกที่ 3", value: "option3" },
  ];

  const handleSelect = (item) => {
    setSelectedValue(item.value);
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>เลือกตัวเลือก:</Text>
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.buttonText}>
          {selectedValue ? options.find(opt => opt.value === selectedValue)?.label : "กรุณาเลือก"}
        </Text>
      </TouchableOpacity>

      {/* Modal Picker */}
      <Modal 
        transparent={true} 
        animationType="slide" 
        visible={modalVisible} 
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <FlatList
              data={options}
              keyExtractor={(item, index) => `option-${index}`}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.option} 
                  onPress={() => handleSelect(item)}
                >
                  <Text style={styles.optionText}>{item.label}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  button: {
    borderWidth: 1,
    borderColor: '#FD501E',
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#FFF',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    color: '#000',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: 250,
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 15,
  },
  option: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  optionText: {
    fontSize: 16,
  },
});

export default CustomModalPicker;
