import { Camera, CameraType } from "expo-camera";
import { useRef, useState } from "react";
import { Button, Pressable, StyleSheet, Text, View } from "react-native";

export default function CameraScreen() {
  const [type, setType] = useState(CameraType.back);
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const cameraRef = useRef(null);

  const takePicture = async () => {
    if (cameraRef.current) {
      const result = await cameraRef.current.takePictureAsync({
        aspect: [4, 3],
        allowsEditing: true,
        quality: 1,
        base64: true,
        fixOrientation: true,
        exif: true,
      });
      const data = createFormData(result.uri);
      sendImageToModel(data);
    }
  };

  const createFormData = (uri) => {
    const fileName = uri.split("/").pop();
    const fileType = fileName.split(".").pop();
    const formData = new FormData();
    formData.append("file", {
      uri,
      name: fileName,
      type: `image/${fileType}`,
    });

    return formData;
  };

  const sendImageToModel = async (image) => {
    await fetch(
      "https://api-inference.huggingface.co/models/plsakr/vit-garbage-classification-v2",
      {
        headers: {
          Authorization: "Bearer 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",
          Accept: "application/json",
        },
        method: "POST",
        body: image,
      }
    )
      .then((response) => {
        console.log(response, "RESPONSE");
      })
      .then((result) => {
        console.log(result, "RESULT");
      })
      .catch((error) => {
        console.log(error, "ERROR");
      });
  };

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

  return (
    <View style={styles.container}>
      <Camera style={styles.camera} type={type} ref={cameraRef}>
        <View style={styles.buttonContainer}>
          <Pressable style={styles.button} onPress={toggleCameraType}>
            <Text style={styles.text}>Flip Camera</Text>
          </Pressable>
          <Pressable style={styles.button} onPress={takePicture}>
            <Text style={styles.text}>Take Picture</Text>
          </Pressable>
        </View>
      </Camera>
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
});
