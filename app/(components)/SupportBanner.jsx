import { TouchableOpacity, View, Text, Linking } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { MaterialIcons } from '@expo/vector-icons';

const SupportBanner = () => {
  const handleSend = () => {
    Linking.openURL("mailto:support@recyclevision.com");
  };
  return (
    <TouchableOpacity
      className="flex flex-row justify-between items-center border-2 w-full rounded-lg border-gray-550 p-4 pr-6"
      onPress={handleSend}>
      <View className="flex flex-row justify-center items-center">
      <MaterialIcons name="contact-support" size={50} color="#272727" />
        <View className="flex flex-col ml-3">
          <Text className=" text-xl font-semibold mb-1">Support</Text>
          <Text className="text-zinc-500">Contact us for assistance</Text>
        </View>
      </View>
      <View>
        <FontAwesome name="angle-right" size={36} color="black" />
      </View>
    </TouchableOpacity>
  );
};

export default SupportBanner;
