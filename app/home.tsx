import { useCallback, useState } from "react";
import { useRouter, useFocusEffect } from "expo-router";
import {
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { font, radius, spacing } from "@/constants/theme";
import { useTheme } from "@/constants/ThemeContext";
import { Background } from "@/components/Background";
import { loadActiveUser } from "@/storage/user";
import { usePostIts } from "@/hooks/usePostIts";
import { usePhotos } from "@/hooks/usePhotos";
import { useSubfolders } from "@/hooks/useFolders";
import { useHomeLayout } from "@/hooks/useHomeLayout";
import { softDeletePostIt } from "@/services/firestore/postItsService";
import { getDriveToken } from "@/services/drive/photoService";
import { ROOT_FOLDER_ID } from "@/services/firestore/foldersService";
import { timeAgo } from "@/lib/timeAgo";
import {
    HomeWidget,
    HomeWidgetType,
    PhotoEntry,
    PostIt,
    Folder,
    UserId,
} from "@/types";

const NAV_ITEMS = [
    {
        id: "notes",
        label: "Notas",
        route: "/notes",
        icon: "document-text-outline",
    },
    { id: "photos", label: "Fotos", route: "/photos", icon: "image-outline" },
    {
        id: "recados",
        label: "Recados",
        route: "/recados",
        icon: "chatbox-ellipses-outline",
    },
    {
        id: "pastas",
        label: "Pastas",
        route: "/pastas",
        icon: "folder-open-outline",
    },
] as const;

const POSTIT_COLORS = ["#F4C978", "#F0A6A0", "#A9C9A4"];
const POSTIT_ROTATIONS = [-2, 1, -1];
const HEIGHT_ESTIMATE: Record<HomeWidgetType, number> = {
    photo: 200,
    "post-it": 90,
    pasta: 64,
};

function splitIntoColumns(widgets: HomeWidget[]): [HomeWidget[], HomeWidget[]] {
    const left: HomeWidget[] = [];
    const right: HomeWidget[] = [];
    let leftHeight = 0;
    let rightHeight = 0;

    for (const w of widgets) {
        const h = HEIGHT_ESTIMATE[w.type] ?? 90;
        if (leftHeight <= rightHeight) {
            left.push(w);
            leftHeight += h;
        } else {
            right.push(w);
            rightHeight += h;
        }
    }
    return [left, right];
}

export default function HomeScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const { postIts } = usePostIts();
    const { photos } = usePhotos();
    const { folders: subfolders } = useSubfolders(ROOT_FOLDER_ID);
    const { title, setTitle, widgets, addWidget, removeWidget, moveWidget } =
        useHomeLayout();
    const [activeUser, setActiveUser] = useState<UserId | null>(null);
    const [driveToken, setDriveToken] = useState<string | null>(null);
    const [editing, setEditing] = useState(false);
    const [pickingFolder, setPickingFolder] = useState(false);
    const [titleDraft, setTitleDraft] = useState(title);
    const recentPostIts = postIts.filter((p) => p.createdBy !== activeUser);

    useFocusEffect(
        useCallback(() => {
            loadActiveUser().then((user) => setActiveUser(user as UserId));
            getDriveToken()
                .then(setDriveToken)
                .catch(() => {});
        }, []),
    );

    useState(() => {
        setTitleDraft(title);
    });

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
        rotationSeed: number,
        photo?: PhotoEntry,
        postIt?: PostIt,
        folder?: Folder,
    ) {
        if (widget.type === "photo") {
            return photo && driveToken ? (
                <Image
                    source={{
                        uri: `https://www.googleapis.com/drive/v3/files/${photo.id}?alt=media`,
                        headers: { Authorization: `Bearer ${driveToken}` },
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
            );
        }

        if (widget.type === "post-it") {
            const rotation =
                POSTIT_ROTATIONS[rotationSeed % POSTIT_ROTATIONS.length];
            return (
                <TouchableOpacity
                    activeOpacity={0.85}
                    onLongPress={() => {
                        if (postIt && postIt.createdBy === activeUser) {
                            softDeletePostIt(postIt.id);
                        }
                    }}
                    style={[
                        styles.postit,
                        {
                            backgroundColor:
                                POSTIT_COLORS[
                                    rotationSeed % POSTIT_COLORS.length
                                ],
                            transform: [{ rotate: `${rotation}deg` }],
                        },
                    ]}
                >
                    <Text style={styles.postitText} numberOfLines={3}>
                        {postIt ? postIt.content : "Nenhum recado ainda"}
                    </Text>
                    {postIt && (
                        <Text style={styles.postitMeta}>
                            {postIt.createdBy} · {timeAgo(postIt.createdAt)}
                        </Text>
                    )}
                </TouchableOpacity>
            );
        }

        if (widget.type === "pasta") {
            return (
                <View style={styles.pastaRow}>
                    <Ionicons
                        name="folder-outline"
                        size={22}
                        color={theme.accent}
                    />
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
            );
        }

        return null;
    }

    function renderWidget(widget: HomeWidget, index: number) {
        const photo =
            widget.type === "photo"
                ? photos[widget.recencyIndex ?? 0]
                : undefined;
        const postIt =
            widget.type === "post-it"
                ? recentPostIts[widget.recencyIndex ?? 0]
                : undefined;
        const folder =
            widget.type === "pasta"
                ? subfolders.find((f) => f.id === widget.folderId)
                : undefined;

        return (
            <TouchableOpacity
                key={widget.id}
                activeOpacity={0.85}
                onPress={editing ? undefined : () => handleWidgetPress(widget)}
                style={[
                    styles.card,
                    {
                        backgroundColor: theme.surface,
                        borderColor: theme.border,
                    },
                ]}
            >
                {editing && (
                    <View style={styles.editControls}>
                        <TouchableOpacity
                            onPress={() => moveWidget(index, -1)}
                            hitSlop={8}
                            style={styles.editBtn}
                        >
                            <Ionicons
                                name="chevron-up"
                                size={14}
                                color="#fff"
                            />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => moveWidget(index, 1)}
                            hitSlop={8}
                            style={styles.editBtn}
                        >
                            <Ionicons
                                name="chevron-down"
                                size={14}
                                color="#fff"
                            />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => removeWidget(widget.id)}
                            hitSlop={8}
                            style={[
                                styles.editBtn,
                                { backgroundColor: "rgba(200,50,50,0.85)" },
                            ]}
                        >
                            <Ionicons name="close" size={14} color="#fff" />
                        </TouchableOpacity>
                    </View>
                )}
                {renderWidgetContent(widget, index, photo, postIt, folder)}
            </TouchableOpacity>
        );
    }

    const [leftColumn, rightColumn] = splitIntoColumns(widgets);

    return (
        <Background>
            <View style={styles.container}>
                <View style={styles.header}>
                    <TextInput
                        style={[styles.titleInput, { color: theme.text }]}
                        value={titleDraft}
                        onChangeText={setTitleDraft}
                        onBlur={() => setTitle(titleDraft)}
                        placeholder="Nosso Espaço"
                        placeholderTextColor={theme.textMuted}
                    />
                    <TouchableOpacity
                        onPress={() => setEditing((e) => !e)}
                        style={styles.headerIconBtn}
                    >
                        <Ionicons
                            name={editing ? "checkmark" : "create-outline"}
                            size={20}
                            color={theme.accent}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => router.push("/settings")}
                        style={styles.headerIconBtn}
                    >
                        <Ionicons
                            name="settings-outline"
                            size={20}
                            color={theme.accent}
                        />
                    </TouchableOpacity>
                </View>

                <Text style={[styles.hint, { color: theme.textMuted }]}>
                    toque no título pra renomear
                </Text>

                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {widgets.length === 0 ? (
                        <Text
                            style={[styles.empty, { color: theme.textMuted }]}
                        >
                            Toque no lápis e adicione widgets abaixo pra montar
                            sua Home.
                        </Text>
                    ) : (
                        <View style={styles.columns}>
                            <View style={styles.column}>
                                {leftColumn.map((w) =>
                                    renderWidget(
                                        w,
                                        widgets.findIndex((x) => x.id === w.id),
                                    ),
                                )}
                            </View>
                            <View style={styles.column}>
                                {rightColumn.map((w) =>
                                    renderWidget(
                                        w,
                                        widgets.findIndex((x) => x.id === w.id),
                                    ),
                                )}
                            </View>
                        </View>
                    )}

                    {editing && (
                        <View style={styles.addSection}>
                            <View style={styles.chipRow}>
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
                                    <Text style={{ color: theme.text }}>
                                        ▢ Foto
                                    </Text>
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
                                    <Text style={{ color: theme.text }}>
                                        ▥ Pasta
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {pickingFolder && (
                                <View
                                    style={[
                                        styles.pickerBox,
                                        { backgroundColor: theme.surface },
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.label,
                                            {
                                                color: theme.text,
                                                marginBottom: spacing.sm,
                                            },
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
                    )}
                </ScrollView>

                <View
                    style={[
                        styles.bottomNav,
                        {
                            borderTopColor: theme.border,
                            backgroundColor: theme.surfaceAlt,
                        },
                    ]}
                >
                    {NAV_ITEMS.map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            style={styles.navItem}
                            activeOpacity={0.7}
                            onPress={() => router.push(item.route as any)}
                        >
                            <Ionicons
                                name={item.icon as any}
                                size={22}
                                color={theme.accent}
                            />
                            <Text
                                style={[
                                    styles.navLabel,
                                    { color: theme.textMuted },
                                ]}
                            >
                                {item.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </Background>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, paddingTop: spacing.xxl },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: spacing.lg,
        gap: spacing.sm,
    },
    titleInput: {
        flex: 1,
        fontSize: font.sizes.lg,
        fontWeight: "700",
    },
    headerIconBtn: { padding: spacing.xs },
    hint: {
        fontSize: font.sizes.xs,
        paddingHorizontal: spacing.lg,
        marginTop: spacing.xs,
        marginBottom: spacing.sm,
    },
    scrollContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl },
    columns: { flexDirection: "row", gap: spacing.sm },
    column: { flex: 1, gap: spacing.sm },
    card: {
        borderRadius: radius.lg,
        borderWidth: 1,
        padding: spacing.sm,
        position: "relative",
    },
    editControls: {
        position: "absolute",
        top: 6,
        right: 6,
        flexDirection: "row",
        gap: 4,
        zIndex: 2,
    },
    editBtn: {
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: "rgba(0,0,0,0.5)",
        alignItems: "center",
        justifyContent: "center",
    },
    photoImg: { width: "100%", height: 180, borderRadius: radius.md },
    postit: {
        minHeight: 90,
        justifyContent: "center",
        padding: spacing.sm,
        borderRadius: radius.sm,
        shadowColor: "#000",
        shadowOpacity: 0.25,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
        elevation: 4,
    },
    postitText: { fontSize: font.sizes.sm, color: "rgba(0,0,0,0.75)" },
    postitMeta: {
        fontSize: 10.5,
        color: "rgba(0,0,0,0.5)",
        marginTop: spacing.xs,
    },
    pastaRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
    label: { fontSize: font.sizes.sm, fontWeight: "600" },
    pastaSub: { fontSize: 10.5 },
    empty: { textAlign: "center", marginTop: spacing.xl },
    addSection: { marginTop: spacing.md, gap: spacing.sm },
    chipRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
    chip: {
        borderWidth: 1,
        borderRadius: radius.full,
        paddingVertical: 8,
        paddingHorizontal: 14,
    },
    pickerBox: { borderRadius: radius.lg, padding: spacing.md },
    pickerRow: { paddingVertical: spacing.sm },
    bottomNav: {
        flexDirection: "row",
        justifyContent: "space-around",
        paddingVertical: spacing.sm,
        borderTopWidth: 1,
    },
    navItem: { alignItems: "center", gap: 4, padding: spacing.xs },
    navLabel: { fontSize: 10.5, fontWeight: "600" },
});
