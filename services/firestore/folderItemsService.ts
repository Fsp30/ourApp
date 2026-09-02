import {
    collection,
    onSnapshot,
    orderBy,
    query,
    where,
    doc,
    setDoc,
    type Unsubscribe,
} from "@react-native-firebase/firestore";
import { getDb } from "./firestoreClient";
import { softDelete, restoreItem } from "@/services/sync/tombstones";
import { FolderItem } from "@/types";

const COLLECTION = "folderItems";

export function subscribeToFolderItems(
    folderId: string,
    onChange: (items: FolderItem[]) => void,
    onError?: (error: Error) => void,
): Unsubscribe {
    const q = query(
        collection(getDb(), COLLECTION),
        where("folderId", "==", folderId),
        where("deletedAt", "==", null),
        orderBy("createdAt", "desc"),
    );
    return onSnapshot(
        q,
        (snapshot) =>
            onChange(snapshot.docs.map((d) => d.data() as FolderItem)),
        (error) => {
            console.log("Erro ao ouvir itens da pasta:", error);
            onError?.(error);
        },
    );
}

export async function createLinkItem(item: FolderItem): Promise<void> {
    await setDoc(doc(getDb(), COLLECTION, item.id), item);
}

export async function softDeleteFolderItem(itemId: string): Promise<void> {
    await softDelete(COLLECTION, itemId);
}

export async function restoreFolderItem(itemId: string): Promise<void> {
    await restoreItem(COLLECTION, itemId);
}
