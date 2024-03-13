import { Text, View } from "react-native";

const AnalyticsBadge = () => {
  return (
    <View className="w-[165px] h-[165px] flex flex-col justify-center items-center border-gray-400 border-2 shadow-3xl rounded-xl">
      <Text className="text-4xl font-bold italic">483</Text>
      <Text className="text-[12px] italic text-gray-500">Items scanned</Text>
    </View>
  );
};

export default AnalyticsBadge;
