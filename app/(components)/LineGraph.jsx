import { PRIMARY } from "@/lib/constants";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Text, View } from "react-native";
import { LineChart } from "react-native-chart-kit";

const LineGraph = (props) => {
  return (
    <View className="w-[355px] h-[335px] flex flex-col rounded-xl border-2 border-gray-400">
      <View className="flex flex-row justify-between w-[100%] h-[33%] p-8">
        <View className="flex-col justify-center">
          <Text className="text-3xl font-semibold">{props.nbrOfScans}</Text>
          <Text className="text-sm text-gray-500">Items scanned</Text>
        </View>
      </View>
      <LineChart
        data={props.lineData}
        width={350}
        height={220}
        chartConfig={{
          backgroundColor: "#F7F7F7",
          backgroundGradientFrom: "#F7F7F7",
          backgroundGradientTo: "#F7F7F7",
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(99, 66, 232, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(128, 128, 128, ${opacity})`,
          propsForDots: {
            r: "6",
            strokeWidth: "2",
            stroke: PRIMARY,
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
