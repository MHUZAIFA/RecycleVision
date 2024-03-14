import { LineChart } from "react-native-chart-kit";
import { LineData } from "../../assets/data/info";
import { Text, View } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";

const LineGraph = () => {
  return (
    <View className="w-[355px] h-[335px] flex flex-col rounded-xl border-2 border-gray-400">
      <View className="flex flex-row justify-between w-[100%] h-[33%] p-8">
        <View className="flex-col justify-center">
          <Text className="text-xl">Overview</Text>
          <Text className="text-3xl font-semibold">142</Text>
          <Text className="text-sm text-gray-500">
            Items scanned (Last 5 Days)
          </Text>
        </View>
        <FontAwesome name="info-circle" size={24} color="black" />
      </View>
      <LineChart
        data={LineData}
        width={350}
        height={220}
        chartConfig={{
          backgroundColor: "#F9F6EE",
          backgroundGradientFrom: "#F9F6EE",
          backgroundGradientTo: "#F9F6EE",
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(99, 66, 232, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(128, 128, 128, ${opacity})`,
          propsForDots: {
            r: "6",
            strokeWidth: "2",
            stroke: "#6342E8",
          },
          useShadowColorFromDataset: false,
        }}
        style={{
          borderRadius: 12,
        }}
        bezier
      />
    </View>
  );
};

export default LineGraph;
