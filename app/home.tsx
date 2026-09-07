import { useCallback, useState } from "react";
import { useRouter, useFocusEffect } from "expo-router";
import { Alert, Text, TouchableOpacity, View, StyleSheet } from "react-native";
import DraggableFlatList, {
    RenderItemParams,
} from "react-native-draggable-flatlist";

import { font, radius, spacing } from "@/constants/theme";
import { useTheme } from "@/constants/ThemeContext";
import { Background } from "@/components/Background";
import { PostItGlyph } from "@/components/PostItGlyph";
import {
    PhotosGlyph,
    FolderIcon,
    NotesGlyph,
    LinkGlyph,
} from "@/components/FolderIcons";
import { HomeWidgetCard } from "@/components/HomeWidgetCard";
import { loadActiveUser } from "@/storage/user";
import { usePostIts } from "@/hooks/usePostIts";
import { usePhotos } from "@/hooks/usePhotos";
import { useSubfolders } from "@/hooks/useFolders";
import { useHomeLayout } from "@/hooks/useHomeLayout";
import { getDriveToken } from "@/services/drive/photoService";
import { ROOT_FOLDER_ID } from "@/services/firestore/foldersService";
import { HomeWidget, UserId } from "@/types";

const FOLDERS = [
    { id: "notes", label: "Notas", route: "/notes" },
    { id: "photos", label: "Fotos", route: "/photos" },
    { id: "recados", label: "Recados", route: "/recados" },
    { id: "pastas", label: "Pastas", route: "/pastas" },
] as const;

