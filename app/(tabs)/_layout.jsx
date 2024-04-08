import { PRIMARY } from "@/lib/constants";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useEffect, useRef } from "react";
import { Animated, View } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: PRIMARY,
        tabBarInactiveTintColor: "#808080",
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#fff",
          height: 65,
          paddingTop: 10,
          paddingBottom: 10,
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 12,
          },
          shadowOpacity: 0.9,
          shadowRadius: 5.0,
          elevation: 8,
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

          if (route.name === "index") {
            iconName = focused ? "camera" : "camera-outline";
          } else if (route.name === "home") {
            iconName = focused ? "home" : "home-outline";
          }

          return (
            <View>
              <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
                <MaterialCommunityIcons
                  // @ts-ignores
                  name={iconName}
                  size={size}
                  color={color}
                />
              </Animated.View>
            </View>
          );
        },
      })}>
      <Tabs.Screen
        name="index"
        options={{
          title: "Scan",
        }}
      />
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
        }}
      />
    </Tabs>
  );
}
