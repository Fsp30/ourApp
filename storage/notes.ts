import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppData, Note, UserId } from "@/types";
import { STORAGE_KEYS } from "./keys";

const EMPTY_DATA: AppData = {
    notes: [],
    events: [],
    photos: [],
    postIts: [],
    lastSync: null,
};

export async function loadAppData(): Promise<AppData> {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.APP_DATA);
    if (!raw) return EMPTY_DATA;
    try {
        return JSON.parse(raw) as AppData;
    } catch {
        return EMPTY_DATA;
    }
}

export async function saveAppData(data: AppData): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.APP_DATA, JSON.stringify(data));
}

export async function upsertNote(
    note: Note,
    eventType: "create" | "edit",
    user: UserId,
): Promise<AppData> {
    const data = await loadAppData();
    const idx = data.notes.findIndex((n) => n.id === note.id);

    if (idx >= 0) {
        data.notes[idx] = note;
    } else {
        data.notes.push(note);
    }

    data.events.unshift({
        id: `event_${Date.now()}`,
        type: eventType,
        noteId: note.id,
        user,
        date: new Date().toISOString(),
    });

    await saveAppData(data);
    return data;
}

export async function deleteNote(
    noteId: string,
    user: UserId,
): Promise<AppData> {
    const data = await loadAppData();
    data.notes = data.notes.filter((n) => n.id !== noteId);

    data.events.unshift({
        id: `event_${Date.now()}`,
        type: "delete",
        noteId,
        user,
        date: new Date().toISOString(),
    });

    await saveAppData(data);
    return data;
}
