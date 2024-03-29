import { Text, View, StyleSheet } from "react-native";
import { PieChart } from "react-native-chart-kit";
import { Dimensions } from 'react-native';

const PieGraph = (props) => {
  const colorMapping = {
    "Paper/Cardboard": "#1D7AAD",
    "Other Recyclables": "#1DAD98",
    "Food Organics": "#BE7E4E",
    "General Waste": "#171717",
  };

  const chartData = Object.keys(props.pieData).map((key) => {
    let newKey = key;

    // Rename the keys
    if (key === "metal/glass/plastic") {
      newKey = "Other Recyclables";
    }
    if (key === "cardboard/paper") {
      newKey = "Paper/Cardboard";
    }
    if (key === "organic") {
      newKey = "Food Organics";
    }
    if (key === "trash") {
      newKey = "General Waste";
    }

    return {
      name: newKey,
      population: props.pieData[key],
      color: colorMapping[newKey],
      legendFontColor: "#7F7F7F",
      legendFontSize: 12,
    };
  });

  if (!chartData.length) {
    return <Text>No data available</Text>;
  }

  const screenWidth = Dimensions.get('window').width - 45;

  return (
    <View className="w-full flex flex-col rounded-xl border-2 border-gray-400 mb-3" style={{
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84
    }}>
      <View className="flex flex-row justify-center mt-5 mb-2">
        <Text className="text-sm text-gray-500" style={{ fontSize: 20 }}>
          Types of Items Scanned
        </Text>
      </View>
      <View style={[styles.rectangle, {left: 5 + screenWidth*0.133}]}></View>
      <PieChart
        data={chartData}
        width={screenWidth}
        height={200}
        chartConfig={{
          color: (opacity = 1) => `rgba(128, 0, 128, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(55, 55, 55, ${opacity})`
        }}
        style={{
          borderRadius: 12,
        }}
        accessor={"population"}
        backgroundColor={"transparent"}
        absolute
      />
    </View>
  );
};

const styles = StyleSheet.create({
  rectangle: {
    width: 70, // width of the rectangle
    height: 70, // height of the rectangle
    backgroundColor: '#fff', // color of the rectangle
    position: 'absolute',
    zIndex: 1,
    top: 112,
    borderRadius: 50
  },
});


export default PieGraph;

