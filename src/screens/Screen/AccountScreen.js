import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Animated,
  TouchableWithoutFeedback,
  Easing,
  Alert,
  Dimensions,
  Platform,
  Modal,
  StatusBar,
} from 'react-native';
import { MaterialIcons, FontAwesome6, Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';
import * as ImagePicker from 'expo-image-picker';
import Feather from '@expo/vector-icons/Feather';
import { LinearGradient } from 'expo-linear-gradient';
import { useCustomer } from './CustomerContext';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from './LanguageContext';
import ipAddress from '../../config/ipconfig';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const AccountScreen = ({ navigation }) => {
  const { logout } = useAuth();
  const { selectedLanguage, changeLanguage, t } = useLanguage();
  const { customerData, updateCustomerData } = useCustomer();

  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState([]);
  const [profileImage, setProfileImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [selectedLanguageLocal, setSelectedLanguageLocal] = useState(selectedLanguage);

  // Safe-area + header height
  const insets = useSafeAreaInsets();
  const [headerHeight, setHeaderHeight] = useState(0);
  const topPad = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0; // iOS ใช้ SafeAreaView edges ช่วยอยู่แล้ว

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const profileScaleAnim = useRef(new Animated.Value(0.8)).current;
  const headerAnim = useRef(new Animated.Value(-120)).current; // slide-in from top
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current; // สำหรับกดรูป

  // Shimmer
  const shimmerAnim = useRef(new Animated.Value(-200)).current;

  // Floating particles
  const floatingAnims = useRef(
    [...Array(8)].map(() => ({
      x: new Animated.Value(Math.random() * screenWidth - screenWidth / 2),
      y: new Animated.Value(Math.random() * screenHeight * 0.8),
      opacity: new Animated.Value(0.1),
      scale: new Animated.Value(1),
    }))
  ).current;

  // Menu items staggered
  const menuItemAnims = useRef(
    [...Array(8)].map(() => ({
      opacity: new Animated.Value(0),
      translateY: new Animated.Value(30),
      scale: new Animated.Value(0.9),
    }))
  ).current;

  // ===== Effects =====
  useEffect(() => {
    const timer = setTimeout(() => {
      if (user.length > 0 || !token) setIsLoadingProfile(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [user, token]);

  useEffect(() => {
    // load language from storage
    (async () => {
      try {
        const savedLanguage = await SecureStore.getItemAsync('userLanguage');
        if (savedLanguage) setSelectedLanguageLocal(savedLanguage);
      } catch {}
    })();
  }, []);

  const saveLanguageSettings = async () => {
    try {
      await SecureStore.setItemAsync('userLanguage', selectedLanguageLocal);
      changeLanguage(selectedLanguageLocal);
      setShowSettingsModal(false);
    } catch {
      Alert.alert(t('error') || 'Error', t('failedToSaveSettings') || 'Failed to save settings');
    }
  };

  useEffect(() => {
    // Premium entrances
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 1000, easing: Easing.bezier(0.25, 0.46, 0.45, 0.94), useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 800, delay: 300, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(profileScaleAnim, { toValue: 1, duration: 1200, delay: 500, easing: Easing.out(Easing.back(1.2)), useNativeDriver: true }),
      Animated.timing(headerAnim, { toValue: 0, duration: 1200, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    ]).start();

    // Floating particles
    floatingAnims.forEach((anim, index) => {
      const animateParticle = () => {
        Animated.loop(
          Animated.parallel([
            Animated.sequence([
              Animated.timing(anim.y, { toValue: -50, duration: 4000 + index * 300, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
              Animated.timing(anim.y, { toValue: screenHeight * 0.8, duration: 0, useNativeDriver: true }),
            ]),
            Animated.sequence([
              Animated.timing(anim.x, { toValue: (Math.random() * screenWidth - screenWidth / 2) * 0.3, duration: 2000 + index * 200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
              Animated.timing(anim.x, { toValue: Math.random() * screenWidth - screenWidth / 2, duration: 2000 + index * 200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
            ]),
            Animated.sequence([
              Animated.timing(anim.opacity, { toValue: 0.4, duration: 2000, useNativeDriver: true }),
              Animated.timing(anim.opacity, { toValue: 0.1, duration: 2000, useNativeDriver: true }),
            ]),
            Animated.loop(
              Animated.sequence([
                Animated.timing(anim.scale, { toValue: 1.3, duration: 2500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
                Animated.timing(anim.scale, { toValue: 0.7, duration: 2500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
              ])
            ),
          ])
        ).start();
      };
      setTimeout(() => animateParticle(), index * 400);
    });

    // Menu items
    menuItemAnims.forEach((anim, index) => {
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(anim.opacity, { toValue: 1, duration: 700, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
          Animated.timing(anim.translateY, { toValue: 0, duration: 900, easing: Easing.bezier(0.175, 0.885, 0.32, 1.275), useNativeDriver: true }),
          Animated.timing(anim.scale, { toValue: 1, duration: 800, easing: Easing.bezier(0.68, -0.55, 0.265, 1.55), useNativeDriver: true }),
        ]).start();
      }, index * 120 + 1000);
    });

    // Loopers
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.03, duration: 2500, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 2500, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(Animated.timing(rotateAnim, { toValue: 1, duration: 30000, easing: Easing.linear, useNativeDriver: true })).start();

    Animated.loop(Animated.timing(shimmerAnim, { toValue: 200, duration: 1300, easing: Easing.linear, useNativeDriver: true })).start();
  }, []);

  const spin = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  // Image press animations
  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.92, useNativeDriver: true }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, friction: 3, tension: 35, useNativeDriver: true }).start(() => pickImage());
  };

  // ===== Auth / data =====
  const handleLogout = async () => {
    try {
      await logout();
      updateCustomerData({ Firstname: '', Lastname: '', email: '' });
    } catch {
      Alert.alert(t('error') || 'Error', t('failedToLogout') || 'Failed to logout. Please try again.');
    }
  };

  useEffect(() => {
    (async () => {
      const storedToken = await SecureStore.getItemAsync('userToken');
      setToken(storedToken);
      if (!storedToken) {
        setIsLoading(false);
        setIsLoadingProfile(false);
      }
    })();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${ipAddress}/profile`, {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        });
        if (!response.ok) throw new Error('Network error');
        const data = await response.json();

        if (data && Array.isArray(data.data) && data.data.length > 0) {
          setUser(data.data);
          updateCustomerData({
            Firstname: data.data[0].md_member_fname,
            Lastname: data.data[0].md_member_lname,
            email: data.data[0].md_member_email,
            tel: data.data[0].md_member_phone,
            md_booking_memberid: data.data[0].md_member_id,
          });

          if (data.data[0].md_member_photo) {
            const photoUrl = data.data[0].md_member_photo.startsWith('http')
              ? data.data[0].md_member_photo
              : `https://www.thetrago.com/${data.data[0].md_member_photo}`;
            setProfileImage(photoUrl);
          }
        } else {
          setUser([]);
        }
      } catch (e) {
        // silent
      } finally {
        setIsLoading(false);
        setIsLoadingProfile(false);
      }
    };

    if (token) fetchData();
    else {
      setIsLoading(false);
      setIsLoadingProfile(false);
    }
  }, [token]);

  useEffect(() => {
    setSelectedLanguageLocal(selectedLanguage);
  }, [selectedLanguage]);

  // ===== Image pickers =====
  const pickImage = async () => {
    Alert.alert(
      'Select Profile Picture',
      'Choose how you’d like to update your profile picture',
      [
        { text: 'Camera', onPress: () => openCamera(), style: 'default' },
        { text: 'Photo Library', onPress: () => openImageLibrary(), style: 'default' },
        { text: 'Cancel', style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

  const openCamera = async () => {
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
    if (!cameraPermission.granted) {
      Alert.alert('Permission Required', 'Camera access is required to take photos.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
      uploadImage(result.assets[0].uri);
    }
  };

  const openImageLibrary = async () => {
    const libPerm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!libPerm.granted) {
      Alert.alert('Permission Required', 'Photo library access is required to select images.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      allowsMultipleSelection: false,
    });
    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
      uploadImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (imageUri) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('profile_image', { uri: imageUri, name: 'profile.jpg', type: 'image/jpeg' });

      const response = await fetch(`${ipAddress}/upload-member`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
        body: formData,
      });

      const result = await response.json();
      if (!(response.ok && result.status === 'success')) throw new Error(result.message || 'Upload failed');
    } catch (error) {
      setProfileImage(null);
      Alert.alert('Upload Failed ❌', 'There was an error updating your profile picture. Please try again.', [
        { text: 'Try Again', onPress: () => pickImage() },
        { text: 'Cancel', style: 'cancel' },
      ]);
    } finally {
      setIsUploading(false);
    }
  };

  // ===== UI =====
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FD501E" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header (slide-in + safe-area) */}
      <Animated.View
        onLayout={(e) => setHeaderHeight(e.nativeEvent.layout.height)}
        style={[styles.headerContainer, { transform: [{ translateY: headerAnim }] }]}
      >
        <LinearGradient
          colors={['#FD501E', '#FF6B40', '#FD501E']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <SafeAreaView edges={['top']} style={[styles.safeAreaHeader, { paddingTop: topPad }]}>
            <View style={styles.headerContent}>
              <TouchableOpacity
                style={styles.settingsButton}
                onPress={() => setShowSettingsModal(true)}
                activeOpacity={0.8}
              >
                <MaterialIcons name="settings" size={24} color="#FFFFFF" />
              </TouchableOpacity>

              <Text style={styles.headerTitle}>{t('myAccount')}</Text>
              <Text style={styles.headerSubtitle}>{t('manageProfile')}</Text>

              <Animated.View style={[styles.floatingDecor, { transform: [{ rotate: spin }] }]}>
                <MaterialCommunityIcons name="shimmer" size={20} color="rgba(255,255,255,0.3)" />
              </Animated.View>
              <Animated.View style={[styles.floatingDecor2, { transform: [{ rotate: spin }] }]}>
                <MaterialCommunityIcons name="star-four-points" size={16} color="rgba(255,255,255,0.2)" />
              </Animated.View>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </Animated.View>

      {/* Particles Background (ไม่บังการกด) */}
      <View pointerEvents="none" style={styles.particlesContainer}>
        {floatingAnims.map((anim, index) => (
          <Animated.View
            key={index}
            style={[
              styles.floatingParticle,
              { transform: [{ translateX: anim.x }, { translateY: anim.y }, { scale: anim.scale }], opacity: anim.opacity },
            ]}
          />
        ))}
      </View>

      <ScrollView
        style={{ marginTop: headerHeight }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 140 }}
        showsVerticalScrollIndicator={false}
        bounces
        contentInsetAdjustmentBehavior="never"
      >
        {/* Profile Card */}
        <Animated.View
          style={[
            styles.profileCard,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }, { scale: profileScaleAnim }] },
          ]}
        >
          {user.length === 0 || isLoadingProfile || isLoading ? (
            // Skeleton
            <View style={styles.skeletonContainer}>
              <View style={styles.skeletonProfileImage}>
                <Animated.View style={{ width: 120, height: '100%', transform: [{ translateX: shimmerAnim }] }}>
                  <LinearGradient
                    colors={['#f0f0f000', '#e0e0e0cc', '#f0f0f000']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{ width: '100%', height: '100%' }}
                  />
                </Animated.View>
              </View>

              <View style={styles.skeletonName}>
                <Animated.View style={{ width: 140, height: '100%', transform: [{ translateX: shimmerAnim }] }}>
                  <LinearGradient
                    colors={['#f0f0f000', '#e0e0e0cc', '#f0f0f000']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{ width: '100%', height: '100%' }}
                  />
                </Animated.View>
              </View>

              <View style={styles.skeletonEmail}>
                <Animated.View style={{ width: 100, height: '100%', transform: [{ translateX: shimmerAnim }] }}>
                  <LinearGradient
                    colors={['#f0f0f000', '#e0e0e0cc', '#f0f0f000']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{ width: '100%', height: '100%' }}
                  />
                </Animated.View>
              </View>
            </View>
          ) : (
            user.map((item, index) => (
              <View key={index} style={styles.profileContent}>
                {isUploading && (
                  <View style={styles.uploadingOverlay}>
                    <ActivityIndicator size="large" color="#FD501E" />
                    <Text style={styles.uploadingText}>Uploading...</Text>
                  </View>
                )}

                <TouchableWithoutFeedback onPressIn={handlePressIn} onPressOut={handlePressOut}>
                  <Animated.View style={[styles.profileImageContainer, { transform: [{ scale: scaleAnim }] }]}>
                    <View style={styles.profileImageWrapper}>
                      <Image
                        source={
                          profileImage
                            ? { uri: profileImage }
                            : item.md_member_photo
                            ? {
                                uri: item.md_member_photo.startsWith('http')
                                  ? item.md_member_photo
                                  : `https://www.thetrago.com/${item.md_member_photo}`,
                              }
                            : require('../../../assets/icontrago.png')
                        }
                        style={styles.profileImage}
                        defaultSource={require('../../../assets/icontrago.png')}
                        onError={() => setProfileImage(null)}
                      />
                      <Animated.View
                        style={[
                          styles.editPulse,
                          {
                            transform: [
                              {
                                scale: scaleAnim.interpolate({
                                  inputRange: [0.9, 1],
                                  outputRange: [1.2, 1],
                                  extrapolate: 'clamp',
                                }),
                              },
                            ],
                          },
                        ]}
                      />
                      <Animated.View style={[styles.editIconContainer, { transform: [{ scale: pulseAnim }] }]}>
                        <Feather name="camera" size={16} color="#FFFFFF" />
                      </Animated.View>
                    </View>
                  </Animated.View>
                </TouchableWithoutFeedback>

                <View style={styles.profileInfo}>
                  <Text style={styles.userName}>
                    {item.md_member_fname} {item.md_member_lname}
                  </Text>
                  <Text style={styles.userEmail}>{item.md_member_email}</Text>
                  <View style={styles.statusBadge}>
                    <View style={styles.statusDot} />
                    <Text style={styles.statusText}>{t('activeMember')}</Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </Animated.View>

        {/* Menu Section */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>{t('quickActions')}</Text>

          <View style={styles.menuGrid}>
            {[
              { title: t('dashboard'), subtitle: t('dashboardDesc'), icon: 'space-dashboard', nav: 'Dashboard' },
              { title: t('profile'), subtitle: t('profileDesc'), icon: 'person', nav: 'ProfileScreen', isIonicons: true },
              { title: t('contact'), subtitle: t('contactDesc'), icon: 'mail', nav: 'ContactScreen', isIonicons: true },
            ].map((item, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.menuCardWrapper,
                  {
                    opacity: menuItemAnims[index]?.opacity || 1,
                    transform: [
                      { translateY: menuItemAnims[index]?.translateY || 0 },
                      { scale: menuItemAnims[index]?.scale || 1 },
                    ],
                  },
                ]}
              >
                <TouchableOpacity style={styles.menuCard} onPress={() => navigation.navigate(item.nav)} activeOpacity={0.8}>
                  <View style={styles.menuIconContainer}>
                    {item.isFA6 ? (
                      <FontAwesome6 name={item.icon} size={24} color="#FD501E" />
                    ) : item.isIonicons ? (
                      <Ionicons name={item.icon} size={24} color="#FD501E" />
                    ) : (
                      <MaterialIcons name={item.icon} size={24} color="#FD501E" />
                    )}
                  </View>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                  <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>

          <Text style={styles.sectionTitle}>{t('accountManagement') || 'Account Management'}</Text>

          <View style={styles.listSection}>
            {[
              {
                title: t('affiliateProgram') || 'Affiliate Program',
                subtitle: t('earnCommission') || 'Earn commission on bookings',
                icon: 'group',
                color: '#10B981',
                nav: 'AffiliateScreen',
              },
              {
                title: t('deleteAccount') || 'Delete Account',
                subtitle: t('deleteAccountDesc') || 'Permanently remove account',
                icon: 'delete-outline',
                color: '#EF4444',
                nav: 'DeleteProfile',
              },
            ].map((item, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.listItemWrapper,
                  {
                    opacity: menuItemAnims[index + 4]?.opacity || 1,
                    transform: [
                      { translateY: menuItemAnims[index + 4]?.translateY || 0 },
                      { scale: menuItemAnims[index + 4]?.scale || 1 },
                    ],
                  },
                ]}
              >
                <TouchableOpacity
                  style={styles.listItem}
                  onPress={() => item.nav && navigation.navigate(item.nav)}
                  activeOpacity={0.7}
                >
                  <View style={styles.listIconContainer}>
                    <MaterialIcons name={item.icon} size={20} color={item.color} />
                  </View>
                  <View style={styles.listContent}>
                    <Text style={[styles.listTitle, { color: item.color === '#EF4444' ? '#EF4444' : '#1F2937' }]}>
                      {item.title}
                    </Text>
                    <Text style={styles.listSubtitle}>{item.subtitle}</Text>
                  </View>
                  <MaterialIcons name="chevron-right" size={20} color="#D1D5DB" />
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>

          {/* Logout */}
          <Animated.View
            style={[
              styles.logoutButtonWrapper,
              {
                opacity: menuItemAnims[7]?.opacity || 1,
                transform: [{ translateY: menuItemAnims[7]?.translateY || 0 }, { scale: menuItemAnims[7]?.scale || 1 }],
              },
            ]}
          >
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
              <LinearGradient colors={['#FD501E', '#FF6B40']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.logoutGradient}>
                <MaterialIcons name="logout" size={20} color="#FFFFFF" />
                <Text style={styles.logoutText}>{t('signOut')}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </ScrollView>

      {/* Settings Modal */}
      <Modal visible={showSettingsModal} transparent animationType="fade" onRequestClose={() => setShowSettingsModal(false)}>
        <TouchableWithoutFeedback onPress={() => setShowSettingsModal(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <Animated.View style={styles.modalContent}>
                <LinearGradient colors={['#FFFFFF', '#F8F9FA']} style={styles.modalGradient}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>{t('settings')}</Text>
                    <TouchableOpacity style={styles.closeButton} onPress={() => setShowSettingsModal(false)}>
                      <MaterialIcons name="close" size={24} color="#6B7280" />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.settingSection}>
                    <View style={styles.settingHeader}>
                      <MaterialIcons name="language" size={24} color="#FD501E" />
                      <Text style={styles.settingTitle}>{t('language')}</Text>
                    </View>

                    <View style={styles.optionsContainer}>
                      {[
                        { code: 'th', name: t('thai'), flag: '🇹🇭' },
                        { code: 'en', name: t('english'), flag: '🇺🇸' },
                      ].map((lang, index) => (
                        <TouchableOpacity
                          key={index}
                          style={[styles.optionItem, selectedLanguageLocal === lang.code && styles.optionItemSelected]}
                          onPress={() => setSelectedLanguageLocal(lang.code)}
                        >
                          <Text style={styles.flagText}>{lang.flag}</Text>
                          <Text
                            style={[styles.optionText, selectedLanguageLocal === lang.code && styles.optionTextSelected]}
                          >
                            {lang.name}
                          </Text>
                          {selectedLanguage === lang.code && <MaterialIcons name="check-circle" size={20} color="#FD501E" />}
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <TouchableOpacity style={styles.saveSettingsButton} onPress={saveLanguageSettings}>
                    <LinearGradient colors={['#FD501E', '#FF6B40']} style={styles.saveGradient}>
                      <MaterialIcons name="save" size={20} color="#FFFFFF" />
                      <Text style={styles.saveText}>{t('saveSettings')}</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </LinearGradient>
              </Animated.View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },

  // Particles
  particlesContainer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 },
  floatingParticle: { position: 'absolute', width: 6, height: 6, backgroundColor: '#FD501E', borderRadius: 3, opacity: 0.1 },

  // Header
  headerContainer: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 2 },
  headerGradient: {
    paddingTop: 0,
    paddingBottom: 40,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
    shadowColor: '#FD501E',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  safeAreaHeader: { paddingTop: 0 },
  headerContent: { alignItems: 'center', position: 'relative', zIndex: 3 },
  settingsButton: {
    position: 'absolute',
    top: 12,
    right: 0,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 6,
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  headerSubtitle: { fontSize: 15, color: 'rgba(255, 255, 255, 0.95)', textAlign: 'center', fontWeight: '500', letterSpacing: 0.3 },
  floatingDecor: { position: 'absolute', top: -10, right: 20, opacity: 0.4 },
  floatingDecor2: { position: 'absolute', bottom: -5, left: 30, opacity: 0.3 },

  // Profile Card
  profileCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 30,
    padding: 30,
    shadowColor: '#FD501E',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.2,
    shadowRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(253, 80, 30, 0.15)',
    position: 'relative',
    overflow: 'hidden',
  },

  // Skeleton
  skeletonContainer: { alignItems: 'center', paddingVertical: 25 },
  skeletonProfileImage: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: '#F3F4F6',
    overflow: 'hidden',
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  skeletonName: { width: 170, height: 22, borderRadius: 11, backgroundColor: '#F3F4F6', overflow: 'hidden', marginBottom: 15 },
  skeletonEmail: { width: 130, height: 18, borderRadius: 9, backgroundColor: '#F3F4F6', overflow: 'hidden' },

  // Profile
  profileContent: { alignItems: 'center', position: 'relative' },
  uploadingOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30,
    zIndex: 20,
  },
  uploadingText: { marginTop: 12, fontSize: 15, color: '#FD501E', fontWeight: '700', letterSpacing: 0.5 },
  profileImageContainer: { marginBottom: 25, position: 'relative' },
  profileImageWrapper: { position: 'relative', borderRadius: 65, overflow: 'visible' },
  profileImage: {
    width: 130, height: 130, borderRadius: 65,
    borderWidth: 4, borderColor: 'rgba(255, 255, 255, 0.8)',
    shadowColor: '#FD501E', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 15,
  },
  editIconContainer: {
    position: 'absolute', bottom: 5, right: 5, backgroundColor: '#FD501E',
    borderRadius: 22, width: 44, height: 44, justifyContent: 'center', alignItems: 'center',
    borderWidth: 4, borderColor: '#FFFFFF', shadowColor: '#FD501E', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 12, zIndex: 30,
  },
  editPulse: { position: 'absolute', bottom: 5, right: 5, backgroundColor: 'rgba(253, 80, 30, 0.25)', borderRadius: 22, width: 44, height: 44, zIndex: 15 },

  profileInfo: { alignItems: 'center' },
  userName: { fontSize: 26, fontWeight: '800', color: '#1F2937', marginBottom: 8, letterSpacing: 0.5, textAlign: 'center' },
  userEmail: { fontSize: 17, color: '#6B7280', marginBottom: 15, fontWeight: '500' },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(34, 197, 94, 0.15)',
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 25,
    shadowColor: '#22C55E', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4,
  },
  statusDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#22C55E', marginRight: 8 },
  statusText: { fontSize: 13, color: '#22C55E', fontWeight: '700', letterSpacing: 0.3 },

  // Menu
  menuSection: { marginTop: 35, paddingHorizontal: 20 },
  sectionTitle: { fontSize: 22, fontWeight: '800', color: '#1F2937', marginBottom: 20, marginTop: 30, letterSpacing: 0.5 },
  menuGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 15 },
  menuCardWrapper: { width: '48%', marginBottom: 15 },
  menuCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    width: '100%',
    padding: 25,
    borderRadius: 25,
    alignItems: 'center',
    shadowColor: '#FD501E', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.12, shadowRadius: 20,
    borderWidth: 1, borderColor: 'rgba(253, 80, 30, 0.08)',
    position: 'relative', overflow: 'hidden',
  },
  menuIconContainer: { width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(253, 80, 30, 0.12)', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  menuTitle: { fontSize: 16, fontWeight: '700', color: '#1F2937', marginBottom: 6, textAlign: 'center', letterSpacing: 0.3 },
  menuSubtitle: { fontSize: 13, color: '#6B7280', textAlign: 'center', fontWeight: '500' },

  // List
  listSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 25,
    marginTop: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.08, shadowRadius: 15,
    borderWidth: 1, borderColor: 'rgba(253, 80, 30, 0.05)',
    overflow: 'hidden',
  },
  listItemWrapper: { borderBottomWidth: 1, borderBottomColor: 'rgba(229, 231, 235, 0.5)' },
  listItem: { flexDirection: 'row', alignItems: 'center', padding: 20, backgroundColor: 'transparent' },
  listIconContainer: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(107, 114, 128, 0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  listContent: { flex: 1 },
  listTitle: { fontSize: 16, fontWeight: '600', color: '#1F2937', marginBottom: 4, letterSpacing: 0.2 },
  listSubtitle: { fontSize: 13, color: '#6B7280', fontWeight: '500' },

  // Logout
  logoutButtonWrapper: { marginTop: 30, marginBottom: 20 },
  logoutButton: { borderRadius: 25, overflow: 'hidden' },
  logoutGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, paddingHorizontal: 30 },
  logoutText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', marginLeft: 10, letterSpacing: 0.5 },

  // Loading
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  modalContent: {
    width: '100%', maxWidth: 400, borderRadius: 25, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 20,
  },
  modalGradient: { padding: 25 },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25, paddingBottom: 15,
    borderBottomWidth: 1, borderBottomColor: 'rgba(229, 231, 235, 0.5)',
  },
  modalTitle: { fontSize: 24, fontWeight: '800', color: '#1F2937', letterSpacing: 0.5 },
  closeButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(107, 114, 128, 0.1)', justifyContent: 'center', alignItems: 'center' },
  settingSection: { marginBottom: 25 },
  settingHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  settingTitle: { fontSize: 18, fontWeight: '700', color: '#1F2937', marginLeft: 10, letterSpacing: 0.3 },
  optionsContainer: { backgroundColor: 'rgba(248, 250, 252, 0.8)', borderRadius: 15, overflow: 'hidden' },
  optionItem: { flexDirection: 'row', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: 'rgba(229, 231, 235, 0.3)' },
  optionItemSelected: { backgroundColor: 'rgba(253, 80, 30, 0.1)' },
  flagText: { fontSize: 20, marginRight: 12 },
  optionText: { flex: 1, fontSize: 16, fontWeight: '600', color: '#374151' },
  optionTextSelected: { color: '#FD501E', fontWeight: '700' },
  saveSettingsButton: { marginTop: 10, borderRadius: 15, overflow: 'hidden' },
  saveGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 15, paddingHorizontal: 25 },
  saveText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', marginLeft: 8, letterSpacing: 0.5 },
});

export default AccountScreen;
