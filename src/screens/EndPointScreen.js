import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, FlatList, ActivityIndicator, SafeAreaView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AntDesign, MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguage } from './Screen/LanguageContext';
import axios from 'axios';
import ipAddress from '../config/ipconfig';

const EndPointScreen = ({ navigation, route }) => {
  const { t, selectedLanguage } = useLanguage();
  const insets = useSafeAreaInsets();
  const { startingPointId } = route.params || {};
  const [searchText, setSearchText] = useState('');
  const [allDestinations, setAllDestinations] = useState([]);
  const [filteredDestinations, setFilteredDestinations] = useState([]);
  const [allEndPoints, setAllEndPoints] = useState([]);
  const [filteredEndPoints, setFilteredEndPoints] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!startingPointId) {
      setFilteredEndPoints([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(`${ipAddress}/end/${startingPointId}`)
      .then((response) => response.json())
      .then((data) => {
        if (data && Array.isArray(data.data)) {
          setAllEndPoints(data.data);
          setFilteredEndPoints(data.data);
        } else {
          setFilteredEndPoints([]);
        }
      })
      .catch((error) => {
        setFilteredEndPoints([]);
      })
      .finally(() => setLoading(false));
  }, [startingPointId]);

  useEffect(() => {
    if (searchText) {
      const locationNameField = selectedLanguage === 'th' ? 'md_location_namethai' : 'md_location_nameeng';
      const countryNameField = selectedLanguage === 'th' ? 'sys_countries_namethai' : 'sys_countries_nameeng';
      
      const filteredData = allEndPoints.filter(point =>
        (`${point[locationNameField]}, ${point[countryNameField]}`)
          .toLowerCase()
          .includes(searchText.toLowerCase())
      );
      setFilteredEndPoints(filteredData);
    } else {
      setFilteredEndPoints(allEndPoints);
    }
  }, [searchText, allEndPoints, selectedLanguage]);

  const handleSelectEndPoint = (selectedPoint) => {
    const locationNameField = selectedLanguage === 'th' ? 'md_location_namethai' : 'md_location_nameeng';
    
    setSelectedItem({
      name: selectedPoint[locationNameField],
      id: selectedPoint.md_timetable_endid,
    });
    if (route.params?.setEndPoint) {
      route.params.setEndPoint({
        id: selectedPoint.md_timetable_endid,
        name: selectedPoint[locationNameField],
      });
    }
    navigation.goBack();
  };

  // Dummy airline/plane for demo UI (replace with real data if available)
  const getSubText = (item) => {
    const countryNameField = selectedLanguage === 'th' ? 'sys_countries_namethai' : 'sys_countries_nameeng';
    return item.airline || item.plane || item[countryNameField] || '';
  };

  const renderItem = ({ item, index }) => {
    const locationNameField = selectedLanguage === 'th' ? 'md_location_namethai' : 'md_location_nameeng';
    const countryNameField = selectedLanguage === 'th' ? 'sys_countries_namethai' : 'sys_countries_nameeng';
    
    return (
      <TouchableOpacity
        style={styles.suggestionItem}
        onPress={() => handleSelectEndPoint(item)}
        activeOpacity={0.8}
      >
        <View style={styles.suggestionIconBox}>
          <MaterialIcons name="location-on" size={22} color="#FD501E" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.suggestionTitle}>{item[locationNameField]} - {item[countryNameField]}</Text>
          <Text style={styles.suggestionSub}>{getSubText(item)}</Text>
        </View>
        <AntDesign name="right" size={18} color="#B7B7B7" />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView 
      style={[
        { flex: 1, backgroundColor: '#fff' },
        Platform.OS === 'android' && Platform.Version >= 31 && {
          paddingTop: 0, // ใช้ insets แทน
        }
      ]}
    >
      {/* Header รองรับ Android 15 Edge-to-Edge */}
      <LinearGradient 
        colors={["#FD501E", "#FF7B3E"]} 
        style={[
          styles.headerBg,
          Platform.OS === 'android' && Platform.Version >= 31 && {
            paddingTop: insets.top, // เพิ่ม padding สำหรับ status bar
          }
        ]}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <AntDesign name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('selectDestination')}</Text>
        </View>
        
        {/* Search Bar */}
        <View style={styles.searchBarWrap}>
          <AntDesign name="search" size={20} color="#B7B7B7" style={{ marginLeft: 14, marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('searchCityOrAirport')}
            placeholderTextColor="#B7B7B7"
            value={searchText}
            onChangeText={setSearchText}
            underlineColorAndroid="transparent"
          />
        </View>
      </LinearGradient>

      {/* Main Content */}
      <View style={{ flex: 1, backgroundColor: '#F7F7FA', borderTopLeftRadius: 32, borderTopRightRadius: 32, marginTop: 44, paddingTop: 32 }}>
        <Text style={styles.suggestionLabel}>
          {t('suggestion')}
        </Text>
        {loading ? (
          <ActivityIndicator size="large" color="#FD501E" style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={filteredEndPoints}
            renderItem={renderItem}
            keyExtractor={item => item.md_timetable_endid.toString()}
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
    minHeight: 160,
    justifyContent: 'flex-end',
    marginTop: Platform.OS === 'ios' ? -50 : 0,
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

export default EndPointScreen;
