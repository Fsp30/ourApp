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
import { PostIt } from "@/types";

const COLLECTION = "postIts";

export function subscribeToPostIts(
    onChange: (postIts: PostIt[]) => void,
    onError?: (error: Error) => void,
): Unsubscribe {
    const q = query(
        collection(getDb(), COLLECTION),
        where("deletedAt", "==", null),
        orderBy("createdAt", "desc"),
    );
    return onSnapshot(
        q,
        (snapshot) => onChange(snapshot.docs.map((d) => d.data() as PostIt)),
        (error) => {
            console.log("Erro ao ouvir recados:", error);
            onError?.(error);
        },
    );
}

export async function createPostIt(postIt: PostIt): Promise<void> {
    await setDoc(doc(getDb(), COLLECTION, postIt.id), postIt);
}

export async function softDeletePostIt(postItId: string): Promise<void> {
    await softDelete(COLLECTION, postItId);
}

export async function restorePostIt(postItId: string): Promise<void> {
    await restoreItem(COLLECTION, postItId);
}
