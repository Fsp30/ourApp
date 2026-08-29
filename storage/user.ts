import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserId } from "@/types";
import { STORAGE_KEYS } from "./keys";

export async function saveActiveUser(userId: UserId): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_USER, userId);
}

export async function loadActiveUser(): Promise<UserId | null> {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.ACTIVE_USER);
    return (value as UserId) ?? null;
}

export async function clearActiveUser(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEYS.ACTIVE_USER);
}
