import { subscribeToNotes } from "@/services/firestore/notesService";
import { Note } from "@/types";
import { useEffect, useState } from "react";

export function useNotes() {
    const [notes, setNotes] = useState<Note[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = subscribeToNotes((list) => {
            setNotes(list);
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    return { notes, loading };
}
