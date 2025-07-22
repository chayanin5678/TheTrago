import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, FlatList, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AntDesign, MaterialIcons } from '@expo/vector-icons';
import ipAddress from './ipconfig';
import startingPointScreenStyles from './(CSS)/StartingPointScreenStyles';
import { useLanguage } from './(Screen)/LanguageContext';

const StartingPointScreen = ({ navigation, route }) => {
  const { t } = useLanguage();
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
      style={startingPointScreenStyles.suggestionItem}
      onPress={() => handleSelectStartingPoint(item)}
      activeOpacity={0.8}
    >
      <View style={startingPointScreenStyles.suggestionIconBox}>
        <MaterialIcons name="location-on" size={22} color="#FD501E" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={startingPointScreenStyles.suggestionTitle}>{item.md_location_nameeng} - {item.sys_countries_nameeng}</Text>
        <Text style={startingPointScreenStyles.suggestionSub}>{getSubText(item)}</Text>
      </View>
      <AntDesign name="right" size={18} color="#B7B7B7" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <LinearGradient colors={["#FD501E", "#FF7B3E"]} style={startingPointScreenStyles.headerBg}>
        <View style={startingPointScreenStyles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={startingPointScreenStyles.backBtn}>
            <AntDesign name="arrowleft" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={startingPointScreenStyles.headerTitle}>{ t('selectStartingPoint') }</Text>
        </View>
        <View style={startingPointScreenStyles.searchBarWrap}>
          <AntDesign name="search1" size={20} color="#B7B7B7" style={{ marginLeft: 14, marginRight: 8 }} />
          <TextInput
            style={startingPointScreenStyles.searchInput}
            placeholder={ t('searchCityOrAirport') }
            placeholderTextColor="#B7B7B7"
            value={searchText}
            onChangeText={setSearchText}
            underlineColorAndroid="transparent"
          />
        </View>
      </LinearGradient>
      <View style={{ flex: 1, backgroundColor: '#F7F7FA', borderTopLeftRadius: 32, borderTopRightRadius: 32, marginTop: 44, paddingTop: 32 }}>
        <Text style={startingPointScreenStyles.suggestionLabel}>{ t('suggestion') }</Text>
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
