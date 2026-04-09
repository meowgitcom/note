import { useColorScheme } from "react-native"
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context"
import Routes from "@/routes"
import { useFonts, Geist_400Regular } from "@expo-google-fonts/geist"
import { GeistMono_400Regular } from "@expo-google-fonts/geist-mono"
import { PaperProvider, MD3LightTheme, MD3DarkTheme } from "react-native-paper"

export default function App() {
  const colorScheme = useColorScheme()

  let [fontsLoaded] = useFonts({
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
          <Routes />
        </SafeAreaView>
      </PaperProvider>
    </SafeAreaProvider>
  )
}
