import { View, Text } from "react-native";

export default function Login() {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#000",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text style={{ color: "#fff", fontSize: 24 }}>Peptide Tracker</Text>
    </View>
  );
}
