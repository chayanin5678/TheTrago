import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView, StyleSheet, Image, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguage } from './LanguageContext';
import { useCustomer } from './CustomerContext';
import { useTabBarAutoHide } from '../../utils/useTabBarAutoHide';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import AntDesign from '@expo/vector-icons/AntDesign';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

const brandIcons = {
  Visa: require("../../../assets/visa.png"),
  MasterCard: require("../../../assets/mastercard.png"),
  JCB: require("../../../assets/jcb.png"),
  "American Express": require("../../../assets/amex.png"),
  Unknown: require("../../../assets/default-card.png"),
};

export default function PaymentTourScreen({ navigation, route }) {
  const { t } = useLanguage();
  const { customerData } = useCustomer();
  const insets = useSafeAreaInsets();
  const scrollProps = useTabBarAutoHide();
  const [isTabBarVisible, setIsTabBarVisible] = useState(true);

  // ตรวจสอบสถานะ tab bar จาก global
  useEffect(() => {
    const checkTabBar = setInterval(() => {
      if (typeof global.isTabBarVisible !== 'undefined') {
        setIsTabBarVisible(global.isTabBarVisible);
      }
    }, 100);
    
    return () => clearInterval(checkTabBar);
  }, []);

  // Expect route.params to include: tour, date, adults, children, infants, currencySymbol, total, unitPrice, subtotal
  const { 
    tour = {}, 
    date = null, 
    adults = 0, 
    children = 0, 
    infants = 0, 
    currencySymbol = '฿', 
    total = 0,
    unitPrice = {},
    subtotal = {}
  } = route.params || {};

  const formattedTotal = useMemo(() => {
    const n = Number(total || 0);
    return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }, [total]);

  // payment states similar to PaymentScreen
  const [selectedOption, setSelectedOption] = useState(null); // e.g. "7" for card, "2" for promptpay
  const [pickup, setPickup] = useState(false); // terms accepted
  const [savedCards, setSavedCards] = useState([]);
  const [selectedCardId, setSelectedCardId] = useState(null);

  const handleSelection = (opt) => {
    setSelectedOption(String(opt));
  };

  const handlePay = () => {
    if (!pickup) {
      Alert.alert(t('termsAndConditions') || 'Terms and Conditions', t('pleaseCheckTerms') || 'Please check the Terms and Conditions before proceeding.');
      return;
    }

    if (!selectedOption) {
      Alert.alert(t('paymentOption') || 'Payment Option', t('pleaseSelectPayment') || 'Please select a payment option.');
      return;
    }

    if (selectedOption === "7") {
      // card flow (if no saved card, navigate to AddCardScreen)
      if (!selectedCardId) {
        navigation.navigate('AddCardScreen', {
          onAddCard: (newCard) => {
            // append for demo
            setSavedCards(prev => [...prev, newCard]);
          }
        });
        return;
      }
      // simulate success
      Alert.alert('', t('paymentSuccessMessage') || 'Payment successful', [{ text: t('ok') || 'OK', onPress: () => navigation.navigate('ResultScreen', { success: true, source: 'tour' }) }]);
    } else if (selectedOption === "2") {
      // PromptPay flow (placeholder)
      navigation.navigate('PromptPayScreen', { amount: total, source: 'tour' });
    } else {
      Alert.alert(t('paymentOption') || 'Payment Option', t('pleaseSelectPayment') || 'Please select a payment option.');
    }
  };

  

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView {...scrollProps} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.heading}>{t('tourPayment') || 'Tour Payment'}</Text>

        {/* Tour Info Section */}
        <View style={styles.infoSection}>
          <Text style={styles.infoLabel}>{t('tourInformation') || 'Tour'}</Text>
          <Text style={styles.infoValue}>{tour.title || tour.name || t('unknownTour') || 'Unknown tour'}</Text>

          {date && (
            <>
              <Text style={styles.infoLabel}>{t('departureDate') || 'Departure Date'}</Text>
              <Text style={styles.infoValue}>{date}</Text>
            </>
          )}

          {adults > 0 && (
            <View style={styles.priceRow}>
              <View style={styles.priceLeft}>
                <Text style={styles.infoLabel}>{t('adult') || 'ผู้ใหญ่'}</Text>
                <Text style={styles.infoValue}>{adults} x {currencySymbol}{Number(unitPrice.adult || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
              </View>
              <Text style={styles.priceAmount}>{currencySymbol}{Number(subtotal.adult || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
            </View>
          )}

          {children > 0 && (
            <View style={styles.priceRow}>
              <View style={styles.priceLeft}>
                <Text style={styles.infoLabel}>{t('child') || 'เด็ก'}</Text>
                <Text style={styles.infoValue}>{children} x {currencySymbol}{Number(unitPrice.child || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
              </View>
              <Text style={styles.priceAmount}>{currencySymbol}{Number(subtotal.child || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
            </View>
          )}
          {infants > 0 && (
            <View style={styles.priceRow}>
              <View style={styles.priceLeft}>
                <Text style={styles.infoLabel}>{t('infant') || 'ทารก'}</Text>
                <Text style={styles.infoValue}>{infants} x {currencySymbol}{Number(unitPrice.infant || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
              </View>
              <Text style={styles.priceAmount}>{currencySymbol}{Number(subtotal.infant || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
            </View>
          )}

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>{t('totalPrice') || t('total') || 'Total'}</Text>
            <Text style={styles.totalAmount}>{currencySymbol} {formattedTotal}</Text>
          </View>
        </View>

        {/* Payment Options Section */}
        <View style={styles.paymentSection}>
          <Text style={styles.sectionTitle}>{t('paymentOptions') || t('paymentMethods') || 'Payment Methods'}</Text>

          <TouchableOpacity style={[styles.paymentOption, selectedOption === '7' && styles.paymentOptionSelected]} onPress={() => handleSelection('7')}>
            <View style={styles.paymentIconBox}>
              <FontAwesome name="credit-card" size={24} color="#FD501E" />
            </View>
            <View style={styles.paymentContent}>
              <Text style={styles.paymentTitle}>{t('creditDebitCard') || 'Credit / Debit'}</Text>
              <Text style={styles.paymentDesc}>{t('securePaymentMethod') || ''}</Text>
            </View>
            <View style={styles.paymentArrow}>
              <AntDesign name="right" size={18} color="#9CA3AF" />
            </View>
          </TouchableOpacity>

          {selectedOption === '7' && (
            <View style={styles.savedCardsContainer}>
              {savedCards.length > 0 ? (
                savedCards.map(card => (
                  <TouchableOpacity key={card.id} style={[styles.savedCardItem, selectedCardId === card.id && styles.savedCardSelected]} onPress={() => setSelectedCardId(card.id)}>
                    <View style={styles.savedCardIconWrap}>
                      <Image source={brandIcons[card.brand] || brandIcons.Unknown} style={styles.savedCardIcon} />
                    </View>
                    <View style={{ marginLeft: 12, flex: 1 }}>
                      <Text style={styles.savedCardNumber}>{'**** **** **** ' + (card.cardNumber || '').slice(-4)}</Text>
                      <Text style={styles.savedCardMeta}>{card.cardName}  |  {card.expiry}</Text>
                    </View>
                    {selectedCardId === card.id && <AntDesign name="check" size={20} color="#FD501E" />}
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={styles.noCardsText}>{t('noCardsSaved') || 'No saved cards'}</Text>
              )}

              <TouchableOpacity style={styles.addCardBtn} onPress={() => navigation.navigate('AddCardScreen', { onAddCard: (newCard) => setSavedCards(prev => [...prev, newCard]) })}>
                <AntDesign name="plus" size={18} color="#FD501E" />
                <Text style={styles.addCardText}>{t('addCard') || 'Add card'}</Text>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity style={[styles.paymentOption, selectedOption === '2' && styles.paymentOptionSelected]} onPress={() => handleSelection('2')}>
            <View style={styles.paymentIconBox}>
              <FontAwesome name="qrcode" size={24} color="#10B981" />
            </View>
            <View style={styles.paymentContent}>
              <Text style={styles.paymentTitle}>{t('promptPay') || 'PromptPay'}</Text>
              <Text style={styles.paymentDesc}>{t('qrCodePromptPay') || ''}</Text>
            </View>
            <View style={styles.paymentArrow}>
              <AntDesign name="right" size={18} color="#9CA3AF" />
            </View>
          </TouchableOpacity>

          <View style={styles.termsContainer}>
            <TouchableOpacity onPress={() => setPickup(!pickup)} style={styles.termsCheckbox}>
              <MaterialIcons name={pickup ? 'check-box' : 'check-box-outline-blank'} size={24} color="#FD501E" />
            </TouchableOpacity>
            <Text style={styles.termsText}>
              {t('agreeTermsText') || 'I understand and agree with the'} <Text style={styles.termsLink}>{t('termsOfServices') || t('termsAndConditions') || 'Terms'}</Text>
            </Text>
          </View>

        </View>

      </ScrollView>

      {/* Bottom Pay Button */}
      <View style={[
        styles.bottomPayContainer, 
        { 
          bottom: isTabBarVisible ? (Platform.OS === 'ios' ? 80 : 65) : insets.bottom,
          paddingBottom: hp('1.5%')
        }
      ]}>
          <TouchableOpacity style={styles.bottomPayButton} onPress={handlePay} activeOpacity={0.9}>
          <Text style={styles.bottomPayButtonText}>{t('payNow') || 'Pay now'} • {currencySymbol}{formattedTotal}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB'
  },
  content: {
    padding: wp('4%'),
    paddingBottom: hp('12%')
  },
  heading: {
    fontSize: wp('6%'),
    fontWeight: '700',
    marginBottom: hp('2%'),
    color: '#111827'
  },
  bottomPayContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingHorizontal: wp('4%'),
    paddingTop: hp('1.5%'),
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -4 },
    elevation: 10
  },
  bottomPayButton: {
    backgroundColor: '#FD501E',
    paddingVertical: hp('1.8%'),
    paddingHorizontal: wp('5%'),
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#FD501E',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 6
  },
  bottomPayButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: wp('4.5%'),
    letterSpacing: 0.3
  },
  infoSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: wp('4%'),
    marginBottom: hp('2%'),
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2
  },
  infoLabel: {
    fontSize: wp('3.5%'),
    color: '#6B7280',
    marginTop: hp('1.2%'),
    marginBottom: hp('0.3%')
  },
  infoValue: {
    fontSize: wp('4.2%'),
    color: '#111827',
    fontWeight: '600',
    marginBottom: hp('0.5%')
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: hp('1%'),
    marginBottom: hp('0.5%')
  },
  priceLeft: {
    flex: 1
  },
  priceAmount: {
    fontSize: wp('4.2%'),
    color: '#111827',
    fontWeight: '700',
    marginLeft: wp('3%')
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: hp('1.5%')
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: hp('0.5%')
  },
  totalLabel: {
    fontSize: wp('4.2%'),
    color: '#111827',
    fontWeight: '700'
  },
  totalAmount: {
    fontSize: wp('4.8%'),
    color: '#111827',
    fontWeight: '800'
  },
  paymentSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: wp('4%'),
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2
  },
  sectionTitle: {
    fontSize: wp('4.5%'),
    fontWeight: '700',
    color: '#111827',
    marginBottom: hp('1.5%')
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: wp('3.5%'),
    marginBottom: hp('1.2%'),
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  paymentOptionSelected: {
    backgroundColor: '#FFF7F5',
    borderColor: '#FD501E',
    borderWidth: 2
  },
  paymentIconBox: {
    width: wp('12%'),
    height: wp('12%'),
    borderRadius: 10,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: wp('3%')
  },
  paymentContent: {
    flex: 1
  },
  paymentTitle: {
    fontSize: wp('4.2%'),
    fontWeight: '700',
    color: '#111827',
    marginBottom: hp('0.3%')
  },
  paymentDesc: {
    fontSize: wp('3.3%'),
    color: '#6B7280'
  },
  paymentArrow: {
    marginLeft: wp('2%')
  },
  savedCardsContainer: {
    marginTop: hp('1%'),
    marginBottom: hp('1%'),
    paddingLeft: wp('2%')
  },
  savedCardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: wp('3%'),
    marginBottom: hp('1%'),
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  savedCardSelected: {
    borderColor: '#FD501E',
    borderWidth: 2,
    backgroundColor: '#FFF7F5'
  },
  savedCardIconWrap: {
    width: wp('12%'),
    height: wp('8%'),
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center'
  },
  savedCardIcon: {
    width: wp('10%'),
    height: wp('6%'),
    resizeMode: 'contain'
  },
  savedCardNumber: {
    fontWeight: '700',
    fontSize: wp('4%'),
    color: '#111827'
  },
  savedCardMeta: {
    color: '#6B7280',
    fontSize: wp('3.3%'),
    marginTop: hp('0.3%')
  },
  noCardsText: {
    color: '#9CA3AF',
    fontSize: wp('3.5%'),
    marginBottom: hp('1%')
  },
  addCardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7F5',
    paddingVertical: hp('1.2%'),
    paddingHorizontal: wp('4%'),
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FD501E',
    borderStyle: 'dashed',
    alignSelf: 'flex-start',
    marginTop: hp('0.5%')
  },
  addCardText: {
    color: '#FD501E',
    fontWeight: '700',
    fontSize: wp('3.8%'),
    marginLeft: wp('2%')
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: hp('2%'),
    paddingTop: hp('1.5%'),
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB'
  },
  termsCheckbox: {
    marginRight: wp('2%'),
    marginTop: hp('0.2%')
  },
  termsText: {
    flex: 1,
    fontSize: wp('3.5%'),
    color: '#6B7280',
    lineHeight: wp('5%')
  },
  termsLink: {
    color: '#FD501E',
    fontWeight: '600'
  }
});
