import { Stack } from "expo-router";
import { NativeWindStyleSheet } from "nativewind";

NativeWindStyleSheet.setOutput({
  default: "native",
});

export default function AppLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        // Enabling Status Bar Translucency on Android
        // statusBarTranslucent: Platform.OS === "android" ? false : undefined,
        // statusBarStyle: Platform.OS === "android" ? "dark" : undefined,
      }}>
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
