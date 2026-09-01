import { purgeExpired } from "./tombstones";
import { purgeExpiredPhotos } from "@/services/firestore/photosService";

export async function purgeAllExpired(): Promise<void> {
    try {
        const [notesCount, postItsCount, photosCount] = await Promise.all([
            purgeExpired("notes"),
            purgeExpired("postIts"),
            purgeExpiredPhotos(),
        ]);

        const total = notesCount + postItsCount + photosCount;
        if (total > 0) {
            console.log(
                `Lixeira: ${notesCount} nota(s), ${postItsCount} recado(s), ${photosCount} foto(s) apagados definitivamente.`,
            );
        }
    } catch (error) {
        console.log("Erro ao purgar itens expirados:", error);
    }
}
