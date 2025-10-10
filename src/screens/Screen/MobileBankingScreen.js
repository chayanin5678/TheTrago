import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, TouchableOpacity, Linking, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { AntDesign } from '@expo/vector-icons';
import { useCustomer } from './CustomerContext';
import { useLanguage } from './LanguageContext';

const MobileBankingScreen = ({ navigation, route }) => {
  const { t } = useLanguage();
  const { customerData } = useCustomer();
  const insets = useSafeAreaInsets();
  
  const {
    authorizeUri,
    chargeId,
    Paymenttotal,
    selectedBank,
    selectedOption,
    usePoints,
    pointsToUse,
    pointsToEarn,
  } = route.params;

  const [isLoading, setIsLoading] = useState(true);
  const [currentUrl, setCurrentUrl] = useState('');
  const webViewRef = useRef(null);

  useEffect(() => {
    console.log('📱 MobileBanking Screen loaded');
    console.log('🔗 Authorize URI:', authorizeUri);
    console.log('💳 Charge ID:', chargeId);
  }, []);

  // Handle deep link callback
  useEffect(() => {
    const handleDeepLink = async ({ url }) => {
      console.log('🔗 Deep link received:', url);
      
      if (url && url.includes('thetrago://payment-result')) {
        const urlParams = new URLSearchParams(url.split('?')[1]);
        const status = urlParams.get('status');
        const chargeIdFromUrl = urlParams.get('charge_id');

        console.log('📊 Payment status:', status);
        console.log('💳 Charge ID from URL:', chargeIdFromUrl);

        if (status === 'successful' || status === 'pending') {
          // Success - navigate to result
          navigation.replace('ResultScreen', {
            paymentStatus: 'success',
            chargeId: chargeIdFromUrl || chargeId,
            usePoints,
            pointsToUse,
            pointsToEarn,
          });
        } else {
          // Failed
          Alert.alert(
            t('paymentFailed') || 'Payment Failed',
            t('paymentWasNotSuccessful') || 'Your payment was not successful. Please try again.',
            [
              {
                text: t('ok') || 'OK',
                onPress: () => navigation.goBack(),
              },
            ]
          );
        }
      }
    };

    const subscription = Linking.addEventListener('url', handleDeepLink);

    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink({ url });
      }
    });

    return () => {
      subscription.remove();
    };
  }, [navigation, chargeId, usePoints, pointsToUse, pointsToEarn, t]);

  const handleNavigationStateChange = (navState) => {
    setCurrentUrl(navState.url);
    console.log('🌐 WebView URL changed:', navState.url);

    // Check if redirected back to our return URI
    if (navState.url.includes('thetrago://payment-result')) {
      const urlParams = new URLSearchParams(navState.url.split('?')[1]);
      const status = urlParams.get('status');
      
      if (status === 'successful' || status === 'pending') {
        navigation.replace('ResultScreen', {
          paymentStatus: 'success',
          chargeId,
          usePoints,
          pointsToUse,
          pointsToEarn,
        });
      } else {
        Alert.alert(
          t('paymentFailed') || 'Payment Failed',
          t('paymentWasNotSuccessful') || 'Your payment was not successful.',
          [
            {
              text: t('ok') || 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      }
    }
  };

  const handleError = (syntheticEvent) => {
    const { nativeEvent } = syntheticEvent;
    console.error('❌ WebView error:', nativeEvent);
    Alert.alert(
      t('error') || 'Error',
      t('failedToLoadPaymentPage') || 'Failed to load payment page. Please try again.',
      [
        {
          text: t('retry') || 'Retry',
          onPress: () => webViewRef.current?.reload(),
        },
        {
          text: t('cancel') || 'Cancel',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#002A5C' }}>
      <LinearGradient
        colors={['#002A5C', '#2563EB']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1.2 }}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
          <TouchableOpacity
            onPress={() => {
              Alert.alert(
                t('cancelPayment') || 'Cancel Payment',
                t('areYouSureCancelPayment') || 'Are you sure you want to cancel this payment?',
                [
                  { text: t('no') || 'No', style: 'cancel' },
                  { text: t('yes') || 'Yes', onPress: () => navigation.goBack() },
                ]
              );
            }}
            style={styles.backButton}
          >
            <AntDesign name="close" size={24} color="#FD501E" />
          </TouchableOpacity>
          
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>
              {t('mobileBanking') || 'Mobile Banking'}
            </Text>
            <Text style={styles.headerSubtitle}>
              {t('completePayment') || 'Complete your payment'}
            </Text>
          </View>
        </View>

        {/* Loading Indicator */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FD501E" />
            <Text style={styles.loadingText}>
              {t('loadingPaymentPage') || 'Loading payment page...'}
            </Text>
          </View>
        )}

        {/* WebView */}
        <WebView
          ref={webViewRef}
          source={{ uri: authorizeUri }}
          onLoadStart={() => setIsLoading(true)}
          onLoadEnd={() => setIsLoading(false)}
          onNavigationStateChange={handleNavigationStateChange}
          onError={handleError}
          startInLoadingState={true}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          sharedCookiesEnabled={true}
          thirdPartyCookiesEnabled={true}
          style={{ flex: 1, backgroundColor: 'transparent' }}
        />

        {/* Debug Info (Remove in production) */}
        {__DEV__ && (
          <View style={styles.debugInfo}>
            <Text style={styles.debugText}>Charge ID: {chargeId}</Text>
            <Text style={styles.debugText}>Bank: {selectedBank}</Text>
            <Text style={styles.debugText} numberOfLines={1}>URL: {currentUrl}</Text>
          </View>
        )}
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp('5%'),
    paddingBottom: hp('2%'),
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  backButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 25,
    padding: 10,
    shadowColor: '#FD501E',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    borderWidth: 1,
    borderColor: 'rgba(253, 80, 30, 0.1)',
  },
  headerTextContainer: {
    flex: 1,
    marginLeft: wp('4%'),
  },
  headerTitle: {
    fontSize: wp('5%'),
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: wp('3.5%'),
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: hp('0.5%'),
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 42, 92, 0.9)',
    zIndex: 999,
  },
  loadingText: {
    marginTop: hp('2%'),
    fontSize: wp('4%'),
    color: '#FFFFFF',
    fontWeight: '600',
  },
  debugInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 10,
  },
  debugText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
});

export default MobileBankingScreen;
