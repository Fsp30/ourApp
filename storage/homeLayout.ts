import { HomeWidget } from "@/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS } from "./keys";

export async function loadHomeLayout(): Promise<HomeWidget[]> {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.HOME_LAYOUT);
    if (!raw) return [];
    try {
        return JSON.parse(raw) as HomeWidget[];
    } catch {
        return [];
    }
}

export async function saveHomeLayout(widgets: HomeWidget[]): Promise<void> {
    await AsyncStorage.setItem(
        STORAGE_KEYS.HOME_LAYOUT,
        JSON.stringify(widgets),
    );
}
