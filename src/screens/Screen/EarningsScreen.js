import React, { useEffect, useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
  StatusBar, ScrollView, FlatList, Platform, Alert, Modal, TextInput
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
const TABLE_MIN_WIDTH = 820;

const EarningsScreen = ({ navigation }) => {
  const { t } = useLanguage();
  const { user } = useAuth();

  const [summary, setSummary] = useState({
    pendingWithdrawal: 0,
    totalEarnings: 0,
    totalPending: 0,
  });

  const [invoices, setInvoices] = useState([]);
  const [page, setPage] = useState(1);

  // --- Withdrawal Modal state ---
  const [withdrawVisible, setWithdrawVisible] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('0.00');
  const [savingWithdraw, setSavingWithdraw] = useState(false);

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
  const format2 = (n) => Number(n || 0).toFixed(2);

  const availableToWithdraw = Math.max(
    0,
    Number(summary.totalEarnings || 0) -
      Number(summary.totalPending || 0) -
      Number(summary.pendingWithdrawal || 0)
  );

  const loadSummary = async () => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      if (token) {
        // const res = await axios.get(`${ipAddress}/earnings/summary`, { headers: { Authorization: `Bearer ${token}` }});
        // setSummary(res.data);
        setSummary({ pendingWithdrawal: 0, totalEarnings: 0, totalPending: 0 }); // mock
      } else {
        setSummary({ pendingWithdrawal: 0, totalEarnings: 0, totalPending: 0 });
      }
    } catch {
      setSummary({ pendingWithdrawal: 0, totalEarnings: 0, totalPending: 0 });
    }
  };

  const loadInvoices = async () => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      if (token) {
        // const res = await axios.get(`${ipAddress}/earnings/invoices`, { headers: { Authorization: `Bearer ${token}` }});
        // setInvoices(res.data?.items || []);
        setInvoices([]); // mock
      } else {
        setInvoices([]);
      }
    } catch {
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
      <Text style={[styles.th, { flex: 0.6, textAlign: 'center' }]}>#</Text>
      <Text style={[styles.th, { flex: 1.6 }]}>{t('invoiceId') || 'Invoice ID'}</Text>
      <Text style={[styles.th, { flex: 1 }]}>{t('amount') || 'Amount'}</Text>
      <Text style={[styles.th, { flex: 1.4 }]}>{t('transactionDate') || 'Transaction date'}</Text>
      <Text style={[styles.th, { flex: 1 }]}>{t('status') || 'Status'}</Text>
      <Text style={[styles.th, { flex: 0.9, textAlign: 'center' }]}>{t('action') || 'Action'}</Text>
    </View>
  );

  const statusMeta = (status) => {
    const s = String(status || '').toLowerCase();
    if (s === 'paid' || s === 'success')
      return { bg: '#DCFCE7', fg: '#16A34A', text: t('paid') || 'Paid' };
    if (s === 'failed' || s === 'reject')
      return { bg: '#FEE2E2', fg: '#DC2626', text: t('failed') || 'Failed' };
    return { bg: '#FDE68A', fg: '#92400E', text: t('pending') || 'Pending' };
  };

  const handleViewInvoice = (item) => {
    if (navigation?.navigate) {
      try {
        navigation.navigate('InvoiceDetail', { invoice: item });
      } catch {
        Alert.alert(t('invoice') || 'Invoice', JSON.stringify(item, null, 2));
      }
    } else {
      Alert.alert(t('invoice') || 'Invoice', JSON.stringify(item, null, 2));
    }
  };

  // --- Withdrawal flow ---
  const openWithdraw = () => {
    setWithdrawAmount('0.00');
    setWithdrawVisible(true);
  };

  const onChangeAmount = (txt) => {
    // อนุญาตเฉพาะตัวเลขและจุดทศนิยม 2 ตำแหน่ง
    let cleaned = txt.replace(/[^\d.]/g, '');
    const parts = cleaned.split('.');
    if (parts.length > 2) cleaned = parts[0] + '.' + parts.slice(1).join('');
    const [intPart, decPart = ''] = cleaned.split('.');
    const final = decPart.length > 2 ? `${intPart}.${decPart.slice(0, 2)}` : cleaned;
    setWithdrawAmount(final === '' ? '0' : final);
  };

  const saveWithdraw = async () => {
    const amt = parseFloat(withdrawAmount || '0');
    if (!amt || isNaN(amt) || amt <= 0) {
      Alert.alert(t('error') || 'Error', t('enterValidAmount') || 'Please enter a valid amount.');
      return;
    }
    if (amt > availableToWithdraw) {
      Alert.alert(
        t('error') || 'Error',
        `${t('maxWithdrawIs') || 'The maximum amount that can be withdrawn is'}: ${format2(
          availableToWithdraw
        )}`
      );
      return;
    }

    try {
      setSavingWithdraw(true);
      const token = await SecureStore.getItemAsync('userToken');

      // เรียก API จริงเมื่อพร้อม
      // await axios.post(`${ipAddress}/earnings/withdraw`, { amount: amt }, { headers: { Authorization: `Bearer ${token}` } });

      // ตัวอย่างสำเร็จ
      Alert.alert(t('success') || 'Success', t('withdrawRequested') || 'Withdrawal request submitted.');
      setWithdrawVisible(false);
      await loadSummary();
      await loadInvoices();
    } catch (e) {
      Alert.alert(t('error') || 'Error', t('tryAgain') || 'Please try again.');
    } finally {
      setSavingWithdraw(false);
    }
  };

  const TableRow = ({ item, index }) => {
    const meta = statusMeta(item.status);
    return (
      <View style={styles.tableRow}>
        <Text style={[styles.td, { flex: 0.6, textAlign: 'center' }]}>{index + 1 + (page - 1) * PAGE_SIZE}</Text>
        <Text style={[styles.td, { flex: 1.6 }]}>{item.invoiceId}</Text>
        <Text style={[styles.td, { flex: 1 }]}>{formatTHB(item.amount)}</Text>
        <Text style={[styles.td, { flex: 1.4 }]}>{item.transactionAt}</Text>

        <View style={[styles.statusPill, { backgroundColor: meta.bg, borderColor: meta.fg }]}>
          <Text style={[styles.statusText, { color: meta.fg }]}>{meta.text}</Text>
        </View>

        <View style={{ flex: 0.9, alignItems: 'center' }}>
          <TouchableOpacity activeOpacity={0.85} onPress={() => handleViewInvoice(item)} style={styles.actionBtn}>
            <Text style={styles.actionBtnText}>{t('view') || 'View'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
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

              <Text style={styles.headerTitle}>{t('earnings') || 'Earnings'}</Text>
              <Text style={styles.headerSubtitle}>
                {t('earningsSubtitle') || 'Track your earnings and invoices'}
              </Text>
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
          <SummaryCard amount={summary.totalPending} label={t('totalPending') || 'Total Pending'} icon="wallet" tint="#FBBF24" bg="#FFF6DF" />

          {/* Invoice History */}
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.cardTitle}>{t('invoiceHistory') || 'Invoice history'}</Text>

              <TouchableOpacity activeOpacity={0.9} style={styles.withdrawBtn} onPress={openWithdraw}>
                <MaterialCommunityIcons name="cash-fast" size={18} color="#fff" />
                <Text style={styles.withdrawText}>{t('withdrawal') || 'Withdrawal'}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.tableWrap}>
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
                      <Text style={styles.emptyText}>{t('noInvoices') || 'No invoices yet'}</Text>
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
              </ScrollView>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Withdrawal Modal */}
      <Modal visible={withdrawVisible} transparent animationType="fade" onRequestClose={() => setWithdrawVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('withdrawal') || 'Withdrawal'}</Text>
              <TouchableOpacity onPress={() => setWithdrawVisible(false)} style={styles.modalClose}>
                <MaterialIcons name="close" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>{t('amountWithdrawal') || 'Amount Withdrawal'}<Text style={{color:'#EF4444'}}>*</Text></Text>
            <TextInput
              value={withdrawAmount}
              onChangeText={onChangeAmount}
              keyboardType="decimal-pad"
              placeholder="0.00"
              style={styles.input}
            />
            <Text style={styles.helperText}>
              <Text style={{ color: '#EF4444' }}>*</Text>
              {t('maximumWithdrawIs') || 'The maximum amount that can be withdrawn is'}: {format2(availableToWithdraw)}
            </Text>

            <View style={styles.modalDivider} />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.btnClose} onPress={() => setWithdrawVisible(false)}>
                <Text style={styles.btnCloseText}>{t('close') || 'Close'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btnSave, savingWithdraw && { opacity: 0.7 }]}
                onPress={saveWithdraw}
                disabled={savingWithdraw}
              >
                <Text style={styles.btnSaveText}>{t('save') || 'Save'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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

  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  td: { fontSize: wp('3.6%'), color: '#374151' },

  statusPill: {
    flex: 1,
    alignSelf: 'center',
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderWidth: 1,
    marginRight: 10,
  },
  statusText: { fontSize: wp('3.2%'), fontWeight: '700', textAlign: 'center' },

  actionBtn: {
    backgroundColor: '#FFF4ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  actionBtnText: { color: '#F97316', fontWeight: '700' },

  emptyWrap: { alignItems: 'center', paddingVertical: 24 },
  emptyText: { color: '#6B7280' },

  pagerRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 12, gap: 10 },
  pagerBtn: { paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#FFF7ED', borderRadius: 10 },
  pagerBtnDisabled: { backgroundColor: '#FAFAFA' },
  pagerBtnText: { color: '#F97316', fontWeight: '700' },
  pagerBtnTextDisabled: { color: '#9CA3AF' },
  pageBadge: { backgroundColor: '#F97316', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  pageBadgeText: { color: '#fff', fontWeight: '800' },

  // --- Withdrawal Modal styles ---
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', alignItems: 'center', padding: 18 },
  modalCard: { width: '100%', maxWidth: 420, backgroundColor: '#fff', borderRadius: 14, padding: 18 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#111827' },
  modalClose: { padding: 4, borderRadius: 999, backgroundColor: 'transparent' },
  inputLabel: { marginTop: 16, marginBottom: 6, color: '#111827', fontWeight: '700' },
  input: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 16 },
  helperText: { color: '#6B7280', marginTop: 8 },
  modalDivider: { height: 1, backgroundColor: '#E5E7EB', marginTop: 16, marginBottom: 12 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  btnClose: { backgroundColor: '#9CA3AF', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10 },
  btnCloseText: { color: '#fff', fontWeight: '700' },
  btnSave: { backgroundColor: '#F97316', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10 },
  btnSaveText: { color: '#fff', fontWeight: '700' },
});
