import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, FlatList, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { AntDesign, MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';
import ipAddress from '../config/ipconfig';
import styles from '../styles/CSS/StartingPointScreenStyles';
import { useLanguage } from './Screen/LanguageContext';

const StartingPointScreen = ({ navigation, route }) => {
  const { t, selectedLanguage } = useLanguage();
  const insets = useSafeAreaInsets();
  const [provinces, setProvinces] = useState([]);
  const [filteredProvinces, setFilteredProvinces] = useState([]);
  const [allStartingPoints, setAllStartingPoints] = useState([]);
  const [filteredStartingPoints, setFilteredStartingPoints] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    if (searchQuery) {
      const locationNameField = selectedLanguage === 'th' ? 'md_location_namethai' : 'md_location_nameeng';
      const countryNameField = selectedLanguage === 'th' ? 'sys_countries_namethai' : 'sys_countries_nameeng';
      
      const filteredData = allStartingPoints.filter(point =>
        (`${point[locationNameField]}, ${point[countryNameField]}`.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredStartingPoints(filteredData);
    } else {
      setFilteredStartingPoints(allStartingPoints);
    }
  }, [searchQuery, allStartingPoints, selectedLanguage]);

  const handleSelectStartingPoint = (selectedPoint) => {
    const locationNameField = selectedLanguage === 'th' ? 'md_location_namethai' : 'md_location_nameeng';
    
    setSelectedItem({
      name: selectedPoint[locationNameField],
      id: selectedPoint.md_location_id,
      countryId: selectedPoint.md_location_countriesid,
    });
    if (route.params?.setStartingPoint) {
      route.params.setStartingPoint({
        id: selectedPoint.md_location_id,
        name: selectedPoint[locationNameField],
        countryId: selectedPoint.md_location_countriesid,
      });
    }
    if (navigation.canGoBack()) navigation.goBack();
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
        onPress={() => handleSelectStartingPoint(item)}
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
          <Text style={styles.headerTitle}>{ t('selectStartingPoint') }</Text>
        </View>
        
        {/* Search Bar */}
        <View style={styles.searchBarWrap}>
          <AntDesign name="search" size={20} color="#B7B7B7" style={{ marginLeft: 14, marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder={ t('searchCityOrAirport') }
            placeholderTextColor="#B7B7B7"
            value={searchQuery}
            onChangeText={setSearchQuery}
            underlineColorAndroid="transparent"
          />
        </View>
      </LinearGradient>

      {/* Main Content */}
      <View style={{ flex: 1, backgroundColor: '#F7F7FA', borderTopLeftRadius: 32, borderTopRightRadius: 32, marginTop: 44, paddingTop: 32 }}>
        <Text style={styles.suggestionLabel}>
          { t('suggestion') }
        </Text>
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

export default StartingPointScreen;
