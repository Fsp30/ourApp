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
import { PostIt } from "@/types";

const COLLECTION = "postIts";

export function subscribeToPostIts(
    onChange: (postIts: PostIt[]) => void,
    onError?: (error: Error) => void,
): Unsubscribe {
    const q = query(
        collection(getDb(), COLLECTION),
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

export async function deletePostItById(postItId: string): Promise<void> {
    await deleteDoc(doc(getDb(), COLLECTION, postItId));
}
