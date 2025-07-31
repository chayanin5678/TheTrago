import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, FlatList, ActivityIndicator, SafeAreaView, Platform, Animated, Easing, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AntDesign, MaterialIcons } from '@expo/vector-icons';
import { useLanguage } from './(Screen)/LanguageContext';
import ipAddress from './ipconfig';

// Get screen dimensions for animations
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const EndPointScreen = ({ navigation, route }) => {
  const { t, selectedLanguage } = useLanguage();
  const [searchText, setSearchText] = useState('');
  const [filteredEndPoints, setFilteredEndPoints] = useState([]);
  const [allEndPoints, setAllEndPoints] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const startingPointId = route.params?.startingPointId;

  // Premium Animation States - เหมือนหน้า Profile และ SearchFerry
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Floating particles animation
  const floatingAnims = useRef(
    [...Array(6)].map(() => ({
      x: new Animated.Value(Math.random() * screenWidth - screenWidth / 2),
      y: new Animated.Value(Math.random() * screenHeight * 0.8),
      opacity: new Animated.Value(0.1),
      scale: new Animated.Value(1),
    }))
  ).current;

  // List item animations
  const listItemAnims = useRef(
    [...Array(20)].map(() => new Animated.Value(0))
  ).current;

  // Initialize premium animations on mount
  useEffect(() => {
    // Premium entrance animations with stagger effect
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400, // เร็วขึ้นจาก 1000
        easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300, // เร็วขึ้นจาก 800
        delay: 100, // เร็วขึ้นจาก 300
        easing: Easing.bezier(0.175, 0.885, 0.32, 1.275),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500, // เร็วขึ้นจาก 1200
        delay: 200, // เร็วขึ้นจาก 500
        easing: Easing.bezier(0.68, -0.55, 0.265, 1.55),
        useNativeDriver: true,
      }),
    ]).start();

    // Floating particles animation
    floatingAnims.forEach((anim, index) => {
      const animateParticle = () => {
        Animated.loop(
          Animated.parallel([
            Animated.sequence([
              Animated.timing(anim.y, {
                toValue: -50,
                duration: 2000 + index * 200, // เร็วขึ้นจาก 4000 + index * 400
                easing: Easing.inOut(Easing.sin),
                useNativeDriver: true,
              }),
              Animated.timing(anim.y, {
                toValue: screenHeight * 0.8,
                duration: 0,
                useNativeDriver: true,
              }),
            ]),
            Animated.sequence([
              Animated.timing(anim.opacity, {
                toValue: 0.3,
                duration: 800, // เร็วขึ้นจาก 2000
                useNativeDriver: true,
              }),
              Animated.timing(anim.opacity, {
                toValue: 0.1,
                duration: 800, // เร็วขึ้นจาก 2000
                useNativeDriver: true,
              }),
            ]),
            Animated.loop(
              Animated.sequence([
                Animated.timing(anim.scale, {
                  toValue: 1.2,
                  duration: 1000, // เร็วขึ้นจาก 2500
                  easing: Easing.inOut(Easing.sin),
                  useNativeDriver: true,
                }),
                Animated.timing(anim.scale, {
                  toValue: 0.8,
                  duration: 1000, // เร็วขึ้นจาก 2500
                  easing: Easing.inOut(Easing.sin),
                  useNativeDriver: true,
                }),
              ])
            ),
          ])
        ).start();
      };
      
      setTimeout(() => animateParticle(), index * 200); // เร็วขึ้นจาก index * 500
    });

    // Continuous pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 800, // เร็วขึ้นจาก 2000
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800, // เร็วขึ้นจาก 2000
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Continuous rotation for decorative elements
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 4000, // เร็วขึ้นจาก 10000
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

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

    // Animate list items when data changes
    listItemAnims.forEach((anim, index) => {
      anim.setValue(0);
      setTimeout(() => {
        Animated.timing(anim, {
          toValue: 1,
          duration: 300, // เร็วขึ้นจาก 600
          delay: index * 50, // เร็วขึ้นจาก index * 100
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }).start();
      }, 50); // เร็วขึ้นจาก 100
    });
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
    
    const itemAnim = listItemAnims[index % listItemAnims.length];
    
    return (
      <Animated.View
        style={{
          opacity: itemAnim,
          transform: [{
            translateY: itemAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [20, 0],
            })
          }]
        }}
      >
        <TouchableOpacity
          style={styles.suggestionItem}
          onPress={() => handleSelectEndPoint(item)}
          activeOpacity={0.8}
        >
          <Animated.View 
            style={[
              styles.suggestionIconBox,
              {
                transform: [{ scale: pulseAnim }]
              }
            ]}
          >
            <MaterialIcons name="location-on" size={22} color="#FD501E" />
          </Animated.View>
          <View style={{ flex: 1 }}>
            <Text style={styles.suggestionTitle}>{item[locationNameField]} - {item[countryNameField]}</Text>
            <Text style={styles.suggestionSub}>{getSubText(item)}</Text>
          </View>
          <AntDesign name="right" size={18} color="#B7B7B7" />
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Floating Particles Background */}
      <View style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 0,
        pointerEvents: 'none',
      }}>
        {floatingAnims.map((anim, index) => (
          <Animated.View
            key={index}
            style={[
              {
                position: 'absolute',
                width: 8,
                height: 8,
                backgroundColor: '#FD501E',
                borderRadius: 4,
              },
              {
                transform: [
                  { translateX: anim.x },
                  { translateY: anim.y },
                  { scale: anim.scale },
                ],
                opacity: anim.opacity,
              },
            ]}
          />
        ))}
      </View>

      {/* Animated Header */}
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        <LinearGradient colors={["#FD501E", "#FF7B3E"]} style={styles.headerBg}>
          {/* Floating decorative elements */}
          <Animated.View 
            style={[
              {
                position: 'absolute',
                top: 20,
                right: 20,
                zIndex: 1,
              },
              { 
                transform: [{
                  rotate: rotateAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg'],
                  })
                }]
              }
            ]}
          >
            <MaterialIcons name="location-on" size={24} color="rgba(255,255,255,0.2)" />
          </Animated.View>

          <Animated.View 
            style={[
              {
                position: 'absolute',
                top: 60,
                left: 30,
                zIndex: 1,
              },
              { 
                transform: [{
                  rotate: rotateAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '-360deg'],
                  })
                }]
              }
            ]}
          >
            <AntDesign name="search1" size={20} color="rgba(255,255,255,0.15)" />
          </Animated.View>

          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <AntDesign name="arrowleft" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{t('selectDestination')}</Text>
          </View>
          
          {/* Search Bar - ไม่มี animation */}
          <View style={styles.searchBarWrap}>
            <AntDesign name="search1" size={20} color="#B7B7B7" style={{ marginLeft: 14, marginRight: 8 }} />
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
      </Animated.View>

      {/* Main Content with Animation */}
      <Animated.View
        style={[
          { flex: 1, backgroundColor: '#F7F7FA', borderTopLeftRadius: 32, borderTopRightRadius: 32, marginTop: 44, paddingTop: 32 },
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          }
        ]}
      >
        <Animated.Text 
          style={[
            styles.suggestionLabel,
            {
              opacity: fadeAnim,
              transform: [{ translateX: slideAnim }],
            }
          ]}
        >
          {t('suggestion')}
        </Animated.Text>
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
      </Animated.View>
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
