import { View, Text, ActivityIndicator } from "react-native";
import { useBiomarkerEvolution } from "../../lib/hooks/useExams";

export default function BiomarkerChart({
  name,
  unit,
}: {
  name: string;
  unit: string;
}) {
  const { data, isLoading } = useBiomarkerEvolution(name);

  if (isLoading)
    return <ActivityIndicator color="#6366f1" style={{ marginTop: 12 }} />;
  if (!data || data.length < 2) {
    return (
      <View
        style={{
          marginTop: 12,
          padding: 10,
          backgroundColor: "#1a1a1a",
          borderRadius: 8,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#555", fontSize: 12 }}>
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
    <View style={{ marginTop: 14 }}>
      <Text style={{ color: "#555", fontSize: 11, marginBottom: 8 }}>
        Evolução de {name}
      </Text>
      <View
        style={{ height: chartHeight, width: chartWidth, position: "relative" }}
      >
        {data.map((d, i) => {
          const x = i * pointSpacing;
          const y = chartHeight - ((d.value - min) / range) * chartHeight;
          const last = i === data.length - 1;
          const first = i === 0;
          return (
            <View
              key={d.id}
              style={{ position: "absolute", left: x - 5, top: y - 5 }}
            >
              <View
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: last ? "#6366f1" : "#444",
                }}
              />
              {(first || last) && (
                <Text
                  style={{
                    color: last ? "#6366f1" : "#555",
                    fontSize: 10,
                    position: "absolute",
                    top: 12,
                    left: -8,
                  }}
                >
                  {d.value}
                </Text>
              )}
            </View>
          );
        })}
      </View>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginTop: 16,
        }}
      >
        <Text style={{ color: "#444", fontSize: 10 }}>
          {new Date(data[0].exam.examDate).toLocaleDateString("pt-BR", {
            month: "short",
            year: "2-digit",
          })}
        </Text>
        <Text style={{ color: "#444", fontSize: 10 }}>
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
            style={{
              color: up ? "#10b981" : "#ef4444",
              fontSize: 12,
              marginTop: 4,
            }}
          >
            {up ? "▲" : "▼"} {Math.abs(parseFloat(pct))}% desde o primeiro exame
          </Text>
        );
      })()}
    </View>
  );
}
