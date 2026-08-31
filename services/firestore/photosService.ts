import {
    collection,
    onSnapshot,
    orderBy,
    query,
    doc,
    setDoc,
    deleteDoc,
    type Unsubscribe,
} from "@react-native-firebase/firestore";
import { getDb } from "./firestoreClient";
import { PhotoEntry } from "@/types";

const COLLECTION = "photos";

export function subscribeToPhotos(
    onChange: (photos: PhotoEntry[]) => void,
    onError?: (error: Error) => void,
): Unsubscribe {
    const q = query(
        collection(getDb(), COLLECTION),
        orderBy("uploadedAt", "desc"),
    );
    return onSnapshot(
        q,
        (snapshot) =>
            onChange(snapshot.docs.map((d) => d.data() as PhotoEntry)),
        (error) => {
            console.log("Erro ao ouvir fotos:", error);
            onError?.(error);
        },
    );
}

export async function savePhotoEntry(entry: PhotoEntry): Promise<void> {
    await setDoc(doc(getDb(), COLLECTION, entry.id), entry);
}

export async function deletePhotoEntry(photoId: string): Promise<void> {
    await deleteDoc(doc(getDb(), COLLECTION, photoId));
}
