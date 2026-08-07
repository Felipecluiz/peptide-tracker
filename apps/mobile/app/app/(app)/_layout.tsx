import { Tabs } from "expo-router";
import { View, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function TabIcon({
  emoji,
  label,
  focused,
}: {
  emoji: string;
  label: string;
  focused: boolean;
}) {
  return (
    <View style={{ alignItems: "center", gap: 2 }}>
      <Text style={{ fontSize: 20 }}>{emoji}</Text>
      <Text style={{ color: focused ? "#6366f1" : "#666", fontSize: 10 }}>
        {label}
      </Text>
    </View>
  );
}

function TabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#0a0a0a",
          borderTopColor: "#1a1a1a",
          height: 64 + insets.bottom,
          paddingBottom: insets.bottom + 8,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🏠" label="Início" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="📋" label="Histórico" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="streak"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🔥" label="Streak" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="exams"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🧪" label="Exames" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen name="protocols/new" options={{ href: null }} />
      <Tabs.Screen name="protocols/[id]" options={{ href: null }} />
      <Tabs.Screen name="exams/new" options={{ href: null }} />
      <Tabs.Screen name="exams/[id]" options={{ href: null }} />
    </Tabs>
  );
}

export default TabsLayout;
