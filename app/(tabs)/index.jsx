import {
  Dimensions,
  ImageBackground,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import LineGraph from "../(components)/LineGraph";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import PagerView from "react-native-pager-view";
import BadgeBanner from "../(components)/BadgeBanner";
import inner from "../../assets/inner.png";
import icon from "../../assets/favicon.png";
import AnalyticsBadge from "../(components)/AnalyticsBadge";
import PieGraph from "../(components)/PieGraph";
import { Bar } from "react-native-progress";
export default function Tab() {
  return (
    <ScrollView>
      <View className="flex-col w-screen mx-5 space-y-3.5 mt-20">
        <View className="flex flex-row w-[90%] justify-between">
          <View className="flex-col justify-center space-y-2.5 mb-2">
            <Text className="text-2xl">Hello 👋</Text>
            <Text className="text-3xl font-bold">Eco Warrior</Text>
            <Text className="text-sm">Streak: 100 Days🔥</Text>
          </View>
          <ImageBackground
            source={icon}
            className="w-[50px] h-[50px] flex rounded-full">
            <TouchableOpacity className="w-[100%] h-[100%]"></TouchableOpacity>
          </ImageBackground>
        </View>
        <View className="flex flex-col w-screen gap-1">
          <Text className="text-progress">3100 exp points</Text>
          <Bar
            progress={0.7}
            width={Dimensions.get("screen").width * 0.9}
            color="#6342E8"
          />
          <View className="flex flex-row w-[90%] justify-between mb-2">
            <Text className="text-progress">Level 5</Text>
            <Text>
              165 point to <Text className="text-progress">Level 6</Text>
            </Text>
          </View>
        </View>
        <BadgeBanner />
        <View className="flex flex-row w-[90%] align-center justify-between">
          <Text className="font-semibold text-base">Your Mission</Text>
          <View className="flex flex-row gap-3">
            <FontAwesome name="angle-left" size={24} color="black" />
            <FontAwesome name="angle-right" size={24} color="black" />
          </View>
        </View>
        <View className="flex w-[90%] h-[180px]">
          <PagerView className="flex-1" initialPage={0}>
            <ImageBackground
              source={inner}
              className="justify-center items-center bg-cover"
              key="1"></ImageBackground>
            <ImageBackground
              source={inner}
              className="justify-center items-center bg-cover"
              key="2"></ImageBackground>
            <ImageBackground
              source={inner}
              className="justify-center items-center bg-cover"
              key="3"></ImageBackground>
          </PagerView>
        </View>
        <View className="flex flex-row w-[90%] justify-between">
          <AnalyticsBadge />
          <AnalyticsBadge />
        </View>
        <View className="flex-col w-screen space-y-1.25">
          <LineGraph />
        </View>
        <View className="flex-col w-screen space-y-1.25">
          <PieGraph />
        </View>
      </View>
    </ScrollView>
  );
}
