import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { font, radius, spacing } from '@/constants/theme';
import { useTheme } from '@/constants/ThemeContext';
import { Background } from '@/components/Background';
import { deleteNoteById, getNote, saveNote } from '@/services/firestore/notesService';
import { loadActiveUser } from '@/storage/user';
import { syncWithDrive } from '@/services/drive/appDataSyncService';
import { sendPushNotification, getOtherUser } from '@/services/notifications/pushTokenService';
import { Note, UserId } from '@/types';

export default function NoteEditorScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const isNew = id === 'new';

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [originalNote, setOriginalNote] = useState<Note | null>(null);
  const [user, setUser] = useState<UserId | null>(null);

  useEffect(() => {
    loadActiveUser().then(setUser);
    if (!isNew) {
      getNote(id).then((note) => {
        if (note) {
          setOriginalNote(note);
          setTitle(note.title);
          setContent(note.content);
        }
      });
    }
  }, [id, isNew]);

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

    await saveNote(note)

    const other = getOtherUser(user);
    if (isNew) {
      await sendPushNotification(other, '📝 Nova nota', `${user} criou "${title || 'Sem título'}"`);
    } else {
      await sendPushNotification(other, '✏️ Nota editada', `${user} editou "${title || 'Sem título'}"`);
    }

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
          await deleteNoteById(originalNote.id);
          await sendPushNotification(
            getOtherUser(user),
            '🗑️ Nota excluída',
            `${user} excluiu "${originalNote.title || 'Sem título'}"`
          );
          router.back();
        },
      },
    ]);
  }

  return (
    <Background>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={[styles.back, { color: theme.textMuted }]}>‹ Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSave}>
            <Text style={[styles.save, { color: theme.accent }]}>Salvar</Text>
          </TouchableOpacity>
        </View>

        <TextInput
          style={[styles.titleInput, { color: theme.text, borderBottomColor: theme.border }]}
          placeholder="Título"
          placeholderTextColor={theme.textMuted}
          value={title}
          onChangeText={setTitle}
        />
        <TextInput
          style={[styles.contentInput, { color: theme.text }]}
          placeholder="Escreva algo..."
          placeholderTextColor={theme.textMuted}
          value={content}
          onChangeText={setContent}
          multiline
          textAlignVertical="top"
        />

        {!isNew && (
          <TouchableOpacity
            style={[styles.deleteButton, { backgroundColor: theme.surface, borderColor: theme.danger }]}
            onPress={handleDelete}
          >
            <Text style={[styles.deleteText, { color: theme.danger }]}>Excluir anotação</Text>
          </TouchableOpacity>
        )}
      </View>
    </Background>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
  },
  back: { fontSize: font.sizes.md },
  save: { fontSize: font.sizes.md, fontWeight: '700' },
  titleInput: {
    fontSize: font.sizes.xl,
    fontWeight: '700',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    marginBottom: spacing.md,
  },
  contentInput: {
    flex: 1,
    fontSize: font.sizes.md,
    lineHeight: 22,
  },
  deleteButton: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  deleteText: { fontWeight: '600' },
});