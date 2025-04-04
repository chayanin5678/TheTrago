import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, StyleSheet, Image } from "react-native";
import axios from "axios";
import ipAddress from "../ipconfig";
import { useCustomer } from './CustomerContext';
export default function PromptPayScreen({route}) {
  const { Paymenttotal } = route.params;
  const [qrUri, setQrUri] = useState(null);
  const [loading, setLoading] = useState(true);
    const { customerData, updateCustomerData } = useCustomer();
  useEffect(() => {
    const loadQR = async () => {
      try {
        const response = await axios.post(`${ipAddress}/create-promptpay`, {
          amount: parseFloat(Paymenttotal),
          currency: "thb",
          return_uri: `${ipAddress}/redirect`,
        });
        setQrUri(response.data.qr_code);
        console.log("✅ QR URI:", response.data.qr_code);
      } catch (error) {
        console.error("❌ โหลด QR ล้มเหลว:", error);
      } finally {
        setLoading(false);
      }
    };

    loadQR();
  }, []);

  return (
    <View style={styles.container}>
      {loading && <ActivityIndicator size="large" color="#000" />}
      {!loading && qrUri && (
        <Image
          source={{ uri: qrUri }}
          style={styles.qr}
          resizeMode="contain"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  qr: {
    width: '100%',
    height: '100%',
    marginTop: 20,
  },
});
