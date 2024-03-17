import { useEffect, useState } from 'react';
import { getPieData, getNbrOfScans } from '@/lib/gamification/dbUtils';
import { PieChart } from "react-native-chart-kit";
import { Text, View, ActivityIndicator } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";

const PieGraph = () => {
  const [pieData, setPieData] = useState({});
  const [loading, setLoading] = useState(false);
  const [nbrOfScans, setNbrOfScans] = useState(0);

  useEffect(() => {
    setLoading(true);
    getPieData().then(data => {
      setPieData(data);
      setLoading(false);
    });

    getNbrOfScans().then(scans => {
      setNbrOfScans(scans);
    });
  }, []);

  const colorMapping = {
    'cardboard/paper': '#0000FF',
    'metal/glass': '#008000',
    'organic': '#A52A2A',
    'plastic': '#FFFF00'
  };

  const chartData = Object.keys(pieData).map(key => ({
    name: key,
    population: pieData[key],
    color: colorMapping[key],
    legendFontColor: '#7F7F7F',
    legendFontSize: 12,
  }));

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <View className="w-[355px] h-[335px] flex flex-col rounded-xl border-2 border-gray-400">
      <View className="flex flex-row justify-between w-[100%] h-[33%] p-8">
        <View className="flex-col justify-center">
          <Text className="text-3xl font-semibold">{nbrOfScans}</Text>
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
