import { Text, View } from "react-native";
import { PieChart } from 'react-native-svg-charts'

const PieGraph = (props) => {

  const colorMapping = {
    "Paper/Cardboard": "#1D7AAD",
    "Other Recyclables": "#1DAD98",
    "Food Organics": "#BE7E4E",
    "General Waste": "#171717",
  };

  const label = (key) => {
    let newKey = 'trash';
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
    return newKey;
  };

  const colorPicker = (key) => {
    return colorMapping[label(key)];
  };

  const pieData = Object.entries(props.pieData)
    .filter(([key, value]) => value > 0)
    .map(([key, value], index) => ({
      value,
      svg: {
        fill: colorPicker(key),
        onPress: () => console.log('press', index),
      },
      key: `pie-${index}`,
    }));

  return (<>
    <View className="w-full flex flex-col rounded-xl border-2 border-gray-400 mb-3 pt-2 pb-3" style={{
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84
    }}>
      <View className="flex flex-row justify-center mt-5 mb-2">
        <Text className="text-sm text-zinc-900" style={{ fontSize: 20 }}>
          Types of Items Scanned
        </Text>
      </View>
      <View className="py-5">
        <PieChart style={{ height: 200 }} data={pieData} />
      </View>
      <View className="flex flex-row w-full justify-center p-3 flex-wrap">
        {
        Object.keys(props.pieData).map((item, index) => (
          <View key={index} className="flex flex-row items-center mr-4">
            <View style={{ width: 20, height: 20, backgroundColor: colorPicker(item), borderRadius: 50 }}></View>
            <Text className="ml-2 my-2 text-xs text-zinc-800 tracking-wide">
              {label(item)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  </>)
};

export default PieGraph;


