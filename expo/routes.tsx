import { StyleSheet, View } from "react-native"
import { Text } from "react-native-paper"

export default function Routes() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>meow[note]</Text>
    </View>
  )
}

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "ultralight",
    marginBottom: 20,
    fontFamily: "GeistMono_400Regular",
  },
})
