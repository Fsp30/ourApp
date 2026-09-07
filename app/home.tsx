import { useCallback, useState } from "react";
import { useRouter, useFocusEffect } from "expo-router";
import { Alert, Image, StyleSheet } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import DraggableFlatList, {
    RenderItemParams,
} from "react-native-draggable-flatlist";

import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { Text } from "@/components/ui/text";

import {  radius, spacing } from "@/constants/theme";
import { useTheme } from "@/constants/ThemeContext";
import { Background } from "@/components/Background";
import { PostItGlyph } from "@/components/PostItGlyph";
import {
    PhotosGlyph,
    FolderIcon,
    NotesGlyph,
    LinkGlyph,
} from "@/components/FolderIcons";
import { loadActiveUser } from "@/storage/user";
import { usePostIts } from "@/hooks/usePostIts";
import { usePhotos } from "@/hooks/usePhotos";
import { useSubfolders } from "@/hooks/useFolders";
import { useHomeLayout } from "@/hooks/useHomeLayout";
import { getDriveToken } from "@/services/drive/photoService";
import { ROOT_FOLDER_ID } from "@/services/firestore/foldersService";
import { HomeWidget, PhotoEntry, PostIt, Folder, UserId } from "@/types";

const FOLDERS = [
    { id: "notes", label: "Notas", route: "/notes" },
    { id: "photos", label: "Fotos", route: "/photos" },
    { id: "recados", label: "Recados", route: "/recados" },
    { id: "pastas", label: "Pastas", route: "/pastas" },
] as const;

