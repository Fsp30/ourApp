import {
    doc,
    getDoc,
    setDoc,
    serverTimestamp,
} from "@react-native-firebase/firestore";
import { getDb } from "./firestoreClient";
import { UserId } from "@/types";

const COLLECTION = "pushTokens";

export async function getPushToken(userId: UserId): Promise<string | null> {
    const snap = await getDoc(doc(getDb(), COLLECTION, userId));
    return snap.exists() ? ((snap.data()?.token as string) ?? null) : null;
}

export async function savePushToken(
    userId: UserId,
    token: string,
): Promise<void> {
    await setDoc(doc(getDb(), COLLECTION, userId), {
        token,
        updatedAt: serverTimestamp(),
    });
}
