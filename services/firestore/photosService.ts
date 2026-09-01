import {
    collection,
    onSnapshot,
    orderBy,
    query,
    where,
    doc,
    setDoc,
    getDocs,
    deleteDoc,
    Timestamp,
    type Unsubscribe,
} from "@react-native-firebase/firestore";
import { getDb } from "./firestoreClient";
import { softDelete, restoreItem } from "@/services/sync/tombstones";
import { deletePhotoBinary } from "@/services/drive/photoService";
import { PhotoEntry } from "@/types";

const COLLECTION = "photos";

export function subscribeToPhotos(
    onChange: (photos: PhotoEntry[]) => void,
    onError?: (error: Error) => void,
): Unsubscribe {
    const q = query(
        collection(getDb(), COLLECTION),
        where("deletedAt", "==", null),
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

export async function softDeletePhotoEntry(photoId: string): Promise<void> {
    await softDelete(COLLECTION, photoId);
}

export async function restorePhotoEntry(photoId: string): Promise<void> {
    await restoreItem(COLLECTION, photoId);
}

const PURGE_AFTER_DAYS = 7;

export async function purgeExpiredPhotos(): Promise<number> {
    const cutoffMillis = Date.now() - PURGE_AFTER_DAYS * 24 * 60 * 60 * 1000;
    const q = query(
        collection(getDb(), COLLECTION),
        where("deletedAt", "!=", null),
    );
    const snapshot = await getDocs(q);

    let count = 0;
    for (const docSnap of snapshot.docs) {
        const deletedAt = docSnap.data().deletedAt as Timestamp | null;
        if (deletedAt && deletedAt.toMillis() < cutoffMillis) {
            await deletePhotoBinary(docSnap.id);
            await deleteDoc(docSnap.ref);
            count++;
        }
    }
    return count;
}
