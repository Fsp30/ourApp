import { GoogleSignin } from "@react-native-google-signin/google-signin";

const DRIVE_API = "https://www.googleapis.com/drive/v3";
const UPLOAD_API = "https://www.googleapis.com/upload/drive/v3";

export async function getToken(): Promise<string> {
    try {
        const tokens = await GoogleSignin.getTokens();
        return tokens.accessToken;
    } catch (error) {
        console.log(
            "getToken erro real:",
            JSON.stringify(error),
            String(error),
        );
        throw new Error("Não autenticado");
    }
}

export async function findFile(
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

export async function downloadJson<T>(
    token: string,
    fileId: string,
): Promise<T | null> {
    const res = await fetch(`${DRIVE_API}/files/${fileId}?alt=media`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    try {
        return (await res.json()) as T;
    } catch {
        return null;
    }
}

export async function uploadJson<T>(
    token: string,
    fileId: string | null,
    fileName: string,
    data: T,
): Promise<string> {
    const body = JSON.stringify(data);
    const metadata = { name: fileName, mimeType: "application/json" };
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

export async function createFileMetadata(
    token: string,
    name: string,
    mimeType: string,
    parents?: string[],
): Promise<string | null> {
    const res = await fetch(`${DRIVE_API}/files`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, mimeType, parents }),
    });
    const data = await res.json();
    return data.id ?? null;
}

export async function uploadBinaryContent(
    token: string,
    fileId: string,
    mimeType: string,
    uri: string,
): Promise<boolean> {
    const res = await fetch(`${UPLOAD_API}/files/${fileId}?uploadType=media`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": mimeType },
        body: { uri } as any,
    });
    const result = await res.json();
    return Boolean(result.id);
}

export async function createFolder(
    token: string,
    name: string,
): Promise<string | null> {
    const res = await fetch(`${DRIVE_API}/files`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            name,
            mimeType: "application/vnd.google-apps.folder",
        }),
    });
    const data = await res.json();
    return data.id ?? null;
}

export async function deleteFile(token: string, fileId: string): Promise<void> {
    await fetch(`${DRIVE_API}/files/${fileId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
    });
}
