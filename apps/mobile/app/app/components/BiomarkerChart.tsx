import { memo } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { useBiomarkerEvolution } from "../../lib/hooks/useExams";

function BiomarkerChart({ name, unit }: { name: string; unit: string }) {
  const { data, isLoading } = useBiomarkerEvolution(name);

  if (isLoading)
    return <ActivityIndicator color="#6366f1" style={styles.loading} />;

  if (!data || data.length < 2) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyText}>
          Registre mais exames para ver a evolução
        </Text>
      </View>
    );
  }

  const values = data.map((d) => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const chartHeight = 80;
  const chartWidth = 260;
  const pointSpacing = chartWidth / (data.length - 1);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Evolução de {name}</Text>
      <View style={[styles.chart, { height: chartHeight, width: chartWidth }]}>
        {data.map((d, i) => {
          const x = i * pointSpacing;
          const y = chartHeight - ((d.value - min) / range) * chartHeight;
          const last = i === data.length - 1;
          const first = i === 0;
          return (
            <View
              key={d.id}
              style={[styles.pointWrap, { left: x - 5, top: y - 5 }]}
            >
              <View
                style={[
                  styles.point,
                  { backgroundColor: last ? "#6366f1" : "#444" },
                ]}
              />
              {(first || last) && (
                <Text
                  style={[
                    styles.pointLabel,
                    { color: last ? "#6366f1" : "#555" },
                  ]}
                >
                  {d.value}
                </Text>
              )}
            </View>
          );
        })}
      </View>

      <View style={styles.datesRow}>
        <Text style={styles.dateText}>
          {new Date(data[0].exam.examDate).toLocaleDateString("pt-BR", {
            month: "short",
            year: "2-digit",
          })}
        </Text>
        <Text style={styles.dateText}>
          {new Date(data[data.length - 1].exam.examDate).toLocaleDateString(
            "pt-BR",
            { month: "short", year: "2-digit" },
          )}
        </Text>
      </View>

      {(() => {
        const diff = data[data.length - 1].value - data[0].value;
        const pct = ((diff / data[0].value) * 100).toFixed(1);
        const up = diff >= 0;
        return (
          <Text
            style={[styles.diffText, { color: up ? "#10b981" : "#ef4444" }]}
          >
            {up ? "▲" : "▼"} {Math.abs(parseFloat(pct))}% desde o primeiro exame
          </Text>
        );
      })()}
    </View>
  );
}

export default memo(BiomarkerChart);

const styles = StyleSheet.create({
  loading: { marginTop: 12 },
  emptyState: {
    marginTop: 12,
    padding: 10,
    backgroundColor: "#1a1a1a",
    borderRadius: 8,
    alignItems: "center",
  },
  emptyText: { color: "#555", fontSize: 12 },
  container: { marginTop: 14 },
  title: { color: "#555", fontSize: 11, marginBottom: 8 },
  chart: { position: "relative" },
  pointWrap: { position: "absolute" },
  point: { width: 10, height: 10, borderRadius: 5 },
  pointLabel: { fontSize: 10, position: "absolute", top: 12, left: -8 },
  datesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  dateText: { color: "#444", fontSize: 10 },
  diffText: { fontSize: 12, marginTop: 4 },
});
