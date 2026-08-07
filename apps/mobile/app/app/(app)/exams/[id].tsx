import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useExam } from "../../../lib/hooks/useExams";
import BiomarkerChart from "../../components/BiomarkerChart";
function statusColor(value: number, refMin?: number, refMax?: number) {
  if (refMin == null || refMax == null) return "#666";
  if (value < refMin) return "#f59e0b";
  if (value > refMax) return "#ef4444";
  return "#10b981";
}

function statusLabel(value: number, refMin?: number, refMax?: number) {
  if (refMin == null || refMax == null) return "—";
  if (value < refMin) return "Abaixo";
  if (value > refMax) return "Acima";
  return "Normal";
}

export default function ExamDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: exam, isLoading } = useExam(id);
  const [selectedBiomarker, setSelectedBiomarker] = useState<string | null>(
    null,
  );

  if (isLoading)
    return (
      <ActivityIndicator
        color="#6366f1"
        style={{ flex: 1, backgroundColor: "#000" }}
      />
    );
  if (!exam) return null;

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

      <Text style={{ color: "#fff", fontSize: 22, fontWeight: "bold" }}>
        {exam.title}
      </Text>
      <Text style={{ color: "#666", marginTop: 4, marginBottom: 24 }}>
        {new Date(exam.examDate).toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })}
      </Text>

      {exam.notes && (
        <View
          style={{
            backgroundColor: "#111",
            borderRadius: 10,
            padding: 14,
            marginBottom: 20,
          }}
        >
          <Text style={{ color: "#999" }}>{exam.notes}</Text>
        </View>
      )}

      {/* Biomarcadores */}
      <Text
        style={{
          color: "#999",
          fontSize: 13,
          fontWeight: "600",
          letterSpacing: 1,
          marginBottom: 12,
        }}
      >
        BIOMARCADORES
      </Text>

      {exam.biomarkers.map((b) => {
        const color = statusColor(b.value, b.refMin, b.refMax);
        const label = statusLabel(b.value, b.refMin, b.refMax);
        const pct =
          b.refMin != null && b.refMax != null
            ? Math.min(
                Math.max(
                  ((b.value - b.refMin) / (b.refMax - b.refMin)) * 100,
                  0,
                ),
                100,
              )
            : null;

        return (
          <TouchableOpacity
            key={b.id}
            onPress={() =>
              setSelectedBiomarker(selectedBiomarker === b.name ? null : b.name)
            }
            style={{
              backgroundColor: "#111",
              borderRadius: 12,
              padding: 16,
              marginBottom: 10,
              borderLeftWidth: 4,
              borderLeftColor: color,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>
                {b.name}
              </Text>
              <View
                style={{
                  backgroundColor: color + "20",
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  borderRadius: 99,
                }}
              >
                <Text style={{ color, fontSize: 12 }}>{label}</Text>
              </View>
            </View>
            <Text
              style={{ color, fontSize: 22, fontWeight: "bold", marginTop: 4 }}
            >
              {b.value}{" "}
              <Text style={{ fontSize: 14, color: "#666" }}>{b.unit}</Text>
            </Text>
            {b.refMin != null && b.refMax != null && (
              <Text style={{ color: "#555", fontSize: 11, marginTop: 2 }}>
                Referência: {b.refMin} – {b.refMax} {b.unit}
              </Text>
            )}
            {pct != null && (
              <View
                style={{
                  backgroundColor: "#1a1a1a",
                  borderRadius: 4,
                  height: 4,
                  marginTop: 10,
                }}
              >
                <View
                  style={{
                    backgroundColor: color,
                    borderRadius: 4,
                    height: 4,
                    width: `${pct}%`,
                  }}
                />
              </View>
            )}

            {/* Gráfico de evolução */}
            {selectedBiomarker === b.name && (
              <BiomarkerChart name={b.name} unit={b.unit} />
            )}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}
