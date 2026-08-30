import { useCallback, useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import {
    sendPushNotification,
    getOtherUser,
} from "@/services/notifications/pushTokenService";
import { Background } from "@/components/Background";
import { font, radius, spacing } from "@/constants/theme";
import { POST_IT_COLORS, PostItColor } from "@/constants/postItColors";
import { useTheme } from "@/constants/ThemeContext";
import {
    createPostIt,
    deletePostItById,
} from "@/services/firestore/postItsService";
import { usePostIts } from "@/hooks/usePostIts";
import { loadActiveUser } from "@/storage/user";
import { PostIt, UserId } from "@/types";

export default function RecadosScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const { postIts } = usePostIts();
    const [content, setContent] = useState("");
    const [selectedColor, setSelectedColor] = useState<PostItColor>(
        POST_IT_COLORS[0],
    );
    const [saving, setSaving] = useState(false);
    const [activeUser, setActiveUser] = useState<UserId | null>(null);

    useFocusEffect(
        useCallback(() => {
            loadActiveUser().then((user) => setActiveUser(user as UserId));
        }, []),
    );

    async function handleSave() {
        if (!content.trim() || !activeUser) return;
        setSaving(true);

        const newPostIt: PostIt = {
            id: `postit_${Date.now()}`,
            content: content.trim(),
            color: selectedColor,
            createdBy: activeUser,
            createdAt: new Date().toISOString(),
        };

        await createPostIt(newPostIt);

        const other = getOtherUser(activeUser);
        await sendPushNotification(
            other,
            "🗒️ Novo recado",
            `${activeUser}: "${content.trim().slice(0, 50)}"`,
        );

        setContent("");
        setSaving(false);
    }

    async function handleDelete(id: string) {
        await deletePostItById(id);
    }

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
                        Recados
                    </Text>
                    <View style={{ width: 60 }} />
                </View>

                <View
                    style={[styles.editor, { backgroundColor: selectedColor }]}
                >
                    <View style={styles.foldCorner} />
                    <TextInput
                        style={styles.editorInput}
                        placeholder="Escreva um recado..."
                        placeholderTextColor="rgba(0,0,0,0.35)"
                        value={content}
                        onChangeText={(t) => setContent(t.slice(0, 100))}
                        multiline
                        textAlignVertical="top"
                        maxLength={100}
                    />
                    <Text style={styles.charCount}>{content.length}/100</Text>
                </View>

                <View style={styles.colorRow}>
                    {POST_IT_COLORS.map((color) => (
                        <TouchableOpacity
                            key={color}
                            style={[
                                styles.colorDot,
                                { backgroundColor: color },
                                selectedColor === color &&
                                    styles.colorDotSelected,
                            ]}
                            onPress={() => setSelectedColor(color)}
                        />
                    ))}
                </View>

                <TouchableOpacity
                    style={[
                        styles.saveButton,
                        {
                            backgroundColor: theme.accent,
                            opacity: saving || !content.trim() ? 0.5 : 1,
                        },
                    ]}
                    onPress={handleSave}
                    disabled={saving || !content.trim()}
                >
                    <Text
                        style={[
                            styles.saveButtonText,
                            { color: theme.background },
                        ]}
                    >
                        {saving ? "Salvando..." : "Enviar recado"}
                    </Text>
                </TouchableOpacity>

                <ScrollView
                    style={styles.list}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                >
                    {postIts.map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            style={[
                                styles.postIt,
                                { backgroundColor: item.color },
                            ]}
                            onLongPress={() => {
                                if (item.createdBy === activeUser)
                                    handleDelete(item.id);
                            }}
                            activeOpacity={0.85}
                        >
                            <View style={styles.foldCorner} />
                            <Text style={styles.postItContent}>
                                {item.content}
                            </Text>
                            <Text style={styles.postItMeta}>
                                {item.createdBy} · {timeAgo(item.createdAt)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
        </Background>
    );
}

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60_000);
    const hours = Math.floor(diff / 3_600_000);
    const days = Math.floor(diff / 86_400_000);
    if (minutes < 1) return "agora";
    if (minutes < 60) return `há ${minutes} min`;
    if (hours < 24) return `há ${hours}h`;
    if (days === 1) return "ontem";
    return `há ${days} dias`;
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
    editor: {
        marginHorizontal: spacing.lg,
        borderRadius: radius.sm,
        padding: spacing.md,
        minHeight: 120,
        position: "relative",
    },
    foldCorner: {
        position: "absolute",
        top: 0,
        right: 0,
        width: 0,
        height: 0,
        borderLeftWidth: 16,
        borderBottomWidth: 16,
        borderLeftColor: "transparent",
        borderBottomColor: "rgba(0,0,0,0.12)",
    },
    editorInput: {
        fontSize: font.sizes.md,
        color: "rgba(0,0,0,0.75)",
        minHeight: 80,
        fontFamily: "System",
    },
    charCount: {
        fontSize: font.sizes.xs,
        color: "rgba(0,0,0,0.4)",
        textAlign: "right",
        marginTop: spacing.xs,
    },
    colorRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: spacing.sm,
        paddingHorizontal: spacing.lg,
        marginTop: spacing.md,
    },
    colorDot: {
        width: 24,
        height: 24,
        borderRadius: radius.full,
    },
    colorDotSelected: {
        borderWidth: 2.5,
        borderColor: "rgba(0,0,0,0.4)",
        transform: [{ scale: 1.2 }],
    },
    saveButton: {
        marginHorizontal: spacing.lg,
        marginTop: spacing.md,
        borderRadius: radius.md,
        padding: spacing.md,
        alignItems: "center",
    },
    saveButtonText: {
        fontWeight: "700",
        fontSize: font.sizes.md,
    },
    list: {
        marginTop: spacing.md,
        flex: 1,
    },
    listContent: {
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.xl,
        gap: spacing.md,
    },
    postIt: {
        borderRadius: radius.sm,
        padding: spacing.md,
        position: "relative",
        minHeight: 80,
    },
    postItContent: {
        fontSize: font.sizes.md,
        color: "rgba(0,0,0,0.75)",
        lineHeight: 20,
        paddingRight: spacing.md,
    },
    postItMeta: {
        fontSize: font.sizes.xs,
        color: "rgba(0,0,0,0.45)",
        marginTop: spacing.sm,
    },
});
