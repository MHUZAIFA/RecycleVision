import { PieChart } from "react-native-chart-kit";
import { PieData } from "../../assets/data/info";
import { Text, View } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";

const PieGraph = () => {
  return (
    <View className="w-[355px] h-[335px] flex flex-col rounded-xl border-2 border-gray-400">
      <View className="flex flex-row justify-between w-[100%] h-[33%] p-8">
        <View className="flex-col justify-center">
          <Text className="text-3xl font-semibold">23</Text>
          <Text className="text-sm text-gray-500">Types of Items Scanned</Text>
        </View>
        <FontAwesome name="info-circle" size={26} color="black" />
      </View>
      <PieChart
        data={PieData}
        width={350}
        height={220}
        chartConfig={{
          color: (opacity = 1) => `rgba(128, 0, 128, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(55, 55, 55, ${opacity})`,
        }}
        style={{
          borderRadius: 12,
        }}
        accessor={"population"}
        backgroundColor={"transparent"}
        paddingLeft={"15"}
        center={[0, 0]}
        absolute
      />
    </View>
  );
};

export default PieGraph;
