import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors, font, radius, spacing } from '@/constants/theme';
import { deleteNote, loadAppData, upsertNote } from '@/storage/notes';
import { loadActiveUser } from '@/storage/user';
import { Note, UserId } from '@/types';

export default function NoteEditorScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const isNew = id === 'new';

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [originalNote, setOriginalNote] = useState<Note | null>(null);
  const [user, setUser] = useState<UserId | null>(null);

  useEffect(() => {
    loadActiveUser().then(setUser);
    if (!isNew) {
      loadAppData().then((data) => {
        const note = data.notes.find((n) => n.id === id);
        if (note) {
          setOriginalNote(note);
          setTitle(note.title);
          setContent(note.content);
        }
      });
    }
  }, [id]);

  async function handleSave() {
    if (!user) return;
    const now = new Date().toISOString();

    const note: Note = originalNote
      ? { ...originalNote, title, content, lastEditedBy: user, updatedAt: now }
      : {
          id: `note_${Date.now()}`,
          title,
          content,
          createdBy: user,
          lastEditedBy: user,
          createdAt: now,
          updatedAt: now,
        };

    await upsertNote(note, isNew ? 'create' : 'edit', user);
    router.back();
  }

  function handleDelete() {
    if (!originalNote || !user) return;
    Alert.alert('Excluir anotação', 'Tem certeza?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          await deleteNote(originalNote.id, user);
          router.back();
        },
      },
    ]);
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>‹ Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleSave}>
          <Text style={styles.save}>Salvar</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.titleInput}
        placeholder="Título"
        placeholderTextColor={colors.textMuted}
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={styles.contentInput}
        placeholder="Escreva algo..."
        placeholderTextColor={colors.textMuted}
        value={content}
        onChangeText={setContent}
        multiline
        textAlignVertical="top"
      />

      {!isNew && (
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.deleteText}>Excluir anotação</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
  },
  back: { color: colors.textMuted, fontSize: font.sizes.md },
  save: { color: colors.purple, fontSize: font.sizes.md, fontWeight: '700' },
  titleInput: {
    color: colors.text,
    fontSize: font.sizes.xl,
    fontWeight: '700',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: spacing.md,
  },
  contentInput: {
    flex: 1,
    color: colors.text,
    fontSize: font.sizes.md,
    lineHeight: 22,
  },
  deleteButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  deleteText: { color: colors.danger, fontWeight: '600' },
});