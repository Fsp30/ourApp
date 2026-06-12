import { useRouter } from 'expo-router';
import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { font, spacing } from '@/constants/theme';
import { useTheme } from '@/constants/ThemeContext';
import { Background } from '@/components/Background';
import { FolderIcon, NotesGlyph, PhotosGlyph } from '@/components/FolderIcons'

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
        <Text style={[styles.title, { color: theme.text }]}>Garagem Ferrari/Mercedes</Text>

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
  title: {
    fontSize: font.sizes.xl,
    fontWeight: '700',
    marginBottom: spacing.xl,
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