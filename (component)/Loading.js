import { StyleSheet, Text, View, ActivityIndicator } from 'react-native'
import React from 'react'

export default function Loading({}) {
    
  return (
            <View>
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FD501E" />
            </View>
            </View>
  )
}

const styles = StyleSheet.create({
    loadingContainer: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)", // พื้นหลังโปร่งใส
        zIndex: 9999, // ✅ ให้ ActivityIndicator อยู่ด้านบนสุด
      },
})