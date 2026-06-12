import { ImageSourcePropType } from 'react-native';

export type ThemeId = 'kitty' | 'gengar' | 'photo-default';

export interface Theme {
  id: ThemeId;
  background: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  accent: string;
  accentSecondary: string;
  text: string;
  textMuted: string;
  danger: string;
  backgroundImage: ImageSourcePropType | null;
  blurIntensity: number;
  blurTint: 'light' | 'dark' | 'default';
}

export const themes: Record<ThemeId, Theme> = {
  kitty: {
    id: 'kitty',
    background: '#F4E1D2',
    surface: 'rgba(255,255,255,0.55)',
    surfaceAlt: 'rgba(255,255,255,0.35)',
    border: 'rgba(214,83,74,0.25)',
    accent: '#D6534A',
    accentSecondary: '#5B7FB5',
    text: '#4A3B33',
    textMuted: '#A6928A',
    danger: '#C0392B',
    backgroundImage: require('@/assets/images/bg-kitty.png'),
    blurIntensity: 40,
    blurTint: 'light',
  },
  gengar: {
    id: 'gengar',
    background: '#1B2A22',
    surface: 'rgba(40,55,46,0.55)',
    surfaceAlt: 'rgba(40,55,46,0.35)',
    border: 'rgba(155,109,255,0.3)',
    accent: '#9B6DFF',
    accentSecondary: '#E8748A',
    text: '#EDE6E0',
    textMuted: '#9CA89C',
    danger: '#E8748A',
    backgroundImage: require('@/assets/images/bg-gengar.png'),
    blurIntensity: 40,
    blurTint: 'dark',
  },
  'photo-default': {
    id: 'photo-default',
    background: '#E8E8E8',
    surface: 'rgba(255,255,255,0.5)',
    surfaceAlt: 'rgba(255,255,255,0.3)',
    border: 'rgba(0,0,0,0.08)',
    accent: '#7A7A7A',
    accentSecondary: '#9A9A9A',
    text: '#2B2B2B',
    textMuted: '#8A8A8A',
    danger: '#C0392B',
    backgroundImage: null, // será setado dinamicamente (Google Fotos)
    blurIntensity: 50,
    blurTint: 'light',
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 20,
  full: 999,
};

export const font = {
  regular: 'System',
  sizes: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 18,
    xl: 24,
    xxl: 32,
  },
};