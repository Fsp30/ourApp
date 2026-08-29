import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Background } from '@/components/Background';
import { font, radius, spacing, themes, ThemeId } from '@/constants/theme';
import { USERS } from '@/constants/users';
import { useTheme } from '@/constants/ThemeContext';
import { loadActiveUser, saveActiveUser } from '@/hooks/useActiveUser';
import { UserId } from '@/types';
import { disconnectGoogle, isGoogleConnected, signInWithGoogle } from '@/services/auth/googleAuth';

const THEME_OPTIONS: { id: ThemeId; label: string; swatch: string }[] = [
  { id: 'gengar', label: 'Gengar', swatch: themes.gengar.accent },
  { id: 'kitty', label: 'Kitty', swatch: themes.kitty.accent },
  { id: 'photo-default', label: 'Foto personalizada', swatch: themes['photo-default'].accent },
];

export default function SettingsScreen() {
  const router = useRouter();
  const { theme, themeId, setThemeId, setPhotoBackground } = useTheme();
  const [activeUser, setActiveUser] = useState<UserId | null>(null);
  const [googleConnected, setGoogleConnected] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    loadActiveUser().then(setActiveUser);
    isGoogleConnected().then(setGoogleConnected);
  }, []);

  async function handleUserChange(userId: UserId) {
    await saveActiveUser(userId);
    setActiveUser(userId);
  }

  async function handleConnectGoogle() {
    setGoogleLoading(true);
    const success = await signInWithGoogle();
    setGoogleConnected(success);
    setGoogleLoading(false);
  }

  async function handleDisconnectGoogle() {
    setGoogleLoading(true);
    await disconnectGoogle();
    setGoogleConnected(false);
    setGoogleLoading(false);
  }

  async function handlePickPhoto() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      setPhotoBackground(result.assets[0].uri);
    }
  }

  return (
    <Background>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={[styles.back, { color: theme.accent }]}>‹ Voltar</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.text }]}>Configurações</Text>
          <View style={{ width: 60 }} />
        </View>

        <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>Perfil ativo</Text>
        <View style={styles.optionsGroup}>
          {USERS.map((user) => {
            const selected = user.id === activeUser;
            return (
              <TouchableOpacity
                key={user.id}
                style={[
                  styles.optionRow,
                  {
                    backgroundColor: theme.surface,
                    borderColor: selected ? theme.accent : theme.border,
                  },
                ]}
                onPress={() => handleUserChange(user.id)}
                activeOpacity={0.75}
              >
                <View style={[styles.avatar, { backgroundColor: theme.accent }]}>
                  <Text style={[styles.avatarText, { color: theme.background }]}>
                    {user.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <Text style={[styles.optionLabel, { color: theme.text }]}>{user.name}</Text>
                {selected && <Text style={[styles.checkmark, { color: theme.accent }]}>✓</Text>}
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>Conta Google</Text>
        <View style={styles.optionsGroup}>
          <TouchableOpacity
            style={[styles.optionRow, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={googleConnected ? handleDisconnectGoogle : handleConnectGoogle}
            activeOpacity={0.75}
            disabled={googleLoading}
          >
            <Text style={[styles.optionLabel, { color: theme.text }]}>
              {googleLoading
                ? 'Aguarde...'
                : googleConnected
                ? 'Conectado — Desconectar'
                : 'Conectar conta Google'}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>Tema</Text>
        <View style={styles.optionsGroup}>
          {THEME_OPTIONS.map((option) => {
            const selected = option.id === themeId;
            return (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.optionRow,
                  {
                    backgroundColor: theme.surface,
                    borderColor: selected ? theme.accent : theme.border,
                  },
                ]}
                onPress={() => setThemeId(option.id)}
                activeOpacity={0.75}
              >
                <View style={[styles.swatch, { backgroundColor: option.swatch }]} />
                <Text style={[styles.optionLabel, { color: theme.text }]}>{option.label}</Text>
                {selected && <Text style={[styles.checkmark, { color: theme.accent }]}>✓</Text>}
              </TouchableOpacity>
            );
          })}
        </View>

        {themeId === 'photo-default' && (
          <TouchableOpacity
            style={[
              styles.photoButton,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
            onPress={handlePickPhoto}
            activeOpacity={0.75}
          >
            <Text style={[styles.optionLabel, { color: theme.text }]}>
              Escolher imagem da galeria
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </Background>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.lg, paddingTop: spacing.xxl, gap: spacing.md },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  back: { fontSize: font.sizes.md },
  title: { fontSize: font.sizes.lg, fontWeight: '700' },
  sectionTitle: {
    fontSize: font.sizes.sm,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: spacing.sm,
  },
  optionsGroup: { gap: spacing.sm },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.md,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: font.sizes.md, fontWeight: '700' },
  swatch: {
    width: 28,
    height: 28,
    borderRadius: radius.sm,
  },
  optionLabel: { fontSize: font.sizes.md, fontWeight: '600', flex: 1 },
  checkmark: { fontSize: font.sizes.lg, fontWeight: '700' },
  photoButton: {
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.md,
    alignItems: 'center',
  },
});