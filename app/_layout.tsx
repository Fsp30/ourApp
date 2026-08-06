import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { ThemeProvider } from '@/constants/ThemeContext';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { registerPushToken } from '@/lib/notifications';

GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID!,
  scopes: [
    'https://www.googleapis.com/auth/drive.file',
  ],
  offlineAccess: true,
  forceCodeForRefreshToken: true,
});

export default function RootLayout() {
  useEffect(() => {
    registerPushToken();
  }, []);

  return (
    <ThemeProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </ThemeProvider>
  );
}