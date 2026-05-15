import { View, Text, FlatList, ActivityIndicator } from "react-native";
import { useAllLogs } from "../../lib/hooks/useAllLogs";

export default function History() {
  const { data: logs, isLoading, refetch } = useAllLogs();

  // Agrupa por data
  const grouped =
    logs?.reduce(
      (acc, log) => {
        const date = new Date(log.loggedAt).toLocaleDateString("pt-BR", {
          weekday: "long",
          day: "2-digit",
          month: "long",
        });
        if (!acc[date]) acc[date] = [];
        acc[date].push(log);
        return acc;
      },
      {} as Record<string, typeof logs>,
    ) ?? {};

  const sections = Object.entries(grouped);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#000",
        paddingTop: 52,
        paddingHorizontal: 20,
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
        Histórico
      </Text>

      {isLoading ? (
        <ActivityIndicator color="#6366f1" />
      ) : sections.length === 0 ? (
        <Text style={{ color: "#666", textAlign: "center", marginTop: 60 }}>
          Nenhuma dose registrada ainda
        </Text>
      ) : (
        <FlatList
          data={sections}
          keyExtractor={([date]) => date}
          onRefresh={refetch}
          refreshing={isLoading}
          contentContainerStyle={{ paddingBottom: 100 }}
          renderItem={({ item: [date, dayLogs] }) => (
            <View style={{ marginBottom: 24 }}>
              {/* Data */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 12,
                  gap: 10,
                }}
              >
                <View
                  style={{ flex: 1, height: 1, backgroundColor: "#1a1a1a" }}
                />
                <Text
                  style={{
                    color: "#666",
                    fontSize: 12,
                    textTransform: "capitalize",
                  }}
                >
                  {date}
                </Text>
                <View
                  style={{ flex: 1, height: 1, backgroundColor: "#1a1a1a" }}
                />
              </View>

              {/* Logs do dia */}
              {dayLogs!.map((log, index) => (
                <View
                  key={log.id}
                  style={{ flexDirection: "row", gap: 12, marginBottom: 8 }}
                >
                  {/* Timeline line */}
                  <View style={{ alignItems: "center", width: 20 }}>
                    <View
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 5,
                        backgroundColor: "#6366f1",
                        marginTop: 4,
                      }}
                    />
                    {index < dayLogs!.length - 1 && (
                      <View
                        style={{
                          width: 2,
                          flex: 1,
                          backgroundColor: "#1a1a1a",
                          marginTop: 4,
                        }}
                      />
                    )}
                  </View>

                  {/* Conteúdo */}
                  <View
                    style={{
                      flex: 1,
                      backgroundColor: "#111",
                      borderRadius: 10,
                      padding: 12,
                      marginBottom: 4,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Text style={{ color: "#fff", fontWeight: "bold" }}>
                        {log.protocol.peptideName}
                      </Text>
                      <Text style={{ color: "#666", fontSize: 11 }}>
                        {new Date(log.loggedAt).toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Text>
                    </View>
                    <Text
                      style={{ color: "#6366f1", marginTop: 2, fontSize: 13 }}
                    >
                      {log.doseTaken} mcg
                    </Text>
                    <Text style={{ color: "#555", fontSize: 12, marginTop: 2 }}>
                      {log.protocol.route}
                    </Text>
                    {log.notes && (
                      <Text
                        style={{ color: "#999", marginTop: 4, fontSize: 12 }}
                      >
                        {log.notes}
                      </Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}
        />
      )}
    </View>
  );
}
