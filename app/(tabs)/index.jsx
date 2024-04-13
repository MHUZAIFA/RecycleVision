import { PRIMARY } from "@/lib/constants";
import { insertNewScan } from "@/lib/gamification/dbUtils";
import { useIsFocused } from "@react-navigation/core";
import { AutoFocus, Camera, CameraType, ImageType } from "expo-camera";
import { useNavigation } from "expo-router";
import { RotateCcw } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import BarcodeMask from "react-native-barcode-mask";
import * as Device from "expo-device";
import BottomSheet from "../(components)/BottomSheet";
import PredictionResult from "../(components)/PredictionResult";

export default function CameraScreen() {
  const cameraRef = useRef(null);
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const [error, setError] = useState(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [image, setimage] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [bottomSheetVisible, setBottomSheetVisible] = useState(false);
  const isFocused = useIsFocused();
  const navigation = useNavigation();

  const screenRatio = "16:9";
  const buttonOpacity = new Animated.Value(1);
  const buttonColor = new Animated.Value(0);

  /**
   * CAMEREA RESET ON FOCUS LOSS
   */
  useEffect(() => {
    const unsubscribe = navigation.addListener("blur", () => {
      resetCameraScreen();
    });
    return unsubscribe;
  }, [navigation]);

  /**
   * FUNCTIONS
   */
  const resetCameraScreen = async () => {
    await cameraRef.current.resumePreview();
    setIsPreview(false);
    setPrediction(null);
    setError(null);
  };
  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(buttonSize, {
        toValue: 0.8,
        useNativeDriver: false,
      }),
      Animated.timing(buttonOpacity, {
        toValue: 0.5,
        duration: 200,
        useNativeDriver: false,
      }),
      Animated.timing(buttonColor, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(buttonSize, {
        toValue: 1,
        friction: 3,
        tension: 200,
        useNativeDriver: false,
      }),
      Animated.timing(buttonOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }),
      Animated.timing(buttonColor, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
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
          processImage();
        }
      } catch (e) {
        setError("Capturing Error\nTry again");
        console.log("Failed Camera", e);
      }
    }
  };

  const processImage = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch(image.uri);
      const blob = await response.blob();
      const imageBuffer = await new Response(blob).arrayBuffer();
      sendImageToModel(imageBuffer);
    } catch (e) {
      setError("Processing Error\nTry again");
      console.log("Failed Processing", e);
    }
    setIsProcessing(false);
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
        insertNewScan(label);
      } else {
        setPrediction(null);
        setError("No Results\nTry again");
      }
      setBottomSheetVisible(true);
    } catch (e) {
      setError("API Error\nTry again");
      console.log("Failed API", e);
    }
  };

  /**
   * RENDER COMPONENTS
   */
  const RequestPermissionAlert = () => {
    Alert.alert(
      "Permission Request",
      "We need your permission to show the camera",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        { text: "Grant Permission", onPress: requestPermission },
      ],
      { cancelable: false }
    );
    return null;
  };

  const buttonSize = new Animated.Value(1);
  const buttonColorInterpolation = buttonColor.interpolate({
    inputRange: [0, 1],
    outputRange: ["transparent", PRIMARY],
  });
  const animatedStyle = {
    transform: [{ scale: buttonSize }],
    opacity: buttonOpacity,
    backgroundColor: buttonColorInterpolation,
  };

  const CaptureControl = () => {
    return (
      <>
        <BarcodeMask
          width={300}
          height={525}
          edgeBorderWidth={5}
          edgeColor="#fff"
          animatedLineColor="#fff"
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
                  borderColor: "#cccccc",
                  opacity: 0.8,
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

  const ProcessingError = () => {
    return (
      <View
        className={
          "bottom-10 justify-between items-center flex-1 flex-row w-fit rounded-lg mx-5 pr-2 py-2"
        }
        style={{
          backgroundColor: "#D64545",
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        }}>
        <Text className="font-semibold ml-4 text-slate-100 tracking-wide">
          An error occured while processing image
        </Text>
        <TouchableOpacity
          onPress={resetCameraScreen}
          style={{ backgroundColor: "#B93B3B", padding: 10 }}
          className="rounded-lg">
          <RotateCcw color={"white"} size={24} />
        </TouchableOpacity>
      </View>
    );
  };

  const Error = ({ error }) => {
    return (
      <View
        className="absolute top-1/2 left-0 right-0 h-24 -mt-6
                flex items-center justify-center bg-red-500 px-4">
        <Text className="text-white font-bold text-lg">{error}</Text>
      </View>
    );
  };

  const Loading = () => {
    return (
      <View
        className="absolute w-full h-full flex-1 flexitems-center justify-center bg-black 0 px-4"
        style={{ backgroundColor: "#000000b3" }}>
        <ActivityIndicator
          size="large"
          color={PRIMARY}
          style={{ transform: [{ scale: 2 }] }}
        />
      </View>
    );
  };

  const closeBottomSheet = async () => {
    setBottomSheetVisible(false);
    await resetCameraScreen();
  };

  return (
    <View className="flex-1">
      {!permission ? (
        <Loading />
      ) : !permission.granted ? (
        <RequestPermissionAlert />
      ) : isFocused ? (
        <Camera
          useCamera2Api={Device.brand === "Apple"}
          className="flex-1"
          ratio={screenRatio}
          type={CameraType.back}
          autoFocus={Device.brand === "Apple" ? true : AutoFocus.on}
          onCameraReady={() => setIsCameraReady(true)}
          onMountError={(error) => <Error error={error} />}
          ref={cameraRef}>
          <View className="flex-1 flex-row bg-transparent justify-between items-end">
            {isLoading ? (
              <Loading />
            ) : !isPreview ? (
              <CaptureControl />
            ) : error ? (
              <ProcessingError />
            ) : prediction && (
              <BottomSheet
                isBottomSheetVisible = { bottomSheetVisible }
                setIsBottomSheetVisible = { setBottomSheetVisible }
                title="Results"
                displayHeader= {false}
                onClose={closeBottomSheet}
                content={PredictionResult(prediction)}
                isLoading={isProcessing}
              />
            )}
          </View>
        </Camera>
      ) : (
        <Loading />
      )}
    </View>
  );
}
