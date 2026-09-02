import { useState } from "react";
import {
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useRouter } from "expo-router";
import { Background } from "@/components/Background";
import { font, radius, spacing } from "@/constants/theme";
import { useTheme } from "@/constants/ThemeContext";
import { useSubfolders } from "@/hooks/useFolders";
import {
    createFolder,
    ROOT_FOLDER_ID,
} from "@/services/firestore/foldersService";
import { loadActiveUser } from "@/storage/user";
import { Folder, UserId } from "@/types";

export default function PastasScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const { folders, loading } = useSubfolders(ROOT_FOLDER_ID);
    const [newName, setNewName] = useState("");
    const [creating, setCreating] = useState(false);

    async function handleCreate() {
        if (!newName.trim()) return;
        const user = await loadActiveUser();
        if (!user) return;

        setCreating(true);
        const folder: Folder = {
            id: `folder_${Date.now()}`,
            name: newName.trim(),
            parentId: ROOT_FOLDER_ID,
            createdBy: user as UserId,
            createdAt: new Date().toISOString(),
            deletedAt: null,
        };
        await createFolder(folder);
        setNewName("");
        setCreating(false);
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
                        Pastas
                    </Text>
                    <View style={{ width: 60 }} />
                </View>

                <View style={styles.newRow}>
                    <TextInput
                        style={[
                            styles.input,
                            {
                                color: theme.text,
                                borderColor: theme.border,
                                backgroundColor: theme.surface,
                            },
                        ]}
                        placeholder="Nova pasta"
                        placeholderTextColor={theme.textMuted}
                        value={newName}
                        onChangeText={setNewName}
                    />
                    <TouchableOpacity
                        style={[
                            styles.addBtn,
                            { backgroundColor: theme.accent },
                        ]}
                        onPress={handleCreate}
                        disabled={creating || !newName.trim()}
                    >
                        <Text style={styles.addBtnText}>+</Text>
                    </TouchableOpacity>
                </View>

                <FlatList
                    data={folders}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        !loading ? (
                            <Text
                                style={[
                                    styles.empty,
                                    { color: theme.textMuted },
                                ]}
                            >
                                Nenhuma pasta ainda. Crie a primeira acima.
                            </Text>
                        ) : null
                    }
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[
                                styles.row,
                                { backgroundColor: theme.surface },
                            ]}
                            onPress={() =>
                                router.push(`/pastas/${item.id}` as any)
                            }
                            activeOpacity={0.75}
                        >
                            <Text
                                style={[styles.rowLabel, { color: theme.text }]}
                            >
                                📁 {item.name}
                            </Text>
                        </TouchableOpacity>
                    )}
                />
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
    newRow: {
        flexDirection: "row",
        gap: spacing.sm,
        paddingHorizontal: spacing.lg,
        marginBottom: spacing.md,
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderRadius: radius.md,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        fontSize: font.sizes.md,
    },
    addBtn: {
        width: 44,
        borderRadius: radius.md,
        alignItems: "center",
        justifyContent: "center",
    },
    addBtnText: { color: "#fff", fontSize: font.sizes.lg, fontWeight: "700" },
    list: { padding: spacing.lg, gap: spacing.sm },
    row: { padding: spacing.md, borderRadius: radius.md },
    rowLabel: { fontSize: font.sizes.md, fontWeight: "600" },
    empty: { textAlign: "center", marginTop: spacing.xl },
});
