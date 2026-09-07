import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Stack } from "expo-router";
import { useEffect } from "react";
import { ThemeProvider } from "@/constants/ThemeContext";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { registerPushToken } from "@/services/notifications/pushTokenService";
import { purgeAllExpired } from "@/services/sync/purgeExpiredItems";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import "@/global.css";

GoogleSignin.configure({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID!,
    scopes: ["https://www.googleapis.com/auth/drive.file"],
    offlineAccess: true,
    forceCodeForRefreshToken: true,
});

export default function RootLayout() {
    useEffect(() => {
        registerPushToken();
        purgeAllExpired();
    }, []);

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <GluestackUIProvider mode="light">
                <ThemeProvider>
                    <Stack screenOptions={{ headerShown: false }} />
                </ThemeProvider>
            </GluestackUIProvider>
        </GestureHandlerRootView>
    );
}
