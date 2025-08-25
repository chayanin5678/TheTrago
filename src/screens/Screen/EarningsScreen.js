import React, { useEffect, useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
  StatusBar, ScrollView, FlatList, Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

import { useLanguage } from './LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import ipAddress from '../../config/ipconfig';

const PAGE_SIZE = 10;

const EarningsScreen = ({ navigation }) => {
  const { t } = useLanguage();
  const { user } = useAuth();

  const [summary, setSummary] = useState({
    pendingWithdrawal: 0,
    totalEarnings: 0,
    totalPending: 0,
  });

  const [invoices, setInvoices] = useState([]);   // [{id, invoiceId, amount, transactionAt, status}]
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadSummary();
    loadInvoices();
  }, []);

  const formatTHB = (n) => {
    try {
      return new Intl.NumberFormat('th-TH', {
        style: 'currency',
        currency: 'THB',
        minimumFractionDigits: 2,
      }).format(n || 0);
    } catch {
      const v = Number(n || 0).toFixed(2);
      return `฿${v}`;
    }
  };

  const loadSummary = async () => {
    try {
      // TODO: เปลี่ยน endpoint ให้ตรงกับแบ็กเอนด์จริง
      const token = await SecureStore.getItemAsync('userToken');
      if (token) {
        // ตัวอย่างเมื่อ API พร้อม
        // const res = await axios.get(`${ipAddress}/earnings/summary`, {
        //   headers: { Authorization: `Bearer ${token}` },
        // });
        // setSummary(res.data);

        // MOCK ชั่วคราว
        setSummary({
          pendingWithdrawal: 0,
          totalEarnings: 0,
          totalPending: 0,
        });
      } else {
        setSummary({ pendingWithdrawal: 0, totalEarnings: 0, totalPending: 0 });
      }
    } catch (e) {
      setSummary({ pendingWithdrawal: 0, totalEarnings: 0, totalPending: 0 });
    }
  };

  const loadInvoices = async () => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      if (token) {
        // ตัวอย่างเมื่อ API พร้อม
        // const res = await axios.get(`${ipAddress}/earnings/invoices`, {
        //   headers: { Authorization: `Bearer ${token}` },
        // });
        // setInvoices(res.data?.items || []);

        // MOCK ชั่วคราว (ตารางว่างเหมือนในภาพ)
        setInvoices([]);
      } else {
        setInvoices([]);
      }
    } catch (e) {
      setInvoices([]);
    }
  };

  const totalPages = Math.max(1, Math.ceil(invoices.length / PAGE_SIZE));
  const pagedData = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return invoices.slice(start, start + PAGE_SIZE);
  }, [page, invoices]);

  const SummaryCard = ({ amount, label, icon, tint, bg }) => (
    <View style={[styles.sumCard, { backgroundColor: bg }]}>
      <View style={{ flex: 1 }}>
        <Text style={styles.sumAmount}>{formatTHB(amount)}</Text>
        <Text style={styles.sumLabel}>{label}</Text>
      </View>
      <View style={[styles.sumIcon, { backgroundColor: tint }]}>
        <MaterialCommunityIcons name={icon} size={24} color="#fff" />
      </View>
    </View>
  );

  const TableHeader = () => (
    <View style={styles.tableHeader}>
      <Text style={[styles.th, { flex: 0.5, textAlign: 'center' }]}>#</Text>
      <Text style={[styles.th, { flex: 2 }]}>{t('invoiceId') || 'Invoice ID'}</Text>
      <Text style={[styles.th, { flex: 1.5 }]}>{t('amount') || 'Amount'}</Text>
      <Text style={[styles.th, { flex: 2 }]}>{t('transaction') || 'Transaction'}</Text>
      <Text style={[styles.th, { flex: 1 }]}>{t('status') || 'Status'}</Text>
    </View>
  );

  const TableRow = ({ item, index }) => (
    <View style={styles.tableRow}>
      <Text style={[styles.td, { flex: 0.5, textAlign: 'center' }]}>{index + 1 + (page - 1) * PAGE_SIZE}</Text>
      <Text style={[styles.td, { flex: 2 }]}>{item.invoiceId}</Text>
      <Text style={[styles.td, { flex: 1.5 }]}>{formatTHB(item.amount)}</Text>
      <Text style={[styles.td, { flex: 2 }]}>{item.transactionAt}</Text>
      <Text style={[styles.td, { flex: 1 }]}>{item.status}</Text>
    </View>
  );

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

              <Text style={styles.headerTitle}>{t('earnings') || 'Earnings'}</Text>
              <Text style={styles.headerSubtitle}>{t('earningsSubtitle') || 'Track your earnings and invoices'}</Text>
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
          {/* Summary Cards */}
          <SummaryCard
            amount={summary.pendingWithdrawal}
            label={t('pendingWithdrawal') || 'Pending Withdrawal'}
            icon="arrow-right-circle"
            tint="#F97316"
            bg="#FFECE4"
          />
          <SummaryCard
            amount={summary.totalEarnings}
            label={t('totalEarnings') || 'Total Earnings'}
            icon="credit-card-multiple"
            tint="#10B981"
            bg="#E8FBF4"
          />
          <SummaryCard
            amount={summary.totalPending}
            label={t('totalPending') || 'Total Pending'}
            icon="wallet"
            tint="#FBBF24"
            bg="#FFF6DF"
          />

          {/* Invoice History */}
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.cardTitle}>{t('invoiceHistory') || 'Invoice history'}</Text>

              <TouchableOpacity
                activeOpacity={0.9}
                style={styles.withdrawBtn}
                onPress={() => navigation.navigate?.('Withdraw') /* หรือเปิดโมดัล */}
              >
                <MaterialCommunityIcons name="cash-fast" size={18} color="#fff" />
                <Text style={styles.withdrawText}>{t('withdrawal') || 'Withdrawal'}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.tableWrap}>
              <TableHeader />
              {pagedData.length > 0 ? (
                <FlatList
                  data={pagedData}
                  keyExtractor={(item) => String(item.id)}
                  renderItem={({ item, index }) => (
                    <TableRow item={item} index={index} />
                  )}
                />
              ) : (
                <View style={styles.emptyWrap}>
                  <Text style={styles.emptyText}>
                    {t('noInvoices') || 'No invoices yet'}
                  </Text>
                </View>
              )}

              {/* Pagination */}
              <View style={styles.pagerRow}>
                <TouchableOpacity
                  disabled={page <= 1}
                  onPress={() => setPage((p) => Math.max(1, p - 1))}
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
                  onPress={() => setPage((p) => Math.min(totalPages, p + 1))}
                  style={[styles.pagerBtn, page >= totalPages && styles.pagerBtnDisabled]}
                >
                  <Text style={[styles.pagerBtnText, page >= totalPages && styles.pagerBtnTextDisabled]}>
                    {t('next') || 'Next'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default EarningsScreen;

/* ---------------------------- Styles ---------------------------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },

  // Header
  headerContainer: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 2 },
  headerGradient: {
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
    fontSize: 32, fontWeight: '900', color: '#FFFFFF', marginBottom: 6, letterSpacing: 1,
    textShadowColor: 'rgba(0,0,0,0.2)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4,
  },
  headerSubtitle: { fontSize: 15, color: 'rgba(255,255,255,0.95)', textAlign: 'center', fontWeight: '500', letterSpacing: 0.3 },

  // Scroll Container
  scrollContainer: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingBottom: hp('10%') },
  scrollViewWithMargin: { marginTop: 140, flex: 1 },

  // Content spacing
  content: { paddingHorizontal: wp('4%'), paddingTop: hp('2%'), paddingBottom: hp('5%'), minHeight: '100%' },

  // Summary Cards
  sumCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: wp('4%'), borderRadius: wp('3%'), marginBottom: hp('1.8%'),
  },
  sumAmount: { fontSize: wp('6%'), fontWeight: 'bold', color: '#111827', marginBottom: 4 },
  sumLabel: { fontSize: wp('3.8%'), color: '#6B7280', fontWeight: '500' },
  sumIcon: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },

  // Card (Invoice history)
  card: {
    backgroundColor: '#fff',
    borderRadius: wp('3%'),
    padding: wp('3%'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: hp('1%') },
  cardTitle: { fontSize: wp('4.6%'), fontWeight: '700', color: '#111827' },

  withdrawBtn: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F97316',
    paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 12, gap: 6,
  },
  withdrawText: { color: '#fff', fontWeight: '700' },

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
