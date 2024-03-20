import { PieChart } from "react-native-chart-kit";
import { Text, View } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";

const PieGraph = (props) => {
const colorMapping = {
  'Paper | Cardboard': '#0000FF',
  'Other Recyclables': '#008000',
  'Food Organics': '#A52A2A',
  'General Waste': '#000000'
};

const chartData = Object.keys(props.pieData).map(key => {
  let newKey = key;

  // Rename the keys
  if (key === 'metal/glass/plastic') {
    newKey = 'Other Recyclables';
  }
  if (key === 'cardboard/paper') {
    newKey = 'Paper & Cardboard';
  }
  if (key === 'organic') {
    newKey = 'Food Organics';
  }
  if (key === 'trash') {
    newKey = 'General Waste';
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
    <View className="w-[355px] h-[260px] flex flex-col rounded-xl border-2 border-gray-400">
      <View className="flex flex-row justify-center mt-5 mb-5">
        <Text className="text-sm text-gray-500" style={{ fontSize: 20 }}>Types of Items Scanned</Text>
      </View>
      <PieChart
        data={chartData}
        width={350}
        height={180}
        chartConfig={{
          color: (opacity = 1) => `rgba(128, 0, 128, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(55, 55, 55, ${opacity})`,
        }}
        style={{
          borderRadius: 12,
        }}
        accessor={"population"}
        backgroundColor={"transparent"}
        paddingLeft={"0"}
        center={[0, 0]}
        absolute
      />
    </View>
  );
};

export default PieGraph;