export default function HomeScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const { postIts } = usePostIts();
    const { photos } = usePhotos();
    const { folders: subfolders } = useSubfolders(ROOT_FOLDER_ID);
    const { widgets, addWidget, removeWidget, reorderWidgets } =
        useHomeLayout();
    const [activeUser, setActiveUser] = useState<UserId | null>(null);
    const [driveToken, setDriveToken] = useState<string | null>(null);
    const [editing, setEditing] = useState(false);
    const [pickingFolder, setPickingFolder] = useState(false);

    useFocusEffect(
        useCallback(() => {
            loadActiveUser().then((user) => setActiveUser(user as UserId));
            getDriveToken()
                .then(setDriveToken)
                .catch(() => {});
        }, []),
    );

    const recentPostIts = postIts.filter((p) => p.createdBy !== activeUser);

    function renderFolderGlyph(id: string) {
        if (id === "notes") return <NotesGlyph color={theme.accent} />;
        if (id === "photos") return <PhotosGlyph color={theme.accent} />;
        if (id === "recados") return <PostItGlyph color={theme.accent} />;
        if (id === "pastas") return <LinkGlyph color={theme.accent} />;
        return null;
    }

    function handleWidgetPress(widget: HomeWidget) {
        if (widget.type === "photo") router.push("/photos");
        if (widget.type === "post-it") router.push("/recados");
        if (widget.type === "pasta" && widget.folderId) {
            router.push(`/pastas/${widget.folderId}` as any);
        }
    }

    function handleAddPasta() {
        if (subfolders.length === 0) {
            Alert.alert(
                "Nenhuma pasta ainda",
                "Crie uma pasta primeiro na tela Pastas.",
            );
            return;
        }
        setPickingFolder(true);
    }

    function renderWidget({
        item,
        drag,
        isActive,
    }: RenderItemParams<HomeWidget>) {
        const index = widgets.findIndex((w) => w.id === item.id);
        const photo =
            item.type === "photo" ? photos[item.recencyIndex ?? 0] : undefined;
        const postIt =
            item.type === "post-it"
                ? recentPostIts[item.recencyIndex ?? 0]
                : undefined;
        const folder =
            item.type === "pasta"
                ? subfolders.find((f) => f.id === item.folderId)
                : undefined;

        return (
            <View style={{ opacity: isActive ? 0.7 : 1 }}>
                <HomeWidgetCard
                    widget={item}
                    theme={theme}
                    photo={photo}
                    postIt={postIt}
                    folder={folder}
                    driveToken={driveToken}
                    editing={editing}
                    index={index}
                    onPress={() => handleWidgetPress(item)}
                    onRemove={() => removeWidget(item.id)}
                    onDrag={drag}
                />
            </View>
        );
    }

    return (
        <Background>
            <View style={styles.container}>
                <View style={styles.headerRow}>
                    <Text style={[styles.title, { color: theme.text }]}>
                        Garagem Ferrari/Mercedes
                    </Text>
                    <TouchableOpacity
                        onPress={() => setEditing((e) => !e)}
                        style={{ marginRight: spacing.md }}
                    >
                        <Text
                            style={[
                                styles.settingsIcon,
                                { color: theme.accent },
                            ]}
                        >
                            {editing ? "✓" : "✎"}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => router.push("/settings")}>
                        <Text
                            style={[
                                styles.settingsIcon,
                                { color: theme.accent },
                            ]}
                        >
                            ⚙
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.grid}>
                    {FOLDERS.map(({ id, label, route }) => (
                        <TouchableOpacity
                            key={id}
                            style={styles.tile}
                            activeOpacity={0.7}
                            onPress={() => router.push(route as any)}
                        >
                            <FolderIcon
                                accent={theme.accent}
                                surface={theme.surface}
                            >
                                {renderFolderGlyph(id)}
                            </FolderIcon>
                            <Text
                                style={[
                                    styles.tileLabel,
                                    { color: theme.text },
                                ]}
                            >
                                {label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>
                    Sua Home
                </Text>

                <DraggableFlatList
                    data={widgets}
                    keyExtractor={(item) => item.id}
                    renderItem={renderWidget}
                    onDragEnd={({ data }) => reorderWidgets(data)}
                    contentContainerStyle={{ paddingBottom: spacing.lg }}
                    ListEmptyComponent={
                        <Text
                            style={[styles.empty, { color: theme.textMuted }]}
                        >
                            Toque em ✎ e adicione widgets abaixo pra montar sua
                            Home.
                        </Text>
                    }
                />

                {editing && (
                    <View style={styles.addRow}>
                        <TouchableOpacity
                            style={[
                                styles.chip,
                                {
                                    borderColor: theme.border,
                                    backgroundColor: theme.surface,
                                },
                            ]}
                            onPress={() => addWidget("photo")}
                        >
                            <Text style={{ color: theme.text }}>▢ Foto</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.chip,
                                {
                                    borderColor: theme.border,
                                    backgroundColor: theme.surface,
                                },
                            ]}
                            onPress={() => addWidget("post-it")}
                        >
                            <Text style={{ color: theme.text }}>▤ Post-it</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.chip,
                                {
                                    borderColor: theme.border,
                                    backgroundColor: theme.surface,
                                },
                            ]}
                            onPress={handleAddPasta}
                        >
                            <Text style={{ color: theme.text }}>▥ Pasta</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {pickingFolder && (
                    <View
                        style={[
                            styles.pickerOverlay,
                            { backgroundColor: theme.surface },
                        ]}
                    >
                        <Text
                            style={[
                                styles.label,
                                { color: theme.text, marginBottom: spacing.sm },
                            ]}
                        >
                            Qual pasta?
                        </Text>
                        {subfolders.map((f) => (
                            <TouchableOpacity
                                key={f.id}
                                style={styles.pickerRow}
                                onPress={() => {
                                    addWidget("pasta", f.id);
                                    setPickingFolder(false);
                                }}
                            >
                                <Text style={{ color: theme.text }}>
                                    📁 {f.name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity
                            onPress={() => setPickingFolder(false)}
                        >
                            <Text
                                style={{
                                    color: theme.accent,
                                    marginTop: spacing.sm,
                                }}
                            >
                                Cancelar
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </Background>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.xxl,
    },
    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: spacing.xl,
    },
    title: { fontSize: font.sizes.xl, fontWeight: "700", flex: 1 },
    settingsIcon: { fontSize: 22 },
    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: spacing.lg,
        marginBottom: spacing.xl,
    },
    tile: { width: 84, alignItems: "center", gap: spacing.sm },
    tileLabel: { fontSize: font.sizes.sm },
    sectionTitle: {
        fontSize: font.sizes.sm,
        fontWeight: "600",
        textTransform: "uppercase",
        letterSpacing: 0.5,
        marginBottom: spacing.sm,
    },
    empty: { textAlign: "center", marginTop: spacing.lg },
    addRow: {
        flexDirection: "row",
        gap: spacing.sm,
        paddingVertical: spacing.md,
    },
    chip: {
        borderWidth: 1,
        borderRadius: radius.full,
        paddingVertical: 8,
        paddingHorizontal: 14,
    },
    label: { fontSize: font.sizes.sm, fontWeight: "600" },
    pickerOverlay: {
        position: "absolute",
        bottom: 80,
        left: spacing.lg,
        right: spacing.lg,
        borderRadius: radius.lg,
        padding: spacing.md,
    },
    pickerRow: { paddingVertical: spacing.sm },
});
