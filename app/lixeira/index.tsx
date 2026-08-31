import { useState, useEffect } from "react";
import {
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useRouter } from "expo-router";
import { Background } from "@/components/Background";
import { font, radius, spacing } from "@/constants/theme";
import { useTheme } from "@/constants/ThemeContext";
import { subscribeToTrash, restoreItem } from "@/services/sync/tombstones";
import { getDriveToken } from "@/services/drive/photoService";
import { Note, PostIt, PhotoEntry } from "@/types";

type Tab = "notes" | "postIts" | "photos";

export default function LixeiraScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const [tab, setTab] = useState<Tab>("notes");

    const [notes, setNotes] = useState<Note[]>([]);
    const [postIts, setPostIts] = useState<PostIt[]>([]);
    const [photos, setPhotos] = useState<PhotoEntry[]>([]);
    const [driveToken, setDriveToken] = useState<string | null>(null);

    useEffect(() => {
        const unsub1 = subscribeToTrash<Note>("notes", setNotes);
        const unsub2 = subscribeToTrash<PostIt>("postIts", setPostIts);
        const unsub3 = subscribeToTrash<PhotoEntry>("photos", setPhotos);
        getDriveToken()
            .then(setDriveToken)
            .catch(() => {});
        return () => {
            unsub1();
            unsub2();
            unsub3();
        };
    }, []);

    const tabs: { key: Tab; label: string; count: number }[] = [
        { key: "notes", label: "Notas", count: notes.length },
        { key: "postIts", label: "Recados", count: postIts.length },
        { key: "photos", label: "Fotos", count: photos.length },
    ];

    return (
        <Background>
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Text style={[styles.back, { color: theme.accent }]}>
                            ‹ Voltar
                        </Text>
                    </TouchableOpacity>
                    <Text style={[styles.title, { color: theme.text }]}>
                        Lixeira
                    </Text>
                    <View style={{ width: 60 }} />
                </View>

                <View style={styles.tabs}>
                    {tabs.map((t) => (
                        <TouchableOpacity
                            key={t.key}
                            onPress={() => setTab(t.key)}
                            style={[
                                styles.tabBtn,
                                tab === t.key && {
                                    backgroundColor: theme.accent + "22",
                                },
                            ]}
                        >
                            <Text
                                style={[
                                    styles.tabText,
                                    {
                                        color:
                                            tab === t.key
                                                ? theme.accent
                                                : theme.textMuted,
                                    },
                                ]}
                            >
                                {t.label} ({t.count})
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <Text style={[styles.hint, { color: theme.textMuted }]}>
                    Itens são apagados definitivamente após 7 dias na lixeira.
                </Text>

                {tab === "notes" && (
                    <FlatList
                        data={notes}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.list}
                        ListEmptyComponent={
                            <Text
                                style={[
                                    styles.empty,
                                    { color: theme.textMuted },
                                ]}
                            >
                                Lixeira vazia.
                            </Text>
                        }
                        renderItem={({ item }) => (
                            <View
                                style={[
                                    styles.row,
                                    { backgroundColor: theme.surface },
                                ]}
                            >
                                <View style={{ flex: 1 }}>
                                    <Text
                                        style={[
                                            styles.rowTitle,
                                            { color: theme.text },
                                        ]}
                                        numberOfLines={1}
                                    >
                                        {item.title || "Sem título"}
                                    </Text>
                                    <Text
                                        style={[
                                            styles.rowSubtitle,
                                            { color: theme.textMuted },
                                        ]}
                                        numberOfLines={1}
                                    >
                                        {item.content}
                                    </Text>
                                </View>
                                <TouchableOpacity
                                    onPress={() =>
                                        restoreItem("notes", item.id)
                                    }
                                >
                                    <Text
                                        style={[
                                            styles.restore,
                                            { color: theme.accent },
                                        ]}
                                    >
                                        Restaurar
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    />
                )}

                {tab === "postIts" && (
                    <FlatList
                        data={postIts}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.list}
                        ListEmptyComponent={
                            <Text
                                style={[
                                    styles.empty,
                                    { color: theme.textMuted },
                                ]}
                            >
                                Lixeira vazia.
                            </Text>
                        }
                        renderItem={({ item }) => (
                            <View
                                style={[
                                    styles.row,
                                    { backgroundColor: theme.surface },
                                ]}
                            >
                                <View style={{ flex: 1 }}>
                                    <Text
                                        style={[
                                            styles.rowSubtitle,
                                            { color: theme.text },
                                        ]}
                                        numberOfLines={2}
                                    >
                                        {item.content}
                                    </Text>
                                </View>
                                <TouchableOpacity
                                    onPress={() =>
                                        restoreItem("postIts", item.id)
                                    }
                                >
                                    <Text
                                        style={[
                                            styles.restore,
                                            { color: theme.accent },
                                        ]}
                                    >
                                        Restaurar
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    />
                )}

                {tab === "photos" && (
                    <FlatList
                        data={photos}
                        keyExtractor={(item) => item.id}
                        numColumns={3}
                        contentContainerStyle={styles.list}
                        ListEmptyComponent={
                            <Text
                                style={[
                                    styles.empty,
                                    { color: theme.textMuted },
                                ]}
                            >
                                Lixeira vazia.
                            </Text>
                        }
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.photoTile}
                                onPress={() => restoreItem("photos", item.id)}
                            >
                                {driveToken ? (
                                    <Image
                                        source={{
                                            uri: `https://www.googleapis.com/drive/v3/files/${item.id}?alt=media`,
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
                                            { backgroundColor: theme.surface },
                                        ]}
                                    />
                                )}
                                <Text style={[styles.restoreOverlay]}>
                                    ↺ Restaurar
                                </Text>
                            </TouchableOpacity>
                        )}
                    />
                )}
            </View>
        </Background>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.xxl,
        paddingBottom: spacing.md,
    },
    back: { fontSize: font.sizes.md },
    title: { fontSize: font.sizes.lg, fontWeight: "700" },
    tabs: {
        flexDirection: "row",
        paddingHorizontal: spacing.lg,
        gap: spacing.sm,
    },
    tabBtn: {
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        borderRadius: radius.md,
    },
    tabText: { fontSize: font.sizes.sm, fontWeight: "600" },
    hint: {
        fontSize: font.sizes.xs,
        paddingHorizontal: spacing.lg,
        marginTop: spacing.sm,
        marginBottom: spacing.sm,
    },
    list: { padding: spacing.lg, gap: spacing.sm },
    row: {
        flexDirection: "row",
        alignItems: "center",
        padding: spacing.md,
        borderRadius: radius.md,
        gap: spacing.md,
    },
    rowTitle: { fontSize: font.sizes.md, fontWeight: "600" },
    rowSubtitle: { fontSize: font.sizes.sm },
    restore: { fontSize: font.sizes.sm, fontWeight: "700" },
    empty: { textAlign: "center", marginTop: spacing.xl },
    photoTile: { flex: 1 / 3, aspectRatio: 1, margin: 2 },
    photoImg: { flex: 1, borderRadius: 2 },
    restoreOverlay: {
        position: "absolute",
        bottom: 4,
        left: 4,
        right: 4,
        textAlign: "center",
        fontSize: 10,
        color: "#fff",
        backgroundColor: "rgba(0,0,0,0.5)",
        borderRadius: 4,
    },
});
