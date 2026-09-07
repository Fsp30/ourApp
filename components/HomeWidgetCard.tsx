import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { FolderIcon } from "@/components/FolderIcons";
import { font, radius, spacing } from "@/constants/theme";
import { HomeWidget, PhotoEntry, PostIt, Folder } from "@/types";

const POSTIT_COLORS = ["#F4C978", "#F0A6A0", "#A9C9A4"];

type Props = {
    widget: HomeWidget;
    theme: any;
    photo?: PhotoEntry;
    postIt?: PostIt;
    folder?: Folder;
    driveToken: string | null;
    editing: boolean;
    index: number;
    onPress: () => void;
    onRemove: () => void;
    onDrag: () => void;
};

export function HomeWidgetCard({
    widget,
    theme,
    photo,
    postIt,
    folder,
    driveToken,
    editing,
    index,
    onPress,
    onRemove,
    onDrag,
}: Props) {
    return (
        <TouchableOpacity
            style={[
                styles.card,
                { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
            activeOpacity={0.8}
            onPress={editing ? undefined : onPress}
            onLongPress={editing ? onDrag : undefined}
            delayLongPress={150}
        >
            {editing && (
                <TouchableOpacity
                    style={styles.removeBtn}
                    onPress={onRemove}
                    hitSlop={10}
                >
                    <Text style={styles.removeBtnText}>×</Text>
                </TouchableOpacity>
            )}

            {widget.type === "photo" && (
                <View style={styles.photoRow}>
                    {photo && driveToken ? (
                        <Image
                            source={{
                                uri: `https://www.googleapis.com/drive/v3/files/${photo.id}?alt=media`,
                                headers: {
                                    Authorization: `Bearer ${driveToken}`,
                                },
                            }}
                            style={styles.photoImg}
                            resizeMode="cover"
                        />
                    ) : (
                        <View
                            style={[
                                styles.photoImg,
                                { backgroundColor: theme.surfaceAlt },
                            ]}
                        />
                    )}
                    <Text style={[styles.label, { color: theme.text }]}>
                        {photo ? "Foto recente" : "Nenhuma foto ainda"}
                    </Text>
                </View>
            )}

            {widget.type === "post-it" && (
                <View
                    style={[
                        styles.postit,
                        {
                            backgroundColor:
                                POSTIT_COLORS[index % POSTIT_COLORS.length],
                        },
                    ]}
                >
                    <Text style={styles.postitText} numberOfLines={3}>
                        {postIt ? postIt.content : "Nenhum recado ainda"}
                    </Text>
                    {postIt && (
                        <Text style={styles.postitBadge}>
                            {(widget.recencyIndex ?? 0) === 0
                                ? "mais recente"
                                : `${(widget.recencyIndex ?? 0) + 1}º mais recente`}
                        </Text>
                    )}
                </View>
            )}

            {widget.type === "pasta" && (
                <View style={styles.pastaRow}>
                    <FolderIcon accent={theme.accent} surface={theme.surface} />
                    <View>
                        <Text style={[styles.label, { color: theme.text }]}>
                            {folder?.name ?? "Pasta removida"}
                        </Text>
                        <Text
                            style={[
                                styles.pastaSub,
                                { color: theme.textMuted },
                            ]}
                        >
                            toque para abrir
                        </Text>
                    </View>
                </View>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: radius.lg,
        borderWidth: 1,
        padding: spacing.md,
        marginBottom: spacing.sm,
    },
    removeBtn: {
        position: "absolute",
        top: 6,
        right: 6,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: "rgba(0,0,0,0.45)",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2,
    },
    removeBtnText: { color: "#fff", fontSize: 14, lineHeight: 14 },
    photoRow: { gap: spacing.sm },
    photoImg: { width: "100%", height: 160, borderRadius: radius.md },
    label: { fontSize: font.sizes.sm, fontWeight: "600" },
    postit: {
        minHeight: 80,
        justifyContent: "center",
        padding: spacing.sm,
        borderRadius: radius.sm,
    },
    postitText: { fontSize: font.sizes.sm, color: "rgba(0,0,0,0.75)" },
    postitBadge: {
        fontSize: 10,
        color: "rgba(0,0,0,0.5)",
        marginTop: spacing.xs,
    },
    pastaRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
    pastaSub: { fontSize: font.sizes.xs },
});
