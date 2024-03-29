import { Text, View, StyleSheet } from "react-native";
import { PieChart } from "react-native-chart-kit";

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

  return (
    <View className="w-full flex flex-col rounded-xl border-2 border-gray-400 mb-3">
      <View className="flex flex-row justify-center mt-5 mb-2">
        <Text className="text-sm text-gray-500" style={{ fontSize: 20 }}>
          Types of Items Scanned
        </Text>
      </View>
      <View style={styles.rectangle}></View>
      <PieChart
        data={chartData}
        width={380}
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
        // paddingLeft={"0"}
        // center={[0, 0]}
        // absolute
      />
    </View>
  );
};

const styles = StyleSheet.create({
  rectangle: {
    width: 70, // width of the rectangle
    height: 70, // height of the rectangle
    backgroundColor: '#fff', // color of the rectangle
    // backgroundColor: 'transparent',
    position: 'absolute',
    zIndex: 1,
    top: 112,
    left: 60,
    borderRadius: 50,
    // borderColor: 'red',
    // borderWidth: 23
  },
});


export default PieGraph;
