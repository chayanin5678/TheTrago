import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Clipboard,
  Alert,
  Platform,
  Modal,
  Image,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLanguage } from './LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import ipAddress from '../../config/ipconfig';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const AffiliateScreen = ({ navigation }) => {
  const { t } = useLanguage();
  const { user } = useAuth();

  const [affiliateEnabled, setAffiliateEnabled] = useState(false);
  const [enabling, setEnabling] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const [affiliateData, setAffiliateData] = useState({
    upcoming: 0,
    cancelled: 0,
    completed: 0,
    totalListings: 0,
    earning: 0.0,
  });

  const [userProfile, setUserProfile] = useState(null);
  const [referralLink, setReferralLink] = useState('');
  const [inviteLink, setInviteLink] = useState('');

  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [qrModalLink, setQrModalLink] = useState('');
  const [qrModalTitle, setQrModalTitle] = useState('');

  const isOn = (v) => v === 1 || v === '1' || v === true;

  useEffect(() => {
    loadUserProfile();
    loadAffiliateData();
  }, []);

  const loadUserProfile = async () => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      if (!token) return;

      // API ใหม่
      const response = await axios.get(`${ipAddress}/profile`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });

      if (response.data.status === 'success' && response.data.data?.length > 0) {
        const userData = response.data.data[0];

        const statusRaw =
          response.data.md_member_affiliate_status ??
          userData.md_member_affiliate_status ??
          userData.md_affiliate_status ??
          0;
        
        // ไม่ reset state ถ้าได้เปิดใช้งานไปแล้ว (ป้องกันการกระตุก)
        if (!affiliateEnabled) {
          setAffiliateEnabled(isOn(statusRaw));
        }

        const possibleMemberId =
          response.data.memberId ||
          userData.memberno ||
          userData.md_member_no ||
          userData.md_member_user ||
          'M033048';

        setUserProfile({
          memberId: possibleMemberId,
          name: `${userData.md_member_fname || ''} ${userData.md_member_lname || ''}`.trim(),
          email: userData.md_member_email || '',
          phone: userData.md_member_tel || '',
          joinDate: userData.md_member_credate || new Date().toISOString(),
        });

        generateReferralLinks(possibleMemberId);
        return;
      }

      // Fallback API เก่า
      const fallbackResponse = await axios.get(`${ipAddress}/user-profile`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });

      if (fallbackResponse.data.success) {
        const up = fallbackResponse.data.user;

        const statusRaw2 = up?.md_member_affiliate_status ?? up?.md_affiliate_status ?? 0;
        
        // ไม่ reset state ถ้าได้เปิดใช้งานไปแล้ว (ป้องกันการกระตุก)
        if (!affiliateEnabled) {
          setAffiliateEnabled(isOn(statusRaw2));
        }

        const memberId = up?.memberId || up?.md_member_no || 'M033048';
        setUserProfile(up);
        generateReferralLinks(memberId);
        return;
      }
    } catch (error) {
      // ดึงข้อมูลไม่ได้ → ปิดไว้ก่อน (แต่ไม่ reset ถ้าเปิดไว้แล้ว)
      if (!affiliateEnabled) {
        setAffiliateEnabled(false);
      }
      setUserProfile({
        memberId: 'M033048',
        name: 'Default User',
        email: '',
        phone: '',
        joinDate: new Date().toISOString(),
      });
      generateReferralLinks('M033048');
    }
  };

  const loadAffiliateData = async () => {
    try {
      // mock
      setAffiliateData({
        upcoming: 0,
        cancelled: 0,
        completed: 0,
        totalListings: 16,
        earning: 2450.0,
      });
      // ถ้ามี API จริง ให้เปิดใช้ส่วนนี้
      // const token = await SecureStore.getItemAsync('userToken');
      // const res = await axios.get(`${ipAddress}/affiliate-data`, {
      //   headers: { Authorization: `Bearer ${token}` }
      // });
      // setAffiliateData(res.data.data);
    } catch (e) {
      setAffiliateData({
        upcoming: 0,
        cancelled: 0,
        completed: 0,
        totalListings: 0,
        earning: 0.0,
      });
    }
  };

  const confirmEnableAffiliate = () => {
    Alert.alert(
      t('enableAffiliate') || 'เปิดใช้งาน Affiliate',
      t('enableAffiliateConfirmMsg') ||
        'ต้องการเปิดใช้งาน Affiliate หรือไม่? เมื่อเปิดแล้วคุณจะได้รับลิงก์แนะนำและเริ่มนับคอมมิชชัน',
      [
        { text: t('cancel') || 'ยกเลิก', style: 'cancel' },
        { text: t('enable') || 'เปิดใช้งาน', onPress: enableAffiliate },
      ]
    );
  };

