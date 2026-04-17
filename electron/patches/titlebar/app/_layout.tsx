import { useColorScheme, View, StyleSheet } from "react-native"
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context"
import { useFonts, Geist_400Regular } from "@expo-google-fonts/geist"
import { GeistMono_400Regular } from "@expo-google-fonts/geist-mono"
import { MD3DarkTheme, MD3LightTheme, PaperProvider, IconButton, Text } from "react-native-paper"
import { Stack } from "expo-router"
import { useEffect, useState } from "react"

declare global {
  interface Window {
    electronAPI: {
      readFile: (path: string) => Promise<string>
      writeFile: (path: string, content: string) => Promise<void>
      deleteFile: (path: string) => Promise<void>
      getPlatform: () => string
      isElectron: () => boolean
      minimize: () => void
      maximize: () => void
      close: () => void
      isMaximized: () => Promise<boolean>
    }
  }
}

function TitleBar() {
  const [isMaximized, setIsMaximized] = useState(false)
  const colorScheme = useColorScheme()
  const isDark = colorScheme === "dark"

  const isElectron =
    !!window.electronAPI?.isElectron?.() ||
    (typeof navigator !== "undefined" && /Electron\//.test(navigator.userAgent))

  useEffect(() => {
    if (!isElectron) return
    if (typeof document === "undefined") return

    const styleId = "electron-titlebar-css"
    if (document.getElementById(styleId)) return

    const style = document.createElement("style")
    style.id = styleId
    style.textContent = `
      .electron-titlebar { -webkit-app-region : drag; -webkit-user-select : none; user-select : none; }
      .electron-nodrag { -webkit-app-region : no-drag; }
    `
    document.head.appendChild(style)
  }, [isElectron])

  useEffect(() => {
    const checkMaximized = async () => {
      if (!isElectron) return
      if (window.electronAPI?.isMaximized) {
        setIsMaximized(await window.electronAPI.isMaximized())
      }
    }
    checkMaximized()
  }, [isElectron])

  if (!isElectron) return null

  return (
    <View
      // @ts-ignore - web-only prop
      className="electron-titlebar"
      nativeID="electron-titlebar"
      style={[styles.titleBar, isDark ? styles.titleBarDark : styles.titleBarLight]}
      onDoubleClick={() => window.electronAPI?.maximize?.()}
    >
      <View style={styles.titleBarContent} pointerEvents="none">
        <Text style={[styles.titleText, isDark ? styles.titleTextDark : styles.titleTextLight]}>
          note
        </Text>
      </View>

      <View style={{ flex: 1 }} />

      <View
        // @ts-ignore - web-only prop
        className="electron-nodrag"
        nativeID="electron-window-controls"
        style={styles.windowControls}
      >
        <IconButton
          icon="minus"
          size={18}
          onPress={() => window.electronAPI?.minimize?.()}
          iconColor={isDark ? "#ccc" : "#333"}
          // @ts-ignore - web-only prop
          className="electron-nodrag"
          style={styles.controlButton}
        />
        <IconButton
          icon={isMaximized ? "checkbox-multiple-blank-outline" : "checkbox-blank-outline"}
          size={18}
          onPress={async () => {
            window.electronAPI?.maximize?.()
            setIsMaximized((await window.electronAPI?.isMaximized?.()) ?? false)
          }}
          iconColor={isDark ? "#ccc" : "#333"}
          // @ts-ignore - web-only prop
          className="electron-nodrag"
          style={styles.controlButton}
        />
        <IconButton
          icon="close"
          size={18}
          onPress={() => window.electronAPI?.close?.()}
          iconColor={isDark ? "#ccc" : "#333"}
          // @ts-ignore - web-only prop
          className="electron-nodrag"
          style={styles.controlButton}
        />
      </View>
    </View>
  )
}

export default function RootLayout() {
  const colorScheme = useColorScheme()

  const [fontsLoaded] = useFonts({
    Geist_400Regular,
    GeistMono_400Regular,
  })

  if (!fontsLoaded) {
    return null
  }

  const light = {
    ...MD3LightTheme,
    colors: {
      primary: "rgb(188, 0, 75)",
      onPrimary: "rgb(255, 255, 255)",
      primaryContainer: "rgb(255, 217, 230)",
      onPrimaryContainer: "rgb(64, 0, 20)",
      secondary: "rgb(151, 64, 102)",
      onSecondary: "rgb(255, 255, 255)",
      secondaryContainer: "rgb(255, 217, 228)",
      onSecondaryContainer: "rgb(62, 0, 33)",
      tertiary: "rgb(149, 65, 109)",
      onTertiary: "rgb(255, 255, 255)",
      tertiaryContainer: "rgb(255, 216, 231)",
      onTertiaryContainer: "rgb(61, 0, 38)",
      error: "rgb(186, 26, 26)",
      onError: "rgb(255, 255, 255)",
      errorContainer: "rgb(255, 218, 214)",
      onErrorContainer: "rgb(65, 0, 2)",
      background: "rgb(255, 240, 246)",
      onBackground: "rgb(42, 16, 28)",
      surface: "rgb(255, 244, 248)",
      onSurface: "rgb(42, 16, 28)",
      surfaceVariant: "rgb(248, 222, 232)",
      onSurfaceVariant: "rgb(90, 50, 65)",
      outline: "rgb(160, 110, 130)",
      outlineVariant: "rgb(220, 185, 200)",
      shadow: "rgb(0, 0, 0)",
      scrim: "rgb(0, 0, 0)",
      inverseSurface: "rgb(54, 20, 38)",
      inverseOnSurface: "rgb(255, 235, 243)",
      inversePrimary: "rgb(255, 178, 190)",
      elevation: {
        level0: "transparent",
        level1: "rgb(252, 232, 242)",
        level2: "rgb(250, 226, 238)",
        level3: "rgb(248, 220, 234)",
        level4: "rgb(246, 216, 231)",
        level5: "rgb(244, 212, 228)",
      },
      surfaceDisabled: "rgba(42, 16, 28, 0.12)",
      onSurfaceDisabled: "rgba(42, 16, 28, 0.38)",
      backdrop: "rgba(80, 20, 50, 0.4)",
    },
  }

  const dark = {
    ...MD3DarkTheme,
    colors: {
      primary: "rgb(255, 178, 190)",
      onPrimary: "rgb(102, 0, 37)",
      primaryContainer: "rgb(144, 0, 56)",
      onPrimaryContainer: "rgb(255, 217, 222)",
      secondary: "rgb(255, 176, 205)",
      onSecondary: "rgb(93, 17, 55)",
      secondaryContainer: "rgb(122, 41, 78)",
      onSecondaryContainer: "rgb(255, 217, 228)",
      tertiary: "rgb(255, 175, 212)",
      onTertiary: "rgb(92, 17, 62)",
      tertiaryContainer: "rgb(120, 41, 85)",
      onTertiaryContainer: "rgb(255, 216, 231)",
      error: "rgb(255, 180, 171)",
      onError: "rgb(105, 0, 5)",
      errorContainer: "rgb(147, 0, 10)",
      onErrorContainer: "rgb(255, 218, 214)",
      background: "rgb(28, 10, 18)",
      onBackground: "rgb(255, 210, 225)",
      surface: "rgb(32, 12, 22)",
      onSurface: "rgb(255, 210, 225)",
      surfaceVariant: "rgb(72, 30, 50)",
      onSurfaceVariant: "rgb(220, 185, 200)",
      outline: "rgb(155, 110, 130)",
      outlineVariant: "rgb(72, 45, 57)",
      shadow: "rgb(0, 0, 0)",
      scrim: "rgb(0, 0, 0)",
      inverseSurface: "rgb(240, 220, 228)",
      inverseOnSurface: "rgb(50, 20, 35)",
      inversePrimary: "rgb(188, 0, 75)",
      elevation: {
        level0: "transparent",
        level1: "rgb(42, 16, 30)",
        level2: "rgb(50, 20, 36)",
        level3: "rgb(58, 24, 42)",
        level4: "rgb(62, 27, 46)",
        level5: "rgb(68, 30, 50)",
      },
      surfaceDisabled: "rgba(255, 210, 225, 0.12)",
      onSurfaceDisabled: "rgba(255, 210, 225, 0.38)",
      backdrop: "rgba(80, 20, 50, 0.5)",
    },
  }

  const theme = colorScheme === "dark" ? dark : light

  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
          <TitleBar />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: theme.colors.background },
            }}
          />
        </SafeAreaView>
      </PaperProvider>
    </SafeAreaProvider>
  )
}

const styles = StyleSheet.create({
  titleBar: {
    height: 36,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.08)",
  },
  titleBarLight: {
    backgroundColor: "#f3d8e6",
  },
  titleBarDark: {
    backgroundColor: "#1c0c12",
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  titleBarContent: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  titleText: {
    fontSize: 13,
    fontFamily: "GeistMono_400Regular",
  },
  titleTextLight: {
    color: "#4a2838",
  },
  titleTextDark: {
    color: "#d4a8be",
  },
  windowControls: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: "auto",
  },
  controlButton: {
    margin: 0,
  },
})
