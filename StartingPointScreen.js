import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, FlatList } from 'react-native';
import ipAddress from './ipconfig';

const StartingPointScreen = ({ navigation, route }) => {
  const [startingPoint, setStartingPoint] = useState('Phuket');
  const [searchText, setSearchText] = useState('');
  const [filteredStartingPoints, setFilteredStartingPoints] = useState([]);
  const [allStartingPoints, setAllStartingPoints] = useState([]); 
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    fetch(`http://${ipAddress}:5000/start`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        if (data && Array.isArray(data.data)) {
          setAllStartingPoints(data.data); 
          setFilteredStartingPoints(data.data);
        } else {
          console.error('Data is not an array', data);
          setFilteredStartingPoints([]);
        }
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }, []); 

  useEffect(() => {
    if (searchText) {
      const filteredData = allStartingPoints.filter(point =>
        (`${point.md_location_nameeng}, ${point.sys_countries_nameeng}`).toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredStartingPoints(filteredData);
    } else {
      setFilteredStartingPoints(allStartingPoints);
    }
  }, [searchText, allStartingPoints]); 

  const handleSelectStartingPoint = (selectedPoint) => {
    setStartingPoint(selectedPoint);
    setSelectedItem({
      name: selectedPoint.md_location_nameeng,
      id: selectedPoint.md_timetable_startid,
    }); 

    // บันทึกค่าและย้อนกลับหน้าก่อน
    handleSave({
      id: selectedPoint.md_timetable_startid,
      name: selectedPoint.md_location_nameeng,
    });
  };

  const handleSave = (selectedData) => {
    if (route.params?.setStartingPoint && selectedData) {
      route.params.setStartingPoint(selectedData);
    }
    navigation.goBack(); // กลับไปหน้าก่อนหน้า
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={[
        styles.item,
        selectedItem?.id === item.md_timetable_startid && styles.selectedItem,
      ]}
      onPress={() => handleSelectStartingPoint(item)} 
    >
      <Text
        style={[
          styles.itemText,
          selectedItem?.id === item.md_timetable_startid && styles.selectedItemText,
        ]}
      >
        {item.md_location_nameeng + ', ' + item.sys_countries_nameeng}
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
      <Text style={styles.title}>Select Starting Point</Text>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search starting point..."
          value={searchText}
          onChangeText={setSearchText}  
        />
      </View>
      <FlatList
        data={filteredStartingPoints}
        renderItem={renderItem}
        keyExtractor={(item) => item.md_timetable_startid.toString()}
        getItemLayout={getItemLayout}
        style={styles.list}
      />
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
    backgroundColor: '#FD501E',  // Highlight color when selected
  },
  selectedItemText: {
    color: '#fff',  // White color for selected item text
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

export default StartingPointScreen;
