// PromptPayQR.js
import React, { useState } from "react";
import { View, Button, Image, ActivityIndicator } from "react-native";
import axios from "axios";
import ipAddress from './../ipconfig';

export default function PromptPayQR() {
  const [qrUrl, setQrUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  const createPromptPay = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${ipAddress}/create-charge`, {
        amount: 50, // amount in THB
      });

      setQrUrl(res.data.qrCode);
    } catch (error) {
      console.error("Error generating QR:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Button title="Generate PromptPay QR" onPress={createPromptPay} />
      {loading && <ActivityIndicator size="large" />}
      {qrUrl && (
        <Image
          source={{ uri: qrUrl }}
          style={{ width: 250, height: 250, marginTop: 20 }}
        />
      )}
    </View>
  );
}
