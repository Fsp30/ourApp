import { PhotoEntry, UserId } from "@/types";
import {
    createFileMetadata,
    createFolder,
    deleteFile,
    findFile,
    getToken,
    uploadBinaryContent,
} from "./driveClient";
import { loadAppData, saveAppData } from "@/storage/notes";
import { syncWithDrive } from "./appDataSyncService";

const FOLDER_NAME = "ourapp-photos";

async function findOrCreatePhotosFolder(token: string): Promise<string> {
    const existing = await findFile(token, FOLDER_NAME);
    if (existing) return existing;

    const created = await createFolder(token, FOLDER_NAME);
    if (!created) throw new Error("Não foi possivél criar a pasta fotos");
    return created;
}

export async function uploadPhoto(
    uri: string,
    fileName: string,
    mimeType: string,
    uploadedBy: UserId,
): Promise<PhotoEntry | null> {
    try {
        const token = await getToken();
        const folderId = await findOrCreatePhotosFolder(token);

        const fileId = await createFileMetadata(token, fileName, mimeType, [
            folderId,
        ]);
        if (!fileId) return null;

        const ok = await uploadBinaryContent(token, fileId, mimeType, uri);
        if (!ok) return null;

        const entry: PhotoEntry = {
            id: fileId,
            name: fileName,
            mimeType,
            uploadedBy,
            uploadedAt: new Date().toISOString(),
        };

        const data = await loadAppData();
        data.photos = [entry, ...data.photos];
        await saveAppData(data);
        await syncWithDrive();

        return entry;
    } catch (err) {
        console.log("Erro upload detalhado:", JSON.stringify(err), String(err));
        return null;
    }
}

export async function deletePhoto(fileId: string): Promise<boolean> {
    try {
        const token = await getToken();
        await deleteFile(token, fileId);

        const data = await loadAppData();
        data.photos = data.photos.filter((p) => p.id !== fileId);
        await saveAppData(data);
        await syncWithDrive();

        return true;
    } catch (err) {
        console.log("Erro ao deletar foto:", err);
        return false;
    }
}

export async function getPhotoUrl(
    fileId: string,
    token?: string,
): Promise<string> {
    const t = token ?? (await getToken());
    return `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&access_token=${t}`;
}

export async function getDriveToken(): Promise<string> {
    return getToken();
}
