import { UserId } from "@/types";
import * as activeUserStorage from "@/storage/user";
import { registerPushToken } from "@/services/notificatios/pushToeknService";

export async function loadActiveUser(): Promise<UserId | null> {
    return activeUserStorage.loadActiveUser();
}

export async function saveActionUser(userId: UserId): Promise<void> {
    await activeUserStorage.saveActiveUser(userId);
    try {
        await registerPushToken();
    } catch (error) {
        console.log("Erro ao registrar push token na troca de usuário:", error);
    }
}

export async function clearActiveUser(): Promise<void> {
    return activeUserStorage.clearActiveUser();
}
