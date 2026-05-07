import { ExpoConfig } from "expo/config";

const config: ExpoConfig = {
  name: "peptide-tracker",
  slug: "peptide-tracker",
  version: "1.0.0",
  scheme: "peptidetracker",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "light",
  newArchEnabled: true,
  splash: {
    image: "./assets/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff",
  },
  ios: {
    supportsTablet: true,
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#ffffff",
    },
  },
  web: {
    bundler: "metro",
    favicon: "./assets/favicon.png",
  },
  plugins: ["expo-router", "expo-secure-store"],
  extra: {
    apiUrl: process.env.API_URL ?? "http://localhost:3333",
  },
};

export default config;
