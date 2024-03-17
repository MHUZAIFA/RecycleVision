import { useIsFocused } from "@react-navigation/core";
import { AutoFocus, Camera, CameraType } from "expo-camera";
import { SaveFormat, manipulateAsync } from "expo-image-manipulator";
import { X } from "lucide-react-native";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import BarcodeMask from "react-native-barcode-mask";
import { SimpleLineIcons } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';

export default function CameraScreen() {
  const cameraRef = useRef(null);
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const [label, setLabel] = useState(null);
  const [confidence, setConfidence] = useState(null);
  const [error, setError] = useState(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // New state for loading
  const [image, setimage] = useState(null); // New state for loading
  const isFocused = useIsFocused();
  const screenRatio = "16:9";

  /**
   * FUNCTIONS
   */
  const onCameraReady = () => {
    setIsCameraReady(true);
  };
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

  /**
   * DETECT IMAGE
   */
  const detectImage = async () => {
    setIsLoading(true);
    if (cameraRef.current) {
      try {
        const pic = await cameraRef.current?.takePictureAsync({
          base64: true,
          fixOrientation: true,
        });
        if (pic) {
          await cameraRef.current.pausePreview();
          setIsPreview(true);
          setimage(pic);
        }
      } catch (e) {
        setError(
          "An error occurred while capturing the image. Please try again."
        );
        console.log("Failed", e);
      }
    }
    setIsLoading(false);
  };

  const processImage = async () => {
    try {
      const resizedPic = await manipulateAsync(
        image.uri,
        [{ resize: { width: 224, height: 224 } }],
        { compress: 0.4, format: SaveFormat.JPEG, base64: true }
      );
      const response = await fetch(resizedPic.uri);
      const blob = await response.blob();
      const imageBuffer = await new Response(blob).arrayBuffer();
      sendImageToModel(imageBuffer);
    } catch (e) {
      setError(
        "An error occurred while capturing the image. Please try again."
      );
      console.log("Failed", e);
    }
  };

  /**
   * SEND IMAGE TO MODEL
   */
  const sendImageToModel = async (imageBuffer) => {
    try {
      const result = await fetch(
        "https://api-inference.huggingface.co/models/plsakr/vit-garbage-classification-v2",
        {
          headers: {
            Authorization: "Bearer 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",
          },
          method: "POST",
          body: imageBuffer,
        }
      );
      const resultJson = await result.json();
      const { label, score } = resultJson[0];
      label && setLabel(label);
      score && setConfidence(Math.round(score.toFixed(2) * 100));
    } catch (e) {
      setError(
        "An error occurred while processing the image. Please try again."
      );
      console.log("Failed", e);
    }
  };

  /**
   * RENDER COMPONENTS
   */
  const RenderRequestPermission = () => (
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

  const buttonSize = new Animated.Value(1);
  const animatedStyle = {
    transform: [{ scale: buttonSize }],
  };

  const renderCaptureControl = () => (
    <>
      <BarcodeMask
        width={300}
        height={525}
        edgeBorderWidth={5}
        edgeColor="#f7f7f7"
        animatedLineColor="#f7f7f7"
      />
      <View
        className="absolute bottom-1 left-0 right-0 flex-row
                  justify-between items-center">
        <Pressable
          className="flex-1 items-center justify-end mb-5"
          disabled={!isCameraReady}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={detectImage}>
          <Animated.View
            style={[
              {
                borderWidth: 5,
                borderRadius: 75,
                borderColor: "#f7f7f7",
                height: 75,
                width: 75,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              },
              animatedStyle,
            ]}
          />
        </Pressable>
      </View>
    </>
  );

  const renderConfirmationPhaseElements = () => (
    <>
      <TouchableOpacity
        onPress={cancelPreview}
        className="absolute top-14 left-6 h-10 w-10 bg-gray-300 rounded-full items-center justify-center">
        <X color={"black"} size={24} />
      </TouchableOpacity>
      <View
        className="bottom-4 justify-between items-center flex-1 flex-row bg-white mx-16 p-2 rounded-xl shadow-xl">
        <TouchableOpacity
          onPress={cancelPreview}
          style={{ backgroundColor: '#E9E9E9', padding: 10 }}
          className="rounded-xl">
          <SimpleLineIcons name="refresh" size={24} color="black" />
        </TouchableOpacity>
        <Text>Check?</Text>
        <TouchableOpacity
          onPress={processImage}
          style={{ backgroundColor: '#6342E8', padding: 10 }}
          className="rounded-xl">
          <MaterialIcons name="done" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </>
  );
  const renderLoading = () => (
    <View
      className="absolute w-full h-full flex-1 flexitems-center justify-center bg-black px-4">
      <ActivityIndicator size="large" color="#f7f7f7" />
    </View>
  );
  const renderError = (error) => (
    <View
      className="absolute top-1/2 left-0 right-0 h-24 -mt-6
                flex items-center justify-center bg-red-500 px-4">
      <Text className="text-white font-bold text-lg">{error}</Text>
    </View>
  );
  const renderLabelConfidence = (label, confidence) => (
    <View
      className="absolute top-1/2 left-0 right-0 h-24 -mt-6 flex
                items-center justify-center bg-black bg-opacity-50 px-4">
      <Text className="text-white font-bold text-2xl">
        {label} - {confidence}%
      </Text>
    </View>
  );
  const cancelPreview = async () => {
    await cameraRef.current.resumePreview();
    setIsPreview(false);
    setLabel(null);
    setConfidence(null);
    setError(null);
  };

  return (
    <View className="flex-1">
      {isFocused ? (
        <>
          <Camera
            className="flex-1"
            ratio={screenRatio}
            // @ts-ignore FLASHMODE
            // flashMode={Camera.Constants.FlashMode.on}
            onCameraReady={onCameraReady}
            type={CameraType.back}
            autoFocus={AutoFocus.on}
            ref={cameraRef}
            onMountError={(error) => {
              renderError(error);
              console.log("camera error", error);
            }}>
            <View className="flex-1 flex-row bg-transparent justify-between items-end">
              {!isPreview ? renderCaptureControl() : renderConfirmationPhaseElements()}
            </View>
          </Camera>
          {isLoading && renderLoading()}
          {error && renderError(error)}
          {label && confidence && renderLabelConfidence(label, confidence)}
        </>
      ) : !permission.granted ? (
        <RenderRequestPermission />
      ) : (
        <View className="flex-1 items-center justify-center">
          <Text className="text-center">Loading...</Text>
        </View>
      )}
    </View>
  );
}
