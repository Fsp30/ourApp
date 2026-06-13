import { GoogleTokens } from "@/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS } from "./keys";

export async function saveGoogleTokens(tokens: GoogleTokens): Promise<void>{
    await AsyncStorage.setItem(STORAGE_KEYS.GOOGLE_TOKENS, JSON.stringify(tokens))
}

export async function loadGoogleTokens(): Promise<GoogleTokens | null>{
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.GOOGLE_TOKENS)
    if (!raw) return null
    try {
        return JSON.parse(raw) as GoogleTokens
    } catch {
        return null
    }
}

export async function clearGoogleTokens(): Promise<void>{
    await AsyncStorage.removeItem(STORAGE_KEYS.GOOGLE_TOKENS)
}