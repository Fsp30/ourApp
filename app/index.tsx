import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { USERS } from '@/constants/users';
import { font, radius, spacing } from '@/constants/theme';
import { useTheme } from '@/constants/ThemeContext';
import { Background } from '@/components/Background';
import { loadActiveUser, saveActiveUser } from '@/storage/user';
import { UserId } from '@/types';

export default function UserSelectScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
      loadActiveUser()
        .then((userId) => {
          if (userId) {
            router.replace('/home');
          } else {
            setLoading(false);
          }
        })
        .catch(() => setLoading(false));
  }, [router]); 


  async function handleSelect(userId: UserId) {
    await saveActiveUser(userId);
    router.replace('/home');
  }

  if (loading) {
    return (
      <Background>
        <View style={styles.center}>
          <ActivityIndicator color={theme.accent} />
        </View>
      </Background>
    );
  }

  return (
    <Background>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>Quem está usando?</Text>
          <Text style={[styles.subtitle, { color: theme.textMuted }]}>
            Escolha seu perfil para continuar
          </Text>
        </View>

        <View style={styles.buttons}>
          {USERS.map((user) => (
            <TouchableOpacity
              key={user.id}
              style={[
                styles.userButton,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
              onPress={() => handleSelect(user.id)}
              activeOpacity={0.75}
            >
              <View style={[styles.avatar, { backgroundColor: theme.accent }]}>
                <Text style={[styles.avatarText, { color: theme.background }]}>
                  {user.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <Text style={[styles.userName, { color: theme.text }]}>{user.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </Background>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
    gap: spacing.xxl,
  },
  header: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    fontSize: font.sizes.xxl,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: font.sizes.md,
  },
  buttons: {
    gap: spacing.md,
  },
  userButton: {
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: font.sizes.lg,
    fontWeight: '700',
  },
  userName: {
    fontSize: font.sizes.lg,
    fontWeight: '600',
  },
});