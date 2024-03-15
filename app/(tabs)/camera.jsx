import { Camera, CameraType } from "expo-camera";
import { SaveFormat, manipulateAsync } from "expo-image-manipulator";
import { useRef, useState } from "react";
import { Pressable, Text, View, ActivityIndicator, Animated } from "react-native";

export default function CameraScreen() {
  const [type] = useState(CameraType.back);
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const [label, setLabel] = useState(null);
  const [confidence, setConfidence] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // New state for loading
  const cameraRef = useRef(null);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-center">
          We need your permission to show the camera
        </Text>
        <Pressable
          className="bg-blue-500 py-2 px-4 rounded"
          onPress={requestPermission}>
          <Text className="text-white font-bold">Grant Permission</Text>
        </Pressable>
      </View>
    );
  }
  const detectImage = async () => {
    setIsLoading(true); // Set loading to true before processing the image
    if (cameraRef.current) {
      try {
        const pic = await cameraRef.current?.takePictureAsync({
          base64: true,
          fixOrientation: true,
        });
        const resizedPic = await manipulateAsync(
          pic.uri,
          [{ resize: { width: 224, height: 224 } }],
          { compress: 0.4, format: SaveFormat.JPEG, base64: true }
        );
        const response = await fetch(resizedPic.uri);
        const blob = await response.blob();
        const arrayBuffer = await new Response(blob).arrayBuffer();
        sendImageToModel(arrayBuffer);
      } catch (e) {
        setError("An error occurred while capturing the image. Please try again.");
        console.log("Failed", e);
      }
    }
  };

  const sendImageToModel = async (arrayBuffer) => {
    try {
      const result = await fetch(
        "https://api-inference.huggingface.co/models/plsakr/vit-garbage-classification-v2",
        {
          headers: {
            Authorization: "Bearer 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",
          },
          method: "POST",
          body: arrayBuffer,
        }
      );
      const resultJson = await result.json();
      const { label, score } = resultJson[0];
      label && setLabel(label);
      score && setConfidence(Math.round(score.toFixed(2) * 100));
    } catch (e) {
      setError("An error occurred while processing the image. Please try again.");
      console.log("Failed", e);
    } finally {
      setIsLoading(false); // Set loading to false after processing the image
    }
  };

  setTimeout(() => {
    setLabel(null);
    setConfidence(null);
    setError(null);
  }, 3000);

  const buttonSize = new Animated.Value(1);

  const handlePressIn = () => {
    Animated.spring(buttonSize, {
      toValue: 0.9,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(buttonSize, {
      toValue: 1,
      friction: 3,
      tension: 200,
      useNativeDriver: true,
    }).start();
  };

  const animatedStyle = {
    transform: [{ scale: buttonSize }],
  };

  return (
    <View className="flex-1">
      <Camera
        className="flex-1"
        type={type}
        autoFocus="on"
        ref={cameraRef}>
        <View className="flex-1 flex-row bg-transparent mx-16 justify-between items-end">
          <Pressable
            className="flex-1 items-center justify-end mb-10"
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={detectImage}>
            <Animated.View style={[{
              borderWidth: 5,
              borderRadius: 75,
              borderColor: 'rgba(255, 255, 255, 0.5)',
              height: 75,
              width: 75,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }, animatedStyle]} />
          </Pressable>
        </View>
      </Camera>
      {isLoading && (
        <View className="absolute top-1/2 left-0 right-0 h-12 -mt-6 flex items-center justify-center bg-black bg-opacity-50 px-4">
          <ActivityIndicator size="large" color="#808080" /> {/* Loading indicator */}
        </View>
      )}
      {error && (
        <View className="absolute top-1/2 left-0 right-0 h-12 -mt-6 flex items-center justify-center bg-red-500 px-4">
          <Text className="text-white font-bold text-2xl">{error}</Text>
        </View>
      )}
      {label && confidence && (
        <View className="absolute top-1/2 left-0 right-0 h-12 -mt-6 flex items-center justify-center bg-black bg-opacity-50 px-4">
          <Text className="text-white font-bold text-2xl">
            {label} - {confidence}%
          </Text>
        </View>
      )}
    </View>
  );
}
