import { useEffect, useState } from "react";
import { subscribeToPostIts } from "@/services/firestore/postItsService";
import { PostIt } from "@/types";

export function usePostIts() {
    const [postIts, setPostIts] = useState<PostIt[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = subscribeToPostIts((list) => {
            setPostIts(list);
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    return { postIts, loading };
}
