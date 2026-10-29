import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.ashutoshgautam.stillhere",
  appName: "Still Here",
  webDir: "out",
  backgroundColor: "#0f0e0c",
  android: {
    backgroundColor: "#0f0e0c",
    allowMixedContent: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
      launchAutoHide: true,
      backgroundColor: "#0f0e0c",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
    },
    StatusBar: { style: "DARK", backgroundColor: "#0f0e0c", overlaysWebView: false },
    Keyboard: { resize: "body" },
  },
};

export default config;
