import {
  deleteDatabase,
  getLevel,
  getNbrOfScans,
  getStreak,
} from "@/lib/gamification/dbUtils";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  ImageBackground,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { PageIndicator } from "react-native-page-indicator";
import PagerView from "react-native-pager-view";
import { Bar } from "react-native-progress";
import LineGraph from "../(components)/LineGraph";
import PieGraph from "../(components)/PieGraph";
import SupportBanner from "../(components)/SupportBanner";
import best_buy from "../../assets/coupons/BEST_BUY.png";
import best_buy_locked from "../../assets/coupons/BEST_BUY_LOCKED.png";
import kfc from "../../assets/coupons/KFC.png";
import kfc_locked from "../../assets/coupons/KFC_LOCKED.png";
import pizza_hut from "../../assets/coupons/PIZZA_HUT.png";
import pizza_hut_locked from "../../assets/coupons/PIZZA_HUT_LOCKED.png";
import starbucks from "../../assets/coupons/STARBUCKS.png";
import starbucks_locked from "../../assets/coupons/STARBUCKS_LOCKED.png";
import walmart from "../../assets/coupons/WALMART.png";
import walmart_locked from "../../assets/coupons/WALMART_LOCKED.png";
import icon from "../../assets/favicon.png";

import { PageIndicator } from "react-native-page-indicator";
import {
  deleteDatabase,
  getLevel,
  getNbrOfScans,
  getStreak,
} from "@/lib/gamification/dbUtils";
import { useEffect, useState } from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Tab() {
  const [title, setTitle] = useState("Eco Warrior");
  const [streak, setStreak] = useState(2);
  const [nbrOfScans, setNbrOfScans] = useState(2);
  const [nextLevelScans, setNextLevelScans] = useState(5);
  const [nextTitle, setNextTitle] = useState("Eco Warrior II");
  const [currentPic, setCurrentPic] = useState(0);
  const [profielPic, setProfilePic] = useState(null);

  // using Fibonacci sequence to determine the #scans needed to reach the next level
  const couponsByStreak = {
    0: [kfc_locked, best_buy_locked, walmart_locked, starbucks_locked, pizza_hut_locked],
    1: [kfc,best_buy_locked, walmart_locked, starbucks_locked, pizza_hut_locked],
    2: [kfc, best_buy, walmart_locked, starbucks_locked, pizza_hut_locked],
    3: [kfc, best_buy, walmart, starbucks_locked, pizza_hut_locked],
    5: [kfc, best_buy, walmart, starbucks, pizza_hut_locked],
    8: [kfc, best_buy, walmart, starbucks, pizza_hut],
  };
  const [couponMap, setCouponMap] = useState(couponsByStreak[streak]);

  useEffect(() => {
    let maxKey = 0;
    for (const key in couponsByStreak) {
      if (parseInt(key) <= streak) {
        maxKey = Math.max(maxKey, parseInt(key));
      }
    }
    setCouponMap(couponsByStreak[maxKey]);
  }, [streak]);

  const onPressDelete = () => {
    Alert.alert(
      "Delete DB",
      "Are you sure you want to delete the database?",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel",
        },
        {
          text: "OK",
          onPress: () => deleteDatabase(),
        },
      ],
      { cancelable: false }
    );
  };

  const getStreakText = () => {
    switch (streak) {
      case 0:
        return "0";
      case 1:
        return "1 Day";
      default:
        return `${streak} Days 🔥`;
    }
  };

  const getScansToNextLevelText = () => {
    const left = nextLevelScans - nbrOfScans;
    if (left === 1) {
      return "1 scan to ";
    }
    return `${left} scans to `;
  };

  const handleImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      aspect: [16, 9],
      quality: 1,
    });
    if (!result.canceled) {
      setProfilePic(result.assets[0].uri);
      await AsyncStorage.setItem("profilePic", result.assets[0].uri);
    }
  };

  useEffect(() => {
    getNbrOfScans().then((nbrOfScans) => {
      setNbrOfScans(nbrOfScans);
    });

    getLevel().then((level) => {
      setTitle(level.currentTitle);
      setNextTitle(level.nextTitle);
      setNextLevelScans(level.nextPoints);
    });

    getStreak().then((streak) => {
      setStreak(streak);
    });

    const getPic = async () => {
      const uri = await AsyncStorage.getItem("profilePic");
      if (uri !== null) {
        setProfilePic(uri);
      }
    };

    getPic();
  }, []);

  return (
    <SafeAreaView className="bg-background">
      <ScrollView>
        <View className="flex-col w-screen mx-5 space-y-3.5 my-5">
          <View className="flex flex-row w-[90%] justify-between">
            <View className="flex-col justify-center space-y-2.5 mb-2">
              <Text className="text-2xl">Hello 👋</Text>
              <Text className="text-3xl font-bold">{title}</Text>
              <Text className="text-sm">Streak: {getStreakText()}</Text>
            </View>
            <TouchableOpacity
              className="w-[50px] h-[50px] flex justify-center items-center"
              onPress={handleImage}>
              <Image
                source={profielPic ? { uri: profielPic } : icon}
                className="w-[100%] h-[100%] rounded-full"
              />
            </TouchableOpacity>
          </View>
          <View className="flex flex-col w-screen gap-1">
            <Text className="text-progress">{nbrOfScans} total scans</Text>
            <Bar
              progress={nbrOfScans / nextLevelScans}
              width={Dimensions.get("screen").width * 0.9}
              color="#6342E8"
            />
            <View className="flex flex-row w-[90%] justify-between mb-2">
              <Text className="text-progress"></Text>
              <Text>
                {getScansToNextLevelText()}
                <Text className="text-progress">{nextTitle}</Text>
              </Text>
            </View>
          </View>
          <View className="flex flex-row w-[90%] align-center justify-between">
            <Text className="font-semibold text-base">Coupons</Text>
            <View className="flex flex-row gap-3">
              <FontAwesome name="angle-left" size={24} color="black" />
              <FontAwesome name="angle-right" size={24} color="black" />
            </View>
            {/* {
              streak > 1 && (
                <View className="flex flex-row gap-3">
                  <FontAwesome name="angle-left" size={24} color="black" />
                  <FontAwesome name="angle-right" size={24} color="black" />
                </View>
              )
            } */}
          </View>
          <View className="flex w-[90%] h-[120px] shadow-3xl">
            <PagerView
              className="flex-1"
              initialPage={0}
              onPageSelected={(e) => setCurrentPic(e.nativeEvent.position)}>
              {couponMap?.map((coupon, index) => (
                <Image
                  source={coupon}
                  resizeMode="contain" // Adjust the resizeMode here
                  // style={{
                  //   ...index === 0 ? { opacity: 0.5 } : {}, // Dim out the image at index 1
                  // }}
                  className="justify-center items-center rounded-xl w-full h-full"
                  key={index}
                />
              ))}
            </PagerView>
          </View>
          <View className="flex w-[90%]">
            <PageIndicator
              className="mr-"
              count={couponMap.length}
              current={currentPic}
              variant="beads"
            />
          </View>
          <View className="flex-col w-screen space-y-1.25">
            <LineGraph />
          </View>
          <View className="flex-col w-screen space-y-1.25">
            <PieGraph />
          </View>
          <View className="flex-col w-screen space-y-1.25">
            <SupportBanner />
          </View>
          <View className="flex-col w-[50vw]">
            <Pressable
              className="bg-red-500 h-12 rounded-lg justify-center items-center"
              onPress={onPressDelete}>
              <Text className="text-white font-bold text-2xl">DELETE DB</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
