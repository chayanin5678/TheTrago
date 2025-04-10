import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, FlatList, ActivityIndicator } from 'react-native';
import ipAddress from './ipconfig';

const EndPointScreen = ({ navigation, route }) => {
  const [searchText, setSearchText] = useState('');
  const [filteredEndPoints, setFilteredEndPoints] = useState([]);
  const [allEndPoints, setAllEndPoints] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(true);
  // รับค่า startingPointId จาก route.params
  const startingPointId = route.params?.startingPointId;

  useEffect(() => {
    if (!startingPointId) {
      console.error("No startingPointId provided");
      return;
    }

    fetch(`${ipAddress}/end/${startingPointId}`)
      .then((response) => response.json())
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
      }).finally(() => {
        setLoading(false);  // ตั้งค่า loading เป็น false หลังจากทำงานเสร็จ
      });
  }, [startingPointId]);

  useEffect(() => {
    if (searchText) {
      const filteredData = allEndPoints.filter(point =>
        (`${point.md_location_nameeng}, ${point.sys_countries_nameeng}`)
          .toLowerCase()
          .includes(searchText.toLowerCase())
      );
      setFilteredEndPoints(filteredData);
    } else {
      setFilteredEndPoints(allEndPoints);
    }
  }, [searchText, allEndPoints]);

  const handleSelectEndPoint = (selectedPoint) => {
    setSelectedItem({
      name: selectedPoint.md_location_nameeng,
      id: selectedPoint.md_timetable_endid,
    });

    // บันทึกค่าและย้อนกลับทันที
    handleSave({
      id: selectedPoint.md_timetable_endid,
      name: selectedPoint.md_location_nameeng,
    });
  };

  const handleSave = (selectedData) => {
    if (route.params?.setEndPoint && selectedData) {
      route.params.setEndPoint(selectedData);
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
        {item.md_location_nameeng + ', ' + item.sys_countries_nameeng}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Destination</Text>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search Destination..."
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>
      {loading && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#FD501E" />
        </View>
      )}
      {!loading && allEndPoints && filteredEndPoints && (
        <FlatList
          data={filteredEndPoints}
          renderItem={renderItem}
          keyExtractor={(item) => item.md_timetable_endid.toString()}
          style={styles.list}
        />
      )}
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
  loaderContainer: {
    flex: 1, // ทำให้ View ครอบคลุมพื้นที่ทั้งหมด
    justifyContent: 'center', // จัดตำแหน่งแนวตั้งให้อยู่ตรงกลาง
    alignItems: 'center', // จัดตำแหน่งแนวนอนให้อยู่ตรงกลาง
  },
});

export default EndPointScreen;
