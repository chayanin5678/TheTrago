import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar, ScrollView, Clipboard, Alert, Platform, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLanguage } from './LanguageContext';
import { useAuth } from '../AuthContext';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import ipAddress from '../ipconfig';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const AffiliateScreen = ({ navigation }) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [affiliateData, setAffiliateData] = useState({
    upcoming: 0,
    cancelled: 0,
    completed: 0,
    totalListings: 0,
    earning: 0.00
  });
  const [userProfile, setUserProfile] = useState(null);
  const [referralLink, setReferralLink] = useState('');
  const [inviteLink, setInviteLink] = useState('');

  useEffect(() => {
    loadUserProfile();
    loadAffiliateData();
  }, []);

  const loadUserProfile = async () => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      if (!token) return;

      // Try new API first
      const response = await axios.get(`${ipAddress}/AppApi/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.status === 'success' && response.data.data && response.data.data.length > 0) {
        const userData = response.data.data[0];
        console.log('=== API Debug Info ===');
        console.log('API Response:', JSON.stringify(response.data, null, 2));
        console.log('User Data:', JSON.stringify(userData, null, 2));
        console.log('response.data.memberId:', response.data.memberId);
        console.log('userData.memberno:', userData.memberno);
        console.log('userData.md_member_no:', userData.md_member_no);
        console.log('========================');
        
        // ลองหาค่า member ID จากหลายๆ field
        const possibleMemberId = response.data.memberId || 
                                userData.memberno || 
                                userData.md_member_no || 
                                userData.md_member_user ||
                                'M033048';
        
        setUserProfile({
          memberId: possibleMemberId,
          name: `${userData.md_member_fname || ''} ${userData.md_member_lname || ''}`.trim(),
          email: userData.md_member_email || '',
          phone: userData.md_member_tel || '',
          joinDate: userData.md_member_credate || new Date().toISOString()
        });
        
        // Generate referral links with the correct member ID
        generateReferralLinks(possibleMemberId);
        console.log('Final Member ID used:', possibleMemberId);
        return;
      }

      // Fallback to old API if new one fails
      const fallbackResponse = await axios.get(`${ipAddress}/user-profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (fallbackResponse.data.success) {
        setUserProfile(fallbackResponse.data.user);
        generateReferralLinks(fallbackResponse.data.user.memberId);
      }
    } catch (error) {
      console.error('Load user profile error:', error);
      // Fallback ถ้าไม่สามารถดึงข้อมูลได้
      setUserProfile({
        memberId: 'M033048',
        name: 'Default User',
        email: '',
        phone: '',
        joinDate: new Date().toISOString()
      });
      generateReferralLinks('M033048');
    }
  };

  const loadAffiliateData = async () => {
    try {
      // ชั่วคราวใช้ข้อมูล mock แทน API ที่ยังไม่มี
      setAffiliateData({
        upcoming: 3,
        cancelled: 1,
        completed: 12,
        totalListings: 16,
        earning: 2450.00
      });
      
      /* 
      // เมื่อ API พร้อมแล้วให้เปิด comment นี้
      const token = await SecureStore.getItemAsync('userToken');
      const response = await axios.get(`${ipAddress}/affiliate-data`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.data.success) {
        setAffiliateData(response.data.data);
      }
      */
    } catch (error) {
      console.error('Load affiliate data error:', error);
      // ใช้ข้อมูล default ถ้าเกิดข้อผิดพลาด
      setAffiliateData({
        upcoming: 0,
        cancelled: 0,
        completed: 0,
        totalListings: 0,
        earning: 0.00
      });
    }
  };

  const generateReferralLinks = async (memberId) => {
    try {
      const memberIdToUse = memberId || userProfile?.memberId || 'M033048';
      
      setReferralLink(`https://www.thetrago.com/refer/${memberIdToUse}`);
      // Deep link ที่เปิดแอป TheTrago พร้อม referral parameter
      setInviteLink(`thetrago://register?ref=${memberIdToUse}`);
    } catch (error) {
      console.error('Generate links error:', error);
    }
  };

  const copyToClipboard = (text, type) => {
    Clipboard.setString(text);
    Alert.alert(
      t('copied') || 'Copied!',
      `${type} ${t('linkCopied') || 'link copied to clipboard'}`,
      [{ text: t('ok') || 'OK' }]
    );
  };

  const showQRCode = (link, title) => {
    // สร้าง QR Code ผ่าน Google Charts API
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(link)}`;
    
    Alert.alert(
      title,
      'เลือกการดำเนินการ',
      [
        {
          text: 'ดู QR Code',
          onPress: () => Linking.openURL(qrCodeUrl)
        },
        {
          text: 'คัดลอกลิงก์',
          onPress: () => copyToClipboard(link, title)
        },
        {
          text: 'ยกเลิก',
          style: 'cancel'
        }
      ]
    );
  };

  const StatusCard = ({ title, count, icon, color, bgColor }) => (
    <View style={[styles.statusCard, { backgroundColor: bgColor }]}>
      <View style={styles.statusContent}>
        <Text style={styles.statusCount}>{count}</Text>
        <Text style={styles.statusTitle}>{title}</Text>
      </View>
      <View style={[styles.statusIcon, { backgroundColor: color }]}>
        <MaterialIcons name={icon} size={24} color="#FFFFFF" />
      </View>
    </View>
  );

  const MetricCard = ({ title, value, icon, color }) => (
    <View style={styles.metricCard}>
      <View style={[styles.metricIcon, { backgroundColor: color }]}>
        <MaterialCommunityIcons name={icon} size={24} color="#FFFFFF" />
      </View>
      <View style={styles.metricContent}>
        <Text style={styles.metricValue}>{value}</Text>
        <Text style={styles.metricTitle}>{title}</Text>
      </View>
    </View>
  );

  const LinkCard = ({ title, subtitle, link, commission }) => (
    <View style={styles.linkCard}>
      <MaterialCommunityIcons name="share-variant" size={24} color="#6B7280" />
      <Text style={styles.linkTitle}>{title}</Text>
      <Text style={styles.linkSubtitle}>{subtitle}</Text>
      
      <View style={styles.linkContainer}>
        <Text style={styles.linkText} numberOfLines={1}>{link}</Text>
        <TouchableOpacity 
          style={styles.copyButton}
          onPress={() => copyToClipboard(link, title)}
        >
          <Text style={styles.copyButtonText}>{t('copy') || 'Copy!'}</Text>
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity 
        style={styles.qrButton}
        onPress={() => showQRCode(link, title)}
      >
        <Text style={styles.qrButtonText}>{t('qrCode') || 'QR CODE'}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#FD501E" />
      
      {/* Premium Header */}
      <View style={styles.headerContainer}>
        <LinearGradient
          colors={['#FD501E', '#FF6B40', '#FD501E']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <SafeAreaView style={styles.safeAreaHeader}>
            <View style={styles.headerContent}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => navigation.goBack()}
                activeOpacity={0.8}
              >
                <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              
              <Text style={styles.headerTitle}>{t('affiliateProgram') || 'Affiliate Program'}</Text>
              <Text style={styles.headerSubtitle}>{t('earnCommission') || 'Earn commission on bookings'}</Text>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </View>

      <ScrollView 
        style={[styles.scrollContainer, styles.scrollViewWithMargin]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Section Title */}
          <Text style={styles.sectionTitle}>{t('bookingsAffiliate') || 'Bookings affiliate'}</Text>

          {/* Status Cards */}
          <StatusCard 
            title={t('upcoming') || 'Upcoming'} 
            count={affiliateData.upcoming}
            icon="schedule"
            color="#F59E0B"
            bgColor="#FEF3C7"
          />
          
          <StatusCard 
            title={t('cancelled') || 'Cancelled'} 
            count={affiliateData.cancelled}
            icon="close"
            color="#EF4444"
            bgColor="#FEE2E2"
          />
          
          <StatusCard 
            title={t('completed') || 'Completed'} 
            count={affiliateData.completed}
            icon="check"
            color="#10B981"
            bgColor="#D1FAE5"
          />

          {/* Metric Cards */}
          <MetricCard 
            title={t('totalListings') || 'Total Listings'}
            value={affiliateData.totalListings}
            icon="format-list-bulleted"
            color="#10B981"
          />

          <MetricCard 
            title={t('earning') || 'Earning'}
            value={`฿${affiliateData.earning.toFixed(2)}`}
            icon="trending-up"
            color="#3B82F6"
          />

          {/* Referral Links */}
          <LinkCard 
            title={t('yourAffiliate') || 'Your Affiliate:'}
            subtitle={t('shareLink40') || 'Share this link and earn up to 40% commission on bookings!'}
            link={referralLink}
            commission="40%"
          />

          <LinkCard 
            title={t('inviteFriends') || 'Invite friends:'}
            subtitle={t('shareAppLink') || 'Share this link to open TheTrago app!'}
            link={inviteLink}
            commission="10%"
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: hp('10%'),
  },
  scrollViewWithMargin: {
    marginTop: 140,
    flex: 1,
  },
  
  // Premium Header Styles
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 2,
  },
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
  safeAreaHeader: {
    paddingTop: Platform.OS === 'android' ? 40 : 0,
  },
  headerContent: {
    alignItems: 'center',
    position: 'relative',
    zIndex: 3,
  },
  backButton: {
    position: 'absolute',
    top: 15,
    left: 0,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
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
  headerSubtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.95)',
    textAlign: 'center',
    fontWeight: '500',
    letterSpacing: 0.3,
  },

  // Content Styles
  content: {
    paddingHorizontal: wp('4%'),
    paddingTop: hp('2%'),
    paddingBottom: hp('5%'),
    minHeight: '100%',
  },
  sectionTitle: {
    fontSize: wp('5%'),
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: hp('2%'),
  },

  // Status Card Styles
  statusCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: wp('4%'),
    borderRadius: wp('3%'),
    marginBottom: hp('1.5%'),
  },
  statusContent: {
    flex: 1,
  },
  statusCount: {
    fontSize: wp('6%'),
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  statusTitle: {
    fontSize: wp('4%'),
    color: '#6B7280',
    fontWeight: '500',
  },
  statusIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Metric Card Styles
  metricCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: wp('4%'),
    borderRadius: wp('3%'),
    marginBottom: hp('1.5%'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  metricIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp('3%'),
  },
  metricContent: {
    flex: 1,
  },
  metricValue: {
    fontSize: wp('5%'),
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  metricTitle: {
    fontSize: wp('3.5%'),
    color: '#6B7280',
    fontWeight: '500',
  },

  // Link Card Styles
  linkCard: {
    backgroundColor: '#FFFFFF',
    padding: wp('4%'),
    borderRadius: wp('3%'),
    marginBottom: hp('2%'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  linkTitle: {
    fontSize: wp('4%'),
    fontWeight: '600',
    color: '#1F2937',
    marginTop: hp('1%'),
    marginBottom: hp('0.5%'),
  },
  linkSubtitle: {
    fontSize: wp('3.5%'),
    color: '#6B7280',
    marginBottom: hp('2%'),
    lineHeight: wp('5%'),
  },
  linkContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: wp('2%'),
    padding: wp('3%'),
    marginBottom: hp('1.5%'),
    alignItems: 'center',
  },
  linkText: {
    flex: 1,
    fontSize: wp('3.5%'),
    color: '#4B5563',
    marginRight: wp('2%'),
  },
  copyButton: {
    backgroundColor: '#F97316',
    paddingHorizontal: wp('4%'),
    paddingVertical: wp('2%'),
    borderRadius: wp('2%'),
  },
  copyButtonText: {
    color: '#FFFFFF',
    fontSize: wp('3.5%'),
    fontWeight: '600',
  },
  qrButton: {
    backgroundColor: '#0891B2',
    paddingVertical: wp('3%'),
    borderRadius: wp('2%'),
    alignItems: 'center',
    marginTop: wp('1%'),
  },
  qrButtonText: {
    color: '#FFFFFF',
    fontSize: wp('3.5%'),
    fontWeight: '600',
    letterSpacing: 1,
  },
});

export default AffiliateScreen;
