import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { AppData } from '@/types';
import { loadAppData, saveAppData } from '@/storage/notes';

const FILE_NAME = 'ourapp-data.json';
const DRIVE_API = 'https://www.googleapis.com/drive/v3';
const UPLOAD_API = 'https://www.googleapis.com/upload/drive/v3';

async function getToken(): Promise<string> {
  const tokens = await GoogleSignin.getTokens();
  return tokens.accessToken;
}

async function findFile(token: string): Promise<string | null> {
  const query = encodeURIComponent(`name='${FILE_NAME}' and trashed=false`);
  const res = await fetch(`${DRIVE_API}/files?q=${query}&fields=files(id,name)`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  return data.files?.[0]?.id ?? null;
}

async function downloadFile(token: string, fileId: string): Promise<AppData | null> {
  const res = await fetch(`${DRIVE_API}/files/${fileId}?alt=media`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  try {
    return await res.json() as AppData;
  } catch {
    return null;
  }
}

async function uploadFile(token: string, fileId: string | null, data: AppData): Promise<string> {
  const body = JSON.stringify(data);
  const metadata = { name: FILE_NAME, mimeType: 'application/json' };

  if (fileId) {
    const res = await fetch(
      `${UPLOAD_API}/files/${fileId}?uploadType=multipart`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/related; boundary=boundary',
        },
        body: [
          '--boundary',
          'Content-Type: application/json',
          '',
          JSON.stringify(metadata),
          '--boundary',
          'Content-Type: application/json',
          '',
          body,
          '--boundary--',
        ].join('\r\n'),
      }
    );
    const result = await res.json();
    return result.id;
  } else {
  
    const res = await fetch(
      `${UPLOAD_API}/files?uploadType=multipart`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/related; boundary=boundary',
        },
        body: [
          '--boundary',
          'Content-Type: application/json',
          '',
          JSON.stringify(metadata),
          '--boundary',
          'Content-Type: application/json',
          '',
          body,
          '--boundary--',
        ].join('\r\n'),
      }
    );
    const result = await res.json();
    return result.id;
  }
}

function mergeData(local: AppData, remote: AppData): AppData {
  const notesMap = new Map<string, AppData['notes'][0]>();
  for (const note of [...remote.notes, ...local.notes]) {
    const existing = notesMap.get(note.id);
    if (!existing || note.updatedAt > existing.updatedAt) {
      notesMap.set(note.id, note);
    }
  }

  const eventsMap = new Map<string, AppData['events'][0]>();
  for (const event of [...remote.events, ...local.events]) {
    eventsMap.set(event.id, event);
  }

  const merged: AppData = {
    notes: Array.from(notesMap.values()),
    events: Array.from(eventsMap.values()).sort((a, b) =>
      b.date.localeCompare(a.date)
    ),
    lastSync: new Date().toISOString(),
  };

  return merged;
}

export async function syncWithDrive(): Promise<boolean> {
  try {
    const token = await getToken();
    const fileId = await findFile(token);
    const local = await loadAppData();

    if (fileId) {
      const remote = await downloadFile(token, fileId);
      if (remote) {
        const merged = mergeData(local, remote);
        await saveAppData(merged);
        await uploadFile(token, fileId, merged);
      } else {
        await uploadFile(token, fileId, { ...local, lastSync: new Date().toISOString() });
      }
    } else {
      await uploadFile(token, null, { ...local, lastSync: new Date().toISOString() });
    }

    return true;
  } catch (error) {
    console.log('Erro ao sincronizar com Drive:', error);
    return false;
  }
}