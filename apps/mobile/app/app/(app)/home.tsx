import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { useProtocols, useDeleteProtocol } from "../../lib/hooks/useProtocols";
import { useAllLogs } from "../../lib/hooks/useAllLogs";
import { useAuthStore } from "../../lib/stores/auth.store";

export default function Home() {
  const router = useRouter();
  const { signOut } = useAuthStore();
  const { data: protocols, isLoading } = useProtocols();
  const { data: allLogs } = useAllLogs();
  const { mutate: deleteProtocol } = useDeleteProtocol();

  const activeProtocols = protocols?.filter((p) => p.isActive) ?? [];
  const inactiveProtocols = protocols?.filter((p) => !p.isActive) ?? [];

  // Total de doses nos últimos 7 dias
  const last7Days =
    allLogs?.filter((log) => {
      const diff = Date.now() - new Date(log.loggedAt).getTime();
      return diff <= 7 * 24 * 60 * 60 * 1000;
    }).length ?? 0;

  function confirmDelete(id: string) {
    Alert.alert("Deletar", "Tem certeza?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Deletar",
        style: "destructive",
        onPress: () => deleteProtocol(id),
      },
    ]);
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#000" }}
      contentContainerStyle={{
        padding: 20,
        paddingTop: 52,
        paddingBottom: 100,
      }}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <Text style={{ color: "#fff", fontSize: 24, fontWeight: "bold" }}>
          Dashboard
        </Text>
        <TouchableOpacity onPress={signOut}>
          <Text style={{ color: "#ef4444" }}>Sair</Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={{ flexDirection: "row", gap: 12, marginBottom: 28 }}>
        <StatCard
          label="Ativos"
          value={String(activeProtocols.length)}
          color="#6366f1"
        />
        <StatCard
          label="Doses (7d)"
          value={String(last7Days)}
          color="#10b981"
        />
        <StatCard
          label="Total"
          value={String(protocols?.length ?? 0)}
          color="#f59e0b"
        />
      </View>

      {isLoading ? (
        <ActivityIndicator color="#6366f1" />
      ) : (
        <>
          {/* Protocolos ativos */}
          {activeProtocols.length > 0 && (
            <>
              <Text
                style={{
                  color: "#999",
                  fontSize: 13,
                  fontWeight: "600",
                  marginBottom: 10,
                  letterSpacing: 1,
                }}
              >
                ATIVOS
              </Text>
              {activeProtocols.map((item) => (
                <ProtocolCard
                  key={item.id}
                  item={item}
                  onPress={() => router.push(`/(app)/protocols/${item.id}`)}
                  onDelete={() => confirmDelete(item.id)}
                />
              ))}
            </>
          )}

          {/* Protocolos inativos */}
          {inactiveProtocols.length > 0 && (
            <>
              <Text
                style={{
                  color: "#999",
                  fontSize: 13,
                  fontWeight: "600",
                  marginBottom: 10,
                  marginTop: 20,
                  letterSpacing: 1,
                }}
              >
                INATIVOS
              </Text>
              {inactiveProtocols.map((item) => (
                <ProtocolCard
                  key={item.id}
                  item={item}
                  onPress={() => router.push(`/(app)/protocols/${item.id}`)}
                  onDelete={() => confirmDelete(item.id)}
                />
              ))}
            </>
          )}

          {protocols?.length === 0 && (
            <Text style={{ color: "#666", textAlign: "center", marginTop: 40 }}>
              Nenhum protocolo cadastrado
            </Text>
          )}
        </>
      )}

      {/* FAB */}
      <TouchableOpacity
        onPress={() => router.push("/(app)/protocols/new")}
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
          shadowColor: "#6366f1",
          shadowOpacity: 0.5,
          shadowRadius: 12,
          elevation: 8,
        }}
      >
        <Text style={{ color: "#fff", fontSize: 28, lineHeight: 32 }}>+</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#111",
        borderRadius: 12,
        padding: 16,
        alignItems: "center",
        borderTopWidth: 3,
        borderTopColor: color,
      }}
    >
      <Text style={{ color, fontSize: 28, fontWeight: "bold" }}>{value}</Text>
      <Text style={{ color: "#666", fontSize: 12, marginTop: 4 }}>{label}</Text>
    </View>
  );
}

function ProtocolCard({ item, onPress, onDelete }: any) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: "#111",
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderLeftWidth: 4,
        borderLeftColor: item.isActive ? "#6366f1" : "#333",
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}>
          {item.peptideName}
        </Text>
        <View
          style={{
            backgroundColor: item.isActive ? "#6366f120" : "#33333340",
            paddingHorizontal: 8,
            paddingVertical: 2,
            borderRadius: 99,
          }}
        >
          <Text
            style={{ color: item.isActive ? "#6366f1" : "#555", fontSize: 12 }}
          >
            {item.isActive ? "Ativo" : "Inativo"}
          </Text>
        </View>
      </View>
      <Text style={{ color: "#666", marginTop: 6, fontSize: 13 }}>
        {item.dosageMcg} mcg · {item.frequency} · {item.route}
      </Text>
      <Text style={{ color: "#444", marginTop: 4, fontSize: 12 }}>
        Início: {new Date(item.startDate).toLocaleDateString("pt-BR")}
      </Text>
      <TouchableOpacity
        onPress={onDelete}
        style={{ marginTop: 10, alignSelf: "flex-end" }}
      >
        <Text style={{ color: "#ef4444", fontSize: 12 }}>Deletar</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}
