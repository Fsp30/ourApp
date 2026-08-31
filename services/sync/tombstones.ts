import {
    doc,
    updateDoc,
    deleteDoc,
    serverTimestamp,
    Timestamp,
    collection,
    query,
    where,
    orderBy,
    onSnapshot,
    getDocs,
    type Unsubscribe,
} from "@react-native-firebase/firestore";
import { getDb } from "@/services/firestore/firestoreClient";

const PURGE_AFTER_DAYS = 7;

export async function softDelete(
    collectionName: string,
    id: string,
): Promise<void> {
    await updateDoc(doc(getDb(), collectionName, id), {
        deletedAt: serverTimestamp(),
    });
}

export async function restoreItem(
    collectionName: string,
    id: string,
): Promise<void> {
    await updateDoc(doc(getDb(), collectionName, id), {
        deletedAt: null,
    });
}

export function subscribeToTrash<T>(
    collectionName: string,
    onChange: (items: T[]) => void,
    onError?: (error: Error) => void,
): Unsubscribe {
    const q = query(
        collection(getDb(), collectionName),
        where("deletedAt", "!=", null),
        orderBy("deletedAt", "desc"),
    );
    return onSnapshot(
        q,
        (snapshot) => onChange(snapshot.docs.map((d) => d.data() as T)),
        (error) => {
            console.log(`Erro ao ouvir lixeira de ${collectionName}:`, error);
            onError?.(error);
        },
    );
}

/** Apaga definitivamente itens deletados há mais de PURGE_AFTER_DAYS. Retorna quantos apagou. */
export async function purgeExpired(collectionName: string): Promise<number> {
    const cutoffMillis = Date.now() - PURGE_AFTER_DAYS * 24 * 60 * 60 * 1000;
    const q = query(
        collection(getDb(), collectionName),
        where("deletedAt", "!=", null),
    );
    const snapshot = await getDocs(q);

    let count = 0;
    for (const docSnap of snapshot.docs) {
        const deletedAt = docSnap.data().deletedAt as Timestamp | null;
        if (deletedAt && deletedAt.toMillis() < cutoffMillis) {
            await deleteDoc(docSnap.ref);
            count++;
        }
    }
    return count;
}
