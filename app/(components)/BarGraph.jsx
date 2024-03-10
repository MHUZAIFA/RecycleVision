import { BarChart } from "react-native-chart-kit";
import { BarData } from "../../assets/data/info";
const BarGraph = () => {
  return (
    <BarChart
      data={BarData}
      width={350}
      height={220}
      chartConfig={{
        backgroundGradientFrom: "#5A6CF3",
        backgroundGradientTo: "#5A6CF3",
        color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        style: {
          borderRadius: 16,
        },
      }}
      style={{
        marginVertical: 8,
        borderRadius: 16,
      }}
    />
  );
};

export default BarGraph;
