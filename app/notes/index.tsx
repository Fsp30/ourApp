import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { colors, font, radius, spacing } from '@/constants/theme';
import { loadAppData } from '@/storage/notes';
import { Note } from '@/types';

export default function NotesListScreen() {
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadAppData().then((data) => {
        const sorted = [...data.notes].sort((a, b) =>
          b.updatedAt.localeCompare(a.updatedAt)
        );
        setNotes(sorted);
      });
    }, [])
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>‹ Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Notas</Text>
        <View style={{ width: 60 }} />
      </View>

      <FlatList
        data={notes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>
            Nenhuma anotação ainda. Toque em + para criar.
          </Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.noteCard}
            onPress={() => router.push(`/notes/${item.id}`)}
          >
            <Text style={styles.noteTitle}>{item.title || 'Sem título'}</Text>
            <Text style={styles.notePreview} numberOfLines={2}>
              {item.content}
            </Text>
            <Text style={styles.noteMeta}>editado por {item.lastEditedBy}</Text>
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/notes/new')}
        activeOpacity={0.8}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.md,
  },
  back: { color: colors.purple, fontSize: font.sizes.md },
  title: { color: colors.text, fontSize: font.sizes.lg, fontWeight: '700' },
  list: { padding: spacing.lg, gap: spacing.md, flexGrow: 1 },
  empty: {
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xxl,
  },
  noteCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.xs,
  },
  noteTitle: { color: colors.text, fontSize: font.sizes.md, fontWeight: '600' },
  notePreview: { color: colors.textMuted, fontSize: font.sizes.sm },
  noteMeta: { color: colors.purple, fontSize: font.sizes.xs },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.xl,
    width: 56,
    height: 56,
    borderRadius: radius.full,
    backgroundColor: colors.purple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabIcon: { color: colors.background, fontSize: 28, fontWeight: '700' },
});