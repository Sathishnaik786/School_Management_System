import React, { createContext, useContext } from 'react';
import { useColorScheme } from 'react-native';
import { useThemeStore } from '../stores/theme.store';
import { lightPalette } from '../theme/palettes/light.palette';
import { darkPalette } from '../theme/palettes/dark.palette';
import { ThemeColors } from '../types/theme.types';

const ThemeContext = createContext<{
  colors: ThemeColors;
  isDark: boolean;
}>({
  colors: lightPalette,
  isDark: false,
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const mode = useThemeStore((state) => state.mode);

  const isDark =
    mode === 'dark' || (mode === 'system' && systemColorScheme === 'dark');

  const colors = isDark ? darkPalette : lightPalette;

  return (
    <ThemeContext.Provider value={{ colors, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeContext = () => useContext(ThemeContext);
