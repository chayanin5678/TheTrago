import React, { useMemo, useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView, StyleSheet, Image, Platform, TextInput, Modal, Animated, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguage } from './LanguageContext';
import { useCustomer } from './CustomerContext';
import { hideBottomTabBar, showBottomTabBar } from '../../utils/hideBottomTabBar';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import AntDesign from '@expo/vector-icons/AntDesign';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import axios from 'axios';
import * as Linking from 'expo-linking';
import moment from 'moment-timezone';
import ipAddress from '../../config/ipconfig';

const brandIcons = {
  Visa: require("../../../assets/visa.png"),
  MasterCard: require("../../../assets/mastercard.png"),
  JCB: require("../../../assets/jcb.png"),
  "American Express": require("../../../assets/amex.png"),
  Unknown: require("../../../assets/default-card.png"),
};

// Primary theme color (change here to update accent across this screen)
const THEME_COLOR = '#FF6B35';

export default function PaymentTourScreen({ navigation, route }) {
  const { t } = useLanguage();
  const { customerData, updateCustomerData } = useCustomer();
  const insets = useSafeAreaInsets();
  
  // Hide bottom tab bar
  useEffect(() => {
    hideBottomTabBar();
    
    return () => {
      showBottomTabBar();
    };
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

  // Log data when entering this screen
  useEffect(() => {
    console.log('🎬 [PaymentTourScreen] Screen Loaded');
    console.log('👤 Customer Data:', {
      firstName: customerData?.md_tours_firstname,
      lastName: customerData?.md_tours_lastname,
      prefix: customerData?.md_tours_title,
      tel: customerData?.md_tours_tel,
      email: customerData?.md_tours_email,
      country: customerData?.md_tours_country,
      countrycode: customerData?.md_tours_countrycode,
      account_id: customerData?.md_booking_memberid
    });
    console.log('🎫 Tour Data:', {
      md_tour_id: customerData?.md_tours_id,
    });
    const bookingInfo = {
      adults: typeof adults === 'number' && adults >= 0 ? adults : (customerData?.md_tours_adult || 0),
      children: typeof children === 'number' && children >= 0 ? children : (customerData?.md_tours_child || 0),
      infants: typeof infants === 'number' && infants >= 0 ? infants : (customerData?.md_tours_infant || 0),
      date: date || customerData?.md_tours_departdate || customerData?.md_booking_departdate || '',
    };
    console.log('👥 Booking Info:', bookingInfo);
  }, []);

  const formattedTotal = useMemo(() => {
    const n = Number(total || 0);
    return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }, [total]);

  // payment states similar to PaymentScreen
  const [selectedOption, setSelectedOption] = useState(null); // e.g. "7" for card, "2" for promptpay
  const [pickup, setPickup] = useState(false); // terms accepted
  const [savedCards, setSavedCards] = useState([]);
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [cardNumber, setCardNumber] = useState('');
  const [cardNumberError, setCardNumberError] = useState('');
  const [cardHolder, setCardHolder] = useState(customerData?.fullName || '');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardNumberFocused, setCardNumberFocused] = useState(false);
  const [cardHolderFocused, setCardHolderFocused] = useState(false);
  const [cardExpiryFocused, setCardExpiryFocused] = useState(false);
  const [cardCvvFocused, setCardCvvFocused] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const modalTranslateY = useRef(new Animated.Value(hp('80%'))).current;
  
  // Voucher modal states
  const [voucherModalVisible, setVoucherModalVisible] = useState(false);
  const [voucherNumber, setVoucherNumber] = useState('');
  const [voucherPin, setVoucherPin] = useState('');
  const [voucherError, setVoucherError] = useState('');
  const [voucherNumberError, setVoucherNumberError] = useState('');
  const [voucherPinError, setVoucherPinError] = useState('');
  const voucherOverlayOpacity = useRef(new Animated.Value(0)).current;
  const voucherModalTranslateY = useRef(new Animated.Value(hp('80%'))).current;
  
  // Timer countdown (10 minutes = 600 seconds)
  const [timeLeft, setTimeLeft] = useState(600);
  
  // Loading state for payment processing
  const [isLoading, setIsLoading] = useState(false);

  // Storage keys
  const STORAGE_KEYS = {
    SAVED_CARDS: 'payment_savedCards',
    SELECTED_CARD: 'payment_selectedCardId',
    PICKUP: 'payment_pickup',
    CARD_NUMBER: 'payment_cardNumber',
    CARD_HOLDER: 'payment_cardHolder',
    CARD_EXPIRY: 'payment_cardExpiry'
  };

  const persistSavedCards = async (cards) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SAVED_CARDS, JSON.stringify(cards || []));
    } catch (e) {
      // ignore
    }
  };

  const persistSelectedCardId = async (id) => {
    try {
      if (id) await AsyncStorage.setItem(STORAGE_KEYS.SELECTED_CARD, String(id));
      else await AsyncStorage.removeItem(STORAGE_KEYS.SELECTED_CARD);
    } catch (e) {
      // ignore
    }
  };

  const persistPickup = async (val) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.PICKUP, val ? 'true' : 'false');
    } catch (e) {
      // ignore
    }
  };

  const persistFormFields = async (number, holder, expiry) => {
    try {
      if (number) await AsyncStorage.setItem(STORAGE_KEYS.CARD_NUMBER, number);
      else await AsyncStorage.removeItem(STORAGE_KEYS.CARD_NUMBER);
      
      if (holder) await AsyncStorage.setItem(STORAGE_KEYS.CARD_HOLDER, holder);
      else await AsyncStorage.removeItem(STORAGE_KEYS.CARD_HOLDER);
      
      if (expiry) await AsyncStorage.setItem(STORAGE_KEYS.CARD_EXPIRY, expiry);
      else await AsyncStorage.removeItem(STORAGE_KEYS.CARD_EXPIRY);
    } catch (e) {
      // ignore
    }
  };

  // Load persisted payment-related data once
  useEffect(() => {
    (async () => {
      try {
        const sc = await AsyncStorage.getItem(STORAGE_KEYS.SAVED_CARDS);
        if (sc) {
          const parsed = JSON.parse(sc);
          if (Array.isArray(parsed)) setSavedCards(parsed);
        }
        const sel = await AsyncStorage.getItem(STORAGE_KEYS.SELECTED_CARD);
        if (sel) {
          setSelectedCardId(sel);
          // if we have saved cards loaded and one matches, populate the form
          try {
            const parsed = sc ? JSON.parse(sc) : null;
            if (Array.isArray(parsed)) {
              const found = parsed.find(c => String(c.id) === String(sel));
              if (found) populateFromCard(found);
            }
          } catch (e) {
            // ignore
          }
        }
        const p = await AsyncStorage.getItem(STORAGE_KEYS.PICKUP);
        if (p === 'true') setPickup(true);
        
        // Load persisted form fields
        const cn = await AsyncStorage.getItem(STORAGE_KEYS.CARD_NUMBER);
        if (cn) setCardNumber(cn);
        
        const ch = await AsyncStorage.getItem(STORAGE_KEYS.CARD_HOLDER);
        if (ch) setCardHolder(ch);
        
        const ce = await AsyncStorage.getItem(STORAGE_KEYS.CARD_EXPIRY);
        if (ce) setCardExpiry(ce);
      } catch (e) {
        // ignore
      }
    })();
  }, []);

  // Helper to populate form fields from a saved card object if it contains non-sensitive data
  const populateFromCard = (card) => {
    if (!card) return;
    // If the saved card object includes a full cardNumber value (e.g., from AddCardScreen), prefill it.
    if (card.cardNumber && String(card.cardNumber).replace(/\s/g, '').length >= 12) {
      setCardNumber(formatCardNumber(String(card.cardNumber)));
    } else {
      // If there's no full number, do not write masked into the input - leave as-is or clear
      setCardNumber('');
    }
    if (card.cardName) setCardHolder(card.cardName);
    if (card.expiry) setCardExpiry(card.expiry);
  };

  // Countdown timer effect
  useEffect(() => {
    if (timeLeft <= 0) {
      Alert.alert(
        t('timeExpired') || 'หมดเวลา',
        t('paymentTimeExpired') || 'หมดเวลาชำระเงิน กรุณาทำการจองใหม่อีกครั้ง',
        [{ text: t('ok') || 'ตกลง', onPress: () => navigation.navigate('HomeScreen') }]
      );
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, navigation, t]);

  // Handle deep linking for payment redirects
  useEffect(() => {
    const subscription = Linking.addEventListener('url', ({ url }) => {
      if (url.includes('payment/success')) {
        setIsLoading(false);
        navigation.navigate('ResultScreen', {
          success: true,
          bookingCode: customerData.tour_booking_code,
          paymentId: customerData.tour_payment_id,
          type: 'tour'
        });
      } else if (url.includes('payment/failure')) {
        setIsLoading(false);
        Alert.alert(
          t('paymentFailed') || 'ชำระเงินไม่สำเร็จ',
          t('paymentFailedMessage') || 'การชำระเงินไม่สำเร็จ กรุณาลองใหม่อีกครั้ง',
          [{ text: t('ok') || 'ตกลง' }]
        );
      }
    });

    return () => subscription.remove();
  }, [customerData, navigation, t]);

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Open modal: fade background and slide modal content up
  const openModal = () => {
    setModalVisible(true);
    setShowDetailsModal(true);
    // reset start position
    modalTranslateY.setValue(hp('80%'));
    overlayOpacity.setValue(0);

    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 0.5,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(modalTranslateY, {
        toValue: 0,
        duration: 320,
        useNativeDriver: true,
      })
    ]).start();
  };

  // Close modal: fade background and slide modal content down
  const closeModal = () => {
    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(modalTranslateY, {
        toValue: hp('80%'),
        duration: 280,
        useNativeDriver: true,
      })
    ]).start(() => {
      setShowDetailsModal(false);
      setModalVisible(false);
    });
  };

  // Open voucher modal
  const openVoucherModal = () => {
    setVoucherModalVisible(true);
    setVoucherError('');
    voucherModalTranslateY.setValue(hp('80%'));
    voucherOverlayOpacity.setValue(0);

    Animated.parallel([
      Animated.timing(voucherOverlayOpacity, {
        toValue: 0.5,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(voucherModalTranslateY, {
        toValue: 0,
        duration: 320,
        useNativeDriver: true,
      })
    ]).start();
  };

  // Close voucher modal
  const closeVoucherModal = () => {
    Animated.parallel([
      Animated.timing(voucherOverlayOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(voucherModalTranslateY, {
        toValue: hp('80%'),
        duration: 280,
        useNativeDriver: true,
      })
    ]).start(() => {
      setVoucherModalVisible(false);
      setVoucherNumber('');
      setVoucherPin('');
      setVoucherError('');
    });
  };

  // Apply voucher
  const handleApplyVoucher = () => {
    // Basic validation
    let hasError = false;
    if (!voucherNumber || !voucherNumber.trim()) {
      setVoucherNumberError(t('voucherNumberRequired') || 'กรุณากรอกหมายเลขบัตร');
      hasError = true;
    }
    if (!voucherPin || !voucherPin.trim()) {
      setVoucherPinError(t('voucherPinRequired') || 'กรุณากรอกหมายเลข PIN');
      hasError = true;
    }
    if (hasError) return;

    // Simulate validation (in production, call API)
    // For now, show success message
    Alert.alert(
      t('success') || 'สำเร็จ',
      t('voucherApplied') || 'ใช้บัตรของขวัญเรียบร้อยแล้ว',
      [{ text: t('ok') || 'ตกลง', onPress: closeVoucherModal }]
    );
  };

  // Detect card brand from card number (keeps parity with PaymentScreen)
  const detectCardBrand = (number) => {
    const cleaned = number.replace(/\s/g, '');
    if (/^4[0-9]{0,}$/.test(cleaned)) return "Visa";
    if (/^5[1-5]/.test(cleaned)) return "MasterCard";
    if (/^3[47]/.test(cleaned)) return "American Express";
    if (/^35(2[89]|[3-8][0-9])/.test(cleaned)) return "JCB";
    return "Unknown";
  };

  // Get detected brand for current card number
  const detectedBrand = useMemo(() => {
    if (cardNumber.length >= 4) {
      return detectCardBrand(cardNumber);
    }
    return null;
  }, [cardNumber]);

  const handleSelection = (opt) => {
    setSelectedOption(String(opt));
  };

  // Format card number with spaces every 4 digits
  const formatCardNumber = (text) => {
    const cleaned = text.replace(/\s/g, '');
    const chunks = cleaned.match(/.{1,4}/g);
    return chunks ? chunks.join(' ') : cleaned;
  };

  // Handle card number input with formatting
  const handleCardNumberChange = (text) => {
    const cleaned = text.replace(/\s/g, '');
    if (cleaned.length <= 16) {
      const formatted = formatCardNumber(cleaned);
      setCardNumber(formatted);
      // simple validation: require at least 12 digits to consider a plausible card number
      if (cleaned.length > 0 && cleaned.length < 12) {
        setCardNumberError(t('invalidCard') || 'กรุณากรอกหมายเลขบัตรให้ถูกต้อง');
      } else {
        setCardNumberError('');
      }
      // persist form fields so values remain when returning to the screen even if checkbox not checked
      persistFormFields(formatted, cardHolder, cardExpiry);
    }
  };

  // Format expiry date as MM/YY
  const formatExpiryDate = (text) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length === 0) return '';
    if (cleaned.length <= 2) return cleaned;
    return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
  };

  // Handle expiry date input with formatting
  const handleExpiryChange = (text) => {
    // Allow deletion by checking if text is shorter
    if (text.length < cardExpiry.length) {
      // If deleting the slash, delete the number before it too
      if (text.endsWith('/')) {
        const newVal = text.slice(0, -1);
        setCardExpiry(newVal);
        persistFormFields(cardNumber, cardHolder, newVal);
      } else {
        setCardExpiry(text);
        persistFormFields(cardNumber, cardHolder, text);
      }
      return;
    }
    
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length <= 4) {
      const formatted = formatExpiryDate(cleaned);
      setCardExpiry(formatted);
      persistFormFields(cardNumber, cardHolder, formatted);
    }
  };

  // Handle CVV input: numeric only, length depends on card brand (Amex = 4, others = 3)
  const handleCvvChange = (text) => {
    const cleaned = text.replace(/\D/g, '');
    const max = detectedBrand === 'American Express' ? 4 : 3;
    if (cleaned.length <= max) {
      setCardCvv(cleaned);
    } else {
      setCardCvv(cleaned.slice(0, max));
    }
  };

  // Toggle pickup (terms checkbox). When enabling, optionally save card info (masked) except CVV.
  const handleTogglePickup = () => {
    const newVal = !pickup;
    setPickup(newVal);

    // persist pickup state
    persistPickup(newVal);

    // Persist current form fields when checkbox is enabled
    if (newVal) {
      persistFormFields(cardNumber, cardHolder, cardExpiry);
    }

    // If user just enabled the checkbox and credit card flow is selected, save the card (masked) except CVV
    if (newVal && selectedOption === '7') {
      const cleaned = (cardNumber || '').replace(/\s/g, '');
      // require a reasonably-complete card number before saving (AMEX 15, others 16) - accept >=12 to be safe
      if (cleaned.length >= 12) {
        const last4 = cleaned.slice(-4);
        // check if same last4 + brand already exists (use last4 field, not masked string)
        const exists = savedCards.find(c => c.last4 === last4 && c.brand === detectedBrand);
        if (!exists) {
          const newCard = {
            id: `local-${Date.now()}`,
            // store masked and last4 separately so we never write masked value into the card input
            masked: '**** **** **** ' + last4,
            // store full card number (formatted) locally so we can prefill inputs next time (CVV not stored)
            cardNumber: formatCardNumber(cleaned),
            last4: last4,
            cardName: cardHolder || '',
            expiry: cardExpiry || '',
            brand: detectedBrand || 'Unknown'
          };
          const next = [...savedCards, newCard];
          setSavedCards(next);
          persistSavedCards(next);
          setSelectedCardId(newCard.id);
          persistSelectedCardId(newCard.id);
        } else {
          // select existing
          if (exists.id) {
            setSelectedCardId(exists.id);
            persistSelectedCardId(exists.id);
          }
        }
      }
    }
  };

  // Generate random digits for order ID
  const generateRandomDigits = (length) => {
    let result = '';
    for (let i = 0; i < length; i++) {
      result += Math.floor(Math.random() * 10);
    }
    return result;
  };

  // Get selected card details
  const getSelectedCard = () => {
    if (selectedCardId) {
      const found = savedCards.find(c => c.id === selectedCardId);
      if (found) return found;
    }
    // If no saved card selected, use manual input
    if (cardNumber && cardHolder && cardExpiry && cardCvv) {
      return {
        cardNumber: cardNumber.replace(/\s/g, ''),
        cardName: cardHolder,
        expiry: cardExpiry,
        cvv: cardCvv
      };
    }
    return null;
  };

  // Create tour booking
  const createTourBooking = async () => {
    try {
      // Split full name into first and last name
      const fullName = customerData?.fullName || '';
      const nameParts = fullName.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      console.log('👤 [createTourBooking] Customer Data:', {
        fullName: customerData?.fullName,
        prefix: customerData?.prefix,
        tel: customerData?.tel,
        md_tours_tel: customerData?.md_tours_tel,
        email: customerData?.email,
        country: customerData?.country,
        md_tours_country: customerData?.md_tours_country,
        countrycode: customerData?.countrycode,
        md_tours_countrycode: customerData?.md_tours_countrycode,
        memberid: customerData?.memberid,
        account_id: customerData?.account_id
      });

      console.log('🎫 [createTourBooking] Tour Data:', {
        md_tour_id: tour?.md_tour_id,
        tourId: tour?.tourId,
        tourid: tour?.tourid,
        TourID: tour?.TourID,
        name: tour?.name,
        title: tour?.title
      });

      console.log('👥 [createTourBooking] Passengers:', {
        adults,
        children,
        infants,
        date,
        total,
        selectedOption
      });

      const payload = {
        md_booking_prefix: customerData?.prefix || '',
        md_booking_fname: firstName,
        md_booking_lname: lastName,
        md_booking_tel: customerData?.tel || customerData?.md_tours_tel || '',
        md_booking_email: customerData?.email || '',
        md_booking_adult: Number(adults) || 0,
        md_booking_child: Number(children) || 0,
        md_booking_infant: Number(infants) || 0,
        md_booking_tourid: tour?.md_tour_id || tour?.tourId || tour?.tourid || tour?.TourID,
        md_booking_traveldate: date ? moment(date).format('YYYY-MM-DD') : '',
        md_booking_country: customerData?.country || customerData?.md_tours_country || '',
        md_booking_countrycode: customerData?.countrycode || customerData?.md_tours_countrycode || '',
        md_booking_paymenttype: Number(selectedOption) || 0,
        md_booking_dis: 0, // discount
        md_booking_vat: 0, // VAT
        md_booking_servicepickup: 0,
        account_id: customerData?.md_booking_memberid || 0,
        md_booking_affiliate: 0
      };

      console.log('📦 [createTourBooking] Final Payload:', JSON.stringify(payload, null, 2));

      const response = await axios.post(
        `${ipAddress}/addbookingtour`,
        payload,
        { headers: { 'Content-Type': 'application/json' }, timeout: 15000 }
      );

      const { status, message, md_booking_code, md_booking_price, md_booking_total } = response?.data || {};
      console.log('📋 Tour Booking API Response:', response.data);

      if (status === 'success' && md_booking_code) {
        updateCustomerData({
          tour_booking_code: md_booking_code,
          tour_booking_price: md_booking_price,
          tour_booking_total: md_booking_total
        });

        console.log('✅ Tour booking created successfully', { 
          bookingCode: md_booking_code,
          price: md_booking_price,
          total: md_booking_total
        });

        return {
          success: true,
          bookingCode: md_booking_code,
          message
        };
      }

      throw new Error(message || 'Failed to create tour booking');
    } catch (error) {
      const apiError = error?.response?.data || error?.message;
      console.error('❌ Error creating tour booking:', apiError);
      throw new Error(
        typeof apiError === 'string' ? apiError : (apiError?.message || 'Failed to create tour booking')
      );
    }
  };

  // Handle card payment
  const handleCardPayment = async () => {
    setIsLoading(true);
    
    const selectedCard = getSelectedCard();
    if (!selectedCard) {
      setIsLoading(false);
      Alert.alert(
        t('noCardSelected') || 'ไม่พบข้อมูลบัตร',
        t('pleaseSelectCard') || 'กรุณาเลือกบัตรหรือกรอกข้อมูลบัตร'
      );
      return;
    }

    console.log("Selected Card:", selectedCard);

    // Validate card data
    if (!selectedCard.cardName || !selectedCard.cardNumber || !selectedCard.expiry || !selectedCard.cvv) {
      setIsLoading(false);
      Alert.alert(
        t('incompleteCardInfo') || 'ข้อมูลบัตรไม่ครบ',
        t('pleaseFillAllFields') || 'กรุณากรอกข้อมูลบัตรให้ครบถ้วน'
      );
      return;
    }

    // Parse expiration date
    let expMonth, expYearRaw, expYear;
    if (selectedCard.expiry && selectedCard.expiry.includes("/")) {
      [expMonth, expYearRaw] = selectedCard.expiry.split("/");
      expMonth = expMonth.trim();
      expYearRaw = expYearRaw.trim();
      
      // Pad month to 2 digits
      if (/^\d{1}$/.test(expMonth)) {
        expMonth = "0" + expMonth;
      }
      
      // Year logic
      if (/^\d{4}$/.test(expYearRaw)) {
        expYear = expYearRaw;
      } else if (/^\d{2}$/.test(expYearRaw)) {
        expYear = "20" + expYearRaw;
      } else {
        expYear = null;
      }
    } else {
      expMonth = null;
      expYear = null;
    }

    if (!expMonth || !expYear || !/^\d{2}$/.test(expMonth) || !/^\d{4}$/.test(expYear)) {
      setIsLoading(false);
      Alert.alert(
        t('invalidExpiryDate') || 'วันหมดอายุไม่ถูกต้อง',
        t('checkExpiryFormat') || 'กรุณาตรวจสอบรูปแบบวันหมดอายุ (MM/YY)'
      );
      return;
    }

    const cardPayload = {
      name: selectedCard.cardName || selectedCard.name || '',
      number: selectedCard.cardNumber,
      expiration_month: expMonth,
      expiration_year: expYear,
      security_code: selectedCard.cvv,
    };

    console.log("Card payload for token:", cardPayload);

    try {
      // 1. Create payment token
      const tokenResponse = await fetch(`${ipAddress}/create-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ card: cardPayload }),
      });

      const tokenText = await tokenResponse.text();
      console.log("Token API raw response:", tokenText);
      
      let tokenData;
      try {
        tokenData = JSON.parse(tokenText);
      } catch (e) {
        throw new Error("Invalid JSON from token API");
      }

      if (!tokenResponse.ok) throw new Error("Failed to create payment token");
      if (!tokenData.success) throw new Error(tokenData.error || "Token API error");
      if (!tokenData.token) throw new Error("Payment token missing from token API response");

      // 2. Create tour booking before payment
      const bookingResult = await createTourBooking();
      if (!bookingResult || !bookingResult.success) {
        throw new Error("Failed to create tour booking before payment");
      }

      const bookingCode = bookingResult.bookingCode;
      const returnUri = bookingCode ? `${ipAddress}/redirect/${bookingCode}` : `${ipAddress}/redirect`;
      console.log('📤 returnUri:', returnUri, 'bookingCode:', bookingCode);

      // 3. Process payment
      const paymentResponse = await fetch(`${ipAddress}/charge`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" },
        body: JSON.stringify({
          amount: Number(total),
          token: tokenData.token,
          return_uri: returnUri,
          booking: bookingCode,
          randomorder: generateRandomDigits(16),
          currency: customerData?.currency || 'THB',
        }),
      });

      if (!paymentResponse.ok) throw new Error("Payment failed");
      
      const paymentResult = await paymentResponse.json();
      if (!paymentResult.success) throw new Error(paymentResult.message || "Payment declined");

      const chargeId = paymentResult.charge_id || paymentResult.chargeId || '';
      updateCustomerData({
        tour_payment_id: chargeId,
        tour_booking_code: bookingCode,
        bookingdate: moment().tz("Asia/Bangkok").format("YYYY-MM-DD"),
      });
      
      console.log('✅ Payment code:', chargeId);

      // 4. Open authorize URL if available
      if (paymentResult.authorize_uri) {
        console.log("🔗 Redirecting to:", paymentResult.authorize_uri);
        try {
          await Linking.openURL(paymentResult.authorize_uri);
        } catch (linkErr) {
          console.error('❌ Failed to open authorize URI:', linkErr);
          Alert.alert(
            t('warning') || 'แจ้งเตือน',
            t('cannotOpenLink') || 'ไม่สามารถเปิดลิงก์การชำระเงินได้'
          );
        }
      } else {
        // Payment successful without 3DS
        navigation.navigate('ResultScreen', { success: true, source: 'tour', bookingCode });
      }

      setIsLoading(false);
      console.log("✅ Payment processing completed");

    } catch (error) {
      console.error("❌ Payment Error:", error);
      setIsLoading(false);
      const msg = error?.message || String(error) || t('unknownError') || 'เกิดข้อผิดพลาด';
      Alert.alert(t('error') || "ข้อผิดพลาด", msg);
    }
  };

  const handlePay = () => {

    if (!selectedOption) {
      Alert.alert(t('paymentOption') || 'Payment Option', t('pleaseSelectPayment') || 'Please select a payment option.');
      return;
    }

    if (selectedOption === "7") {
      // Process card payment directly (handleCardPayment will validate)
      handleCardPayment();
    } else if (selectedOption === "2") {
      // PromptPay flow (placeholder)
      navigation.navigate('PromptPayScreen', { amount: total, source: 'tour' });
    } else {
      Alert.alert(t('paymentOption') || 'Payment Option', t('pleaseSelectPayment') || 'Please select a payment option.');
    }
  };

  

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={26} color="#111827" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.statusBadge}>
            <MaterialIcons name="verified" size={18} color="#10B981" />
            <Text style={styles.statusText}>{t('securePayment') || 'ระบบชำระเงินปลอดภัย'}</Text>
          </View>
          <Text style={[styles.timerText, timeLeft < 60 && styles.timerTextUrgent]}>
            {t('completeIn') || 'ชำระเงินให้เสร็จสิ้นภายใน'} {formatTime(timeLeft)}
          </Text>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={[styles.content, { paddingBottom: hp('15%') }]} 
        showsVerticalScrollIndicator={false}
      >
        {/* Total Amount Section */}
        <View style={styles.totalSection}>
          <Text style={styles.totalAmountLarge}>{currencySymbol} {formattedTotal}</Text>
          <Text style={styles.totalDescription}>
            {tour?.name || tour?.title || t('paymentBreakdown') || 'ทัวร์'}
          </Text>
          <TouchableOpacity onPress={openModal}>
            <Text style={styles.detailsLink}>{t('seeDetails') || 'รายละเอียด'} ›</Text>
          </TouchableOpacity>
        </View>

        {/* Payment Options */}
        <View style={styles.paymentOptionsContainer}>
          {/* QR PromptPay */}
          <TouchableOpacity 
            style={[styles.paymentCard, selectedOption === '2' && styles.paymentCardSelected]} 
            onPress={() => handleSelection('2')}
          >
            <View style={styles.paymentCardLeft}>
              <View style={styles.iconContainer}>
                <Image 
                  source={require('../../../assets/promptpay.png')} 
                  style={styles.paymentIcon}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.paymentTextContainer}>
                <Text style={styles.paymentMethodTitle}>QR PromptPay</Text>
                <Text style={styles.paymentMethodDesc}>{t('scanQRPayment') || 'สแกนเพื่อชำระเงินผ่านแอปโมบายคาส'}</Text>
              </View>
            </View>
            <View style={[styles.radioOuter, selectedOption === '2' && styles.radioOuterSelected]}>
              {selectedOption === '2' && <View style={styles.radioInner} />}
            </View>
          </TouchableOpacity>

          {/* Credit/Debit Card */}
          <View style={[styles.paymentCardColumn, selectedOption === '7' && styles.paymentCardSelected]}>
            <TouchableOpacity 
              style={styles.paymentCardHeader}
              onPress={() => handleSelection('7')}
            >
              <View style={styles.paymentCardLeft}>
                <View style={styles.iconContainer}>
                  <FontAwesome name="credit-card" size={24} color="#4169E1" />
                </View>
                <View style={styles.paymentTextContainer}>
                  <Text style={styles.paymentMethodTitle}>{t('creditDebitCard') || 'บัตรเครดิต/เดบิตไหม่'}</Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={styles.cardBrandIcons}>
                  <Image source={require('../../../assets/visa.png')} style={styles.miniCardIcon} />
                  <Image source={require('../../../assets/mastercard.png')} style={styles.miniCardIcon} />
                  <Image source={require('../../../assets/jcb.png')} style={styles.miniCardIcon} />
                  <Image source={require('../../../assets/amex.png')} style={styles.miniCardIcon} />
                </View>
                <View style={[styles.radioOuter, selectedOption === '7' && styles.radioOuterSelected]}>
                  {selectedOption === '7' && <View style={styles.radioInner} />}
                </View>
              </View>
            </TouchableOpacity>

            {/* Inline card entry form when Credit/Debit is selected */}
            {selectedOption === '7' && (
              <View style={styles.cardFormInline}>
                {savedCards.length > 0 && (
                  <View style={styles.savedCardsInline}>
                    {savedCards.map((card, idx) => (
                      <TouchableOpacity 
                        key={card && card.id ? String(card.id) : `saved-${idx}`} 
                        style={[styles.savedCardItem, selectedCardId === card.id && styles.savedCardSelected]} 
                        onPress={() => {
                          setSelectedCardId(card.id);
                          persistSelectedCardId(card.id);
                          // populate form fields from saved card when possible
                          populateFromCard(card);
                        }}
                      >
                        <View style={styles.savedCardIconWrap}>
                          <Image source={brandIcons[card.brand] || brandIcons.Unknown} style={styles.savedCardIcon} />
                        </View>
                        <View style={{ marginLeft: 12, flex: 1 }}>
                          <Text style={styles.savedCardNumber}>
                            {
                              // Prefer explicit masked if present, otherwise build masked from full cardNumber or last4
                              card.masked ? card.masked : (card.cardNumber ? ('**** **** **** ' + String(card.cardNumber).slice(-4)) : ('**** **** **** ' + (card.last4 || '')))
                            }
                          </Text>
                          <Text style={styles.savedCardMeta}>{card.cardName || card.cardName === '' ? card.cardName : ''}  |  {card.expiry}</Text>
                        </View>
                        <View style={[styles.radioOuter, selectedCardId === card.id && styles.radioOuterSelected]}>
                          {selectedCardId === card.id && <View style={styles.radioInner} />}
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {/* Card Number with icon (floating label) */}
                <View style={styles.inputWrapper}>
                  <View style={styles.inputWithIcon}>
                    {(cardNumberFocused || (cardNumber && cardNumber.length > 0)) && (
                      <View style={styles.floatingLabelContainer}>
                        <Text style={styles.floatingLabel}>{t('cardNumber') || 'หมายเลขบัตร'}</Text>
                      </View>
                    )}
                    <TextInput
                      value={cardNumber}
                      onChangeText={handleCardNumberChange}
                      placeholder={!cardNumberFocused && !(cardNumber && cardNumber.length > 0) ? (t('cardNumber') || 'หมายเลขบัตร') : ''}
                      keyboardType="numeric"
                      maxLength={19}
                      style={[
                        styles.input, 
                        styles.inputWithIconPadding, 
                        cardNumberError ? styles.inputError : null,
                        (cardNumberFocused || (cardNumber && cardNumber.length > 0)) && styles.inputWithLabel
                      ]}
                      placeholderTextColor="#9CA3AF"
                      onFocus={() => setCardNumberFocused(true)}
                      onBlur={() => setCardNumberFocused(false)}
                    />
                    <View style={styles.cardIconRight}>
                      {detectedBrand && detectedBrand !== "Unknown" ? (
                        <Image 
                          source={brandIcons[detectedBrand]} 
                          style={styles.detectedCardIcon}
                          resizeMode="contain"
                        />
                      ) : (
                        <MaterialIcons name="credit-card" size={24} color="#9CA3AF" />
                      )}
                    </View>
                  </View>
                  {cardNumberError ? <Text style={styles.inputErrorText}>{cardNumberError}</Text> : null}
                </View>

                <View style={styles.inputWrapper}>
                  {(cardHolderFocused || (cardHolder && cardHolder.length > 0)) && (
                    <View style={styles.floatingLabelContainer}>
                      <Text style={styles.floatingLabel}>{t('cardHolder') || 'ชื่อผู้ถือบัตร'}</Text>
                    </View>
                  )}
                  <TextInput
                    value={cardHolder}
                    onChangeText={text => {
                      setCardHolder(text);
                      // persist name so it remains when returning even without checking remember box
                      persistFormFields(cardNumber, text, cardExpiry);
                    }}
                    placeholder={!cardHolderFocused && !(cardHolder && cardHolder.length > 0) ? (t('cardHolder') || 'ชื่อผู้ถือบัตร') : ''}
                    style={[
                      styles.input,
                      (cardHolderFocused || (cardHolder && cardHolder.length > 0)) && styles.inputWithLabel
                    ]}
                    placeholderTextColor="#9CA3AF"
                    onFocus={() => setCardHolderFocused(true)}
                    onBlur={() => setCardHolderFocused(false)}
                  />
                </View>

                <View style={styles.inputRow}>
                  <View style={[styles.inputWrapperSmall, styles.inputHalfSmall]}>
                    {(cardExpiryFocused || (cardExpiry && cardExpiry.length > 0)) && (
                      <View style={styles.floatingLabelContainerSmall}>
                        <Text style={styles.floatingLabelSmall}>
                          วันหมดอายุ{'\n'}(ดด/ปป)
                        </Text>
                      </View>
                    )}
                    <TextInput
                      value={cardExpiry}
                      onChangeText={handleExpiryChange}
                      placeholder={!cardExpiryFocused && !(cardExpiry && cardExpiry.length > 0) ? (t('expiry') || 'MM/YY') : ''}
                      keyboardType="numeric"
                      maxLength={5}
                      style={[
                        styles.input,
                        (cardExpiryFocused || (cardExpiry && cardExpiry.length > 0)) && styles.inputWithLabel
                      ]}
                      placeholderTextColor="#9CA3AF"
                      onFocus={() => setCardExpiryFocused(true)}
                      onBlur={() => setCardExpiryFocused(false)}
                    />
                  </View>
                  <View style={[styles.inputWithIcon, styles.inputHalfSmall]}>
                      <View style={styles.inputWrapperSmall}>
                        {(cardCvvFocused || (cardCvv && cardCvv.length > 0)) && (
                          <View style={styles.floatingLabelContainerSmall}>
                            <Text style={styles.floatingLabelSmall}>{t('cvv') || 'CVV/CVC'}</Text>
                          </View>
                        )}
                        <TextInput
                          value={cardCvv}
                          onChangeText={handleCvvChange}
                          placeholder={!cardCvvFocused && !(cardCvv && cardCvv.length > 0) ? (t('cvv') || 'CVV/CVC') : ''}
                          keyboardType="numeric"
                          secureTextEntry={true}
                          maxLength={detectedBrand === 'American Express' ? 4 : 3}
                          style={[
                            styles.input, 
                            styles.inputCvv,
                            (cardCvvFocused || (cardCvv && cardCvv.length > 0)) && styles.inputWithLabel
                          ]}
                          placeholderTextColor="#9CA3AF"
                          onFocus={() => setCardCvvFocused(true)}
                          onBlur={() => setCardCvvFocused(false)}
                        />
                      </View>
                    <View style={styles.cvvIconRight}>
                      <MaterialIcons name="help-outline" size={20} color="#9CA3AF" />
                    </View>
                  </View>
                </View>

                {/* Terms and Conditions Checkbox */}
                <TouchableOpacity 
                  style={styles.termsContainer}
                  onPress={handleTogglePickup}
                  activeOpacity={0.7}
                >
                  <View style={[styles.checkbox, pickup && styles.checkboxChecked]}>
                    {pickup && <Ionicons name="checkmark" size={18} color="#fff" />}
                  </View>
                  <Text style={styles.termsText}>
                    {t('agreeToTerms') || 'ขอจำบัตรนี้เพื่อความสะดวกในการชำระเงินครั้งต่อไป'}
                  </Text>
                </TouchableOpacity>

                <Text style={styles.termsDetails}>
                  {t('termsDetails') || 'ข้อมูลบัตรของคุณจะได้รับการเข้ารหัสและจัดเก็บอย่างปลอดภัย คุณสามารถลบข้อมูลบัตรได้ตลอดเวลาโดยไปที่ "บัญชี" > "บัตรของฉัน"'}
                </Text>
              </View>
            )}
          </View>

          {/* Online Banking - Hidden */}
          {/* <TouchableOpacity 
            style={[styles.paymentCard]}
            onPress={() => handleSelection('3')}
          >
            <View style={styles.paymentCardLeft}>
              <View style={styles.iconContainer}>
                <MaterialIcons name="phone-iphone" size={24} color="#FF6B35" />
              </View>
              <View style={styles.paymentTextContainer}>
                <Text style={styles.paymentMethodTitle}>{t('onlineBanking') || 'ธนาคารออนไลน์'}</Text>
                <Text style={styles.paymentMethodDesc}>{t('bankTransfer') || 'ชำระเงินผ่านแอปโมบายคาส'}</Text>
              </View>
            </View>
            <View style={styles.bankIconsContainer}>
              <MaterialIcons name="account-balance" size={18} color="#10B981" />
              <MaterialIcons name="account-balance" size={18} color="#3B82F6" />
              <MaterialIcons name="account-balance" size={18} color="#8B5CF6" />
              <MaterialIcons name="account-balance" size={18} color="#F59E0B" />
              <MaterialIcons name="account-balance" size={18} color="#EF4444" />
            </View>
            <View style={[styles.radioOuter, selectedOption === '3' && styles.radioOuterSelected]}>
              {selectedOption === '3' && <View style={styles.radioInner} />}
            </View>
          </TouchableOpacity> */}

          {/* E-Wallet - Hidden */}
          {/* <TouchableOpacity 
            style={[styles.paymentCard]}
            onPress={() => handleSelection('4')}
          >
            <View style={styles.paymentCardLeft}>
              <View style={styles.iconContainer}>
                <MaterialIcons name="account-balance-wallet" size={24} color="#9333EA" />
              </View>
              <View style={styles.paymentTextContainer}>
                <Text style={styles.paymentMethodTitle}>{t('eWallet') || 'สแกนเพื่อชำระเงิน'}</Text>
                <Text style={styles.paymentMethodDesc}>{t('eWalletDesc') || 'ชำระเงินผ่านแอปโมบายคาส'}</Text>
              </View>
            </View>
            <View style={styles.bankIconsContainer}>
              <MaterialIcons name="check-circle" size={18} color="#10B981" />
              <MaterialIcons name="check-circle" size={18} color="#3B82F6" />
              <MaterialIcons name="check-circle" size={18} color="#8B5CF6" />
              <MaterialIcons name="check-circle" size={18} color="#F59E0B" />
              <MaterialIcons name="check-circle" size={18} color="#EF4444" />
            </View>
            <View style={[styles.radioOuter, selectedOption === '4' && styles.radioOuterSelected]}>
              {selectedOption === '4' && <View style={styles.radioInner} />}
            </View>
          </TouchableOpacity> */}

          {/* Gift Voucher */}
          <TouchableOpacity 
            style={[styles.paymentCard]} 
            onPress={openVoucherModal}
          >
            <View style={styles.paymentCardLeft}>
              <View style={styles.iconContainer}>
                <MaterialIcons name="card-giftcard" size={24} color="#9333EA" />
              </View>
              <View style={styles.paymentTextContainer}>
                <Text style={styles.paymentMethodTitle}>{t('giftVoucher') || 'บัตรของขวัญ'} ({t('optional') || 'หากมี'})</Text>
              </View>
            </View>
            <AntDesign name="right" size={18} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* Bottom Pay Button */}
      <View style={[
        styles.bottomPayContainer, 
        { 
          bottom: 0,
          paddingBottom: insets.bottom || hp('2%')
        }
      ]}>
        <TouchableOpacity 
          style={[styles.bottomPayButton, !selectedOption && styles.bottomPayButtonDisabled]} 
          onPress={handlePay} 
          activeOpacity={0.8}
          disabled={!selectedOption}
        >
          <Text style={styles.bottomPayButtonText}>{t('payNow') || 'ชำระตอนนี้'}</Text>
        </TouchableOpacity>
        
        <View style={styles.securityFooter}>
          <MaterialIcons name="verified" size={16} color="#10B981" />
          <Text style={styles.securityText}>{t('securePaymentSystem') || 'ระบบการชำระเงินปลอดภัย วางใจได้'}</Text>
          <Text style={styles.securitySeparator}>  |  </Text>
          <MaterialIcons name="check-circle" size={16} color={THEME_COLOR} />
          <Text style={styles.securityText}>{t('easyRefund') || 'เติมทางง่าย ไม่ต้องกังวล'}</Text>
        </View>
      </View>

      {/* Details Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="none"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <Animated.View style={[styles.modalBackground, { opacity: overlayOpacity }]} />
          <Animated.View style={[styles.modalContent, { transform: [{ translateY: modalTranslateY }] }]}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('bookingDetails') || 'รายละเอียดการจอง'}</Text>
              <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                <Ionicons name="close" size={28} color="#111827" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.modalScroll}>
              {/* Tour Info */}
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>
                  {tour?.name || tour?.title || t('tourPackage') }
                </Text>
              </View>

              {/* Contact Info */}
              <View style={styles.modalSection}>
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>{t('phoneNumber') || 'หมายเลขโทรศัพท์'}</Text>
                  <Text style={styles.modalValue}>{'+ ' + customerData?.countrycode + ' ' + (customerData?.md_tours_tel || '+66 0937094534')}</Text>
                </View>
              </View>

              <View style={styles.modalSection}>
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>{t('email') || 'อีเมล'}</Text>
                  <Text style={styles.modalValue}>{customerData?.email || 'chayanin0937@gmail.com'}</Text>
                </View>
              </View>

              {/* Price Breakdown */}
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>{t('priceBreakdown') || 'รายละเอียดราคา'}</Text>
                
                {(() => {
                  // Build price rows dynamically so we can avoid double separators
                  const rows = [];
                  if (adults > 0) rows.push({ key: 'adult', label: t('adult') || 'ผู้ใหญ่', count: adults, value: (unitPrice.adult * adults) });
                  if (children > 0) rows.push({ key: 'child', label: t('child') || 'เด็ก', count: children, value: (unitPrice.child * children) });
                  if (infants > 0) rows.push({ key: 'infant', label: t('infant') || 'ทารก', count: infants, value: (unitPrice.infant * infants) });

                  return rows.map((r, idx) => (
                    <View
                      key={r.key}
                      style={[
                        styles.priceRow,
                        // remove bottom border for adult and child rows, and also for the last price row
                        (r.key === 'adult' || r.key === 'child' || idx === rows.length - 1) ? { borderBottomWidth: 0 } : null
                      ]}
                    >
                      <Text style={styles.priceLabel}>{r.label} ×{r.count}</Text>
                      <Text style={styles.priceValue}>{currencySymbol} {Number(r.value).toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
                    </View>
                  ));
                })()}

                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>{t('totalAmount') || 'ยอดชำระทั้งหมด'}</Text>
                  <Text style={styles.totalValue}>{currencySymbol} {formattedTotal}</Text>
                </View>
              </View>
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>

      {/* Voucher Modal */}
      <Modal
        visible={voucherModalVisible}
        transparent={true}
        animationType="none"
        onRequestClose={closeVoucherModal}
      >
        <View style={styles.modalOverlay}>
          <Animated.View style={[styles.modalBackground, { opacity: voucherOverlayOpacity }]} />
          <Animated.View style={[styles.modalContent, { transform: [{ translateY: voucherModalTranslateY }] }]}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('giftVoucher') || 'บัตรของขวัญ'}</Text>
              <TouchableOpacity onPress={closeVoucherModal} style={styles.closeButton}>
                <Ionicons name="close" size={28} color="#111827" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.modalScroll}>
              <View style={styles.voucherModalContent}>
                <View style={styles.voucherIconContainer}>
                  <MaterialIcons name="card-giftcard" size={64} color="#9333EA" />
                </View>

                <Text style={styles.voucherDescription}>
                  {t('voucherDescription') || 'กรอกหมายเลขบัตรของขวัญและรหัส PIN เพื่อใช้ส่วนลด'}
                </Text>

                {voucherError ? (
                  <View style={styles.errorBanner}>
                    <MaterialIcons name="error-outline" size={20} color="#EF4444" />
                    <Text style={styles.errorText}>{voucherError}</Text>
                  </View>
                ) : null}

                <View style={styles.voucherInputSection}>
                  <Text style={styles.inputLabel}>{t('voucherNumber') || 'หมายเลขบัตรของขวัญ'}</Text>
                    <TextInput
                      value={voucherNumber}
                      onChangeText={(text) => {
                        setVoucherNumber(text);
                        setVoucherError('');
                        if (text && text.trim().length > 0) setVoucherNumberError('');
                      }}
                      placeholder={t('enterVoucherNumber') || 'กรอกหมายเลขบัตรของขวัญ'}
                      style={[styles.input, styles.voucherInput, voucherNumberError ? styles.inputError : null]}
                      placeholderTextColor="#9CA3AF"
                      keyboardType="default"
                    />
                    {voucherNumberError ? <Text style={styles.inputErrorText}>{voucherNumberError}</Text> : null}

                  <Text style={[styles.inputLabel, { marginTop: hp('2%') }]}>{t('voucherPin') || 'หมายเลข PIN'}</Text>
                  <TextInput
                    value={voucherPin}
                    onChangeText={(text) => {
                      const cleaned = text.replace(/\D/g, '');
                      if (cleaned.length <= 6) {
                        setVoucherPin(cleaned);
                        setVoucherError('');
                        if (cleaned.length > 0) setVoucherPinError('');
                      }
                    }}
                    placeholder={t('enterVoucherPin') || 'กรอกหมายเลข PIN'}
                    style={[styles.input, styles.voucherInput, voucherPinError ? styles.inputError : null]}
                    placeholderTextColor="#9CA3AF"
                    keyboardType="numeric"
                    secureTextEntry={true}
                    maxLength={6}
                  />
                  {voucherPinError ? <Text style={styles.inputErrorText}>{voucherPinError}</Text> : null}
                </View>

                <TouchableOpacity 
                  style={styles.applyVoucherButton}
                  onPress={handleApplyVoucher}
                  activeOpacity={0.8}
                >
                  <Text style={styles.applyVoucherButtonText}>{t('apply') || 'ใช้'}</Text>
                </TouchableOpacity>

                <Text style={styles.voucherNote}>
                  {t('voucherNote') || 'หมายเหตุ: บัตรของขวัญสามารถใช้ได้ครั้งเดียวเท่านั้น หากมีมูลค่าเหลือจะไม่สามารถขอคืนได้'}
                </Text>
              </View>
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>

      {/* Loading Overlay */}
      {isLoading && (
        <Modal transparent visible={isLoading} animationType="fade">
          <View style={styles.loadingOverlay}>
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FF6B35" />
              <Text style={styles.loadingText}>
                {t('processingPayment') || 'กำลังดำเนินการชำระเงิน...'}
              </Text>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('2%'),
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    position: 'relative'
  },
  backButton: {
    position: 'absolute',
    left: wp('4%'),
    top: hp('2%'),
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerCenter: {
    alignItems: 'center'
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp('0.5%')
  },
  statusText: {
    fontSize: wp('4%'),
    color: '#111827',
    marginLeft: 6,
    fontWeight: '600'
  },
  timerText: {
    fontSize: wp('3.5%'),
    color: '#6B7280'
  },
  timerTextUrgent: {
    color: '#EF4444',
    fontWeight: '700'
  },
  content: {
    padding: wp('4%'),
    paddingTop: hp('2%')
  },
  totalSection: {
    backgroundColor: '#fff',
    borderRadius: 0,
    padding: wp('5%'),

    alignItems: 'center'
  },
  totalAmountLarge: {
    fontSize: wp('10%'),
    fontWeight: '800',
    color: '#111827',
    marginBottom: hp('1%')
  },
  totalDescription: {
    fontSize: wp('3.5%'),
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: hp('0.5%'),
    paddingHorizontal: wp('2%')
  },
  detailsLink: {
    fontSize: wp('3.8%'),
    color: THEME_COLOR,
    fontWeight: '600'
  },
  paymentOptionsContainer: {
    marginBottom: hp('2%'),
    marginTop: hp('2%')
  },
  paymentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: wp('4%'),
    marginBottom: hp('1.5%'),
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  paymentCardColumn: {
    flexDirection: 'column',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: wp('4%'),
    marginBottom: hp('1.5%'),
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  paymentCardSelected: {
    borderColor: THEME_COLOR,
    borderWidth: 2
  },
  paymentCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%'
  },
  paymentCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  iconContainer: {
    width: wp('12%'),
    height: wp('12%'),
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: wp('3%')
  },
  paymentIcon: {
    width: wp('8%'),
    height: wp('8%')
  },
  paymentTextContainer: {
    flex: 1
  },
  paymentMethodTitle: {
    fontSize: wp('4%'),
    fontWeight: '700',
    color: '#111827',
    marginBottom: hp('0.3%')
  },
  paymentMethodDesc: {
    fontSize: wp('3.3%'),
    color: '#6B7280'
  },
  cardBrandIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 0,
    marginRight: 0,
    paddingRight: 0
  },
  miniCardIcon: {
    width: wp('8%'),
    height: wp('5%'),
    resizeMode: 'contain',
    marginRight: 0
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center'
    ,
    marginLeft: 0
  },
  radioOuterSelected: {
    borderColor: THEME_COLOR
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: THEME_COLOR
  },
  cardFormContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: wp('3%'),
    marginTop: hp('1%'),
    marginBottom: hp('1%'),
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  cardFormInline: {
    marginTop: hp('2%'),
    paddingTop: hp('2%'),
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB'
  },
  savedCardsInline: {
    marginBottom: hp('1%')
  },
  input: {
    height: hp('7%'),
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: wp('3%'),
    marginBottom: hp('1%'),
    backgroundColor: '#fff',
    fontSize: wp('4%'),
    color: '#111827'
  },
  inputError: {
    borderColor: '#EF4444'
  },
  inputErrorText: {
    color: '#EF4444',
    fontSize: wp('3.5%'),
    marginTop: hp('0.5%'),
    marginBottom: hp('1%')
  },
  inputWithIcon: {
    position: 'relative',
    marginBottom: hp('1%')
  },
  inputWithIconPadding: {
    paddingRight: wp('12%'),
    marginBottom: 0
  },
  inputCvv: {
    paddingRight: wp('12%'),
    marginBottom: 0
  },
  cardIconRight: {
    position: 'absolute',
    right: wp('3%'),
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: hp('1%')
  },
  cvvIconRight: {
    position: 'absolute',
    right: wp('3%'),
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: hp('1%')
  },
  detectedCardIcon: {
    width: wp('10%'),
    height: wp('6%')
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: hp('1.5%'),
    marginBottom: hp('0.5%')
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: wp('2%'),
    marginTop: 2
  },
  checkboxChecked: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35'
  },
  termsText: {
    flex: 1,
    fontSize: wp('3.5%'),
    color: '#111827',
    lineHeight: wp('5%')
  },
  termsDetails: {
    fontSize: wp('3%'),
    color: '#6B7280',
    lineHeight: wp('4.5%'),
    marginTop: hp('0.5%')
  },
  bankIconsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: wp('2%')
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  inputHalf: {
    flex: 1,
    marginRight: wp('2%'),
    marginBottom: 0
  },
  inputHalfSmall: {
    width: wp('40%')
  },
  savedCardsContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: wp('3%'),
    marginBottom: hp('1.5%'),
    marginTop: -hp('0.5%')
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
    borderColor: THEME_COLOR,
    borderWidth: 2
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
    backgroundColor: THEME_COLOR,
    paddingVertical: hp('2%'),
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: THEME_COLOR,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 6
  },
  bottomPayButtonDisabled: {
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0
  },
  bottomPayButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: wp('4.5%')
  },
  securityFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: hp('1.5%'),
    paddingBottom: hp('0.5%')
  },
  securityText: {
    fontSize: wp('3%'),
    color: '#6B7280',
    marginLeft: 4
  },
  securitySeparator: {
    fontSize: wp('3%'),
    color: '#D1D5DB'
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end'
  },
  modalBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000'
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: hp('2%'),
    maxHeight: hp('80%'),
    minHeight: hp('50%')
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: wp('5%'),
    paddingBottom: hp('2%'),
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    position: 'relative'
  },
  modalTitle: {
    fontSize: wp('4.5%'),
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center'
  },
  closeButton: {
    position: 'absolute',
    right: wp('5%'),
    top: 0,
    padding: 4
  },
  modalScroll: {
    paddingHorizontal: wp('5%'),
    paddingTop: hp('2%')
  },
  modalSection: {
    marginBottom: hp('3%')
  },
  modalSectionTitle: {
    fontSize: wp('4%'),
    fontWeight: '700',
    color: '#111827',
    marginBottom: hp('1.5%'),
    lineHeight: wp('5.5%')
  },
  modalRow: {
    marginBottom: hp('1%')
  },
  modalLabel: {
    fontSize: wp('3.5%'),
    color: '#6B7280',
    marginBottom: hp('0.5%'),
    fontWeight: '600'
  },
  modalValue: {
    fontSize: wp('3.8%'),
    color: '#111827'
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: hp('1%'),
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6'
  },
  priceLabel: {
    fontSize: wp('3.8%'),
    color: '#6B7280'
  },
  priceValue: {
    fontSize: wp('3.8%'),
    color: '#111827',
    fontWeight: '600'
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: hp('2%'),
    marginTop: hp('1%'),
    borderTopWidth: 2,
    borderTopColor: '#E5E7EB'
  },
  totalLabel: {
    fontSize: wp('4.5%'),
    color: '#111827',
    fontWeight: '700'
  },
  totalValue: {
    fontSize: wp('5%'),
    color: THEME_COLOR,
    fontWeight: '800'
  },
  // Voucher Modal Styles
  voucherModalContent: {
    paddingBottom: hp('3%')
  },
  voucherIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: hp('2%'),
    marginBottom: hp('2%')
  },
  voucherDescription: {
    fontSize: wp('3.8%'),
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: wp('5.5%'),
    marginBottom: hp('2%'),
    paddingHorizontal: wp('4%')
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    padding: wp('3%'),
    marginBottom: hp('2%')
  },
  errorText: {
    fontSize: wp('3.5%'),
    color: '#EF4444',
    marginLeft: 8,
    flex: 1
  },
  voucherInputSection: {
    marginTop: hp('1%'),
    marginBottom: hp('2%')
  },
  inputLabel: {
    fontSize: wp('3.8%'),
    color: '#111827',
    fontWeight: '600',
    marginBottom: hp('1%')
  },
  voucherInput: {
    marginBottom: 0
  },
  applyVoucherButton: {
    backgroundColor: '#9333EA',
    paddingVertical: hp('2%'),
    borderRadius: 12,
    alignItems: 'center',
    marginTop: hp('2%'),
    shadowColor: '#9333EA',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 6
  },
  applyVoucherButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: wp('4.5%')
  },
  voucherNote: {
    fontSize: wp('3%'),
    color: '#9CA3AF',
    lineHeight: wp('4.5%'),
    marginTop: hp('2%'),
    textAlign: 'center',
    fontStyle: 'italic'
  }
  ,
  // Floating label styles
  inputWrapper: {
    position: 'relative',
    marginBottom: hp('1%')
  },
  inputWrapperSmall: {
    position: 'relative',
    marginBottom: hp('1%')
  },
  floatingLabelContainer: {
    position: 'absolute',
    top: -hp('0.8%'),
    left: wp('3%'),
    zIndex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: wp('1%')
  },
  floatingLabelContainerSmall: {
    position: 'absolute',
    top: -hp('0.8%'),
    left: wp('3%'),
    zIndex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: wp('1%')
  },
  floatingLabel: {
    fontSize: wp('3.2%'),
    color: '#6B7280',
    fontWeight: '600'
  },
  floatingLabelSmall: {
    fontSize: wp('3%'),
    color: '#6B7280',
    fontWeight: '600',
    lineHeight: wp('3.8%')
  },
  inputWithLabel: {
    paddingTop: hp('2.8%')
  },
  // Loading overlay styles
  loadingOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: wp('8%'),
    alignItems: 'center',
    minWidth: wp('60%')
  },
  loadingText: {
    fontSize: wp('4%'),
    color: '#111827',
    marginTop: hp('2%'),
    fontWeight: '600',
    textAlign: 'center'
  }
});
