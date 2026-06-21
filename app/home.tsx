import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter,useFocusEffect} from 'expo-router';
import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';

import { font, spacing } from '@/constants/theme';
import { useTheme } from '@/constants/ThemeContext';
import { Background } from '@/components/Background';
import { PostItGlyph } from '@/components/PostItGlyph';
import { syncWithDrive } from '@/lib/googleDrive';
import { isGoogleConnected } from '@/lib/googleAuth';
import { loadAppData } from '@/storage/notes';
import { loadActiveUser } from '@/storage/user';
import { PostIt, UserId } from '@/types';
import { PhotosGlyph, FolderIcon, NotesGlyph, } from '@/components/FolderIcons';

const FOLDERS = [
  { id: 'notes', label: 'Notas', route: '/notes' },
  { id: 'photos', label: 'Fotos', route: '/photos' },
  { id: 'recados', label: 'Recados', route: '/recados' },
] as const;

export default function HomeScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [recentPostIts, setRecentPostIts] = useState<PostIt[]>([]);
  const [activeUser, setActiveUser] = useState<UserId | null>(null);
  const syncInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const runSync = useCallback(async () => {
    const connected = await isGoogleConnected();
    if (!connected) return;
    await syncWithDrive();
  }, []);

  useFocusEffect(
    useCallback(() => {
      async function load() {
        const [data, user] = await Promise.all([loadAppData(), loadActiveUser()]);
        setActiveUser(user as UserId);
        const others = (data.postIts ?? []).filter((p) => p.createdBy !== user);
        setRecentPostIts(others.slice(0, 3));
      }
      load();
    }, [])
  );

  useEffect(() => {
    runSync();
    syncInterval.current = setInterval(runSync, 30_000);
    return () => {
      if (syncInterval.current) clearInterval(syncInterval.current);
    };
  }, [runSync]);

  function renderFolderGlyph(id: string) {
    if (id === 'notes') return <NotesGlyph color={theme.accent} />;
    if (id === 'photos') return <PhotosGlyph color={theme.accent} />;
    if (id === 'recados') return <PostItGlyph color={theme.accent} />;
    return null;
  }

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
          {FOLDERS.map(({ id, label, route }) => (
            <TouchableOpacity
              key={id}
              style={styles.tile}
              activeOpacity={0.7}
              onPress={() => router.push(route as any)}
            >
              <FolderIcon accent={theme.accent} surface={theme.surface}>
                {renderFolderGlyph(id)}
              </FolderIcon>
              <Text style={[styles.tileLabel, { color: theme.text }]}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {recentPostIts.length > 0 && (
          <View style={styles.postItsSection}>
            <Text style={[styles.postItsTitle, { color: theme.textMuted }]}>
              Recados para você
            </Text>
            <View style={styles.postItsRow}>
              {recentPostIts.map((item) => (
                <View
                  key={item.id}
                  style={[styles.postItCard, { backgroundColor: item.color }]}
                >
                  <View style={styles.foldCorner} />
                  <Text style={styles.postItText} numberOfLines={4}>
                    {item.content}
                  </Text>
                  <Text style={styles.postItMeta}>{timeAgo(item.createdAt)}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    </Background>
  );
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);
  if (minutes < 1) return 'agora';
  if (minutes < 60) return `há ${minutes} min`;
  if (hours < 24) return `há ${hours}h`;
  if (days === 1) return 'ontem';
  return `há ${days} dias`;
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
  settingsIcon: { fontSize: 22 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
    marginBottom: spacing.xl,
  },
  tile: {
    width: 84,
    alignItems: 'center',
    gap: spacing.sm,
  },
  tileLabel: { fontSize: font.sizes.sm },
  postItsSection: {
    flex: 1,
    gap: spacing.md,
  },
  postItsTitle: {
    fontSize: font.sizes.sm,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  postItsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  postItCard: {
    flex: 1,
    borderRadius: 4,
    padding: spacing.sm,
    minHeight: 100,
    position: 'relative',
  },
  foldCorner: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 0,
    height: 0,
    borderLeftWidth: 12,
    borderBottomWidth: 12,
    borderLeftColor: 'transparent',
    borderBottomColor: 'rgba(0,0,0,0.12)',
  },
  postItText: {
    fontSize: font.sizes.sm,
    color: 'rgba(0,0,0,0.75)',
    lineHeight: 18,
    paddingRight: spacing.xs,
  },
  postItMeta: {
    fontSize: font.sizes.xs,
    color: 'rgba(0,0,0,0.4)',
    marginTop: spacing.xs,
    position: 'absolute',
    bottom: spacing.sm,
    left: spacing.sm,
  },
});