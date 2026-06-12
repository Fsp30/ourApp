import { useRouter } from 'expo-router';
import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { colors, font, spacing } from '@/constants/theme';
import { FolderIcon, NotesGlyph, PhotosGlyph } from '@/components/FolderIcons';


const FOLDERS = [
  { id: 'notes', label: 'Notas', route: '/notes', Glyph: NotesGlyph },
  { id: 'photos', label: 'Fotos', route: null, Glyph: PhotosGlyph },
] as const;

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Garagem Ferrari/Mercedes</Text>

      <View style={styles.grid}>
        {FOLDERS.map(({ id, label, route, Glyph }) => (
          <TouchableOpacity
            key={id}
            style={styles.tile}
            activeOpacity={route ? 0.7 : 1}
            onPress={() => route && router.push(route as any)}
          >
            <FolderIcon>
              <Glyph />
            </FolderIcon>
            <Text style={styles.tileLabel}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
  },
  title: {
    color: colors.text,
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
    color: colors.text,
    fontSize: font.sizes.sm,
  },
});