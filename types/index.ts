export type UserId = 'lipe' | 'mari'

export interface User{
    id: UserId;
    name: string;
}

export type EventType = 'create' | 'edit' | 'delete'

export interface Note{
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

export interface AppData{
    notes: Note[];
    events: NoteEvent[];
    lastSync: string | null;
}