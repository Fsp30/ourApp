import { useEffect, useState } from "react";
import { subscribeToFolderItems } from "@/services/firestore/folderItemsService";
import { FolderItem } from "@/types";

export function useFolderItems(folderId: string) {
    const [items, setItems] = useState<FolderItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        const unsubscribe = subscribeToFolderItems(folderId, (list) => {
            setItems(list);
            setLoading(false);
        });
        return unsubscribe;
    }, [folderId]);

    return { items, loading };
}
