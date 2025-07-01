import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, SafeAreaView, Animated, Easing } from 'react-native';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';


const Dashboard = ({ navigation }) => {
  const [token, setToken] = useState(null);
  const [bookings, setBookings] = useState({ upcoming: 0, cancelled: 0, completed: 0 });
  const [accumulatedPoints, setAccumulatedPoints] = useState(0);

  // Ultra Premium Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Premium entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        delay: 200,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 700,
        delay: 400,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous pulse animation for points
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Rotation animation for premium elements
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 20000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

 
  return (
    <View style={styles.container}>
      {/* Ultra Premium Header with Gradient - Full Screen */}
      <Animated.View
        style={[
          styles.headerContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <LinearGradient
          colors={['#FD501E', '#FF6B40', '#FD501E']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <SafeAreaView style={styles.safeAreaHeader}>
            {/* Floating particles effect */}
            <Animated.View style={[styles.particle1, { transform: [{ rotate: spin }] }]} />
            <Animated.View style={[styles.particle2, { transform: [{ rotate: spin }] }]} />
            <Animated.View style={[styles.particle3, { transform: [{ rotate: spin }] }]} />
            
            <Animated.View 
              style={[
                styles.headerContent,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }]
                }
              ]}
            >
              <View style={styles.titleContainer}>
                <MaterialCommunityIcons name="view-dashboard" size={32} color="#FFFFFF" />
                <Text style={styles.headerTitle}>Dashboard</Text>
              </View>
              <Text style={styles.headerSubtitle}>Ultra Premium Analytics</Text>
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
        {/* Ultra Premium Bookings Section */}
        <Animated.View 
          style={[
            styles.sectionContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }, { scale: scaleAnim }]
            }
          ]}
        >
          <View style={styles.sectionHeader}>
            <MaterialIcons name="flight" size={24} color="#FD501E" />
            <Text style={styles.sectionTitle}>My Bookings</Text>
            <View style={styles.premiumBadge}>
              <Text style={styles.badgeText}>LIVE</Text>
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
                      <Text style={styles.bookingCount}>{bookings.upcoming}</Text>
                      <Text style={styles.bookingStatus}>Upcoming</Text>
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
                      <Text style={styles.bookingCount}>{bookings.cancelled}</Text>
                      <Text style={styles.bookingStatus}>Cancelled</Text>
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
                      <Text style={styles.bookingCount}>{bookings.completed}</Text>
                      <Text style={styles.bookingStatus}>Completed</Text>
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

        {/* Ultra Premium Points Section */}
        <Animated.View 
          style={[
            styles.sectionContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: pulseAnim }]
            }
          ]}
        >
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="star-circle" size={24} color="#FD501E" />
            <Text style={styles.sectionTitle}>Rewards & Points</Text>
            <View style={[styles.premiumBadge, { backgroundColor: '#FFD700' }]}>
              <Text style={[styles.badgeText, { color: '#000' }]}>VIP</Text>
            </View>
          </View>
          
          <View style={styles.pointsCard}>
            <LinearGradient
              colors={['#FD501E', '#FF6B40', '#FF8A65']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.pointsGradient}
            >
              {/* Floating elements */}
              <Animated.View style={[styles.floatingElement1, { transform: [{ rotate: spin }] }]} />
              <Animated.View style={[styles.floatingElement2, { transform: [{ rotate: spin }] }]} />
              
              <View style={styles.pointsContent}>
                <View style={styles.pointsHeader}>
                  <MaterialCommunityIcons name="medal" size={28} color="#ffffff" />
                  <Text style={styles.pointsHeaderText}>Premium Rewards</Text>
                  <View style={styles.levelBadge}>
                    <Text style={styles.levelText}>LV.1</Text>
                  </View>
                </View>

                <View style={styles.pointsProgressContainer}>
                  <View style={styles.progressBarContainer}>
                    <View style={styles.progressBar}>
                      <LinearGradient
                        colors={['#FFFFFF', '#FFE0B2']}
                        style={styles.progressFill}
                      />
                    </View>
                    <Text style={styles.progressText}>Next Level: 1000 points</Text>
                  </View>
                </View>

                <View style={styles.pointsDisplay}>
                  <Animated.View 
                    style={[
                      styles.pointsCircle,
                      { transform: [{ scale: pulseAnim }] }
                    ]}
                  >
                    <LinearGradient
                      colors={['#FFD700', '#FFC107']}
                      style={styles.circleGradient}
                    >
                      <MaterialCommunityIcons name="star" size={36} color="#FD501E" />
                    </LinearGradient>
                  </Animated.View>
                  <View style={styles.pointsTextContainer}>
                    <Text style={styles.pointsNumber}>0</Text>
                    <Text style={styles.pointsLabel}>Total Points</Text>
                    <Text style={styles.pointsSubtext}>Earn more by traveling</Text>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </View>
        </Animated.View>

        {/* Ultra Premium Back Button */}
        <Animated.View
          style={[
            styles.buttonContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <View style={styles.backButtonSolid}>
              <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
              <Text style={styles.backButtonText}>Back to Profile</Text>
            </View>
          </TouchableOpacity>
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
  },
  headerGradient: {
    paddingTop: 0,
    paddingBottom: 25,
    paddingHorizontal: 25,
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
    shadowColor: '#FD501E',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 15,
    position: 'relative',
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
    marginTop: 10,
  },
  // Floating Particles
  particle1: {
    position: 'absolute',
    top: 20,
    right: 30,
    width: 15,
    height: 15,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  particle2: {
    position: 'absolute',
    top: 50,
    left: 40,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  particle3: {
    position: 'absolute',
    bottom: 30,
    right: 50,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  scrollView: {
    marginTop: 150, // ลด margin top ตาม padding bottom ที่ลดลง
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
  bookingSection: {
    marginBottom: 15,
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
  floatingElement1: {
    position: 'absolute',
    top: 20,
    right: 25,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  floatingElement2: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    width: 15,
    height: 15,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
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
    width: '0%',
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
