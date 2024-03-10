import React from 'react';
import { LineChart } from 'react-native-chart-kit';
import { LineData } from '../../assets/data/info';

const LineGraph = () => {
  return (
    <LineChart
      data={LineData}
      width={350}
      height={220}
      chartConfig={{
        backgroundGradientFrom: '#F08F5F',
        backgroundGradientTo: '#F08F5F',
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

export default LineGraph;
