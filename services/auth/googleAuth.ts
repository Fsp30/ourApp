import {
    GoogleSignin,
    isErrorWithCode,
    statusCodes,
} from "@react-native-google-signin/google-signin";
import {
    getAuth,
    GoogleAuthProvider,
    signInWithCredential,
    signOut as firebaseSignOut,
} from "@react-native-firebase/auth";
import { clearGoogleTokens, saveGoogleTokens } from "@/storage/googleAuth";

export async function signInWithGoogle(): Promise<boolean> {
    try {
        await GoogleSignin.hasPlayServices();
        const response = await GoogleSignin.signIn();
        if (response.type !== "success") return false;

        const { serverAuthCode, idToken } = response.data;

        if (idToken) {
            try {
                const credential = GoogleAuthProvider.credential(idToken);
                await signInWithCredential(getAuth(), credential);
            } catch (firebaseError) {
                console.log("Erro ao autenticar no Firebase:", firebaseError);
            }
        } else {
            console.log(
                "idToken ausente na resposta do Google Sign-In; Firebase não autenticado.",
            );
        }

        if (!serverAuthCode) {
            const tokens = await GoogleSignin.getTokens();
            await saveGoogleTokens({
                accessToken: tokens.accessToken,
                refreshToken: "",
                expiretAt: Date.now() + 55 * 60 * 1000,
            });
            return true;
        }

        const res = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                code: serverAuthCode,
                client_id: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID!,
                client_secret: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_SECRET!,
                redirect_uri: "",
                grant_type: "authorization_code",
            }).toString(),
        });

        const data = await res.json();
        if (!data.access_token) return false;

        await saveGoogleTokens({
            accessToken: data.access_token,
            refreshToken: data.refresh_token ?? "",
            expiretAt: Date.now() + (data.expires_in ?? 3600) * 1000,
        });

        return true;
    } catch (error) {
        if (isErrorWithCode(error)) {
            switch (error.code) {
                case statusCodes.SIGN_IN_CANCELLED:
                    console.log("Login cancelado pelo usuário");
                    break;
                case statusCodes.IN_PROGRESS:
                    console.log("Login já em andamento");
                    break;
                case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
                    console.log("Play Services não disponível");
                    break;
                default:
                    console.log("Erro no login:", error.code, error.message);
            }
        } else {
            console.log("Erro desconhecido:", error);
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
    } catch {}
    try {
        await firebaseSignOut(getAuth());
    } catch {}
    await clearGoogleTokens();
}

export async function isGoogleConnected(): Promise<boolean> {
    return await GoogleSignin.hasPreviousSignIn();
}
