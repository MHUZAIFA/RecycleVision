import { TouchableOpacity, View, Text, Linking } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";

const SupportBanner = () => {
  const handleSend = () => {
    Linking.openURL("mailto:support@recyclevision.com");
  };
  return (
    <TouchableOpacity
      className="flex flex-row justify-between items-center border-gray-400 border-2 shadow-3xl w-[90%] h-[100px] rounded-xl px-6"
      onPress={handleSend}>
      <View className="flex flex-row justify-center items-center gap-4 w-[66%]">
        <FontAwesome name="question-circle-o" size={34} color="black" />
        <View className="flex flex-col">
          <Text className=" text-xl font-bold">Support</Text>
          <Text className="text-gray-500">Contact us for assistance</Text>
        </View>
      </View>
      <View>
        <FontAwesome name="angle-right" size={24} color="black" />
      </View>
    </TouchableOpacity>
  );
};

export default SupportBanner;
