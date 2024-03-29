import { PRIMARY } from "@/lib/constants";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Text, View } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { Dimensions } from 'react-native';

const LineGraph = (props) => {
  const screenWidth = Dimensions.get('window').width - 80;
  return (
    <View className="w-full h-[400px] flex flex-col rounded-xl border-2 border-gray-400 mb-3 drop-shadow-lg">
      <View className="flex flex-row justify-between p-5 mb-2">
        <View className="flex-col justify-center">
          <Text className="text-3xl font-semibold">{props.nbrOfScans}</Text>
          <Text className="text-sm text-gray-500">Items scanned</Text>
        </View>
      </View>
      <LineChart
        data={props.lineData}
        width={screenWidth}
        height={290}
        chartConfig={{
          backgroundColor: "#fff",
          backgroundGradientFrom: "#fff",
          backgroundGradientTo: "#fff",
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
