import { create } from "zustand";
import * as SecureStore from "expo-secure-store";

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
    const token = await SecureStore.getItemAsync("token");
    set({ token, isAuthenticated: !!token });
  },

  signIn: async (token: string) => {
    await SecureStore.setItemAsync("token", token);
    set({ token, isAuthenticated: true });
  },

  signOut: async () => {
    await SecureStore.deleteItemAsync("token");
    set({ token: null, isAuthenticated: false });
  },
}));
