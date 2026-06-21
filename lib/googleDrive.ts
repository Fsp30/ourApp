import { AppData, PhotoEntry, UserId } from "@/types";
import { loadAppData, saveAppData } from "@/storage/notes";
import { GoogleSignin } from "@react-native-google-signin/google-signin";

const FILE_NAME = "ourapp-data.json";
const FOLDER_NAME = "ourapp-photos";
const DRIVE_API = "https://www.googleapis.com/drive/v3";
const UPLOAD_API = "https://www.googleapis.com/upload/drive/v3";

async function getToken(): Promise<string> {
  try {
    const tokens = await GoogleSignin.getTokens();
    return tokens.accessToken;
  } catch (error) {
    console.log('getToken erro real:', JSON.stringify(error), String(error));
    throw new Error('Não autenticado');
  }
}

async function findFile(
    token: string,
    name: string,
    parentId?: string,
): Promise<string | null> {
    let query = `name='${name}' and trashed=false`;
    if (parentId) query += ` and '${parentId}' in parents`;

    const res = await fetch(
        `${DRIVE_API}/files?q=${encodeURIComponent(query)}&fields=files(id,name)`,
        { headers: { Authorization: `Bearer ${token}` } },
    );
    const data = await res.json();
    return data.files?.[0]?.id ?? null;
}

async function downloadFile(
    token: string,
    fileId: string,
): Promise<AppData | null> {
    const res = await fetch(`${DRIVE_API}/files/${fileId}?alt=media`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    try {
        return (await res.json()) as AppData;
    } catch {
        return null;
    }
}

async function uploadJsonFile(
    token: string,
    fileId: string | null,
    data: AppData,
): Promise<string> {
    const body = JSON.stringify(data);
    const metadata = { name: FILE_NAME, mimeType: "application/json" };
    const method = fileId ? "PATCH" : "POST";
    const url = fileId
        ? `${UPLOAD_API}/files/${fileId}?uploadType=multipart`
        : `${UPLOAD_API}/files?uploadType=multipart`;

    const res = await fetch(url, {
        method,
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/related; boundary=boundary",
        },
        body: [
            "--boundary",
            "Content-Type: application/json",
            "",
            JSON.stringify(metadata),
            "--boundary",
            "Content-Type: application/json",
            "",
            body,
            "--boundary--",
        ].join("\r\n"),
    });
    const result = await res.json();
    return result.id;
}

function mergeData(local: AppData, remote: AppData): AppData {
    const notesMap = new Map<string, AppData["notes"][0]>();
    for (const note of [...remote.notes, ...local.notes]) {
        const existing = notesMap.get(note.id);
        if (!existing || note.updatedAt > existing.updatedAt) {
            notesMap.set(note.id, note);
        }
    }

    const eventsMap = new Map<string, AppData["events"][0]>();
    for (const event of [...remote.events, ...local.events]) {
        eventsMap.set(event.id, event);
    }

    const photosMap = new Map<string, PhotoEntry>();
    for (const photo of [...(remote.photos ?? []), ...(local.photos ?? [])]) {
        photosMap.set(photo.id, photo);
    }

    return {
        notes: Array.from(notesMap.values()),
        events: Array.from(eventsMap.values()).sort((a, b) =>
            b.date.localeCompare(a.date),
        ),
        photos: Array.from(photosMap.values()).sort((a, b) =>
            b.uploadedAt.localeCompare(a.uploadedAt),
        ),
        lastSync: new Date().toISOString(),
    };
}

export async function syncWithDrive(): Promise<boolean> {
    try {
        const token = await getToken();
        const fileId = await findFile(token, FILE_NAME);
        const local = await loadAppData();

        if (fileId) {
            const remote = await downloadFile(token, fileId);
            if (remote) {
                const merged = mergeData(local, remote);
                await saveAppData(merged);
                await uploadJsonFile(token, fileId, merged);
            } else {
                await uploadJsonFile(token, fileId, {
                    ...local,
                    lastSync: new Date().toISOString(),
                });
            }
        } else {
            await uploadJsonFile(token, null, {
                ...local,
                lastSync: new Date().toISOString(),
            });
        }

        return true;
    } catch (error) {
        console.log("Erro ao sincronizar com Drive:", error);
        return false;
    }
}

async function findOrCreatePhotosFolder(token: string): Promise<string> {
  const existing = await findFile(token, FOLDER_NAME);
  console.log('Pasta existente:', existing);
  
  if (existing) return existing;

  const res = await fetch(`${DRIVE_API}/files`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: FOLDER_NAME,
      mimeType: 'application/vnd.google-apps.folder',
    }),
  });
  
  const data = await res.json();
  console.log('Pasta criada:', JSON.stringify(data));
  return data.id;
}
export async function uploadPhoto(
  uri: string,
  fileName: string,
  mimeType: string,
  uploadedBy: UserId
): Promise<PhotoEntry | null> {
  try {
    const token = await getToken();
    const folderId = await findOrCreatePhotosFolder(token);

    const metaRes = await fetch(`${DRIVE_API}/files`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: fileName,
        mimeType,
        parents: [folderId],
      }),
    });
    const metaData = await metaRes.json();
    console.log('Meta criada:', JSON.stringify(metaData));
    if (!metaData.id) return null;

    const uploadRes = await fetch(
      `${UPLOAD_API}/files/${metaData.id}?uploadType=media`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': mimeType,
        },
        body: { uri } as any,
      }
    );
    console.log('Upload status:', uploadRes.status);
    const uploaded = await uploadRes.json();
    console.log('Upload result:', JSON.stringify(uploaded));

    if (!uploaded.id) return null;

    const entry: PhotoEntry = {
      id: uploaded.id,
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
  } catch (error) {
    console.log('Erro upload detalhado:', JSON.stringify(error), String(error));
    return null;
  }
}
export async function deletePhoto(fileId: string): Promise<boolean> {
    try {
        const token = await getToken();
        await fetch(`${DRIVE_API}/files/${fileId}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
        });

        const data = await loadAppData();
        data.photos = data.photos.filter((p) => p.id !== fileId);
        await saveAppData(data);
        await syncWithDrive();

        return true;
    } catch (error) {
        console.log("Erro ao deletar foto:", error);
        return false;
    }
}

export async function getPhotoUrl(fileId: string, token?: string): Promise<string> {
  const t = token ?? (await getToken());
  return `${DRIVE_API}/files/${fileId}?alt=media&access_token=${t}`;
}

export async function getDriveToken(): Promise<string> {
  return getToken();
}