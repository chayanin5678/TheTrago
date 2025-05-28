// AnimatedTabIcon.js
import React, { useRef, useEffect } from 'react';
import { Animated, Text } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

export default function AnimatedTabIcon({ iconName, label, focused, size, color }) {
  const scaleAnim = useRef(new Animated.Value(focused ? 1.2 : 1)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: focused ? 1.2 : 1,
      useNativeDriver: true,
    }).start();
  }, [focused]);

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }], alignItems: 'center' }}>
      <Icon name={iconName} size={size} color={color} />
      <Text style={{ fontSize: 12, color }}>{label}</Text>
    </Animated.View>
  );
}
