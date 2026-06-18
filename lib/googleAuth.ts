import {
  GoogleSignin,
  isErrorWithCode,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { clearGoogleTokens, saveGoogleTokens } from '@/storage/googleAuth';

GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID!,
  scopes: [
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/photoslibrary.readonly',
  ],
  offlineAccess: true, 
});

export async function signInWithGoogle(): Promise<boolean> {
  try {
    await GoogleSignin.hasPlayServices();
    const response = await GoogleSignin.signIn();

    if (response.type !== 'success') return false;

    const tokens = await GoogleSignin.getTokens();

    await saveGoogleTokens({
      accessToken: tokens.accessToken,
      refreshToken: '',
      expiretAt: Date.now() + 55 * 60 * 1000, 
    });

    return true;
  } catch (error) {
    if (isErrorWithCode(error)) {
      switch (error.code) {
        case statusCodes.SIGN_IN_CANCELLED:
          console.log('Login cancelado pelo usuário');
          break;
        case statusCodes.IN_PROGRESS:
          console.log('Login já em andamento');
          break;
        case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
          console.log('Play Services não disponível');
          break;
        default:
          console.log('Erro no login:', error.code, error.message);
      }
    } else {
      console.log('Erro desconhecido:', error);
    }
    return false;
  }
}

export async function getValidAccessToken(): Promise<string | null> {
  try {
    const isSignedIn = await isGoogleConnected();
    if (!isSignedIn) return null;

    const tokens = await GoogleSignin.getTokens();
    return tokens.accessToken;
  } catch {
    return null;
  }
}

export async function disconnectGoogle() {
  try {
    await GoogleSignin.signOut();
  } catch {
  }
  await clearGoogleTokens();
}

export async function isGoogleConnected(): Promise<boolean> {
  return await GoogleSignin.hasPreviousSignIn();
}