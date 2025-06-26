import React, { useRef, useEffect, useState, useCallback, memo, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar, Animated, Dimensions, PanGestureHandler } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Icon from 'react-native-vector-icons/FontAwesome';
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

// Enhanced Section Component - moved outside and memoized
const AnimatedSection = memo(({ children, delay = 0, index = 0 }) => {
  const animValue = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [hasAnimated, setHasAnimated] = useState(false);
  
  useEffect(() => {
    if (!hasAnimated) {
      const timer = setTimeout(() => {
        Animated.timing(animValue, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }).start();

        // Subtle pulse animation
        Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.02,
              duration: 2000,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 2000,
              useNativeDriver: true,
            }),
          ])
        ).start();
        
        setHasAnimated(true);
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [hasAnimated, delay]);

  return (
    <Animated.View
      style={{
        opacity: animValue,
        transform: [
          {
            translateY: animValue.interpolate({
              inputRange: [0, 1],
              outputRange: [50, 0],
            }),
          },
          {
            scale: pulseAnim,
          },
        ],
      }}
    >
      {children}
    </Animated.View>
  );
});

export default function TermsScreen({ navigation }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const scrollY = useRef(new Animated.Value(0)).current;
  const [scrollOffset, setScrollOffset] = useState(0);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Floating animation for particles
  const floatingAnims = useRef([...Array(12)].map(() => new Animated.Value(0))).current;

  useEffect(() => {
    if (!hasInitialized) {
      // Main entrance animations
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 80,
          friction: 6,
          useNativeDriver: true,
        }),
      ]).start();

      // Continuous floating animations
      floatingAnims.forEach((anim, index) => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(anim, {
              toValue: 1,
              duration: 3000 + Math.random() * 2000,
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 0,
              duration: 3000 + Math.random() * 2000,
              useNativeDriver: true,
            }),
          ])
        ).start();
      });
      
      setHasInitialized(true);
    }
  }, [hasInitialized]);

  // Memoized scroll handler to prevent re-creation
  const handleScroll = useCallback(
    Animated.event(
      [{ nativeEvent: { contentOffset: { y: scrollY } } }],
      { 
        useNativeDriver: false,
        listener: (event) => {
          setScrollOffset(event.nativeEvent.contentOffset.y);
        }
      }
    ),
    []
  );

  // Memoized section data to prevent re-creation
  const sectionData = useMemo(() => [
    { num: 1, title: 'Copyright', content: 'The Trago.com (Company Registration No.0905560003303) The Trago.com is the sole owner or lawful license of all right to www.thetrago.com' },
    { num: 2, title: 'Confirmation', content: 'Customers are responsible to make sure the selection on travelling date, time and destination are correct before making payment. By making payment and the issuance of Order Summary/Booking number/ Itinerary, the seats are confirmed immediately. All passengers above the age of 3 years old will be required to purchase a seat.' },
    { num: 3, title: 'Cancellations and Refunds', content: 'Refunds are not available if the travel date is less than 72 hours away. Cancellations must be requested at least 72 hours before departure to qualify for a refund. Refunds will be processed within 1-7 business days to the original payment method.' },
    { num: 4, title: 'Validity', content: 'Ferry voucher is issued in the passenger\'s name which is personal and non-transferable. It is valid only for the date and the trip for which it was issued.' },
    { num: 5, title: 'Check-in', content: 'All Passenger(s) has to contact to check-in at the counter at least 30 minutes in advance before departure time.\n\nFor foreign tourists might take more time at immigration so it is passenger(s) responsibility to make sure you can reach it on time before the ferry leaves. If passenger fail to board on time, passenger has to arrange your own transport to the destination.\n\nIn case a customer is more than the total that stated on the voucher or infant ages is over than boat company conditions , the boat company will charge the difference of amount from a customer right away at the counter.' },
    { num: 6, title: 'Ferry Voucher', content: 'The voucher will send to you on e-mail when your booking is completed. If you have not received the voucher, please contact us by email or phone call to inform us the issues. Our customer support team will assist you to check and resend the voucher.\n\nPlease print the voucher or screen shot on your phone to show to the staff.\n\nThe Trago reserves the right to automatically change your reserved ticket itinerary if there are services for the same route or close round.' },
    { num: 7, title: 'No Show', content: 'If you are unable to board the ferry or bus on time or according to the schedule, you will be charged the full fare and will not be refunded.' },
    { num: 8, title: 'Passenger\'s Ticket Conditions', content: 'Company is not responsible for any delay for boarding, deviation or modification of the scheduled route, due to bad weather conditions or pier authority orders. Passengers are entitled to carry maximum 2 pieces of baggage and maximum weight of the total luggage is 15 kilograms. The company is not responsible for any damage or loss of luggage retained under passenger\'s personal care during the trip.' },
    { num: 9, title: 'Shuttle Companies Rights', content: 'Shuttle Company reserves the right to change or amend the itineraries without prior notice. Van/Bus seating depending on company design. The Trago.com will not responsible for any sudden change in van/bus schedules and customer waiting at the wrong boarding/pick-up point.' },
    { num: 10, title: 'Van/Bus Seating Requirement', content: 'Company will provide the van/bus that are either self-owned or on charter from third parties. Company makes reasonable efforts to deliver the type of vehicle accord to what the customer booked for. However, the company reserves the right to replace, downgrade or upgrade the vehicle type booked by the customers in the event of unforeseen circumstances.\n\nThe company will not be held responsible for any contingent cost incurred by the customer arising from the van/bus delay.\n\nAll passengers above the age of 3 years old will be required to purchase a seat. The company shall not be responsible for any legal implications resulted from passengers not complying with the regularities.' },
    { num: 11, title: 'Legal Notice', content: 'The Trago.com will not liable and will not refund due to any action carried out by our ferry/shuttle company partners, or any event happens at our partner\'s side. For instances, The Trago.com will not be responsible for any sudden change from ferry company or shuttle company , seat number(s), schedules, departure date & time, arrival date & time, loss or accident incurred while taking the ferry/shuttle or no ferry/shuttle service provided. However, customer may complain to us, and we will take necessary actions to prevent such things from happen again in the future.' },
    { num: 12, title: 'Financial Proof', content: 'I confirm that the proof of payment. (Transfer slip) is a true and correct document It is not a fake document. Add or shorten the message Or modify by any means If it is later detected that it is a fake document I solely accept my breach of the law.' }
  ], []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* The Trago White-Orange Theme Background */}
      <View style={styles.backgroundContainer}>
        {/* Premium White Background with Orange Accents */}
        <LinearGradient
          colors={['#ffffff', '#fefefe', '#fff8f3', '#fef7f0', '#ffffff']}
          style={StyleSheet.absoluteFillObject}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        
        {/* Ferry & Wave Animated Particles - Orange Theme */}
        <View style={styles.particlesContainer}>
          {[...Array(8)].map((_, i) => (
            <Animated.View
              key={`wave-${i}`}
              style={[
                styles.waveParticle,
                {
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  transform: [
                    {
                      translateY: floatingAnims[i].interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, Math.random() * 80 - 40],
                      }),
                    },
                    {
                      translateX: floatingAnims[i].interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, Math.random() * 40 - 20],
                      }),
                    },
                    {
                      scale: floatingAnims[i].interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: [0.3, 1, 0.5],
                      }),
                    },
                  ],
                  opacity: floatingAnims[i].interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0.2, 0.5, 0.2],
                  }),
                },
              ]}
            />
          ))}
          
          {/* Ferry Icons - Orange Theme */}
          {[...Array(4)].map((_, i) => (
            <Animated.View
              key={`ferry-${i}`}
              style={[
                styles.ferryIcon,
                {
                  left: `${20 + Math.random() * 60}%`,
                  top: `${10 + Math.random() * 80}%`,
                  transform: [
                    {
                      translateX: floatingAnims[i + 8].interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 100],
                      }),
                    },
                  ],
                  opacity: floatingAnims[i + 8].interpolate({
                    inputRange: [0, 0.3, 0.7, 1],
                    outputRange: [0, 0.7, 0.7, 0],
                  }),
                },
              ]}
            >
              <MaterialIcons name="directions-boat" size={16} color="rgba(253,80,30,0.5)" />
            </Animated.View>
          ))}
        </View>

        {/* White-Orange Geometric Shapes */}
        <View style={styles.geometricShapes}>
          <Animated.View style={[styles.tragoShape1, {
            transform: [{
              rotate: scrollY.interpolate({
                inputRange: [0, 1000],
                outputRange: ['0deg', '360deg'],
                extrapolate: 'clamp',
              })
            }]
          }]}>
            <MaterialIcons name="anchor" size={24} color="rgba(253,80,30,0.4)" />
          </Animated.View>
          <Animated.View style={[styles.tragoShape2, {
            transform: [{
              rotate: scrollY.interpolate({
                inputRange: [0, 1000],
                outputRange: ['360deg', '0deg'],
                extrapolate: 'clamp',
              })
            }]
          }]}>
            <MaterialIcons name="waves" size={20} color="rgba(253,80,30,0.3)" />
          </Animated.View>
        </View>
      </View>
      
      {/* Fixed Header - Solid Orange */}
      <View style={styles.headerBlur}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-left" size={20} color="#FD501E" />
          </TouchableOpacity>
          
          <Animated.Text 
            style={[
              styles.headerTitle,
              {
                opacity: fadeAnim,
                transform: [
                  { scale: scaleAnim }
                ],
              },
            ]}
          >
            Terms of Use
          </Animated.Text>
          
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerActionButton}>
              <Ionicons name="bookmark-outline" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          
          {/* Dynamic Header Decorations */}
          <Animated.View style={[styles.headerDecoration1, {
            transform: [{
              scale: scrollY.interpolate({
                inputRange: [0, 100],
                outputRange: [1, 1.2],
                extrapolate: 'clamp',
              })
            }]
          }]} />
          <Animated.View style={[styles.headerDecoration2, {
            transform: [{
              scale: scrollY.interpolate({
                inputRange: [0, 100],
                outputRange: [1, 0.8],
                extrapolate: 'clamp',
              })
            }]
          }]} />
        </View>
      </View>

      {/* White-Orange Floating Elements */}
      <View style={styles.floatingElements}>
        {/* Floating Ferry & Travel Icons - Orange Theme */}
        <Animated.View style={[styles.floatingIcon1, {
          transform: [{
            translateY: scrollY.interpolate({
              inputRange: [0, 200],
              outputRange: [0, -20],
              extrapolate: 'clamp',
            })
          }, {
            rotate: scrollY.interpolate({
              inputRange: [0, 200],
              outputRange: ['0deg', '15deg'],
              extrapolate: 'clamp',
            })
          }]
        }]}>
          <BlurView intensity={40} tint="light" style={styles.floatingIconBlur}>
            <LinearGradient
              colors={['rgba(253,80,30,0.9)', 'rgba(255,107,53,0.8)']}
              style={styles.floatingIconGradient}
            >
              <MaterialIcons name="directions-boat" size={18} color="#fff" />
            </LinearGradient>
          </BlurView>
        </Animated.View>

        <Animated.View style={[styles.floatingIcon2, {
          transform: [{
            translateY: scrollY.interpolate({
              inputRange: [0, 200],
              outputRange: [0, 15],
              extrapolate: 'clamp',
            })
          }, {
            rotate: scrollY.interpolate({
              inputRange: [0, 200],
              outputRange: ['0deg', '-10deg'],
              extrapolate: 'clamp',
            })
          }]
        }]}>
          <BlurView intensity={40} tint="light" style={styles.floatingIconBlur}>
            <LinearGradient
              colors={['rgba(255,107,53,0.9)', 'rgba(255,140,80,0.8)']}
              style={styles.floatingIconGradient}
            >
              <MaterialIcons name="location-on" size={20} color="#fff" />
            </LinearGradient>
          </BlurView>
        </Animated.View>

        <Animated.View style={[styles.floatingIcon3, {
          transform: [{
            translateY: scrollY.interpolate({
              inputRange: [0, 200],
              outputRange: [0, -25],
              extrapolate: 'clamp',
            })
          }, {
            scale: scrollY.interpolate({
              inputRange: [0, 100],
              outputRange: [1, 1.1],
              extrapolate: 'clamp',
            })
          }]
        }]}>
          <BlurView intensity={40} tint="light" style={styles.floatingIconBlur}>
            <LinearGradient
              colors={['rgba(253,80,30,0.8)', 'rgba(255,107,53,0.9)']}
              style={styles.floatingIconGradient}
            >
              <MaterialIcons name="schedule" size={16} color="#fff" />
            </LinearGradient>
          </BlurView>
        </Animated.View>
      </View>

      <Animated.ScrollView 
        style={styles.scrollContainer} 
        contentContainerStyle={styles.content} 
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentInsetAdjustmentBehavior="automatic"
      >
        {/* Enhanced Hero Section */}
        <AnimatedSection>
          <View style={styles.heroSection}>
            <LinearGradient
              colors={['#fff', '#f8f9ff', '#fff']}
              style={styles.heroGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {/* Hero Background Decorations */}
              <View style={styles.heroDecorations}>
                <Animated.View style={[styles.heroDecor1, {
                  transform: [{
                    scale: scaleAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 1],
                    })
                  }, {
                    rotate: scaleAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '360deg'],
                    })
                  }]
                }]} />
                <Animated.View style={[styles.heroDecor2, {
                  transform: [{
                    scale: scaleAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 1],
                    })
                  }, {
                    rotate: scaleAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['360deg', '0deg'],
                    })
                  }]
                }]} />
              </View>
              <Animated.View 
                style={[
                  styles.iconContainer,
                  {
                    transform: [
                      { scale: scaleAnim },
                      { 
                        rotate: scaleAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0deg', '360deg'],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <LinearGradient
                  colors={['#FD501E', '#FF6B35']}
                  style={styles.iconGradient}
                >
                  <MaterialIcons name="directions-boat" size={36} color="#fff" />
                </LinearGradient>
              </Animated.View>
              <Text style={styles.title}>Terms & Conditions</Text>
              <Text style={styles.heroSubtitle}>Please read our terms and conditions before using our services</Text>
              
              {/* Floating Badge */}
              <View style={styles.floatingBadge}>
                <LinearGradient
                  colors={['#FD501E', '#FF6B35']}
                  style={styles.floatingBadgeGradient}
                >
                  <Text style={styles.badgeText}>Legal Document</Text>
                </LinearGradient>
              </View>
            </LinearGradient>
          </View>
        </AnimatedSection>
        
        <AnimatedSection delay={200}>
          <View style={styles.companyInfo}>
            <LinearGradient
              colors={['#FD501E', '#FF6B35']}
              style={styles.companyGradient}
            >
              <MaterialIcons name="business" size={24} color="#fff" style={styles.companyIcon} />
              <Text style={styles.companyTitle}>The Trago</Text>
              <Text style={styles.companySubtitle}>Ferry & Transportation Services</Text>
              <View style={styles.companyBadge}>
                <Text style={styles.companyBadgeText}>Est. 2023</Text>
              </View>
            </LinearGradient>
          </View>
        </AnimatedSection>

        {sectionData.map((section, index) => (
          <AnimatedSection key={`section-${section.num}`} delay={300 + index * 100}>
            <View style={[styles.section, section.num % 2 === 0 && styles.sectionAlternate]}>
              {/* Premium Glass Morphism Background */}
              <BlurView 
                intensity={section.num % 2 === 0 ? 60 : 40} 
                tint={section.num % 2 === 0 ? "light" : "extraLight"} 
                style={styles.sectionBlur}
              >
                <LinearGradient
                  colors={section.num % 2 === 0 ? 
                    ['rgba(253,80,30,0.06)', 'rgba(255,107,53,0.04)', 'rgba(255,140,80,0.06)'] : 
                    ['rgba(255,255,255,0.98)', 'rgba(255,250,245,0.99)', 'rgba(255,247,240,0.98)']
                  }
                  style={styles.sectionGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  {/* Premium Section Border */}
                  <View style={[styles.sectionBorder, section.num % 2 === 0 && styles.sectionBorderAlt]} />
                  
                  {/* Floating Section Decorations */}
                  <View style={styles.sectionDecorations}>
                    <Animated.View style={[styles.sectionDecor1, {
                      transform: [{
                        scale: scrollY.interpolate({
                          inputRange: [index * 200, (index + 1) * 200],
                          outputRange: [0.8, 1.2],
                          extrapolate: 'clamp',
                        })
                      }]
                    }]} />
                    <Animated.View style={[styles.sectionDecor2, {
                      opacity: scrollY.interpolate({
                        inputRange: [index * 150, (index + 1) * 150],
                        outputRange: [0.3, 0.8],
                        extrapolate: 'clamp',
                      })
                    }]} />
                  </View>
                <View style={styles.sectionHeader}>
                  <LinearGradient
                    colors={section.num % 2 === 0 ? 
                      ['#FF6B35', '#FD501E'] : 
                      ['#FD501E', '#FF6B35']
                    }
                    style={styles.numberBadge}
                  >
                    <Text style={styles.numberText}>{section.num}</Text>
                  </LinearGradient>
                  <Text style={styles.sectionTitle}>{section.title}</Text>
                  <View style={styles.sectionDecoration} />
                </View>
                <Text style={styles.text}>{section.content}</Text>
                
                {section.num === 11 && (
                  <>
                    <View style={styles.listContainer}>
                      <LinearGradient
                        colors={['#fff7f1', '#fff']}
                        style={styles.listGradient}
                      >
                        <Text style={styles.listTitle}>
                          <MaterialIcons name="warning" size={16} color="#FD501E" /> The Trago.com will not include the following responsibilities:
                        </Text>
                        {[
                          'Ferry/Shuttle not departing / reaching on time.',
                          'Maintaining the quality of Ferry/Shuttle, staff behavior and punctuality.',
                          'Ferry/Shuttle operator canceling the service due to unavoidable reasons.',
                          'The baggage of the customer getting lost / stolen / damaged.',
                          'The customer waiting at the wrong boarding point/pick-up point.',
                          'The Ferry/Shuttle operator changing the boarding point and/or using a pick-up vehicle.',
                          'Any sudden change in Ferry/Shuttle schedules, departure & arrival times.',
                          'Ferry / shuttle operators requesting fare increase before travelling.'
                        ].map((item, idx) => (
                          <View key={`responsibility-${idx}`} style={styles.listItem}>
                            <LinearGradient
                              colors={['#FD501E', '#FF6B35']}
                              style={styles.listBulletGradient}
                            >
                              <Text style={styles.listBulletText}>•</Text>
                            </LinearGradient>
                            <Text style={styles.listText}>{item}</Text>
                          </View>
                        ))}
                      </LinearGradient>
                    </View>
                  </>
                )}
                </LinearGradient>
              </BlurView>
            </View>
          </AnimatedSection>
        ))}

        <View style={styles.bottomPadding} />
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  geometricShapes: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  tragoShape1: {
    position: 'absolute',
    top: 120,
    right: 40,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FD501E',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  tragoShape2: {
    position: 'absolute',
    bottom: 180,
    left: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF6B35',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  waveParticle: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(253,80,30,0.4)',
  },
  ferryIcon: {
    position: 'absolute',
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  particlesContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  // Header Blur Styles
  headerBlur: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    overflow: 'hidden',
    backgroundColor: '#FD501E', // Solid orange background
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerActionButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginLeft: 8,
  },
  particle: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FD501E',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingTop: 40,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: 'transparent', // Remove any background color
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 10,
  },
  headerDecoration1: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  headerDecoration2: {
    position: 'absolute',
    bottom: -30,
    left: -30,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  backButton: {
    padding: 12,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.8)',
    shadowColor: '#FD501E',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  placeholder: {
    width: 48,
  },
  scrollContainer: {
    flex: 1,
  },
  content: {
    paddingTop: 100,
    paddingBottom: 40,
  },
  heroSection: {
    marginHorizontal: 20,
    marginTop: 0,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  heroGradient: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 30,
    position: 'relative',
  },
  iconContainer: {
    marginBottom: 20,
    position: 'relative',
  },
  iconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FD501E',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 12,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  floatingBadge: {
    position: 'absolute',
    top: 15,
    right: 15,
    borderRadius: 15,
    shadowColor: '#FD501E',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
    overflow: 'hidden',
  },
  floatingBadgeGradient: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  companyInfo: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  companyGradient: {
    alignItems: 'center',
    paddingVertical: 25,
    paddingHorizontal: 30,
    position: 'relative',
  },
  companyIcon: {
    marginBottom: 8,
  },
  companyTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  companySubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    fontStyle: 'italic',
  },
  companyBadge: {
    position: 'absolute',
    top: 10,
    right: 15,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  companyBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  section: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
  sectionAlternate: {
    shadowColor: '#4299e1',
    shadowOpacity: 0.05,
  },
  sectionGradient: {
    padding: 24,
    position: 'relative',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  numberBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    shadowColor: '#FD501E',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  numberText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2d3748',
    flex: 1,
  },
  sectionDecoration: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FD501E',
    opacity: 0.6,
  },
  text: {
    fontSize: 16,
    lineHeight: 26,
    color: '#4a5568',
    textAlign: 'justify',
  },
  listContainer: {
    marginTop: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  listGradient: {
    padding: 20,
  },
  listTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  listBulletGradient: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  listBulletText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
  },
  listText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#4a5568',
    flex: 1,
  },
  // Premium Floating Elements Styles
  floatingElements: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 5,
    pointerEvents: 'none',
  },
  floatingIcon1: {
    position: 'absolute',
    top: height * 0.25,
    right: 30,
    zIndex: 6,
  },
  floatingIcon2: {
    position: 'absolute',
    top: height * 0.45,
    left: 25,
    zIndex: 6,
  },
  floatingIcon3: {
    position: 'absolute',
    top: height * 0.65,
    right: 40,
    zIndex: 6,
  },
  floatingIconBlur: {
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: '#FD501E',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 15,
  },
  floatingIconGradient: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Hero Decorations
  heroDecorations: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  heroDecor1: {
    position: 'absolute',
    top: 20,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(253,80,30,0.08)',
  },
  heroDecor2: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,107,53,0.12)',
  },
  // Premium Section Styles
  sectionBlur: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#FD501E',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  sectionBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(253,80,30,0.1)',
  },
  sectionBorderAlt: {
    borderColor: 'rgba(255,107,53,0.15)',
  },
  sectionDecorations: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  sectionDecor1: {
    position: 'absolute',
    top: 15,
    right: 15,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(253,80,30,0.06)',
  },
  sectionDecor2: {
    position: 'absolute',
    bottom: 15,
    left: 15,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255,107,53,0.08)',
  },
  bottomPadding: {
    height: 60,
  },
});
