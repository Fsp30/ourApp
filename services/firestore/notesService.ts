import { Note } from "@/types";
import {
    collection,
    deleteDoc,
    doc,
    getDoc,
    onSnapshot,
    orderBy,
    query,
    setDoc,
    Unsubscribe,
} from "@react-native-firebase/firestore";
import { getDb } from "./firestoreClient";

const COLLECTION = "notes";

export function subscribeToNotes(
    onChange: (notes: Note[]) => void,
    onError?: (error: Error) => void,
): Unsubscribe {
    const q = query(
        collection(getDb(), COLLECTION),
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

export async function deleteNoteById(noteId: string): Promise<void> {
    await deleteDoc(doc(getDb(), COLLECTION, noteId));
}
