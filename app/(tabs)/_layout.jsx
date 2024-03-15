import { Tabs } from "expo-router";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Animated, View } from 'react-native';
import React, { useRef, useEffect } from 'react';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: "#6342E8",
        tabBarInactiveTintColor: "#808080",
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#fff',
          height: 60,
          paddingTop: 10,
          paddingBottom: 10,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          const scaleValue = useRef(new Animated.Value(1)).current;

          useEffect(() => {
            Animated.spring(scaleValue, {
              toValue: focused ? 1.25 : 1,
              friction: 3,
              useNativeDriver: true,
            }).start();
          }, [focused]);

          if (route.name === 'camera') {
            iconName = focused ? 'camera-iris' : 'camera';
          } else if (route.name === 'index') {
            iconName = focused ? 'home' : 'home-outline';
          }

          return (
            <View>
              <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
                <MaterialCommunityIcons name={iconName} size={size} color={color} />
              </Animated.View>
            </View>
          );
        },
      })}
    >
      <Tabs.Screen
        name="camera"
        options={{
          title: "Scan",
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
        }}
      />
    </Tabs>
  );
}
