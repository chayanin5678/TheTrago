import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const BottomBar = () => {
  return (
    <View style={styles.container}>
      {/* หน้าแรก */}
      <TouchableOpacity style={styles.tab}>
        <Ionicons name="home" size={24} color="#FD501E" />
        <Text style={styles.label}>หน้าแรก</Text>
      </TouchableOpacity>

      {/* ข้อความ */}
      <TouchableOpacity style={styles.tab}>
        <Ionicons name="chatbox-ellipses" size={24} color="#888" />
        <Text style={styles.label}>ข้อความ</Text>
      </TouchableOpacity>

      {/* โพสต์ */}
      <TouchableOpacity style={styles.postButton}>
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>

      {/* ทริป */}
      <TouchableOpacity style={styles.tab}>
        <MaterialCommunityIcons name="clipboard-text-outline" size={24} color="#888" />
        <Text style={styles.label}>ทริป</Text>
      </TouchableOpacity>

      {/* เข้าสู่ระบบ */}
      <TouchableOpacity style={styles.tab}>
        <Ionicons name="person-outline" size={24} color="#888" />
        <Text style={styles.label}>เข้าสู่ระบบ</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 70,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: '#ddd',
    paddingBottom: 10,
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 12,
    color: '#333',
    marginTop: 4,
  },
  postButton: {
    width: 60,
    height: 60,
    backgroundColor: '#FD501E',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
});

export default BottomBar;
