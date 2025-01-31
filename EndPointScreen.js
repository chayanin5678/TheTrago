import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, FlatList } from 'react-native';
import ipAddress from './ipconfig';

const EndPointScreen = ({ navigation, route }) => {
  const [endPoint, setEndPoint] = useState('');
  const [searchText, setSearchText] = useState('');
  const [filteredEndPoints, setFilteredEndPoints] = useState([]);
  const [allEndPoints, setAllEndPoints] = useState([]); // Store original data
  const [selectedItem, setSelectedItem] = useState(null);

  // รับค่า startingPointId จาก route.params
  const startingPointId = route.params?.startingPointId; // ตรวจสอบว่าได้ค่าหรือไม่

  // ตรวจสอบว่ามี startingPointId หรือไม่
  useEffect(() => {
    if (!startingPointId) {
      console.error("No startingPointId provided");
      return; // หยุดการทำงานหากไม่ได้ค่า startingPointId
    }

    fetch(`http://${ipAddress}:5000/end/${startingPointId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        if (data && Array.isArray(data.data)) {
          setAllEndPoints(data.data);
          setFilteredEndPoints(data.data);
        } else {
          console.error('Data is not an array', data);
          setFilteredEndPoints([]);
        }
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }, [startingPointId]); // Re-run effect when startingPointId changes

  useEffect(() => {
    if (searchText) {
      const filteredData = allEndPoints.filter(point =>
        point.md_location_nameeng.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredEndPoints(filteredData);
    } else {
      setFilteredEndPoints(allEndPoints);  // Reset list if search text is empty
    }
  }, [searchText, allEndPoints]);

  const handleSelectEndPoint = (selectedPoint) => {
    setEndPoint(selectedPoint);
    setSelectedItem({
      name: selectedPoint.md_location_nameeng,
      id: selectedPoint.md_timetable_endid,
    });
    setSearchText('');  // Clear search text after selection
  };

  const handleSave = () => {
    if (route.params?.setEndPoint && selectedItem) {
      route.params.setEndPoint({
        id: selectedItem.id,
        name: selectedItem.name,
      });
    }
    navigation.goBack();
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.item,
        selectedItem?.id === item.md_timetable_endid && styles.selectedItem,
      ]}
      onPress={() => handleSelectEndPoint(item)}
    >
      <Text
        style={[
          styles.itemText,
          selectedItem?.id === item.md_timetable_endid && styles.selectedItemText,
        ]}
      >
        {item.md_location_nameeng} {/* Ensure this is wrapped in <Text> */}
      </Text>
    </TouchableOpacity>
  );

  const getItemLayout = (data, index) => ({
    length: 60,
    offset: 60 * index,
    index,
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select End Point</Text>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search end point..."
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>
      <FlatList
        data={filteredEndPoints}
        renderItem={renderItem}
        keyExtractor={(item) => item.md_timetable_endid.toString()}
        getItemLayout={getItemLayout}
        style={styles.list}
      />
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 30,
  },
  searchContainer: {
    width: '100%',
    marginBottom: 20,
  },
  searchInput: {
    width: '100%',
    height: 50,
    backgroundColor: '#f6f6f6',
    borderRadius: 10,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  list: {
    width: '100%',
    marginTop: 20,
  },
  item: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#f6f6f6',
    borderRadius: 10,
    marginBottom: 10,
  },
  selectedItem: {
    backgroundColor: '#FD501E',
  },
  selectedItemText: {
    color: '#fff',
  },
  itemText: {
    fontSize: 16,
    color: '#333',
  },
  saveButton: {
    backgroundColor: '#FD501E',
    paddingVertical: 15,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default EndPointScreen;
