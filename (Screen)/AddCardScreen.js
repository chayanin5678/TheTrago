import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, ScrollView, SafeAreaView, StatusBar, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { AntDesign } from '@expo/vector-icons';
import LogoTheTrago from './../(component)/Logo';
import headStyles from './../(CSS)/StartingPointScreenStyles';

const AddCardScreen = ({ navigation, route }) => {
  const { onAddCard, nextCardId } = route.params || {};
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [name, setName] = useState('');

  const handleAddCard = () => {
    if (!cardNumber || !expiry || !cvv || !name) {
      Alert.alert('Please fill in all fields');
      return;
    }
    const newCard = {
      id: nextCardId,
      cardNumber,
      expiry,
      cvv,
      name,
    };
    if (onAddCard) {
      onAddCard(newCard);
    }
    navigation.goBack();
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {/* Ultra Gradient Background */}
      <LinearGradient
        colors={['#001233', '#002A5C', '#003A7C', '#FD501E']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1.5 }}
        style={{ flex: 1 }}
      >
        {/* Ultra Glass-Morphism Header */}
        <LinearGradient
          colors={["rgba(255,255,255,0.98)", "rgba(248,250,252,0.95)", "rgba(241,245,249,0.9)"]}
          style={[
            headStyles.headerBg,
            {
              width: '100%',
              marginLeft: '0%',
              marginTop: Platform.OS === 'ios' ? 0 : -20,
              borderBottomLeftRadius: 40,
              borderBottomRightRadius: 40,
              paddingBottom: 8,
              shadowColor: '#001233',
              shadowOpacity: 0.15,
              shadowRadius: 25,
              shadowOffset: { width: 0, height: 8 },
              elevation: 18,
              padding: 10,
              minHeight: hp('12%'),
              borderWidth: 1,
              borderColor: 'rgba(0, 18, 51, 0.08)',
              backdropFilter: 'blur(30px)',
            },
          ]}
        >
          <View
            style={[
              headStyles.headerRow,
              {
                alignItems: 'center',
                justifyContent: 'center',
                paddingHorizontal: 0,
                paddingTop: 0,
                position: 'relative',
                marginTop: Platform.OS === 'android' ? 70 : -10,
                height: 56,
              },
            ]}
          >
            {/* Back Button - Left */}
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{
                position: 'absolute',
                left: 16,
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderRadius: 25,
                padding: 8,
                zIndex: 2,
                shadowColor: '#FD501E',
                shadowOpacity: 0.2,
                shadowRadius: 12,
                shadowOffset: { width: 0, height: 4 },
                elevation: 8,
                borderWidth: 1,
                borderColor: 'rgba(253, 80, 30, 0.1)',
              }}
            >
              <AntDesign name="arrowleft" size={24} color="#FD501E" />
            </TouchableOpacity>

            {/* Logo - Center */}
            <View style={{ position: 'absolute', left: 0, right: 0, alignItems: 'center' }}>
              <LogoTheTrago />
            </View>
          </View>
        </LinearGradient>

        {/* Ultra Title Section with Glass Effect */}
        <View style={{ 
          flexDirection: 'row', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          marginTop: hp('1.5%'), 
          marginHorizontal: wp('5%'), 
          marginBottom: hp('2.5%'),
          paddingHorizontal: wp('4%'),
          paddingVertical: hp('2%'),
          backgroundColor: 'rgba(255,255,255,0.12)',
          borderRadius: wp('5%'),
          backdropFilter: 'blur(15px)',
          borderWidth: 1.5,
          borderColor: 'rgba(255,255,255,0.25)',
          shadowColor: '#000',
          shadowOpacity: 0.08,
          shadowRadius: wp('3%'),
          shadowOffset: { width: 0, height: hp('0.5%') },
          elevation: 6,
        }}>
          <View style={{ flex: 1 }}>
            <Text style={[
              headStyles.headerTitle, 
              { 
                color: '#FFFFFF', 
                fontSize: wp('7.5%'), 
                fontWeight: '900', 
                letterSpacing: -0.8, 
                textAlign: 'left', 
                marginLeft: 0,
                lineHeight: wp('8.5%'),
                textShadowColor: 'rgba(0,0,0,0.4)',
                textShadowRadius: 6,
                textShadowOffset: { width: 2, height: 2 },
              }
            ]}>
              Add New Card
            </Text>
            <Text style={{
              color: 'rgba(255,255,255,0.85)',
              fontSize: wp('3.8%'),
              fontWeight: '600',
              marginTop: hp('0.8%'),
              letterSpacing: 0.5,
              textShadowColor: 'rgba(0,0,0,0.3)',
              textShadowRadius: 3,
              textShadowOffset: { width: 1, height: 1 },
            }}>
              Secure your payment method
            </Text>
          </View>
        </View>

        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior="padding"
          keyboardVerticalOffset={60}
        >
          <ScrollView 
            contentContainerStyle={[styles.container, { paddingBottom: hp('15%') }]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentInsetAdjustmentBehavior="automatic"
            bounces={false}
          >
            {/* Ultra Card Container */}
            <View style={styles.cardContainer}>
              {/* Ultra 3D Card Visual */}
              <LinearGradient
                colors={['#001233', '#002A5C', '#003A7C', '#1E293B']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1.2 }}
                style={styles.cardVisual}
              >
                <LinearGradient
                  colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.08)', 'rgba(255,214,0,0.05)']}
                  style={styles.cardGlassOverlay}
                >
                  <View style={styles.chip} />
                  <View style={styles.cardNumberContainer}>
                    <Text style={styles.cardNumberText}>
                      {cardNumber ? cardNumber.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim() : '•••• •••• •••• ••••'}
                    </Text>
                  </View>
                  <View style={styles.cardRow}>
                    <Text style={styles.cardLabel}>Cardholder</Text>
                    <Text style={styles.cardLabel}>Valid Thru</Text>
                  </View>
                  <View style={styles.cardRow}>
                    <Text style={styles.cardValue}>{name || 'MEMBER'}</Text>
                    <Text style={styles.cardValue}>{expiry || 'MM/YY'}</Text>
                  </View>
                </LinearGradient>
              </LinearGradient>

              {/* Input Fields */}
              <View style={styles.inputSection}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Cardholder Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter cardholder name"
                    value={name}
                    onChangeText={setName}
                    placeholderTextColor="rgba(107, 114, 128, 0.6)"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Card Number</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="1234 5678 9012 3456"
                    keyboardType="numeric"
                    value={cardNumber}
                    onChangeText={text => {
                      let formatted = text.replace(/[^0-9]/g, '');
                      formatted = formatted.replace(/(.{4})/g, '$1 ').trim();
                      setCardNumber(formatted);
                    }}
                    maxLength={19}
                    placeholderTextColor="rgba(107, 114, 128, 0.6)"
                  />
                </View>

                <View style={styles.row}>
                  <View style={[styles.inputGroup, { flex: 1, marginRight: wp('2%') }]}>
                    <Text style={styles.inputLabel}>Expiry Date</Text>
                    <TextInput
                      style={[styles.input, styles.inputHalf]}
                      placeholder="MM/YY"
                      value={expiry}
                      onChangeText={text => {
                        let formatted = text.replace(/[^0-9]/g, '');
                        if (formatted.length > 2) {
                          formatted = formatted.slice(0,2) + '/' + formatted.slice(2,4);
                        }
                        setExpiry(formatted);
                      }}
                      maxLength={5}
                      placeholderTextColor="rgba(107, 114, 128, 0.6)"
                      keyboardType="numeric"
                      returnKeyType="done"
                      blurOnSubmit={true}
                    />
                  </View>
                  <View style={[styles.inputGroup, { flex: 1, marginLeft: wp('2%') }]}>
                    <Text style={styles.inputLabel}>CVV</Text>
                    <TextInput
                      style={[styles.input, styles.inputHalf]}
                      placeholder="123"
                      keyboardType="numeric"
                      value={cvv}
                      onChangeText={setCvv}
                      maxLength={4}
                      secureTextEntry
                      placeholderTextColor="rgba(107, 114, 128, 0.6)"
                      returnKeyType="done"
                      blurOnSubmit={true}
                    />
                  </View>
                </View>

                {/* Ultra Add Card Button */}
                <TouchableOpacity style={styles.addButton} onPress={handleAddCard} activeOpacity={0.85}>
                  <LinearGradient
                    colors={['#FD501E', '#FF6B35', '#FF8C66']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0.8 }}
                    style={styles.buttonGradient}
                  >
                    <Text style={styles.buttonText}>Add Card</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: wp('5%'),
    paddingTop: hp('2%'),
  },
  cardContainer: {
    backgroundColor: 'rgba(255,255,255,0.98)',
    borderRadius: wp('7%'),
    padding: wp('6%'),
    marginBottom: hp('2.5%'),
    shadowColor: '#001233',
    shadowOpacity: 0.25,
    shadowRadius: wp('8%'),
    shadowOffset: { width: 0, height: hp('1.5%') },
    elevation: 20,
    borderWidth: wp('0.3%'),
    borderColor: 'rgba(253, 80, 30, 0.12)',
    backdropFilter: 'blur(30px)',
  },
  cardVisual: {
    borderRadius: wp('5%'),
    marginBottom: hp('3.5%'),
    minHeight: hp('27%'),
    shadowColor: '#001233',
    shadowOpacity: 0.35,
    shadowRadius: wp('6%'),
    shadowOffset: { width: 0, height: hp('1.2%') },
    elevation: 16,
    overflow: 'hidden',
    borderWidth: wp('0.2%'),
    borderColor: 'rgba(255, 214, 0, 0.2)',
  },
  cardGlassOverlay: {
    flex: 1,
    padding: wp('6%'),
    justifyContent: 'space-between',
    borderRadius: wp('5%'),
  },
  chip: {
    width: wp('12%'),
    height: hp('4%'),
    borderRadius: wp('2.5%'),
    backgroundColor: 'rgba(255, 214, 0, 0.95)',
    marginBottom: hp('2.5%'),
    shadowColor: '#FFD600',
    shadowOpacity: 0.4,
    shadowRadius: wp('2%'),
    shadowOffset: { width: 0, height: hp('0.3%') },
    elevation: 8,
    borderWidth: wp('0.1%'),
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  cardNumberContainer: {
    marginBottom: hp('2.5%'),
    width: '100%',
  },
  cardNumberText: {
    color: '#FFFFFF',
    fontSize: wp('5.5%'),
    letterSpacing: wp('0.8%'),
    fontWeight: '800',
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowRadius: 4,
    textShadowOffset: { width: 2, height: 2 },
    flexWrap: 'wrap',
    lineHeight: wp('7%'),
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: hp('0.5%'),
  },
  cardLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: wp('3.2%'),
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowRadius: 2,
  },
  cardValue: {
    color: '#FFFFFF',
    fontSize: wp('4.2%'),
    fontWeight: '800',
    letterSpacing: 1,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowRadius: 2,
    textShadowOffset: { width: 1, height: 1 },
  },
  inputSection: {
    marginTop: hp('1.5%'),
  },
  inputGroup: {
    marginBottom: hp('2%'),
  },
  inputLabel: {
    fontSize: wp('3.8%'),
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: hp('0.8%'),
    marginLeft: wp('1.5%'),
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowRadius: 1,
  },
  input: {
    borderWidth: wp('0.3%'),
    borderColor: 'rgba(148, 163, 184, 0.25)',
    borderRadius: wp('3%'),
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('1.5%'),
    fontSize: wp('4%'),
    backgroundColor: 'rgba(255,255,255,0.95)',
    color: '#1E293B',
    fontWeight: '600',
    shadowColor: '#64748B',
    shadowOpacity: 0.12,
    shadowRadius: wp('3%'),
    shadowOffset: { width: 0, height: hp('0.5%') },
    elevation: 6,
    letterSpacing: 0.8,
    minHeight: hp('5.5%'),
  },
  inputHalf: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  addButton: {
    marginTop: hp('3%'),
    borderRadius: wp('4%'),
    shadowColor: '#FD501E',
    shadowOpacity: 0.5,
    shadowRadius: wp('4%'),
    shadowOffset: { width: 0, height: hp('0.8%') },
    elevation: 16,
    overflow: 'hidden',
  },
  buttonGradient: {
    paddingVertical: hp('1.8%'),
    paddingHorizontal: wp('8%'),
    borderRadius: wp('4%'),
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: hp('5.5%'),
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: wp('4.5%'),
    fontWeight: '900',
    letterSpacing: 1,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowRadius: 3,
    textShadowOffset: { width: 1, height: 2 },
    textTransform: 'uppercase',
  },
});

export default AddCardScreen;
