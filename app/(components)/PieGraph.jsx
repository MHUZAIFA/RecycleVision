import { PieChart } from "react-native-chart-kit";
import { Text, View } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";

const PieGraph = (props) => {
const colorMapping = {
  'cardboard/paper': '#0000FF',
  'M/G/P': '#008000',
  'organic': '#A52A2A',
  'trash': '#000000'
};

const chartData = Object.keys(props.pieData).map(key => {
  let newKey = key;

  // Rename the keys
  if (key === 'metal/glass/plastic') {
    newKey = 'M/G/P';
  }

  return {
    name: newKey,
    population: props.pieData[key],
    color: colorMapping[newKey],
    legendFontColor: '#7F7F7F',
    legendFontSize: 12,
  };
});

  if (!chartData.length) {
    return <Text>No data available</Text>;
  }

  return (
    <View className="w-[355px] h-[335px] flex flex-col rounded-xl border-2 border-gray-400">
      <View className="flex flex-row justify-between w-[100%] h-[33%] p-8">
        <View className="flex-col justify-center">
          <Text className="text-3xl font-semibold">{props.nbrOfScans}</Text>
          <Text className="text-sm text-gray-500">Types of Items Scanned</Text>
        </View>
        <FontAwesome name="info-circle" size={26} color="black" />
      </View>
      <PieChart
        data={chartData}
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
