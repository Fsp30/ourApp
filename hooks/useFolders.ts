import { useEffect, useState } from "react";
import { subscribeToSubfolders } from "@/services/firestore/foldersService";
import { Folder } from "@/types";

export function useSubfolders(parentId: string) {
    const [folders, setFolders] = useState<Folder[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        const unsubscribe = subscribeToSubfolders(parentId, (list) => {
            setFolders(list);
            setLoading(false);
        });
        return unsubscribe;
    }, [parentId]);

    return { folders, loading };
}
