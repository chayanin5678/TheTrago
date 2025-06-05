import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';

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
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View style={styles.container}>
          <Text style={styles.title}>Add New Card</Text>
          <View style={styles.cardBox}>
            {/* Card visual */}
            <View style={styles.cardVisual}>
              <View style={styles.chip} />
              <Text style={styles.cardNumberText}>
                {cardNumber ? cardNumber.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim() : '•••• •••• •••• ••••'}
              </Text>
              <View style={styles.cardRow}>
                <Text style={styles.cardLabel}>Name</Text>
                <Text style={styles.cardLabel}>Expiry</Text>
              </View>
              <View style={styles.cardRow}>
                <Text style={styles.cardValue}>{name || 'CARDHOLDER'}</Text>
                <Text style={styles.cardValue}>{expiry || 'MM/YY'}</Text>
              </View>
            </View>
            {/* Input fields */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Cardholder Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Cardholder Name"
                value={name}
                onChangeText={setName}
                placeholderTextColor="#aaa"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Card Number</Text>
              <TextInput
                style={styles.input}
                placeholder="Card Number"
                keyboardType="numeric"
                value={cardNumber}
                onChangeText={text => {
                  // Auto-insert space every 4 digits
                  let formatted = text.replace(/[^0-9]/g, '');
                  formatted = formatted.replace(/(.{4})/g, '$1 ').trim();
                  setCardNumber(formatted);
                }}
                maxLength={19}
                placeholderTextColor="#aaa"
              />
            </View>
            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 4 }]}>
                <Text style={styles.inputLabel}>Expiry</Text>
                <TextInput
                  style={[styles.input, styles.inputHalf]}
                  placeholder="MM/YY"
                  value={expiry}
                  onChangeText={text => {
                    // Auto-insert slash after MM
                    let formatted = text.replace(/[^0-9]/g, '');
                    if (formatted.length > 2) {
                      formatted = formatted.slice(0,2) + '/' + formatted.slice(2,4);
                    }
                    setExpiry(formatted);
                  }}
                  maxLength={5}
                  placeholderTextColor="#aaa"
                  keyboardType="numeric"
                  returnKeyType="done"
                  blurOnSubmit={true}
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 4 }]}>
                <Text style={styles.inputLabel}>CVV</Text>
                <TextInput
                  style={[styles.input, styles.inputHalf]}
                  placeholder="CVV"
                  keyboardType="numeric"
                  value={cvv}
                  onChangeText={setCvv}
                  maxLength={4}
                  secureTextEntry
                  placeholderTextColor="#aaa"
                  returnKeyType="done"
                  blurOnSubmit={true}
                />
              </View>
            </View>
            <TouchableOpacity style={styles.button} onPress={handleAddCard}>
              <Text style={styles.buttonText}>Add Card</Text>
            </TouchableOpacity>
            <View style={styles.spacer} />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#f7f7fa',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 32,
    textAlign: 'center',
    color: '#002348',
    letterSpacing: 1,
  },
  cardBox: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
    marginBottom: 18,
  },
  cardVisual: {
    backgroundColor: '#002348',
    borderRadius: 16,
    padding: 20,
    marginBottom: 28,
    minHeight: 120,
    justifyContent: 'center',
    shadowColor: '#002348',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  chip: {
    width: 38,
    height: 26,
    borderRadius: 6,
    backgroundColor: '#e0c36e',
    marginBottom: 12,
  },
  cardNumberText: {
    color: '#fff',
    fontSize: 20,
    letterSpacing: 2,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  cardLabel: {
    color: '#b0b8c1',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  cardValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    padding: 14,
    marginBottom: 18,
    fontSize: 17,
    backgroundColor: '#f9f9fb',
    color: '#222',
  },
  inputGroup: {
    marginBottom: 10,
  },
  inputLabel: {
    fontSize: 14,
    color: '#555',
    marginBottom: 6,
    marginLeft: 2,
    fontWeight: '500',
  },
  inputHalf: {
    flex: 1,
    marginBottom: 0,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  button: {
    backgroundColor: '#FD501E',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#FD501E',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  buttonText: {
    color: '#fff',
    fontSize: 19,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  spacer: {
    height: 40,
  },
});

export default AddCardScreen;
