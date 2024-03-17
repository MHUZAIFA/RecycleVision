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

export default function CameraScreen() {
  const cameraRef = useRef(null);
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const [error, setError] = useState(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // New state for loading
  const isFocused = useIsFocused();
  const screenRatio = "16:9";

  const [prediction, setPrediction] = useState(null);
  const [otherResults, setOtherResults] = useState([]);
  const [showOtherResults, setShowOtherResults] = useState(false);

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
        }
        const resizedPic = await manipulateAsync(
          pic.uri,
          [{ resize: { width: 224, height: 224 } }],
          { compress: 0.4, format: SaveFormat.JPEG, base64: true }
        );
        const response = await fetch(resizedPic.uri);
        const blob = await response.blob();
        const imageBuffer = await new Response(blob).arrayBuffer();
        sendImageToModel(imageBuffer);
      } catch (e) {
        setError("Error capturing image. Please try again.");
        console.log("Failed", e);
      }
    }
    setIsLoading(false);
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
            "Content-Type": "image/jpeg",
          },
          method: "POST",
          body: imageBuffer,
        }
      ).then((res) => res.json());
      const { label, score } = result[0];
      setPrediction({ [label]: Math.round(score.toFixed(2) * 100) });

      // Save the other results
      setOtherResults(
        result.slice(1).map(({ label, score }) => ({
          [label]: Math.round(score.toFixed(2) * 100),
        }))
      );
    } catch (e) {
      setError("Error from API. Please try again.");
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
                borderColor: "gray",
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
  const renderCloseButton = () => (
    <TouchableOpacity
      onPress={cancelPreview}
      className="absolute top-14 left-6 h-10 w-10 bg-gray-300 rounded-full items-center justify-center">
      <X color={"black"} size={24} />
    </TouchableOpacity>
  );
  const renderLoading = () => (
    <View
      className="absolute top-1/2 left-0 right-0 h-24 -mt-6
                flexitems-center justify-center bg-black bg-opacity-50 px-4">
      <ActivityIndicator size="large" color="#808080" />
    </View>
  );

  const renderError = (error) => (
    <View
      className="absolute top-1/2 left-0 right-0 h-24 -mt-6
                flex items-center justify-center bg-red-500 px-4">
      <Text className="text-white font-bold text-lg">{error}</Text>
    </View>
  );

  const renderLabelConfidence = (prediction) => {
    const label = Object.keys(prediction)[0];
    const confidence = prediction[label];

    return (
      <View
        className="absolute top-1/2 left-0 right-0 h-24 -mt-6 flex
                  items-center justify-center bg-black bg-opacity-50 px-4">
        <Text className="text-white font-bold text-2xl">
          {label} - {confidence}%
        </Text>
        {/* <Button
          title={showOtherResults ? "Hide Other Results" : "Show Other Results"}
          onPress={() => setShowOtherResults(!showOtherResults)}
        />
        {showOtherResults &&
          otherResults.map((result, index) => {
            const label = Object.keys(result)[0];
            const confidence = result[label];
            return (
              <Text key={index} className="text-white font-bold text-2xl">
                {label} - {confidence}%
              </Text>
            );
          })} */}
      </View>
    );
  };

  const cancelPreview = async () => {
    await cameraRef.current.resumePreview();
    setIsPreview(false);
    setPrediction(null);
    setOtherResults([]);
    setShowOtherResults(false);
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
              {!isPreview ? renderCaptureControl() : renderCloseButton()}
            </View>
          </Camera>
          {isLoading && renderLoading()}
          {error && renderError(error)}
          {prediction && renderLabelConfidence(prediction)}
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
