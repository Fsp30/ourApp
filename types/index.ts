import { Firestore } from "@react-native-firebase/firestore";

export type UserId = "lipe" | "mari";

export interface User {
    id: UserId;
    name: string;
}

export type EventType = "create" | "edit" | "delete";

export interface Note {
    id: string;
    title: string;
    content: string;
    createdBy: UserId;
    lastEditedBy: UserId;
    createdAt: string;
    updatedAt: string;
    deletedAt: Firestore | null;
}

export interface NoteEvent {
    id: string;
    type: EventType;
    noteId: string;
    user: UserId;
    date: string;
    deletedAt: Firestore | null;
}

export interface PhotoEntry {
    id: string;
    name: string;
    mimeType: string;
    uploadedBy: string;
    uploadedAt: string;
    deletedAt: Firestore | null;
}

export interface PostIt {
    id: string;
    content: string;
    color: string;
    createdBy: string;
    createdAt: string;
    deletedAt: Firestore | null;
}

export interface AppData {
    notes: Note[];
    events: NoteEvent[];
    photos: PhotoEntry[];
    postIts: PostIt[];
    pushTokens: Partial<Record<UserId, string>>;
    lastSync: string | null;
}

export interface GoogleTokens {
    accessToken: string;
    refreshToken: string;
    expiretAt: number;
}
