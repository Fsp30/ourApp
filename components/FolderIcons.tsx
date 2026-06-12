import { View, StyleSheet } from 'react-native';
import { colors, radius } from '@/constants/theme';

const SIZE = 64;

export function FolderIcon({ children }: { children?: React.ReactNode }) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.tab} />
      <View style={styles.body}>{children}</View>
    </View>
  );
}

export function NotesGlyph() {
  return (
    <View style={{ gap: 4, alignItems: 'flex-start' }}>
      <View style={[glyphStyles.line, { width: 22 }]} />
      <View style={[glyphStyles.line, { width: 15 }]} />
      <View style={[glyphStyles.line, { width: 18 }]} />
    </View>
  );
}

export function PhotosGlyph() {
  return (
    <View style={{ width: 30, height: 22 }}>
      <View style={glyphStyles.sun} />
      <View style={glyphStyles.mountain} />
    </View>
  );
}

const glyphStyles = StyleSheet.create({
  line: {
    height: 2.5,
    borderRadius: 1.5,
    backgroundColor: colors.purple,
  },
  sun: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.purple,
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
    borderBottomColor: colors.purple,
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
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1.5,
    borderColor: colors.purple,
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
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1.5,
    borderColor: colors.purple,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
});