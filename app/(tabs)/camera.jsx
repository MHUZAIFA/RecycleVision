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
  Modal,
  StyleSheet
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
  const buttonOpacity = new Animated.Value(1);
  const buttonColor = new Animated.Value(0);

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
        setPrediction(null);
        setError("No results found. Please try again.");
      }
      setBottomSheetVisible(true);
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
  const buttonColorInterpolation = buttonColor.interpolate({
    inputRange: [0, 1],
    outputRange: ["transparent", "#6342E8"],
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
        <ActivityIndicator size="large" color="#6342E8" />
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

  const [bottomSheetVisible, setBottomSheetVisible] = useState(false);

  const closeBottomSheet = async () => {
    setBottomSheetVisible(false);
    cancelPreview();
  };

  const styles = StyleSheet.create({
    container: {
      // flex: 1,
      // justifyContent: 'center',
      // alignItems: 'center',
      // backgroundColor: 'red',
    },
    modalOverlay: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    bottomSheet: {
      backgroundColor: '#ffffff',
      padding: 20,
      paddingVertical: 20,
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

      maxHeight: '90%',

    },
    bottomSheetTitle: {
      fontSize: 20,
      fontWeight: 'bold',
    },
    bottomSheetDescription: {
      fontSize: 15,
      marginTop: 10,
    },
    bottomSheetRecommendation: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#6342E8',
      marginTop: 10,
      textTransform: 'capitalize'
    },
    bottomSuggestedBinTitle: {
      fontSize: 17,
      fontWeight: '500',
      marginTop: 10,
    },
    bottomSheetBinDescription: {
      fontSize: 15,
      marginTop: 10,
    },
    closeButton: {
      marginTop: 20,
      backgroundColor: '#6342E8',
      alignSelf: 'center',
      width: '100%',
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
      color: 'white',
      fontSize: 15,
      alignSelf: 'center'
    },
    bottomSheetBinTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      marginTop: 10,
      textTransform: 'capitalize'
  },
  blueBin: {
      color: '#0077c8'
  },
  greenBin: {
      color: '#228B22'
  },
  brownBin: {
      color: 'brown'
  },
  blackBin: {
      color: 'black'
  }
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
      case BinType.BROWN:
          colorStyle = styles.brownBin;
          break;
      case BinType.BLACK:
          colorStyle = styles.blackBin;
          break;
      default:
          colorStyle = {}; // Default style if bin type not found
  }

  return (
      <Text style={[styles.bottomSheetBinTitle, colorStyle]}>
          {binType} Bin
      </Text>
  );
};

  const BottomSheet = ({ isVisible, onClose, prediction }) => {
    const classification = Object.keys(prediction)[0];
    const confidence = prediction[classification];

    const {binType, recyclability} = retrieveBinAndRecyclability(classification);
    console.log(binType);
    console.log(recyclability);
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={isVisible}
        onRequestClose={onClose}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={styles.modalOverlay}
        >
          <View style={styles.bottomSheet}>
            <Text style={styles.bottomSheetTitle}>
              {recyclability}
            </Text>
            <Text style={styles.bottomSheetDescription}>
            The item has been identified as belonging to the classification of type {classification}.
            </Text>
            <Text style={styles.bottomSuggestedBinTitle}>
              The suggested bin is:
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

  const Prediction = ({ prediction }) => {
    const classification = Object.keys(prediction)[0];
    const confidence = prediction[classification];

    const binType = retrieveBinAndRecyclability(classification);
    console.log(binType);


    return (
      <View
        className="absolute top-1/2 left-0 right-0 h-24 -mt-6 flex
                  items-center justify-center bg-black bg-opacity-50 px-4">
        <Text className="text-white font-bold text-2xl">
          {classification} - {confidence}%
        </Text>
      </View>
    );
  };

  // Define enum for bin types
  const BinType = {
    BLUE: 'blue',
    GREEN: 'green',
    BROWN: 'brown',
    BLACK: 'black'
  };

  // Define enum for recyclability
  const Recyclability = {
    RECYCLABLE: 'Recyclable',
    NON_RECYCLABLE: 'Non Recyclable'
  };

  // Define dictionary with bin types, recyclability, and corresponding items
  const binItems = {
    [BinType.BLUE]: {
      items: ['paper', 'cardboard'],
      recyclability: Recyclability.RECYCLABLE
    },
    [BinType.GREEN]: {
      items: ['plastic', 'metal'],
      recyclability: Recyclability.RECYCLABLE
    },
    [BinType.BROWN]: {
      items: ['organics'],
      recyclability: Recyclability.RECYCLABLE
    },
    [BinType.BLACK]: {
      items: ['trash'],
      recyclability: Recyclability.NON_RECYCLABLE
    }
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
  }

  const getBinDescription = (binType) => {
    switch (binType) {
      case 'blue':
        return "Blue Bin is typically used for recycling. Items such as paper, cardboard, plastic bottles, glass bottles, and aluminum cans are commonly placed in blue bins for recycling purposes. It's important to check local guidelines to know exactly what can and cannot be recycled in your area.";
      case 'green':
        return "Green Bin is often designated for organic waste or compostable materials. This includes food scraps, yard waste (like grass clippings and leaves), and other biodegradable materials. Composting these items helps divert organic waste from landfills and can be used to create nutrient-rich soil amendments.";
      case 'brown':
        return "In some areas, the brown bin might be used for organic waste or garden waste similar to the green bin. However, in other places, it might be used for other specific types of waste, such as hazardous materials or electronics. Again, it's essential to check local regulations.";
      case 'black':
        return "Black Bin is typically used for general or residual waste that cannot be recycled or composted. This includes items like non-recyclable plastics, certain types of packaging, and other household waste that cannot be placed in the recycling or compost bins.";
      default:
        return 'Bin type not recognized.';
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
              {!isPreview ? (
                <CaptureControl />
              ) : (
                <ConfirmationPhase />
              )}
            </View>
          </Camera>
          {isLoading && <Loading />}
          {error && <Error error={error} />}
          {prediction && <View style={styles.container}>
            {/* <TouchableOpacity onPress={toggleBottomSheet}>
              <Text>Open Bottom Sheet</Text>
            </TouchableOpacity> */}
            <BottomSheet isVisible={bottomSheetVisible} onClose={closeBottomSheet} prediction={prediction} />
          </View>}
          {/* {prediction && <Prediction prediction={prediction} />} */}
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