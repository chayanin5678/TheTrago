import React, { useEffect, useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  StatusBar, ScrollView, FlatList, Platform, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

import { useLanguage } from './LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import * as SecureStore from 'expo-secure-store';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import axios from 'axios';
import ipAddress from '../../config/ipconfig';

const PAGE_SIZE = 10;
const TABLE_MIN_WIDTH = 950; // ความกว้างขั้นต่ำของตารางแนวนอน

const BookingAffiliateScreen = ({ navigation }) => {
  const { t } = useLanguage();
  const { user } = useAuth();

  const [summary, setSummary] = useState({
    pending: 0,
    cancelled: 0,
    completed: 0,
  });

  const [bookings, setBookings] = useState([]); // [{id, bookingNo, company, detail, departureDate, status, earnings, paid}]
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadSummary();
    loadBookings();
  }, []);

  const loadSummary = async () => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      if (token) {
        // ต่อ API จริงเมื่อพร้อม
        // const res = await axios.get(`${ipAddress}/affiliate/bookings/summary`, {
        //   headers: { Authorization: `Bearer ${token}` },
        // });
        // setSummary(res.data);

        // MOCK ให้เหมือนภาพ
        setSummary({ pending: 0, cancelled: 0, completed: 0 });
      } else {
        setSummary({ pending: 0, cancelled: 0, completed: 0 });
      }
    } catch {
      setSummary({ pending: 0, cancelled: 0, completed: 0 });
    }
  };

  const loadBookings = async () => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      if (token) {
        // ต่อ API จริงเมื่อพร้อม
        // const res = await axios.get(`${ipAddress}/affiliate/bookings`, {
        //   headers: { Authorization: `Bearer ${token}` },
        // });
        // setBookings(
        //   (res.data?.items || []).map((b) => ({
        //     id: b.id,
        //     bookingNo: b.booking_no,
        //     company: b.company_name,
        //     detail: b.tour_name,
        //     departureDate: b.departure_date, // yyyy-mm-dd
        //     status: b.status_text,
        //     earnings: b.affiliate_earning,
        //     paid: b.paid_status === 1,
        //   }))
        // );

        // MOCK ตารางว่างตามภาพ
        setBookings([]);
      } else {
        setBookings([]);
      }
    } catch {
      setBookings([]);
    }
  };

  const totalPages = Math.max(1, Math.ceil(bookings.length / PAGE_SIZE));
  const pagedData = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return bookings.slice(start, start + PAGE_SIZE);
  }, [page, bookings]);

  const SummaryCard = ({ count, label, icon, tint, bg }) => (
    <View style={[styles.sumCard, { backgroundColor: bg }]}>
      <View style={{ flex: 1 }}>
        <Text style={styles.sumCount}>{count}</Text>
        <Text style={styles.sumLabel}>{label}</Text>
      </View>
      <View style={[styles.sumIcon, { backgroundColor: tint }]}>
        <MaterialCommunityIcons name={icon} size={24} color="#fff" />
      </View>
    </View>
  );

  const TableHeader = () => (
    <View style={styles.tableHeader}>
      <Text style={[styles.th, { flex: 0.6, textAlign: 'center' }]}>#</Text>
      <Text style={[styles.th, { flex: 1.4 }]}>{t('bookingNumber') || 'Booking Number'}</Text>
      <Text style={[styles.th, { flex: 1.2 }]}>{t('company') || 'Company'}</Text>
      <Text style={[styles.th, { flex: 1.1 }]}>{t('detail') || 'Detail'}</Text>
      <Text style={[styles.th, { flex: 1.4 }]}>{t('departureDate') || 'Departure Date'}</Text>
      <Text style={[styles.th, { flex: 1 }]}>{t('status') || 'Status'}</Text>
      <Text style={[styles.th, { flex: 1 }]}>{t('earnings') || 'Earnings'}</Text>
      <Text style={[styles.th, { flex: 1.1 }]}>{t('statusPaid') || 'Status Paid'}</Text>
    </View>
  );

  const TableRow = ({ item, index }) => (
    <View style={styles.tableRow}>
      <Text style={[styles.td, { flex: 0.6, textAlign: 'center' }]}>{index + 1 + (page - 1) * PAGE_SIZE}</Text>
      <Text style={[styles.td, { flex: 1.4 }]}>{item.bookingNo}</Text>
      <Text style={[styles.td, { flex: 1.2 }]}>{item.company}</Text>
      <Text style={[styles.td, { flex: 1.1 }]}>{item.detail || '-'}</Text>
      <Text style={[styles.td, { flex: 1.4 }]}>{item.departureDate || '-'}</Text>
      <Text style={[styles.td, { flex: 1 }]}>{item.status || '-'}</Text>
      <Text style={[styles.td, { flex: 1 }]}>
        {item.earnings != null
          ? `฿${Number(item.earnings).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
          : '฿0.00'}
      </Text>
      <Text style={[styles.td, { flex: 1.1 }]}>
        {item.paid ? (t('paid') || 'Paid') : (t('unpaid') || 'Unpaid')}
      </Text>
    </View>
  );

  const downloadCSV = async () => {
    try {
      const rows = [
        ['#', 'Booking Number', 'Company', 'Detail', 'Departure Date', 'Status', 'Earnings', 'Status Paid'],
        ...bookings.map((b, i) => [
          i + 1,
          b.bookingNo,
          b.company,
          b.detail || '',
          b.departureDate || '',
          b.status || '',
          b.earnings != null ? Number(b.earnings) : 0,
          b.paid ? 'Paid' : 'Unpaid',
        ]),
      ];
      const csv = rows
        .map(r => r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','))
        .join('\n');

      const uri = FileSystem.documentDirectory + `booking_report_${Date.now()}.csv`;
      await FileSystem.writeAsStringAsync(uri, csv, { encoding: FileSystem.EncodingType.UTF8 });

      if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(uri);
      else Alert.alert('Saved', `CSV saved to:\n${uri}`);
    } catch (e) {
      Alert.alert('Error', 'Cannot generate report right now.');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#FD501E" />

      {/* Header */}
      <View style={styles.headerContainer}>
        <LinearGradient
          colors={["#FD501E", "#FF6B40", "#FD501E"]}
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

              <Text style={styles.headerTitle}>{t('bookingAffiliate') || 'Booking Affiliate'}</Text>
              <Text style={styles.headerSubtitle}>{t('trackBookings') || 'Track affiliate bookings and export report'}</Text>
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
          {/* 3 Summary cards */}
          <SummaryCard
            count={summary.pending}
            label={t('pending') || 'Pending'}
            icon="wallet"
            tint="#FBBF24"
            bg="#FFF6DF"
          />
          <SummaryCard
            count={summary.cancelled}
            label={t('cancelled') || 'Cancelled'}
            icon="close"
            tint="#EF4444"
            bg="#FEE2E2"
          />
          <SummaryCard
            count={summary.completed}
            label={t('completed') || 'Completed'}
            icon="check"
            tint="#10B981"
            bg="#D1FAE5"
          />

          {/* My Bookings + Download */}
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <View>
                <Text style={styles.cardTitle}>{t('myBookings') || 'My Bookings'}</Text>
              </View>

              <TouchableOpacity style={styles.downloadBtn} onPress={downloadCSV} activeOpacity={0.9}>
                <MaterialCommunityIcons name="cloud-download-outline" size={18} color="#fff" />
                <Text style={styles.downloadText}>{t('downloadReport') || 'Download Report'}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.tableWrap}>
              {/* ตารางแนวนอน */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} bounces>
                <View style={{ minWidth: TABLE_MIN_WIDTH }}>
                  <TableHeader />

                  {pagedData.length > 0 ? (
                    <FlatList
                      data={pagedData}
                      keyExtractor={(item) => String(item.id)}
                      renderItem={({ item, index }) => <TableRow item={item} index={index} />}
                    />
                  ) : (
                    <View style={styles.emptyWrap}>
                      <Text style={styles.emptyText}>{t('noBookings') || 'No bookings yet'}</Text>
                    </View>
                  )}

                  {/* Pagination */}
                  <View style={styles.pagerRow}>
                    <TouchableOpacity
                      disabled={page <= 1}
                      onPress={() => setPage(p => Math.max(1, p - 1))}
                      style={[styles.pagerBtn, page <= 1 && styles.pagerBtnDisabled]}
                    >
                      <Text style={[styles.pagerBtnText, page <= 1 && styles.pagerBtnTextDisabled]}>
                        {t('prev') || 'Prev'}
                      </Text>
                    </TouchableOpacity>

                    <View style={styles.pageBadge}>
                      <Text style={styles.pageBadgeText}>{page}</Text>
                    </View>

                    <TouchableOpacity
                      disabled={page >= totalPages}
                      onPress={() => setPage(p => Math.min(totalPages, p + 1))}
                      style={[styles.pagerBtn, page >= totalPages && styles.pagerBtnDisabled]}
                    >
                      <Text style={[styles.pagerBtnText, page >= totalPages && styles.pagerBtnTextDisabled]}>
                        {t('next') || 'Next'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default BookingAffiliateScreen;

/* ---------------------------- Styles ---------------------------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },

  // Header
  headerContainer: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 2 },
  headerGradient: {
    paddingBottom: 40, paddingHorizontal: 20,
    borderBottomLeftRadius: 35, borderBottomRightRadius: 35,
    shadowColor: '#FD501E', shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35, shadowRadius: 20, position: 'relative', overflow: 'hidden',
  },
  safeAreaHeader: { paddingTop: Platform.OS === 'android' ? 40 : 0 },
  headerContent: { alignItems: 'center', position: 'relative', zIndex: 3 },
  backButton: {
    position: 'absolute', top: 15, left: 0, width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center',
    zIndex: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 28, fontWeight: '900', color: '#FFFFFF', marginBottom: 6, letterSpacing: 1,
    textShadowColor: 'rgba(0,0,0,0.2)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4,
  },
  headerSubtitle: { fontSize: 15, color: 'rgba(255,255,255,0.95)', textAlign: 'center', fontWeight: '500', letterSpacing: 0.3 },

  // Scroll
  scrollContainer: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingBottom: hp('10%') },
  scrollViewWithMargin: { marginTop: 140, flex: 1 },

  // Content
  content: { paddingHorizontal: wp('4%'), paddingTop: hp('2%'), paddingBottom: hp('5%'), minHeight: '100%' },

  // Summary cards
  sumCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: wp('4%'), borderRadius: wp('3%'), marginBottom: hp('1.6%'),
  },
  sumCount: { fontSize: wp('6%'), fontWeight: 'bold', color: '#1F2937', marginBottom: 4 },
  sumLabel: { fontSize: wp('4%'), color: '#6B7280', fontWeight: '500' },
  sumIcon: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },

  // Card (My Bookings)
  card: {
    backgroundColor: '#fff', borderRadius: wp('3%'), padding: wp('3%'),
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 2,
  },
  cardHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: hp('1%') },
  cardTitle: { fontSize: wp('4.6%'), fontWeight: '800', color: '#0F172A' },

  downloadBtn: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#10B981',
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, gap: 6,
  },
  downloadText: { color: '#fff', fontWeight: '700' },

  tableWrap: { marginTop: hp('1%'), borderRadius: 12, overflow: 'hidden', borderColor: '#E5E7EB', borderWidth: 1 },
  tableHeader: {
    flexDirection: 'row', backgroundColor: '#F9FAFB',
    paddingVertical: 10, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: '#E5E7EB',
  },
  th: { fontSize: wp('3.6%'), fontWeight: '700', color: '#111827' },
  tableRow: { flexDirection: 'row', paddingVertical: 12, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  td: { fontSize: wp('3.6%'), color: '#374151' },

  emptyWrap: { alignItems: 'center', paddingVertical: 24 },
  emptyText: { color: '#6B7280' },

  pagerRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 12, gap: 10 },
  pagerBtn: { paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#FFF7ED', borderRadius: 10 },
  pagerBtnDisabled: { backgroundColor: '#FAFAFA' },
  pagerBtnText: { color: '#F97316', fontWeight: '700' },
  pagerBtnTextDisabled: { color: '#9CA3AF' },
  pageBadge: { backgroundColor: '#F97316', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  pageBadgeText: { color: '#fff', fontWeight: '800' },
});
