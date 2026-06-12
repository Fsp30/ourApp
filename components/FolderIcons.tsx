import { View, StyleSheet } from 'react-native';
import { radius } from '@/constants/theme';

const SIZE = 64;

interface FolderIconProps {
  children?: React.ReactNode;
  accent: string;
  surface: string;
}

export function FolderIcon({ children, accent, surface }: FolderIconProps) {
  return (
    <View style={styles.wrapper}>
      <View style={[styles.tab, { backgroundColor: surface, borderColor: accent }]} />
      <View style={[styles.body, { backgroundColor: surface, borderColor: accent }]}>
        {children}
      </View>
    </View>
  );
}

export function NotesGlyph({ color }: { color: string }) {
  return (
    <View style={{ gap: 4, alignItems: 'flex-start' }}>
      <View style={[glyphStyles.line, { width: 22, backgroundColor: color }]} />
      <View style={[glyphStyles.line, { width: 15, backgroundColor: color }]} />
      <View style={[glyphStyles.line, { width: 18, backgroundColor: color }]} />
    </View>
  );
}

export function PhotosGlyph({ color }: { color: string }) {
  return (
    <View style={{ width: 30, height: 22 }}>
      <View style={[glyphStyles.sun, { backgroundColor: color }]} />
      <View style={[glyphStyles.mountain, { borderBottomColor: color }]} />
    </View>
  );
}

const glyphStyles = StyleSheet.create({
  line: {
    height: 2.5,
    borderRadius: 1.5,
  },
  sun: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  mountain: {
    position: 'absolute',
    bottom: 0,
    left: 2,
    width: 0,
    height: 0,
    borderLeftWidth: 11,
    borderRightWidth: 11,
    borderBottomWidth: 16,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
});

const styles = StyleSheet.create({
  wrapper: {
    width: SIZE,
    height: SIZE * 0.85,
    position: 'relative',
  },
  tab: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: SIZE * 0.45,
    height: SIZE * 0.18,
    borderWidth: 1.5,
    borderBottomWidth: 0,
    borderTopLeftRadius: radius.sm,
    borderTopRightRadius: radius.sm,
  },
  body: {
    position: 'absolute',
    top: SIZE * 0.12,
    left: 0,
    width: SIZE,
    height: SIZE * 0.73,
    borderWidth: 1.5,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
});