const enableAffiliate = async () => {
  try {
    setEnabling(true);
    setIsTransitioning(true);

    const token = await SecureStore.getItemAsync('userToken');
    if (!token) {
      Alert.alert(t('error') || 'เกิดข้อผิดพลาด', t('loginRequired') || 'กรุณาเข้าสู่ระบบใหม่');
      return;
    }

    // เรียก API จริงเพื่ออัปเดต md_member_affiliate_status = 1
    const res = await axios.post(
      `${ipAddress}/affiliate/enable`,   // ipAddress ของคุณควรชี้ไปที่ /AppApi
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        timeout: 15000,
      }
    );

    if (res?.data?.status === 'success') {
      // อัปเดต state ทันทีเพื่อป้องกันการกระตุก
      setAffiliateEnabled(true);
      
      // รอให้ UI transition เสร็จ
      setTimeout(() => {
        setIsTransitioning(false);
      }, 300);
      
      // ดึงโปรไฟล์อีกรอบเพื่อให้ state สอดคล้องฐานข้อมูล (ทำในพื้นหลัง)
      loadUserProfile();
      
      // แสดง success message
      Alert.alert(t('success') || 'สำเร็จ', t('affiliateEnabledMsg') || 'เปิดใช้งาน Affiliate แล้ว');
    } else {
      throw new Error(res?.data?.message || 'Enable affiliate failed');
    }
  } catch (e) {
    const msg = e?.response?.data?.message || e?.message || (t('tryAgain') || 'ลองใหม่อีกครั้ง');
    Alert.alert(t('error') || 'เกิดข้อผิดพลาด', msg);
    setIsTransitioning(false);
  } finally {
    setEnabling(false);
  }
};


  const generateReferralLinks = (memberId) => {
    try {
      const memberIdToUse = memberId || (userProfile && userProfile.memberId) || 'M033048';
      const appReferralLink = `thetrago://home?ref=${memberIdToUse}`;
      const appInviteLink = `thetrago://register?ref=${memberIdToUse}`;
      setReferralLink(appReferralLink);
      setInviteLink(appInviteLink);
    } catch (e) {}
  };

  const copyToClipboard = (text, type) => {
    Clipboard.setString(text);
    Alert.alert(t('copied') || 'Copied!', `${type} ${t('linkCopied') || 'link copied to clipboard'}`, [
      { text: t('ok') || 'OK' },
    ]);
  };

  const showQRCode = (link, title) => {
    setQrModalLink(link);
    setQrModalTitle(title);
    setQrModalVisible(true);
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

  const LinkCard = ({ title, subtitle, link }) => (
    <View style={styles.linkCard}>
      <MaterialCommunityIcons name="share-variant" size={24} color="#6B7280" />
      <Text style={styles.linkTitle}>{title}</Text>
      <Text style={styles.linkSubtitle}>{subtitle}</Text>

      <View style={styles.linkContainer}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={0.8} onPress={() => handleOpenLink(link)}>
          <Text style={styles.linkText} numberOfLines={1}>
            {link}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.copyButton} onPress={() => copyToClipboard(link, title)}>
          <Text style={styles.copyButtonText}>{t('copy') || 'Copy!'}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.qrButton} onPress={() => showQRCode(link, title)}>
        <Text style={styles.qrButtonText}>{t('qrCode') || 'QR CODE'}</Text>
      </TouchableOpacity>
    </View>
  );

  // Open link: try to navigate inside app for custom scheme, otherwise open URL
  const handleOpenLink = (link) => {
    try {
      if (!link) return;
      // if it's our app scheme, try to navigate internally
      if (link.startsWith('thetrago://')) {
        // example: thetrago://home?ref=M0123  or thetrago://register?ref=M0123
        const withoutScheme = link.replace('thetrago://', '');
        const [pathPart, queryPart] = withoutScheme.split('?');
        const path = pathPart?.toLowerCase();
        const params = {};
        if (queryPart) {
          queryPart.split('&').forEach((pair) => {
            const [k, v] = pair.split('=');
            if (k) params[k] = decodeURIComponent(v || '');
          });
        }

        // Map scheme paths to navigation routes in the app — adjust if your route names differ
        if (path === 'home') {
          navigation.navigate('Home', params);
          return;
        }
        if (path === 'register' || path === 'signup') {
          navigation.navigate('Register', params);
          return;
        }

        // If unknown path, let the OS handle the deep link (this will open the app if configured)
        Linking.openURL(link).catch(() => {
          Alert.alert(t('error') || 'Error', t('cannotOpenLink') || 'Cannot open link');
        });
        return;
      }

      // For normal http(s) links, open in browser
      Linking.openURL(link).catch(() => {
        Alert.alert(t('error') || 'Error', t('cannotOpenLink') || 'Cannot open link');
      });
    } catch (e) {
      Alert.alert(t('error') || 'Error', e.message || (t('cannotOpenLink') || 'Cannot open link'));
    }
  };

  return (
    <View style={styles.container}>
      {/* QR Modal */}
      <Modal visible={qrModalVisible} transparent animationType="fade" onRequestClose={() => setQrModalVisible(false)}>
        <View style={styles.qrModalOverlay}>
          <View style={styles.qrModalContent}>
            <Text style={styles.qrModalTitle}>{qrModalTitle}</Text>
            <Image
              source={{
                uri: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrModalLink)}`,
              }}
              style={styles.qrModalImage}
            />
            <Text style={styles.qrModalLink}>{qrModalLink}</Text>
            <View style={{ flexDirection: 'row', marginTop: 16 }}>
              <TouchableOpacity
                style={[styles.qrModalButton, { backgroundColor: '#F97316' }]}
                onPress={() => copyToClipboard(qrModalLink, qrModalTitle)}
              >
                <Text style={styles.qrModalButtonText}>{t('copy') || 'Copy!'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.qrModalButton, { backgroundColor: '#0891B2', marginLeft: 12 }]}
                onPress={() => setQrModalVisible(false)}
              >
                <Text style={styles.qrModalButtonText}>{t('close') || 'Close'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <StatusBar barStyle="light-content" backgroundColor="#FD501E" />

      {/* Header */}
      <View style={styles.headerContainer}>
        <LinearGradient
          colors={['#FD501E', '#FF6B40', '#FD501E']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <SafeAreaView style={styles.safeAreaHeader}>
            <View style={styles.headerContent}>
              <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.8}>
                <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
              </TouchableOpacity>

              <Text style={styles.headerTitle}>{t('affiliateProgram') || 'Affiliate Program'}</Text>
              <Text style={styles.headerSubtitle}>{t('earnCommission') || 'Earn commission on bookings'}</Text>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </View>

      {/* Body */}
      <ScrollView
        style={[styles.scrollContainer, styles.scrollViewWithMargin]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* แถบเปิดใช้งาน (เฉพาะตอนยังไม่เปิด) */}
          {!affiliateEnabled && (
            <View style={styles.enableRow}>
              <Text style={styles.enableHint}>{t('enableAffiliate') || 'เปิดใช้งาน Affiliate'}</Text>
              <TouchableOpacity
                style={[styles.enableBtn, enabling && { opacity: 0.6 }]}
                onPress={confirmEnableAffiliate}
                disabled={enabling}
                activeOpacity={0.9}
              >
                {enabling ? (
                  <>
                    <ActivityIndicator size="small" color="#EF4444" style={{ marginRight: 6 }} />
                    <Text style={styles.enableBtnText}>{t('processing') || 'กำลังเปิด...'}</Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.enablePlus}>＋</Text>
                    <Text style={styles.enableBtnText}>
                      {t('openAffiliate') || 'Open'}
                      {'\n'}
                      {t('affiliate') || 'Affiliate'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* หัวข้อ */}
          <Text style={styles.sectionTitle}>{t('bookingsAffiliate') || 'Bookings affiliate'}</Text>

          {/* สถานะ 3 การ์ด */}
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

          {/* ส่วนลิงก์และสรุปจะแสดงเมื่อเปิดใช้งานแล้ว */}
          {affiliateEnabled && (
            <>
              {isTransitioning ? (
                <View style={styles.transitionContainer}>
                  <ActivityIndicator size="large" color="#FD501E" />
                  <Text style={styles.transitionText}>{t('loadingAffiliate') || 'กำลังโหลดข้อมูล Affiliate...'}</Text>
                </View>
              ) : (
                <>
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

                  <LinkCard
                    title={t('yourAffiliate') || 'Your Affiliate:'}
                    subtitle={t('shareLink40') || 'Share this link and earn up to 40% commission on bookings!'}
                    link={referralLink}
                  />
                  <LinkCard
                    title={t('inviteFriends') || 'Invite friends:'}
                    subtitle={t('shareAppLink') || 'Share this link to open TheTrago app!'}
                    link={inviteLink}
                  />
                </>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  // modal
  qrModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  qrModalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    width: 320,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  qrModalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: '#1F2937', textAlign: 'center' },
  qrModalImage: { width: 200, height: 200, marginBottom: 12, borderRadius: 8, backgroundColor: '#F3F4F6' },
  qrModalLink: { fontSize: 13, color: '#4B5563', marginBottom: 8, textAlign: 'center' },
  qrModalButton: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  qrModalButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },

  // layout
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  scrollContainer: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingBottom: hp('10%') },
  scrollViewWithMargin: { marginTop: 140, flex: 1 },

  // header
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
  safeAreaHeader: { paddingTop: Platform.OS === 'android' ? 40 : 0 },
  headerContent: { alignItems: 'center', position: 'relative', zIndex: 3 },
  backButton: {
    position: 'absolute',
    top: 15,
    left: 0,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
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
  headerSubtitle: { fontSize: 15, color: 'rgba(255,255,255,0.95)', textAlign: 'center', fontWeight: '500', letterSpacing: 0.3 },

  // content
  content: { paddingHorizontal: wp('4%'), paddingTop: hp('2%'), paddingBottom: hp('5%'), minHeight: '100%' },
  sectionTitle: { fontSize: wp('5%'), fontWeight: 'bold', color: '#1F2937', marginBottom: hp('2%') },

  // enable bar
  enableRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginBottom: 8 },
  enableHint: { marginRight: 10, color: '#6B7280' },
  enableBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4FF',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  enablePlus: { fontSize: 18, color: '#F97316', marginRight: 6, fontWeight: '700' },
  enableBtnText: { color: '#EF4444', fontWeight: '800', lineHeight: 16 },

  // status cards
  statusCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: wp('4%'),
    borderRadius: wp('3%'),
    marginBottom: hp('1.5%'),
  },
  statusContent: { flex: 1 },
  statusCount: { fontSize: wp('6%'), fontWeight: 'bold', color: '#1F2937', marginBottom: 4 },
  statusTitle: { fontSize: wp('4%'), color: '#6B7280', fontWeight: '500' },
  statusIcon: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },

  // metric cards
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
  metricIcon: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: wp('3%') },
  metricContent: { flex: 1 },
  metricValue: { fontSize: wp('5%'), fontWeight: 'bold', color: '#1F2937', marginBottom: 4 },
  metricTitle: { fontSize: wp('3.5%'), color: '#6B7280', fontWeight: '500' },

  // transition
  transitionContainer: {
    backgroundColor: '#FFFFFF',
    padding: wp('8%'),
    borderRadius: wp('3%'),
    marginBottom: hp('2%'),
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: hp('20%'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  transitionText: {
    fontSize: wp('4%'),
    color: '#6B7280',
    marginTop: hp('2%'),
    textAlign: 'center',
    fontWeight: '500',
  },

  // link card
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
  linkTitle: { fontSize: wp('4%'), fontWeight: '600', color: '#1F2937', marginTop: hp('1%'), marginBottom: hp('0.5%') },
  linkSubtitle: { fontSize: wp('3.5%'), color: '#6B7280', marginBottom: hp('2%'), lineHeight: wp('5%') },
  linkContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: wp('2%'),
    padding: wp('3%'),
    marginBottom: hp('1.5%'),
    alignItems: 'center',
  },
  linkText: { flex: 1, fontSize: wp('3.5%'), color: '#4B5563', marginRight: wp('2%') },
  copyButton: { backgroundColor: '#F97316', paddingHorizontal: wp('4%'), paddingVertical: wp('2%'), borderRadius: wp('2%') },
  copyButtonText: { color: '#FFFFFF', fontSize: wp('3.5%'), fontWeight: '600' },
  qrButton: { backgroundColor: '#0891B2', paddingVertical: wp('3%'), borderRadius: wp('2%'), alignItems: 'center', marginTop: wp('1%') },
  qrButtonText: { color: '#FFFFFF', fontSize: wp('3.5%'), fontWeight: '600', letterSpacing: 1 },
});

export default AffiliateScreen;
