import { LineData } from "@/assets/data/info";
import { PRIMARY } from "@/lib/constants";
import {
  deleteDatabase,
  getLevel,
  getNbrOfScans,
  getPieData,
  getScansPerDate,
  getStreak,
} from "@/lib/gamification/dbUtils";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { usePathname } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Platform,
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
import user from "../../assets/user.png";
import LevelUp from "../(components)/LevelUp";

export default function Tab() {
  const [visable, setVisable] = useState(false);
  const [title, setTitle] = useState("Eco Warrior");
  const [streak, setStreak] = useState(2);
  const [nbrOfScans, setNbrOfScans] = useState(2);
  const [nextLevelScans, setNextLevelScans] = useState(5);
  const [nextTitle, setNextTitle] = useState("Eco Warrior II");
  const [currentPic, setCurrentPic] = useState(0);
  const [profilePic, setProfilePic] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lineData, setLineData] = useState(LineData);
  const navigation = usePathname();
  const [pieData, setPieData] = useState({});
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  // using Fibonacci sequence to determine the #scans needed to reach the next level
  const couponsByStreak = {
    0: [
      kfc_locked,
      best_buy_locked,
      walmart_locked,
      starbucks_locked,
      pizza_hut_locked,
    ],
    1: [
      kfc,
      best_buy_locked,
      walmart_locked,
      starbucks_locked,
      pizza_hut_locked,
    ],
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
          style: "cancel",
        },
        {
          text: "OK",
          onPress: () => deleteDatabase().then(() => setLoading(!loading)),
        },
      ],
      { cancelable: false }
    );
  };

  const getStreakText = () => {
    switch (streak) {
      case 0:
        return "0 Days";
      case 1:
        return "1 Day";
      default:
        return `${streak} Days`;
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

  const refreshData = useCallback(() => {
    getNbrOfScans().then((nbrOfScans) => {
      setNbrOfScans(nbrOfScans);
    });

    getLevel().then((level) => {
      if (title !== level.currentTitle) {
        setVisable(true);
        setFrom(title);
        setTo(level.currentTitle);
      }
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

    getScansPerDate().then((data) => {
      setLineData(data);
    });

    getPic();

    getPieData().then((data) => {
      setPieData(data);
    });
  }, [navigation]);

  useEffect(() => {
    refreshData();
  }, [navigation]);

  return (
    <>
      <SafeAreaView className="bg-white">
        <ScrollView>
          <View className="flex flex-col w-screen p-5 bg-white">
            <LevelUp
              visable={visable}
              setVisable={setVisable}
              from={from}
              to={to}
            />
            <View
              className={`flex flex-row w-full justify-between items-center ${Platform.OS === "ios" ? "" : "mt-5"}`}>
              <View className="flex-col justify-center mb-1">
                <Text className="text-xl">Hello 👋</Text>
                <Text className="text-2xl font-bold">{title}</Text>
              </View>
              <TouchableOpacity
                className="w-[60px] h-[60px] flex justify-center items-center border-2 rounded-full"
                onPress={handleImage}>
                <Image
                  source={profilePic ? { uri: profilePic } : user}
                  className="w-[100%] h-[100%] rounded-full"
                />
              </TouchableOpacity>
            </View>
            <Text className="text-sm">
              <Text className="text-zinc-500 font-semibold">Streak:</Text>{" "}
              {getStreakText()}{" "}
              {Array(Math.ceil(streak / 2))
                .fill("🔥")
                .join("")}{" "}
            </Text>
            <View className="flex flex-col w-full my-5">
              <Text className="text-progress mb-3">
                {nbrOfScans} total scans
              </Text>
              <Bar
                progress={nbrOfScans / nextLevelScans}
                width={null}
                color={PRIMARY}
                unfilledColor={"#E1E1E1"}
                borderColor={"#272727"}
                borderWidth={0}
                height={8}
              />
              <View className="flex flex-row w-full justify-end mt-3">
                <Text>
                  {getScansToNextLevelText()}
                  <Text className="text-progress">{nextTitle}</Text>
                </Text>
              </View>
            </View>
            <View className="flex flex-col w-full align-center">
              <Text className="font-semibold text-xl mb-1">Coupons</Text>
            </View>
            <View className="flex h-[120px]">
              <PagerView
                className="flex-1"
                initialPage={0}
                onPageSelected={(e) => setCurrentPic(e.nativeEvent.position)}>
                {couponMap?.map((coupon, index) => (
                  <Image
                    source={coupon}
                    resizeMode="contain" // Adjust the resizeMode here
                    className="justify-center items-center rounded-lg w-full h-full"
                    style={{
                      shadowColor: "#000",
                      shadowOffset: {
                        width: 0,
                        height: 2,
                      },
                      shadowOpacity: 0.25,
                      shadowRadius: 3.84,
                    }}
                    key={index}
                  />
                ))}
              </PagerView>
            </View>
            <View className="flex w-full mt-2 mb-3">
              <PageIndicator
                className="mb-3"
                count={couponMap.length}
                current={currentPic}
                variant="beads"
              />
            </View>
            <View className="flex flex-col w-full mb-2">
              <LineGraph nbrOfScans={nbrOfScans} lineData={lineData} />
            </View>
            <View className="flex flex-col w-full mb-2">
              <PieGraph nbrOfScans={nbrOfScans} pieData={pieData} />
            </View>
            <View className="flex-col w-full mb-2">
              <SupportBanner />
            </View>
            <View className="flex-col w-[90%]">
              <Pressable
                className="h-12 rounded-lg justify-center items-center"
                onPress={onPressDelete}>
                <Text className="text-transparent font-bold text-2xl">
                  DELETE DB
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}
