import { MaterialIcons, SimpleLineIcons } from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/core";
import { AutoFocus, Camera, CameraType, ImageType } from "expo-camera";
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
  const [isLoading, setIsLoading] = useState(false);
  const [image, setimage] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const isFocused = useIsFocused();
  const screenRatio = "16:9";

  /**
   * FUNCTIONS
   */
  const cancelPreview = async () => {
    await cameraRef.current.resumePreview();
    setIsPreview(false);
    setPrediction(null);
    setError(null);
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
    if (cameraRef.current) {
      try {
        const pic = await cameraRef.current?.takePictureAsync({
          base64: true,
          quality: 0.5,
          imageType: ImageType.jpg,
        });
        if (pic) {
          await cameraRef.current.pausePreview();
          setIsPreview(true);
          setimage(pic);
        }
      } catch (e) {
        setError("Error capturing image. Please try again.");
        console.log("Failed Camera", e);
      }
    }
  };

  const processImage = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(image.uri);
      const blob = await response.blob();
      const imageBuffer = await new Response(blob).arrayBuffer();
      sendImageToModel(imageBuffer);
    } catch (e) {
      setError("Error capturing image. Please try again.");
      console.log("Failed Processing", e);
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
            "Content-Type": "image/jpg",
          },
          method: "POST",
          body: imageBuffer,
        }
      ).then((res) => res.json());
      if (result && result.length > 0) {
        const { label, score } = result[0];
        setPrediction({ [label]: Math.round(score.toFixed(2) * 100) });
      } else {
        setError("No results found. Please try again.");
      }
    } catch (e) {
      setError("Error from API. Please try again.");
      console.log("Failed API", e);
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

  const CaptureControl = () => {
    return (
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
  };

  const CancelPreview = () => {
    return (
      <TouchableOpacity
        onPress={cancelPreview}
        className="absolute top-14 left-6 h-10 w-10 bg-gray-300 rounded-full items-center justify-center">
        <X color={"black"} size={24} />
      </TouchableOpacity>
    );
  };

  const ConfirmationPhase = () => {
    return prediction ? (
      <CancelPreview />
    ) : (
      <View className="bottom-4 justify-between items-center flex-1 flex-row bg-white mx-16 p-2 rounded-xl shadow-xl">
        <TouchableOpacity
          onPress={cancelPreview}
          style={{ backgroundColor: "#E9E9E9", padding: 10 }}
          className="rounded-xl">
          <SimpleLineIcons name="refresh" size={24} color="black" />
        </TouchableOpacity>
        <Text>Check?</Text>
        <TouchableOpacity
          onPress={processImage}
          style={{ backgroundColor: "#6342E8", padding: 10 }}
          className="rounded-xl">
          <MaterialIcons name="done" size={24} color="white" />
        </TouchableOpacity>
      </View>
    );
  };

  const Loading = () => {
    return (
      <View className="absolute w-full h-full flex-1 flexitems-center justify-center bg-black opacity-70 px-4">
        <ActivityIndicator size="large" color="#f7f7f7" />
      </View>
    );
  };

  const Error = (error) => {
    return (
      <View
        className="absolute top-1/2 left-0 right-0 h-24 -mt-6
                flex items-center justify-center bg-red-500 px-4">
        <Text className="text-white font-bold text-lg">{error}</Text>
      </View>
    );
  };

  const Prediction = ({ prediction }) => {
    const label = Object.keys(prediction)[0];
    const confidence = prediction[label];

    return (
      <View
        className="absolute top-1/2 left-0 right-0 h-24 -mt-6 flex
                  items-center justify-center bg-black bg-opacity-50 px-4">
        <Text className="text-white font-bold text-2xl">
          {label} - {confidence}%
        </Text>
      </View>
    );
  };

  return (
    <View className="flex-1">
      {isFocused ? (
        <>
          <Camera
            className="flex-1"
            ratio={screenRatio}
            type={CameraType.back}
            autoFocus={AutoFocus.on}
            onCameraReady={() => setIsCameraReady(true)}
            onMountError={(error) => <Error error={error} />}
            ref={cameraRef}>
            <View className="flex-1 flex-row bg-transparent justify-between items-end">
              {!isPreview ? (
                <CaptureControl />
              ) : (
                isPreview && <ConfirmationPhase />
              )}
            </View>
          </Camera>
          {isLoading && <Loading />}
          {error && <Error error={error} />}
          {prediction && <Prediction prediction={prediction} />}
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