const POSTIT_COLORS = ["#F4C978", "#F0A6A0", "#A9C9A4"];
const POSTIT_ROTATIONS = ["-rotate-2", "rotate-1", "-rotate-1"];

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

    function renderWidgetContent(
        widget: HomeWidget,
        index: number,
        photo?: PhotoEntry,
        postIt?: PostIt,
        folder?: Folder,
    ) {
        if (widget.type === "photo") {
            return (
                <VStack space="sm">
                    {photo && driveToken ? (
                        <Image
                            source={{
                                uri: `https://www.googleapis.com/drive/v3/files/${photo.id}?alt=media`,
                                headers: { Authorization: `Bearer ${driveToken}` },
                            }}
                            className="w-full h-40 rounded-xl"
                            resizeMode="cover"
                        />
                    ) : (
                        <Box
                            className="w-full h-40 rounded-xl"
                            style={{ backgroundColor: theme.surfaceAlt }}
                        />
                    )}
                    <Text
                        className="text-sm font-semibold"
                        style={{ color: theme.text }}
                    >
                        {photo ? "Foto recente" : "Nenhuma foto ainda"}
                    </Text>
                </VStack>
            );
        }

        if (widget.type === "post-it") {
            const ordinal = widget.recencyIndex ?? 0;
            return (
                <Box
                    className={`rounded-lg p-3 min-h-20 justify-center shadow-md ${POSTIT_ROTATIONS[index % POSTIT_ROTATIONS.length]}`}
                    style={{
                        backgroundColor: POSTIT_COLORS[index % POSTIT_COLORS.length],
                    }}
                >
                    <Text
                        className="text-sm"
                        style={{ color: "rgba(0,0,0,0.75)" }}
                        numberOfLines={3}
                    >
                        {postIt ? postIt.content : "Nenhum recado ainda"}
                    </Text>
                    {postIt && (
                        <Text
                            className="text-[10px] mt-1"
                            style={{ color: "rgba(0,0,0,0.5)" }}
                        >
                            {ordinal === 0
                                ? "mais recente"
                                : `${ordinal + 1}º mais recente`}
                        </Text>
                    )}
                </Box>
            );
        }

        if (widget.type === "pasta") {
            return (
                <HStack space="sm" className="items-center">
                    <FolderIcon accent={theme.accent} surface={theme.surface} />
                    <VStack>
                        <Text
                            className="text-sm font-semibold"
                            style={{ color: theme.text }}
                        >
                            {folder?.name ?? "Pasta removida"}
                        </Text>
                        <Text
                            className="text-[10.5px]"
                            style={{ color: theme.textMuted }}
                        >
                            toque para abrir
                        </Text>
                    </VStack>
                </HStack>
            );
        }

        return null;
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
            <TouchableOpacity
                onPress={editing ? undefined : () => handleWidgetPress(item)}
                onLongPress={editing ? drag : undefined}
                delayLongPress={150}
                activeOpacity={0.85}
                style={{ opacity: isActive ? 0.7 : 1 }}
            >
                <Box
                    className="rounded-2xl border p-4 mb-2 relative"
                    style={{
                        backgroundColor: theme.surface,
                        borderColor: theme.border,
                    }}
                >
                    {editing && (
                        <TouchableOpacity
                            onPress={() => removeWidget(item.id)}
                            hitSlop={10}
                            style={styles.removeBtn}
                        >
                            <Text style={styles.removeBtnText}>×</Text>
                        </TouchableOpacity>
                    )}
                    {renderWidgetContent(item, index, photo, postIt, folder)}
                </Box>
            </TouchableOpacity>
        );
    }

    return (
        <Background>
            <Box className="flex-1 px-6 pt-16">
                <HStack className="items-center justify-between mb-6">
                    <Text
                        className="text-xl font-bold flex-1"
                        style={{ color: theme.text }}
                    >
                        Garagem Ferrari/Mercedes
                    </Text>
                    <TouchableOpacity
                        onPress={() => setEditing((e) => !e)}
                        style={{ marginRight: spacing.md }}
                    >
                        <Text
                            style={[styles.settingsIcon, { color: theme.accent }]}
                        >
                            {editing ? "✓" : "✎"}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => router.push("/settings")}>
                        <Text
                            style={[styles.settingsIcon, { color: theme.accent }]}
                        >
                            ⚙
                        </Text>
                    </TouchableOpacity>
                </HStack>

                <HStack className="flex-wrap gap-6 mb-8">
                    {FOLDERS.map(({ id, label, route }) => (
                        <TouchableOpacity
                            key={id}
                            style={styles.tile}
                            activeOpacity={0.7}
                            onPress={() => router.push(route as any)}
                        >
                            <FolderIcon accent={theme.accent} surface={theme.surface}>
                                {renderFolderGlyph(id)}
                            </FolderIcon>
                            <Text
                                className="text-sm"
                                style={{ color: theme.text }}
                            >
                                {label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </HStack>

                <Text
                    className="text-sm font-semibold uppercase tracking-wide mb-2"
                    style={{ color: theme.textMuted }}
                >
                    Sua Home
                </Text>

                <DraggableFlatList
                    style={{ flex: 1 }}
                    data={widgets}
                    keyExtractor={(item) => item.id}
                    renderItem={renderWidget}
                    onDragEnd={({ data }) => reorderWidgets(data)}
                    contentContainerStyle={{ paddingBottom: spacing.xl }}
                    ListEmptyComponent={
                        <Text
                            className="text-center mt-6"
                            style={{ color: theme.textMuted }}
                        >
                            Toque em ✎ e adicione widgets abaixo pra montar sua Home.
                        </Text>
                    }
                    ListFooterComponent={
                        editing ? (
                            <VStack space="sm" className="pt-4">
                                <HStack space="sm" className="flex-wrap">
                                    <TouchableOpacity
                                        onPress={() => addWidget("photo")}
                                        style={[
                                            styles.chip,
                                            {
                                                borderColor: theme.border,
                                                backgroundColor: theme.surface,
                                            },
                                        ]}
                                    >
                                        <Text style={{ color: theme.text }}>▢ Foto</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => addWidget("post-it")}
                                        style={[
                                            styles.chip,
                                            {
                                                borderColor: theme.border,
                                                backgroundColor: theme.surface,
                                            },
                                        ]}
                                    >
                                        <Text style={{ color: theme.text }}>
                                            ▤ Post-it
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={handleAddPasta}
                                        style={[
                                            styles.chip,
                                            {
                                                borderColor: theme.border,
                                                backgroundColor: theme.surface,
                                            },
                                        ]}
                                    >
                                        <Text style={{ color: theme.text }}>▥ Pasta</Text>
                                    </TouchableOpacity>
                                </HStack>

                                {pickingFolder && (
                                    <Box
                                        className="rounded-2xl p-4"
                                        style={{ backgroundColor: theme.surface }}
                                    >
                                        <Text
                                            className="font-semibold mb-2"
                                            style={{ color: theme.text }}
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
                                    </Box>
                                )}
                            </VStack>
                        ) : null
                    }
                />
            </Box>
        </Background>
    );
}

const styles = StyleSheet.create({
    settingsIcon: { fontSize: 22 },
    tile: { width: 84, alignItems: "center", gap: spacing.sm },
    chip: {
        borderWidth: 1,
        borderRadius: radius.full,
        paddingVertical: 8,
        paddingHorizontal: 14,
    },
    pickerRow: { paddingVertical: spacing.sm },
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
});
