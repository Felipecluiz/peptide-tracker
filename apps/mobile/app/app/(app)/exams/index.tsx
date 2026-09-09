import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  FlatList,
  StyleSheet,
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
    <View style={styles.screen}>
      <FlatList
        data={exams ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        ListHeaderComponent={<Text style={styles.title}>Exames</Text>}
        ListEmptyComponent={
          isLoading ? (
            <Text style={styles.empty}>Carregando...</Text>
          ) : (
            <Text style={styles.empty}>Nenhum exame cadastrado</Text>
          )
        }
        renderItem={({ item: exam }) => (
          <TouchableOpacity
            onPress={() => router.push(`/(app)/exams/${exam.id}`)}
            style={styles.card}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{exam.title}</Text>
              <Text style={styles.dateText}>
                {new Date(exam.examDate).toLocaleDateString("pt-BR")}
              </Text>
            </View>

            <View style={styles.chipsRow}>
              {exam.biomarkers.map((b) => (
                <View
                  key={b.id}
                  style={[styles.chip, { borderLeftColor: statusColor(b) }]}
                >
                  <Text style={styles.chipName}>{b.name}</Text>
                  <Text style={[styles.chipValue, { color: statusColor(b) }]}>
                    {b.value} {b.unit}
                  </Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              onPress={() => confirmDelete(exam.id)}
              style={styles.deleteButton}
            >
              <Text style={styles.deleteText}>Deletar</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity
        onPress={() => router.push("/(app)/exams/new")}
        style={styles.fab}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#000" },
  content: { padding: 20, paddingTop: 52, paddingBottom: 100 },
  title: { color: "#fff", fontSize: 24, fontWeight: "bold", marginBottom: 24 },
  empty: { color: "#666", textAlign: "center", marginTop: 60 },
  card: {
    backgroundColor: "#111",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitle: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    flex: 1,
    paddingRight: 10,
  },
  dateText: { color: "#666", fontSize: 12 },
  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 10 },
  chip: {
    backgroundColor: "#1a1a1a",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderLeftWidth: 3,
  },
  chipName: { color: "#ccc", fontSize: 11 },
  chipValue: { fontSize: 12, fontWeight: "bold" },
  deleteButton: { marginTop: 10, alignSelf: "flex-end" },
  deleteText: { color: "#ef4444", fontSize: 12 },
  fab: {
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
  },
  fabText: { color: "#fff", fontSize: 28, lineHeight: 32 },
});
