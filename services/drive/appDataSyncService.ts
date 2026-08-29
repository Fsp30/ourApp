import { AppData, PhotoEntry, PostIt } from "@/types";
import { loadAppData, saveAppData } from "@/storage/notes";
import { getToken, findFile, downloadJson, uploadJson } from "./driveClient";

const FILE_NAME = "ourapp-data.json";

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

  const postItsMap = new Map<string, PostIt>();
  for (const postIt of [...(remote.postIts ?? []), ...(local.postIts ?? [])]) {
    postItsMap.set(postIt.id, postIt);
  }

  return {
    notes: Array.from(notesMap.values()),
    events: Array.from(eventsMap.values()).sort((a, b) => b.date.localeCompare(a.date)),
    photos: Array.from(photosMap.values()).sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt)),
    postIts: Array.from(postItsMap.values()).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    pushTokens: { ...remote.pushTokens, ...local.pushTokens },
    lastSync: new Date().toISOString(),
  };
}

export async function syncWithDrive(): Promise<boolean> {
  try {
    const token = await getToken();
    const fileId = await findFile(token, FILE_NAME);
    const local = await loadAppData();

    if (fileId) {
      const remote = await downloadJson<AppData>(token, fileId);
      if (remote) {
        const merged = mergeData(local, remote);
        await saveAppData(merged);
        await uploadJson(token, fileId, FILE_NAME, merged);
      } else {
        await uploadJson(token, fileId, FILE_NAME, { ...local, lastSync: new Date().toISOString() });
      }
    } else {
      await uploadJson(token, null, FILE_NAME, { ...local, lastSync: new Date().toISOString() });
    }

    return true;
  } catch (error) {
    console.log("Erro ao sincronizar com Drive:", error);
    return false;
  }
}