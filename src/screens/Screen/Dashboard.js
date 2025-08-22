import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, Easing, Dimensions, Platform, StatusBar } from 'react-native';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguage } from './LanguageContext';
import { useCustomer } from './CustomerContext';
import ipAddress from '../../config/ipconfig';
import CrossPlatformStatusBar from '../../components/component/CrossPlatformStatusBar';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const Dashboard = ({ navigation }) => {
  const { t } = useLanguage();
  const { customerData, updateCustomerData } = useCustomer();
  const [bookings, setBookings] = useState({ upcoming: 0, cancelled: 0, completed: 0 });
  const [userPoints, setUserPoints] = useState(0);
  const [loading, setLoading] = useState(true);

  // Safe-area
  const insets = useSafeAreaInsets();
  const [headerHeight, setHeaderHeight] = useState(0);
  const topPad = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0; // ✅ ไม่ซ้ำกับ SafeAreaView ของ iOS

  // Animations (เหมือน Contact)
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const headerAnim = useRef(new Animated.Value(-100)).current;

  // Floating particles
  const floatingAnims = useRef(
    [...Array(6)].map(() => ({
      x: new Animated.Value(Math.random() * screenWidth - screenWidth / 2),
      y: new Animated.Value(Math.random() * screenHeight * 0.8),
      opacity: new Animated.Value(0.1),
      scale: new Animated.Value(1),
    }))
  ).current;

  // Card staggered
  const cardAnims = useRef(
    [...Array(3)].map(() => ({
      opacity: new Animated.Value(0),
      translateY: new Animated.Value(30),
      scale: new Animated.Value(0.9),
    }))
  ).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 1000, easing: Easing.bezier(0.25, 0.46, 0.45, 0.94), useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 800, delay: 300, easing: Easing.bezier(0.175, 0.885, 0.32, 1.275), useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 1200, delay: 500, easing: Easing.bezier(0.68, -0.55, 0.265, 1.55), useNativeDriver: true }),
      Animated.timing(headerAnim, { toValue: 0, duration: 1200, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    ]).start();

    // Floating particles
    floatingAnims.forEach((anim, index) => {
      const animateParticle = () => {
        Animated.loop(
          Animated.parallel([
            Animated.sequence([
              Animated.timing(anim.y, { toValue: -50, duration: 4000 + index * 400, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
              Animated.timing(anim.y, { toValue: screenHeight * 0.8, duration: 0, useNativeDriver: true }),
            ]),
            Animated.sequence([
              Animated.timing(anim.opacity, { toValue: 0.3, duration: 2000, useNativeDriver: true }),
              Animated.timing(anim.opacity, { toValue: 0.1, duration: 2000, useNativeDriver: true }),
            ]),
            Animated.loop(
              Animated.sequence([
                Animated.timing(anim.scale, { toValue: 1.2, duration: 2500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
                Animated.timing(anim.scale, { toValue: 0.8, duration: 2500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
              ])
            ),
          ])
        ).start();
      };
      setTimeout(() => animateParticle(), index * 500);
    });

    // Cards
    cardAnims.forEach((anim, index) => {
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(anim.opacity, { toValue: 1, duration: 700, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
          Animated.timing(anim.translateY, { toValue: 0, duration: 700, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
          Animated.timing(anim.scale, { toValue: 1, duration: 700, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        ]).start();
      }, index * 200 + 800);
    });
  }, []);

  // Points
  const fetchUserPoints = async () => {
    try {
      if (!customerData?.md_booking_memberid) { setUserPoints(0); return; }
      const response = await fetch(`${ipAddress}/userpoints/${customerData.md_booking_memberid}`, {
        method: 'GET', headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
      });
      const result = await response.json();
      if (response.ok && result.status === 'success') {
        const availablePoints = result.data?.available_points || result.points || 0;
        setUserPoints(availablePoints);
      } else {
        setUserPoints(0);
      }
    } catch {
      setUserPoints(0);
    }
  };

  // Bookings
  const fetchBookingsData = async () => {
    try {
      if (!customerData?.md_booking_memberid) return;

      let customerEmail = null;
      try {
        const storedUserEmail = await SecureStore.getItemAsync('userEmail');
        const storedBookingEmail = await SecureStore.getItemAsync('bookingEmail');
        customerEmail = storedUserEmail || storedBookingEmail || customerData?.email || customerData?.md_booking_email;
      } catch {
        customerEmail = customerData?.email || customerData?.md_booking_email;
      }
      if (!customerEmail) { setBookings({ upcoming: 0, cancelled: 0, completed: 0 }); return; }

      const statuses = [0, 2, 1]; // confirmed, cancelled, completed
      const allBookings = []; // ✅ ไม่มี TS ในไฟล์ JS

      for (const status of statuses) {
        try {
          const response = await fetch(`${ipAddress}/checkbooking`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ md_booking_email: customerEmail.trim(), md_booking_status: status.toString() }),
          });
          if (response.ok) {
            const data = await response.json();
            if (data && Array.isArray(data.data)) {
              allBookings.push(...data.data.map(b => ({ ...b, status })));
            }
          }
        } catch {}
      }

      const counts = {
        upcoming: allBookings.filter(b => b.status === 0).length,
        cancelled: allBookings.filter(b => b.status === 2).length,
        completed: allBookings.filter(b => b.status === 1).length,
      };
      setBookings(counts);
    } catch {
      setBookings({ upcoming: 0, cancelled: 0, completed: 0 });
    }
  };

  useEffect(() => {
    const loadData = async () => {
      if (!customerData?.md_booking_memberid) {
        try {
          const storedToken = await SecureStore.getItemAsync('userToken');
          if (storedToken) {
            const response = await fetch(`${ipAddress}/profile`, {
              method: 'GET', headers: { Authorization: `Bearer ${storedToken}`, 'Content-Type': 'application/json' },
            });
            if (response.ok) {
              const data = await response.json();
              if (data && Array.isArray(data.data) && data.data.length > 0) {
                const profileData = data.data[0];
                updateCustomerData({
                  Firstname: profileData.md_member_fname,
                  Lastname: profileData.md_member_lname,
                  email: profileData.md_member_email,
                  tel: profileData.md_member_phone,
                  md_booking_memberid: profileData.md_member_id,
                  md_member_photo: profileData.md_member_photo,
                });
                return; // จะ rerender แล้ว run effect อีกรอบ
              }
            }
          }
        } catch {}
        setLoading(false);
        return;
      }

      // ถ้าไม่มีอีเมลทั้งใน customerData และ SecureStore
      if (!customerData?.email && !customerData?.md_booking_email) {
        try {
          const storedUserEmail = await SecureStore.getItemAsync('userEmail');
          const storedBookingEmail = await SecureStore.getItemAsync('bookingEmail');
          if (!storedUserEmail && !storedBookingEmail) { setLoading(false); return; }
        } catch { setLoading(false); return; }
      }

      setLoading(true);
      try { await Promise.all([fetchUserPoints(), fetchBookingsData()]); }
      finally { setLoading(false); }
    };

    loadData();
  }, [customerData?.md_booking_memberid, customerData?.email, customerData?.md_booking_email]);

  const handleRefresh = async () => {
    if (!loading && customerData?.md_booking_memberid) {
      setLoading(true);
      try { await Promise.all([fetchUserPoints(), fetchBookingsData()]); }
      finally { setLoading(false); }
    }
  };

  return (
    <View style={styles.container}>
      <CrossPlatformStatusBar barStyle="light-content" backgroundColor="#FD501E" />

      {/* Header */}
      <Animated.View
        collapsable={false} // ✅ ให้ onLayout ยิงเสมอ
        onLayout={e => setHeaderHeight(e.nativeEvent.layout.height)}
        style={[styles.headerContainer, { transform: [{ translateY: headerAnim }] }]}
      >
        <LinearGradient colors={['#FD501E', '#FF6B35', '#FD501E']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.headerGradient}>
          <SafeAreaView edges={['top']} style={[styles.safeAreaHeader, { paddingTop: topPad }]}>
            <View style={styles.headerTopRow}>
              <TouchableOpacity
                style={[styles.backButton, { top: 12 }]} // ✅ ไม่ต้องบวก safe-area เอง
                onPress={() => navigation.goBack()}
                activeOpacity={0.8}
              >
                <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
              </TouchableOpacity>

              <View style={styles.headerContent}>
                <View style={styles.titleContainer}>
                  <MaterialCommunityIcons name="view-dashboard" size={32} color="#FFFFFF" />
                  <Text style={styles.headerTitle}>{t('dashboard') || 'Dashboard'}</Text>
                </View>
                <Text style={styles.headerSubtitle}>
                  {customerData?.md_booking_memberid
                    ? `${t('ultraPremiumAnalytics') || 'Ultra Premium Analytics'} - ID: ${customerData.md_booking_memberid}`
                    : `${t('pleaseLogin') || 'Please Login'}`}
                </Text>
              </View>
            </View>

            {/* Floating particles */}
            {floatingAnims.map((anim, i) => (
              <Animated.View
                pointerEvents="none" // ✅ ไม่บังการกดปุ่ม
                key={i}
                style={[
                  styles.floatingParticle,
                  { transform: [{ translateX: anim.x }, { translateY: anim.y }, { scale: anim.scale }], opacity: anim.opacity }
                ]}
              />
            ))}
          </SafeAreaView>
        </LinearGradient>
      </Animated.View>

      <ScrollView
        style={[styles.scrollView, { marginTop: headerHeight }]}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 140 }]}
        showsVerticalScrollIndicator={false}
        bounces
        contentInsetAdjustmentBehavior="never"
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          {!customerData?.md_booking_memberid && (
            <Animated.View
              style={[
                styles.sectionContainer,
                { opacity: cardAnims[0].opacity, transform: [{ translateY: cardAnims[0].translateY }, { scale: cardAnims[0].scale }] }
              ]}
            >
              <View style={styles.loginPromptCard}>
                <LinearGradient colors={['#FD501E', '#FF6B40']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.loginPromptGradient}>
                  <MaterialCommunityIcons name="account-alert" size={48} color="#FFFFFF" />
                  <Text style={styles.loginPromptTitle}>{t('loginRequired') || 'Login Required'}</Text>
                  <Text style={styles.loginPromptText}>
                    {t('pleaseLoginToViewDashboard') || 'Please login to view your dashboard and points'}
                  </Text>
                  <TouchableOpacity style={styles.loginPromptButton} onPress={() => navigation.navigate('LoginScreen')}>
                    <Text style={styles.loginPromptButtonText}>{t('login') || 'Login'}</Text>
                  </TouchableOpacity>
                </LinearGradient>
              </View>
            </Animated.View>
          )}

          {customerData?.md_booking_memberid && (
            <>
              {/* Bookings */}
              <Animated.View
                style={[
                  styles.sectionContainer,
                  { opacity: cardAnims[0].opacity, transform: [{ translateY: cardAnims[0].translateY }, { scale: cardAnims[0].scale }] }
                ]}
              >
                <View style={styles.sectionHeader}>
                  <MaterialIcons name="flight" size={24} color="#FD501E" />
                  <Text style={styles.sectionTitle}>{t('myBookings') || 'My Bookings'}</Text>
                  <View style={styles.premiumBadge}><Text style={styles.badgeText}>{t('live') || 'LIVE'}</Text></View>
                </View>

                <View style={styles.bookingSection}>
                  <View style={styles.bookingCard}>
                    <LinearGradient colors={['#FFFFFF', '#FFF8E1']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.cardGradient}>
                      <View style={styles.cardContent}>
                        <View style={styles.cardLeft}>
                          <View style={styles.cardIndicator} />
                          <View style={styles.cardTextContainer}>
                            <Text style={styles.bookingCount}>{loading ? '...' : bookings.upcoming}</Text>
                            <Text style={styles.bookingStatus}>{t('upcoming') || 'Upcoming'}</Text>
                          </View>
                        </View>
                        <View style={[styles.iconContainer, { backgroundColor: '#FFCC00' }]}>
                          <MaterialIcons name="flight-takeoff" size={28} color="white" />
                          <View style={[styles.iconGlow, { backgroundColor: 'rgba(255, 204, 0, 0.3)' }]} />
                        </View>
                      </View>
                    </LinearGradient>
                  </View>

                  <View style={styles.bookingCard}>
                    <LinearGradient colors={['#FFFFFF', '#FFEBEE']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.cardGradient}>
                      <View style={styles.cardContent}>
                        <View style={styles.cardLeft}>
                          <View style={[styles.cardIndicator, { backgroundColor: '#F73202' }]} />
                          <View style={styles.cardTextContainer}>
                            <Text style={styles.bookingCount}>{loading ? '...' : bookings.cancelled}</Text>
                            <Text style={styles.bookingStatus}>{t('cancelled') || 'Cancelled'}</Text>
                          </View>
                        </View>
                        <View style={[styles.iconContainer, { backgroundColor: '#F73202' }]}>
                          <FontAwesome5 name="times-circle" size={28} color="white" />
                          <View style={[styles.iconGlow, { backgroundColor: 'rgba(247, 50, 2, 0.3)' }]} />
                        </View>
                      </View>
                    </LinearGradient>
                  </View>

                  <View style={styles.bookingCard}>
                    <LinearGradient colors={['#FFFFFF', '#E8F5E8']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.cardGradient}>
                      <View style={styles.cardContent}>
                        <View style={styles.cardLeft}>
                          <View style={[styles.cardIndicator, { backgroundColor: '#28A745' }]} />
                          <View style={styles.cardTextContainer}>
                            <Text style={styles.bookingCount}>{loading ? '...' : bookings.completed}</Text>
                            <Text style={styles.bookingStatus}>{t('completed') || 'Completed'}</Text>
                          </View>
                        </View>
                        <View style={[styles.iconContainer, { backgroundColor: '#28A745' }]}>
                          <FontAwesome5 name="check-circle" size={28} color="white" />
                          <View style={[styles.iconGlow, { backgroundColor: 'rgba(40, 167, 69, 0.3)' }]} />
                        </View>
                      </View>
                    </LinearGradient>
                  </View>
                </View>
              </Animated.View>

              {/* Points */}
              <Animated.View
                style={[
                  styles.sectionContainer,
                  { opacity: cardAnims[1].opacity, transform: [{ translateY: cardAnims[1].translateY }, { scale: cardAnims[1].scale }] }
                ]}
              >
                <View style={styles.sectionHeader}>
                  <MaterialCommunityIcons name="star-circle" size={24} color="#FD501E" />
                  <Text style={styles.sectionTitle}>{t('rewardsAndPoints') || 'Rewards & Points'}</Text>
                  <TouchableOpacity onPress={handleRefresh} disabled={loading} style={[styles.refreshButton, loading && styles.refreshButtonDisabled]}>
                    <MaterialCommunityIcons name="refresh" size={20} color={loading ? '#888' : '#FD501E'} />
                  </TouchableOpacity>
                  <View style={[styles.premiumBadge, { backgroundColor: '#FFD700' }]}><Text style={[styles.badgeText, { color: '#000' }]}>{t('vip') || 'VIP'}</Text></View>
                </View>

                <View style={styles.pointsCard}>
                  <LinearGradient colors={['#FD501E', '#FF6B40', '#FF8A65']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.pointsGradient}>
                    <View style={styles.pointsContent}>
                      <View style={styles.pointsHeader}>
                        <MaterialCommunityIcons name="medal" size={28} color="#ffffff" />
                        <Text style={styles.pointsHeaderText}>{t('premiumRewards') || 'Premium Rewards'}</Text>
                        <View style={styles.levelBadge}><Text style={styles.levelText}>LV.1</Text></View>
                      </View>

                      <View style={styles.pointsProgressContainer}>
                        <View style={styles.progressBarContainer}>
                          <View style={styles.progressBar}>
                            <LinearGradient
                              colors={['#FFFFFF', '#FFE0B2']}
                              style={[styles.progressFill, { width: `${Math.min((userPoints / 1000) * 100, 100)}%` }]}
                            />
                          </View>
                          <Text style={styles.progressText}>
                            {userPoints >= 1000
                              ? (t('maxLevel') || 'คะแนนสูงสุดแล้ว!')
                              : `${t('maxPoints') || 'คะแนนสูงสุด:'} 1,000 ${t('points') || 'คะแนน'} (${t('remaining') || 'เหลือ'} ${Math.round((1000 - userPoints) * 10) / 10})`}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.pointsDisplay}>
                        <View style={styles.pointsCircle}>
                          <LinearGradient colors={['#FFD700', '#FFC107']} style={styles.circleGradient}>
                            <MaterialCommunityIcons name="star" size={36} color="#FD501E" />
                          </LinearGradient>
                        </View>
                        <View style={styles.pointsTextContainer}>
                          <Text style={styles.pointsNumber}>{loading ? '...' : userPoints.toLocaleString()}</Text>
                          <Text style={styles.pointsLabel}>{t('totalPoints') || 'Total Points'}</Text>
                          <Text style={styles.pointsSubtext}>{t('earnMoreByTraveling') || 'Earn more by traveling'}</Text>
                        </View>
                      </View>
                    </View>
                  </LinearGradient>
                </View>
              </Animated.View>

              {/* CTA Buttons */}
              <Animated.View
                style={[
                  styles.buttonContainer,
                  { opacity: cardAnims[2].opacity, transform: [{ translateY: cardAnims[2].translateY }, { scale: cardAnims[2].scale }] }
                ]}
              >
                <TouchableOpacity
                  style={styles.refreshCta}
                  onPress={async () => {
                    setLoading(true);
                    await Promise.all([fetchUserPoints(), fetchBookingsData()]);
                    setLoading(false);
                  }}
                  activeOpacity={0.8}
                >
                  <View style={styles.refreshButtonSolid}>
                    <MaterialIcons name="refresh" size={24} color="#FFFFFF" />
                    <Text style={styles.refreshButtonText}>{t('refresh') || 'Refresh Data'}</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity style={styles.backCta} onPress={() => navigation.goBack()} activeOpacity={0.8}>
                  <View style={styles.backButtonSolid}>
                    <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
                    <Text style={styles.backButtonText}>{t('backToProfile') || 'Back to Profile'}</Text>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            </>
          )}
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },

  // Header
  headerContainer: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 2 },
  headerGradient: {
    paddingTop: 0, paddingBottom: 20, paddingHorizontal: 20,
    borderBottomLeftRadius: 30, borderBottomRightRadius: 30,
    shadowColor: '#FD501E', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20,
    position: 'relative', overflow: 'hidden',
  },
  safeAreaHeader: { paddingTop: 0 },
  headerTopRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 25, position: 'relative' },
  headerContent: { alignItems: 'center', flex: 1, marginLeft: 0 },
  backButton: {
    position: 'absolute', left: 20,
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center', alignItems: 'center', zIndex: 10,
  },
  titleContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  headerTitle: {
    fontSize: 28, fontWeight: '800', color: '#FFFFFF', marginLeft: 12, letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.2)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4,
  },
  headerSubtitle: { fontSize: 15, color: 'rgba(255, 255, 255, 0.9)', textAlign: 'center', fontWeight: '500', letterSpacing: 0.3 },

  // Particles
  floatingParticle: { position: 'absolute', width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255, 255, 255, 0.4)' },

  // Scroll
  scrollView: {},
  scrollContent: { paddingBottom: 140 },

  // Sections
  sectionContainer: { marginTop: 25, paddingHorizontal: 20 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, paddingHorizontal: 5 },
  sectionTitle: { fontSize: 22, fontWeight: '800', color: '#1F2937', marginLeft: 12, letterSpacing: 0.5, flex: 1 },
  premiumBadge: {
    backgroundColor: '#FF4444', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12,
    shadowColor: '#FF4444', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 4,
  },
  badgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  refreshButton: { marginLeft: 8, marginRight: 8, padding: 8, borderRadius: 20, backgroundColor: 'rgba(253, 80, 30, 0.1)' },
  refreshButtonDisabled: { backgroundColor: 'rgba(136, 136, 136, 0.1)' },

  bookingSection: { marginBottom: 15 },

  // Login prompt
  loginPromptCard: {
    borderRadius: 20, overflow: 'hidden',
    shadowColor: '#FD501E', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8, marginBottom: 25,
  },
  loginPromptGradient: { padding: 30, alignItems: 'center', justifyContent: 'center' },
  loginPromptTitle: {
    fontSize: 22, fontWeight: '800', color: '#FFFFFF', marginTop: 15, marginBottom: 10, textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.2)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2,
  },
  loginPromptText: { fontSize: 15, color: 'rgba(255, 255, 255, 0.9)', textAlign: 'center', lineHeight: 22, marginBottom: 20 },
  loginPromptButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 20,
    borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  loginPromptButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', textAlign: 'center' },

  // Booking cards
  bookingCard: { marginBottom: 15, borderRadius: 20, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 4 },
  cardGradient: { borderRadius: 20 },
  cardContent: { flexDirection: 'row', alignItems: 'center', padding: 20, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.8)' },
  cardLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  cardIndicator: {
    width: 4, height: 40, backgroundColor: '#FFCC00', borderRadius: 2, marginRight: 15,
    shadowColor: '#FFCC00', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 2,
  },
  cardTextContainer: { flex: 1 },
  bookingCount: {
    fontSize: 28, fontWeight: '800', color: '#1F2937', marginBottom: 4, letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.05)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 1,
  },
  bookingStatus: { fontSize: 16, fontWeight: '600', color: '#6B7280', letterSpacing: 0.3 },
  iconContainer: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4, position: 'relative' },
  iconGlow: { position: 'absolute', width: 70, height: 70, borderRadius: 35, top: -5, left: -5 },

  // Points card
  pointsCard: {
    borderRadius: 20, overflow: 'hidden', shadowColor: '#FD501E',
    shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8, marginBottom: 25, position: 'relative',
  },
  pointsGradient: { padding: 25, position: 'relative' },
  pointsContent: { position: 'relative' },
  pointsHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 25 },
  pointsHeaderText: {
    fontSize: 18, color: '#FFFFFF', fontWeight: '700', marginLeft: 10, letterSpacing: 0.5, flex: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.2)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2,
  },
  levelBadge: { backgroundColor: 'rgba(255, 255, 255, 0.25)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.3)' },
  levelText: { color: '#FFFFFF', fontSize: 12, fontWeight: '900', letterSpacing: 1 },
  pointsProgressContainer: { marginBottom: 30 },
  progressBarContainer: { position: 'relative' },
  progressBar: { height: 12, backgroundColor: 'rgba(255, 255, 255, 0.25)', borderRadius: 6, marginBottom: 12, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.3)' },
  progressFill: { height: '100%', minWidth: '2%', borderRadius: 6 },
  progressText: { fontSize: 15, color: 'rgba(255, 255, 255, 0.95)', fontWeight: '600', letterSpacing: 0.5 },
  pointsDisplay: { flexDirection: 'row', alignItems: 'center' },
  pointsCircle: { width: 85, height: 85, borderRadius: 42.5, marginRight: 25, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 15, elevation: 10 },
  circleGradient: { width: '100%', height: '100%', borderRadius: 42.5, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'rgba(255, 255, 255, 0.3)' },
  pointsTextContainer: { flex: 1 },
  pointsNumber: {
    fontSize: 38, fontWeight: '900', color: '#FFFFFF', marginBottom: 6, letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.3)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4,
  },
  pointsLabel: { fontSize: 18, color: 'rgba(255, 255, 255, 0.95)', fontWeight: '700', letterSpacing: 0.5, marginBottom: 2 },
  pointsSubtext: { fontSize: 14, color: 'rgba(255, 255, 255, 0.8)', fontWeight: '500', letterSpacing: 0.3 },

  // CTA buttons
  buttonContainer: { marginTop: 25, paddingHorizontal: 20 },
  refreshCta: {
    borderRadius: 20, overflow: 'hidden',
    shadowColor: '#28A745', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.4, shadowRadius: 20, elevation: 12, marginBottom: 15,
  },
  refreshButtonSolid: { backgroundColor: '#28A745', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, paddingHorizontal: 30, borderRadius: 20 },
  refreshButtonText: {
    color: '#FFFFFF', fontSize: 18, fontWeight: '800', marginLeft: 12, letterSpacing: 0.8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2,
  },
  backCta: {
    borderRadius: 20, overflow: 'hidden',
    shadowColor: '#FD501E', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.4, shadowRadius: 20, elevation: 12,
  },
  backButtonSolid: { backgroundColor: '#FD501E', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, paddingHorizontal: 30, borderRadius: 20 },
  backButtonText: {
    color: '#FFFFFF', fontSize: 18, fontWeight: '800', marginLeft: 12, letterSpacing: 0.8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2,
  },
});

export default Dashboard;
