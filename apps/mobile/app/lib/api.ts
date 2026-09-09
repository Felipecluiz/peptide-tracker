import axios from "axios";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";

async function getToken(key: string) {
  if (Platform.OS === "web") {
    return localStorage.getItem(key);
  }
  return SecureStore.getItemAsync(key);
}

export const api = axios.create({
  baseURL: Constants.expoConfig?.extra?.apiUrl,
});

api.interceptors.request.use(async (config) => {
  const token = await getToken("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
