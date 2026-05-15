import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useCreateProtocol } from "../../../lib/hooks/useProtocols";

const FREQUENCIES = ["Diária", "Semanal", "A cada 2 dias", "2x ao dia"];
const ROUTES = ["Subcutânea", "Intramuscular", "Oral", "Nasal"];

export default function NewProtocol() {
  const router = useRouter();
  const { mutate: createProtocol, isPending } = useCreateProtocol();

  const [peptideName, setPeptideName] = useState("");
  const [dosageMcg, setDosageMcg] = useState("");
  const [frequency, setFrequency] = useState(FREQUENCIES[0]);
  const [route, setRoute] = useState(ROUTES[0]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [notes, setNotes] = useState("");

  function handleCreate() {
    if (!peptideName || !dosageMcg || !startDate) {
      Alert.alert("Atenção", "Preencha os campos obrigatórios");
      return;
    }

    createProtocol(
      {
        peptideName,
        dosageMcg: parseFloat(dosageMcg),
        frequency,
        route,
        startDate,
        endDate: endDate || undefined,
        notes: notes || undefined,
      },
      {
        onSuccess: () => router.back(),
        onError: () =>
          Alert.alert("Erro", "Não foi possível criar o protocolo"),
      },
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#000" }}
      contentContainerStyle={{ padding: 20, paddingTop: 52 }}
    >
      <TouchableOpacity
        onPress={() => router.back()}
        style={{ marginBottom: 16 }}
      >
        <Text style={{ color: "#6366f1" }}>← Voltar</Text>
      </TouchableOpacity>

      <Text
        style={{
          color: "#fff",
          fontSize: 22,
          fontWeight: "bold",
          marginBottom: 24,
        }}
      >
        Novo Protocolo
      </Text>

      <Label text="Peptídeo *" />
      <Input
        placeholder="Ex: BPC-157"
        value={peptideName}
        onChangeText={setPeptideName}
      />

      <Label text="Dosagem (mcg) *" />
      <Input
        placeholder="Ex: 250"
        value={dosageMcg}
        onChangeText={setDosageMcg}
        keyboardType="numeric"
      />

      <Label text="Frequência" />
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 8,
          marginBottom: 16,
        }}
      >
        {FREQUENCIES.map((f) => (
          <TouchableOpacity
            key={f}
            onPress={() => setFrequency(f)}
            style={{
              backgroundColor: frequency === f ? "#6366f1" : "#111",
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: frequency === f ? "#fff" : "#666" }}>
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Label text="Via de administração" />
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 8,
          marginBottom: 16,
        }}
      >
        {ROUTES.map((r) => (
          <TouchableOpacity
            key={r}
            onPress={() => setRoute(r)}
            style={{
              backgroundColor: route === r ? "#6366f1" : "#111",
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: route === r ? "#fff" : "#666" }}>{r}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Label text="Data de início * (YYYY-MM-DD)" />
      <Input
        placeholder="2026-05-09"
        value={startDate}
        onChangeText={setStartDate}
      />

      <Label text="Data de término (YYYY-MM-DD)" />
      <Input placeholder="Opcional" value={endDate} onChangeText={setEndDate} />

      <Label text="Observações" />
      <Input
        placeholder="Opcional"
        value={notes}
        onChangeText={setNotes}
        multiline
        numberOfLines={3}
      />

      <TouchableOpacity
        onPress={handleCreate}
        disabled={isPending}
        style={{
          backgroundColor: isPending ? "#444" : "#6366f1",
          borderRadius: 8,
          padding: 16,
          alignItems: "center",
          marginTop: 8,
          marginBottom: 40,
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>
          {isPending ? "Criando..." : "Criar Protocolo"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function Label({ text }: { text: string }) {
  return (
    <Text style={{ color: "#999", marginBottom: 6, fontSize: 13 }}>{text}</Text>
  );
}

function Input(props: React.ComponentProps<typeof TextInput>) {
  return (
    <TextInput
      placeholderTextColor="#444"
      {...props}
      style={{
        backgroundColor: "#111",
        color: "#fff",
        borderRadius: 8,
        padding: 14,
        marginBottom: 16,
        textAlignVertical: "top",
        ...(props.style as object),
      }}
    />
  );
}
