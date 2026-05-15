import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  useProtocol,
  useLogs,
  useCreateLog,
  useDeleteLog,
} from "../../../lib/hooks/useProtocols";

export default function ProtocolDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const { data: protocol, isLoading } = useProtocol(id);
  const { data: logs } = useLogs(id);
  const { mutate: createLog, isPending } = useCreateLog(id);
  const { mutate: deleteLog } = useDeleteLog(id);

  const [doseTaken, setDoseTaken] = useState("");
  const [logNotes, setLogNotes] = useState("");

  function handleAddLog() {
    if (!doseTaken) return;
    createLog(
      { doseTaken: parseFloat(doseTaken), notes: logNotes || undefined },
      {
        onSuccess: () => {
          setDoseTaken("");
          setLogNotes("");
        },
        onError: () => Alert.alert("Erro", "Não foi possível registrar a dose"),
      },
    );
  }

  function confirmDeleteLog(logId: string) {
    Alert.alert("Deletar log", "Remover este registro?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Deletar",
        style: "destructive",
        onPress: () => deleteLog(logId),
      },
    ]);
  }

  if (isLoading)
    return (
      <ActivityIndicator
        color="#6366f1"
        style={{ flex: 1, backgroundColor: "#000" }}
      />
    );
  if (!protocol) return null;

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

      {/* Info do protocolo */}
      <View
        style={{
          backgroundColor: "#111",
          borderRadius: 12,
          padding: 16,
          marginBottom: 24,
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
          <Text style={{ color: "#fff", fontSize: 20, fontWeight: "bold" }}>
            {protocol.peptideName}
          </Text>
          <Text style={{ color: protocol.isActive ? "#6366f1" : "#666" }}>
            {protocol.isActive ? "Ativo" : "Inativo"}
          </Text>
        </View>
        <Row label="Dosagem" value={`${protocol.dosageMcg} mcg`} />
        <Row label="Frequência" value={protocol.frequency} />
        <Row label="Via" value={protocol.route} />
        <Row
          label="Início"
          value={new Date(protocol.startDate).toLocaleDateString("pt-BR")}
        />
        {protocol.endDate && (
          <Row
            label="Término"
            value={new Date(protocol.endDate).toLocaleDateString("pt-BR")}
          />
        )}
        {protocol.notes && <Row label="Notas" value={protocol.notes} />}
      </View>

      {/* Registrar dose */}
      <Text
        style={{
          color: "#fff",
          fontSize: 18,
          fontWeight: "bold",
          marginBottom: 12,
        }}
      >
        Registrar dose
      </Text>
      <TextInput
        placeholder="Dose tomada (mcg)"
        placeholderTextColor="#444"
        value={doseTaken}
        onChangeText={setDoseTaken}
        keyboardType="numeric"
        style={{
          backgroundColor: "#111",
          color: "#fff",
          borderRadius: 8,
          padding: 14,
          marginBottom: 10,
        }}
      />
      <TextInput
        placeholder="Observação (opcional)"
        placeholderTextColor="#444"
        value={logNotes}
        onChangeText={setLogNotes}
        style={{
          backgroundColor: "#111",
          color: "#fff",
          borderRadius: 8,
          padding: 14,
          marginBottom: 12,
        }}
      />
      <TouchableOpacity
        onPress={handleAddLog}
        disabled={isPending}
        style={{
          backgroundColor: isPending ? "#444" : "#6366f1",
          borderRadius: 8,
          padding: 14,
          alignItems: "center",
          marginBottom: 28,
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "bold" }}>
          {isPending ? "Registrando..." : "Registrar"}
        </Text>
      </TouchableOpacity>

      {/* Histórico */}
      <Text
        style={{
          color: "#fff",
          fontSize: 18,
          fontWeight: "bold",
          marginBottom: 12,
        }}
      >
        Histórico
      </Text>
      {logs?.length === 0 && (
        <Text style={{ color: "#666", textAlign: "center", marginTop: 12 }}>
          Nenhuma dose registrada
        </Text>
      )}
      {logs?.map((log) => (
        <View
          key={log.id}
          style={{
            backgroundColor: "#111",
            borderRadius: 10,
            padding: 14,
            marginBottom: 10,
          }}
        >
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Text style={{ color: "#fff", fontWeight: "bold" }}>
              {log.doseTaken} mcg
            </Text>
            <Text style={{ color: "#666", fontSize: 12 }}>
              {new Date(log.loggedAt).toLocaleString("pt-BR")}
            </Text>
          </View>
          {log.notes && (
            <Text style={{ color: "#999", marginTop: 4 }}>{log.notes}</Text>
          )}
          <TouchableOpacity
            onPress={() => confirmDeleteLog(log.id)}
            style={{ marginTop: 8, alignSelf: "flex-end" }}
          >
            <Text style={{ color: "#ef4444", fontSize: 12 }}>Remover</Text>
          </TouchableOpacity>
        </View>
      ))}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 4,
      }}
    >
      <Text style={{ color: "#666" }}>{label}</Text>
      <Text style={{ color: "#ccc" }}>{value}</Text>
    </View>
  );
}
