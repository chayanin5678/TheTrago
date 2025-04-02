import React, { useEffect, useState } from 'react';
import { View, Image, Text, ActivityIndicator, Alert } from 'react-native';
import axios from 'axios';

export default function PromptPayQRScreen({ navigation }) {
  const [qrUrl, setQrUrl] = useState(null);
  const [chargeId, setChargeId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. สร้าง QR จาก Omise
    axios.post('https://thetrago.com/AppApi/create-promptpay-qr', {
      amount: 50,
      return_uri: 'https://thetrago.com/AppApi/redirect', // ใส่ไว้เผื่อใช้
    }).then(res => {
      setQrUrl(res.data.qrCodeUrl);
      setChargeId(res.data.charge_id);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      Alert.alert("Error", "Failed to create QR");
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!chargeId) return;

    const interval = setInterval(async () => {
      try {
        const res = await axios.get(`https://api.omise.co/charges/${chargeId}`, {
          auth: {
            username: 'skey_60x138uosi617jur3wb', // 👈 ใส่ Secret Key ของ Omise
            password: '',
          },
        });

        if (res.data.status === 'successful') {
          clearInterval(interval);
          Alert.alert("✅ Payment Successful", "Thank you for your payment!");
          navigation.navigate("ResultScreen", { success: true });
        }
      } catch (error) {
        console.error("Error checking status:", error);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [chargeId]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <>
          <Text style={{ fontSize: 18, marginBottom: 10 }}>Scan QR with PromptPay</Text>
          <Image
            source={{ uri: qrUrl }}
            style={{ width: 250, height: 250 }}
            resizeMode="contain"
          />
        </>
      )}
    </View>
  );
}
