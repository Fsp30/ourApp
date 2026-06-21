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
}

export interface NoteEvent {
    id: string;
    type: EventType;
    noteId: string;
    user: UserId;
    date: string;
}

export interface PhotoEntry {
    id: string;
    name: string;
    mimeType: string;
    uploadedBy: string;
    uploadedAt: string;
}

export interface PostIt {
    id: string;
    content: string;
    coloer: string;
    createdBy: string;
    createdAt: string;
}

export interface AppData {
    notes: Note[];
    events: NoteEvent[];
    photos: PhotoEntry[];
    postIts: PostIt[];
    lastSync: string | null;
}

export interface GoogleTokens {
    accessToken: string;
    refreshToken: string;
    expiretAt: number;
}
