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
import { colors, font, radius, spacing } from '@/constants/theme';
import { loadActiveUser, saveActiveUser } from '@/storage/user';
import { UserId } from '@/types';

export default function UserSelectScreen() {
  const router = useRouter();
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
  }, []);
  
  async function handleSelect(userId: UserId) {
    await saveActiveUser(userId);
    router.replace('/home');
  }
    
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Quem está usando?</Text>
        <Text style={styles.subtitle}>Escolha seu perfil para continuar</Text>
      </View>

      <View style={styles.buttons}>
        {USERS.map((user) => (
          <TouchableOpacity
            key={user.id}
            style={styles.userButton}
            onPress={() => handleSelect(user.id)}
            activeOpacity={0.75}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <Text style={styles.userName}>{user.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
    gap: spacing.xxl,
  },
  header: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    color: colors.text,
    fontSize: font.sizes.xxl,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: font.sizes.md,
  },
  buttons: {
    gap: spacing.md,
  },
  userButton: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.background,
    fontSize: font.sizes.lg,
    fontWeight: '700',
  },
  userName: {
    color: colors.text,
    fontSize: font.sizes.lg,
    fontWeight: '600',
  },
});