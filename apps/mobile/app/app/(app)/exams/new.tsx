import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useCreateExam, useExtractExam } from "../../../lib/hooks/useExams";

const COMMON_BIOMARKERS = [
  { name: "IGF-1", unit: "ng/mL", refMin: 115, refMax: 307 },
  { name: "GH", unit: "ng/mL", refMin: 0, refMax: 3 },
  { name: "CRP", unit: "mg/L", refMin: 0, refMax: 5 },
  { name: "Testosterona", unit: "ng/dL", refMin: 300, refMax: 1000 },
  { name: "Cortisol", unit: "µg/dL", refMin: 6, refMax: 23 },
  { name: "Insulina", unit: "µU/mL", refMin: 2, refMax: 25 },
];

interface BiomarkerInput {
  name: string;
  value: string;
  unit: string;
  refMin: string;
  refMax: string;
}

export default function NewExam() {
  const router = useRouter();
  const { mutate: createExam, isPending } = useCreateExam();
  const { mutate: extractExam, isPending: isExtracting } = useExtractExam();

  const [title, setTitle] = useState("");
  const [examDate, setExamDate] = useState("");
  const [notes, setNotes] = useState("");
  const [biomarkers, setBiomarkers] = useState<BiomarkerInput[]>([]);

  function addBiomarker(preset?: (typeof COMMON_BIOMARKERS)[0]) {
    setBiomarkers((prev) => [
      ...prev,
      {
        name: preset?.name ?? "",
        value: "",
        unit: preset?.unit ?? "",
        refMin: String(preset?.refMin ?? ""),
        refMax: String(preset?.refMax ?? ""),
      },
    ]);
  }

  function updateBiomarker(
    index: number,
    field: keyof BiomarkerInput,
    value: string,
  ) {
    setBiomarkers((prev) =>
      prev.map((b, i) => (i === index ? { ...b, [field]: value } : b)),
    );
  }

  function removeBiomarker(index: number) {
    setBiomarkers((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleScan() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permissão necessária",
        "Precisamos de acesso às fotos para escanear o exame.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      base64: true,
      quality: 0.7,
    });
    if (result.canceled || !result.assets?.[0]?.base64) return;

    const asset = result.assets[0];
    const mimeType =
      asset.mimeType ??
      (asset.uri.endsWith(".png") ? "image/png" : "image/jpeg");

    extractExam(
      { base64Image: asset.base64, mimeType },
      {
        onSuccess: (data) => {
          if (data.title) setTitle(data.title);
          if (data.examDate) setExamDate(data.examDate);

          if (data.biomarkers?.length) {
            setBiomarkers((prev) => [
              ...prev,
              ...data.biomarkers.map((b) => ({
                name: b.name,
                value: String(b.value),
                unit: b.unit,
                refMin: b.refMin != null ? String(b.refMin) : "",
                refMax: b.refMax != null ? String(b.refMax) : "",
              })),
            ]);
            Alert.alert(
              "Sucesso",
              `${data.biomarkers.length} biomarcador(es) identificado(s). Confira antes de salvar.`,
            );
          } else {
            Alert.alert(
              "Nada encontrado",
              "Não conseguimos identificar biomarcadores nessa imagem. Preencha manualmente.",
            );
          }
        },
        onError: () =>
          Alert.alert(
            "Erro",
            "Não foi possível processar a imagem. Tente novamente ou preencha manualmente.",
          ),
      },
    );
  }

  function handleCreate() {
    if (!title || !examDate) {
      Alert.alert("Atenção", "Preencha título e data");
      return;
    }

    createExam(
      {
        title,
        examDate,
        notes: notes || undefined,
        biomarkers: biomarkers
          .filter((b) => b.name && b.value)
          .map((b) => ({
            name: b.name,
            value: parseFloat(b.value),
            unit: b.unit,
            refMin: b.refMin ? parseFloat(b.refMin) : undefined,
            refMax: b.refMax ? parseFloat(b.refMax) : undefined,
          })),
      } as any,
      {
        onSuccess: () => router.back(),
        onError: () => Alert.alert("Erro", "Não foi possível salvar o exame"),
      },
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#000" }}
      contentContainerStyle={{ padding: 20, paddingTop: 52, paddingBottom: 60 }}
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
        Novo Exame
      </Text>

      {/* Escanear com IA */}
      <TouchableOpacity
        onPress={handleScan}
        disabled={isExtracting}
        style={{
          backgroundColor: isExtracting ? "#333" : "#1a1a1a",
          borderRadius: 10,
          padding: 16,
          alignItems: "center",
          borderWidth: 1,
          borderColor: "#6366f1",
          marginBottom: 24,
        }}
      >
        {isExtracting ? (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <ActivityIndicator color="#6366f1" />
            <Text style={{ color: "#6366f1" }}>Analisando imagem...</Text>
          </View>
        ) : (
          <Text style={{ color: "#6366f1", fontWeight: "bold" }}>
            📷 Escanear exame com IA
          </Text>
        )}
      </TouchableOpacity>

      <Label text="Título *" />
      <Input
        placeholder="Ex: Exame de sangue - Maio 2026"
        value={title}
        onChangeText={setTitle}
      />

      <Label text="Data do exame * (YYYY-MM-DD)" />
      <Input
        placeholder="2026-05-19"
        value={examDate}
        onChangeText={setExamDate}
      />

      <Label text="Observações" />
      <Input
        placeholder="Opcional"
        value={notes}
        onChangeText={setNotes}
        multiline
        numberOfLines={2}
      />

      {/* Biomarcadores comuns */}
      <Text
        style={{
          color: "#999",
          fontSize: 13,
          fontWeight: "600",
          letterSpacing: 1,
          marginBottom: 10,
          marginTop: 8,
        }}
      >
        ADICIONAR BIOMARCADOR COMUM
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginBottom: 16 }}
      >
        <View style={{ flexDirection: "row", gap: 8 }}>
          {COMMON_BIOMARKERS.map((b) => (
            <TouchableOpacity
              key={b.name}
              onPress={() => addBiomarker(b)}
              style={{
                backgroundColor: "#1a1a1a",
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderWidth: 1,
                borderColor: "#333",
              }}
            >
              <Text style={{ color: "#ccc", fontSize: 12 }}>{b.name}</Text>
              <Text style={{ color: "#555", fontSize: 10 }}>{b.unit}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Lista de biomarcadores */}
      {biomarkers.map((b, i) => (
        <View
          key={i}
          style={{
            backgroundColor: "#111",
            borderRadius: 10,
            padding: 14,
            marginBottom: 12,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "bold" }}>
              Biomarcador {i + 1}
            </Text>
            <TouchableOpacity onPress={() => removeBiomarker(i)}>
              <Text style={{ color: "#ef4444", fontSize: 12 }}>Remover</Text>
            </TouchableOpacity>
          </View>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <View style={{ flex: 2 }}>
              <Label text="Nome" />
              <Input
                placeholder="IGF-1"
                value={b.name}
                onChangeText={(v) => updateBiomarker(i, "name", v)}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Label text="Unidade" />
              <Input
                placeholder="ng/mL"
                value={b.unit}
                onChangeText={(v) => updateBiomarker(i, "unit", v)}
              />
            </View>
          </View>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <View style={{ flex: 1 }}>
              <Label text="Valor *" />
              <Input
                placeholder="150"
                value={b.value}
                onChangeText={(v) => updateBiomarker(i, "value", v)}
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Label text="Ref. mín" />
              <Input
                placeholder="115"
                value={b.refMin}
                onChangeText={(v) => updateBiomarker(i, "refMin", v)}
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Label text="Ref. máx" />
              <Input
                placeholder="307"
                value={b.refMax}
                onChangeText={(v) => updateBiomarker(i, "refMax", v)}
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>
      ))}

      <TouchableOpacity
        onPress={() => addBiomarker()}
        style={{
          borderWidth: 1,
          borderColor: "#333",
          borderRadius: 8,
          padding: 12,
          alignItems: "center",
          marginBottom: 20,
          borderStyle: "dashed",
        }}
      >
        <Text style={{ color: "#666" }}>
          + Adicionar biomarcador manualmente
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleCreate}
        disabled={isPending}
        style={{
          backgroundColor: isPending ? "#444" : "#6366f1",
          borderRadius: 8,
          padding: 16,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>
          {isPending ? "Salvando..." : "Salvar Exame"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function Label({ text }: { text: string }) {
  return (
    <Text style={{ color: "#999", marginBottom: 6, fontSize: 12 }}>{text}</Text>
  );
}

function Input(props: React.ComponentProps<typeof TextInput>) {
  return (
    <TextInput
      placeholderTextColor="#444"
      {...props}
      style={{
        backgroundColor: "#1a1a1a",
        color: "#fff",
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
        textAlignVertical: "top",
        ...(props.style as object),
      }}
    />
  );
}
