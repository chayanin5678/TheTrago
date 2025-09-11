import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  Animated, 
  Dimensions,
  SafeAreaView,
  StatusBar,
  Platform,
  Alert,
  Linking,
  Easing
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, MaterialIcons, Feather, FontAwesome5 } from '@expo/vector-icons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import ipAddress from "../../config/ipconfig";
import axios from 'axios';
import { useLanguage } from './LanguageContext';

const { width, height } = Dimensions.get('window');

export default function ContactScreen({ navigation }) {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  // Premium animations ที่สอดคล้องกับหน้าอื่น
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const headerAnim = useRef(new Animated.Value(-100)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  // Menu animations สำหรับ contact methods
  const contactMethodAnims = useRef(
    [...Array(4)].map(() => ({
      opacity: new Animated.Value(0),
      translateY: new Animated.Value(30),
      scale: new Animated.Value(0.9),
    }))
  ).current;

  useEffect(() => {
    // Ultra premium entrance animations แบบเดียวกับหน้าอื่น
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
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1200,
        delay: 500,
        easing: Easing.out(Easing.back(1.2)),
        useNativeDriver: true,
      }),
      Animated.timing(headerAnim, {
        toValue: 0,
        duration: 1200,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animation for hero icon
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Staggered animations for contact methods
    contactMethodAnims.forEach((anim, index) => {
      Animated.parallel([
        Animated.timing(anim.opacity, {
          toValue: 1,
          duration: 600,
          delay: 800 + index * 200,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(anim.translateY, {
          toValue: 0,
          duration: 800,
          delay: 800 + index * 200,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true,
        }),
        Animated.timing(anim.scale, {
          toValue: 1,
          duration: 600,
          delay: 800 + index * 200,
          easing: Easing.out(Easing.back(1.2)),
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      Alert.alert(t('incompleteInformation') || 'Incomplete Information', t('pleaseFillAllRequiredFields') || 'Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // ส่งข้อมูลไปยัง API ของเราเอง
      const response = await axios.post(`${ipAddress}/send-contact-email`, {
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message
      }, {
        timeout: 15000, // 15 วินาที timeout
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // ตรวจสอบการตอบกลับจาก API
      if (response.status === 200 && response.data.status === 'success') {
        Alert.alert(
          t('messageSentSuccessfully') || 'Message sent successfully! ✅',
          t('thankYouForContacting') || 'Thank you for contacting us. We will reply within 24 hours',
          [{ text: t('ok') || 'OK', onPress: () => setFormData({ name: '', email: '', subject: '', message: '' }) }]
        );
      } else {
        throw new Error(response.data.message || 'Server error');
      }
    } catch (error) {
      console.log('API Error:', error.message);
      
      // แสดงข้อความ error ที่เหมาะสม
      let errorMessage = t('unableToSendMessage') || 'Unable to send message at the moment.';
      
      if (error.response) {
        // Server ตอบกลับมาแต่มี error
        errorMessage = error.response.data.message || (t('serverError') || 'Server error occurred');
      } else if (error.request) {
        // ส่ง request แล้วแต่ไม่ได้รับ response
        errorMessage = t('networkErrorCheckConnection') || 'Network error. Please check your connection.';
      }
      
      Alert.alert(
        t('errorSendingMessage') || 'Error sending message',
        errorMessage,
        [
          { 
            text: t('tryAgain') || 'Try Again', 
            onPress: () => {
              // ลองส่งอีกครั้ง
              setIsSubmitting(false);
            }
          },
          { 
            text: t('contactDirect') || 'Contact Direct', 
            onPress: () => {
              setIsSubmitting(false);
              handleSocialContact('whatsapp');
            }
          },
          {
            text: t('cancel') || 'Cancel',
            style: 'cancel',
            onPress: () => setIsSubmitting(false)
          }
        ]
      );
    } finally {
      // ถ้ายังไม่ได้ set เป็น false ใน Alert callback
      setTimeout(() => {
        setIsSubmitting(false);
      }, 100);
    }
  };

  const handleSocialContact = (type) => {
    const contacts = {
      whatsapp: 'https://wa.me/66869918826', // เปลี่ยนเป็นเบอร์จริง
      email: 'mailto:info@thetrago.com', // ใช้อีเมลจริง
      facebook: 'https://web.facebook.com/profile.php?id=61566204074602&_rdc=1&_rdr#',
      instagram: 'https://www.instagram.com/the.trago/',
      twitter: 'https://twitter.com/thetrago',
      linkedin: 'https://linkedin.com/company/thetrago'
    };

    if (contacts[type]) {
      Linking.openURL(contacts[type]);
    }
  };

  const renderFormField = (field, placeholder, icon, multiline = false) => (
    <Animated.View 
      style={[
        styles.inputContainer,
        { 
          transform: [{ translateY: slideAnim }],
          opacity: fadeAnim 
        }
      ]}
    >
      <View style={styles.inputWrapper}>
        <View style={[
          styles.inputInner,
          focusedField === field && styles.inputFocused
        ]}>
          <MaterialCommunityIcons name={icon} size={wp('5%')} color="#FD501E" style={styles.inputIcon} />
          <TextInput
            style={[styles.input, multiline && styles.textArea]}
            placeholder={placeholder}
            placeholderTextColor="rgba(90, 90, 90, 0.6)"
            value={formData[field]}
            onChangeText={(value) => handleInputChange(field, value)}
            onFocus={() => setFocusedField(field)}
            onBlur={() => setFocusedField(null)}
            multiline={multiline}
            numberOfLines={multiline ? 4 : 1}
            textAlignVertical={multiline ? 'top' : 'center'}
          />
        </View>
      </View>
    </Animated.View>
  );

  const renderContactMethod = (icon, title, subtitle, color, onPress, index) => (
    <Animated.View
      style={[
        styles.contactMethodWrapper,
        {
          opacity: contactMethodAnims[index]?.opacity || 1,
          transform: [
            { translateY: contactMethodAnims[index]?.translateY || 0 },
            { scale: contactMethodAnims[index]?.scale || 1 },
          ],
        },
      ]}
    >
      <TouchableOpacity 
        style={styles.contactMethod}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#FFFFFF', '#F8F9FA']}
          style={styles.contactMethodGradient}
        >
          <View style={[styles.contactIcon, { backgroundColor: color }]}>
            {icon}
          </View>
          <View style={styles.contactInfo}>
            <Text style={styles.contactTitle}>{title}</Text>
            <Text style={styles.contactSubtitle}>{subtitle}</Text>
          </View>
          <MaterialIcons name="chevron-right" size={wp('6%')} color="#6B7280" />
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#FD501E" />
      
      {/* Premium Header แบบเดียวกับหน้าอื่น */}
      <Animated.View 
        style={[
          styles.header,
          { transform: [{ translateY: headerAnim }] }
        ]}
      >
        <LinearGradient
          colors={['#FD501E', '#FF6B40']}
          style={styles.headerGradient}
        >
          <SafeAreaView style={styles.safeAreaHeader}>
            <View style={styles.headerTopRow}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => navigation.goBack()}
                activeOpacity={0.8}
              >
                <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              
              <View style={styles.headerContent}>
                <Text style={styles.headerTitle}>{t('contactUs') || 'Contact Us'}</Text>
                <Text style={styles.headerSubtitle}>{t('weAreAlwaysInTouch') || 'We are always in touch'}</Text>
              </View>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </Animated.View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero Section */}
        <Animated.View 
          style={[
            styles.heroSection,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }, { scale: pulseAnim }]
            }
          ]}
        >
          <LinearGradient
            colors={['#FFFFFF', '#F8F9FA']}
            style={styles.heroGradient}
          >
            <MaterialCommunityIcons name="email-outline" size={wp('15%')} color="#FD501E" style={styles.heroIcon} />
            <Text style={styles.heroTitle}>{t('readyToServeYou') || 'Ready to Serve You'}</Text>
            <Text style={styles.heroSubtitle}>
              {t('theTragoTeamReady') || 'TheTrago team is ready to answer all questions and provide consultation'}
            </Text>
          </LinearGradient>
        </Animated.View>

        {/* Contact Methods */}
        <View style={styles.contactMethods}>
          <Text style={styles.sectionTitle}>{t('contactChannels') || 'Contact Channels'}</Text>
          
          {renderContactMethod(
            <FontAwesome5 name="whatsapp" size={wp('6%')} color="white" />,
            t('whatsApp') || 'WhatsApp',
            t('chatWithUsInstantly') || 'Chat with us instantly',
            '#25D366',
            () => handleSocialContact('whatsapp'),
            0
          )}

          {renderContactMethod(
            <MaterialIcons name="email" size={wp('6%')} color="white" />,
            t('email') || 'Email',
            'info@thetrago.com',
            '#4285F4',
            () => handleSocialContact('email'),
            1
          )}

          {renderContactMethod(
            <FontAwesome5 name="facebook" size={wp('6%')} color="white" />,
            t('facebook') || 'Facebook',
            t('theTragoOfficial') || 'TheTrago Official',
            '#1877F2',
            () => handleSocialContact('facebook'),
            2
          )}

          {renderContactMethod(
            <FontAwesome5 name="instagram" size={wp('6%')} color="white" />,
            t('instagram') || 'Instagram',
            '@the.trago',
            '#E4405F',
            () => handleSocialContact('instagram'),
            3
          )}
        </View>

        {/* Contact Form */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>{t('sendUsAMessage') || 'Send us a message'}</Text>
          
          {renderFormField('name', t('fullName') || 'Full Name *', 'account-outline')}
          {renderFormField('email', t('emailRequired') || 'Email *', 'email')}
          {renderFormField('subject', t('subject') || 'Subject *', 'bookmark')}
          {renderFormField('message', t('message') || 'Message *', 'message-outline', true)}

          {/* Submit Button */}
          <Animated.View 
            style={[
              styles.submitContainer,
              { 
                transform: [{ translateY: slideAnim }],
                opacity: fadeAnim 
              }
            ]}
          >
            <TouchableOpacity
              style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={isSubmitting}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#FD501E', '#FF6B35']}
                style={styles.submitGradient}
              >
                {isSubmitting ? (
                  <View style={styles.loadingContainer}>
                    <Animated.View style={styles.loadingDot} />
                    <Text style={styles.submitText}>{t('sending') || 'Sending...'}</Text>
                  </View>
                ) : (
                  <>
                    <Feather name="send" size={wp('5%')} color="white" />
                    <Text style={styles.submitText}>{t('sendMessage') || 'Send Message'}</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Footer */}
        <Animated.View 
          style={[
            styles.footer,
            { opacity: fadeAnim }
          ]}
        >
          <Text style={styles.footerText}>
            {t('theTragoTeamHappy') || 'TheTrago team is happy to serve you 24 hours a day'}
          </Text>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 2,
  },
  headerGradient: {
    paddingTop: 30,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#FD501E',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  safeAreaHeader: {
    paddingTop: 0,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10, // เพิ่มจาก 45 เป็น 60
    paddingBottom: 25, // เพิ่มจาก 20 เป็น 25
    position: 'relative',
  },
  headerContent: {
    alignItems: 'center',
    flex: 1,
    marginLeft: 0, // ให้อยู่ตรงกลาง
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 20, // เพิ่มจาก 45 เป็น 60 ให้ตรงกับ paddingTop
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  headerSubtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  scrollView: {
    flex: 1,
    paddingTop: 145, // เพิ่มจาก 125 เป็น 145
  },
  scrollContent: {
    paddingBottom: hp('10%'), // ลดจาก 30% เป็น 15% เพื่อลดระยะห่างด้านล่าง
  },
  heroSection: {
    margin: wp('5%'),
    marginTop: hp('2%'),
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#FD501E',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  heroGradient: {
    padding: wp('8%'),
    alignItems: 'center',
  },
  heroIcon: {
    marginBottom: hp('2%'),
  },
  heroTitle: {
    fontSize: wp('6%'),
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: hp('1%'),
  },
  heroSubtitle: {
    fontSize: wp('4%'),
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: hp('3%'),
  },
  contactMethods: {
    margin: wp('5%'),
    marginTop: hp('2%'),
    marginBottom: hp('3%'),
  },
  sectionTitle: {
    fontSize: wp('5%'),
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: hp('3%'),
    textAlign: 'center',
  },
  contactMethodWrapper: {
    marginBottom: hp('2%'),
  },
  contactMethod: {
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#FD501E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  contactMethodGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: wp('5%'),
    paddingVertical: hp('2%'),
  },
  contactIcon: {
    width: wp('12%'),
    height: wp('12%'),
    borderRadius: wp('6%'),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp('4%'),
  },
  contactInfo: {
    flex: 1,
  },
  contactTitle: {
    fontSize: wp('4%'),
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  contactSubtitle: {
    fontSize: wp('3.5%'),
    color: '#6B7280',
  },
  formSection: {
    margin: wp('5%'),
    marginTop: hp('2%'),
  },
  inputContainer: {
    marginBottom: hp('2.5%'),
  },
  inputWrapper: {
    borderRadius: 15,
    shadowColor: '#FD501E',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  inputInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp('5%'),
    paddingVertical: hp('2%'),
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 15,
  },
  inputFocused: {
    borderColor: '#E5E7EB',
    borderWidth: 1.5,
  },
  inputIcon: {
    marginRight: wp('3%'),
  },
  input: {
    flex: 1,
    color: '#1F2937',
    fontSize: wp('4%'),
    fontWeight: '500',
  },
  textArea: {
    height: hp('12%'),
    textAlignVertical: 'top',
  },
  submitContainer: {
    marginTop: hp('3%'),
  },
  submitButton: {
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#FD501E',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp('2.5%'),
    paddingHorizontal: wp('8%'),
  },
  submitText: {
    fontSize: wp('4.5%'),
    fontWeight: 'bold',
    color: 'white',
    marginLeft: wp('2%'),
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingDot: {
    width: wp('5%'),
    height: wp('5%'),
    borderRadius: wp('2.5%'),
    backgroundColor: 'white',
    opacity: 0.5,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: hp('4%'),
  },
  footerText: {
    color: '#6B7280',
    fontSize: wp('3.5%'),
    textAlign: 'center',
  },
});
