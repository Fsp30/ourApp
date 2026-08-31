import { Note } from "@/types";
import {
    collection,
    onSnapshot,
    orderBy,
    query,
    where,
    doc,
    setDoc,
    getDoc,
    type Unsubscribe,
} from "@react-native-firebase/firestore";
import { getDb } from "./firestoreClient";
import { softDelete, restoreItem } from "@/services/sync/tombstones";

const COLLECTION = "notes";

export function subscribeToNotes(
    onChange: (notes: Note[]) => void,
    onError?: (error: Error) => void,
): Unsubscribe {
    const q = query(
        collection(getDb(), COLLECTION),
        where("deletedAt", "==", null),
        orderBy("updatedAt", "desc"),
    );
    return onSnapshot(
        q,
        (snapshot) => onChange(snapshot.docs.map((d) => d.data() as Note)),
        (error) => {
            console.log("Erro ao ouvir notas", error);
            onError?.(error);
        },
    );
}

export async function getNote(noteId: string): Promise<Note | null> {
    const snap = await getDoc(doc(getDb(), COLLECTION, noteId));
    return snap.exists() ? (snap.data() as Note) : null;
}

export async function saveNote(note: Note): Promise<void> {
    await setDoc(doc(getDb(), COLLECTION, note.id), note, { merge: true });
}

export async function softDeleteNote(noteId: string): Promise<void> {
    await softDelete(COLLECTION, noteId);
}

export async function restoreNote(noteId: string): Promise<void> {
    await restoreItem(COLLECTION, noteId);
}
