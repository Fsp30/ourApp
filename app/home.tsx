import { useRouter } from 'expo-router';
import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { font, spacing } from '@/constants/theme';

import { Background } from '@/components/Background';
import { FolderIcon, NotesGlyph, PhotosGlyph } from '@/components/FolderIcons';
import { useTheme } from '@/constants/ThemeContext';

const FOLDERS = [
  { id: 'notes', label: 'Notas', route: '/notes', Glyph: NotesGlyph },
  { id: 'photos', label: 'Fotos', route: null, Glyph: PhotosGlyph },
] as const;

export default function HomeScreen() {
  const router = useRouter();
  const { theme } = useTheme();

  return (
    <Background>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Text style={[styles.title, { color: theme.text }]}>Garagem Ferrari/Mercedes</Text>
          <TouchableOpacity onPress={() => router.push('/settings')}>
            <Text style={[styles.settingsIcon, { color: theme.accent }]}>⚙</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.grid}>
          {FOLDERS.map(({ id, label, route, Glyph }) => (
            <TouchableOpacity
              key={id}
              style={styles.tile}
              activeOpacity={route ? 0.7 : 1}
              onPress={() => route && router.push(route as any)}
            >
              <FolderIcon accent={theme.accent} surface={theme.surface}>
                <Glyph color={theme.accent} />
              </FolderIcon>
              <Text style={[styles.tileLabel, { color: theme.text }]}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: font.sizes.xl,
    fontWeight: '700',
    flex: 1,
  },
  settingsIcon: {
    fontSize: 22,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
  },
  tile: {
    width: 84,
    alignItems: 'center',
    gap: spacing.sm,
  },
  tileLabel: {
    fontSize: font.sizes.sm,
  },
});