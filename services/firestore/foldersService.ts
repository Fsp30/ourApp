import { Folder } from "@/types";
import {
    collection,
    doc,
    getDoc,
    onSnapshot,
    orderBy,
    query,
    setDoc,
    Unsubscribe,
    where,
} from "@react-native-firebase/firestore";
import { getDb } from "./firestoreClient";
import { restoreItem, softDelete } from "../sync/tombstones";

const COLLECTION = "folders";

export const ROOT_FOLDER_ID = "links-e-memorias";

export function subscribeToSubfolders(
    parentId: string,
    onChange: (folders: Folder[]) => void,
    onError?: (error: Error) => void,
): Unsubscribe {
    const q = query(
        collection(getDb(), COLLECTION),
        where("parentId", "==", parentId),
        where("deletedAt", "==", null),
        orderBy("createdAt", "asc"),
    );

    return onSnapshot(
        q,
        (snapshot) => onChange(snapshot.docs.map((d) => d.data() as Folder)),
        (error) => {
            console.log("Erro ao ouvir pastas", error);
            onError?.(error);
        },
    );
}

export async function getFolder(folderId: string): Promise<Folder | null> {
    const snap = await getDoc(doc(getDb(), COLLECTION, folderId));
    return snap.exists() ? (snap.data() as Folder) : null;
}

export async function createFolder(folder: Folder): Promise<void> {
    await setDoc(doc(getDb(), COLLECTION, folder.id), folder);
}

export async function softDeleteFolder(folderId: string): Promise<void> {
    await softDelete(COLLECTION, folderId);
}

export async function restoreFolder(folderId: string): Promise<void> {
    await restoreItem(COLLECTION, folderId);
}
