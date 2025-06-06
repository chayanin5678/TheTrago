import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, ActivityIndicator, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AntDesign, MaterialIcons } from '@expo/vector-icons';
import ipAddress from './ipconfig';

const StartingPointScreen = ({ navigation, route }) => {
  const [searchText, setSearchText] = useState('');
  const [filteredStartingPoints, setFilteredStartingPoints] = useState([]);
  const [allStartingPoints, setAllStartingPoints] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`${ipAddress}/start`)
      .then((response) => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
      })
      .then((data) => {
        if (data && Array.isArray(data.data)) {
          setAllStartingPoints(data.data);
          setFilteredStartingPoints(data.data);
        } else {
          setFilteredStartingPoints([]);
        }
      })
      .catch((error) => {
        setFilteredStartingPoints([]);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (searchText) {
      const filteredData = allStartingPoints.filter(point =>
        (`${point.md_location_nameeng}, ${point.sys_countries_nameeng}`.toLowerCase().includes(searchText.toLowerCase()))
      );
      setFilteredStartingPoints(filteredData);
    } else {
      setFilteredStartingPoints(allStartingPoints);
    }
  }, [searchText, allStartingPoints]);

  const handleSelectStartingPoint = (selectedPoint) => {
    setSelectedItem({
      name: selectedPoint.md_location_nameeng,
      id: selectedPoint.md_location_id,
      countryId: selectedPoint.md_location_countriesid,
    });
    if (route.params?.setStartingPoint) {
      route.params.setStartingPoint({
        id: selectedPoint.md_location_id,
        name: selectedPoint.md_location_nameeng,
        countryId: selectedPoint.md_location_countriesid,
      });
    }
    if (navigation.canGoBack()) navigation.goBack();
  };

  // Dummy airline/plane for demo UI (replace with real data if available)
  const getSubText = (item) => item.airline || item.plane || item.sys_countries_nameeng || '';

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => handleSelectStartingPoint(item)}
      activeOpacity={0.8}
    >
      <View style={styles.suggestionIconBox}>
        <MaterialIcons name="location-on" size={22} color="#FD501E" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.suggestionTitle}>{item.md_location_nameeng} - {item.sys_countries_nameeng}</Text>
        <Text style={styles.suggestionSub}>{getSubText(item)}</Text>
      </View>
      <AntDesign name="right" size={18} color="#B7B7B7" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <LinearGradient colors={["#FD501E", "#FF7B3E"]} style={styles.headerBg}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <AntDesign name="arrowleft" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Select Starting Point</Text>
        </View>
        <View style={styles.searchBarWrap}>
          <AntDesign name="search1" size={20} color="#B7B7B7" style={{ marginLeft: 14, marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search city or airport"
            placeholderTextColor="#B7B7B7"
            value={searchText}
            onChangeText={setSearchText}
            underlineColorAndroid="transparent"
          />
        </View>
      </LinearGradient>
      <View style={{ flex: 1, backgroundColor: '#F7F7FA', borderTopLeftRadius: 32, borderTopRightRadius: 32, marginTop: 44, paddingTop: 32 }}>
        <Text style={styles.suggestionLabel}>Suggestion</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#FD501E" style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={filteredStartingPoints}
            renderItem={renderItem}
            keyExtractor={item => item.md_location_id.toString()}
            contentContainerStyle={{ paddingBottom: 24 }}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  headerBg: {
    paddingTop: 0,
    paddingBottom: 32,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    minHeight: 140,
    justifyContent: 'flex-end',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 12,
    paddingHorizontal: 18,
  },
  backBtn: {
    padding: 6,
    marginRight: 8,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    marginRight: 32,
  },
  searchBarWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 18,
    marginBottom: -24,
    marginTop: 0,
    height: 48,
    shadowColor: '#FD501E',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#222',
    backgroundColor: 'transparent',
    paddingVertical: 0,
    paddingHorizontal: 0,
    height: 48,
  },
  suggestionSection: {
    flex: 1,
    backgroundColor: '#F7F7FA',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -16,
    paddingTop: 32,
    paddingHorizontal: 0,
  },
  suggestionLabel: {
    fontSize: 16,
    color: '#FD501E',
    fontWeight: 'bold',
    marginLeft: 28,
    marginBottom: 8,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 18,
    marginBottom: 10,
    paddingVertical: 16,
    paddingHorizontal: 16,
    shadowColor: '#FD501E',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  suggestionIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF3ED',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  suggestionTitle: {
    fontSize: 16,
    color: '#222',
    fontWeight: 'bold',
  },
  suggestionSub: {
    fontSize: 13,
    color: '#B7B7B7',
    marginTop: 2,
  },
});

export default StartingPointScreen;
