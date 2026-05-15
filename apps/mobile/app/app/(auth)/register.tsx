import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useAuthStore } from "../../lib/stores/auth.store";
import { api } from "../../lib/api";

export default function Register() {
  const { signIn } = useAuthStore();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleRegister() {
    try {
      const { data } = await api.post("/register", { name, email, password });
      await signIn(data.token);
    } catch {
      Alert.alert("Erro", "Não foi possível criar a conta");
    }
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#000",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <Text
        style={{
          color: "#fff",
          fontSize: 28,
          fontWeight: "bold",
          marginBottom: 32,
        }}
      >
        Criar conta
      </Text>

      <TextInput
        placeholder="Nome"
        placeholderTextColor="#666"
        value={name}
        onChangeText={setName}
        style={{
          width: "100%",
          backgroundColor: "#111",
          color: "#fff",
          borderRadius: 8,
          padding: 14,
          marginBottom: 12,
        }}
      />

      <TextInput
        placeholder="Email"
        placeholderTextColor="#666"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={{
          width: "100%",
          backgroundColor: "#111",
          color: "#fff",
          borderRadius: 8,
          padding: 14,
          marginBottom: 12,
        }}
      />

      <TextInput
        placeholder="Senha"
        placeholderTextColor="#666"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{
          width: "100%",
          backgroundColor: "#111",
          color: "#fff",
          borderRadius: 8,
          padding: 14,
          marginBottom: 24,
        }}
      />

      <TouchableOpacity
        onPress={handleRegister}
        style={{
          width: "100%",
          backgroundColor: "#6366f1",
          borderRadius: 8,
          padding: 16,
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>
          Cadastrar
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.back()}>
        <Text style={{ color: "#666" }}>
          Já tem conta? <Text style={{ color: "#6366f1" }}>Entrar</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}
