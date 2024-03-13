import { TouchableOpacity, View, Text } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";

const BadgeBanner = () => {
  return (
    <TouchableOpacity className="flex justify-center border-gray-400 border-2 shadow-3xl w-[90%] h-[100px] rounded-xl">
      <View className="flex flex-row justify-center items-center gap-4 pl-3 pr-3">
        <FontAwesome name="cubes" size={34} color="black" />
        <View className="flex flex-col">
          <Text className="text-base font-bold">Badges</Text>
          <Text>Check the badges that you earned...</Text>
        </View>
        <FontAwesome name="angle-right" size={24} color="black" />
      </View>
    </TouchableOpacity>
  );
};

export default BadgeBanner;
