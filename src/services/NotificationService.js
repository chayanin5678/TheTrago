import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

// กำหนดพฤติกรรมการแจ้งเตือนเมื่อ app เปิดอยู่
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class NotificationService {
  constructor() {
    this.expoPushToken = null;
    this.notificationListener = null;
    this.responseListener = null;
  }

  // ขอสิทธิ์และลงทะเบียน push notification token
  async registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FD501E',
      });

      // เพิ่ม channel สำหรับการอัปเดตการจอง
      await Notifications.setNotificationChannelAsync('booking-updates', {
        name: 'การอัปเดตการจอง',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FD501E',
        sound: 'default',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return null;
      }
      
      try {
        const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
        
        token = (await Notifications.getExpoPushTokenAsync({
          projectId,
        })).data;
        
        console.log('✅ Push Token:', token);
        
        // เก็บ token ใน AsyncStorage
        await AsyncStorage.setItem('expoPushToken', token);
        
      } catch (error) {
        console.error('❌ Error getting push token:', error);
        return null;
      }
    } else {
      console.log('Must use physical device for Push Notifications');
    }

    return token;
  }

  // บันทึก token ไปยัง backend
  async savePushTokenToBackend(token, userId) {
    try {
      const response = await fetch('https://thetrago.com/AppApi/save-push-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          push_token: token,
          platform: Platform.OS,
          device_type: Device.deviceName || 'Unknown',
        }),
      });

      const data = await response.json();
      
      if (data.status === 'success') {
        console.log('✅ Push token saved to backend');
        return true;
      } else {
        console.log('❌ Failed to save push token:', data.message);
        return false;
      }
    } catch (error) {
      console.error('❌ Error saving push token:', error);
      return false;
    }
  }

  // ตั้งค่า listener สำหรับรับ notification
  setupNotificationListeners(onNotificationReceived, onNotificationTapped) {
    // Listener สำหรับรับ notification ขณะที่ app เปิดอยู่
    this.notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('📩 Notification received:', notification);
      if (onNotificationReceived) {
        onNotificationReceived(notification);
      }
    });

    // Listener สำหรับการกด notification
    this.responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('👆 Notification tapped:', response);
      if (onNotificationTapped) {
        onNotificationTapped(response);
      }
    });
  }

  // ลบ listener เมื่อไม่ใช้งาน
  removeNotificationListeners() {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
    }
  }

  // ส่ง local notification (ทดสอบ)
  async scheduleLocalNotification(title, body, data = {}) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: title,
        body: body,
        data: data,
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: null, // ส่งทันที
    });
  }

  // ดึง notification ที่รอแสดง
  async getPendingNotifications() {
    const notifications = await Notifications.getAllScheduledNotificationsAsync();
    return notifications;
  }

  // ยกเลิก notification ทั้งหมด
  async cancelAllNotifications() {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  // ตรวจสอบและขอสิทธิ์ notification
  async checkPermissions() {
    const { status } = await Notifications.getPermissionsAsync();
    return status === 'granted';
  }

  // ดึง push token ที่เก็บไว้
  async getSavedPushToken() {
    try {
      const token = await AsyncStorage.getItem('expoPushToken');
      return token;
    } catch (error) {
      console.error('Error getting saved push token:', error);
      return null;
    }
  }

  // เคลียร์ badge count
  async clearBadgeCount() {
    await Notifications.setBadgeCountAsync(0);
  }

  // ตั้งค่า badge count
  async setBadgeCount(count) {
    await Notifications.setBadgeCountAsync(count);
  }
}

export default new NotificationService();
