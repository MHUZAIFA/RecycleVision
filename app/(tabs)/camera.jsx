import { PRIMARY } from "@/lib/constants";
import { insertNewScan } from "@/lib/gamification/dbUtils";
import { useIsFocused } from "@react-navigation/core";
import clsx from "clsx";
import { AutoFocus, Camera, CameraType, ImageType } from "expo-camera";
import { useNavigation } from "expo-router";
import { Check, RotateCcw, X } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Modal,
  Pressable,
  StyleSheet,
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
        }
      } catch (e) {
        setError("Capturing Error\nTry again");
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
      setError("Processing Error\nTry again");
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
        insertNewScan(label);
      } else {
        setPrediction(null);
        setError("No Results. Try again.");
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
        onPress={resetCameraScreen}
        className="absolute top-14 left-6 h-10 w-10 bg-gray-300 rounded-full items-center justify-center">
        <X color={"black"} size={24} />
      </TouchableOpacity>
    );
  };

  const ConfirmationPhase = () => {
    return (
      <View
        className={clsx(
          "bottom-10 justify-between items-center flex-1 flex-row mx-16 p-2 rounded-xl shadow-xl",
          !error ? "bg-white" : "bg-red-400"
        )}>
        <TouchableOpacity
          onPress={resetCameraScreen}
          style={{ backgroundColor: "#E9E9E9", padding: 10 }}
          className="rounded-xl">
          <RotateCcw color={"black"} size={24} />
        </TouchableOpacity>
        <Text className="font-bold text-md">{error ? error : "Submit ?"}</Text>
        <TouchableOpacity
          disabled={error ? true : false}
          onPress={processImage}
          style={{
            backgroundColor: !error ? PRIMARY : "#676767",
            padding: 10,
          }}
          className="rounded-xl">
          <Check color={"white"} size={24} />
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
      <View className="absolute w-full h-full flex-1 flexitems-center justify-center bg-white opacity-50 px-4">
        <ActivityIndicator size="large" color={PRIMARY} />
      </View>
    );
  };

  const [bottomSheetVisible, setBottomSheetVisible] = useState(false);

  const closeBottomSheet = async () => {
    setBottomSheetVisible(false);
    resetCameraScreen();
  };

  const styles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      justifyContent: "flex-end",
    },
    bottomSheet: {
      backgroundColor: "#ffffff",
      padding: 20,
      borderTopLeftRadius: 30,
      borderTopRightRadius: 30,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
      maxHeight: "90%",
    },
    bottomSheetTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: "#373737",
    },
    bottomSheetDescription: {
      fontSize: 15,
      marginTop: 10,
    },
    bottomSheetRecommendation: {
      fontSize: 20,
      fontWeight: "bold",
      color: "#6342E8",
      marginTop: 10,
      textTransform: "capitalize",
    },
    bottomSuggestedBinTitle: {
      fontSize: 17,
      fontWeight: "500",
      marginTop: 10,
    },
    bottomSheetBinDescription: {
      fontSize: 15,
    },
    closeButton: {
      marginTop: 20,
      backgroundColor: "#000",
      alignSelf: "center",
      width: "100%",
      padding: 17,
      borderRadius: 5,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 3,
      },
      shadowOpacity: 0.29,
      shadowRadius: 4.65,

      elevation: 7,
    },
    closeButtonText: {
      color: "white",
      fontSize: 15,
      alignSelf: "center",
    },
    bottomSheetBinTitle: {
      fontSize: 20,
      fontWeight: "bold",
      textTransform: "capitalize",
    },
    blueBin: {
      color: "#0077c8",
    },
    greenBin: {
      color: "#228B22",
    },
    orangeBin: {
      color: "orangered",
    },
    blackBin: {
      color: "#171717",
    },
  });

  // Function to render bin title with appropriate color style
  const BinTitle = ({ binType }) => {
    let colorStyle;
    switch (binType) {
      case BinType.BLUE:
        colorStyle = styles.blueBin;
        break;
      case BinType.GREEN:
        colorStyle = styles.greenBin;
        break;
      case BinType.Orange:
        colorStyle = styles.orangeBin;
        break;
      case BinType.BLACK:
        colorStyle = styles.blackBin;
        break;
      default:
        colorStyle = {}; // Default style if bin type not found
    }

    return (
      <>
        <Text
          style={{
            fontSize: 14,
            color: "#808080",
            marginTop: 10,
            fontWeight: "400",
          }}>
          Place in:
        </Text>
        <Text style={[styles.bottomSheetBinTitle, colorStyle]}>
          {binType} Bin
        </Text>
        <View
          style={{
            borderBottomColor: "#D9D9D9",
            borderBottomWidth: 2,
            marginVertical: 15,
          }}
        />
      </>
    );
  };

  const BottomSheet = ({ isVisible, onClose, prediction }) => {
    const classification = Object.keys(prediction)[0];

    const { binType, recyclability } =
      retrieveBinAndRecyclability(classification);

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={isVisible}
        onRequestClose={onClose}>
        <TouchableOpacity activeOpacity={1} style={styles.modalOverlay}>
          <View style={styles.bottomSheet}>
            <Text style={styles.bottomSheetTitle}>
              {recyclability}{" "}
              <Text
                style={{
                  fontWeight: "500",
                  textTransform: "capitalize",
                  color: "#565656",
                  fontSize: 14,
                }}>
                ({classification})
              </Text>
            </Text>
            <BinTitle binType={binType} />
            <Text style={styles.bottomSheetBinDescription}>
              {getBinDescription(binType)}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Dismiss</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    );
  };

  // Define enum for bin types
  const BinType = {
    BLUE: "blue",
    GREEN: "green",
    Orange: "orange",
    BLACK: "black",
  };

  // Define enum for recyclability
  const Recyclability = {
    RECYCLABLE: "Recyclable",
    NON_RECYCLABLE: "Non Recyclable",
  };

  // Define dictionary with bin types, recyclability, and corresponding items
  const binItems = {
    [BinType.BLUE]: {
      items: ["paper", "cardboard"],
      recyclability: Recyclability.RECYCLABLE,
    },
    [BinType.GREEN]: {
      items: ["plastic", "metal"],
      recyclability: Recyclability.RECYCLABLE,
    },
    [BinType.Orange]: {
      items: ["organics"],
      recyclability: Recyclability.RECYCLABLE,
    },
    [BinType.BLACK]: {
      items: ["trash"],
      recyclability: Recyclability.NON_RECYCLABLE,
    },
  };

  // Function to retrieve bin type and recyclability for an item
  // return type: { binType: "blue", recyclability: "recyclable" }
  const retrieveBinAndRecyclability = (item) => {
    for (const binType in binItems) {
      if (binItems[binType].items.includes(item.toLowerCase())) {
        return { binType, recyclability: binItems[binType].recyclability };
      }
    }
    return { binType: null, recyclability: null }; // Return null if item not classified
  };

  const getBinDescription = (binType) => {
    switch (binType) {
      case "blue":
        return (
          <>
            <Text style={{ width: "100%", lineHeight: 25 }}>
              Blue Bin is designated for recyclable waste.{"\n"}Items that are
              commonly placed in blue bins are:{"\n"}
            </Text>
            <View>
              {[
                "Paper",
                "Cardboard",
                "Glass bottles and jars",
                "Milk and juice cartons",
              ].map((item, index) => (
                <View style={{ marginTop: 10 }} key={index}>
                  <Text key={index}>{`\u2043 ${item}`}</Text>
                </View>
              ))}
            </View>
          </>
        );
      case "green":
        return (
          <>
            <Text>
              Green Bin is designated for items that can be recycled. {"\n"}
              {"\n"}This includes:{"\n"}
            </Text>
            <View>
              {[
                "Metal cans and foil",
                "Plastic containers with recycling symbols #1 to #7",
                "Plastic bottles with recycling symbols #1 to #7",
              ].map((item, index) => (
                <View style={{ marginTop: 10 }} key={index}>
                  <Text key={index}>{`\u2043 ${item}`}</Text>
                </View>
              ))}
            </View>
          </>
        );
      case "orange":
        return (
          <>
            <Text>
              Orange Bin is designated for organic waste or compostable
              materials. {"\n"}
              {"\n"}This includes:{"\n"}
            </Text>
            <View>
              {["Organics", "Leaves", "Small branches", "Grass clippings"].map(
                (item, index) => (
                  <View style={{ marginTop: 10 }} key={index}>
                    <Text key={index}>{`\u2043 ${item}`}</Text>
                  </View>
                )
              )}
            </View>
          </>
        );
      case "black":
        return (
          <>
            <Text style={{ width: "100%" }}>
              Black Bin is designated for non recyclable waste.{"\n"}
              {"\n"}Items that are commonly placed in black bins are:{"\n"}
            </Text>
            <View>
              {[
                "Food scraps",
                "Diapers, sanitary products",
                "Broken household items that can't be recycled",
                "Polystyrene foam",
              ].map((item, index) => (
                <View style={{ marginTop: 10 }} key={index}>
                  <Text
                    key={index}
                    style={{ textTransform: "capitalize", width: "100%" }}>
                    {`\u2043 ${item}`}
                  </Text>
                </View>
              ))}
            </View>
          </>
        );
      default:
        return <Text>Bin type not recognized.</Text>;
    }
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
              {!isPreview ? <CaptureControl /> : <ConfirmationPhase />}
              {isLoading && <Loading />}
              {prediction && (
                <BottomSheet
                  isVisible={bottomSheetVisible}
                  onClose={closeBottomSheet}
                  prediction={prediction}
                />
              )}
            </View>
          </Camera>
        </>
      ) : !permission.granted ? (
        <RenderRequestPermission />
      ) : (
        <Loading />
      )}
    </View>
  );
}
