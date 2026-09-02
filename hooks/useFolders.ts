import { subscribeToSubfolders } from "@/services/firestore/foldersService";
import { Folder } from "@/types";
import { useEffect, useState } from "react";

export function useSubFolders(parentId: string) {
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
