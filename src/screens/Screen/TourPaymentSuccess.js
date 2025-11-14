import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Image, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguage } from './LanguageContext';
import { useCustomer } from './CustomerContext';
import * as Print from 'expo-print';
import { styles } from '../../styles/CSS/ResultScreenStyles';
import LogoTheTrago from './../../components/component/Logo';

const TourPaymentSuccess = ({ navigation, route }) => {
  const { t } = useLanguage();
  const { customerData } = useCustomer();
  const insets = useSafeAreaInsets();

  const { bookingCode, paymentId } = route.params || {};

  const handleViewBooking = () => {
    // Reuse existing ResultScreen to show full booking details
    navigation.navigate('ResultScreen', { success: true, bookingCode, paymentId, type: 'tour' });
  };

  const handleGoHome = () => navigation.navigate('HomeScreen');

  const handlePrint = async () => {
    try {
      const html = `<html><body><h1>${t('bookingConfirmed') || 'Booking Confirmed'}</h1><p>${t('bookingCode') || 'Booking Code'}: ${bookingCode || customerData.md_booking_code || 'N/A'}</p></body></html>`;
      await Print.printAsync({ html });
    } catch (err) {
      console.error('Print error', err);
      Alert.alert(t('error') || 'Error', t('printFailed') || 'Unable to print');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <LinearGradient colors={["#002A5C", "#2563EB"]} style={{ flex: 1 }}>
        <View style={{ paddingTop: insets.top + 16, paddingHorizontal: 20, alignItems: 'center' }}>
          <LogoTheTrago />
        </View>

        <View style={[styles.container, { paddingTop: 24 }]}> 
          <View style={styles.card}>
            <View style={{ alignItems: 'center', paddingVertical: 24 }}>
              <Image source={require('../../../assets/success.png')} style={{ width: 96, height: 96, marginBottom: 12 }} />
              <Text style={{ fontSize: 22, fontWeight: '800', color: '#002A5C', marginBottom: 8 }}>{t('bookingConfirmed') || 'Booking Confirmed'}</Text>
              <Text style={{ color: '#6B7280', marginBottom: 12 }}>{t('ticketConfirmed') || 'Your booking was successful.'}</Text>
              <Text style={{ fontWeight: '700', fontSize: 18, marginTop: 8 }}>{t('bookingCode') || 'Booking Code'}: {bookingCode || customerData.md_booking_code || 'N/A'}</Text>
              {paymentId ? <Text style={{ color: '#6B7280', marginTop: 6 }}>{t('paymentId') || 'Payment ID'}: {paymentId}</Text> : null}
            </View>

            <View style={{ marginTop: 16 }}>
              <TouchableOpacity onPress={handlePrint} style={[styles.actionButton, { backgroundColor: '#2563EB' }]}>
                <Text style={{ color: '#fff', fontWeight: '700' }}>{t('printTicket') || 'Print Ticket'}</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleViewBooking} style={[styles.actionButton, { backgroundColor: '#FD501E', marginTop: 12 }]}>
                <Text style={{ color: '#fff', fontWeight: '700' }}>{t('viewBooking') || 'View Booking'}</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleGoHome} style={[styles.actionButton, { backgroundColor: '#FFFFFF', marginTop: 12, borderWidth: 1, borderColor: '#E5E7EB' }]}>
                <Text style={{ color: '#002A5C', fontWeight: '700' }}>{t('backToHome') || 'Back to Home'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default TourPaymentSuccess;
