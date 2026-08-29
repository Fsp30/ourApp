import { useTheme } from '@/constants/ThemeContext';
import { BlurView } from 'expo-blur';
import { ImageBackground, StyleSheet, View } from 'react-native';


export function Background({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();

  if (!theme.backgroundImage) {
    return (
      <View style={[styles.fill, { backgroundColor: theme.background }]}>
        {children}
      </View>
    );
  }

  return (
    <ImageBackground source={theme.backgroundImage} style={styles.fill} resizeMode="cover">
      <BlurView intensity={theme.blurIntensity} tint={theme.blurTint} style={styles.fill}>
        {children}
      </BlurView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
});