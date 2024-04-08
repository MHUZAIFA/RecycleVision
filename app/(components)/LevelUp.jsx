import React from "react";
import { Alert, Modal, Text, TouchableOpacity, View } from "react-native";

const LevelUp = ({ visable, setVisable, from, to }) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visable}
      onRequestClose={() => {
        Alert.alert("Modal has been closed.");
        setVisable(!visable);
      }}>
      <View className="flex-1 justify-center items-center px-4">
        <View className="bg-white rounded-lg shadow-xl w-[80%]">
          <View className="flex flex-row justify-between items-start text-center p-4 border-b border-gray-200">
            <View className="flex-1 flex flex-col items-center justify-center">
              <Text className="text-lg font-bold">Congratulations</Text>
              <Text className="text-lg font-bold">🎉🎉🎉🎉</Text>
            </View>
            <TouchableOpacity
              onPress={() => setVisable(false)}
              className="justify-center items-center">
              <Text className="text-xl font-semibold">✕</Text>
            </TouchableOpacity>
          </View>
          <View className="p-6 flex justify-center items-center">
            <View className="bg-blue-100 p-4 rounded-full mb-4"></View>
            <Text className="text-base">
              {from} → {to}
            </Text>
          </View>
          <TouchableOpacity
            className="m-6 bg-progress py-3 rounded-md"
            onPress={() => setVisable(!visable)}>
            <Text className="text-white text-center font-bold">Dismiss</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default LevelUp;
