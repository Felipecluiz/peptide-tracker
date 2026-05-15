import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import { useAllLogs } from "../../lib/hooks/useAllLogs";
import { useProtocols } from "../../lib/hooks/useProtocols";

function getDayKey(date: Date) {
  return date.toISOString().split("T")[0];
}

function calcStreak(logDates: Set<string>): number {
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    if (logDates.has(getDayKey(d))) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

export default function Streak() {
  const { data: logs, isLoading } = useAllLogs();
  const { data: protocols } = useProtocols();

  // Dias únicos com pelo menos 1 dose
  const logDates = new Set(
    logs?.map((l) => getDayKey(new Date(l.loggedAt))) ?? [],
  );

  const streak = calcStreak(logDates);
  const totalDoses = logs?.length ?? 0;
  const totalDays = logDates.size;

  // Últimos 28 dias para o grid de atividade
  const last28: { key: string; active: boolean }[] = [];
  for (let i = 27; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = getDayKey(d);
    last28.push({ key, active: logDates.has(key) });
  }

  // Por protocolo
  const perProtocol =
    protocols?.map((p) => {
      const pLogs = logs?.filter((l) => l.protocol.id === p.id) ?? [];
      const pDates = new Set(pLogs.map((l) => getDayKey(new Date(l.loggedAt))));
      return {
        ...p,
        totalDoses: pLogs.length,
        totalDays: pDates.size,
        streak: calcStreak(pDates),
      };
    }) ?? [];

  if (isLoading)
    return (
      <ActivityIndicator
        color="#6366f1"
        style={{ flex: 1, backgroundColor: "#000" }}
      />
    );

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#000" }}
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
        Consistência
      </Text>

      {/* Streak principal */}
      <View
        style={{
          backgroundColor: "#111",
          borderRadius: 16,
          padding: 24,
          alignItems: "center",
          marginBottom: 20,
          borderWidth: 1,
          borderColor: streak > 0 ? "#f59e0b40" : "#1a1a1a",
        }}
      >
        <Text style={{ fontSize: 64 }}>{streak > 0 ? "🔥" : "💤"}</Text>
        <Text style={{ color: "#f59e0b", fontSize: 48, fontWeight: "bold" }}>
          {streak}
        </Text>
        <Text style={{ color: "#666", fontSize: 14 }}>dias seguidos</Text>
      </View>

      {/* Stats */}
      <View style={{ flexDirection: "row", gap: 12, marginBottom: 24 }}>
        <StatCard
          label="Total de doses"
          value={String(totalDoses)}
          emoji="💉"
        />
        <StatCard label="Dias ativos" value={String(totalDays)} emoji="📅" />
      </View>

      {/* Grid de atividade (últimos 28 dias) */}
      <Text
        style={{
          color: "#999",
          fontSize: 13,
          fontWeight: "600",
          letterSpacing: 1,
          marginBottom: 12,
        }}
      >
        ÚLTIMOS 28 DIAS
      </Text>
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 6,
          marginBottom: 28,
        }}
      >
        {last28.map(({ key, active }) => (
          <View
            key={key}
            style={{
              width: 32,
              height: 32,
              borderRadius: 6,
              backgroundColor: active ? "#6366f1" : "#111",
              borderWidth: 1,
              borderColor: active ? "#6366f1" : "#1a1a1a",
            }}
          />
        ))}
      </View>

      {/* Por protocolo */}
      <Text
        style={{
          color: "#999",
          fontSize: 13,
          fontWeight: "600",
          letterSpacing: 1,
          marginBottom: 12,
        }}
      >
        POR PROTOCOLO
      </Text>
      {perProtocol.map((p) => (
        <View
          key={p.id}
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
              marginBottom: 8,
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "bold" }}>
              {p.peptideName}
            </Text>
            <Text style={{ color: "#f59e0b" }}>🔥 {p.streak}d</Text>
          </View>
          <View style={{ flexDirection: "row", gap: 16 }}>
            <Text style={{ color: "#666", fontSize: 12 }}>
              💉 {p.totalDoses} doses
            </Text>
            <Text style={{ color: "#666", fontSize: 12 }}>
              📅 {p.totalDays} dias
            </Text>
          </View>
          {/* Mini progress bar */}
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
                backgroundColor: "#6366f1",
                borderRadius: 4,
                height: 4,
                width: `${Math.min((p.totalDays / 30) * 100, 100)}%`,
              }}
            />
          </View>
          <Text style={{ color: "#444", fontSize: 10, marginTop: 4 }}>
            {p.totalDays}/30 dias
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

function StatCard({
  label,
  value,
  emoji,
}: {
  label: string;
  value: string;
  emoji: string;
}) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#111",
        borderRadius: 12,
        padding: 16,
        alignItems: "center",
      }}
    >
      <Text style={{ fontSize: 24 }}>{emoji}</Text>
      <Text
        style={{
          color: "#fff",
          fontSize: 26,
          fontWeight: "bold",
          marginTop: 4,
        }}
      >
        {value}
      </Text>
      <Text
        style={{
          color: "#666",
          fontSize: 12,
          marginTop: 2,
          textAlign: "center",
        }}
      >
        {label}
      </Text>
    </View>
  );
}
