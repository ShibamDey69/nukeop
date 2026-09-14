import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as SplashScreen from "expo-splash-screen";
import { useFonts as useOutfitFonts, Outfit_700Bold, Outfit_900Black } from "@expo-google-fonts/outfit";
import {
  useFonts as useDMSansFonts,
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
  DMSans_700Bold,
} from "@expo-google-fonts/dm-sans";
import {
  useFonts as useMonoFonts,
  JetBrainsMono_400Regular,
  JetBrainsMono_500Medium,
  JetBrainsMono_600SemiBold,
} from "@expo-google-fonts/jetbrains-mono";
import App from "./src/App";
import { ThemeProvider } from "./src/theme";

// Keep the native splash screen up until we say otherwise.
SplashScreen.preventAutoHideAsync().catch(() => {
  // If the native splash module isn't available for some reason, that's
  // fine — the safety timeout below still guarantees the app renders.
});

export default function Root() {
  // Each useFonts hook returns [loaded, error]. We only ever gate on
  // whether font-loading has *settled* (either succeeded or failed) — never
  // on "loaded" alone — so a font error can't leave the splash screen up
  // forever. If fonts fail to load, React Native just falls back to the
  // system default font instead of crashing.
  const [outfitLoaded, outfitError] = useOutfitFonts({ Outfit_700Bold, Outfit_900Black });
  const [dmSansLoaded, dmSansError] = useDMSansFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
  });
  const [monoLoaded, monoError] = useMonoFonts({
    JetBrainsMono_400Regular,
    JetBrainsMono_500Medium,
    JetBrainsMono_600SemiBold,
  });

  const fontsSettled =
    (outfitLoaded || !!outfitError) &&
    (dmSansLoaded || !!dmSansError) &&
    (monoLoaded || !!monoError);

  // Belt-and-braces: no matter what happens with font loading or the splash
  // screen module itself, never let the app stay stuck for more than a
  // couple of seconds.
  const [timedOut, setTimedOut] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setTimedOut(true), 2500);
    return () => clearTimeout(id);
  }, []);

  const ready = fontsSettled || timedOut;

  useEffect(() => {
    if (ready) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [ready]);

  if (!ready) {
    return <View style={{ flex: 1, backgroundColor: "#FCEBED" }} />;
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
