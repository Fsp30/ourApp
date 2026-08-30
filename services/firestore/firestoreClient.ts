import { getApp } from "@react-native-firebase/app";
import { getFirestore, type Firestore } from "@react-native-firebase/firestore";

let dbInstance: Firestore | null = null;

export function getDb(): Firestore {
    if (!dbInstance) {
        dbInstance = getFirestore(getApp());
    }
    return dbInstance;
}
