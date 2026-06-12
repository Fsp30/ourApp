import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Theme, ThemeId, themes } from '@/constants/theme';
import { ImageSourcePropType } from 'react-native';

const THEME_STORAGE_KEY = '@sharednotes:theme';
const PHOTO_BG_STORAGE_KEY = '@sharednotes:photo_bg_uri';

interface ThemeContextValue {
  theme: Theme;
  themeId: ThemeId;
  setThemeId: (id: ThemeId) => void;
  setPhotoBackground: (uri: string) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeIdState] = useState<ThemeId>('gengar');
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY).then((value) => {
      if (value && value in themes) setThemeIdState(value as ThemeId);
    });
    AsyncStorage.getItem(PHOTO_BG_STORAGE_KEY).then((uri) => {
      if (uri) setPhotoUri(uri);
    });
  }, []);

  function setThemeId(id: ThemeId) {
    setThemeIdState(id);
    AsyncStorage.setItem(THEME_STORAGE_KEY, id);
  }

  function setPhotoBackground(uri: string) {
    setPhotoUri(uri);
    AsyncStorage.setItem(PHOTO_BG_STORAGE_KEY, uri);
    setThemeId('photo-default');
  }

  let theme = themes[themeId];
  if (themeId === 'photo-default' && photoUri) {
    theme = {
      ...theme,
      backgroundImage: { uri } as ImageSourcePropType,
    };
  }

  return (
    <ThemeContext.Provider value={{ theme, themeId, setThemeId, setPhotoBackground }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}