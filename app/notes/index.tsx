import { useState } from "react";
import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useRouter } from "expo-router";
import { font, radius, spacing } from "@/constants/theme";
import { Background } from "@/components/Background";
import { useNotes } from "@/hooks/useNotes";
import { useTheme } from "@/constants/ThemeContext";

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60_000);
    const hours = Math.floor(diff / 3_600_000);
    const days = Math.floor(diff / 86_400_000);

    if (minutes < 1) return "agora mesmo";
    if (minutes < 60) return `há ${minutes} min`;
    if (hours < 24) return `há ${hours}h`;
    if (days === 1) return "ontem";
    return `há ${days} dias`;
}

export default function NotesListScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const { notes } = useNotes();

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
                        Notas
                    </Text>
                    <View style={{ width: 60 }} />
                </View>

                <FlatList
                    data={notes}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <Text
                            style={[styles.empty, { color: theme.textMuted }]}
                        >
                            Nenhuma anotação ainda. Toque em + para criar.
                        </Text>
                    }
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[
                                styles.noteCard,
                                {
                                    backgroundColor: theme.surface,
                                    borderColor: theme.border,
                                },
                            ]}
                            onPress={() => router.push(`/notes/${item.id}`)}
                        >
                            <Text
                                style={[
                                    styles.noteTitle,
                                    { color: theme.text },
                                ]}
                            >
                                {item.title || "Sem título"}
                            </Text>
                            <Text
                                style={[
                                    styles.notePreview,
                                    { color: theme.textMuted },
                                ]}
                                numberOfLines={2}
                            >
                                {item.content}
                            </Text>
                            <Text
                                style={[
                                    styles.noteMeta,
                                    { color: theme.accent },
                                ]}
                            >
                                {item.lastEditedBy === item.createdBy &&
                                item.createdAt === item.updatedAt
                                    ? `criado por ${item.createdBy}`
                                    : `editado por ${item.lastEditedBy}`}{" "}
                                · {timeAgo(item.updatedAt)}
                            </Text>
                        </TouchableOpacity>
                    )}
                />

                <TouchableOpacity
                    style={[styles.fab, { backgroundColor: theme.accent }]}
                    onPress={() => router.push("/notes/new")}
                    activeOpacity={0.8}
                >
                    <Text style={[styles.fabIcon, { color: theme.background }]}>
                        +
                    </Text>
                </TouchableOpacity>
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
    list: { padding: spacing.lg, gap: spacing.md, flexGrow: 1 },
    empty: {
        textAlign: "center",
        marginTop: spacing.xxl,
    },
    noteCard: {
        borderRadius: radius.md,
        borderWidth: 1,
        padding: spacing.md,
        gap: spacing.xs,
    },
    noteTitle: { fontSize: font.sizes.md, fontWeight: "600" },
    notePreview: { fontSize: font.sizes.sm },
    noteMeta: { fontSize: font.sizes.xs },
    fab: {
        position: "absolute",
        right: spacing.lg,
        bottom: spacing.xl,
        width: 56,
        height: 56,
        borderRadius: radius.full,
        alignItems: "center",
        justifyContent: "center",
    },
    fabIcon: { fontSize: 28, fontWeight: "700" },
});
