import { useEffect, useState } from "react"
import { ScrollView, StyleSheet, View } from "react-native"
import { ActivityIndicator, Button, Surface, Text } from "react-native-paper"
import type { LocalDbSnapshot } from "db"
import { bootstrapLocalDb, readLocalDbSnapshot, resetLocalDb } from "@/lib/local-db"

export default function Index() {
  const [snapshot, setSnapshot] = useState<LocalDbSnapshot | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [resetting, setResetting] = useState(false)

  useEffect(() => {
    void hydrate()
  }, [])

  const hydrate = async () => {
    setLoading(true)
    setError(null)

    try {
      await bootstrapLocalDb()
      setSnapshot(await readLocalDbSnapshot())
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Failed to open local database.")
    } finally {
      setLoading(false)
    }
  }

  const handleReset = async () => {
    setResetting(true)
    setError(null)

    try {
      setSnapshot(await resetLocalDb())
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Failed to reset local database.")
    } finally {
      setResetting(false)
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>meow[note]</Text>
      <Text style={styles.subtitle}>Shared Drizzle schema, local SQLite runtime.</Text>

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator />
          <Text style={styles.meta}>Bootstrapping local database...</Text>
        </View>
      ) : null}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {snapshot ? (
        <Surface style={styles.panel} elevation={1}>
          <Text style={styles.panelTitle}>Database Snapshot</Text>
          <Text style={styles.meta}>Driver: {snapshot.driver}</Text>
          <Text style={styles.meta}>Location: {snapshot.location}</Text>
          <Text style={styles.meta}>Users: {snapshot.userCount}</Text>
          <Text style={styles.meta}>Workspaces: {snapshot.workspaceCount}</Text>

          {snapshot.workspaces.map((workspace) => (
            <View key={workspace.id} style={styles.workspace}>
              <Text style={styles.workspaceName}>{workspace.name}</Text>
              <Text style={styles.meta}>Owner: {workspace.ownerId}</Text>
              <Text style={styles.meta}>Members: {workspace.memberCount}</Text>
            </View>
          ))}
        </Surface>
      ) : null}

      <View style={styles.actions}>
        <Button
          mode="contained"
          onPress={handleReset}
          loading={resetting}
          disabled={loading || resetting}
        >
          Reset Sample Data
        </Button>
        <Button mode="text" onPress={() => void hydrate()} disabled={loading || resetting}>
          Refresh Snapshot
        </Button>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  title: {
    fontSize: 34,
    marginBottom: 8,
    fontFamily: "GeistMono_400Regular",
  },
  subtitle: {
    marginBottom: 24,
    opacity: 0.7,
  },
  loading: {
    gap: 12,
    alignItems: "flex-start",
    marginBottom: 24,
  },
  panel: {
    padding: 20,
    borderRadius: 20,
    marginBottom: 24,
    gap: 6,
  },
  panelTitle: {
    fontSize: 18,
    marginBottom: 8,
    fontFamily: "GeistMono_400Regular",
  },
  workspace: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(0, 0, 0, 0.12)",
    gap: 2,
  },
  workspaceName: {
    fontSize: 16,
  },
  meta: {
    opacity: 0.72,
  },
  error: {
    color: "#b3261e",
    marginBottom: 16,
  },
  actions: {
    gap: 12,
  },
})
