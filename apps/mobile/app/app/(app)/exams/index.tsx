import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useExams, useDeleteExam } from "../../../lib/hooks/useExams";

function statusColor(b: { value: number; refMin?: number; refMax?: number }) {
  if (b.refMin == null || b.refMax == null) return "#666";
  if (b.value < b.refMin) return "#f59e0b";
  if (b.value > b.refMax) return "#ef4444";
  return "#10b981";
}

export default function ExamsScreen() {
  const router = useRouter();
  const { data: exams, isLoading } = useExams();
  const { mutate: deleteExam } = useDeleteExam();

  function confirmDelete(id: string) {
    Alert.alert("Deletar exame", "Tem certeza?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Deletar", style: "destructive", onPress: () => deleteExam(id) },
    ]);
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <ScrollView
        contentContainerStyle={{
          padding: 20,
          paddingTop: 52,
          paddingBottom: 100,
        }}
      >
        <Text
          style={{
            color: "#fff",
            fontSize: 24,
            fontWeight: "bold",
            marginBottom: 24,
          }}
        >
          Exames
        </Text>

        {isLoading ? (
          <ActivityIndicator color="#6366f1" />
        ) : exams?.length === 0 ? (
          <Text style={{ color: "#666", textAlign: "center", marginTop: 60 }}>
            Nenhum exame cadastrado
          </Text>
        ) : (
          exams?.map((exam) => (
            <TouchableOpacity
              key={exam.id}
              onPress={() => router.push(`/(app)/exams/${exam.id}`)}
              style={{
                backgroundColor: "#111",
                borderRadius: 12,
                padding: 16,
                marginBottom: 12,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}
                >
                  {exam.title}
                </Text>
                <Text style={{ color: "#666", fontSize: 12 }}>
                  {new Date(exam.examDate).toLocaleDateString("pt-BR")}
                </Text>
              </View>

              {/* Biomarcadores resumo */}
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: 6,
                  marginTop: 10,
                }}
              >
                {exam.biomarkers.map((b) => (
                  <View
                    key={b.id}
                    style={{
                      backgroundColor: "#1a1a1a",
                      borderRadius: 6,
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderLeftWidth: 3,
                      borderLeftColor: statusColor(b),
                    }}
                  >
                    <Text style={{ color: "#ccc", fontSize: 11 }}>
                      {b.name}
                    </Text>
                    <Text
                      style={{
                        color: statusColor(b),
                        fontSize: 12,
                        fontWeight: "bold",
                      }}
                    >
                      {b.value} {b.unit}
                    </Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity
                onPress={() => confirmDelete(exam.id)}
                style={{ marginTop: 10, alignSelf: "flex-end" }}
              >
                <Text style={{ color: "#ef4444", fontSize: 12 }}>Deletar</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        onPress={() => router.push("/(app)/exams/new")}
        style={{
          position: "absolute",
          bottom: 96,
          right: 24,
          backgroundColor: "#6366f1",
          width: 56,
          height: 56,
          borderRadius: 28,
          alignItems: "center",
          justifyContent: "center",
          elevation: 8,
        }}
      >
        <Text style={{ color: "#fff", fontSize: 28, lineHeight: 32 }}>+</Text>
      </TouchableOpacity>
    </View>
  );
}
