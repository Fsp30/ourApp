import { useEffect, useState } from "react";
import {
    subscribeToPhotos,
    savePhotoEntry,
    softDeletePhotoEntry,
} from "@/services/firestore/photosService";
import { uploadPhotoBinary } from "@/services/drive/photoService";
import { PhotoEntry, UserId } from "@/types";

export function usePhotos() {
    const [photos, setPhotos] = useState<PhotoEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = subscribeToPhotos((list) => {
            setPhotos(list);
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    async function addPhoto(
        uri: string,
        fileName: string,
        mimeType: string,
        uploadedBy: UserId,
    ): Promise<PhotoEntry | null> {
        const fileId = await uploadPhotoBinary(uri, fileName, mimeType);
        if (!fileId) return null;

        const entry: PhotoEntry = {
            id: fileId,
            name: fileName,
            mimeType,
            uploadedBy,
            uploadedAt: new Date().toISOString(),
            deletedAt: null,
        };

        await savePhotoEntry(entry);
        return entry;
    }

    async function removePhoto(photoId: string): Promise<void> {
        await softDeletePhotoEntry(photoId);
    }

    return { photos, loading, addPhoto, removePhoto };
}
