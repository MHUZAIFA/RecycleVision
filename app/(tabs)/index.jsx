import React from 'react';
import { View, Text } from 'react-native';
import BarGraph from '../(components)/BarGraph';
import LineGraph from '../(components)/LineGraph';

export default function Tab() {
  return (
    <View style={{ flex: 0.5, flexDirection: 'column', marginHorizontal: 20, gap: 10 }}>
      <View style={{ justifyContent: 'center', flex: 0.5, flexDirection: 'column' }}>
        <Text style={{ fontSize: 28, fontWeight: 'bold' }}>Hello 👋</Text>
        <Text style={{ fontSize: 14 }}>John Doe</Text>
      </View>
      <Text style={{ fontStyle: 'italic', color: 'gray', fontSize: 16 }}>Your Dashboard</Text>
      <View style={{ flexDirection: 'column', gap: 5, flex: 0.5 }}>
        <Text style={{ fontStyle: 'italic', fontSize: 20 }}>Metrics</Text>
        <BarGraph />
        <Text style={{ fontStyle: 'italic', fontSize: 20 }}>Scans</Text>
        <LineGraph />
      </View>
    </View>
  );
}
