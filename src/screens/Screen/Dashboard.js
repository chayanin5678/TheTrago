import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, SafeAreaView, Animated, Easing, Dimensions, Platform, StatusBar } from 'react-native';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useLanguage } from './LanguageContext';
import { useCustomer } from './CustomerContext';
import axios from 'axios';
import ipAddress from '../../config/ipconfig';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');


const Dashboard = ({ navigation }) => {
  const { t } = useLanguage();
  const { customerData, updateCustomerData } = useCustomer();
  const [token, setToken] = useState(null);
  const [bookings, setBookings] = useState({ upcoming: 0, cancelled: 0, completed: 0 });
  const [userPoints, setUserPoints] = useState(0);
  const [loading, setLoading] = useState(true);

  // Ultra Premium Animations like ProfileScreen
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  
  // Floating particles animation
  const floatingAnims = useRef(
    [...Array(6)].map(() => ({
      x: new Animated.Value(Math.random() * screenWidth - screenWidth/2),
      y: new Animated.Value(Math.random() * screenHeight * 0.8),
      opacity: new Animated.Value(0.1),
      scale: new Animated.Value(1),
    }))
  ).current;

  // Card staggered animations
  const cardAnims = useRef(
    [...Array(3)].map(() => ({
      opacity: new Animated.Value(0),
      translateY: new Animated.Value(30),
      scale: new Animated.Value(0.9),
    }))
  ).current;

  // Premium animations initialization
  useEffect(() => {
    // Premium entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        delay: 300,
        easing: Easing.bezier(0.175, 0.885, 0.32, 1.275),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1200,
        delay: 500,
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
                duration: 4000 + index * 400,
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
                duration: 2000,
                useNativeDriver: true,
              }),
              Animated.timing(anim.opacity, {
                toValue: 0.1,
                duration: 2000,
                useNativeDriver: true,
              }),
            ]),
            Animated.loop(
              Animated.sequence([
                Animated.timing(anim.scale, {
                  toValue: 1.2,
                  duration: 2500,
                  easing: Easing.inOut(Easing.sin),
                  useNativeDriver: true,
                }),
                Animated.timing(anim.scale, {
                  toValue: 0.8,
                  duration: 2500,
                  easing: Easing.inOut(Easing.sin),
                  useNativeDriver: true,
                }),
              ])
            ),
          ])
        ).start();
      };
      
      setTimeout(() => animateParticle(), index * 500);
    });

    // Card staggered animations
    cardAnims.forEach((anim, index) => {
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(anim.opacity, {
            toValue: 1,
            duration: 700,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(anim.translateY, {
            toValue: 0,
            duration: 700,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(anim.scale, {
            toValue: 1,
            duration: 700,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]).start();
      }, index * 200 + 800);
    });
  }, []);

  // Fetch user points function
  const fetchUserPoints = async () => {
    try {
      if (!customerData?.md_booking_memberid) {
        console.log("❌ No customer data found for points. CustomerData:", customerData);
        setUserPoints(0);
        return;
      }

      console.log("🎯 Fetching user points for member:", customerData.md_booking_memberid);

      // ใช้ endpoint เดียวกันกับ PaymentScreen
      const response = await fetch(`${ipAddress}/userpoints/${customerData.md_booking_memberid}`, {
        method: "GET",
        headers: { 
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
      });

      console.log("✅ Points API response status:", response.status);
      const result = await response.json();
      console.log("✅ Points API response data:", result);

      if (response.ok && result.status === "success") {
        const availablePoints = result.data?.available_points || result.points || 0;
        setUserPoints(availablePoints);
        console.log(`✅ Points fetched successfully: ${availablePoints}`);
      } else {
        console.log("❌ Failed to fetch points:", result.message);
        setUserPoints(0);
      }
    } catch (error) {
      console.error("❌ Error fetching points:", error);
      setUserPoints(0);
    }
  };

  // Fetch bookings data function
  const fetchBookingsData = async () => {
    try {
      if (!customerData?.md_booking_memberid) {
        console.log("❌ No customer data found for bookings. CustomerData:", customerData);
        return;
      }

      // ใช้ userEmail จาก SecureStore เหมือน BookingScreen
      let customerEmail = null;
      try {
        const storedUserEmail = await SecureStore.getItemAsync('userEmail');
        const storedBookingEmail = await SecureStore.getItemAsync('bookingEmail');
        customerEmail = storedUserEmail || storedBookingEmail || customerData?.email || customerData?.md_booking_email;
        
        console.log("📧 Email sources:");
        console.log("   - storedUserEmail:", storedUserEmail);
        console.log("   - storedBookingEmail:", storedBookingEmail);
        console.log("   - customerData.email:", customerData?.email);
        console.log("   - customerData.md_booking_email:", customerData?.md_booking_email);
        console.log("   - Selected email:", customerEmail);
      } catch (error) {
        console.error("❌ Error getting email from SecureStore:", error);
        customerEmail = customerData?.email || customerData?.md_booking_email;
      }
      
      if (!customerEmail) {
        console.log("❌ No email found anywhere for bookings");
        console.log("📊 Customer data available fields:", Object.keys(customerData || {}));
        setBookings({ upcoming: 0, cancelled: 0, completed: 0 });
        return;
      }

      console.log("📊 Fetching bookings for email:", customerEmail);
      console.log("📊 Customer data available fields:", Object.keys(customerData || {}));
      console.log("📊 Full customer data:", {
        email: customerData?.email,
        md_booking_email: customerData?.md_booking_email,
        md_booking_memberid: customerData?.md_booking_memberid,
        Firstname: customerData?.Firstname,
        Lastname: customerData?.Lastname
      });

      // ดึงข้อมูล bookings ทุกสถานะ
      const statuses = [0, 2, 1]; // confirmed, cancelled, completed
      const allBookings = [];

      for (const status of statuses) {
        try {
          console.log(`📋 Fetching bookings for status ${status}...`);
          
          const requestBody = {
            md_booking_email: customerEmail.trim(),
            md_booking_status: status.toString()
          };
          console.log(`📋 Request body for status ${status}:`, requestBody);
          
          const response = await fetch(`${ipAddress}/checkbooking`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
          });

          console.log(`📋 Response status for ${status}:`, response.status);
          
          if (response.ok) {
            const data = await response.json();
            console.log(`📋 Data for status ${status}:`, data);
            if (data && Array.isArray(data.data)) {
              allBookings.push(...data.data.map(booking => ({ ...booking, status })));
              console.log(`📋 Added ${data.data.length} bookings for status ${status}`);
            }
          }
        } catch (error) {
          console.error(`❌ Error fetching bookings for status ${status}:`, error);
        }
      }

      console.log("✅ All bookings fetched:", allBookings.length);
      console.log("📋 All bookings details:", allBookings);

      // นับจำนวนการจองตามสถานะ (ตรงกับ BookingScreen - ไม่กรองตามวันที่)
      const counts = {
        upcoming: allBookings.filter(booking => {
          const isConfirmed = booking.status === 0; // Status 0 = Confirmed (ทั้งหมดไม่ว่าวันไหน)
          console.log(`📋 Upcoming check - Status: ${booking.status}, Is confirmed: ${isConfirmed}`);
          return isConfirmed; // ไม่กรองตามวันที่ ให้แสดงทั้งหมด
        }).length,
        cancelled: allBookings.filter(booking => {
          console.log(`📋 Cancelled check - Status: ${booking.status}`);
          return booking.status === 2; // Status 2 = Cancelled
        }).length,
        completed: allBookings.filter(booking => {
          const isCompleted = booking.status === 1; // Status 1 = Completed
          console.log(`📋 Completed check - Status: ${booking.status}, Is completed: ${isCompleted}`);
          return isCompleted;
        }).length
      };

      setBookings(counts);
      console.log("✅ Bookings data processed:", counts);
      console.log("📊 Final booking counts:");
      console.log("   - Upcoming:", counts.upcoming);
      console.log("   - Cancelled:", counts.cancelled);
      console.log("   - Completed:", counts.completed);
    } catch (error) {
      console.error("❌ Error fetching bookings:", error);
      setBookings({ upcoming: 0, cancelled: 0, completed: 0 });
    }
  };

  // Load data on component mount and when customer data changes
  useEffect(() => {
    const loadData = async () => {
      console.log("🔄 Loading dashboard data...");
      console.log("📋 Full customerData:", JSON.stringify(customerData, null, 2));
      console.log("🆔 md_booking_memberid:", customerData?.md_booking_memberid);
      console.log("📧 email:", customerData?.email);
      
      // ถ้าไม่มี customer data แต่มี token อยู่ ให้พยายาม fetch profile ก่อน
      if (!customerData?.md_booking_memberid) {
        console.log("⚠️ No customer data found, trying to fetch profile...");
        
        try {
          const storedToken = await SecureStore.getItemAsync('userToken');
          if (storedToken) {
            console.log("🎫 Token found, fetching profile...");
            const response = await fetch(`${ipAddress}/profile`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${storedToken}`,
                'Content-Type': 'application/json',
              },
            });

            if (response.ok) {
              const data = await response.json();
              if (data && Array.isArray(data.data) && data.data.length > 0) {
                console.log("✅ Profile fetched successfully, updating customer data");
                const profileData = data.data[0];
                
                // Update customer data จาก profile
                updateCustomerData({
                  Firstname: profileData.md_member_fname,
                  Lastname: profileData.md_member_lname,
                  email: profileData.md_member_email,
                  tel: profileData.md_member_phone,
                  md_booking_memberid: profileData.md_member_id,
                });
                
                // Profile data จะถูก set แล้ว useEffect จะรันอีกครั้งโดยอัตโนมัติ
                return;
              }
            }
          }
        } catch (error) {
          console.error("❌ Error fetching profile:", error);
        }
        
        console.log("⚠️ Waiting for customer data... md_booking_memberid is:", customerData?.md_booking_memberid);
        setLoading(false);
        return;
      }

      if (!customerData?.email && !customerData?.md_booking_email) {
        // ตรวจสอบ SecureStore ด้วยว่ามี email หรือไม่
        try {
          const storedUserEmail = await SecureStore.getItemAsync('userEmail');
          const storedBookingEmail = await SecureStore.getItemAsync('bookingEmail');
          
          if (!storedUserEmail && !storedBookingEmail) {
            console.log("⚠️ No email found anywhere (CustomerData or SecureStore)");
            setLoading(false);
            return;
          }
        } catch (error) {
          console.error("❌ Error checking SecureStore for email:", error);
          setLoading(false);
          return;
        }
      }

      console.log("✅ Customer data found! Starting to load dashboard data...");
      setLoading(true);
      try {
        await Promise.all([
          fetchUserPoints(),
          fetchBookingsData()
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [customerData?.md_booking_memberid, customerData?.email, customerData?.md_booking_email]);

  // Refresh function
  const handleRefresh = async () => {
    if (!loading && customerData?.md_booking_memberid) {
      console.log("🔄 Refreshing dashboard data...");
      setLoading(true);
      try {
        await Promise.all([
          fetchUserPoints(),
          fetchBookingsData()
        ]);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* Set StatusBar for cross-platform consistency */}
      <StatusBar 
        barStyle="light-content" 
        backgroundColor="#FD501E" 
        translucent={Platform.OS === 'android'}
      />
      
      {/* Premium Header with Gradient */}
      <Animated.View 
        style={[
          styles.headerContainer,
          { 
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <LinearGradient
          colors={['#FD501E', '#FF6B35', '#FD501E']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <SafeAreaView style={styles.safeAreaHeader}>
            {/* Floating particles effect */}
            {floatingAnims.map((anim, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.floatingParticle,
                  {
                    transform: [
                      { translateX: anim.x },
                      { translateY: anim.y },
                      { scale: anim.scale }
                    ],
                    opacity: anim.opacity,
                  }
                ]}
              />
            ))}
            
            <Animated.View 
              style={[
                styles.headerContent,
                {
                  opacity: fadeAnim,
                  transform: [{ scale: scaleAnim }]
                }
              ]}
            >
              <View style={styles.titleContainer}>
                <MaterialCommunityIcons name="view-dashboard" size={32} color="#FFFFFF" />
                <Text style={styles.headerTitle}>{t('dashboard') || 'Dashboard'}</Text>
              </View>
              <Text style={styles.headerSubtitle}>
                {customerData?.md_booking_memberid ? 
                  `${t('ultraPremiumAnalytics') || 'Ultra Premium Analytics'} - ID: ${customerData.md_booking_memberid}` :
                  `${t('pleaseLogin') || 'Please Login'}`
                }
              </Text>
              <View style={styles.headerDivider} />
            </Animated.View>
          </SafeAreaView>
        </LinearGradient>
      </Animated.View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
        style={styles.scrollView}
      >
        <Animated.View style={{ 
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }}>
        {/* Show login prompt if no customer data */}
        {!customerData?.md_booking_memberid && (
          <Animated.View 
            style={[
              styles.sectionContainer,
              {
                opacity: cardAnims[0].opacity,
                transform: [
                  { translateY: cardAnims[0].translateY },
                  { scale: cardAnims[0].scale }
                ]
              }
            ]}
          >
            <View style={styles.loginPromptCard}>
              <LinearGradient
                colors={['#FF6B6B', '#FF8E53']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.loginPromptGradient}
              >
                <MaterialCommunityIcons name="account-alert" size={48} color="#FFFFFF" />
                <Text style={styles.loginPromptTitle}>{t('loginRequired') || 'Login Required'}</Text>
                <Text style={styles.loginPromptText}>
                  {t('pleaseLoginToViewDashboard') || 'Please login to view your dashboard and points'}
                </Text>
                <TouchableOpacity 
                  style={styles.loginPromptButton}
                  onPress={() => navigation.navigate('LoginScreen')}
                >
                  <Text style={styles.loginPromptButtonText}>{t('login') || 'Login'}</Text>
                </TouchableOpacity>
              </LinearGradient>
            </View>
          </Animated.View>
        )}

        {/* Show content only if customer data exists */}
        {customerData?.md_booking_memberid && (
          <>
        {/* Premium Bookings Section */}
        <Animated.View 
          style={[
            styles.sectionContainer,
            {
              opacity: cardAnims[0].opacity,
              transform: [
                { translateY: cardAnims[0].translateY },
                { scale: cardAnims[0].scale }
              ]
            }
          ]}
        >
          <View style={styles.sectionHeader}>
            <MaterialIcons name="flight" size={24} color="#FD501E" />
            <Text style={styles.sectionTitle}>{t('myBookings') || 'My Bookings'}</Text>
            <View style={styles.premiumBadge}>
              <Text style={styles.badgeText}>{t('live') || 'LIVE'}</Text>
            </View>
          </View>
          
          <View style={styles.bookingSection}>
            {/* Upcoming Card */}
            <View style={styles.bookingCard}>
              <LinearGradient
                colors={['#FFFFFF', '#FFF8E1']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.cardGradient}
              >
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

            {/* Cancelled Card */}
            <View style={styles.bookingCard}>
              <LinearGradient
                colors={['#FFFFFF', '#FFEBEE']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.cardGradient}
              >
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

            {/* Completed Card */}
            <View style={styles.bookingCard}>
              <LinearGradient
                colors={['#FFFFFF', '#E8F5E8']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.cardGradient}
              >
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

        {/* Premium Points Section */}
        <Animated.View 
          style={[
            styles.sectionContainer,
            {
              opacity: cardAnims[1].opacity,
              transform: [
                { translateY: cardAnims[1].translateY },
                { scale: cardAnims[1].scale }
              ]
            }
          ]}
        >
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="star-circle" size={24} color="#FD501E" />
            <Text style={styles.sectionTitle}>{t('rewardsAndPoints') || 'Rewards & Points'}</Text>
            <TouchableOpacity
              onPress={handleRefresh}
              disabled={loading}
              style={[styles.refreshButton, loading && styles.refreshButtonDisabled]}
            >
              <MaterialCommunityIcons 
                name="refresh" 
                size={20} 
                color={loading ? "#888" : "#FD501E"} 
              />
            </TouchableOpacity>
            <View style={[styles.premiumBadge, { backgroundColor: '#FFD700' }]}>
              <Text style={[styles.badgeText, { color: '#000' }]}>{t('vip') || 'VIP'}</Text>
            </View>
          </View>
          
          <View style={styles.pointsCard}>
            <LinearGradient
              colors={['#FD501E', '#FF6B40', '#FF8A65']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.pointsGradient}
            >
              <View style={styles.pointsContent}>
                <View style={styles.pointsHeader}>
                  <MaterialCommunityIcons name="medal" size={28} color="#ffffff" />
                  <Text style={styles.pointsHeaderText}>{t('premiumRewards') || 'Premium Rewards'}</Text>
                  <View style={styles.levelBadge}>
                    <Text style={styles.levelText}>LV.1</Text>
                  </View>
                </View>

                <View style={styles.pointsProgressContainer}>
                  <View style={styles.progressBarContainer}>
                    <View style={styles.progressBar}>
                      <LinearGradient
                        colors={['#FFFFFF', '#FFE0B2']}
                        style={[styles.progressFill, { 
                          width: `${Math.min((userPoints / 1000) * 100, 100)}%` 
                        }]}
                      />
                    </View>
                    <Text style={styles.progressText}>
                      {userPoints >= 1000 
                        ? (t('maxLevel') || 'คะแนนสูงสุดแล้ว!') 
                        : `${t('maxPoints') || 'คะแนนสูงสุด:'} 1,000 ${t('points') || 'คะแนน'} (${t('remaining') || 'เหลือ'} ${Math.round((1000 - userPoints) * 10) / 10})`
                      }
                    </Text>
                  </View>
                </View>

                <View style={styles.pointsDisplay}>
                  <View style={styles.pointsCircle}>
                    <LinearGradient
                      colors={['#FFD700', '#FFC107']}
                      style={styles.circleGradient}
                    >
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

        {/* Premium Back Button */}
        <Animated.View 
          style={[
            styles.buttonContainer,
            {
              opacity: cardAnims[2].opacity,
              transform: [
                { translateY: cardAnims[2].translateY },
                { scale: cardAnims[2].scale }
              ]
            }
          ]}
        >
          <TouchableOpacity 
            style={styles.refreshButton} 
            onPress={async () => {
              setLoading(true);
              await Promise.all([
                fetchUserPoints(),
                fetchBookingsData()
              ]);
              setLoading(false);
            }}
            activeOpacity={0.8}
          >
            <View style={styles.refreshButtonSolid}>
              <MaterialIcons name="refresh" size={24} color="#FFFFFF" />
              <Text style={styles.refreshButtonText}>{t('refresh') || 'Refresh Data'}</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
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
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  // Ultra Premium Header Styles
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 2,
    ...Platform.select({
      android: {
        paddingTop: 0 || 0,
      },
    }),
  },
  headerGradient: {
    paddingTop: Platform.OS === 'android' ? 40 : 0,
    paddingBottom: 25,
    paddingHorizontal: 25,
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
    shadowColor: '#FD501E',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  safeAreaHeader: {
    paddingTop: 0,
  },
  headerContent: {
    alignItems: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    marginLeft: 12,
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.95)',
    textAlign: 'center',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  headerDivider: {
    width: 60,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 2,
    marginTop: 0,
  },
  // Floating Particles
  floatingParticle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  scrollView: {
    marginTop: 150,
  },
  scrollContent: {
    paddingBottom: 140,
  },
  sectionContainer: {
    marginTop: 25,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 5,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1F2937',
    marginLeft: 12,
    letterSpacing: 0.5,
    flex: 1,
  },
  premiumBadge: {
    backgroundColor: '#FF4444',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    shadowColor: '#FF4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  refreshButton: {
    marginLeft: 8,
    marginRight: 8,
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(253, 80, 30, 0.1)',
  },
  refreshButtonDisabled: {
    backgroundColor: 'rgba(136, 136, 136, 0.1)',
  },
  bookingSection: {
    marginBottom: 15,
  },
  // Login Prompt Card Styles
  loginPromptCard: {
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.4,
    shadowRadius: 25,
    elevation: 15,
    marginBottom: 25,
  },
  loginPromptGradient: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginPromptTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 20,
    marginBottom: 15,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  loginPromptText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  loginPromptButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  loginPromptButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  // Premium Booking Card Styles
  bookingCard: {
    marginBottom: 18,
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  cardGradient: {
    borderRadius: 25,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 25,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardIndicator: {
    width: 6,
    height: 50,
    backgroundColor: '#FFCC00',
    borderRadius: 3,
    marginRight: 20,
    shadowColor: '#FFCC00',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
  },
  cardTextContainer: {
    flex: 1,
  },
  bookingCount: {
    fontSize: 36,
    fontWeight: '900',
    color: '#1F2937',
    marginBottom: 6,
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  bookingStatus: {
    fontSize: 18,
    fontWeight: '700',
    color: '#6B7280',
    letterSpacing: 0.5,
  },
  iconContainer: {
    width: 75,
    height: 75,
    borderRadius: 37.5,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
    position: 'relative',
  },
  iconGlow: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    top: -7.5,
    left: -7.5,
  },
  // Premium Points Card Styles
  pointsCard: {
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: '#FD501E',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.4,
    shadowRadius: 25,
    elevation: 15,
    marginBottom: 25,
    position: 'relative',
  },
  pointsGradient: {
    padding: 30,
    position: 'relative',
  },
  pointsContent: {
    position: 'relative',
  },
  pointsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },
  pointsHeaderText: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '800',
    marginLeft: 12,
    letterSpacing: 0.8,
    flex: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  levelBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  levelText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },
  pointsProgressContainer: {
    marginBottom: 30,
  },
  progressBarContainer: {
    position: 'relative',
  },
  progressBar: {
    height: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 6,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  progressFill: {
    height: '100%',
    minWidth: '2%', // ให้มีขนาดขั้นต่ำเพื่อให้เห็นแถบ
    borderRadius: 6,
  },
  progressText: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.95)',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  pointsDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pointsCircle: {
    width: 85,
    height: 85,
    borderRadius: 42.5,
    marginRight: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  circleGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 42.5,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  pointsTextContainer: {
    flex: 1,
  },
  pointsNumber: {
    fontSize: 38,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 6,
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  pointsLabel: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.95)',
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  pointsSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  // Premium Button Styles
  buttonContainer: {
    marginTop: 25,
    paddingHorizontal: 20,
  },
  refreshButton: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#28A745',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
    marginBottom: 15,
  },
  refreshButtonSolid: {
    backgroundColor: '#28A745',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 30,
    borderRadius: 20,
  },
  refreshButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    marginLeft: 12,
    letterSpacing: 0.8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  backButton: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#FD501E',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
  },
  backButtonSolid: {
    backgroundColor: '#FD501E',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 30,
    borderRadius: 20,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    marginLeft: 12,
    letterSpacing: 0.8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
  
export default Dashboard;
