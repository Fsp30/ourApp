import AsyncStorage from "@react-native-async-storage/async-storage";
import { HomeWidget } from "@/types";
import { STORAGE_KEYS } from "./keys";

export interface HomeLayoutData {
    title: string;
    widgets: HomeWidget[];
}

export async function loadHomeLayout(): Promise<HomeLayoutData> {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.HOME_LAYOUT);
    if (!raw) return { title: "", widgets: [] };
    try {
        const parsed = JSON.parse(raw);
        return {
            title: parsed?.title ?? "",
            widgets: Array.isArray(parsed) ? parsed : (parsed?.widgets ?? []),
        };
    } catch {
        return { title: "", widgets: [] };
    }
}

export async function saveHomeLayout(data: HomeLayoutData): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.HOME_LAYOUT, JSON.stringify(data));
}
