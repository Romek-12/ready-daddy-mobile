import React, { createContext, useContext } from 'react';
import { darkTheme, Theme } from '../theme';

export type ThemeMode = 'dark';

interface ThemeContextData {
  theme: Theme;
  mode: ThemeMode;
  isDark: boolean;
  setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextData>({} as ThemeContextData);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ThemeContext.Provider value={{ theme: darkTheme, mode: 'dark', isDark: true, setThemeMode: () => {} }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
