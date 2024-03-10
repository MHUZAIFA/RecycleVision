import { Camera, CameraType } from "expo-camera";
import { SaveFormat, manipulateAsync } from "expo-image-manipulator";
import { useRef, useState } from "react";
import { Button, Pressable, StyleSheet, Text, View } from "react-native";

export default function CameraScreen() {
  const [type, setType] = useState(CameraType.back);
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const [detectedLabel, setDetectedLabel] = useState(null);
  const [confidence, setConfidence] = useState(null);
  const cameraRef = useRef(null);

  if (!permission) {
    return <View />;
  }
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: "center" }}>
          We need your permission to show the camera
        </Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  function toggleCameraType() {
    setType((current) =>
      current === CameraType.back ? CameraType.front : CameraType.back
    );
  }

  const detectImage = async () => {
    if (cameraRef.current) {
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
      label && setDetectedLabel(label);
      score && setConfidence(Math.round(score.toFixed(2) * 100));
    } catch (e) {
      console.log("Failed", e);
    }
  };

  setTimeout(() => {
    setDetectedLabel(null);
    setConfidence(null);
  }, 5000);

  return (
    <View style={styles.container}>
      <Camera
        style={styles.camera}
        type={type}
        autoFocus={Camera.Constants.AutoFocus.on}
        ref={cameraRef}>
        <View style={styles.buttonContainer}>
          <Pressable style={styles.button} onPress={toggleCameraType}>
            <Text style={styles.text}>Flip Camera</Text>
          </Pressable>
          <Pressable style={styles.button} onPress={detectImage}>
            <Text style={styles.text}>Take Picture</Text>
          </Pressable>
        </View>
      </Camera>
      {detectedLabel && confidence && (
        <View style={styles.resultContainer}>
          <Text style={styles.text}>
            {detectedLabel} - {confidence}%
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "transparent",
    margin: 64,
    justifyContent: "space-between",
  },
  button: {
    flex: 1,
    alignSelf: "flex-end",
    alignItems: "center",
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  resultContainer: {
    position: "absolute",
    top: "50%",
    left: 0,
    right: 0,
    height: 50,
    marginTop: -25,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 16,
  },
});
