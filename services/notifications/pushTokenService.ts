import * as Notifications from "expo-notifications";
import { loadAppData, saveAppData } from "@/storage/notes";
import { loadActiveUser } from "@/storage/user";
import { UserId } from "@/types";
import { isGoogleConnected } from "@/services/auth/googleAuth";
import { syncWithDrive } from "@/services/drive/appDataSyncService";

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export async function registerPushToken(): Promise<void> {
    try {
        const { status: existingStatus } =
            await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== "granted") {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== "granted") {
            console.log("Permissão de notificação negada");
            return;
        }

        const tokenData = await Notifications.getExpoPushTokenAsync({
            projectId: "7d7e6ed1-6e73-48e8-b1bd-4a3e389c2678",
        });

        const token = tokenData.data;
        const user = await loadActiveUser();
        if (!user) return;

        const data = await loadAppData();
        if (data.pushTokens?.[user as UserId] === token) return;

        data.pushTokens = { ...data.pushTokens, [user as UserId]: token };
        console.log("Push token salvo localmente:", data.pushTokens);
        await saveAppData(data);
        
        const connected = await isGoogleConnected();
        if (connected) {
            await syncWithDrive();
        }

        console.log("Push token registrado:", token);
    } catch (error) {
        console.log("Erro ao registrar push token:", error);
    }
}

export async function sendPushNotification(
    toUserId: UserId,
    title: string,
    body: string,
): Promise<void> {
    try {
        const data = await loadAppData();
        const token = data.pushTokens[toUserId];

        if (!token) {
            console.log("Token não encontrado para", toUserId);
            return;
        }

        await fetch("https://exp.host/--/api/v2/push/send", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                "Accept-Encoding": "gzip, deflate",
            },
            body: JSON.stringify({
                to: token,
                title,
                body,
                sound: "default",
                priority: "high",
            }),
        });
    } catch (error) {
        console.log("Erro ao enviar notificação:", error);
    }
}

export function getOtherUser(activeUser: UserId): UserId {
    return activeUser === "lipe" ? "mari" : "lipe";
}
