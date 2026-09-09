import { create } from "zustand";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

async function getToken(key: string) {
  if (Platform.OS === "web") {
    return localStorage.getItem(key);
  }
  return SecureStore.getItemAsync(key);
}

async function setToken(key: string, value: string) {
  if (Platform.OS === "web") {
    localStorage.setItem(key, value);
    return;
  }
  return SecureStore.setItemAsync(key, value);
}

async function deleteToken(key: string) {
  if (Platform.OS === "web") {
    localStorage.removeItem(key);
    return;
  }
  return SecureStore.deleteItemAsync(key);
}

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  signIn: (token: string) => Promise<void>;
  signOut: () => Promise<void>;
  loadToken: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  isAuthenticated: false,

  loadToken: async () => {
    const token = await getToken("token");
    set({ token, isAuthenticated: !!token });
  },

  signIn: async (token: string) => {
    await setToken("token", token);
    set({ token, isAuthenticated: true });
  },

  signOut: async () => {
    await deleteToken("token");
    set({ token: null, isAuthenticated: false });
  },
}));
