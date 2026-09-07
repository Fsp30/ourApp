import { useEffect, useState } from "react";
import { Alert, FlatList, Linking, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Background } from "@/components/Background";
import { font, radius, spacing } from "@/constants/theme";
import { useTheme } from "@/constants/ThemeContext";
import { useFolderItems } from "@/hooks/useFolderItems";
import { createLinkItem, softDeleteFolderItem } from "@/services/firestore/folderItemsService";
import { getFolder } from "@/services/firestore/foldersService";
import { loadActiveUser } from "@/storage/user";
import { Folder, FolderItem, UserId } from "@/types";

export default function FolderDetailScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { folderId } = useLocalSearchParams<{ folderId: string }>();
  const { items, loading } = useFolderItems(folderId);
  const [folder, setFolder] = useState<Folder | null>(null);
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getFolder(folderId).then(setFolder);
  }, [folderId]);

  async function handleAddLink() {
    if (!label.trim() || !url.trim()) return;
    const user = await loadActiveUser();
    if (!user) return;

    let normalizedUrl = url.trim();
    if (!/^https?:\/\//i.test(normalizedUrl)) {
      normalizedUrl = `https://${normalizedUrl}`;
    }

    setSaving(true);
    const item: FolderItem = {
      id: `link_${Date.now()}`,
      folderId,
      type: "link",
      label: label.trim(),
      url: normalizedUrl,
      driveFileId: null,
      createdBy: user as UserId,
      createdAt: new Date().toISOString(),
      deletedAt: null,
    };
    await createLinkItem(item);
    setLabel("");
    setUrl("");
    setSaving(false);
  }

  function handleOpenLink(item: FolderItem) {
    Alert.alert(item.label, item.url ?? "", [
      { text: "Cancelar", style: "cancel" },
      { text: "Abrir", onPress: () => item.url && Linking.openURL(item.url) },
      { text: "Excluir", style: "destructive", onPress: () => softDeleteFolderItem(item.id) },
    ]);
  }

  return (
    <Background>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={[styles.back, { color: theme.accent }]}>‹ Voltar</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
            {folder?.name ?? "Pasta"}
          </Text>
          <View style={{ width: 60 }} />
        </View>

        <View style={styles.form}>
          <TextInput
            style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.surface }]}
            placeholder="Apelido do link"
            placeholderTextColor={theme.textMuted}
            value={label}
            onChangeText={setLabel}
          />
          <TextInput
            style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.surface }]}
            placeholder="URL"
            placeholderTextColor={theme.textMuted}
            value={url}
            onChangeText={setUrl}
            autoCapitalize="none"
            keyboardType="url"
          />
          <TouchableOpacity
            style={[styles.saveBtn, { backgroundColor: theme.accent }]}
            onPress={handleAddLink}
            disabled={saving || !label.trim() || !url.trim()}
          >
            <Text style={styles.saveBtnText}>Adicionar link</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            !loading ? <Text style={[styles.empty, { color: theme.textMuted }]}>Nenhum link ainda.</Text> : null
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.row, { backgroundColor: theme.surface }]}
              onPress={() => handleOpenLink(item)}
              activeOpacity={0.75}
            >
              <Text style={[styles.rowLabel, { color: theme.text }]}>🔗 {item.label}</Text>
              <Text style={[styles.rowUrl, { color: theme.textMuted }]} numberOfLines={1}>
                {item.url}
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
  title: { fontSize: font.sizes.lg, fontWeight: "700", flex: 1, textAlign: "center" },
  form: { paddingHorizontal: spacing.lg, gap: spacing.sm, marginBottom: spacing.md },
  input: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: font.sizes.md,
  },
  saveBtn: { borderRadius: radius.md, paddingVertical: spacing.sm, alignItems: "center" },
  saveBtnText: { color: "#fff", fontWeight: "700" },
  list: { padding: spacing.lg, gap: spacing.sm },
  row: { padding: spacing.md, borderRadius: radius.md, gap: 2 },
  rowLabel: { fontSize: font.sizes.md, fontWeight: "600" },
  rowUrl: { fontSize: font.sizes.xs },
  empty: { textAlign: "center", marginTop: spacing.xl },
});